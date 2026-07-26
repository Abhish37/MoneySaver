'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Product {
  id: string
  title: string
  brand: string
  price: number
  mrp: number
  unit: string
  imageUrl: string
  category: string
}

export interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem('moneysaver_cart')
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load cart from storage', error)
    }
  }, [])

  // Save to local storage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('moneysaver_cart', JSON.stringify(items))
    }
  }, [items, mounted])

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ))
  }

  const clearCart = () => setItems([])

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
