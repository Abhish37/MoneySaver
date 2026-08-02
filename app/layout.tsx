import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import { CartProvider } from '@/components/CartProvider'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MoneySaver — Stack Coupons, Cashback & Bank Offers in One Click',
  description:
    'MoneySaver automatically layers store coupons, bank card instant discounts, affiliate cashbacks, and discounted gift vouchers into a transparent Net Payable Price Matrix.',
  keywords: 'money saver, coupons, cashback, bank offers, gift cards, savings, india shopping deals',
  openGraph: {
    title: 'MoneySaver — Maximize Your Online Savings',
    description: 'Find the best price across stores and stack every discount layer.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const rawKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const isValidClerkKey = Boolean(
    rawKey &&
    !rawKey.includes('placeholder') &&
    (rawKey.startsWith('pk_test_') || rawKey.startsWith('pk_live_'))
  )

  if (!isValidClerkKey) {
    return (
      <html lang="en" className={`${outfit.variable} ${mono.variable}`}>
        <body className="antialiased min-h-screen flex flex-col">
          <CartProvider>
            {children}
          </CartProvider>
        </body>
      </html>
    )
  }

  return (
    <ClerkProvider publishableKey={rawKey}>
      <html lang="en" className={`${outfit.variable} ${mono.variable}`}>
        <body className="antialiased min-h-screen flex flex-col">
          <CartProvider>
            {children}
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
