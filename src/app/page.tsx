"use client";

import { DataTypeOption } from "@/app/utils/types";
import { useRouter } from "next/navigation";

export default function Home() {
	const dataTypeDescription = new Map<DataTypeOption, string>();
	dataTypeDescription.set(
		DataTypeOption.CUSTOM,
		"A default datatype to store custom data"
	);
	dataTypeDescription.set(
		DataTypeOption.JSON,
		"Datatype to store JSON data that will be parsed and pretty-printed"
	);
	dataTypeDescription.set(DataTypeOption.IMG, "Datatype to store image data");
	dataTypeDescription.set(
		DataTypeOption.HTML,
		"Datatype to store HTML data that will be output in an iframe"
	);

	const router = useRouter();
	return (
		<>
			<section>
				<h1 className="text-lg">
					Enter the{" "}
					<code className="text-violet-700 dark:text-solana-purple">
						PublicKey
					</code>{" "}
					of the Data Account you wish to inspect above...
				</h1>
				<br />
				<p className="text-lg pb-2">Currently the supported data types are:</p>
				<table className="table-auto">
					<tbody>
						{Object.keys(DataTypeOption)
							.filter((key) => isNaN(Number(key)))
							.map((dataType, idx) => {
								return (
									<tr key={idx}>
										<th
											scope="row"
											className=" text-base text-left text-violet-700 dark:text-solana-purple"
										>
											{dataType}
										</th>
										<td className="text-stone-500 dark:text-stone-200 px-2">
											:
										</td>
										<td className="text-base text-stone-500 dark:text-stone-200">
											{dataTypeDescription.get(idx)}
										</td>
									</tr>
								);
							})}
					</tbody>
				</table>
			</section>
			<section className="flex flex-col mt-8 justify-center">
				<p className="text-lg pt-3 pb-5">
					You can also make use of the Data Program and upload your custom data
					to the Solana blockchain. Click the button below to get started! 🎉
				</p>
				<button
					className="m-auto rounded-md bg-emerald-500 dark:bg-solana-green/80 hover:bg-emerald-700 dark:hover:bg-emerald-600 focus:bg-emerald-700 dark:focus:bg-emerald-600 text-white text-lg font-semibold py-2 px-4 border-b-4 border-emerald-700 dark:border-emerald-600 hover:border-emerald-500 dark:hover:border-solana-green/80 focus:border-emerald-500 dark:focus:border-solana-green/80 disabled:bg-emerald-500 dark:disabled:bg-emerald-600 disabled:hover:border-emerald-500 dark:disabled:hover:border-emerald-600 disabled:focus:border-emerald-500 dark:disabled:focus:border-emerald-600 outline-none"
					onClick={() => router.push(`/upload`)}
				>
					Get Started!
				</button>
			</section>
		</>
	);
}
