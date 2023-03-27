import { Dispatch, SetStateAction } from "react";

const AuthorityRow = ({
	authority,
	setAuthority,
}: {
	authority: string;
	setAuthority: Dispatch<SetStateAction<string>>;
}) => {
	return (
		<tr>
			<th
				scope="row"
				className="text-lg text-left text-violet-700 dark:text-solana-purple"
			>
				<span>
					Authority <code>PublicKey</code>
				</span>
			</th>
			<td className="p-2 text-stone-500 dark:text-stone-200">:</td>
			<td>
				<input
					type="text"
					required
					value={authority}
					onChange={(e) => setAuthority(e.target.value)}
					minLength={32}
					maxLength={44}
					pattern={"^[A-HJ-NP-Za-km-z1-9]*$"}
					className="w-[28rem] text-black text-base px-1 bg-white dark:bg-stone-200 focus-within:ring-2 hover:ring-violet-700 focus-within:ring-violet-700 dark:hover:ring-solana-purple dark:focus-within:ring-solana-purple rounded-sm ring-2 ring-stone-500 dark:ring-stone-400 shadow-sm focus:outline-none caret-violet-700 dark:caret-solana-purple appearance-none invalid:ring-rose-700"
				/>
			</td>
		</tr>
	);
};

export default AuthorityRow;
