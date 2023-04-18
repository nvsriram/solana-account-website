"use client";

import { ApiError, DataTypeOption, IDataAccountMeta } from "@/app/utils/types";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DataDisplay from "../components/display-data/display-data";
import AuthorityRow from "../components/[dataPK]/authority-row";
import DataRow from "../components/[dataPK]/data-row";
import DataAccountRow from "../components/[dataPK]/dataaccount-row";
import DataStatusRow from "../components/[dataPK]/datastatus-row";
import DataTypeRow from "../components/[dataPK]/datatype-row";
import DynamicRow from "../components/[dataPK]/dynamic-row";
import SerializationRow from "../components/[dataPK]/serialization-row";
import { getBaseURL } from "../utils/utils";
import Loading from "@/app/components/loading";

const DataAccountInfoPage = () => {
	const pathname = usePathname();
	const dataPK = pathname?.substring(1);
	const searchParams = useSearchParams();

	const [dataType, setDataType] = useState<DataTypeOption>(
		DataTypeOption.CUSTOM
	);
	const [loading, setLoading] = useState(false);
	const [dataAccountMeta, setDataAccountMeta] = useState<IDataAccountMeta>(
		{} as IDataAccountMeta
	);
	const [dirty, setDirty] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!dirty) {
			return;
		}

		setLoading(true);
		fetch(`/api/meta/${pathname}?${searchParams.toString()}`)
			.then((res) => {
				if (!res.ok) {
					res.json().then(({ error }: ApiError) => {
						setError(error);
					});
				} else {
					res.json().then((account_meta: IDataAccountMeta) => {
						setDataAccountMeta(account_meta);
						setDataType(account_meta.data_type);
						setDirty(false);
						setError(null);
					});
				}
			})
			.catch((err) => {
				if (err instanceof Error) {
					setError(err.message);
				}
			})
			.finally(() => setLoading(false));
	}, [pathname, searchParams, dirty]);

	const handleRefresh = () => {
		setDirty(true);
		console.log("refreshed");
	};

	if (error) {
		return (
			<div>
				<h1 className="text-sm lg:text-base">
					<p className="text-rose-500 font-semibold">ERROR:</p>
					{error}
				</h1>
			</div>
		);
	}

	if (loading) {
		return <Loading />;
	}

	return (
		<div className="pb-2">
			<div className="grid grid-rows-7 md:grid-rows-8 w-full h-full">
				<DataAccountRow dataPK={dataPK} sx="row-start-1 row-end-2" />
				<AuthorityRow
					authority={dataAccountMeta.authority}
					sx="row-start-2 row-end-3"
				/>
				<DataStatusRow
					dataPK={dataPK}
					meta={dataAccountMeta}
					refresh={handleRefresh}
					sx="row-start-3 row-end-4"
				/>
				<SerializationRow
					serialization_status={dataAccountMeta.serialization_status}
					sx="row-start-4 row-end-5"
				/>
				<DynamicRow
					is_dynamic={dataAccountMeta.is_dynamic}
					sx="row-start-5 row-end-6"
				/>
				<DataTypeRow
					data_type={dataAccountMeta.data_type}
					dataType={dataType}
					setDataType={setDataType}
					sx="row-start-6 row-end-7"
				/>
				<DataRow
					url={`${getBaseURL()}/api/data${pathname}?${searchParams.toString()}`}
					sx="row-start-7 row-end-8"
				/>
			</div>
			<DataDisplay
				data_type={dataType}
				dataPK={dataPK}
				searchParams={searchParams.toString()}
				meta={dataAccountMeta}
			/>
		</div>
	);
};

export default DataAccountInfoPage;
