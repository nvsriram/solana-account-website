import { DataAccountWithMeta } from "@/app/utils/types";
import { TableInstance } from "react-table";
import PaginationPager from "./pagination-pager";
import { useState, useEffect, useCallback } from "react";
import PaginationShowRows from "./pagination-show-rows";
import {
	START_PAGE_INDICES,
	MAX_INACTIVE_PAGES_PER_SIDE,
	MAX_PAGES_TO_NAVIGATE,
} from "@/app/utils/utils";

const PaginationNav = ({
	table,
	dataLen,
}: {
	table: TableInstance<DataAccountWithMeta>;
	dataLen: number;
}) => {
	const {
		pageOptions,
		pageCount,
		state: { pageIndex },
	} = table;

	const [pageIndices, setPageIndices] = useState(START_PAGE_INDICES);

	useEffect(() => {
		let start = Math.max(0, pageIndex - MAX_INACTIVE_PAGES_PER_SIDE);
		if (pageCount < start + MAX_PAGES_TO_NAVIGATE) {
			start = Math.max(0, pageCount - MAX_PAGES_TO_NAVIGATE);
		}
		setPageIndices([start, start + MAX_PAGES_TO_NAVIGATE]);
	}, [pageCount, pageIndex]);

	const resetPageIndices = useCallback(() => {
		setPageIndices(START_PAGE_INDICES);
	}, []);

	if (pageOptions.length === 0) {
		return null;
	}

	return (
		<nav
			className="w-full px-2 flex items-center justify-between mt-4"
			aria-label="Table navigation"
		>
			<PaginationShowRows
				table={table}
				dataLen={dataLen}
				resetPageIndices={resetPageIndices}
			/>
			<PaginationPager table={table} pageIndices={pageIndices} />
		</nav>
	);
};

export default PaginationNav;
