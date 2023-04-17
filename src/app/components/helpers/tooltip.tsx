export default function Tooltip({
	message,
	condition,
	sx,
	children,
}: {
	message: React.ReactNode;
	condition: boolean;
	sx?: string;
	children: React.ReactNode;
}) {
	return (
		<div
			role="tooltip"
			tabIndex={0}
			className="group relative flex justify-center focus:outline-none appearance-none cursor-help"
		>
			{children}
			{condition && (
				<span
					className={`absolute scale-0 transition-all rounded-lg bg-violet-700 dark:bg-solana-purple p-2 text-xs md:text-sm text-stone-100 group-hover:scale-100 group-focus:scale-100 ${sx}`}
				>
					{message}
				</span>
			)}
		</div>
	);
}
