"use client";

import { ApiError, DataStatusOption, DataTypeOption, IDataAccountMeta, SerializationStatusOption } from "@/app/utils/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DataDisplay from "../components/display-data/display-data";
import CopyToClipboard from "../components/helpers/copy";
import DataTypeSelect from "../components/upload/datatype-select";
import { BASE_URL } from "../utils/utils";
import Loading from './loading';

const DataAccountInfoPage = () => {
    const pathname = usePathname();
    const dataPK = pathname?.substring(1);
    const searchParams = useSearchParams();

    const [dataType, setDataType] = useState<DataTypeOption>(DataTypeOption.CUSTOM);
    const [loading, setLoading] = useState(false);
    const [dataAccountMeta, setDataAccountMeta] = useState<IDataAccountMeta>({} as IDataAccountMeta);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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
                    setError(null);
                });
            }
        }).catch((err) => {
            if (err instanceof Error) {
                setError(err.message);
            }
        }).finally(() => setLoading(false));
    }, [pathname, searchParams])

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
                    <tr>
                        <th scope="row" className=" text-lg text-left text-solana-purple"
                        >
                            Data Account
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className="text-md flex">
                            {dataPK}{dataPK && <CopyToClipboard message={dataPK} />}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className=" text-lg text-left text-solana-purple"
                        >
                            Authority
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className="text-md flex">
                            {dataAccountMeta.authority}{dataAccountMeta.authority && <CopyToClipboard message={dataAccountMeta.authority} />}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Data Status
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className={`text-md ${dataAccountMeta.data_status % 2 ? "text-solana-green": "text-rose-500"}`}>
                            {DataStatusOption[dataAccountMeta.data_status]}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Serialization
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className={`text-md ${dataAccountMeta.serialization_status === SerializationStatusOption.VERIFIED ? "text-solana-green": "text-rose-500"}`}>
                            {SerializationStatusOption[dataAccountMeta.serialization_status]}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Dynamic
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className={`text-md ${dataAccountMeta.is_dynamic ? "text-solana-green": "text-rose-500"}`}>
                            {dataAccountMeta.is_dynamic == undefined ? null : dataAccountMeta.is_dynamic ? "TRUE" : "FALSE"}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Data Type
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className="text-md flex">
                            <p className="mr-5">{DataTypeOption[dataAccountMeta.data_type]}</p>
                            {<DataTypeSelect dataType={dataType} setDataType={setDataType} />}
                        </td>
                    </tr>
                    <tr><td>&nbsp;</td></tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Data
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td>
                            <Link 
                                className="flex items-start w-fit text-sm font-semibold bg-solana-purple text-white px-2 py-1 rounded-md ring-solana-purple/70 hover:bg-solana-purple/70 hover:text-stone-200 focus:outline-none focus:ring-2 focus:ring-solana-purple/70"
                                href={`${BASE_URL}/api/data${pathname}?${searchParams.toString()}`} 
                                target="_blank" 
                            >
                                VIEW ORIGINAL
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4 ml-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                </span>
                            </Link>
                        </td>
                    </tr>   
                </tbody>
            </table>
            <DataDisplay data_type={dataType} dataPK={dataPK} searchParams={searchParams.toString()} meta={dataAccountMeta} />
        </div>
    )
}

export default DataAccountInfoPage;