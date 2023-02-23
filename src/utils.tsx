import { ConfirmOptions, Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { createContext, useContext, } from "react";
import { ClusterContextType, IDataAccount, IDataAccountMeta } from "./types";

export const isBase58 = (value: string): boolean => /^[A-HJ-NP-Za-km-z1-9]*$/.test(value);

export const ClusterContext = createContext<ClusterContextType | null>(null);
export const useCluster = () => useContext(ClusterContext) as ClusterContextType;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

const PROGRAM_ID = "5tbhGyvffZ3XEC6BbFP1ZJy8gtm3sWtVDjwb7HjLN5eU";
const PDA_SEED = "data_account_metadata";
const programId = new PublicKey(PROGRAM_ID);

const getPDAFromDataAccount = (dataKey: PublicKey):  [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(PDA_SEED, "ascii"),
      dataKey.toBuffer(),
    ],
    programId
  );
}

export const parseData = async (connection: Connection, dataKey: PublicKey, debug?: boolean): Promise<IDataAccount> => {
  const data_account = await connection.getAccountInfo(dataKey, "confirmed");

  const [metaKey] = PublicKey.findProgramAddressSync(
    [
      Buffer.from(PDA_SEED, "ascii"),
      dataKey.toBuffer(),
    ],
    programId
  );
  const meta_account = await connection.getAccountInfo(metaKey, "confirmed");

  if (debug) {
    console.log("Raw Metadata:");
    console.log(meta_account?.data);
    console.log("Raw Data:");
    console.log(data_account?.data);
  }
  
  const account_meta = {} as IDataAccountMeta;
  if (meta_account && meta_account.data.length > 0) {
    const data_account_metadata = meta_account.data;
    account_meta.data_status = data_account_metadata.subarray(0, 1).readUInt8()
    account_meta.serialization_status = data_account_metadata.subarray(1, 2).readUInt8()
    account_meta.authority = new PublicKey(
      data_account_metadata.subarray(2, 34)
    ).toBase58();
    account_meta.is_dynamic = data_account_metadata.subarray(34, 35).readUInt8() ? true : false;
    account_meta.data_version = new BN(
      data_account_metadata.subarray(35, 36),
      "le"
    ).toNumber();  
    account_meta.data_type = new BN(
      data_account_metadata.subarray(36, 37),
      "le"
    ).toNumber();
    account_meta.bump_seed = new BN(
      data_account_metadata.subarray(37, 38),
      "le"
    ).toNumber();
  }

  return {
    meta: account_meta,
    data: data_account?.data
  };
}

export const createDataAccount = async (connection: Connection, feePayer: PublicKey, initialSize: number): Promise<[Transaction, Keypair]> => {
  const programId = new PublicKey(PROGRAM_ID);
  const dataAccount = new Keypair();

  const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(initialSize);
  const createIx = SystemProgram.createAccount(
    {
      fromPubkey: feePayer,
      newAccountPubkey: dataAccount.publicKey,
      lamports: rentExemptAmount,
      space: initialSize,
      programId: programId,
    }
  );
  const tx = new Transaction();
  tx.add(createIx);
  tx.feePayer = feePayer;
  return [tx, dataAccount];
}

export const initializeDataAccount = (feePayer: PublicKey, dataAccount: Keypair, authorityPK: PublicKey, isDynamic: boolean, initialSize: number): [Transaction, PublicKey] => {
    const [pda] = getPDAFromDataAccount(dataAccount.publicKey);
    const idx0 = Buffer.from(new Uint8Array([0]));
    const space = Buffer.from(new Uint8Array(new BN(initialSize).toArray("le", 8)));
    const dynamic = Buffer.from(new Uint8Array([isDynamic ? 1 : 0]));
    const authority = authorityPK.toBuffer();
    const is_created = Buffer.from(new Uint8Array([1]));
    const initializeIx = new TransactionInstruction({
        keys: [
        {
            pubkey: feePayer,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: dataAccount.publicKey,
            isSigner: true,
            isWritable: true,
        },
        {
          pubkey: pda,
          isSigner: false,
          isWritable: true,
        },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        ],
        programId: programId,
        data: Buffer.concat([idx0, authority, space, dynamic, is_created]),
    });
    
    const tx = new Transaction();
    tx.add(initializeIx);
    tx.feePayer = feePayer;
    return [tx, pda];
}

export const uploadDataPart = (feePayer: PublicKey, dataAccount: Keypair, pda: PublicKey, dataType: number, part: string, offset: number): Transaction => {
  const idx1 = Buffer.from(new Uint8Array([1]));
  const offset_buffer = Buffer.from(new Uint8Array(new BN(offset).toArray("le", 8)));    
  const true_flag = Buffer.from(new Uint8Array([1]));
  const false_flag = Buffer.from(new Uint8Array([0]));
  
  const data_type = Buffer.from(new Uint8Array(new BN(dataType).toArray("le", 1)));
  const data_len = Buffer.from(
    new Uint8Array(new BN(part.length).toArray("le", 4))
  );
  const data = Buffer.from(part, "ascii");
  const updateIx = new TransactionInstruction({
    keys: [
      {
        pubkey: feePayer,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: dataAccount.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: pda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: programId,
    data: Buffer.concat([idx1, data_type, data_len, data, offset_buffer, false_flag, true_flag, true_flag]),
  });

  const tx = new Transaction();
  tx.add(updateIx);
  tx.feePayer = feePayer;
  return tx;
}

export const handleUpload = (connection: Connection, recentBlockhash: Readonly<{ blockhash: string; lastValidBlockHeight: number; }>, txs: Transaction[], handleUploadStatus: (tx: Transaction) => void): Promise<void>[] => {
  return txs.map(async (tx, idx) => {
    const txid = await connection.sendRawTransaction(
      tx.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        confirmation: "confirmed",
      } as ConfirmOptions,
    );
    await connection.confirmTransaction(
      {
        blockhash: recentBlockhash.blockhash,
        lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
        signature: txid,
      }, 
      "confirmed"
    ).then(() => {
      handleUploadStatus(tx);
      console.log(`${idx}: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    });
  });
}
