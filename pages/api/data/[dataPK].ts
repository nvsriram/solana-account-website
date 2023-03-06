import { Connection, PublicKey } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiError, ClusterNames } from "@/app/utils/types"
import { getMimeType, isBase58, parseData } from "@/app/utils/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | ApiError>
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, HEAD, OPTIONS");

  if (req.method !== "GET") {
    res.status(405).json({ error: "Unsupported method"});
    return;
  }

  const { dataPK, cluster } = req.query;
  const clusterURL = Object.values(ClusterNames).find(({name}) => name === cluster)?.url;
  if (!clusterURL) {
    res.status(400).json({ error: "Invalid Cluster" });
    return;
  }
  
  if (!dataPK || !isBase58(dataPK as string)) {
    res.status(400).json({ error: "Invalid Data Account PublicKey" });
    return;
  }

  try {
    const account_data = await parseData(new Connection(clusterURL), new PublicKey(dataPK));
    if (!account_data) {
      res.status(400).json({ error: "No data corresponding to the Data Account" });
      return;
    };
    const base64 = account_data.toString("base64");
    const type = getMimeType(base64);
    res.status(200)
    .setHeader("Content-type", type)
    .send(account_data);
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    }
  }
}