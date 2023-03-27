import { DataStatusOption, IDataAccountMeta } from "@/app/utils/types";
import DataStatusActions from "./data-status-actions";

const DataStatusRow = ({
	dataPK,
	meta,
	refresh,
}: {
	dataPK: string | undefined;
	meta: IDataAccountMeta;
	refresh: () => void;
}) => {
	return (
		<tr>
			<th
				scope="row"
				className="text-lg align-top text-left text-violet-700 dark:text-solana-purple"
			>
				Data Status
			</th>
			<td className="px-2 leading-7 align-top text-stone-500 dark:text-stone-200">
				:
			</td>
			<td
				className={`text-base leading-7 flex items-top ${
					meta.data_status === DataStatusOption.INITIALIZED
						? "text-emerald-500 dark:text-solana-green"
						: "text-rose-500"
				}`}
			>
				<p className="mr-5">{DataStatusOption[meta.data_status]}</p>
				{meta.data_status && (
					<DataStatusActions dataPK={dataPK} meta={meta} refresh={refresh} />
				)}
			</td>
		</tr>
	);
};

export default DataStatusRow;
