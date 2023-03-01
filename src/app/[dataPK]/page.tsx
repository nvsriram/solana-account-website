"use client";

import { ApiError, DataStatusOption, DataTypeOption, IDataAccount, SerializationStatusOption } from "@/app/utils/types";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DataDisplay from "../components/display-data";
import CopyToClipboard from "../components/helpers/copy";
import Loading from './loading';

const DataAccountInfoPage = () => {
    const pathname = usePathname();
    const dataPK = pathname?.substring(1);
    const searchParams = useSearchParams();

    const [dataAccountInfo, setDataAccountInfo] = useState<IDataAccount | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { meta, data }  = useMemo(() => dataAccountInfo ?? {} as IDataAccount, [dataAccountInfo]);

    useEffect(() => {
        fetch(`/api/${pathname}?${searchParams.toString()}`)
        .then((res) => {
            if (!res.ok) {
                res.json().then(({ error } : ApiError) => {
                    setError(error);
                    setDataAccountInfo(null);
                    return;
                })
            } else {
                res.json().then((account_state: IDataAccount) => {
                    if (account_state) {
                        setDataAccountInfo(account_state);
                        setError(null);
                    }
                });
            }
        });
    }, [pathname, searchParams])

    if (error != null) {
        return (
            <div className="text-lg">
                <h1 className="text-lg">
                    <p className="text-rose-500 font-semibold">ERROR:</p> 
                    {error}
                </h1>            
            </div>
        );
    }

    if (!dataAccountInfo && !error) {
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
                            {meta.authority}{meta.authority && <CopyToClipboard message={meta.authority} />}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Data Status
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className={`text-md ${meta.data_status % 2 ? "text-solana-green": "text-rose-500"}`}>
                            {DataStatusOption[meta.data_status]}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Serialization
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className={`text-md ${meta.serialization_status === SerializationStatusOption.VERIFIED ? "text-solana-green": "text-rose-500"}`}>
                            {SerializationStatusOption[meta.serialization_status]}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Dynamic
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className={`text-md ${meta.is_dynamic ? "text-solana-green": "text-rose-500"}`}>
                            {meta.is_dynamic == undefined ? null : meta.is_dynamic ? "TRUE" : "FALSE"}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Data Type
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className="text-md">
                            {DataTypeOption[meta.data_type]}
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
            <DataDisplay data_type={meta.data_type} data={data?.toString()} />
        </div>
    )
}

export default DataAccountInfoPage;