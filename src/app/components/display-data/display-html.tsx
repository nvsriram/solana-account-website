import { DataTypeOption, IDataAccountMeta } from "@/app/utils/types";
import { useCallback, useState } from "react";
import CustomDisplay from "./display-custom";

const HTMLDisplay = ({
	url,
	data,
	dataPK,
	meta,
	refresh,
}: {
	url: string;
	data: string;
	dataPK: string;
	meta: IDataAccountMeta;
	refresh: () => void;
}) => {
	const [expanded, setExpanded] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const toggleExpanded = useCallback(() => {
		setExpanded((e) => !e);
		setError(null);
	}, []);

	return (
		<div className="mt-2">
			{expanded ? (
				<CustomDisplay
					data={data}
					dataType={DataTypeOption.HTML}
					dataPK={dataPK}
					meta={meta}
					refresh={refresh}
					setError={setError}
				/>
			) : (
				<iframe
					src={url}
					height={500}
					width={500}
					className="mt-2 bg-stone-200 rounded-md"
					allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
					sandbox="allow-scripts"
				/>
			)}
			<div className="mt-3 flex">
				<button
					className="py-1 px-2 flex text-md rounded-md ring-2 ring-stone-400 bg-stone-200 text-stone-500 focus:outline-none hover:bg-stone-300 hover:text-solana-purple/80 hover:ring-solana-purple focus:bg-stone-300 focus:text-solana-purple/80 focus:ring-solana-purple"
					onClick={() => toggleExpanded()}
				>
					{expanded ? "View original" : "View source"}
				</button>
				{error && <p className="text-rose-500 ml-2">{error}</p>}
			</div>
		</div>
	);
};

export default HTMLDisplay;
