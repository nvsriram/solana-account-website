"use client";

import './globals.css'
import { ClusterSelect } from './cluster-select'
import { Search } from './search'
import { useState } from 'react';
import { ClusterNames } from '@/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ClusterContext } from '@/utils';

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
      <ClusterContext.Provider value={{ cluster, setCluster }}>
        <body className='h-screen flex-row font-sans bg-stone-800 justify-center'>
          <nav className="container mx-auto py-5">
            <div className="w-full inline-flex justify-between">
              <Link 
                className="text-4xl flex font-bold ml-2 text-transparent bg-clip-text bg-gradient-to-b from-solana-purple to-solana-green"
                href={`/`}
                >
                {`SolD : `}
                <p className="pl-2 text-3xl self-center">
                  A <span className="underline underline-offset-3 decoration-solana-green">Sol</span>ana URI <span className="underline underline-offset-3 decoration-solana-green">D</span>ata visualizer
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
              {children}
            </section>
          </div>
        </body>
      </ClusterContext.Provider>
    </html>
  )
}
