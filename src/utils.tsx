import { ConfirmOptions, Connection, Keypair, PublicKey, sendAndConfirmRawTransaction, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { createContext } from "react";
import { ClusterContextType } from "./types";

export const isBase58 = (value: string): boolean => /^[A-HJ-NP-Za-km-z1-9]*$/.test(value);

export const ClusterContext = createContext<ClusterContextType | null>(null);

const PROGRAM_ID = "9MwkYTEwkKifZKT2aY1pbHAxJDXq8a3yw29n1AhAvW6k";

export const initializeDataAccount = (feePayer: PublicKey, authorityPK: PublicKey, isDynamic: boolean, initialSize: number): [Transaction, Keypair] => {
    const programId = new PublicKey(PROGRAM_ID);

    const dataAccount = new Keypair();
    const idx0 = Buffer.from(new Uint8Array([0]));
    const space = Buffer.from(new Uint8Array(new BN(initialSize).toArray("le", 8)));
    const dynamic = Buffer.from(new Uint8Array([isDynamic ? 1 : 0]));
    const authority = authorityPK.toBuffer();
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
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        ],
        programId: programId,
        data: Buffer.concat([idx0, authority, space, dynamic]),
    });
    
    const tx = new Transaction();
    tx.add(initializeIx);
    tx.feePayer = feePayer;
    return [tx, dataAccount];
}

export const uploadDataPart = (feePayer: PublicKey, dataAccount: Keypair, dataType: number, part: string, offset: number): Transaction => {
    const programId = new PublicKey(PROGRAM_ID);

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
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: programId,
      data: Buffer.concat([idx1, data_type, data_len, data, offset_buffer, true_flag, true_flag, true_flag]),
    });

    const tx = new Transaction();
    tx.add(updateIx);
    tx.feePayer = feePayer;
    return tx;
}
