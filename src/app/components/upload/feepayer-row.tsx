import dynamic from "next/dynamic";

const WalletButtonDynamic = dynamic(() => import("../wallet/wallet-button"), {
	ssr: false,
});

const FeePayerRow = () => {
	return (
		<tr>
			<th
				scope="row"
				className="text-lg text-left text-violet-700 dark:text-solana-purple"
			>
				<span>
					Fee Payer <code>Keypair</code>
				</span>
			</th>
			<td className="p-2 text-stone-500 dark:text-stone-200">:</td>
			<td>
				<WalletButtonDynamic className="h-8 text-sm px-2 py-1 text-white bg-solana-purple rounded-md hover:bg-violet-700 dark:hover:bg-solana-purple/70 focus:bg-violet-700 dark:focus:bg-solana-purple/70 [&:not([disabled]):hover]:bg-violet-700 dark:[&:not([disabled]):hover]:bg-solana-purple/70 [&:not([disabled]):focus]:bg-violet-700 dark:[&:not([disabled]):focus]:bg-solana-purple/70 hover:text-stone-100 focus:text-stone-100 disabled:bg-stone-700 disabled:hover:text-stone-100 disabled:focus:text-stone-100 focus:outline-none dark:focus:outline-none" />
			</td>
		</tr>
	);
};

export default FeePayerRow;
