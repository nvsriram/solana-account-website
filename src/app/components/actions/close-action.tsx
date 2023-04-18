import { IDataAccountMeta, ClusterNames } from "@/app/utils/types";
import { useCluster, closeDataAccount } from "@/app/utils/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { useMemo, useState } from "react";
import Tooltip from "../helpers/tooltip";
import ActionModal from "../helpers/action-modal";

const CloseAction = ({
	dataPK,
	meta,
	refresh,
	disableTooltip,
	classes,
}: {
	dataPK: string | undefined;
	meta: IDataAccountMeta;
	refresh: () => void;
	disableTooltip?: boolean;
	classes?: string;
}) => {
	const { cluster } = useCluster();
	const { publicKey: authority, signTransaction } = useWallet();

	const [error, setError] = useState<string | null>(null);
	const [closeState, setCloseState] = useState("Close");
	const [showModal, setShowModal] = useState(false);

	const isAuthority = useMemo(
		() => authority && authority.toBase58() === meta.authority,
		[authority, meta]
	);

	const handleCloseConfirmed = async () => {
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
			setCloseState("Closing...");
			setError(null);

			const clusterURL = Object.values(ClusterNames).find(
				({ name }) => name === cluster
			)?.url;
			if (!clusterURL) {
				setError("Invalid cluster");
				return;
			}

			const clusterConnection = new Connection(clusterURL);
			const dataAccount = new PublicKey(dataPK);

			const recentBlockhash = await clusterConnection.getLatestBlockhash();
			const tx = new Transaction();
			const ix = closeDataAccount(authority, dataAccount, null, true);
			tx.add(ix);
			tx.recentBlockhash = recentBlockhash.blockhash;
			tx.feePayer = authority;
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
						`closed: https://explorer.solana.com/tx/${txid}?cluster=devnet`
					);
				});
			setCloseState("Closed");
			refresh();
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			}
		}
	};

	const handleClose = () => {
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
		<div className={`flex items-center mt-1 ${classes}`}>
			<button
				className="w-full px-1 lg:px-2 rounded-md bg-rose-600 hover:bg-rose-700 focus:bg-rose-700 focus:outline-none text-white disabled:bg-stone-500 disabled:cursor-not-allowed"
				onClick={() => handleClose()}
				disabled={!isAuthority}
				title={
					isAuthority
						? "This action closes the data account and the metadata PDA account and reclaims their SOL"
						: "Login as Authority wallet to close data account"
				}
			>
				<span className="text-xs md:text-sm lg:text-base">{closeState}</span>
			</button>
			{!disableTooltip && (
				<Tooltip
					message={
						<>
							{isAuthority
								? "This action closes the data account and the metadata PDA account and reclaims their SOL"
								: "Login as Authority wallet to close data account"}
						</>
					}
					condition={true}
					sx={`w-32 lg:w-44 top-7 right-0 md:top-5 lg:top-0 lg:left-9`}
				>
					<svg
						className="ml-1 lg:ml-2 w-4 h-4 lg:w-5 lg:h-5 text-emerald-500 dark:text-solana-green group-hover:text-emerald-700 dark:group-hover:text-emerald-600 group-focus:text-emerald-700 dark:group-focus:text-emerald-600"
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
			)}
			{error && (
				<p className="text-xs md:text-sm lg:text-base ml-3 lg:ml-5 text-rose-500">
					{error}
				</p>
			)}
			<ActionModal
				showModal={showModal}
				message={
					<>
						Are you sure you want to close the data account and associated
						metadata account?
						<br /> This action is non-reversible
					</>
				}
				cancel={"No, Cancel"}
				confirm={"Yes, I'm sure! Close the accounts and reclaim SOL"}
				handleCloseModal={() => setShowModal(false)}
				handleSaveChanges={() => {
					handleCloseConfirmed();
					setShowModal(false);
				}}
			/>
		</div>
	);
};

export default CloseAction;
