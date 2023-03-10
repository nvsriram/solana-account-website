import { ApiError, DataTypeOption, IDataAccountMeta } from "@/app/utils/types";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/utils";
import Loading from "../../[dataPK]/loading";
import CustomDisplay from "./display-custom";
import HTMLDisplay from "./display-html";
import JSONDisplay from "./display-json";

const DataDisplay = ({ data_type, dataPK, searchParams, meta }: { data_type: number, dataPK?: string, searchParams: string, meta: IDataAccountMeta }) => {    
    const [data, setData] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

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
    }, [url]);

    const handleRefresh = () => {
        setTimeout(() => router.replace(`/${dataPK}?${searchParams}`), 10 * 1000);
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
    
    if (!dataPK || !data || data.length <= 0) {
        return null;
    }

    switch (data_type) {
        case DataTypeOption.JSON:
            try {
                const dataJSON = JSON.parse(data.split("").filter(char => char.codePointAt(0)).join(""));
                return (
                    <JSONDisplay json={dataJSON} len={data.length} dataPK={dataPK} meta={meta} refresh={handleRefresh}/>
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
                <HTMLDisplay url={url} data={data} dataPK={dataPK} meta={meta} refresh={handleRefresh} />
            );
        default:
            return (
                <CustomDisplay data={data} dataType={DataTypeOption.CUSTOM} dataPK={dataPK} meta={meta} refresh={handleRefresh} />
            );
    }
};
        
export default DataDisplay;