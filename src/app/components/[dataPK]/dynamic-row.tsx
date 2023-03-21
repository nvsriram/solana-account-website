const DynamicRow = ({ is_dynamic }: { is_dynamic: boolean }) => {
	return (
		<tr>
			<th
				scope="row"
				className="text-lg text-left text-violet-700 dark:text-solana-purple"
			>
				Dynamic
			</th>
			<td className="px-2 text-stone-500 dark:text-stone-200">:</td>
			<td
				className={`text-md ${
					is_dynamic
						? "text-emerald-500 dark:text-solana-green"
						: "text-rose-500"
				}`}
			>
				{is_dynamic == undefined ? null : is_dynamic ? "TRUE" : "FALSE"}
			</td>
		</tr>
	);
};

export default DynamicRow;
