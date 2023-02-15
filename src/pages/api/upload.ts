import { ConfirmOptions, Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { ApiError, ClusterNames, DataTypeOption, MAX_FILE_SIZE } from "@/types"
import type { NextApiRequest, NextApiResponse } from 'next'
import { isBase58 } from "@/utils";
import { IncomingForm } from "formidable";

export const config = {
    api: {
        bodyParser: false
    }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicKey | ApiError>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Unsupported method"});
    return;
  }

  const form = new IncomingForm({ multiples: false, maxFileSize: MAX_FILE_SIZE });
  form.parse(req, async (err, fields) => {
    if (err) {
        res.status(400).json({ error: err });
        return;
    }
    const { cluster, feePayer, authority, dataType, dynamic, space, file } = fields;
    
    const clusterURL = Object.values(ClusterNames).find(({name}) => name === cluster)?.url;
    if (!clusterURL) {
        res.status(400).json({ error: "Invalid Cluster" });
        return;
    }
    if (!feePayer) { 
        res.status(400).json({ error: "Invalid FeePayer Keypair" });
        return;
    }
    if (!authority || !isBase58(authority as string)) {
        res.status(400).json({ error: "Invalid Authority PublicKey" });
        return;
    }
    if (isNaN(Number(dataType))) {
        res.status(400).json({ error: "Invalid Data Type" });
        return;
    }
    if (isNaN(Number(space)) || Number(space) < 0 || Number(space) > MAX_FILE_SIZE) {
        res.status(400).json({ error: "Invalid Space" });
        return;
    }
    if (!file) {
        res.status(400).json({ error: "No file provided" });
        return;
    }

    try {
        const secretKey = Uint8Array.from((feePayer as string).split(",").map(c => Number(c)));
        const keypair = Keypair.fromSecretKey(secretKey);  
        const isDynamic = (dynamic as string).toLowerCase() === "true";
        
        const dataAccount = await handleUpload(new Connection(clusterURL), keypair, new PublicKey(authority), Number(dataType), isDynamic, Number(space), file as string);
        if (!dataAccount) {
            res.status(400).json({ error: "Invalid Data Account" });
            return;
        }
        res.status(200).send(dataAccount);
    } catch(err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        }
    }
  });
}

const handleUpload = async (connection: Connection, feePayer: Keypair, authorityPK: PublicKey, dataType: DataTypeOption, isDynamic: boolean, initialSize: number, file: string): Promise<PublicKey> => {
    const programId = new PublicKey(process.env.PROGRAM_ID as string);

    // console.log("Requesting Airdrop of 1 SOL...");
    // await connection.requestAirdrop(feePayer.publicKey, 1e9);
    // console.log("Airdrop received");

    const dataAccount = new Keypair();
    const idx0 = Buffer.from(new Uint8Array([0]));
    const space = Buffer.from(new Uint8Array(new BN(initialSize).toArray("le", 8)));
    const dynamic = Buffer.from(new Uint8Array([isDynamic ? 1 : 0]));
    const authority = authorityPK.toBuffer();
    const initializeIx = new TransactionInstruction({
        keys: [
        {
            pubkey: feePayer.publicKey,
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
    
    const txid = await sendAndConfirmTransaction(
        connection,
        tx,
        [feePayer, dataAccount],
        {
        skipPreflight: true,
        preflightCommitment: "confirmed",
        confirmation: "confirmed",
        } as ConfirmOptions,
    );
    console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

    await uploadData(connection, programId, feePayer, dataAccount, dataType, file);

    return dataAccount.publicKey;
}

const PART_SIZE = 800;
const uploadData = async (connection: Connection, programId: PublicKey, feePayer: Keypair, dataAccount: Keypair, dataType: number, message: string) => {
  const parts = message.length / PART_SIZE;
  let current = 0;
  while (current < parts) {

    // console.log("Requesting Airdrop of 1 SOL...");
    // await connection.requestAirdrop(feePayer.publicKey, 1e9);
    // console.log("Airdrop received");
    
    const part = message.slice(current * PART_SIZE, (current + 1) * PART_SIZE);
    
    const idx1 = Buffer.from(new Uint8Array([1]));
    const offset = Buffer.from(new Uint8Array(new BN(current * PART_SIZE).toArray("le", 8)));    
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
          pubkey: feePayer.publicKey,
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
      data: Buffer.concat([idx1, data_type, data_len, data, offset, true_flag, true_flag, true_flag]),
    });

    const tx = new Transaction();
    tx.add(updateIx);

    const txid = await sendAndConfirmTransaction(
      connection,
      tx,
      [feePayer, dataAccount],
      {
        skipPreflight: true,
        preflightCommitment: "confirmed",
        confirmation: "confirmed",
      } as ConfirmOptions
    );
    console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

    ++current;
  }
}
