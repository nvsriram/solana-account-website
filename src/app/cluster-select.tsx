"use client"

import { ClusterContextType, ClusterNames } from "@/types";
import { ClusterContext } from "@/utils";
import { useState, useRef, useEffect, useContext } from "react";
import { ClusterOption } from "./cluster-option";

export const ClusterSelect = () => {
    const [open, setOpen] = useState(false);
    const clusterRef = useRef<HTMLDivElement>(null);
    const { cluster, setCluster } = useContext(ClusterContext) as ClusterContextType;

    useEffect(() => {
        const closeClusterMenu = ({target}: MouseEvent) => {
            if (!clusterRef?.current?.contains(target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", closeClusterMenu);
        return () => {
            document.removeEventListener("mousedown", closeClusterMenu);
        }
    }, [clusterRef]);

    const handleClick = (clusterName: string) => {
        setOpen(o => !o);
        setCluster(clusterName);
    }

    return (
        <div className="flex relative" ref={clusterRef}>
            <ClusterOption cluster={cluster} isSelected={true} handleClick={handleClick} />
            {open &&
            <div className="absolute right-0 z-10 w-52 mt-11 origin-bottom-right shadow-lg">
                {Object.values(ClusterNames).filter((clusterName) => clusterName.name !== cluster)
                    .map((clusterName, idx) => {
                        return (
                            <ClusterOption key={idx} cluster={clusterName.name} isSelected={false} handleClick={handleClick} />
                        );
                    })
                }
            </div>}
        </div>
    );
    
}