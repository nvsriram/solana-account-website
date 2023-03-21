import Link from "next/link";
import { ClusterSelect } from "./cluster/cluster-select";
import Image from "next/image";
import Logo from "public/favicon.ico";

const Navbar = () => {
	return (
		<nav className="container mx-auto py-5">
			<div className="w-full inline-flex justify-between">
				<Link
					className="text-4xl flex font-bold ml-2 text-transparent bg-clip-text bg-gradient-to-tr from-violet-700 dark:from-solana-purple to-emerald-500 dark:to-solana-green dark:outline-none focus:ring-2 focus:ring-violet-700 dark:focus:ring-solana-purple outline-none"
					href={`/`}
				>
					<span className="h-full flex items-center">
						Sol
						<Image src={Logo} alt="logo" className="h-7 w-7 object-bottom" />
					</span>
					{` : `}
					<p className="pl-2 text-3xl self-center">
						A{" "}
						<span className="underline underline-offset-3 decoration-emerald-500 dark:decoration-solana-green">
							Sol
						</span>
						ana URI{" "}
						<span className="underline underline-offset-3 decoration-emerald-500 dark:decoration-solana-green">
							D
						</span>
						ata Editor
					</p>
				</Link>
				<ClusterSelect />
			</div>
		</nav>
	);
};

export default Navbar;
