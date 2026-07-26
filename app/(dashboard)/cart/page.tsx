'use client'

import React from 'react'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal, itemCount } = useCart()

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 font-medium mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link href="/store" className="inline-block px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  // Price Comparison Logic for 3 Mock Platforms
  const platformA_Total = cartTotal + 40 // SuperMart (base + 40 delivery)
  const platformB_Total = cartTotal * 1.05 + 15 // GroceryPlus (5% markup + 15 delivery)
  const platformC_Total = cartTotal * 0.95 + 60 // QuickBite (5% discount + 60 delivery)

  const platforms = [
    { name: 'SuperMart', total: platformA_Total, delivery: 40, offer: 'None', tag: 'Fastest' },
    { name: 'GroceryPlus', total: platformB_Total, delivery: 15, offer: 'Low Delivery', tag: 'Cheapest Delivery' },
    { name: 'QuickBite', total: platformC_Total, delivery: 60, offer: '5% OFF Cart', tag: 'Best Discount' },
  ].sort((a, b) => a.total - b.total)

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900 pt-8">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black tracking-tight">Shopping Cart</h1>
            <span className="text-slate-500 font-bold bg-slate-200 px-3 py-1 rounded-full text-sm">
              {itemCount} Items
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2 sm:p-6 divide-y divide-slate-100">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 py-6 px-2">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 p-2">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.title}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">{item.unit}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-black text-slate-900 text-lg">₹{item.price}</span>
                      {item.mrp > item.price && (
                        <span className="text-sm text-slate-400 line-through font-semibold">₹{item.mrp}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-32">
                    <div className="flex items-center bg-slate-100 rounded-lg h-10 px-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 rounded-md">-</button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 rounded-md">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg" title="Remove">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Price Matrix */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tight">Price Comparison</h2>
          
          <div className="space-y-4">
            {platforms.map((plat, idx) => (
              <div key={plat.name} className={`relative bg-white rounded-3xl p-6 border-2 transition-all ${idx === 0 ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-slate-100 shadow-sm'}`}>
                
                {idx === 0 && (
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                    Best Price
                  </span>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-lg text-slate-800">{plat.name}</h3>
                    <p className="text-xs font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded mt-1">
                      {plat.tag}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">₹{Math.round(plat.total)}</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-500 font-medium">
                  <div className="flex justify-between">
                    <span>Cart Total</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{plat.delivery}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>Platform Offer</span>
                    <span>{plat.offer}</span>
                  </div>
                </div>

                <button className={`w-full mt-6 h-12 rounded-xl font-bold transition-colors ${idx === 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
                  Checkout at {plat.name}
                </button>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
