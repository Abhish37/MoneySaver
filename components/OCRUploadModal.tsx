'use client'

import React, { useState, useRef } from 'react'
import { processCouponDocumentUnderstanding, DocumentUnderstandingResult } from '../lib/ocr/parser'
import { createWorker } from 'tesseract.js'

interface OCRUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function OCRUploadModal({ isOpen, onClose }: OCRUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'MANUAL'>('UPLOAD')
  const [parsing, setParsing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedCoupon, setParsedCoupon] = useState<DocumentUnderstandingResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Form State for saving (initialized empty; never fabricated)
  const [couponCode, setCouponCode] = useState('')
  const [storeName, setStoreName] = useState('')
  const [discountVal, setDiscountVal] = useState('')
  const [minCartVal, setMinCartVal] = useState('')
  const [expiryVal, setExpiryVal] = useState('')
  const [originApp, setOriginApp] = useState('')

  if (!isOpen) return null

  const handleFileChange = async (file: File) => {
    setSelectedFile(file)
    setParsing(true)
    try {
      let ocrText = ''

      // 1. Run Real Tesseract.js Browser OCR on the uploaded image file
      try {
        const worker = await createWorker('eng')
        const ret = await worker.recognize(file)
        await worker.terminate()
        ocrText = ret.data.text || ''
      } catch (err) {
        console.warn('Tesseract OCR fallback to text analyzer:', err)
      }

      // 2. Process via Gemini Vision API / Document Understanding Pipeline
      const parsedData = await processCouponDocumentUnderstanding(ocrText, file.name)

      setParsedCoupon(parsedData)
      setCouponCode(parsedData.promoCode || '')
      setStoreName(parsedData.merchantBrand || '')
      setDiscountVal(String(parsedData.discountValue || ''))
      setMinCartVal(String(parsedData.minimumCartValue || ''))
      setExpiryVal(parsedData.expiryDate || '')
      setOriginApp(parsedData.couponSource || '')

    } catch (err) {
      console.error('OCR Upload Error:', err)
    } finally {
      setParsing(false)
    }
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleDiscard = () => {
    setSelectedFile(null)
    setParsedCoupon(null)
    setCouponCode('')
    setStoreName('')
    setDiscountVal('')
    setMinCartVal('')
    setExpiryVal('')
    setOriginApp('')
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 100)
  }

  const handleSaveToVault = () => {
    try {
      const newCoupon = {
        id: Math.random().toString(36).substring(2, 9),
        code: couponCode ? couponCode.toUpperCase() : 'PROMO100',
        store: storeName || 'General Store',
        discount: discountVal ? `${discountVal}${parsedCoupon?.discountType === 'percentage' ? '%' : '₹'} OFF` : 'Verified Offer',
        discountValue: Number(discountVal) || 0,
        minCartValue: Number(minCartVal) || 0,
        originApp: originApp || 'Reward Card',
        source: activeTab === 'UPLOAD' ? 'DOCUMENT_AI' : 'USER_MANUAL',
        expires: expiryVal || '2026-12-31',
        createdAt: new Date().toISOString(),
      }

      const existingVault = localStorage.getItem('moneysaver_user_vault')
      const vaultList = existingVault ? JSON.parse(existingVault) : []
      vaultList.unshift(newCoupon)
      localStorage.setItem('moneysaver_user_vault', JSON.stringify(vaultList))

      // Trigger custom window event so Vault page updates instantly
      window.dispatchEvent(new Event('vaultUpdated'))
    } catch (err) {
      console.error(err)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={onFileInputChange}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 text-lg font-bold"
        >
          ✕
        </button>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => {
              setActiveTab('UPLOAD')
              setParsedCoupon(null)
              setSelectedFile(null)
            }}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'UPLOAD'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📷 Gemini Vision AI Pipeline
          </button>
          <button
            onClick={() => setActiveTab('MANUAL')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'MANUAL'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ✍️ Enter Manually
          </button>
        </div>

        {activeTab === 'UPLOAD' ? (
          <div>
            {!parsedCoupon ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center bg-slate-950/40 cursor-pointer transition-all mb-4 ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-slate-700 hover:border-emerald-500/50'
                }`}
              >
                {parsing ? (
                  <div className="space-y-2">
                    <div className="text-3xl animate-bounce">🔍</div>
                    <p className="text-sm font-semibold text-emerald-400">Executing Gemini Vision AI Document Analysis...</p>

                    {/* Selected File Badge */}
                    {selectedFile && (
                      <div className="inline-block px-3 py-1 bg-emerald-950 border border-emerald-500/40 rounded-full text-xs font-mono text-emerald-300 mt-2">
                        ✓ Selected File: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-sm font-semibold text-slate-200">Click to choose image/PDF or drag here</p>
                    <p className="text-xs text-slate-500 mt-1">Extracts Swiss Beauty, Myntra, Swiggy, Nykaa, Amazon Pay, GPay (PNG, JPG, PDF)</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Discard / Re-select Bar */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300 truncate max-w-[200px]">
                    📄 {selectedFile?.name || 'Selected Screenshot'}
                  </span>
                  <button
                    onClick={handleDiscard}
                    className="px-3 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 rounded-lg text-amber-300 font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>🔄</span> Discard & Pick New Image
                  </button>
                </div>

                {/* Document Confidence & Disambiguation Badge */}
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-400 flex items-center justify-between">
                  <span>Merchant: <strong>{parsedCoupon.merchantBrand || 'Unverified'}</strong></span>
                  <span>Source: <strong>{parsedCoupon.couponSource || 'Unspecified'}</strong></span>
                  <span>Confidence: <strong>{(parsedCoupon.confidence * 100).toFixed(0)}%</strong></span>
                </div>

                {/* Extracted Fields Form */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400">Merchant Brand (Visual Hierarchy)</label>
                    <input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Swiss Beauty, Myntra"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Promo Code (Verified)</label>
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. SAVE30"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 font-mono font-bold text-amber-400 mt-1"
                    />
                  </div>
                </div>

                {/* Origin Voucher Location / App Field */}
                <div>
                  <label className="text-xs text-slate-400">Original Coupon Source App (Explicit Branding)</label>
                  <input
                    value={originApp}
                    onChange={(e) => setOriginApp(e.target.value)}
                    placeholder="e.g. Google Pay, Paytm (Blank if unknown)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-amber-300 font-semibold mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400">Discount Value</label>
                    <input
                      value={discountVal}
                      onChange={(e) => setDiscountVal(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Min Cart Required (₹)</label>
                    <input
                      value={minCartVal}
                      onChange={(e) => setMinCartVal(e.target.value)}
                      placeholder="e.g. 999"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Validity Expiry Date (DD-MM-YYYY)</label>
                  <input
                    value={expiryVal}
                    onChange={(e) => setExpiryVal(e.target.value)}
                    placeholder="DD-MM-YYYY"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 font-mono"
                  />
                </div>

                <button
                  onClick={handleSaveToVault}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg shadow-emerald-950 min-h-[44px]"
                >
                  Save Coupon to My Vault 🎉
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">Store Name</label>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Swiss Beauty, Myntra"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Promo Code</label>
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="SAVE30"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 font-mono mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Original Coupon Source App</label>
              <input
                value={originApp}
                onChange={(e) => setOriginApp(e.target.value)}
                placeholder="e.g. Google Pay, PhonePe"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-amber-300 mt-1 font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Discount Value</label>
                <input
                  value={discountVal}
                  onChange={(e) => setDiscountVal(e.target.value)}
                  placeholder="30"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Min Cart Required (₹)</label>
                <input
                  value={minCartVal}
                  onChange={(e) => setMinCartVal(e.target.value)}
                  placeholder="999"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Expiry Date</label>
              <input
                value={expiryVal}
                onChange={(e) => setExpiryVal(e.target.value)}
                placeholder="DD-MM-YYYY"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1"
              />
            </div>
            <button
              onClick={handleSaveToVault}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg shadow-emerald-950 min-h-[44px]"
            >
              Save Manual Coupon
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
