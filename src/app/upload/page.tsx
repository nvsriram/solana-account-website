"use client";

import { ApiError, ClusterContextType, DataTypeOption, MAX_FILE_SIZE } from "@/types";
import { ClusterContext, isBase58 } from "@/utils";
import { Keypair } from "@solana/web3.js";
import Link from "next/link";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import CopyToClipboard from "../copy";
import Tooltip from "../tooltip";

const UploadPage = () => {
    const [feePayer, setFeePayer] = useState<Uint8Array | undefined>();
    const [feePayerStatus, setFeePayerStatus] = useState<{ hasError: boolean, message: string }>({ hasError: true, message: "" });
    const [authority, setAuthority] = useState<string>("");
    const [isDynamic, setIsDynamic] = useState(true);
    const [space, setSpace] = useState(0);
    const [dataType, setDataType] = useState<DataTypeOption>(DataTypeOption.CUSTOM);
    const [file, setFile] = useState<File | undefined>();

    const controller = new AbortController();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dataAccount, setDataAccount] = useState<string | null>(null);

    const { cluster } = useContext(ClusterContext) as ClusterContextType;

    const reader = new FileReader();
    const handleFeePayer = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) {
            setFeePayer(undefined);
            setFeePayerStatus({ hasError: true, message: "" })
            return;
        }
        reader.addEventListener('load', (e) => {
            if (!e.target || !e.target.result) {
                return;
            }
            try {
                const secret = JSON.parse(e.target.result.toString()) as number[];
                const secretKey = Uint8Array.from(secret);
                const keypair = Keypair.fromSecretKey(secretKey)
                setFeePayer(keypair.secretKey);        
                setFeePayerStatus({ hasError: false, message: keypair.publicKey.toBase58() });
            }
            catch(err) {
                if (err instanceof Error) {
                    setFeePayerStatus({ hasError: true, message: err.message });
                }
            }
        })
        reader.addEventListener("error", () => {
            setFeePayerStatus({ hasError: true, message: "Error reading file" });
        })
        reader.readAsText(e.target.files[0]);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!feePayer || !authority || !isBase58(authority) || !file) {
            return;
        }

        reader.addEventListener('load', (e) => {
            if (!e.target || !e.target.result) {
                return;
            }
            try {
                let fileData = e.target.result.toString();
                if (dataType === DataTypeOption.JSON) {
                    fileData = JSON.stringify(JSON.parse(fileData));
                }

                const formData = new FormData();
                formData.append("cluster", cluster);
                formData.append("feePayer", feePayer.toString());
                formData.append("authority", authority);
                formData.append("dynamic", isDynamic ? "true" : "false");
                formData.append("space", space.toString());
                formData.append("dataType", dataType.toString());
                formData.append("file", fileData);

                setError(null);
                if (loading) {
                    controller.abort();
                }
                setLoading(true);

                fetch("/api/upload", { method: "POST", body: formData, signal: controller.signal })
                .then((res) => {
                    if (!res.ok) {
                        res.json().then(({ error } : ApiError) => {
                            setError(error);
                            setDataAccount(null);
                            return;
                        });
                    } else {
                        res.json().then((data) => {
                            setDataAccount(data);
                            setError(null);
                        });
                    }
                })
                .catch((err) => setError(err))
                .finally(() => setLoading(false));
            }
            catch(err) {
                if (err instanceof Error) {
                    setError("Could not load file");
                }
            }
        })
        reader.addEventListener("error", () => {
            setFeePayerStatus({ hasError: true, message: "Error reading file" });
        })
        if (dataType === DataTypeOption.PNG) {
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
                    <tr>
                        <th
                            scope="row" className="text-lg text-left text-solana-purple"
                        >
                            <span>
                                Fee Payer <code>Keypair</code>
                            </span>
                        </th>
                        <td className="p-2 text-stone-200">:</td>
                        <td>
                            <input 
                                type="file" 
                                onChange={handleFeePayer} 
                                required 
                                className="text-sm text-stone-100 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-solana-purple file:text-white hover:file:bg-solana-purple/70 file:hover:text-stone-100"
                            />
                            <p className={`text-md w-full flex flex-row items-center ${feePayerStatus.hasError ? "text-rose-500" : "text-solana-green/80"}`}>
                                {feePayerStatus.message}
                                {!feePayerStatus.hasError && <CopyToClipboard message={feePayerStatus.message} />}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th
                            scope="row" className="text-lg text-left text-solana-purple"
                        >
                            <span>
                                Authority <code>PublicKey</code>
                            </span>
                        </th>
                        <td className="p-2 text-stone-200">:</td>
                        <td>
                            <input 
                                type="text"
                                required
                                value={authority}
                                onChange={(e) => setAuthority(e.target.value)}
                                minLength={32}
                                maxLength={44}
                                pattern={"^[A-HJ-NP-Za-km-z1-9]*$"}
                                className="w-[28rem] text-black text-md px-1 bg-stone-200 focus-within:ring-2 hover:ring-solana-purple focus-within:ring-solana-purple rounded-sm ring-2 ring-stone-400 shadow-sm focus:outline-none caret-solana-purple appearance-none invalid:ring-rose-700"
                            />
                        </td>
                    </tr>
                    <tr>
                        <th
                            scope="row" className="text-lg text-left text-solana-purple"
                        >
                            <span>
                               Data Type
                            </span>
                        </th>
                        <td className="p-2 text-stone-200">:</td>
                        <td>
                            <select 
                                className="text-black text-md px-1 bg-stone-200 rounded-sm focus:outline-none shadow-sm focus-within:ring-2 hover:ring-solana-purple focus:ring-solana-purple ring-2 ring-stone-400" 
                                required
                                aria-required
                                value={dataType}
                                onChange={(e) => {
                                    if (!isNaN(Number(e.target.value))) {
                                        setDataType(Number(e.target.value));
                                    }
                                }}>
                                {Object.keys(DataTypeOption)
                                    .filter((key) => isNaN(Number(key)))
                                    .map((dataType, idx) => {
                                        return (
                                            <option key={idx} value={idx}>
                                                {dataType}
                                            </option>
                                        );
                                    })
                                }
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th
                            scope="row" className="text-lg text-left text-solana-purple"
                        >
                            <span>
                               Dynamic/Static + Initial size
                            </span>
                        </th>
                        <td className="p-2 text-stone-200">:</td>
                        <td className="flex flex-row h-full items-center">
                            <input 
                                type="checkbox" 
                                checked={isDynamic} 
                                onChange={() => setIsDynamic(prev => !prev)} 
                                className="mr-2 w-4 h-4 accent-solana-green"
                            />
                            <input 
                                type="number"
                                required
                                aria-required
                                min={0}
                                max={MAX_FILE_SIZE}
                                className="text-black text-md px-1 bg-stone-200 rounded-sm focus:outline-none shadow-sm focus-within:ring-2 hover:ring-solana-purple focus:ring-solana-purple ring-2 ring-stone-400 invalid:ring-rose-700" 
                                value={space}
                                onChange={(e) => {
                                    const num = Number(e.target.value);
                                    if (isNaN(num) || num < 0) {
                                        setSpace(0);
                                    }
                                    else {
                                        setSpace(Number(e.target.value));
                                    }
                                }}    
                            />
                            <Tooltip message={<><b>{isDynamic ? "Dynamic" : "Static"}</b><br />Initial size:<br />{space > 1e9 ? space.toExponential(7) : space}B<br />{space > MAX_FILE_SIZE ? <p className="text-rose-700">{`> MAX (${MAX_FILE_SIZE.toExponential(2)})`}</p> : null}</>} condition={true} sx={`w-32 right-0 top-0 left-9`}>
                                <svg className="ml-2 w-5 h-5 text-solana-green" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                </svg>
                            </Tooltip>
                        </td>
                    </tr>
                    <tr>
                        <th
                            scope="row" className="text-lg text-left text-solana-purple"
                        >
                            <span>
                               Upload File
                            </span>
                        </th>
                        <td className="p-2 text-stone-200">:</td>
                        <td>
                            <input 
                                type="file" 
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setFile(e.target.files[0])
                                    }
                                }} 
                                required 
                                className="w-full text-sm text-stone-100 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-solana-purple file:text-white hover:file:bg-solana-purple/70 file:hover:text-stone-100"/>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="flex flex-row items-center mt-10">
                <button type="submit" disabled={dataAccount != null} className="m-auto justify-self-center bg-solana-green/80 hover:bg-emerald-600 text-white text-md font-semibold py-1 px-4 border-b-4 border-emerald-600 hover:border-solana-green/80 disabled:bg-emerald-600 disabled:hover:border-emerald-600 disabled:cursor-not-allowed rounded-md">
                    {loading ? 
                    <>  
                        {`Uploading `}
                        <svg className="inline-flex ml-1 animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </>: dataAccount ? "Upload Complete" : "Confirm Upload"}
                </button>
            </div>
            {error && 
                <div className="text-lg">
                    <h1 className="text-md">
                        <p className="text-rose-500 font-semibold">An error occurred while uploading...</p> 
                        {error}
                    </h1>
                </div>}
            {dataAccount && 
                <div className="text-lg">
                    <h1 className="text-md">
                        <p className="text-solana-green/80 font-semibold">Click here to view more details: </p> 
                        <Link href={`/${dataAccount}?cluster=${cluster}`} className="underline text-md">{dataAccount}</Link>
                    </h1>
                </div>}
          </form>
        </section>
    )
}

export default UploadPage;