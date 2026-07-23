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
 * Gemini 2.0 Flash Vision AI — Zero Fabrication OCR Engine
 * Uses REST API with explicit keyword extraction prompts.
 * NEVER returns hardcoded Myntra fallbacks. Returns empty fields if unreadable.
 */
export async function processCouponVisionOCR(
  imageBufferOrBase64: string,
  fileName: string = 'screenshot.png'
): Promise<ParsedCouponResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (apiKey && imageBufferOrBase64 && imageBufferOrBase64.length > 100) {
    try {
      let base64Data = imageBufferOrBase64
      if (imageBufferOrBase64.includes('base64,')) {
        base64Data = imageBufferOrBase64.split('base64,')[1]
      }

      const mimeType = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

      const promptText = `You are a precision coupon document understanding engine for Indian e-commerce reward screenshots.

IMPORTANT RULES:
1. Scan for these EXACT keywords in the image: "OFF", "COUPON", "CODE", "MINIMUM", "MIN ORDER", "VALID TILL", "EXPIRES", "USE CODE", "FLAT", "UPTO", "GET", "CASHBACK".
2. The Merchant Brand is the store/brand offering the product (e.g. Myntra, Swiss Beauty, FlowerAura, Swiggy). NOT the payment app.
3. The Coupon Source is the app/platform showing this reward (e.g. Google Pay, Amazon Pay, PhonePe, Paytm).
4. The Promo Code is an alphanumeric string the user must type at checkout. REJECT button labels like "DETAILS", "CLAIM", "COPY", "SHOP NOW", "TERMS", "VIEW", "OFFER".
5. Extract the exact Discount Value and whether it is percentage (%) or flat (₹).
6. Extract Minimum Cart Value if mentioned (look for "on orders above", "min order", "minimum purchase").
7. Extract Expiry/Validity Date in DD-MM-YYYY format.
8. Extract any Terms & Conditions text visible.
9. CRITICAL: If you CANNOT confidently identify a field, return it as an EMPTY STRING "". NEVER GUESS. NEVER FABRICATE.
10. Return confidence as a number 0.0 to 1.0 reflecting how clearly the image shows coupon information.

Return ONLY valid JSON:
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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  { inline_data: { mime_type: mimeType, data: base64Data } },
                ],
              },
            ],
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const cleanJson = textContent.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleanJson)

        return {
          merchantBrand: parsed.merchantBrand || '',
          promoCode: parsed.promoCode || '',
          discountValue: parsed.discountValue || '',
          discountType: parsed.discountType || '',
          minimumCartValue: Number(parsed.minimumCartValue) || 0,
          maximumDiscount: Number(parsed.maximumDiscount) || 0,
          expiryDate: parsed.expiryDate || '',
          couponSource: parsed.couponSource || '',
          termsAndConditions: Array.isArray(parsed.termsAndConditions) ? parsed.termsAndConditions : [],
          couponCategory: parsed.couponCategory || '',
          confidence: Number(parsed.confidence) || 0,
        }
      }
    } catch (error) {
      console.warn('Gemini Vision API call failed:', error)
    }
  }

  // ZERO FABRICATION FALLBACK: Return empty fields, never hardcoded data
  return {
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
}

export const processCouponDocumentUnderstanding = processCouponVisionOCR
export const parseRewardScreenshotText = processCouponVisionOCR
