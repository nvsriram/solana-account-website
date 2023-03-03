import { Connection, PublicKey } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiError, ClusterNames, IDataAccountMeta } from "@/app/utils/types"
import { isBase58, parseData } from "@/app/utils/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataAccountMeta | ApiError>
) {
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
    const account_state = await parseData(new Connection(clusterURL), new PublicKey(dataPK));
    if (!account_state.meta) {
      res.status(400).json({ error: "No metadata corresponding to the Data Account" });
      return;
    };
    res.status(200).send(account_state.meta);
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    }
  }
}