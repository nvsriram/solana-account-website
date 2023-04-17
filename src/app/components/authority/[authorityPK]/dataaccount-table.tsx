import { DataAccountWithMeta } from "@/app/utils/types";
import { useEffect, useState } from "react";
import {
	useTable,
	usePagination,
	TableOptions,
	useFlexLayout,
	useSortBy,
	useRowSelect,
	Row,
} from "react-table";
import RowCheckbox from "./row-checkbox";
import FinalizeAllAction from "../../actions/finalize-all-action";
import CloseAllAction from "../../actions/close-all-action";
import DataStatusActions from "../../actions/data-status-actions";

const MAX_PAGES_TO_NAVIGATE = 5;
const MAX_INACTIVE_PAGES_PER_SIDE = Math.floor(MAX_PAGES_TO_NAVIGATE / 2);
const START_PAGE_INDICES = [0, MAX_PAGES_TO_NAVIGATE];

const DataAccountTable = ({
	columns,
	data,
	refresh,
}: TableOptions<DataAccountWithMeta> & { refresh: () => void }) => {
	const [pageIndices, setPageIndices] = useState(START_PAGE_INDICES);

	const {
		getTableProps,
		headerGroups,
		getTableBodyProps,
		prepareRow,
		page,
		canPreviousPage,
		canNextPage,
		pageOptions,
		pageCount,
		gotoPage,
		nextPage,
		previousPage,
		setPageSize,
		selectedFlatRows,
		state: { pageIndex, pageSize },
	} = useTable(
		{ columns, data },
		useSortBy,
		usePagination,
		useRowSelect,
		useFlexLayout,
		(hooks) => {
			hooks.visibleColumns.push((columns) => [
				{
					id: "select",
					width: "2rem",
					Header: ({ getToggleAllPageRowsSelectedProps }) => {
						return (
							<div className="px-1">
								<RowCheckbox {...getToggleAllPageRowsSelectedProps()} />
							</div>
						);
					},
					Cell: ({ row }: { row: Row<DataAccountWithMeta> }) => (
						<div className="px-1">
							<RowCheckbox {...row.getToggleRowSelectedProps()} />
						</div>
					),
					disableSortBy: true,
				},
				...columns,
			]);
		}
	);

	useEffect(() => {
		let start = Math.max(0, pageIndex - MAX_INACTIVE_PAGES_PER_SIDE);
		if (pageCount < start + MAX_PAGES_TO_NAVIGATE) {
			start = Math.max(0, pageCount - MAX_PAGES_TO_NAVIGATE);
		}
		setPageIndices([start, start + MAX_PAGES_TO_NAVIGATE]);
	}, [pageCount, pageIndex]);

	return (
		<div className="grow h-full flex flex-col justify-between">
			<div>
				<div className="overflow-x-auto rounded-t-lg">
					<table
						className="table-auto border-collapse w-full shadow-xl bg-white dark:bg-stone-800"
						{...getTableProps}
					>
						<thead className="text-base text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-900 text-center uppercase">
							{headerGroups.map((headerGroup) => {
								const { key, ...restHeaderGroupProps } =
									headerGroup.getHeaderGroupProps();
								return (
									<tr key={key} {...restHeaderGroupProps}>
										{headerGroup.headers.map((column) => {
											const { key, ...restHeaderProps } = column.getHeaderProps(
												column.getSortByToggleProps()
											);
											return (
												<th
													key={key}
													className="p-2 flex justify-center"
													{...restHeaderProps}
												>
													{column.render("Header")}
													{column.canSort && (
														<button className="ml-1 flex items-center appearance-none focus:outline-none hover:text-solana-purple hover:dark:text-solana-purple focus:text-solana-purple focus:dark:text-solana-purple">
															{column.isSorted ? (
																column.isSortedDesc ? (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		strokeWidth={2.5}
																		stroke="currentColor"
																		className="w-5 h-3"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			d="M19.5 8.25l-7.5 7.5-7.5-7.5"
																		/>
																	</svg>
																) : (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		strokeWidth={2.5}
																		stroke="currentColor"
																		className="w-5 h-3"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			d="M4.5 15.75l7.5-7.5 7.5 7.5"
																		/>
																	</svg>
																)
															) : (
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 24 24"
																	strokeWidth={1.5}
																	stroke="currentColor"
																	className="w-5 h-5"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
																	/>
																</svg>
															)}
														</button>
													)}
												</th>
											);
										})}
									</tr>
								);
							})}
						</thead>
						<tbody {...getTableBodyProps()}>
							{page.map((row) => {
								prepareRow(row);
								const { key, ...restRowProps } = row.getRowProps();
								return (
									<tr
										key={key}
										className={`text-sm text-center border-b dark:border-stone-600 ${
											row.isSelected ? "bg-stone-100 dark:bg-stone-700 " : ""
										}hover:bg-stone-100 focus-within:bg-stone-100 dark:hover:bg-stone-700 dark:focus-within:bg-stone-700`}
										{...restRowProps}
									>
										{row.cells.map((cell) => {
											const { key, ...restCellProps } = cell.getCellProps();
											return (
												<td key={key} className="p-2" {...restCellProps}>
													{cell.render("Cell")}
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				{selectedFlatRows.length > 0 && (
					<div className="mt-4 flex items-start text-sm text-stone-500 ease-in-out duration-200">
						<p className="mr-3">{selectedFlatRows.length} selected:</p>
						<div className="flex gap-5">
							<DataStatusActions sm>
								<FinalizeAllAction
									rows={selectedFlatRows.map(({ original }) => original)}
									refresh={refresh}
								/>
								<CloseAllAction
									rows={selectedFlatRows.map(({ original }) => original)}
									refresh={refresh}
								/>
							</DataStatusActions>
						</div>
					</div>
				)}
			</div>
			{pageOptions.length > 0 && (
				<nav
					className="w-full px-2 flex items-center justify-between mt-4"
					aria-label="Table navigation"
				>
					<div className="flex items-center">
						<div
							className="mr-1 text-sm font-normal align-middle text-stone-500"
							style={{
								width: `${3 * Math.ceil(Math.log10(data.length)) + 2}rem`,
							}}
						>
							Showing{" "}
							<span className="font-semibold text-stone-700 dark:text-stone-200">
								{`${pageIndex * pageSize + 1}-${(pageIndex + 1) * pageSize}`}
							</span>{" "}
							of{" "}
							<span className="font-semibold text-stone-700 dark:text-stone-200">
								{data.length}
							</span>
						</div>
						<div className="mr-2">
							<span className="leading-7 text-sm font-normal text-stone-500">
								Show{" "}
							</span>
							<select
								className="text-black dark:text-white text-sm h-5 bg-white dark:bg-stone-900 rounded-sm focus:outline-none focus-within:ring-2 hover:ring-violet-700 focus:ring-violet-700 ring-1 ring-stone-500 dark:hover:ring-solana-purple dark:focus:ring-solana-purple dark:ring-stone-400"
								value={pageSize}
								onChange={(e) => {
									setPageIndices(START_PAGE_INDICES);
									setPageSize(Number(e.target.value));
								}}
							>
								{[10, 20, 50, 100]
									.filter((pageSize) => Number(pageSize) < data.length)
									.map((pageSize) => (
										<option key={pageSize} value={pageSize}>
											{pageSize}
										</option>
									))}
								<option value={data.length}>All</option>
							</select>
						</div>
					</div>
					<ul className="inline-flex items-start -space-x-1">
						<li>
							<button
								className="py-1 px-2 text-sm rounded-l-lg border bg-white dark:bg-stone-800 border-stone-500 text-stone-500 hover:bg-stone-200 hover:border-violet-700 hover:text-violet-700 dark:hover:bg-stone-900 dark:hover:border-solana-purple dark:hover:text-solana-purple ease-in-out duration-50 focus:bg-stone-200 focus:border-violet-700 focus:text-violet-700 dark:focus:bg-stone-900 dark:focus:border-solana-purple dark:focus:text-solana-purple focus:ring-0 appearance-none focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:bg-stone-300 dark:disabled:bg-stone-300 disabled:text-stone-800 dark:disabled:text-stone-500 disabled:border-stone-500 dark:disabled:border-stone-500"
								onClick={() => gotoPage(0)}
								disabled={!canPreviousPage}
							>
								First
							</button>
						</li>
						<li>
							<button
								className="py-1 px-2 text-sm border bg-white dark:bg-stone-800 border-stone-500 text-stone-500 hover:bg-stone-200 hover:border-violet-700 hover:text-violet-700 dark:hover:bg-stone-900 dark:hover:border-solana-purple dark:hover:text-solana-purple ease-in-out duration-50 focus:bg-stone-200 focus:border-violet-700 focus:text-violet-700 dark:focus:bg-stone-900 dark:focus:border-solana-purple dark:focus:text-solana-purple focus:ring-0 appearance-none focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:bg-stone-300 dark:disabled:bg-stone-300 disabled:text-stone-800 dark:disabled:text-stone-500 disabled:border-stone-500 dark:disabled:border-stone-500"
								onClick={() => previousPage()}
								disabled={!canPreviousPage}
							>
								Prev
							</button>
						</li>
						{pageOptions
							.slice(pageIndices[0], pageIndices[1])
							.map((pageNum) => {
								return (
									<li key={pageNum}>
										<button
											className={`p-1 w-8 text-sm border ${
												pageNum === pageIndex
													? "bg-stone-200 border-violet-700 text-violet-700 dark:bg-stone-900 dark:border-solana-purple dark:text-solana-purple"
													: "border-stone-500 text-stone-500 bg-white dark:bg-stone-800"
											} hover:bg-stone-200 hover:border-violet-700 hover:text-violet-700 dark:hover:bg-stone-900 dark:hover:border-solana-purple dark:hover:text-solana-purple ease-in-out duration-50 focus:bg-stone-200 focus:border-violet-700 focus:text-violet-700 dark:focus:bg-stone-900 dark:focus:border-solana-purple dark:focus:text-solana-purple focus:ring-0 appearance-none focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:bg-stone-300 dark:disabled:bg-stone-300 disabled:text-stone-800 dark:disabled:text-stone-500 disabled:border-stone-500 dark:disabled:border-stone-500`}
											onClick={() => gotoPage(pageNum)}
										>
											{pageNum + 1}
										</button>
									</li>
								);
							})}
						<li>
							<button
								className="py-1 px-2 text-sm border bg-white dark:bg-stone-800 border-stone-500 text-stone-500 hover:bg-stone-200 hover:border-violet-700 hover:text-violet-700 dark:hover:bg-stone-900 dark:hover:border-solana-purple dark:hover:text-solana-purple ease-in-out duration-50 focus:bg-stone-200 focus:border-violet-700 focus:text-violet-700 dark:focus:bg-stone-900 dark:focus:border-solana-purple dark:focus:text-solana-purple focus:ring-0 appearance-none focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:bg-stone-300 dark:disabled:bg-stone-300 disabled:text-stone-800 dark:disabled:text-stone-500 disabled:border-stone-500 dark:disabled:border-stone-500"
								onClick={() => nextPage()}
								disabled={!canNextPage}
							>
								Next
							</button>
						</li>
						<li>
							<button
								className="py-1 px-2 text-sm rounded-r-lg border bg-white dark:bg-stone-800 border-stone-500 text-stone-500 hover:bg-stone-200 hover:border-violet-700 hover:text-violet-700 dark:hover:bg-stone-900 dark:hover:border-solana-purple dark:hover:text-solana-purple ease-in-out duration-50 focus:bg-stone-200 focus:border-violet-700 focus:text-violet-700 dark:focus:bg-stone-900 dark:focus:border-solana-purple dark:focus:text-solana-purple focus:ring-0 appearance-none focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:bg-stone-300 dark:disabled:bg-stone-300 disabled:text-stone-800 dark:disabled:text-stone-500 disabled:border-stone-500 dark:disabled:border-stone-500"
								onClick={() => gotoPage(pageCount - 1)}
								disabled={!canNextPage}
							>
								Last
							</button>
						</li>
					</ul>
				</nav>
			)}
		</div>
	);
};

export default DataAccountTable;
