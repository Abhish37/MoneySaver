'use client'

import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

export function CoinStackIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <ellipse cx="12" cy="18" rx="8" ry="3" fill="currentColor" opacity="0.3" />
      <ellipse cx="12" cy="15" rx="8" ry="3" fill="currentColor" opacity="0.5" />
      <ellipse cx="12" cy="12" rx="8" ry="3" fill="currentColor" opacity="0.7" />
      <ellipse cx="12" cy="9" rx="8" ry="3" fill="currentColor" />
      <text x="12" y="10" textAnchor="middle" fontSize="5" fontWeight="bold" fill="white" fontFamily="monospace">₹</text>
    </svg>
  )
}

export function RocketIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2C12 2 7 6 7 13H17C17 6 12 2 12 2Z" fill="currentColor" opacity="0.9" />
      <path d="M9 13H15V16C15 17.1 14.1 18 13 18H11C9.9 18 9 17.1 9 16V13Z" fill="currentColor" opacity="0.7" />
      <path d="M7 13C5.5 13 4.5 14.5 5 16L7 13Z" fill="currentColor" opacity="0.5" />
      <path d="M17 13C18.5 13 19.5 14.5 19 16L17 13Z" fill="currentColor" opacity="0.5" />
      <circle cx="12" cy="9" r="1.5" fill="white" opacity="0.9" />
      <path d="M11 20L12 22L13 20H11Z" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

export function WaveIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 7C7 5.9 7.9 5 9 5C10.1 5 11 5.9 11 7V13C11 14.1 10.1 15 9 15C7.9 15 7 14.1 7 13V7Z" fill="currentColor" />
      <path d="M11 5H13V13C13 14.1 12.1 15 11 15V5Z" fill="currentColor" opacity="0.7" />
      <path d="M13 4C13 2.9 13.9 2 15 2C16.1 2 17 2.9 17 4V13C17 14.1 16.1 15 15 15C13.9 15 13 14.1 13 13V4Z" fill="currentColor" />
      <path d="M6 16C6 16 8 19 12 19C16 19 18 16 18 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function SearchIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21L16.65 16.65" />
    </svg>
  )
}

export function FashionIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8 3L5 8H9V21H15V8H19L16 3C14.5 4.5 12 5 12 5C12 5 9.5 4.5 8 3Z" fill="currentColor" opacity="0.85" />
      <path d="M8 3L5 8H9" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <path d="M16 3L19 8H15" stroke="currentColor" strokeWidth="0.5" fill="none" />
    </svg>
  )
}

export function BeautyIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="9" y="2" width="6" height="3" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="10" y="5" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.7" />
      <path d="M8 7H16L17 20C17 21.1 16.1 22 15 22H9C7.9 22 7 21.1 7 20L8 7Z" fill="currentColor" opacity="0.85" />
      <path d="M8 7H16" stroke="white" strokeWidth="0.5" opacity="0.5" />
      <rect x="10.5" y="10" width="3" height="5" rx="1.5" fill="white" opacity="0.3" />
    </svg>
  )
}

export function HealthIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="10" width="5" height="4" rx="2" fill="currentColor" />
      <rect x="17" y="10" width="5" height="4" rx="2" fill="currentColor" />
      <rect x="7" y="10" width="10" height="4" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="7" y="8" width="3" height="8" rx="1.5" fill="currentColor" opacity="0.9" />
      <rect x="14" y="8" width="3" height="8" rx="1.5" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

export function ElectronicsIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 18V21M15 18V21M6 21H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="6" y="8" width="4" height="4" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="14" y="8" width="4" height="4" rx="1" fill="currentColor" opacity="0.6" />
      <path d="M11 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function GroceryIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 2L4 8H20L18 2H6Z" fill="currentColor" opacity="0.5" />
      <path d="M4 8L5 19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19L20 8H4Z" fill="currentColor" opacity="0.85" />
      <path d="M10 12V16M14 12V16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

