/**
 * lib/data/storeProducts.ts
 * Mock grocery product catalogue for the SuperMart Store page.
 * Moved out of the component so the UI can be swapped for a real API
 * without touching any component logic.
 */
import { Product } from '@/components/CartProvider'

export const STORE_CATEGORIES = ['All', 'Vegetables', 'Dairy', 'Snacks', 'Beverages', 'Grocery'] as const

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'bb_101',
    title: 'Fresho Onion',
    brand: 'Fresho',
    price: 35,
    mrp: 45,
    unit: '1 kg',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80',
  },
  {
    id: 'bb_102',
    title: 'Nandini Good Life Toned Milk',
    brand: 'Nandini',
    price: 27,
    mrp: 29,
    unit: '500 ml',
    category: 'Dairy',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
  },
  {
    id: 'bb_103',
    title: 'Lays Potato Chips - Classic',
    brand: 'Lays',
    price: 20,
    mrp: 20,
    unit: '50 g',
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
  },
  {
    id: 'bb_104',
    title: 'Farmley Premium Cashews',
    brand: 'Farmley',
    price: 249,
    mrp: 399,
    unit: '250 g',
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1536591375315-bbbc246b9a88?w=400&q=80',
  },
  {
    id: 'bb_105',
    title: 'Coca-Cola Original Taste',
    brand: 'Coca-Cola',
    price: 40,
    mrp: 40,
    unit: '750 ml',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80',
  },
  {
    id: 'bb_106',
    title: 'Aashirvaad Whole Wheat Atta',
    brand: 'Aashirvaad',
    price: 215,
    mrp: 250,
    unit: '5 kg',
    category: 'Grocery',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  },
]
