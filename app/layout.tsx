import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LISTED — JTS Course Reviews',
  description: 'Anonymous course and professor reviews for JTS List College students.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-cream`}>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  )
}
