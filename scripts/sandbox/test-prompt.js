const key = process.env.GEMINI_API_KEY || 'YOUR_API_KEY';
const promptText = `You are an expert coupon extraction AI for Indian e-commerce reward screenshots and vouchers.

Your task is to extract EXACTLY these details from the coupon/voucher image:

1. BRAND/STORE: The merchant or store this coupon is FOR (e.g. "Myntra", "Nykaa", "Swiss Beauty", "Swiggy", "Amazon", "Flipkart", "Zomato", "Blinkit", "Zepto"). This is NOT the payment app.
2. DISCOUNT: The savings offered. Could be:
   - Percentage: "20% OFF", "FLAT 30% OFF", "Get 15% back" -> return just the number e.g. "20"
   - Flat amount: "₹100 OFF", "Flat ₹200 discount" -> return just the number e.g. "100"
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
}`;
const imageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1 png

fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' + key, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    contents:[{
      parts:[
        {text: promptText},
        {inline_data: {mime_type: 'image/png', data: imageBase64}}
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 512,
    },
  })
})
.then(r => r.json())
.then(data => {
  const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log("RESPONSE TEXT:");
  console.log(textContent);
})
.catch(console.error);
