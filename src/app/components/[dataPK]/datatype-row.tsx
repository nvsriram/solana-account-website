import { DataTypeOption } from "@/app/utils/types";
import { Dispatch, SetStateAction } from "react";
import DataTypeSelect from "../upload/datatype-select";

const DataTypeRow = ({
	data_type,
	dataType,
	setDataType,
}: {
	data_type: DataTypeOption;
	dataType: DataTypeOption;
	setDataType: Dispatch<SetStateAction<DataTypeOption>>;
}) => {
	return (
		<tr>
			<th
				scope="row"
				className="text-lg text-left text-violet-700 dark:text-solana-purple"
			>
				Data Type
			</th>
			<td className="px-2 leading-7 text-stone-500 dark:text-stone-200">:</td>
			<td className="text-base leading-7 flex items-center">
				<p className="mr-5">{DataTypeOption[data_type]}</p>
				{data_type && (
					<DataTypeSelect dataType={dataType} setDataType={setDataType} />
				)}
			</td>
		</tr>
	);
};

export default DataTypeRow;
