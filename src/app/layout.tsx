"use client";

import './globals.css'
import { Search } from './components/search'
import ContextProviders from './providers';
import Navbar from './components/navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {  
  return (
    <html lang="en">
      <head />
        <body className='h-screen flex-row font-sans bg-stone-800 justify-center'>
          <ContextProviders>
            <Navbar />
            <div className="container mx-auto my-3">
              <section className="w-full h-full container mx-auto pt-5">
                <Search />
              </section>
              <section className="w-full h-full flex-row mt-5 mx-auto content-center justify-content-center text-solana-blue">
                {children}
              </section>
            </div>
          </ContextProviders>
        </body>
    </html>
  )
}