export function TravelIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3 17L9 11L13 15L19 8" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <path d="M21 7L21 12L16 12" fill="currentColor" opacity="0.3" />
      <path d="M2 12C2 7.6 5.6 4 10 4C11.5 4 12.9 4.4 14.1 5.1L20 3L17.5 9C18.4 10.1 19 11.5 19 13C19 17.4 15.4 21 11 21C6.6 21 2 17.4 2 12Z" fill="currentColor" opacity="0.15" />
      <path d="M5 11.5L9.5 7L12 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14.5L12.5 10L15.5 13L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CouponIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M2 9V7C2 5.9 2.9 5 4 5H20C21.1 5 22 5.9 22 7V9C20.9 9 20 9.9 20 11C20 12.1 20.9 13 22 13V15C22 16.1 21.1 17 20 17H4C2.9 17 2 16.1 2 15V13C3.1 13 4 12.1 4 11C4 9.9 3.1 9 2 9Z" fill="currentColor" opacity="0.85" />
      <path d="M9 11H15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      <circle cx="8" cy="9" r="1" fill="white" opacity="0.6" />
      <circle cx="8" cy="13" r="1" fill="white" opacity="0.6" />
    </svg>
  )
}

export function GiftCardIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="8" width="20" height="13" rx="2" fill="currentColor" opacity="0.85" />
      <rect x="2" y="5" width="20" height="4" rx="1" fill="currentColor" />
      <path d="M12 5V21" stroke="white" strokeWidth="1.5" opacity="0.5" />
      <path d="M12 5C12 5 10 3 8.5 4C7 5 8 7 9.5 7C10.7 7 12 5 12 5Z" fill="white" opacity="0.7" />
      <path d="M12 5C12 5 14 3 15.5 4C17 5 16 7 14.5 7C13.3 7 12 5 12 5Z" fill="white" opacity="0.7" />
    </svg>
  )
}

export function BankIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M2 10L12 3L22 10H2Z" fill="currentColor" opacity="0.85" />
      <rect x="4" y="10" width="3" height="8" fill="currentColor" opacity="0.7" />
      <rect x="10.5" y="10" width="3" height="8" fill="currentColor" opacity="0.7" />
      <rect x="17" y="10" width="3" height="8" fill="currentColor" opacity="0.7" />
      <rect x="2" y="18" width="20" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

export function CashbackIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M20 8C20 8 17 5 12 5C7 5 4 8 4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 16C4 16 7 19 12 19C17 19 20 16 20 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 8L2 10L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12L22 14L20 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.7" />
      <text x="12" y="13.5" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="white" fontFamily="monospace">₹</text>
    </svg>
  )
}

export function BellIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2C12 2 8 5 8 12V16H16V12C16 5 12 2 12 2Z" fill="currentColor" opacity="0.85" />
      <path d="M6 16H18L19 18H5L6 16Z" fill="currentColor" />
      <path d="M10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18H10Z" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

export function BoxIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3L3 7V17L12 21L21 17V7L12 3Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 3L12 21" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 7L12 11L21 7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 5L16.5 9" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

export function TagIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2H7C4.8 2 3 3.8 3 6V12C3 13.1 3.4 14.1 4.1 14.8L12 22.7C13.6 24.3 16.1 24.3 17.7 22.7L22.7 17.7C24.3 16.1 24.3 13.6 22.7 12L14.8 4.1C14.1 3.4 13.1 3 12 2Z" fill="currentColor" opacity="0.85" />
      <circle cx="8" cy="8" r="1.5" fill="white" opacity="0.9" />
    </svg>
  )
}

export function StarIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2L14.4 9.3H22L16 13.7L18.4 21L12 16.6L5.6 21L8 13.7L2 9.3H9.6L12 2Z" />
    </svg>
  )
}

