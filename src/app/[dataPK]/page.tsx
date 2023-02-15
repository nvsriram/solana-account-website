"use client";

import { ApiError, DataStatusOption, DataTypeOption, IDataAccountState, SerializationStatusOption } from "@/types";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DataDisplay from "./display-data";
import Loading from './loading';

const DataAccountInfoPage = () => {
    const pathname = usePathname();
    const dataPK = pathname?.substring(1);
    const searchParams = useSearchParams();

    const [data, setData] = useState<IDataAccountState | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/${pathname}?${searchParams.toString()}`)
        .then((res) => {
            if (!res.ok) {
                res.json().then(({ error } : ApiError) => {
                    setError(error);
                    setData(null);
                    return;
                })
            } else {
                res.json().then((account_state: IDataAccountState) => {
                    if (account_state) {
                        if (account_state.account_data.data) {
                            account_state.account_data.data.data = Buffer.from(account_state.account_data.data?.data);
                        }
                        setData(account_state);
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

    if (!data) {
        if (!error) {
            return <Loading />;
        }
        return null;
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
                        <td className="text-md">
                            {dataPK}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className=" text-lg text-left text-solana-purple"
                        >
                            Authority
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className="text-md">
                            {data.authority}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Data Status
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className={`text-md ${data.data_status % 2 ? "text-solana-green": "text-rose-500"}`}>
                            {DataStatusOption[data.data_status]}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Serialization
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className={`text-md ${data.serialization_status === SerializationStatusOption.VERIFIED ? "text-solana-green": "text-rose-500"}`}>
                            {SerializationStatusOption[data.serialization_status]}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Dynamic
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className={`text-md ${data.is_dynamic ? "text-solana-green": "text-rose-500"}`}>
                            {data.is_dynamic ? "TRUE" : "FALSE"}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" className="text-lg text-left text-solana-purple"
                        >
                            Data Type
                        </th>
                        <td className="px-2 text-stone-200">:</td>
                        <td className="text-md">
                            {DataTypeOption[data.account_data.data_type]}
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
            <DataDisplay data_type={data.account_data.data_type} data={data.account_data.data} />
        </div>
    )
}

export default DataAccountInfoPage;