import { createContext } from "react";
import { ClusterContextType } from "./types";

export const isBase58 = (value: string): boolean => /^[A-HJ-NP-Za-km-z1-9]*$/.test(value);

export const ClusterContext = createContext<ClusterContextType | null>(null);
