import Link from "next/link";

const DataRow = ({ url }: { url: string }) => {
	return (
		<tr>
			<th scope="row" className="text-lg text-left text-solana-purple">
				Data
			</th>
			<td className="px-2 text-stone-200">:</td>
			<td>
				<Link
					className="flex items-start w-fit text-sm font-semibold bg-solana-purple text-white px-2 py-1 rounded-md ring-solana-purple/70 hover:bg-solana-purple/70 hover:text-stone-200 focus:outline-none focus:ring-2 focus:ring-solana-purple/70"
					href={url}
					target="_blank"
				>
					VIEW ORIGINAL
					<span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.75}
							stroke="currentColor"
							className="w-4 h-4 ml-1"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
							/>
						</svg>
					</span>
				</Link>
			</td>
		</tr>
	);
};

export default DataRow;
