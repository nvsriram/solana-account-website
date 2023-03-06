"use client";

import { ApiError, DataStatusOption, DataTypeOption, IDataAccountMeta, SerializationStatusOption } from "@/app/utils/types";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DataDisplay from "../components/display-data";
import CopyToClipboard from "../components/helpers/copy";
import DataTypeSelect from "../components/upload/datatype-select";
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
                            {dataAccountMeta.data_type != undefined && <DataTypeSelect dataType={dataType} setDataType={setDataType} />}
                        </td>
                    </tr>
                    <tr><td>&nbsp;</td></tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Data
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                    </tr>
                </tbody>
            </table>
            <DataDisplay data_type={dataType} dataPK={dataPK} searchParams={searchParams.toString()} />
        </div>
    )
}

export default DataAccountInfoPage;