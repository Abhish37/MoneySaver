import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { CartProvider } from '@/components/CartProvider'
import './globals.css'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'MoneySaver (SaverStack) — Maximize Your Online Savings',
  description: 'Stack coupons, bank offers, affiliate cashbacks, and discounted gift vouchers in one click.',
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
      <html lang="en" className={`${sans.variable} ${mono.variable}`}>
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
      <html lang="en" className={`${sans.variable} ${mono.variable}`}>
        <body className="antialiased min-h-screen flex flex-col">
          <CartProvider>
            {children}
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
