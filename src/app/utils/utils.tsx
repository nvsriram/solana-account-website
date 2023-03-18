import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { createContext, useContext, } from "react";
import { ClusterContextType, EditorThemeType, IDataAccount, IDataAccountMeta } from "./types";

export const isBase58 = (value: string): boolean => /^[A-HJ-NP-Za-km-z1-9]*$/.test(value);

export const ClusterContext = createContext<ClusterContextType | null>(null);
export const useCluster = () => useContext(ClusterContext) as ClusterContextType;

export const EditorThemeContext = createContext<EditorThemeType | null>(null);
export const useEditorTheme = () => useContext(EditorThemeContext) as EditorThemeType;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const BASE_URL = "http://localhost:3000";

const PROGRAM_ID = "ECQd7f4sYhcWX5G9DQ7Hgcf3URZTfgwVwjKzH2sMQeFW";
const PDA_SEED = "data_account_metadata";
const programId = new PublicKey(PROGRAM_ID);

export const displaySize = (space: number): string => {
  let displaySize = space.toString() + " B";
  if (space > 1e6) {
    displaySize = space/1e6 + " MB";
  } else if (space > 1e3) {
    displaySize = space/1e3 + " KB";
  }
  return displaySize;
};

const signatures = new Map<string, string>([
  ["JVBERi0", "application/pdf"],
  ["R0lGODdh", "image/gif"],
  ["R0lGODlh", "image/gif"],
  ["iVBORw0KGgo", "image/png"],
  ["/9j/", "image/jpg"],
  ["PD", "image/svg+xml"]
]);

export const getMimeType = (base64: string): string => {
  let mime = "text/html";
  signatures.forEach((v, k) => {
    if (base64.startsWith(k)) {
      mime = v;
    }
  });
  return mime;   
};

const getPDAFromDataAccount = (dataKey: PublicKey):  [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(PDA_SEED, "ascii"),
      dataKey.toBuffer(),
    ],
    programId
  );
}

export const parseMetadata = async (connection: Connection, dataKey: PublicKey, debug?: boolean): Promise<IDataAccountMeta> => {
  const [metaKey] = getPDAFromDataAccount(dataKey);
  const meta_account = await connection.getAccountInfo(metaKey, "confirmed");

  if (debug) {
    console.log("Raw Metadata:");
    console.log(meta_account?.data);
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

  return account_meta;
}

export const parseData = async (connection: Connection, dataKey: PublicKey, debug?: boolean): Promise<Buffer | undefined> => {
  const data_account = await connection.getAccountInfo(dataKey, "confirmed");

  if (debug) {
    console.log(data_account?.data);
  }
  
  return data_account?.data;
}

export const parseDetails = async (connection: Connection, dataKey: PublicKey, debug?: boolean): Promise<IDataAccount> => {
  return {
    meta: await parseMetadata(connection, dataKey, debug),
    data: await parseData(connection, dataKey, debug)
  };
}

export const createDataAccount = async (connection: Connection, feePayer: PublicKey, initialSize: number): Promise<[Transaction, Keypair]> => {
  const programId = new PublicKey(PROGRAM_ID);
  const dataAccount = new Keypair();

  const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(initialSize);
  const createIx = SystemProgram.createAccount({
    fromPubkey: feePayer,
    newAccountPubkey: dataAccount.publicKey,
    lamports: rentExemptAmount,
    space: initialSize,
    programId: programId,
  });
  const tx = new Transaction();
  tx.add(createIx);
  tx.feePayer = feePayer;
  return [tx, dataAccount];
}

export const initializeDataAccount = (feePayer: PublicKey, dataAccount: Keypair, authorityPK: PublicKey, isDynamic: boolean, initialSize: number): [Transaction, PublicKey] => {
  const [pda] = getPDAFromDataAccount(dataAccount.publicKey);
  const idx0 = Buffer.from(new Uint8Array([0]));
  const space = new BN(initialSize).toArrayLike(Buffer, "le", 8);
  const dynamic = Buffer.from(new Uint8Array([isDynamic ? 1 : 0]));
  const authority = authorityPK.toBuffer();
  const is_created = Buffer.from(new Uint8Array([1]));
  const false_flag = Buffer.from(new Uint8Array([0]));
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
    data: Buffer.concat([idx0, authority, space, dynamic, is_created, false_flag]),
  });
  
  const tx = new Transaction();
  tx.add(initializeIx);
  tx.feePayer = feePayer;
  return [tx, pda];
}

export const uploadDataPart = (feePayer: PublicKey, dataAccount: PublicKey, pdaKey: PublicKey | null, dataType: number, data: Buffer, offset: number, debug?: boolean): Transaction => {
  let pda = pdaKey;
  if (!pda) {
    [pda] = getPDAFromDataAccount(dataAccount);
  }

  const idx1 = Buffer.from(new Uint8Array([1]));
  const offset_buffer = new BN(offset).toArrayLike(Buffer, "le", 8);    
  const true_flag = Buffer.from(new Uint8Array([1]));
  const false_flag = Buffer.from(new Uint8Array([0]));
  
  const data_type = new BN(dataType).toArrayLike(Buffer, "le", 1);
  const data_len = new BN(data.length).toArrayLike(Buffer, "le", 4);
  const updateIx = new TransactionInstruction({
    keys: [
    {
      pubkey: feePayer,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: dataAccount,
      isSigner: false,
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
    data: Buffer.concat([idx1, data_type, data_len, data, offset_buffer, true_flag, true_flag, debug ? true_flag : false_flag]),
  });

  const tx = new Transaction();
  tx.add(updateIx);
  tx.feePayer = feePayer;
  return tx;
}

export const handleUpload = (connection: Connection, recentBlockhash: Readonly<{ blockhash: string; lastValidBlockHeight: number; }>, txs: Transaction[], handleUploadStatus: ((tx: Transaction) => void) | null): Promise<void>[] => {
  return txs.map(async (tx, idx, allTxs) => {
    const txid = await connection.sendRawTransaction(tx.serialize())
    await connection.confirmTransaction(
      {
        blockhash: recentBlockhash.blockhash,
        lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
        signature: txid,
      }, 
      "confirmed"
    ).then(() => {
      if (handleUploadStatus) {
        handleUploadStatus(tx);
      }
      console.log(`${idx + 1}/${allTxs.length}: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    });
  });
}

export const finalizeDataAccount = (feePayer: PublicKey, dataAccount: PublicKey, pdaKey: PublicKey | null, debug?: boolean): Transaction => {
  let pda = pdaKey;
  if (!pda) {
    [pda] = getPDAFromDataAccount(dataAccount);
  }

  const idx3 = Buffer.from(new Uint8Array([3]));
  const true_flag = Buffer.from(new Uint8Array([1]));
  const false_flag = Buffer.from(new Uint8Array([0]));
  
  const finalizeIx = new TransactionInstruction({
    keys: [
    {
      pubkey: feePayer,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: dataAccount,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: pda,
      isSigner: false,
      isWritable: true,
    },
    ],
    programId: programId,
    data: Buffer.concat([idx3, debug ? true_flag : false_flag]),
  });

  const tx = new Transaction();
  tx.add(finalizeIx);
  tx.feePayer = feePayer;
  return tx;
}
