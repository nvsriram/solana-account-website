import { DataTypeOption } from "@/app/utils/types";
import { Dispatch, SetStateAction } from "react";

const DataTypeSelect = ({
	dataType,
	setDataType,
}: {
	dataType: DataTypeOption;
	setDataType: Dispatch<SetStateAction<DataTypeOption>>;
}) => {
	return (
		<select
			className="text-black text-md px-1 bg-stone-200 rounded-sm focus:outline-none shadow-sm focus-within:ring-2 hover:ring-solana-purple focus:ring-solana-purple ring-2 ring-stone-400"
			required
			aria-required
			value={dataType}
			onChange={(e) => {
				if (!isNaN(Number(e.target.value))) {
					setDataType(Number(e.target.value));
				}
			}}
		>
			{Object.keys(DataTypeOption)
				.filter((key) => isNaN(Number(key)))
				.map((dataType, idx) => {
					return (
						<option key={idx} value={idx}>
							{dataType}
						</option>
					);
				})}
		</select>
	);
};

export default DataTypeSelect;
