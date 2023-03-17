"use client";

import './globals.css'
import { Search } from './components/search'
import ContextProviders from './providers';
import Navbar from './components/navbar';
import Footer from './components/footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {  
  return (
    <html lang="en">
      <head />
        <body className='min-h-screen flex flex-col font-sans bg-stone-800 justify-center'>
          <ContextProviders>
            <Navbar />
            <main className="container mx-auto my-3 flex-1">
              <section className="w-full h-full container mx-auto pt-5">
                <Search />
              </section>
              <section className="w-full h-full flex flex-col mt-5 mx-auto content-center justify-content-center text-solana-blue">
                {children}
              </section>
            </main>
            <Footer />
          </ContextProviders>
        </body>
    </html>
  )
}
