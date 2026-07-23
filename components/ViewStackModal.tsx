'use client'

import React from 'react'
import { MerchantProductOffer } from '../lib/scraper/productSearch'

interface ViewStackModalProps {
  isOpen: boolean
  onClose: () => void
  productTitle: string
  productImage: string
  offer: MerchantProductOffer
}

export default function ViewStackModal({ isOpen, onClose, productTitle, productImage, offer }: ViewStackModalProps) {
  if (!isOpen) return null

  const totalSaved = (offer.mrp - offer.netFinalPayable)
  const savingsPct = ((totalSaved / offer.mrp) * 100).toFixed(1)

  const layers = [
    {
      label: 'Base MRP',
      value: offer.mrp,
      type: 'BASE' as const,
      description: 'Maximum Retail Price listed by manufacturer',
    },
    {
      label: 'Selling Price on ' + offer.merchantName,
      value: -(offer.mrp - offer.currentPrice),
      type: 'DISCOUNT' as const,
      description: offer.discountPct + '% store discount applied',
    },
    ...(offer.couponDiscount > 0 ? [{
      label: 'Coupon: ' + offer.couponCode,
      value: -offer.couponDiscount,
      type: 'COUPON' as const,
      description: 'Best coupon applied (Vault / Merchant / CouponDuniya)',
    }] : []),
    ...(offer.giftCardDiscount > 0 ? [{
      label: 'Gift Card: ' + offer.giftCardSource,
      value: -offer.giftCardDiscount,
      type: 'GIFTCARD' as const,
      description: 'Discounted gift card purchased from ' + offer.giftCardSource,
    }] : []),
    ...(offer.bankOfferDiscount > 0 ? [{
      label: 'Bank Offer',
      value: -offer.bankOfferDiscount,
      type: 'BANK' as const,
      description: offer.bankOfferDescription || 'Verified bank instant discount',
    }] : []),
    ...(offer.cashbackAmount > 0 ? [{
      label: 'Cashback: ' + offer.cashbackSource,
      value: -offer.cashbackAmount,
      type: 'CASHBACK' as const,
      description: 'Affiliate cashback tracked via partner link',
    }] : []),
  ]

  const handleShopNow = () => {
    if (offer.productUrl) {
      window.open(offer.productUrl, '_blank')
    }
  }

  const layerColors: Record<string, string> = {
    BASE: 'text-slate-300',
    DISCOUNT: 'text-emerald-400',
    COUPON: 'text-amber-400',
    GIFTCARD: 'text-purple-400',
    BANK: 'text-blue-400',
    CASHBACK: 'text-emerald-400',
  }

  const layerIcons: Record<string, string> = {
    BASE: '🏷️',
    DISCOUNT: '💰',
    COUPON: '🎟️',
    GIFTCARD: '🎁',
    BANK: '💳',
    CASHBACK: '🔄',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white text-sm font-bold transition-colors"
        >
          ✕
        </button>

        {/* Product Header */}
        <div className="p-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            {productImage ? (
              <img
                src={productImage}
                alt={productTitle}
                className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-700"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">📦</div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-100 truncate">{productTitle}</h3>
              <p className="text-sm text-slate-400 mt-0.5">via {offer.merchantName}</p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Savings Breakdown */}
        <div className="p-6 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Complete Savings Breakdown</h4>

          {layers.map((layer, idx) => (
            <div key={idx} className="flex items-start justify-between p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <span className="text-base mt-0.5">{layerIcons[layer.type]}</span>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-200 block">{layer.label}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{layer.description}</span>
                </div>
              </div>
              <span className={`text-sm font-mono font-bold whitespace-nowrap ml-3 ${layer.type === 'BASE' ? 'text-slate-300' : layerColors[layer.type]}`}>
                {layer.type === 'BASE' ? '₹' + layer.value : '- ₹' + Math.abs(layer.value)}
              </span>
            </div>
          ))}

          {/* Divider */}
          <div className="border-t border-dashed border-slate-700 my-2" />

          {/* Net Payable */}
          <div className="flex items-center justify-between p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl">
            <div>
              <span className="text-[11px] text-emerald-400 uppercase font-bold block">Net Final Payable</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">You save ₹{totalSaved} ({savingsPct}% OFF)</span>
            </div>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">₹{offer.netFinalPayable}</span>
          </div>

          {/* Affiliate Disclosure */}
          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
            📢 Affiliate Disclosure: We may earn a commission when you shop via our links at no extra cost to you. Savings are calculated on a best-effort basis.
          </p>
        </div>

        {/* CTA */}
        <div className="p-6 pt-0">
          <button
            onClick={handleShopNow}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-sm transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
          >
            Activate Deal & Shop on {offer.merchantName} ↗
          </button>
        </div>
      </div>
    </div>
  )
}
