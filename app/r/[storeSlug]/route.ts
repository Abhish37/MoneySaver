import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { storeSlug: string } }
) {
  const { storeSlug } = params

  const merchantUrls: Record<string, string> = {
    myntra: 'https://www.myntra.com?utm_source=moneysaver',
    amazon: 'https://www.amazon.in?utm_source=moneysaver',
    flipkart: 'https://www.flipkart.com?utm_source=moneysaver',
    zomato: 'https://www.zomato.com?utm_source=moneysaver',
  }

  const redirectUrl = merchantUrls[storeSlug] || 'https://www.myntra.com'

  return NextResponse.redirect(redirectUrl, { status: 307 })
}
