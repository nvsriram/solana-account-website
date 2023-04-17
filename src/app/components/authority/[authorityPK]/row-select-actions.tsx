import { DataAccountWithMeta } from "@/app/utils/types";
import { Row } from "react-table";
import CloseAllAction from "../../actions/close-all-action";
import DataStatusActions from "../../actions/data-status-actions";
import FinalizeAllAction from "../../actions/finalize-all-action";

const RowSelectActions = ({
	selectedFlatRows,
	refresh,
}: {
	selectedFlatRows: Row<DataAccountWithMeta>[];
	refresh: () => void;
}) => {
	if (selectedFlatRows.length === 0) {
		return null;
	}

	return (
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
	);
};

export default RowSelectActions;
