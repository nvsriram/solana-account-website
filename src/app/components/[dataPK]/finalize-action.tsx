import {
	IDataAccountMeta,
	ClusterNames,
	DataStatusOption,
} from "@/app/utils/types";
import { useCluster, finalizeDataAccount } from "@/app/utils/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useState } from "react";
import Tooltip from "../helpers/tooltip";
import ActionModal from "./action-modal";

const FinalizeAction = ({
	dataPK,
	meta,
	refresh,
	isAuthority,
}: {
	dataPK: string | undefined;
	meta: IDataAccountMeta;
	refresh: () => void;
	isAuthority: boolean | null;
}) => {
	const { cluster } = useCluster();
	const { publicKey: authority, signTransaction } = useWallet();

	const [error, setError] = useState<string | null>(null);
	const [finalizeState, setFinalizeState] = useState("Finalize");
	const [showModal, setShowModal] = useState(false);

	const handleFinalizeConfirmed = async () => {
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

	const handleFinalize = () => {
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

		setShowModal(true);
	};

	return (
		<div className="flex items-center mt-1">
			<button
				className="px-2 rounded-md bg-emerald-500 dark:bg-solana-green/80 hover:bg-emerald-700 dark:hover:bg-emerald-600 focus:bg-emerald-700 dark:focus:bg-emerald-600 focus:outline-none text-white disabled:bg-stone-500 disabled:dark:bg-stone-500 disabled:cursor-not-allowed"
				onClick={() => handleFinalize()}
				disabled={!isAuthority}
			>
				{finalizeState}
			</button>
			<Tooltip
				message={
					<>
						{isAuthority
							? "This action finalizes the data in the account to prevent future updates"
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
			<ActionModal
				showModal={showModal}
				message={
					<>
						Are you sure you want to finalize the data?
						<br /> Finalized data can no longer be updated
					</>
				}
				cancel={"No, Cancel"}
				confirm={"Yes, I'm sure! Finalize the data"}
				handleCloseModal={() => setShowModal(false)}
				handleSaveChanges={() => {
					handleFinalizeConfirmed();
					setShowModal(false);
				}}
			/>
		</div>
	);
};

export default FinalizeAction;
