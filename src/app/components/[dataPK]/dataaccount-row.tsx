import CopyToClipboard from "../helpers/copy";

const DataAccountRow = ({ dataPK }: { dataPK: string | undefined }) => {
	return (
		<tr>
			<th
				scope="row"
				className=" text-lg text-left text-violet-700 dark:text-solana-purple"
			>
				Data Account
			</th>
			<td className="px-2 leading-7 text-stone-500 dark:text-stone-200">:</td>
			<td className="text-base leading-7 flex items-center">
				{dataPK}
				{dataPK && <CopyToClipboard message={dataPK} />}
			</td>
		</tr>
	);
};

export default DataAccountRow;
