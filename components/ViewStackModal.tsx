'use client'

import React from 'react'
import { MerchantProductOffer } from '../lib/scraper/productSearch'
import { TagIcon, CouponIcon, GiftCardIcon, BankIcon, CashbackIcon, BoxIcon, SparkleIcon } from './icons'

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

  // Build savings layers from the enriched offer data
  const layers = [
    {
      label: 'Store Listed Price',
      value: offer.currentPrice,
      type: 'BASE' as const,
      description: `Live price on ${offer.merchantName}`,
    },
    ...(offer.mrp > offer.currentPrice ? [{
      label: `Store Discount on ${offer.merchantName}`,
      value: -(offer.mrp - offer.currentPrice),
      type: 'DISCOUNT' as const,
      description: `${offer.discountPct}% off MRP applied by store`,
    }] : []),
    ...(offer.couponDiscount > 0 ? [{
      label: `Coupon: ${offer.couponCode}`,
      value: -offer.couponDiscount,
      type: 'COUPON' as const,
      description: offer.savingsBreakdown?.isVaultCoupon
        ? 'Your personal Vault coupon — highest priority'
        : 'Best public promo code applied (CouponDuniya / Merchant)',
    }] : []),
    ...(offer.giftCardDiscount > 0 ? [{
      label: `Gift Card: ${offer.giftCardSource}`,
      value: -offer.giftCardDiscount,
      type: 'GIFTCARD' as const,
      description: `Discounted gift card via ${offer.giftCardSource} (better than available coupons)`,
    }] : []),
    ...(offer.bankOfferDiscount > 0 ? [{
      label: offer.savingsBreakdown?.bankOfferSource || 'Bank / UPI Offer',
      value: -offer.bankOfferDiscount,
      type: 'BANK' as const,
      description: offer.bankOfferDescription || 'Instant bank discount applied on post-coupon price',
    }] : []),
    ...(offer.cashbackAmount > 0 ? [{
      label: `Cashback via ${offer.cashbackSource || 'CashKaro'}`,
      value: -offer.cashbackAmount,
      type: 'CASHBACK' as const,
      description: `${offer.savingsBreakdown?.cashbackPct || ''}% affiliate cashback on amount paid (credited within 60 days)`,
    }] : []),
  ]

  const handleShopNow = () => {
    if (offer.productUrl) {
      window.open(offer.productUrl, '_blank')
    }
  }

  const layerConfig: Record<string, { color: string; icon: React.ReactNode; bg: string }> = {
    BASE:      { color: 'text-slate-300',  bg: 'bg-slate-800/40',      icon: <TagIcon size={14} className="text-slate-400" /> },
    DISCOUNT:  { color: 'text-emerald-400',bg: 'bg-emerald-950/30',    icon: <SparkleIcon size={14} className="text-emerald-400" /> },
    COUPON:    { color: 'text-amber-400',  bg: 'bg-amber-950/30',      icon: <CouponIcon size={14} className="text-amber-400" /> },
    GIFTCARD:  { color: 'text-purple-400', bg: 'bg-purple-950/30',     icon: <GiftCardIcon size={14} className="text-purple-400" /> },
    BANK:      { color: 'text-blue-400',   bg: 'bg-blue-950/30',       icon: <BankIcon size={14} className="text-blue-400" /> },
    CASHBACK:  { color: 'text-emerald-400',bg: 'bg-emerald-950/30',    icon: <CashbackIcon size={14} className="text-emerald-400" /> },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white text-sm font-bold transition-colors"
        >
          ✕
        </button>

        {/* Product Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-4">
            {productImage ? (
              <img
                src={productImage}
                alt={productTitle}
                className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-700 flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <BoxIcon size={28} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-100 truncate">{productTitle}</h3>
              <p className="text-sm text-slate-400 mt-0.5">via {offer.merchantName}</p>
              {totalSaved > 0 && (
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                  <SparkleIcon size={10} /> Total saving: ₹{totalSaved.toLocaleString('en-IN')} ({savingsPct}% OFF)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step-by-Step Savings Breakdown */}
        <div className="p-6 space-y-2.5 overflow-y-auto flex-1">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Complete Savings Stack
          </h4>

          {layers.map((layer, idx) => {
            const cfg = layerConfig[layer.type]
            return (
              <div key={idx} className={`flex items-start justify-between p-3 ${cfg.bg} border border-slate-800/80 rounded-xl`}>
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className="mt-0.5 flex-shrink-0">{cfg.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 block">{layer.label}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{layer.description}</span>
                  </div>
                </div>
                <span className={`text-sm font-mono font-bold whitespace-nowrap ml-3 ${layer.type === 'BASE' ? 'text-slate-300' : cfg.color}`}>
                  {layer.type === 'BASE' ? '₹' + Math.abs(layer.value).toLocaleString('en-IN') : '− ₹' + Math.abs(layer.value).toLocaleString('en-IN')}
                </span>
              </div>
            )
          })}

          {/* Divider */}
          <div className="border-t border-dashed border-slate-700 my-3" />

          {/* Net Payable */}
          <div className="flex items-center justify-between p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl">
            <div>
              <span className="text-[11px] text-emerald-400 uppercase font-bold block">Net Final Payable</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                You save ₹{totalSaved.toLocaleString('en-IN')} ({savingsPct}% OFF)
              </span>
            </div>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">₹{offer.netFinalPayable.toLocaleString('en-IN')}</span>
          </div>

          {/* Affiliate Disclosure */}
          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
            Affiliate Disclosure: We may earn a commission when you shop via our links at no extra cost to you. Savings calculated on best-effort basis.
          </p>
        </div>

        {/* CTA */}
        <div className="p-6 pt-0 flex-shrink-0">
          <button
            onClick={handleShopNow}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-sm transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
          >
            <SparkleIcon size={16} /> Activate Deal &amp; Shop on {offer.merchantName} ↗
          </button>
        </div>
      </div>
    </div>
  )
}
