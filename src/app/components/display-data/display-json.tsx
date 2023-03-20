import {
	ClusterNames,
	DataStatusOption,
	DataTypeOption,
	EditorThemeKeys,
	EditorThemeMap,
	IDataAccountMeta,
} from "@/app/utils/types";
import {
	handleUpload,
	uploadDataPart,
	useCluster,
	useEditorTheme,
} from "@/app/utils/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import dynamic from "next/dynamic";
import router from "next/router";
import { useState, useEffect, useMemo } from "react";

const ReactJsonDynamic = dynamic(import("react-json-view"), { ssr: false });

const JSONDisplay = ({
	json,
	len,
	dataPK,
	meta,
	refresh,
}: {
	json: object;
	len: number;
	dataPK: string;
	meta: IDataAccountMeta;
	refresh: () => void;
}) => {
	const { editorTheme, setEditorTheme } = useEditorTheme();
	const { cluster } = useCluster();
	const { publicKey: authority, signAllTransactions } = useWallet();

	const [saveState, setSaveState] = useState("Save");
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState({});

	const unsavedChanges = useMemo(
		() => JSON.stringify(data) != JSON.stringify(json),
		[data, json]
	);

	useEffect(() => setData(json), [json]);

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

	const handleCancel = () => {
		setData(json);
		setSaveState("Save");
		setError(null);
	};

	const handleSave = async () => {
		if (
			!authority ||
			meta.authority != authority.toBase58() ||
			!signAllTransactions
		) {
			setError(
				"Invalid authority wallet. Please sign in to wallet to continue..."
			);
			return;
		}

		const old = JSON.stringify(json);
		const updated = JSON.stringify(data);
		let updateData: Buffer;
		try {
			setSaveState("Saving...");
			setError(null);

			const clusterURL = Object.values(ClusterNames).find(
				({ name }) => name === cluster
			)?.url;
			if (!clusterURL) {
				setError("Invalid cluster");
				return;
			}

			if (meta.data_status === DataStatusOption.FINALIZED) {
				setError("Data account is finalized so cannot be updated");
				return;
			}

			const clusterConnection = new Connection(clusterURL);
			const dataAccount = new PublicKey(dataPK);

			// start offset
			let idx = 0;
			const min = Math.min(old.length, updated.length);
			for (idx; idx < min; ++idx) {
				if (old[idx] === updated[idx]) {
					continue;
				}
				break;
			}
			const offset = idx;

			if (old.length === updated.length) {
				// chunk end
				for (idx = min; idx > offset; --idx) {
					if (old[idx] === updated[idx]) {
						continue;
					}
					break;
				}
				updateData = Buffer.from(updated.substring(offset, idx + 1), "ascii");
			} else if (old.length < updated.length) {
				if (meta.is_dynamic || updated.length <= len) {
					updateData = Buffer.from(updated.substring(offset), "ascii");
				} else {
					setError("Data account is static so cannot be realloced");
					return;
				}
			} else {
				const oldUpdate = Buffer.from(updated.substring(offset), "ascii");
				updateData = Buffer.concat([
					oldUpdate,
					Buffer.from(new Uint8Array(old.length - updated.length)),
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
					DataTypeOption.JSON,
					part,
					offset + current * PART_SIZE
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
							DataTypeOption.JSON,
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
				setError(err.message);
			}
		}
	};

	return (
		<div className="mt-2 justify-end relative">
			<div className="absolute top-2 z-10 right-2 inline-flex">
				{meta.data_status != DataStatusOption.FINALIZED && error && (
					<p className="text-rose-500 mr-2">{error}</p>
				)}
				{meta.data_status != DataStatusOption.FINALIZED && unsavedChanges && (
					<>
						<button
							className="text-md mr-2 py-1 px-2 rounded-md bg-solana-green/80 hover:bg-emerald-600 focus:bg-emerald-600 text-white focus:outline-none"
							onClick={() => handleSave()}
						>
							{saveState}
						</button>
						<button
							className="text-md mr-2 p-1 rounded-md bg-rose-500/70 hover:bg-rose-700/90 focus:bg-rose-700/90 focus:outline-none text-white"
							onClick={() => handleCancel()}
						>
							Cancel
						</button>
					</>
				)}
				<p className="text-solana-purple text-md pr-2">Theme:</p>
				<select
					className="text-black text-md w-fit p-0.5 bg-stone-200 rounded-sm focus:outline-none shadow-sm focus-within:ring-2 hover:ring-solana-purple focus:ring-solana-purple ring-2 ring-stone-400"
					required
					aria-required
					value={editorTheme}
					onChange={(e) => setEditorTheme(e.target.value)}
				>
					{EditorThemeKeys.map((label, idx) => {
						return (
							<option key={idx} value={label}>
								{label}
							</option>
						);
					})}
				</select>
			</div>
			<ReactJsonDynamic
				src={data}
				name={null}
				style={{ padding: "0.5rem", borderRadius: "0.5rem" }}
				theme={EditorThemeMap.get(editorTheme)}
				iconStyle="square"
				onEdit={
					meta.data_status != DataStatusOption.FINALIZED
						? (e) => setData(e.updated_src)
						: undefined
				}
				onAdd={
					meta.data_status != DataStatusOption.FINALIZED
						? (e) => setData(e.updated_src)
						: undefined
				}
				onDelete={
					meta.data_status != DataStatusOption.FINALIZED
						? (e) => setData(e.updated_src)
						: undefined
				}
			/>
		</div>
	);
};

export default JSONDisplay;
