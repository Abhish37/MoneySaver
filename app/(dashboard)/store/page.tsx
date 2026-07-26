'use client'

import React, { useState } from 'react'
import { useCart, Product } from '@/components/CartProvider'

// MOCK API DATA
const MOCK_PRODUCTS: Product[] = [
  { id: 'bb_101', title: 'Fresho Onion', brand: 'Fresho', price: 35, mrp: 45, unit: '1 kg', category: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80' },
  { id: 'bb_102', title: 'Nandini Good Life Toned Milk', brand: 'Nandini', price: 27, mrp: 29, unit: '500 ml', category: 'Dairy', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
  { id: 'bb_103', title: 'Lays Potato Chips - Classic', brand: 'Lays', price: 20, mrp: 20, unit: '50 g', category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80' },
  { id: 'bb_104', title: 'Farmley Premium Cashews', brand: 'Farmley', price: 249, mrp: 399, unit: '250 g', category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1536591375315-bbbc246b9a88?w=400&q=80' },
  { id: 'bb_105', title: 'Coca-Cola Original Taste', brand: 'Coca-Cola', price: 40, mrp: 40, unit: '750 ml', category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80' },
  { id: 'bb_106', title: 'Aashirvaad Whole Wheat Atta', brand: 'Aashirvaad', price: 215, mrp: 250, unit: '5 kg', category: 'Grocery', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
]

const CATEGORIES = ['All', 'Vegetables', 'Dairy', 'Snacks', 'Beverages', 'Grocery']

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const { addToCart, items, updateQuantity } = useCart()

  const filteredProducts = activeCategory === 'All' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Top Hero Banner */}
      <div className="bg-emerald-600 text-white pt-10 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">SuperMart 🏪</h1>
          <p className="text-emerald-100 font-medium text-lg">
            Fresh groceries and daily essentials delivered in minutes.
          </p>
          <div className="relative max-w-xl mx-auto mt-6">
            <input
              type="text"
              placeholder="Search for 'milk', 'bread', 'chips'..."
              className="w-full h-14 pl-6 pr-4 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="max-w-5xl mx-auto px-4 -mt-6">
        <div className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold shadow-md transition-all ${
                activeCategory === cat 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredProducts.map(product => {
            const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100)
            const cartItem = items.find(i => i.id === product.id)
            
            return (
              <div key={product.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col h-full">
                
                {/* Image & Discount Badge */}
                <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10">
                      {discount}% OFF
                    </span>
                  )}
                  <img 
                    src={product.imageUrl} 
                    alt={product.title} 
                    className="object-cover w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{product.brand}</span>
                  <h3 className="font-bold text-slate-800 leading-snug line-clamp-2 flex-1">{product.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{product.unit}</p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span className="font-black text-slate-900">₹{product.price}</span>
                    {product.mrp > product.price && (
                      <span className="text-xs text-slate-400 line-through font-semibold">₹{product.mrp}</span>
                    )}
                  </div>
                </div>

                {/* Add To Cart Controls */}
                <div className="mt-4">
                  {cartItem ? (
                    <div className="flex items-center justify-between bg-emerald-600 text-white rounded-lg h-10 px-2 shadow-md">
                      <button 
                        onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center font-bold hover:bg-emerald-700 rounded-md"
                      >
                        -
                      </button>
                      <span className="font-bold">{cartItem.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        className="w-8 h-full flex items-center justify-center font-bold hover:bg-emerald-700 rounded-md"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full h-10 border border-emerald-600 text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      ADD
                    </button>
                  )}
                </div>
                
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