export function FireIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2C12 2 8 7 8 12C8 12 10 11 11 9C11 9 9 15 12 18C12 18 11 16 12 15C12 15 14 17 14 19C15.5 17.5 16 15 16 13C16 13 17 14 17 16C18 14 17 10 14 8C14 8 15 5 12 2Z" fill="currentColor" opacity="0.9" />
      <path d="M12 15C12 15 10.5 16.5 11 18C10 17.5 9 15.5 10 13C10 13 11 14 12 15Z" fill="currentColor" />
    </svg>
  )
}

export function ClockIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7V12L15 15" />
    </svg>
  )
}

export function SendIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  )
}

export function CheckIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 6L9 17L4 12" />
    </svg>
  )
}

export function TrophyIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 3H17V12C17 14.8 14.8 17 12 17C9.2 17 7 14.8 7 12V3Z" fill="currentColor" opacity="0.85" />
      <path d="M5 5H7V10C5.9 10 5 9.1 5 8V5Z" fill="currentColor" opacity="0.5" />
      <path d="M17 5H19V8C19 9.1 18.1 10 17 10V5Z" fill="currentColor" opacity="0.5" />
      <rect x="9" y="17" width="6" height="2" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="7" y="19" width="10" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

export function ShareIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5L15.4 17.5M15.4 6.5L8.6 10.5" />
    </svg>
  )
}

export function InfoIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8V8.5M12 11V16" />
    </svg>
  )
}

export function CameraIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 3L7 5H3C2.4 5 2 5.4 2 6V19C2 19.6 2.4 20 3 20H21C21.6 20 22 19.6 22 19V6C22 5.4 21.6 5 21 5H17L15 3H9Z" fill="currentColor" opacity="0.85" />
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
      <circle cx="12" cy="12" r="2" fill="white" opacity="0.4" />
    </svg>
  )
}

export function EditIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M11 4H4C3.4 4 3 4.4 3 5V20C3 20.6 3.4 21 4 21H19C19.6 21 20 20.6 20 20V13" />
      <path d="M18.5 2.5C19.3 1.7 20.7 1.7 21.5 2.5C22.3 3.3 22.3 4.7 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" />
    </svg>
  )
}

export function RefreshIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 2V8H15" />
      <path d="M3 12C3 7 7 3 12 3C15 3 17.7 4.4 19.5 6.5L21 8" />
      <path d="M3 22V16H9" />
      <path d="M21 12C21 17 17 21 12 21C9 21 6.3 19.6 4.5 17.5L3 16" />
    </svg>
  )
}

export function SparkleIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" opacity="0.9" />
      <path d="M5 3L5.8 5.2L8 6L5.8 6.8L5 9L4.2 6.8L2 6L4.2 5.2L5 3Z" opacity="0.6" />
      <path d="M19 15L19.5 16.5L21 17L19.5 17.5L19 19L18.5 17.5L17 17L18.5 16.5L19 15Z" opacity="0.6" />
    </svg>
  )
}

// Category icon mapping helper
export function getCategoryIcon(category: string, className = '', size = 18) {
  const cat = category.toLowerCase()
  if (cat.includes('fashion') || cat.includes('apparel')) return <FashionIcon className={className} size={size} />
  if (cat.includes('beauty') || cat.includes('skincare') || cat.includes('makeup')) return <BeautyIcon className={className} size={size} />
  if (cat.includes('health') || cat.includes('wellness') || cat.includes('fitness')) return <HealthIcon className={className} size={size} />
  if (cat.includes('electronics') || cat.includes('laptop') || cat.includes('mobile') || cat.includes('phone')) return <ElectronicsIcon className={className} size={size} />
  if (cat.includes('food') || cat.includes('grocery') || cat.includes('deliver')) return <GroceryIcon className={className} size={size} />
  if (cat.includes('travel') || cat.includes('hotel') || cat.includes('flight')) return <TravelIcon className={className} size={size} />
  return <StarIcon className={className} size={size} />
}
