import {
	ClusterNames,
	DataStatusOption,
	IDataAccountMeta,
} from "@/app/utils/types";
import { finalizeDataAccount, useCluster } from "@/app/utils/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useMemo, useState } from "react";
import Tooltip from "../helpers/tooltip";

const DataStatusRow = ({
	dataPK,
	meta,
	refresh,
}: {
	dataPK: string | undefined;
	meta: IDataAccountMeta;
	refresh: () => void;
}) => {
	const { cluster } = useCluster();
	const { publicKey: authority, signTransaction } = useWallet();

	const [error, setError] = useState<string | null>();
	const [finalizeState, setFinalizeState] = useState("Finalize");

	const isAuthority = useMemo(
		() => authority && authority.toBase58() === meta.authority,
		[authority, meta]
	);

	const handleFinalize = async () => {
		if (!dataPK) {
			setError("Invalid data account");
			return;
		}

		if (
			!authority ||
			meta.authority != authority.toBase58() ||
			!signTransaction
		) {
			setError(
				"Invalid authority wallet. Please sign in to wallet to continue..."
			);
			return;
		}

		try {
			setFinalizeState("Finalizing...");
			setError(null);

			const clusterURL = Object.values(ClusterNames).find(
				({ name }) => name === cluster
			)?.url;
			if (!clusterURL) {
				setError("Invalid cluster");
				return;
			}

			if (meta.data_status === DataStatusOption.FINALIZED) {
				setError("Data account is already finalized");
				return;
			}

			const clusterConnection = new Connection(clusterURL);
			const dataAccount = new PublicKey(dataPK);

			const recentBlockhash = await clusterConnection.getLatestBlockhash();
			const tx = finalizeDataAccount(authority, dataAccount, null, true);
			tx.recentBlockhash = recentBlockhash.blockhash;
			const signed = await signTransaction(tx);
			const txid = await clusterConnection.sendRawTransaction(
				signed.serialize()
			);
			await clusterConnection
				.confirmTransaction(
					{
						blockhash: recentBlockhash.blockhash,
						lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
						signature: txid,
					},
					"confirmed"
				)
				.then(() => {
					console.log(
						`finalized: https://explorer.solana.com/tx/${txid}?cluster=devnet`
					);
				});
			setFinalizeState("Finalized");
			refresh();
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			}
		}
	};

	return (
		<tr>
			<th
				scope="row"
				className="text-lg text-left text-violet-700 dark:text-solana-purple"
			>
				Data Status
			</th>
			<td className="px-2 text-stone-500 dark:text-stone-200">:</td>
			<td
				className={`text-md flex items-center ${
					meta.data_status === DataStatusOption.INITIALIZED
						? "text-emerald-500 dark:text-solana-green"
						: "text-rose-500"
				}`}
			>
				<p>{DataStatusOption[meta.data_status]}</p>
				{meta.data_status != DataStatusOption.FINALIZED && (
					<>
						<button
							className="ml-5 px-2 rounded-md bg-emerald-500 dark:bg-solana-green/80 hover:bg-emerald-700 dark:hover:bg-emerald-600 focus:bg-emerald-700 dark:focus:bg-emerald-600 focus:outline-none text-white disabled:bg-stone-500 disabled:cursor-not-allowed"
							onClick={() => handleFinalize()}
							disabled={!isAuthority}
						>
							{finalizeState}
						</button>
						<Tooltip
							message={
								<>
									{isAuthority
										? "Finalized accounts can no longer be updated"
										: "Login as Authority wallet to finalize data account"}
								</>
							}
							condition={true}
							sx={`w-44 right-0 top-0 left-9`}
						>
							<svg
								className="ml-2 w-5 h-5 text-emerald-500 dark:text-solana-green"
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
						{error && <p className="ml-5 text-rose-500">{error}</p>}
					</>
				)}
			</td>
		</tr>
	);
};

export default DataStatusRow;
