import { Dispatch, SetStateAction } from "react";

const FileRow = ({ setFile }: { setFile: Dispatch<SetStateAction<File | undefined>>}) => {
    return (
        <tr>
            <th
                scope="row" className="text-lg text-left text-solana-purple"
            >
                <span>
                    Upload File
                </span>
            </th>
            <td className="p-2 text-stone-200">:</td>
            <td>
                <input
                    type="file"
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            setFile(e.target.files[0]);
                        } else {
                            setFile(undefined);
                        }
                    } }
                    required
                    className="w-full text-sm text-stone-100 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-solana-purple file:text-white hover:file:bg-solana-purple/70 file:hover:text-stone-100" />
            </td>
        </tr>
    );
}

export default FileRow;