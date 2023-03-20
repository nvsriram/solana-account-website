import CopyToClipboard from "../helpers/copy"

const DataAccountRow = ({ dataPK } : { dataPK: string | undefined }) => {
    return (
        <tr>
            <th scope="row" className=" text-lg text-left text-solana-purple"
            >
                Data Account
            </th>
            <td className="px-2 text-stone-200">:</td>
            <td className="text-md flex">
                {dataPK}{dataPK && <CopyToClipboard message={dataPK} />}
            </td>
        </tr>
    );
};

export default DataAccountRow;
