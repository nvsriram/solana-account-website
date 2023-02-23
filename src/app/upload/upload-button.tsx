const UploadButton = ({ dataAccount, loading, dataAccountStatus } : { dataAccount: string | null, loading: boolean, dataAccountStatus: number }) => {
    return (
        <button type="submit" disabled={dataAccount != null} className="m-auto justify-self-center bg-solana-green/80 hover:bg-emerald-600 text-white text-md font-semibold py-1 px-4 border-b-4 border-emerald-600 hover:border-solana-green/80 disabled:bg-emerald-600 disabled:hover:border-emerald-600 disabled:cursor-not-allowed rounded-md">
            {loading && dataAccountStatus < 1 ?
                <>
                    {`Uploading `}
                    <svg className="inline-flex ml-1 animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </> : dataAccount && dataAccountStatus >= 1 ? "Upload Complete" : "Confirm Upload"}
        </button>
    );
}

export default UploadButton;