'use client'

import React, { useState, useRef } from 'react'
import { CameraIcon, EditIcon, CheckIcon, RefreshIcon } from './icons'

interface OCRUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ParsedCouponData {
  merchantBrand: string
  promoCode: string
  discountValue: string | number
  discountType: string
  minimumCartValue: number
  expiryDate: string
  couponSource: string
  confidence: number
  termsAndConditions?: string[]
}

/** Convert a File to base64 string (raw, no data: prefix) */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
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
  const [parseStage, setParseStage] = useState<'READING' | 'UPLOADING' | 'ANALYZING' | 'DONE' | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedCoupon, setParsedCoupon] = useState<ParsedCouponData | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Form State (populated by AI or entered manually)
  const [couponCode, setCouponCode] = useState('')
  const [storeName, setStoreName] = useState('')
  const [discountVal, setDiscountVal] = useState('')
  const [discountType, setDiscountType] = useState('')
  const [minCartVal, setMinCartVal] = useState('')
  const [expiryVal, setExpiryVal] = useState('')
  const [originApp, setOriginApp] = useState('')

  if (!isOpen) return null

  const resetForm = () => {
    setSelectedFile(null)
    setParsedCoupon(null)
    setParseError(null)
    setParseStage(null)
    setCouponCode('')
    setStoreName('')
    setDiscountVal('')
    setDiscountType('')
    setMinCartVal('')
    setExpiryVal('')
    setOriginApp('')
  }

  const handleFileChange = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setParseError('Please upload an image file (PNG, JPG, WEBP).')
      return
    }

    setSelectedFile(file)
    setParsing(true)
    setParseError(null)
    setParsedCoupon(null)

    try {
      // Stage 1: Read file as base64
      setParseStage('READING')
      const base64Data = await fileToBase64(file)

      // Stage 2: Send to server-side API route (which calls Gemini Vision)
      setParseStage('UPLOADING')
      const response = await fetch('/api/v1/vault/ocr-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          fileName: file.name,
        }),
      })

      // Stage 3: Parse AI response
      setParseStage('ANALYZING')

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Server error ${response.status}`)
      }

      const result = await response.json()
      const data: ParsedCouponData = result.data

      // Stage 4: Populate form fields
      setParseStage('DONE')
      setParsedCoupon(data)
      setCouponCode(data.promoCode || '')
      setStoreName(data.merchantBrand || '')
      setDiscountVal(String(data.discountValue || ''))
      setDiscountType(data.discountType || '')
      setMinCartVal(data.minimumCartValue > 0 ? String(data.minimumCartValue) : '')
      setExpiryVal(data.expiryDate || '')
      setOriginApp(data.couponSource || '')

      if (data.confidence < 0.35) {
        setParseError(
          'Image quality is low — AI extracted partial details. Please review and correct the fields below before saving.'
        )
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[OCR Modal] Error:', msg)
      setParseError(
        `Could not process this image: ${msg}. Try a clearer photo or use the "Enter Manually" tab.`
      )
      setParseStage(null)
    } finally {
      setParsing(false)
    }
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileChange(e.target.files[0])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0])
  }

  const handleNewImage = () => {
    resetForm()
    setTimeout(() => fileInputRef.current?.click(), 100)
  }

  const handleSaveToVault = () => {
    try {
      const isPercentage = discountType === 'percentage' || (discountVal && !isNaN(Number(discountVal)) && Number(discountVal) <= 100 && !discountType)
      const isCustom = discountType === 'custom' || isNaN(Number(discountVal))
      
      let discountLabel = 'Verified Offer'
      if (discountVal) {
        if (isCustom) {
          discountLabel = discountVal
        } else {
          discountLabel = `${discountVal}${isPercentage ? '%' : '₹'} OFF`
        }
      }

      // Convert expiryVal from DD-MM-YYYY → YYYY-MM-DD for consistent date comparison in vault
      let normalizedExpiry = '2026-12-31'
      if (expiryVal) {
        const ddmmyyyy = expiryVal.match(/^(\d{2})-(\d{2})-(\d{4})$/)
        if (ddmmyyyy) {
          normalizedExpiry = `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(expiryVal)) {
          // Already YYYY-MM-DD
          normalizedExpiry = expiryVal
        } else {
          // Try to parse any other format
          const parsed = new Date(expiryVal)
          if (!isNaN(parsed.getTime())) {
            normalizedExpiry = parsed.toISOString().split('T')[0]
          }
        }
      }

      const newCoupon = {
        id: Math.random().toString(36).substring(2, 9),
        code: couponCode ? couponCode.toUpperCase() : 'PROMO',
        store: storeName || 'General Store',
        discount: discountLabel,
        discountValue: isNaN(Number(discountVal)) ? 0 : Number(discountVal),
        minCartValue: Number(minCartVal) || 0,
        originApp: originApp || 'Reward Card',
        source: activeTab === 'UPLOAD' ? 'GEMINI_VISION' : 'USER_MANUAL',
        expires: normalizedExpiry,
        createdAt: new Date().toISOString(),
        termsAndConditions: parsedCoupon?.termsAndConditions || [],
      }

      const existingVault = localStorage.getItem('moneysaver_user_vault')
      const vaultList = existingVault ? JSON.parse(existingVault) : []
      vaultList.unshift(newCoupon)
      localStorage.setItem('moneysaver_user_vault', JSON.stringify(vaultList))
      window.dispatchEvent(new Event('vaultUpdated'))
      onClose()
    } catch (err) {
      console.error('[OCR Modal] Save error:', err)
      alert('Could not save coupon. Please try again.')
    }
  }


  const stageLabels: Record<string, string> = {
    READING:   'Reading image...',
    UPLOADING: 'Sending to Gemini 2.0 Flash Vision...',
    ANALYZING: 'Extracting coupon details...',
    DONE:      'Extraction complete!',
  }

  const stages = ['READING', 'UPLOADING', 'ANALYZING', 'DONE'] as const
  const stageIdx = parseStage ? stages.indexOf(parseStage) : -1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative max-h-[92vh] flex flex-col">

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileInputChange}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white text-sm font-bold transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-6 pb-4 flex-shrink-0">
          <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CameraIcon size={16} />
            </span>
            Add Coupon to Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload a coupon screenshot — Gemini AI will extract all details automatically.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 flex-shrink-0">
          <button
            onClick={() => { setActiveTab('UPLOAD'); resetForm() }}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'UPLOAD'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CameraIcon size={14} /> Gemini Vision AI
          </button>
          <button
            onClick={() => setActiveTab('MANUAL')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'MANUAL'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <EditIcon size={14} /> Enter Manually
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'UPLOAD' ? (
            <>
              {/* ── Drop Zone (no file yet) ── */}
              {!parsedCoupon && !parsing && !parseStage && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/20 bg-slate-950/40'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-emerald-400">
                      <CameraIcon size={32} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Click to upload or drag &amp; drop</p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG, WEBP — coupon screenshots from GPay, PhonePe, Paytm, etc.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-1">
                      {['Swiss Beauty', 'Myntra', 'Nykaa', 'Swiggy', 'Amazon Pay', 'GPay'].map(b => (
                        <span key={b} className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Processing Animation ── */}
              {parsing && (
                <div className="border-2 border-dashed border-emerald-500/40 rounded-2xl p-8 text-center bg-emerald-950/10">
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
                      <p className="text-xs text-slate-500 mt-1">Gemini 2.0 Flash is analysing your coupon image</p>
                    </div>
                    {selectedFile && (
                      <div className="px-3 py-1 bg-emerald-950 border border-emerald-500/40 rounded-full text-xs font-mono text-emerald-300">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                      </div>
                    )}
                    {/* Progress steps */}
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      {stages.map((s, i) => (
                        <React.Fragment key={s}>
                          <span className={
                            stageIdx === i ? 'text-emerald-400 font-bold' :
                            stageIdx > i ? 'text-emerald-600' : 'text-slate-600'
                          }>
                            {s === 'READING' ? 'Read' : s === 'UPLOADING' ? 'Upload' : s === 'ANALYZING' ? 'AI' : 'Done'}
                          </span>
                          {i < stages.length - 1 && <span className="text-slate-700">→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Extracted Results Form ── */}
              {parsedCoupon && !parsing && (
                <div className="space-y-4">
                  {/* File bar */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300 truncate max-w-[220px] flex items-center gap-1.5">
                      <CheckIcon size={12} className="text-emerald-400 flex-shrink-0" />
                      {selectedFile?.name}
                    </span>
                    <button
                      onClick={handleNewImage}
                      className="px-3 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 rounded-lg text-amber-300 font-semibold transition-colors flex items-center gap-1"
                    >
                      <RefreshIcon size={12} /> New Image
                    </button>
                  </div>

                  {/* Low-confidence warning */}
                  {parseError && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300">
                      ⚠️ {parseError}
                    </div>
                  )}

                  {/* Confidence badge */}
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs flex items-center justify-between">
                    <span className="text-emerald-400">
                      Brand: <strong>{parsedCoupon.merchantBrand || '–'}</strong>
                    </span>
                    <span className="text-emerald-400">
                      Source: <strong>{parsedCoupon.couponSource || '–'}</strong>
                    </span>
                    <span className={parsedCoupon.confidence > 0.5 ? 'text-emerald-400' : 'text-amber-400'}>
                      Confidence: <strong>{(parsedCoupon.confidence * 100).toFixed(0)}%</strong>
                    </span>
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400">Brand / Store Name</label>
                      <input
                        value={storeName}
                        onChange={e => setStoreName(e.target.value)}
                        placeholder="e.g. Myntra, Nykaa"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 font-semibold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Promo Code</label>
                      <input
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="e.g. SAVE30"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm font-mono font-bold text-amber-400 mt-1 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">Coupon Source App (GPay, PhonePe, Paytm…)</label>
                    <input
                      value={originApp}
                      onChange={e => setOriginApp(e.target.value)}
                      placeholder="e.g. Google Pay"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-amber-300 font-semibold mt-1 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400">
                        Discount ({discountType === 'flat' ? '₹ Flat' : discountType === 'cashback' ? '% Cashback' : '% or ₹'})
                      </label>
                      <input
                        value={discountVal}
                        onChange={e => setDiscountVal(e.target.value)}
                        placeholder="e.g. 30"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Min Cart Required (₹)</label>
                      <input
                        value={minCartVal}
                        onChange={e => setMinCartVal(e.target.value)}
                        placeholder="e.g. 999 (0 if none)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">Valid Till (DD-MM-YYYY)</label>
                    <input
                      value={expiryVal}
                      onChange={e => setExpiryVal(e.target.value)}
                      placeholder="DD-MM-YYYY"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  
                  {parsedCoupon?.termsAndConditions && parsedCoupon.termsAndConditions.length > 0 && (
                    <div className="relative group mt-2 pt-2 border-t border-slate-800/50">
                      <div className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-emerald-400 transition-colors w-max">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <span className="text-xs font-medium">Terms & Conditions Extracted</span>
                      </div>
                      
                      <div className="absolute bottom-full left-0 mb-2 w-full max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <ul className="list-disc pl-4 space-y-1">
                          {parsedCoupon.termsAndConditions.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error with no parsed data */}
              {parseError && !parsedCoupon && !parsing && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 space-y-2">
                  <p>⚠️ {parseError}</p>
                  <button onClick={handleNewImage} className="text-amber-400 underline">Try another image</button>
                  <span className="text-slate-500 mx-2">or</span>
                  <button onClick={() => setActiveTab('MANUAL')} className="text-emerald-400 underline">enter manually</button>
                </div>
              )}
            </>
          ) : (
            /* ── Manual Tab ── */
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400">Store Name</label>
                <input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="e.g. Myntra, Nykaa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Promo Code</label>
                <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="SAVE30"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm font-mono text-amber-400 mt-1 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Coupon Source App</label>
                <input value={originApp} onChange={e => setOriginApp(e.target.value)} placeholder="e.g. Google Pay, PhonePe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-amber-300 mt-1 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Discount (% or ₹)</label>
                  <input value={discountVal} onChange={e => setDiscountVal(e.target.value)} placeholder="30"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Min Cart (₹)</label>
                  <input value={minCartVal} onChange={e => setMinCartVal(e.target.value)} placeholder="999"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Valid Till (DD-MM-YYYY)</label>
                <input value={expiryVal} onChange={e => setExpiryVal(e.target.value)} placeholder="DD-MM-YYYY"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Save Button */}
        {(parsedCoupon || activeTab === 'MANUAL') && (
          <div className="p-4 border-t border-slate-800 flex-shrink-0">
            <button
              onClick={handleSaveToVault}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
            >
              <CheckIcon size={16} /> Save Coupon to My Vault
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
