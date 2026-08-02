export interface ParsedCouponResult {
  merchantBrand: string
  promoCode: string
  discountValue: number | string
  discountType: 'percentage' | 'flat' | 'cashback' | ''
  minimumCartValue: number
  maximumDiscount: number
  expiryDate: string
  couponSource: string
  termsAndConditions: string[]
  couponCategory: string
  confidence: number
}

export type DocumentUnderstandingResult = ParsedCouponResult

/**
 * Gemini 2.0 Flash Vision AI — Coupon Extraction Engine
 *
 * Receives base64 image data and extracts:
 * 1. Brand/Store the coupon is for
 * 2. Percentage or flat discount offered
 * 3. Minimum cart value required (if any)
 * 4. Validity / expiry date
 * 5. Promo code (if visible)
 * 6. Source app (GPay, PhonePe, etc.)
 *
 * NEVER fabricates data. Returns empty strings for unreadable fields.
 */
export async function processCouponVisionOCR(
  imageBase64: string,
  fileName: string = 'screenshot.png'
): Promise<ParsedCouponResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const EMPTY_RESULT: ParsedCouponResult = {
    merchantBrand: '',
    promoCode: '',
    discountValue: '',
    discountType: '',
    minimumCartValue: 0,
    maximumDiscount: 0,
    expiryDate: '',
    couponSource: '',
    termsAndConditions: [],
    couponCategory: '',
    confidence: 0,
  }

  if (!apiKey) {
    console.warn('[OCR] No Gemini API key found. Add NEXT_PUBLIC_GEMINI_API_KEY to your .env file.')
    return EMPTY_RESULT
  }

  if (!imageBase64 || imageBase64.length < 100) {
    console.warn('[OCR] Invalid or empty base64 image data received.')
    return EMPTY_RESULT
  }

  // Determine MIME type from filename
  const lower = fileName.toLowerCase()
  const mimeType = lower.endsWith('.png') ? 'image/png'
    : lower.endsWith('.webp') ? 'image/webp'
    : lower.endsWith('.gif') ? 'image/gif'
    : 'image/jpeg'

  const promptText = `You are an expert coupon extraction AI for Indian e-commerce reward screenshots and vouchers.

Your task is to extract EXACTLY these 4 core details from the coupon image:
1. BRAND/STORE: The merchant/store this coupon is FOR (e.g. "Myntra", "Nykaa", "Swiss Beauty", "Swiggy", "Amazon", "Flipkart", "Zomato"). NOT the payment app.
2. DISCOUNT: The savings amount. Could be:
   - Percentage: "20% OFF", "FLAT 30% OFF", "Get 15% back"  
   - Flat amount: "₹100 OFF", "Flat ₹200 discount", "Save ₹50"
3. MINIMUM CART VALUE: The minimum order/cart value required to use this coupon. Look for phrases like "on orders above ₹499", "min order ₹999", "minimum purchase ₹299". Return 0 if no minimum is mentioned.
4. VALIDITY/EXPIRY DATE: The last date this coupon is valid. Look for "Valid till", "Expires on", "Use by", "Offer valid until". Return in DD-MM-YYYY format.

ALSO extract if clearly visible:
5. PROMO CODE: An alphanumeric code the user types at checkout. REJECT button labels like "CLAIM", "COPY", "SHOP NOW", "DETAILS", "VIEW OFFER", "USE".
6. COUPON SOURCE: The payment app or platform showing this reward (e.g. "Google Pay", "PhonePe", "Paytm", "Amazon Pay", "Cred", "MobiKwik"). Different from the merchant brand.

STRICT RULES:
- If you CANNOT clearly read a field, return EMPTY STRING "" or 0. NEVER GUESS or fabricate.
- discountType must be exactly one of: "percentage", "flat", "cashback", or "" (empty if unclear)
- confidence: 0.0 to 1.0. Be honest — blurry/partial images should have 0.2-0.4 confidence
- For discountValue: return just the number (e.g. "20" for 20% or "100" for ₹100 flat)

Return ONLY valid JSON, no markdown, no explanation:
{
  "merchantBrand": "",
  "promoCode": "",
  "discountValue": "",
  "discountType": "percentage | flat | cashback | ''",
  "minimumCartValue": 0,
  "maximumDiscount": 0,
  "expiryDate": "",
  "couponSource": "",
  "termsAndConditions": [],
  "couponCategory": "",
  "confidence": 0.0
}`

  try {
    // Use gemini-2.0-flash for best vision accuracy
    const response = await fetch(
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
                    data: imageBase64,  // Raw base64, no prefix
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,    // Low temperature for precise extraction
            topP: 0.8,
            maxOutputTokens: 512,
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('[OCR] Gemini API error:', response.status, errText)
      return EMPTY_RESULT
    }

    const data = await response.json()
    const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!textContent) {
      console.warn('[OCR] Gemini returned empty response')
      return EMPTY_RESULT
    }

    // Clean up any markdown code fences
    const cleanJson = textContent
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim()

    let parsed: Partial<ParsedCouponResult> = {}
    try {
      parsed = JSON.parse(cleanJson)
    } catch {
      // Try to extract JSON from within the text
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0])
        } catch {
          console.error('[OCR] Failed to parse Gemini JSON response:', cleanJson.substring(0, 200))
          return EMPTY_RESULT
        }
      } else {
        console.error('[OCR] No JSON found in Gemini response:', cleanJson.substring(0, 200))
        return EMPTY_RESULT
      }
    }

    return {
      merchantBrand: String(parsed.merchantBrand || '').trim(),
      promoCode: String(parsed.promoCode || '').trim().toUpperCase(),
      discountValue: parsed.discountValue || '',
      discountType: (['percentage', 'flat', 'cashback'].includes(String(parsed.discountType))
        ? parsed.discountType
        : '') as ParsedCouponResult['discountType'],
      minimumCartValue: Math.max(0, Number(parsed.minimumCartValue) || 0),
      maximumDiscount: Math.max(0, Number(parsed.maximumDiscount) || 0),
      expiryDate: String(parsed.expiryDate || '').trim(),
      couponSource: String(parsed.couponSource || '').trim(),
      termsAndConditions: Array.isArray(parsed.termsAndConditions)
        ? parsed.termsAndConditions.map(String)
        : [],
      couponCategory: String(parsed.couponCategory || '').trim(),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
    }

  } catch (error) {
    console.error('[OCR] Gemini Vision call failed:', error)
    return EMPTY_RESULT
  }
}

export const processCouponDocumentUnderstanding = processCouponVisionOCR
export const parseRewardScreenshotText = processCouponVisionOCR
