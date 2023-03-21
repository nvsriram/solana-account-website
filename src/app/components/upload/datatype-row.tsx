import { DataTypeOption } from "@/app/utils/types";
import { Dispatch, SetStateAction } from "react";
import DataTypeSelect from "./datatype-select";

const DataTypeRow = ({
	dataType,
	setDataType,
}: {
	dataType: DataTypeOption;
	setDataType: Dispatch<SetStateAction<DataTypeOption>>;
}) => {
	return (
		<tr>
			<th
				scope="row"
				className="text-lg text-left text-violet-700 dark:text-solana-purple"
			>
				<span>Data Type</span>
			</th>
			<td className="p-2 text-stone-500 dark:text-stone-200">:</td>
			<td>
				<DataTypeSelect dataType={dataType} setDataType={setDataType} />
			</td>
		</tr>
	);
};

export default DataTypeRow;
