import { useWallet } from "@solana/wallet-adapter-react";
import Tooltip from "../helpers/tooltip";
import CopyToClipboard from "../helpers/copy";

const FeePayerRow = () => {
	const { publicKey } = useWallet();

	return (
		<tr>
			<th
				scope="row"
				className="text-lg text-left text-violet-700 dark:text-solana-purple"
			>
				<span>Fee Payer Wallet</span>
			</th>
			<td className="p-2 text-stone-500 dark:text-stone-200">:</td>
			<td className="h-full items-center flex flex-row">
				{publicKey ? (
					<>
						<p className="text-stone-500 dark:text-stone-200">
							{publicKey?.toBase58()}
						</p>
						<CopyToClipboard message={publicKey.toBase58()} />
						<Tooltip
							message={
								<>
									This is the <code>PublicKey</code> of the wallet you are
									currently signed in with
								</>
							}
							condition={true}
							sx={`w-28 right-0 top-0 left-9`}
						>
							<svg
								className="w-5 h-5 text-emerald-500 dark:text-solana-green group-hover:text-emerald-700 dark:hover:text-emerald-600 group-focus:text-emerald-700 dark:focus:text-emerald-600"
								fill="none"
								stroke="currentColor"
								strokeWidth={1.5}
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
								/>
							</svg>
						</Tooltip>
					</>
				) : (
					<p className="text-rose-500">
						Please sign-in as the fee payer wallet to continue...
					</p>
				)}
			</td>
		</tr>
	);
};

export default FeePayerRow;
