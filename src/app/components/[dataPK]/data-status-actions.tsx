"use client";

import { DataStatusOption, IDataAccountMeta } from "@/app/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import CloseAction from "./close-action";
import FinalizeAction from "./finalize-action";

export const DataStatusActions = ({
	dataPK,
	meta,
	refresh,
}: {
	dataPK: string | undefined;
	meta: IDataAccountMeta;
	refresh: () => void;
}) => {
	const { publicKey: authority } = useWallet();

	const [open, setOpen] = useState(false);
	const dataStatusActionRef = useRef<HTMLDivElement>(null);

	const isAuthority = useMemo(
		() => authority && authority.toBase58() === meta.authority,
		[authority, meta]
	);

	const toggleDataStatusActionMenu = useCallback(() => {
		setOpen((o) => !o);
	}, []);

	const closeDataStatusActionMenu = useCallback(() => {
		setOpen(false);
	}, []);

	useEffect(() => {
		const listener = ({ target }: MouseEvent | TouchEvent) => {
			if (!dataStatusActionRef?.current?.contains(target as Node)) {
				closeDataStatusActionMenu();
			}
		};
		document.addEventListener("mousedown", listener);
		document.addEventListener("touchstart", listener);

		return () => {
			document.removeEventListener("mousedown", listener);
			document.removeEventListener("touchstart", listener);
		};
	}, [dataStatusActionRef, closeDataStatusActionMenu]);

	return (
		<>
			<div
				className="flex flex-col items-start justify-center"
				ref={dataStatusActionRef}
			>
				<button
					className="mb-1 px-2 flex items-center text-base rounded-md ring-2 ring-stone-500 dark:ring-stone-400 bg-white dark:bg-stone-200 text-stone-500 focus:outline-none hover:bg-stone-300 hover:text-violet-700 dark:hover:text-solana-purple/80 hover:ring-violet-700 dark:hover:ring-solana-purple focus:bg-stone-300 focus:text-solana-purple/80 focus:ring-solana-purple"
					onClick={() => toggleDataStatusActionMenu()}
				>
					Actions
					<span className="flex items-center justify-center h-full ml-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-4 h-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</span>
				</button>
				{open && (
					<div>
						{meta.data_status != DataStatusOption.FINALIZED && (
							<FinalizeAction
								dataPK={dataPK}
								meta={meta}
								refresh={refresh}
								isAuthority={isAuthority}
							/>
						)}
						<CloseAction
							dataPK={dataPK}
							meta={meta}
							refresh={refresh}
							isAuthority={isAuthority}
						/>
					</div>
				)}
			</div>
		</>
	);
};

export default DataStatusActions;
