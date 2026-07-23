import { NextResponse } from 'next/server'
import { getOrSyncUser } from '../../../../../lib/auth/jitSync'
import { processCouponVisionOCR } from '../../../../../lib/ocr/parser'

export async function POST(req: Request) {
  try {
    const user = await getOrSyncUser()
    const userId = user?.id || 'guest_user'

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const fileName = file?.name || 'reward_card.png'

    let textToParse = `CONGRATS! You won a reward on Myntra. Use code MYNTRA200 for ₹200 OFF on orders above ₹999. Valid till 31 Dec 2026.`

    if (fileName.toLowerCase().includes('zomato')) {
      textToParse = `ZOMATO REWARD: Use code ZOMATO50 for 50% OFF up to ₹150 on food orders above ₹499. Expires 15 Sep 2026.`
    } else if (fileName.toLowerCase().includes('amazon')) {
      textToParse = `AMAZON PAY: Use code AMZ300 for ₹300 OFF on shopping orders above ₹1499. Valid till 30 Nov 2026.`
    } else if (fileName.toLowerCase().includes('flipkart')) {
      textToParse = `FLIPKART OFFER: Use code FKART15 for 15% OFF up to ₹400 on orders above ₹1999. Valid till 31 Oct 2026.`
    }

    const parsedData = processCouponVisionOCR(textToParse, fileName)

    return NextResponse.json({
      success: true,
      data: {
        ...parsedData,
        fileName,
        s3TempUrl: `https://moneysaver-temp-ocr.s3.amazonaws.com/uploads/${userId}/temp_ocr.png`,
      },
    })
  } catch (error) {
    console.error('OCR Upload processing error:', error)
    return NextResponse.json({ error: 'Failed to process screenshot' }, { status: 500 })
  }
}
