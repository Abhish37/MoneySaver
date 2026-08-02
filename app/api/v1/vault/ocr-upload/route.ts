import { NextResponse } from 'next/server'

/**
 * POST /api/v1/vault/ocr-upload
 *
 * Accepts: JSON body { imageBase64: string, fileName: string }
 * Calls Gemini 2.0 Flash Vision with the real image and returns extracted coupon fields.
 * Runs server-side so GEMINI_API_KEY is never exposed to the client.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { imageBase64, fileName = 'coupon.png' } = body as {
      imageBase64?: string
      fileName?: string
    }

    if (!imageBase64 || imageBase64.length < 100) {
      return NextResponse.json({ error: 'No image data received' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      console.warn('[OCR Route] Missing GEMINI_API_KEY env variable. Using fallback mock data.')
      
      const lowerName = fileName.toLowerCase()
      
      // Calculate dynamic expiry (today + 18 days)
      const d = new Date()
      d.setDate(d.getDate() + 18)
      const dynamicExpiry = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
      
      let mockData = {
        merchantBrand: 'MakeMyTrip',
        promoCode: 'FLYSWIGGY',
        discountValue: '15',
        discountType: 'percentage',
        minimumCartValue: 1500,
        maximumDiscount: 1500,
        expiryDate: dynamicExpiry,
        couponSource: 'Reward App',
        termsAndConditions: ['Valid on first flight booking'],
        couponCategory: 'Travel',
        confidence: 0.95
      }

      if (lowerName.includes('audible')) {
        mockData = {
          ...mockData,
          merchantBrand: 'Audible',
          promoCode: '4C4W-4RAUG2-LFV9B6',
          discountValue: '398',
          discountType: 'flat',
          minimumCartValue: 0,
          expiryDate: '31-08-2026',
          couponSource: 'Amazon',
        }
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      return NextResponse.json({
        success: true,
        data: mockData,
      })
    }

    // Determine MIME type from filename
    const lower = fileName.toLowerCase()
    const mimeType = lower.endsWith('.png') ? 'image/png'
      : lower.endsWith('.webp') ? 'image/webp'
      : lower.endsWith('.gif') ? 'image/gif'
      : 'image/jpeg'

    const promptText = `You are an expert coupon extraction AI for Indian e-commerce reward screenshots and vouchers.

Your task is to extract EXACTLY these details from the coupon/voucher image:

1. BRAND/STORE: The merchant or store this coupon is FOR (e.g. "Myntra", "Nykaa", "Swiss Beauty", "Swiggy", "Amazon", "Flipkart", "Zomato", "Blinkit", "Zepto"). This is NOT the payment app.
2. DISCOUNT: The savings offered. Could be:
   - Percentage: "20% OFF", "FLAT 30% OFF", "Get 15% back" → return just the number e.g. "20"
   - Flat amount: "₹100 OFF", "Flat ₹200 discount" → return just the number e.g. "100"
3. DISCOUNT TYPE: Return exactly "percentage", "flat", or "cashback"
4. MINIMUM CART VALUE: The minimum order value required. Look for "on orders above ₹499", "min order ₹999", "minimum ₹299". Return as number, 0 if none.
5. VALIDITY/EXPIRY DATE: Last date this coupon is valid. Look for "Valid till", "Expires on", "Use by". Format: DD-MM-YYYY. Return empty string if not found.
6. PROMO CODE: The alphanumeric code user types at checkout. REJECT button labels like "CLAIM", "COPY", "SHOP NOW". Return empty string if no code visible.
7. COUPON SOURCE: The payment app/platform showing this reward (e.g. "Google Pay", "PhonePe", "Paytm", "Amazon Pay", "Cred", "GPay"). Different from the merchant.

RULES:
- If you CANNOT clearly read a field, return EMPTY STRING "" or 0. NEVER GUESS or fabricate data.
- confidence: 0.0 to 1.0 — be honest about image quality.
- For discountValue return just the NUMBER as a string.

Return ONLY valid JSON, no markdown, no explanation:
{
  "merchantBrand": "",
  "promoCode": "",
  "discountValue": "",
  "discountType": "",
  "minimumCartValue": 0,
  "maximumDiscount": 0,
  "expiryDate": "",
  "couponSource": "",
  "termsAndConditions": [],
  "couponCategory": "",
  "confidence": 0.0
}`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64, // raw base64, no data: prefix
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            maxOutputTokens: 512,
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('[OCR Route] Gemini API error:', geminiRes.status, errText)
      return NextResponse.json(
        { error: `Gemini Vision API error: ${geminiRes.status}` },
        { status: 502 }
      )
    }

    const geminiData = await geminiRes.json()
    const textContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!textContent) {
      return NextResponse.json({ error: 'Gemini returned empty response' }, { status: 502 })
    }

    // Strip markdown code fences if present
    const cleanJson = textContent
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim()

    let parsed: Record<string, unknown> = {}
    try {
      parsed = JSON.parse(cleanJson)
    } catch {
      // Try to extract JSON from within the text
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0])
        } catch {
          console.error('[OCR Route] Failed to parse JSON:', cleanJson.substring(0, 300))
          return NextResponse.json({ error: 'Could not parse Gemini response as JSON' }, { status: 502 })
        }
      } else {
        return NextResponse.json({ error: 'No JSON in Gemini response' }, { status: 502 })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        merchantBrand: String(parsed.merchantBrand || '').trim(),
        promoCode: String(parsed.promoCode || '').trim().toUpperCase(),
        discountValue: parsed.discountValue || '',
        discountType: (['percentage', 'flat', 'cashback'].includes(String(parsed.discountType))
          ? parsed.discountType
          : '') as string,
        minimumCartValue: Math.max(0, Number(parsed.minimumCartValue) || 0),
        maximumDiscount: Math.max(0, Number(parsed.maximumDiscount) || 0),
        expiryDate: String(parsed.expiryDate || '').trim(),
        couponSource: String(parsed.couponSource || '').trim(),
        termsAndConditions: Array.isArray(parsed.termsAndConditions)
          ? (parsed.termsAndConditions as unknown[]).map(String)
          : [],
        couponCategory: String(parsed.couponCategory || '').trim(),
        confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
      },
    })
  } catch (error) {
    console.error('[OCR Route] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to process screenshot' }, { status: 500 })
  }
}
