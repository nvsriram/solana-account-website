"use client";

import { ClusterNames, DataTypeOption } from "@/types";
import { createDataAccount, handleUpload, initializeDataAccount, isBase58, uploadDataPart, useCluster } from "@/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConfirmOptions, Connection, PublicKey, Transaction } from "@solana/web3.js";
import Link from "next/link";
import { FormEvent, useState } from "react";
import AuthorityRow from "./authority-row";
import DataTypeRow from "./datatype-row";
import DynamicRow from "./dynamic-row";
import FeePayerRow from "./feepayer-row";
import FileRow from "./file-row";
import UploadButton from "./upload-button";
import UploadStatusBar from "./upload-status-bar";

const UploadPage = () => {
    const [authority, setAuthority] = useState<string>("");
    const [isDynamic, setIsDynamic] = useState(true);
    const [space, setSpace] = useState(0);
    const [dataType, setDataType] = useState<DataTypeOption>(DataTypeOption.CUSTOM);
    const [file, setFile] = useState<File | undefined>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dataAccount, setDataAccount] = useState<string | null>(null);
    const [dataAccountStatus, setDataAccountStatus] = useState<number>(-1);

    const { cluster } = useCluster();
    const { publicKey: feePayer, signAllTransactions } = useWallet();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!feePayer || !authority || !isBase58(authority) || !file) {
            return;
        }
        
        const reader = new FileReader();
        reader.addEventListener('load', async (e) => {
            if (!e.target || !e.target.result) {
                return;
            }
            try {
                let fileData = e.target.result.toString();
                if (dataType === DataTypeOption.JSON) {
                    fileData = JSON.stringify(JSON.parse(fileData));
                }

                setError(null);
                setLoading(true);

                const clusterURL = Object.values(ClusterNames).find(({name}) => name === cluster)?.url;
                if (!clusterURL) {
                    setError("Invalid cluster");
                    return;
                }
                if (!signAllTransactions) {
                    return;
                }
                const clusterConnection = new Connection(clusterURL);
                const authorityPK = new PublicKey(authority);

                const PART_SIZE = 881;
                const parts = Math.ceil(fileData.length / PART_SIZE);
                const allTxs: Transaction[] = [];
                let recentBlockhash = await clusterConnection.getLatestBlockhash();

                console.log(fileData.length);
                
                // create data account
                const [cTx, dataKP] = await createDataAccount(clusterConnection, feePayer, space);
                allTxs.push(cTx);
                // initialize data account + create pda
                const [iTx, pda] = initializeDataAccount(feePayer, dataKP, authorityPK, isDynamic, space);
                allTxs.push(iTx); 
                // data part txs
                let current = 0;
                while (current < parts) {    
                    const part = fileData.slice(current * PART_SIZE, (current + 1) * PART_SIZE);
                    const offset = current * PART_SIZE;
                    const tx = uploadDataPart(feePayer, dataKP, pda, dataType, part, offset);
                    allTxs.push(tx);    
                    ++current;
                }
                // send and confirm txs
                let signedTxs: Transaction[] = [];
                let initialized = null;
                while (!initialized) {
                    allTxs.map((tx) => {
                        tx.recentBlockhash = recentBlockhash.blockhash;
                        tx.sign(dataKP);
                        return tx;
                    });
                    signedTxs = await signAllTransactions(allTxs);
                    // create and initialize data account + pda
                    setDataAccountStatus(0);
                    current = 0;
                    for (const tx of signedTxs.slice(0, 2)) {
                        const txid = await clusterConnection.sendRawTransaction(
                            tx.serialize(),
                            {
                                skipPreflight: false,
                                preflightCommitment: "confirmed",
                                confirmation: "confirmed",
                            } as ConfirmOptions,
                        ).catch((err) => {
                            if (err instanceof Error) {
                                console.log(err.message);
                            }
                            initialized = false;
                        })
                        if (!txid) {
                            recentBlockhash = await clusterConnection.getLatestBlockhash();
                            break;
                        }
                        await clusterConnection.confirmTransaction(
                            {
                                blockhash: recentBlockhash.blockhash,
                                lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
                                signature: txid,
                            }, 
                            "confirmed"
                        ).then(() => {
                            console.log(`${current ? "created" : "initialized"}: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
                            setDataAccountStatus(++current/(parts + 2) * 100);
                            setDataAccount(dataKP.publicKey.toBase58());            
                        });
                    }
                    if (initialized === null) initialized = true;
                }
                // upload data parts
                let partTxs = signedTxs.slice(2);
                const completedTxs = new Set<number>();
                const handleUploadStatus = (tx: Transaction) => {
                    setDataAccountStatus((prev) => prev + 100/(parts + 2));
                    completedTxs.add(partTxs.indexOf(tx));
                }
                while (completedTxs.size < partTxs.length) {
                    await Promise.allSettled(handleUpload(clusterConnection, recentBlockhash, partTxs, handleUploadStatus))
                    .then(async () => {
                        if (completedTxs.size === partTxs.length) return;
                        // remake and sign all incomplete txs with new blockhash
                        recentBlockhash = await clusterConnection.getLatestBlockhash();
                        const allTxs: Transaction[] = [];
                        let current = 0;
                        while (current < parts) {
                            if (completedTxs.has(current)) {
                                ++current;
                                continue;
                            }
                            const part = fileData.slice(current * PART_SIZE, (current + 1) * PART_SIZE);
                            const offset = current * PART_SIZE;
                            const tx = uploadDataPart(feePayer, dataKP, pda, dataType, part, offset);
                            tx.recentBlockhash = recentBlockhash.blockhash;
                            tx.sign(dataKP);
                            allTxs.push(tx);    
                            ++current;
                        }
                        partTxs = await signAllTransactions(allTxs);
                    })
                    .catch((err) => {
                        if (err instanceof Error) {
                            console.log(err.message);
                        }
                    });
                }
                setLoading(false);
            }
            catch(err) {
                if (err instanceof Error) {
                    setError(err.message);
                }
            }
        })
        reader.addEventListener("error", () => {
            setError("Error reading file");
        })
        if (dataType === DataTypeOption.IMG) {
            reader.readAsDataURL(file);
        }
        else {
            reader.readAsText(file);
        }
    }

    return (
        <section>
          <form onSubmit={handleSubmit}>
            <table className="table-auto w-full h-full border-spacing-y-8">
                <tbody>
                    <FeePayerRow />
                    <AuthorityRow authority={authority} setAuthority={setAuthority} />
                    <DataTypeRow dataType={dataType} setDataType={setDataType} />
                    <DynamicRow isDynamic={isDynamic} setIsDynamic={setIsDynamic} space={space} setSpace={setSpace} />
                    <FileRow setFile={setFile} />
                </tbody>
            </table>
            <div className="flex flex-row items-center mt-10">
                <UploadButton dataAccount={dataAccount} loading={loading} dataAccountStatus={dataAccountStatus} />
            </div>
            <div className="text-lg">
                {dataAccount && 
                    <h1 className="text-md">
                        <p className="text-solana-green/80 font-semibold">Data Account initialized: </p> 
                        <Link href={`/${dataAccount}?cluster=${cluster}`} className="underline text-md">{dataAccount}</Link>
                    </h1>
                }
                <UploadStatusBar dataAccountStatus={dataAccountStatus} />
            </div>
            {error && 
                <div className="text-lg">
                    <h1 className="text-md">
                        <p className="text-rose-500 font-semibold">An error occurred while uploading...</p> 
                        {error}
                    </h1>
                </div>}
          </form>
        </section>
    )


}

export default UploadPage;




