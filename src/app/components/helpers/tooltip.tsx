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
		<div className="group relative flex justify-center">
			{children}
			{condition && (
				<span
					className={`absolute scale-0 transition-all rounded-lg bg-violet-700 dark:bg-solana-purple p-2 text-sm text-stone-100 group-hover:scale-100 ${sx}`}
				>
					{message}
				</span>
			)}
		</div>
	);
}
