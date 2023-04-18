const DynamicRow = ({
	is_dynamic,
	sx,
}: {
	is_dynamic: boolean;
	sx?: string;
}) => {
	return (
		<div
			className={`grid grid-flow-row auto-rows-min grid-cols-1 sm:grid-cols-12 ${sx}`}
		>
			<div className="flex flex-row pb-1 sm:pb-0 col-span-3 items-center text-sm sm:font-bold sm:text-base lg:text-lg text-left text-violet-700 dark:text-solana-purple">
				<span>Dynamic</span>
				<span className="flex sm:hidden w-fit py-1 pl-2 text-stone-500 dark:text-stone-200">
					:
				</span>
			</div>
			<div className="w-fit hidden col-span-1 sm:flex sm:p-1 lg:p-2 text-stone-500 dark:text-stone-200">
				:
			</div>
			<div className="pb-4 sm:pb-0 flex items-center col-span-8">
				<span
					className={`text-sm lg:text-base ${
						is_dynamic
							? "text-emerald-500 dark:text-solana-green"
							: "text-rose-500"
					}`}
				>
					{is_dynamic == undefined ? null : is_dynamic ? "TRUE" : "FALSE"}
				</span>
			</div>
		</div>
	);
};

export default DynamicRow;
