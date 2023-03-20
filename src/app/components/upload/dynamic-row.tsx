import { displaySize, MAX_FILE_SIZE } from "@/app/utils/utils";
import { Dispatch, SetStateAction } from "react";
import Tooltip from "../helpers/tooltip";

const DynamicRow = ({
	isDynamic,
	setIsDynamic,
	space,
	setSpace,
}: {
	isDynamic: boolean;
	setIsDynamic: Dispatch<SetStateAction<boolean>>;
	space: number;
	setSpace: Dispatch<SetStateAction<number>>;
}) => {
	return (
		<tr>
			<th scope="row" className="text-lg text-left text-solana-purple">
				<span>Dynamic/Static + Initial size</span>
			</th>
			<td className="p-2 text-stone-200">:</td>
			<td className="flex flex-row h-full items-center">
				<input
					type="checkbox"
					checked={isDynamic}
					onChange={() => setIsDynamic((prev) => !prev)}
					className="mr-2 w-4 h-4 accent-solana-green"
				/>
				<input
					type="number"
					required
					aria-required
					min={0}
					max={MAX_FILE_SIZE}
					className="text-black text-md px-1 bg-stone-200 rounded-sm focus:outline-none shadow-sm focus-within:ring-2 hover:ring-solana-purple focus:ring-solana-purple ring-2 ring-stone-400 invalid:ring-rose-700"
					value={space}
					onChange={(e) => {
						const num = Number(e.target.value);
						if (isNaN(num) || num < 0) {
							setSpace(0);
						} else {
							setSpace(Number(e.target.value));
						}
					}}
				/>
				<Tooltip
					message={
						<>
							<b>{isDynamic ? "Dynamic" : "Static"}</b>
							<br />
							Initial size:
							<br />
							{displaySize(space)}
							<br />
							{space > MAX_FILE_SIZE ? (
								<p className="text-rose-700">{`> ${MAX_FILE_SIZE / 1e6} MB`}</p>
							) : null}
						</>
					}
					condition={true}
					sx={`w-32 right-0 top-0 left-9`}
				>
					<svg
						className="ml-2 w-5 h-5 text-solana-green"
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

export default DynamicRow;
