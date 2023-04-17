import { DataAccountWithMeta } from "@/app/utils/types";
import { ChangeEvent } from "react";
import { TableInstance } from "react-table";

const PaginationShowRows = ({
	table,
	dataLen,
	resetPageIndices,
}: {
	table: TableInstance<DataAccountWithMeta>;
	dataLen: number;
	resetPageIndices: () => void;
}) => {
	const {
		setPageSize,
		state: { pageIndex, pageSize },
	} = table;

	const handlePageSize = (e: ChangeEvent<HTMLSelectElement>) => {
		setPageSize(Number(e.target.value));
		resetPageIndices();
	};

	return (
		<div className="flex items-center">
			<div className="mr-4 text-sm font-normal align-middle text-stone-500">
				Showing{" "}
				<span className="font-semibold text-stone-700 dark:text-stone-200">
					{`${pageIndex * pageSize + 1}-${(pageIndex + 1) * pageSize}`}
				</span>{" "}
				of{" "}
				<span className="font-semibold text-stone-700 dark:text-stone-200">
					{dataLen}
				</span>
			</div>
			<div className="mr-2">
				<span className="leading-7 text-sm font-normal text-stone-500">
					Show{" "}
				</span>
				<select
					className="text-black dark:text-white text-sm h-5 bg-white dark:bg-stone-900 rounded-sm focus:outline-none focus-within:ring-2 hover:ring-violet-700 focus:ring-violet-700 ring-1 ring-stone-500 dark:hover:ring-solana-purple dark:focus:ring-solana-purple dark:ring-stone-400"
					value={pageSize}
					onChange={handlePageSize}
				>
					{[10, 20, 50, 100]
						.filter((pageSize) => Number(pageSize) < dataLen)
						.map((pageSize) => (
							<option key={pageSize} value={pageSize}>
								{pageSize}
							</option>
						))}
					<option value={dataLen}>All</option>
				</select>
			</div>
		</div>
	);
};

export default PaginationShowRows;
