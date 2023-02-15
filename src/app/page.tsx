"use client";

import { DataTypeOption } from "@/types";
import { useRouter } from "next/navigation";

export default function Home() {
  const dataTypeDescription = new Map<DataTypeOption, string>();
  dataTypeDescription.set(DataTypeOption.CUSTOM, "A default datatype to store custom data");
  dataTypeDescription.set(DataTypeOption.JSON, "Datatype to store JSON data that will be parsed and pretty-printed");
  dataTypeDescription.set(DataTypeOption.BORSH, "Datatype to store BORSH data; currently treated as CUSTOM");
  dataTypeDescription.set(DataTypeOption.PNG, "Datatype to store PNG data as Base64 encoded string that will be output as a PNG");

  const router = useRouter();
  return (
    <>
      <section>
        <h1 className="text-lg">
          Enter the <code className="text-solana-purple">PublicKey</code> of the Data Account you wish to inspect above...
        </h1>
        <br />
        <p className="text-lg pb-2">
          Currently the supported data types are:
        </p>
        <table className="table-auto">
          <tbody>
            {Object.keys(DataTypeOption)
              .filter((key) => isNaN(Number(key)))
              .map((dataType, idx) => {
                return (
                  <tr key={idx}>
                    <th scope="row" className=" text-md text-left text-solana-purple"
                    >
                        {dataType}
                    </th>
                    <td className="text-stone-200 px-2">:</td>
                    <td className="text-md text-stone-200">
                        {dataTypeDescription.get(idx)}
                    </td>
                  </tr>
                );
              }
              )}
          </tbody>
        </table>
      </section>
      <section className="flex flex-col mt-8 justify-center">
        <p className="text-lg pt-3 pb-5">You can also make use of the Data Program and upload your custom data to the Solana blockchain. Click the button below to get started! 🎉</p>
        <button 
          className="m-auto rounded-md bg-solana-green/80 hover:bg-emerald-600 text-white text-lg font-semibold py-2 px-4 border-b-4 border-emerald-600 hover:border-solana-green/80"
          onClick={() => router.push(`/upload`)}
        >
          Get Started!
        </button>
      </section> 
    </>
  );
}