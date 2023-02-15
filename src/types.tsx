import { Dispatch, SetStateAction } from "react";

const LOCALHOST = "http://localhost:8899";
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type ApiError = {
    error: string;
}

export type ClusterContextType = {
    cluster: string;
    setCluster: Dispatch<SetStateAction<string>>;
}

export const ClusterNames = {
    DEVNET: {name: "Devnet", url: "https://api.devnet.solana.com" },
    TESTNET: {name: "Testnet", url: "https://api.testnet.solana.com"},
    MAINNET_BETA: {name: "Mainnet Beta", url: "https://api.mainnet-beta.solana.com"},
    CUSTOM: {name: "Custom", url: LOCALHOST}
};

export enum DataStatusOption {
    UNINITIALIZED,
    INITIALIZED,
    UPDATED,
    COMMITTED,
}

export enum SerializationStatusOption {
    UNVERIFIED,
    VERIFIED,
    FAILED,
}

export enum DataTypeOption {
    CUSTOM = 0,
    JSON = 1,
    BORSH = 2,
    PNG = 3,
}

export interface IDataAccountData {
    data_type: number;
    data?: {
        len: number;
        data: Buffer;
    };
};
    
export interface IDataAccountState {
    data_status: DataStatusOption;
    serialization_status: SerializationStatusOption;
    authority: string;
    is_dynamic: boolean;
    data_version: number;
    account_data: IDataAccountData;
};