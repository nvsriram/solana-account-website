"use client";

import { ApiError, DataTypeOption, IDataAccountMeta } from "@/app/utils/types";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DataDisplay from "../components/display-data/display-data";
import AuthorityRow from "../components/[dataPK]/authority-row";
import DataRow from "../components/[dataPK]/data-row";
import DataAccountRow from "../components/[dataPK]/dataaccount-row";
import DataStatusRow from "../components/[dataPK]/datastatus-row";
import DataTypeRow from "../components/[dataPK]/datatype-row";
import DynamicRow from "../components/[dataPK]/dynamic-row";
import SerializationRow from "../components/[dataPK]/serialization-row";
import { BASE_URL } from "../utils/utils";
import Loading from './loading';

const DataAccountInfoPage = () => {
    const pathname = usePathname();
    const dataPK = pathname?.substring(1);
    const searchParams = useSearchParams();

    const [dataType, setDataType] = useState<DataTypeOption>(DataTypeOption.CUSTOM);
    const [loading, setLoading] = useState(false);
    const [dataAccountMeta, setDataAccountMeta] = useState<IDataAccountMeta>({} as IDataAccountMeta);
    const [dirty, setDirty] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!dirty) {
            return;
        }

        setLoading(true);
        fetch(`/api/meta/${pathname}?${searchParams.toString()}`)
        .then((res) => {
            if (!res.ok) {
                res.json().then(({ error }: ApiError) => {
                    setError(error);
                })
            } else {
                res.json().then((account_meta: IDataAccountMeta) => {
                    setDataAccountMeta(account_meta);
                    setDataType(account_meta.data_type);
                    setDirty(false);
                    setError(null);
                });
            }
        }).catch((err) => {
            if (err instanceof Error) {
                setError(err.message);
            }
        }).finally(() => setLoading(false));
    }, [pathname, searchParams, dirty])

    const handleRefresh = () => {
        setDirty(true);
        console.log("refreshed");
    }

    if (error) {
        return (
            <div className="text-lg">
                <h1 className="text-lg">
                    <p className="text-rose-500 font-semibold">ERROR:</p> 
                    {error}
                </h1>            
            </div>
        );
    }

    if (loading) {
        return <Loading />;
    }
    
    return (
        <div className="pb-2">
            <table className="table-auto">
                <tbody>
                    <DataAccountRow dataPK={dataPK} />
                    <AuthorityRow authority={dataAccountMeta.authority} />
                    <DataStatusRow dataPK={dataPK} meta={dataAccountMeta} refresh={handleRefresh} />
                    <SerializationRow serialization_status={dataAccountMeta.serialization_status} />
                    <DynamicRow is_dynamic={dataAccountMeta.is_dynamic} />
                    <DataTypeRow data_type={dataAccountMeta.data_type} dataType={dataType} setDataType={setDataType} />
                    <tr><td>&nbsp;</td></tr>
                    <DataRow url={`${BASE_URL}/api/data${pathname}?${searchParams.toString()}`} />
                </tbody>
            </table>
            <DataDisplay data_type={dataType} dataPK={dataPK} searchParams={searchParams.toString()} meta={dataAccountMeta} />
        </div>
    )
}

export default DataAccountInfoPage;