import { ClusterNames } from "@/types";

export const ClusterOption = (
    {
        cluster, 
        isSelected, 
        handleClick
    }: {
        cluster: string, 
        isSelected: boolean, 
        handleClick: (clusterName: string) => void
    }) => {
    return (
        <button
            className={`w-52 py-2 justify-between text-md rounded-l-md inline-flex ${cluster === ClusterNames.DEVNET.name ? "bg-solana-green/80 hover:bg-solana-green/50 focus:bg-solana-green/50" : "bg-rose-500 hover:bg-rose-700 focus:bg-rose-700"} focus:outline-none border rounded-md border-stone-200 hover:border-stone-300 text-white hover:text-stone-100`}
            onClick={() => {handleClick(cluster)}}
        >
            <p className="w-full">
                {cluster === ClusterNames.CUSTOM.name ? ClusterNames.CUSTOM.url : cluster}
            </p>
            <span
                className="flex items-center justify-center h-full pr-2 text-white rounded-r-md"
            >
                {isSelected && 
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                            />
                    </svg>
                }
            </span>
        </button>
    );
}