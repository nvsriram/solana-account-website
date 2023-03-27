import {
	ClusterNames,
	DataStatusOption,
	DataTypeOption,
	IDataAccountMeta,
} from "@/app/utils/types";
import ReactCodeMirror from "@uiw/react-codemirror";
import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { html } from "@codemirror/lang-html";
import router from "next/router";
import { handleUpload, uploadDataPart, useCluster } from "@/app/utils/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

const CustomDisplay = ({
	data,
	dataType,
	dataPK,
	meta,
	refresh,
	setError,
}: {
	data: string;
	dataType: DataTypeOption;
	dataPK: string;
	meta: IDataAccountMeta;
	refresh: () => void;
	setError?: Dispatch<SetStateAction<string | null>>;
}) => {
	const { cluster } = useCluster();
	const { publicKey: authority, signAllTransactions } = useWallet();

	const [editable, setEditable] = useState(false);

	const [saveState, setSaveState] = useState("Save");
	const [inlineError, setInlineError] = useState<string | null>(null);
	const [updated, setUpdated] = useState("");

	const unsavedChanges = useMemo(() => updated != data, [data, updated]);

	useEffect(() => setUpdated(data), [data]);

	// prompt the user if they try and leave with unsaved changes
	useEffect(() => {
		const warningText =
			"You have unsaved changes - are you sure you wish to leave this page?";
		const handleWindowClose = (e: BeforeUnloadEvent) => {
			if (!unsavedChanges) {
				return;
			}
			e.preventDefault();
			return (e.returnValue = warningText);
		};
		const handleBrowseAway = () => {
			if (!unsavedChanges) {
				return;
			}
			if (window.confirm(warningText)) {
				return;
			}
			router.events.emit("routeChangeError");
			throw "routeChange aborted.";
		};
		window.addEventListener("beforeunload", handleWindowClose);
		router.events.on("routeChangeStart", handleBrowseAway);
		return () => {
			window.removeEventListener("beforeunload", handleWindowClose);
			router.events.off("routeChangeStart", handleBrowseAway);
		};
	}, [unsavedChanges]);

	const handleEdit = useCallback(() => {
		setEditable(true);
	}, []);

	const handleOnChange = useCallback(
		(value: string) => {
			handleEdit();
			setUpdated(value);
		},
		[handleEdit]
	);

	const handleCancel = useCallback(() => {
		setEditable(false);
		setUpdated(data);
		setSaveState("Save");
		if (setError) {
			setError(null);
		} else {
			setInlineError(null);
		}
	}, [data, setError]);

	const handleSave = async () => {
		if (
			!authority ||
			meta.authority != authority.toBase58() ||
			!signAllTransactions
		) {
			if (setError) {
				setError(
					"Invalid authority wallet. Please sign in to wallet to continue..."
				);
			} else {
				setInlineError(
					"Invalid authority wallet. Please sign in to wallet to continue..."
				);
			}
			return;
		}

		console.log(data.length, updated.length);
		let updateData: Buffer;
		try {
			setSaveState("Saving...");
			if (setError) {
				setError(null);
			} else {
				setInlineError(null);
			}

			const clusterURL = Object.values(ClusterNames).find(
				({ name }) => name === cluster
			)?.url;
			if (!clusterURL) {
				if (setError) {
					setError("Invalid cluster");
				} else {
					setInlineError("Invalid cluster");
				}
				return;
			}

			if (meta.data_status === DataStatusOption.FINALIZED) {
				if (setError) {
					setError("Data account is finalized so cannot be updated");
				} else {
					setInlineError("Data account is finalized so cannot be updated");
				}
				return;
			}

			const clusterConnection = new Connection(clusterURL);
			const dataAccount = new PublicKey(dataPK);

			// start offset
			let idx = 0;
			const min = Math.min(data.length, updated.length);
			for (idx; idx < min; ++idx) {
				if (data[idx] === updated[idx]) {
					continue;
				}
				break;
			}
			const offset = idx;

			if (data.length === updated.length) {
				// chunk end
				for (idx = min; idx > offset; --idx) {
					if (data[idx] === updated[idx]) {
						continue;
					}
					break;
				}
				updateData = Buffer.from(updated.substring(offset, idx + 1), "ascii");
			} else if (data.length < updated.length) {
				if (meta.is_dynamic) {
					updateData = Buffer.from(updated.substring(offset), "ascii");
				} else {
					if (setError) {
						setError("Data account is static so cannot be realloced");
					} else {
						setInlineError("Data account is static so cannot be realloced");
					}

					return;
				}
			} else {
				const oldUpdate = Buffer.from(updated.substring(offset), "ascii");
				updateData = Buffer.concat([
					oldUpdate,
					Buffer.from(new Uint8Array(data.length - updated.length)),
				]);
			}

			const PART_SIZE = 881;
			const parts = Math.ceil(updateData.length / PART_SIZE);
			const allTxs: Transaction[] = [];
			let recentBlockhash = await clusterConnection.getLatestBlockhash();

			let current = 0;
			while (current < parts) {
				const part = updateData.subarray(
					current * PART_SIZE,
					(current + 1) * PART_SIZE
				);
				const tx = uploadDataPart(
					authority,
					dataAccount,
					null,
					dataType,
					part,
					offset + current * PART_SIZE,
					true
				);
				tx.recentBlockhash = recentBlockhash.blockhash;
				allTxs.push(tx);
				++current;
			}

			let signedTxs = await signAllTransactions(allTxs);
			const completedTxs = new Set<number>();
			while (completedTxs.size < signedTxs.length) {
				await Promise.allSettled(
					handleUpload(clusterConnection, recentBlockhash, signedTxs, (tx) =>
						completedTxs.add(signedTxs.indexOf(tx))
					)
				).then(async (p) => {
					const rejected = p.filter((r) => r.status === "rejected");
					if (rejected.length === 0) return;
					rejected.forEach((rej) => {
						if (rej.status === "rejected") {
							console.log(Object.entries(rej.reason));
							console.log("rejected", rej.reason);
						}
					});
					// remake and sign all incomplete txs with new blockhash
					recentBlockhash = await clusterConnection.getLatestBlockhash();
					const allTxs: Transaction[] = [];
					let current = 0;
					while (current < parts) {
						if (completedTxs.has(current)) {
							++current;
							continue;
						}
						const part = updateData.subarray(
							offset + current * PART_SIZE,
							offset + (current + 1) * PART_SIZE
						);
						const tx = uploadDataPart(
							authority,
							dataAccount,
							null,
							dataType,
							part,
							offset + current * PART_SIZE
						);
						tx.recentBlockhash = recentBlockhash.blockhash;
						allTxs.push(tx);
						++current;
					}
					signedTxs = await signAllTransactions(allTxs);
				});
			}
			setSaveState("Saved");
			refresh();
		} catch (err) {
			if (err instanceof Error) {
				if (setError) {
					setError(err.message);
				} else {
					setInlineError(err.message);
				}
			}
		}
	};

	return (
		<div className="mt-2 justify-end relative">
			{meta.data_status != DataStatusOption.FINALIZED && (
				<div className="absolute top-2 z-10 right-2 inline-flex">
					{inlineError && <p className="text-rose-500 mr-2">{inlineError}</p>}
					{unsavedChanges && (
						<button
							className="text-base mr-2 p-1 rounded-md bg-emerald-500 dark:bg-solana-green/80 hover:bg-emerald-700 dark:hover:bg-emerald-600/90 focus:bg-emerald-700 dark:focus:bg-emerald-600/90 focus:outline-none text-white disabled:bg-emerald-700 dark:disabled:bg-emerald-600/90"
							disabled={saveState === "Saved"}
							onClick={() => handleSave()}
						>
							{saveState}
						</button>
					)}
					{editable ? (
						<button
							className="text-base mr-2 p-1 rounded-md bg-rose-500/70 hover:bg-rose-700/90 focus:bg-rose-700/90 focus:outline-none text-white"
							onClick={() => handleCancel()}
						>
							Cancel
						</button>
					) : (
						<button
							className="h-full mr-2 p-1 flex text-base rounded-md bg-stone-100/70 text-stone-500/90 focus:outline-none hover:bg-stone-300/70 hover:text-solana-purple/80 focus:bg-stone-300/70 focus:text-solana-purple/80"
							onClick={() => handleEdit()}
						>
							Edit
						</button>
					)}
				</div>
			)}
			<ReactCodeMirror
				value={updated}
				theme={"dark"}
				editable={editable}
				extensions={dataType === DataTypeOption.HTML ? [html()] : []}
				onChange={handleOnChange}
			/>
		</div>
	);
};

export default CustomDisplay;
