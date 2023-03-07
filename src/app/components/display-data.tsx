import { ApiError, DataTypeOption } from "@/app/utils/types";
import NextImage from "next/image";
import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/utils";
import Loading from "../[dataPK]/loading";

const DataDisplay = ({ data_type, dataPK, searchParams }: { data_type: number, dataPK?: string, searchParams: string }) => {    
    const [data, setData] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const url = `/api/data/${dataPK}?${searchParams}`;

    useEffect(() => {
        setLoading(true);
        fetch(url)
        .then((res) => {
            if (!res.ok) {
                res.json().then(({ error }: ApiError) => {
                    setError(error);
                })
            } else {
                res.text().then((data) => {
                    setData(data);
                    setError(null);
                });
            }
        }).catch((err) => {
            if (err instanceof Error) {
                setError(err.message);
            }
        }).finally(() => setLoading(false));
    }, [url])

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
    
    if (!data || data.length <= 0) {
        return null;
    }

    switch (data_type) {
        case DataTypeOption.JSON:
            try {
                const dataJSON = JSON.parse(data);
                return (
                    <div className="mt-2 p-2 bg-stone-900 rounded-lg">
                        <pre className="text-sm font-mono text-amber-200 break-words overflow-auto">
                            {JSON.stringify(dataJSON, null, 2)}
                        </pre>
                    </div>
                );
            } catch(err) {
                return (
                    <div className="text-lg pt-2">
                        <h1 className="text-lg break-words">
                            <p className="text-rose-500 font-semibold">There was an error parsing the JSON data:</p>
                            {data}
                        </h1>
                    </div>
                );
            }
        case DataTypeOption.IMG:
            return (
                <div className="w-full text-lg pt-2">
                    <NextImage src={`${BASE_URL}${url}`} height={300} width={300} style={{ maxHeight: 500, width: "auto" }} alt="nft-image" />
                </div>
            );
        case DataTypeOption.HTML:
            return (
                <iframe src={url} height={500} width={500} className="mt-2" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" sandbox="allow-scripts"/>
            );
        default:
            return (
                <div className="text-lg pt-2">
                    <h1 className="text-lg break-words">
                        {data}
                    </h1>
                </div>
            );
    }
};
        
export default DataDisplay;