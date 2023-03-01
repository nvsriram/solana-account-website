const UploadStatusBar = ({ dataAccountStatus } : { dataAccountStatus: number }) => {
    return (
        <>
            {dataAccountStatus >= 0 && dataAccountStatus < 100 &&
            <div className="w-96 my-5 bg-stone-200 rounded-md h-5 ring-2 ring-stone-400">
                <div className="px-1 ease-in duration-300 flex justify-center bg-solana-green h-5 rounded-md ring-2 ring-emerald-600" style={{ width: `${Math.min(dataAccountStatus, 100)}%` }}>
                    <span className="animate-[bounce_3s_infinite] text-sm text-emerald-600 overflow-hidden">Uploading...</span>
                </div>
            </div>}
            {dataAccountStatus >= 100 && <div className="text-md mt-3 text-solana-green/80">Upload Complete!</div>}
        </>
    );
}

export default UploadStatusBar;