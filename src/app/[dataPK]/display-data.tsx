import { DataTypeOption } from "@/types";
import Image from "next/image";

const DataDisplay = ({ data, data_type }: { data: string | undefined, data_type: number}) => {
    if (!data || data.length <= 0) {
        return (
            <h1 className="text-lg">-</h1>
        );
    }
    switch (data_type) {
        case DataTypeOption.JSON:
            try {
                const dataJSON = JSON.parse(data);
                return (
                    <div className="mb-2 p-2 bg-stone-900 rounded-lg">
                        <pre className="text-sm font-mono text-amber-200 break-words">
                            {JSON.stringify(dataJSON, null, 2)}
                        </pre>
                    </div>
                );
            }
            catch(err) {
                return (
                    <div className="text-lg">
                        <h1 className="text-lg break-words">
                            <p className="text-rose-500 font-semibold">There was an error parsing the JSON data:</p>
                            {data}
                        </h1>
                    </div>
                );
            }
        case DataTypeOption.IMG:
            return (
                <div className="w-full text-lg">
                    <Image src={data} height={300} width={300} alt="nft-image"/>
                </div>
            );
        default:
            return (
                <div className="text-lg">
                    <h1 className="text-lg break-words">
                        {data}
                    </h1>
                </div>
            );
    }
};

export default DataDisplay;