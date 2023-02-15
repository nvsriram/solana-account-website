import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { ApiError, ClusterNames, IDataAccountData, IDataAccountState } from "@/types"
import type { NextApiRequest, NextApiResponse } from 'next'
import { isBase58 } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataAccountState | ApiError>
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
    if (!account_state || !account_state.account_data) {
      res.status(400).json({ error: "No data corresponding to the Data Account" });
      return;
    }
    res.status(200).send(account_state);
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    }
  }
}

const parseData = async (connection: Connection, dataKey: PublicKey): Promise<IDataAccountState> => {
    const data_account = await connection.getAccountInfo(dataKey, "confirmed");
    const account_state: IDataAccountState = {} as IDataAccountState;

    if (data_account && data_account.data.length > 0) {
      // Data Account State
      const data_account_state = data_account.data;
      account_state.data_status = data_account_state.subarray(0, 1).readUInt8()
      account_state.serialization_status = data_account_state.subarray(1, 2).readUInt8()
      account_state.authority = new PublicKey(
        data_account_state.subarray(2, 34)
      ).toBase58();
      account_state.is_dynamic = data_account_state.subarray(34, 35).readUInt8() ? true : false;
      account_state.data_version = new BN(
        data_account_state.subarray(35, 36),
        "le"
      ).toNumber();
      account_state.account_data = {} as IDataAccountData;
  
      // Data Account Data
      const account_data = data_account_state.subarray(36);
      if (account_data) {
        account_state.account_data.data_type = new BN(
          account_data.subarray(0, 1),
          "le"
        ).toNumber();
        account_state.account_data.data = {
          len: new BN(account_data.subarray(1, 5), "le").toNumber(),
          data: account_data.subarray(5),
        };
      }
    }
    return account_state;
};