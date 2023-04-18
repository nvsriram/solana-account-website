import CopyToClipboard from "../helpers/copy";

const AuthorityRow = ({
	authority,
	sx,
}: {
	authority: string | undefined;
	sx?: string;
}) => {
	return (
		<div
			className={`grid grid-flow-row auto-rows-min grid-cols-1 sm:grid-cols-12 ${sx}`}
		>
			<div className="flex flex-row pb-1 sm:pb-0 col-span-3 items-center text-sm sm:font-bold sm:text-base lg:text-lg text-left text-violet-700 dark:text-solana-purple">
				<span>Authority</span>
				<span className="flex sm:hidden w-fit py-1 pl-2 text-stone-500 dark:text-stone-200">
					:
				</span>
			</div>
			<div className="w-fit hidden col-span-1 sm:flex sm:p-1 lg:p-2 text-stone-500 dark:text-stone-200">
				:
			</div>
			{authority && (
				<div className="pb-5 sm:pb-0 w-full items-center flex col-span-8">
					<p className="hidden md:block break-words leading-7 align-middle text-sm lg:text-base text-stone-500 dark:text-stone-200">
						{authority}
					</p>
					<button
						title="click to copy"
						onClick={() => navigator.clipboard.writeText(authority)}
						className="w-full h-full md:hidden text-stone-500 dark:text-stone-200 appearance-none outline-none hover:text-violet-700 dark:hover:text-solana-purple focus:text-violet-700 dark:focus:text-solana-purple"
					>
						<p className="text-left text-xs break-words sm:break-normal">
							{authority}
						</p>
					</button>
					<CopyToClipboard message={authority} sx="hidden md:block" />
				</div>
			)}
		</div>
	);
};

export default AuthorityRow;
