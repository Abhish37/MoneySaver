import { NextResponse } from 'next/server'

/**
 * POST /api/v1/vault/ocr-upload
 *
 * Accepts: JSON body { imageBase64: string, fileName: string }
 * Calls Gemini Vision API with the real image and returns extracted coupon fields.
 * Runs server-side so GEMINI_API_KEY is never exposed to the client.
 *
 * Model waterfall (tried in order until one succeeds):
 *   gemini-3.5-flash → gemini-2.5-flash → gemini-2.0-flash → gemini-3.5-flash-lite → gemini-2.0-flash-lite
 */

// Models tried in order — verified against this API key's available models list
// Source: GET /v1beta/models confirmed these exist for this key
const GEMINI_MODELS = [
  'gemini-3.5-flash',       // Best: latest flash, confirmed available
  'gemini-2.5-flash',       // Fallback 1: very capable
  'gemini-2.0-flash',       // Fallback 2: stable
  'gemini-3.5-flash-lite',  // Fallback 3: lighter version
  'gemini-2.0-flash-lite',  // Fallback 4: lightest
]

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function callGemini(
  model: string,
  apiKey: string,
  requestBody: string
): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: requestBody,
  })
}

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
      console.error('[OCR Route] Missing GEMINI_API_KEY env variable')
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    // Determine MIME type from filename
    const lower = fileName.toLowerCase()
    const mimeType = lower.endsWith('.png') ? 'image/png'
      : lower.endsWith('.webp') ? 'image/webp'
      : lower.endsWith('.gif') ? 'image/gif'
      : 'image/jpeg'

    const promptText = `You are an expert coupon extraction AI for Indian e-commerce reward screenshots and vouchers.

Your task is to extract EXACTLY these details from the coupon/voucher image:

1. BRAND/STORE: The merchant or store this coupon is FOR (e.g. "Myntra", "Nykaa", "Swiss Beauty", "Swiggy", "Amazon", "Flipkart", "Zomato", "Blinkit", "Zepto", "GIVA"). This is NOT the payment app.
2. DISCOUNT: The savings offered.
   - If there is a flat amount off based on purchase (e.g. "200 off in 1000 price"), return "200" here, and mention "200 off on the purchase of 1000" in termsAndConditions.
   - If it's a specific product/service offer (e.g. "2 month membership worth 398", "Free Pizza"), return the exact text of the offer (e.g. "2 month membership", "Free Pizza") and do NOT return a numeric value here. DO NOT return the "worth" amount. Put the full description in termsAndConditions.
   - Percentage: "20% OFF", "FLAT 30% OFF", "Flat 25% off on all silver jewellery" → return just the number e.g. "25"
   - Flat amount: "₹100 OFF" → return just the number e.g. "100"
3. DISCOUNT TYPE: Return exactly "percentage", "flat", "cashback", or "custom" if it's a product/service offer.
4. MINIMUM CART VALUE: The minimum order value required. Look for "on orders above ₹499", "min order ₹999", "minimum ₹299". Return as number, 0 if none.
5. VALIDITY/EXPIRY DATE: Last date this coupon is valid. Look for "Valid till", "Expires on", "Use by". Format: DD-MM-YYYY. Return empty string if not found. Example: "Valid till 31st July 2026" → "31-07-2026"
6. PROMO CODE: The alphanumeric code user types at checkout (e.g. "Z-7K4X2M9"). REJECT button labels like "CLAIM", "COPY", "SHOP NOW", "TAP TO COPY". Return empty string if no code visible.
7. COUPON SOURCE: The payment app/platform showing this reward (e.g. "Google Pay", "PhonePe", "Paytm", "Amazon Pay", "Cred", "GPay"). Different from the merchant. Return empty string if not identifiable.
8. TERMS AND CONDITIONS: Extract ALL terms and conditions text visible in the image. Include context for discounts (e.g. "200 off on the purchase of 1000" or full description of membership/freebies). Return as array of strings.

RULES:
- ALWAYS extract data from the image, even if partially visible. Do your best.
- If a field is truly not present, return EMPTY STRING "" or 0.
- confidence: 0.0 to 1.0 based on how clearly you can read the image.
- For discountValue return either the NUMBER as a string, or the custom offer string (e.g., "2 month membership").

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

    const requestBody = JSON.stringify({
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.9,
        responseMimeType: 'application/json',
      },
    })

    // Try each model in order until one succeeds
    let lastStatus = 0
    let lastErrText = ''

    for (let modelIdx = 0; modelIdx < GEMINI_MODELS.length; modelIdx++) {
      const model = GEMINI_MODELS[modelIdx]

      // Retry up to 2 times per model on transient errors (503, 429)
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt > 0) {
          await sleep(800 * attempt) // brief back-off before retry
        }

        console.log(`[OCR Route] Trying model: ${model} (attempt ${attempt + 1})`)
        let geminiRes: Response

        try {
          geminiRes = await callGemini(model, apiKey, requestBody)
        } catch (fetchErr) {
          console.error(`[OCR Route] Network error on ${model}:`, fetchErr)
          lastErrText = String(fetchErr)
          break // try next model
        }

        lastStatus = geminiRes.status

        // Success path
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const textContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''

          if (!textContent) {
            console.warn(`[OCR Route] ${model} returned empty content, trying next model`)
            break
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
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              try {
                parsed = JSON.parse(jsonMatch[0])
              } catch {
                console.error('[OCR Route] Failed to parse JSON:', cleanJson.substring(0, 300))
                break
              }
            } else {
              console.warn(`[OCR Route] No JSON in response from ${model}`)
              break
            }
          }

          console.log(`[OCR Route] Success with model: ${model}`)

          return NextResponse.json({
            success: true,
            modelUsed: model,
            data: {
              merchantBrand: String(parsed.merchantBrand || '').trim(),
              promoCode: String(parsed.promoCode || '').trim().toUpperCase(),
              discountValue: parsed.discountValue || '',
              discountType: (['percentage', 'flat', 'cashback', 'custom'].includes(String(parsed.discountType))
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
        }

        // Don't retry on auth errors
        if (geminiRes.status === 400 || geminiRes.status === 401 || geminiRes.status === 403) {
          lastErrText = await geminiRes.text()
          console.error(`[OCR Route] Auth/Bad request error on ${model}:`, geminiRes.status, lastErrText)
          return NextResponse.json(
            { error: `API error ${geminiRes.status}: Check your Gemini API key.` },
            { status: 502 }
          )
        }

        // 404 = wrong model name, move to next model immediately
        if (geminiRes.status === 404) {
          console.warn(`[OCR Route] Model ${model} not found (404), trying next`)
          break
        }

        // 429 or 503 — transient, retry with back-off
        if (geminiRes.status === 429 || geminiRes.status === 503) {
          lastErrText = await geminiRes.text().catch(() => '')
          console.warn(`[OCR Route] ${model} returned ${geminiRes.status} (attempt ${attempt + 1})`)
          // continue to next attempt
        } else {
          lastErrText = await geminiRes.text().catch(() => '')
          console.error(`[OCR Route] ${model} unexpected status ${geminiRes.status}`)
          break // unexpected status, try next model
        }
      }
    }

    // All models exhausted
    console.error('[OCR Route] All Gemini models failed. Last status:', lastStatus)
    return NextResponse.json(
      { error: `Could not reach Gemini Vision API after trying all models (last error: ${lastStatus}). Please try again in a moment.` },
      { status: 502 }
    )

  } catch (error) {
    console.error('[OCR Route] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to process screenshot' }, { status: 500 })
  }
}
