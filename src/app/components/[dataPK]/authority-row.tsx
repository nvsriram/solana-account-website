import CopyToClipboard from "../helpers/copy";

const AuthorityRow = ({ authority }: { authority: string | undefined }) => {
	return (
		<tr>
			<th
				scope="row"
				className=" text-lg text-left text-violet-700 dark:text-solana-purple"
			>
				Authority
			</th>
			<td className="px-2 text-stone-500 dark:text-stone-200">:</td>
			<td className="text-md flex">
				{authority}
				{authority && <CopyToClipboard message={authority} />}
			</td>
		</tr>
	);
};

export default AuthorityRow;
