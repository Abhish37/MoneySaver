'use client'

import React, { useState, useRef } from 'react'
import { processCouponDocumentUnderstanding, DocumentUnderstandingResult } from '../lib/ocr/parser'
import { CameraIcon, EditIcon, CheckIcon, RefreshIcon } from './icons'

interface OCRUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

/** Convert a File object to a base64 data string (without prefix) */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the data:image/...;base64, prefix — Gemini wants raw base64
      const base64 = result.includes('base64,') ? result.split('base64,')[1] : result
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export default function OCRUploadModal({ isOpen, onClose }: OCRUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'MANUAL'>('UPLOAD')
  const [parsing, setParsing] = useState(false)
  const [parseStage, setParseStage] = useState<'READING' | 'ANALYZING' | 'EXTRACTING' | 'DONE' | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedCoupon, setParsedCoupon] = useState<DocumentUnderstandingResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
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
    setParseError(null)
    setParsedCoupon(null)

    try {
      // Stage 1: Read file as base64
      setParseStage('READING')
      const base64Data = await fileToBase64(file)

      // Stage 2: Send to Gemini Vision API
      setParseStage('ANALYZING')
      const parsedData = await processCouponDocumentUnderstanding(base64Data, file.name)

      // Stage 3: Extract and populate fields
      setParseStage('EXTRACTING')
      await new Promise(r => setTimeout(r, 400)) // short visual delay for UX

      setParsedCoupon(parsedData)
      setCouponCode(parsedData.promoCode || '')
      setStoreName(parsedData.merchantBrand || '')
      setDiscountVal(String(parsedData.discountValue || ''))
      setMinCartVal(String(parsedData.minimumCartValue || ''))
      setExpiryVal(parsedData.expiryDate || '')
      setOriginApp(parsedData.couponSource || '')
      setParseStage('DONE')

      // If confidence is very low, warn the user
      if (parsedData.confidence < 0.3) {
        setParseError('Low confidence extraction — please review and correct the fields below.')
      }

    } catch (err) {
      console.error('OCR Upload Error:', err)
      setParseError('Could not process this image. Please try a clearer photo or enter details manually.')
      setParseStage(null)
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
    setParseError(null)
    setParseStage(null)
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

  // Stage labels for the animated progress indicator
  const stageLabels: Record<string, string> = {
    READING:   'Reading image file...',
    ANALYZING: 'Sending to Gemini Vision AI...',
    EXTRACTING:'Extracting coupon details...',
    DONE:      'Analysis complete!',
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
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white text-sm font-bold transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CameraIcon size={16} />
            </span>
            Add Coupon to Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1">Upload a coupon screenshot — Gemini AI will extract all details automatically.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => {
              setActiveTab('UPLOAD')
              setParsedCoupon(null)
              setSelectedFile(null)
              setParseError(null)
            }}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'UPLOAD'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CameraIcon size={14} />
            Gemini Vision AI
          </button>
          <button
            onClick={() => setActiveTab('MANUAL')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'MANUAL'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <EditIcon size={14} />
            Enter Manually
          </button>
        </div>

        {activeTab === 'UPLOAD' ? (
          <div>
            {!parsedCoupon && !parsing ? (
              /* Drop Zone */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center bg-slate-950/40 cursor-pointer transition-all mb-4 ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/20'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-emerald-400">
                    <CameraIcon size={32} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Click to upload or drag &amp; drop</p>
                    <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, WEBP — coupon screenshots from GPay, PhonePe, Paytm, etc.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-1">
                    {['Swiss Beauty', 'Myntra', 'Nykaa', 'Swiggy', 'Amazon Pay', 'GPay'].map(b => (
                      <span key={b} className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : parsing ? (
              /* AI Processing Animation */
              <div className="border-2 border-dashed border-emerald-500/40 rounded-2xl p-8 text-center bg-emerald-950/10 mb-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center text-emerald-400">
                      <CameraIcon size={20} />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">
                      {parseStage ? stageLabels[parseStage] : 'Processing...'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Gemini 2.0 Flash Vision is analysing your coupon</p>
                  </div>
                  {selectedFile && (
                    <div className="inline-block px-3 py-1 bg-emerald-950 border border-emerald-500/40 rounded-full text-xs font-mono text-emerald-300">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                    </div>
                  )}
                  {/* Progress steps */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    {(['READING', 'ANALYZING', 'EXTRACTING', 'DONE'] as const).map((stage, i) => (
                      <React.Fragment key={stage}>
                        <span className={`px-1.5 py-0.5 rounded ${
                          parseStage === stage ? 'text-emerald-400 font-bold' :
                          ['READING', 'ANALYZING', 'EXTRACTING', 'DONE'].indexOf(parseStage || '') > i
                            ? 'text-emerald-600' : 'text-slate-600'
                        }`}>
                          {stage === 'READING' ? 'Read' : stage === 'ANALYZING' ? 'AI' : stage === 'EXTRACTING' ? 'Extract' : 'Done'}
                        </span>
                        {i < 3 && <span className="text-slate-700">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Parsed Result Form */
              <div className="space-y-4 animate-fade-in">
                {/* File + discard bar */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300 truncate max-w-[200px] flex items-center gap-1.5">
                    <CheckIcon size={12} className="text-emerald-400 flex-shrink-0" />
                    {selectedFile?.name || 'Selected Screenshot'}
                  </span>
                  <button
                    onClick={handleDiscard}
                    className="px-3 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 rounded-lg text-amber-300 font-semibold transition-colors flex items-center gap-1"
                  >
                    <RefreshIcon size={12} /> New Image
                  </button>
                </div>

                {/* Parse error warning */}
                {parseError && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300">
                    ⚠️ {parseError}
                  </div>
                )}

                {/* Confidence + source badge */}
                {parsedCoupon && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-400 flex items-center justify-between">
                    <span>Brand: <strong>{parsedCoupon.merchantBrand || 'Review below'}</strong></span>
                    <span>Source: <strong>{parsedCoupon.couponSource || 'N/A'}</strong></span>
                    <span>Confidence: <strong>{(parsedCoupon.confidence * 100).toFixed(0)}%</strong></span>
                  </div>
                )}

                {/* Extracted Fields Form */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400">Brand / Store Name</label>
                    <input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Swiss Beauty, Myntra"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Promo Code</label>
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. SAVE30"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm font-mono font-bold text-amber-400 mt-1 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Coupon Source App (GPay, PhonePe, Paytm, etc.)</label>
                  <input
                    value={originApp}
                    onChange={(e) => setOriginApp(e.target.value)}
                    placeholder="e.g. Google Pay, Paytm"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-amber-300 font-semibold mt-1 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400">Discount Value (% or ₹)</label>
                    <input
                      value={discountVal}
                      onChange={(e) => setDiscountVal(e.target.value)}
                      placeholder="e.g. 30 (for 30% off)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Min Cart Required (₹)</label>
                    <input
                      value={minCartVal}
                      onChange={(e) => setMinCartVal(e.target.value)}
                      placeholder="e.g. 999 (or 0 if none)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Valid Till (DD-MM-YYYY)</label>
                  <input
                    value={expiryVal}
                    onChange={(e) => setExpiryVal(e.target.value)}
                    placeholder="DD-MM-YYYY"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveToVault}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg shadow-emerald-950 min-h-[44px] flex items-center justify-center gap-2"
                >
                  <CheckIcon size={16} />
                  Save Coupon to My Vault
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Manual Entry Tab */
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">Store Name</label>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Swiss Beauty, Myntra"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Promo Code</label>
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="SAVE30"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 font-mono mt-1 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Original Coupon Source App</label>
              <input
                value={originApp}
                onChange={(e) => setOriginApp(e.target.value)}
                placeholder="e.g. Google Pay, PhonePe"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-amber-300 mt-1 font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Discount Value (% or ₹)</label>
                <input
                  value={discountVal}
                  onChange={(e) => setDiscountVal(e.target.value)}
                  placeholder="30"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Min Cart Required (₹)</label>
                <input
                  value={minCartVal}
                  onChange={(e) => setMinCartVal(e.target.value)}
                  placeholder="999"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Valid Till (DD-MM-YYYY)</label>
              <input
                value={expiryVal}
                onChange={(e) => setExpiryVal(e.target.value)}
                placeholder="DD-MM-YYYY"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSaveToVault}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg shadow-emerald-950 min-h-[44px] flex items-center justify-center gap-2"
            >
              <CheckIcon size={16} />
              Save Manual Coupon
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
