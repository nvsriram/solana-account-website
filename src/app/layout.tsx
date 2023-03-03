"use client";

import './globals.css'
import { ClusterSelect } from './components/cluster/cluster-select'
import { Search } from './components/search'
import { useState } from 'react';
import { ClusterNames } from '@/app/utils/types';
import Link from 'next/link';
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { ClusterContext } from '@/app/utils/utils';
import { Wallet } from './components/wallet/wallet';
import Logo from "public/favicon.ico";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams();
  const currentCluster = Object.values(ClusterNames).find(({name}) => name === searchParams.get("cluster"))?.name;
  const [cluster, setCluster] = useState<string>(currentCluster ? currentCluster : ClusterNames.DEVNET.name);
  
  return (
    <html lang="en">
      <head />
        <body className='h-screen flex-row font-sans bg-stone-800 justify-center'>
        <ClusterContext.Provider value={{ cluster, setCluster }}>
          <nav className="container mx-auto py-5">
            <div className="w-full inline-flex justify-between">
              <Link 
                className="text-4xl flex font-bold ml-2 text-transparent bg-clip-text bg-gradient-to-tr from-solana-purple to-solana-green"
                href={`/`}
                >
                Sol
                <span className='h-full flex items-center'><Image src={Logo} alt="logo" className="h-7 w-7 object-bottom"/></span>
                {` : `}
                <p className="pl-2 text-3xl self-center">
                  A <span className="underline underline-offset-3 decoration-solana-green">Sol</span>ana URI <span className="underline underline-offset-3 decoration-solana-green">D</span>ata Editor
                </p>
              </Link>
              <ClusterSelect />
            </div>
          </nav>
          <div className="container mx-auto my-3">
            <section className="w-full h-full container mx-auto pt-5">
              <Search />
            </section>
            <section className="w-full h-full flex-row mt-5 mx-auto content-center justify-content-center text-solana-blue">
              <Wallet>
                {children}
              </Wallet>
            </section>
          </div>
        </ClusterContext.Provider>
        </body>
    </html>
  )
}
