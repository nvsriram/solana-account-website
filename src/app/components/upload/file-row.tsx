import { DataTypeOption } from "@/app/utils/types";
import { displaySize } from "@/app/utils/utils";
import {
	ChangeEvent,
	Dispatch,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import Tooltip from "../helpers/tooltip";

const FileRow = ({
	dataType,
	fileData,
	setDataType,
	setSpace,
	setFileData,
	setError,
}: {
	dataType: DataTypeOption;
	fileData: Buffer | null;
	setDataType: Dispatch<SetStateAction<DataTypeOption>>;
	setFileData: Dispatch<SetStateAction<Buffer | null>>;
	setSpace: Dispatch<SetStateAction<number>>;
	setError: Dispatch<SetStateAction<string | null>>;
}) => {
	const [file, setFile] = useState<File | undefined>();
	const [fileType, setFileType] = useState<string | undefined>();

	useEffect(() => {
		if (!file) return;

		const reader = new FileReader();

		const loadListener = (e: ProgressEvent<FileReader>) => {
			setError(null);
			if (!e.target || !e.target.result) {
				return;
			}
			try {
				const arrayBuffer = e.target.result as ArrayBuffer;
				let buffer = Buffer.from(arrayBuffer);
				if (dataType === DataTypeOption.JSON) {
					buffer = Buffer.from(JSON.stringify(JSON.parse(buffer.toString())));
				}
				setFileData(buffer);
				setSpace(buffer.length);
			} catch (err) {
				if (err instanceof Error) {
					setError(err.message);
				}
			}
		};
		const errorListener = () => {
			setError("Error reading file");
		};

		reader.addEventListener("load", loadListener);
		reader.addEventListener("error", errorListener);
		setFileType(file.type);
		if (file.type.indexOf("json") !== -1) {
			setDataType(DataTypeOption.JSON);
		} else if (
			file.type.startsWith("image") ||
			dataType === DataTypeOption.IMG
		) {
			setDataType(DataTypeOption.IMG);
		} else if (file.type.indexOf("html") !== -1) {
			setDataType(DataTypeOption.HTML);
		}
		reader.readAsArrayBuffer(file);
		return () => {
			reader.removeEventListener("load", loadListener);
			reader.removeEventListener("error", errorListener);
		};
	}, [file, dataType, setError, setSpace, setFileData, setDataType]);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length <= 0) {
			return;
		}
		setFile(e.target.files[0]);
	};

	return (
		<tr>
			<th
				scope="row"
				className="text-lg text-left text-violet-700 dark:text-solana-purple"
			>
				<span>Upload File</span>
			</th>
			<td className="p-2 text-stone-500 dark:text-stone-200">:</td>
			<td className="h-full flex flex-row items-center">
				<input
					type="file"
					onChange={handleFileChange}
					required
					className="text-sm text-stone-500 dark:text-stone-100 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-solana-purple file:text-white hover:file:bg-violet-700 dark:hover:file:bg-solana-purple/70 file:hover:text-stone-100 file:focus:bg-violet-700 dark:file:focus:bg-solana-purple/70 file:focus:text-stone-100"
				/>
				<Tooltip
					message={
						<>
							File size:
							<br />
							{fileData ? displaySize(fileData?.length) : "-"}
							<br />
							File type:
							<br />
							{fileType ? fileType : "-"}
						</>
					}
					condition={true}
					sx={`w-28 right-0 top-0 left-9`}
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
			</td>
		</tr>
	);
};

export default FileRow;
