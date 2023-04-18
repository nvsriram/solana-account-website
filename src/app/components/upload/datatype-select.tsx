import { DataTypeOption } from "@/app/utils/types";
import { Dispatch, SetStateAction } from "react";

const DataTypeSelect = ({
	dataType,
	setDataType,
	sx,
}: {
	dataType: DataTypeOption;
	setDataType: Dispatch<SetStateAction<DataTypeOption>>;
	sx?: string;
}) => {
	return (
		<select
			className={`text-black text-xs md:text-sm lg:text-base px-1 bg-white dark:bg-stone-200 rounded-sm focus:outline-none shadow-sm focus-within:ring-2 hover:ring-violet-700 focus:ring-violet-700 ring-2 ring-stone-500 dark:hover:ring-solana-purple dark:focus:ring-solana-purple dark:ring-stone-400 ${
				sx ? sx : ""
			}`}
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
