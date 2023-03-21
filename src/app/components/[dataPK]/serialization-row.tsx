import { SerializationStatusOption } from "@/app/utils/types";

const SerializationRow = ({
	serialization_status,
}: {
	serialization_status: SerializationStatusOption;
}) => {
	return (
		<tr>
			<th
				scope="row"
				className="text-lg text-left text-violet-700 dark:text-solana-purple"
			>
				Serialization
			</th>
			<td className="px-2 text-stone-500 dark:text-stone-200">:</td>
			<td
				className={`text-md ${
					serialization_status % 2
						? "text-emerald-500 dark:text-solana-green"
						: "text-rose-500"
				}`}
			>
				{SerializationStatusOption[serialization_status]}
			</td>
		</tr>
	);
};

export default SerializationRow;
