import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Professional Fintech Palette ────────────────────────────────
        pro: {
          // Backgrounds
          app:     '#0E1018',
          surface: '#161B22',
          subtle:  '#1C2128',
          raised:  '#21262D',
          // Borders
          border:  '#30363D',
          'border-subtle': '#21262D',
          'border-strong': '#484F58',
          // Text
          text:    '#B7BCC8',
          muted:   '#8E95A3',
          faint:   '#484F58',
        },

        // ── Brand: Deep Forest Green ─────────────────────────────────────
        brand: {
          // Forest green (authoritative, not neon)
          forest:  '#1A4731',
          green:   '#238636',
          'green-light': '#2DA44E',
          // Warm Gold / Harvest (wealth, premium fintech)
          gold:    '#C9A227',
          'gold-light': '#E3B341',
          'gold-dark':  '#9E7C0A',
          // Kept for backward compat (actual old values remapped)
          emerald: {
            DEFAULT: '#2DA44E',
            dark:    '#3FB950',
          },
          amber: {
            DEFAULT: '#C9A227',
            dark:    '#E3B341',
          },
          oxblood: '#7D0000',
          crimson: '#DA3633',
        },

        // ── Status colors ───────────────────────────────────────────────
        status: {
          success: '#3FB950',
          danger:  '#DA3633',
          warning: '#D29922',
          info:    '#388BFD',
        },

        // ── Surface (legacy aliases) ─────────────────────────────────────
        surface: {
          light: '#161B22',
          dark:  '#161B22',
          subtle: {
            light: '#1C2128',
            dark:  '#1C2128',
          },
        },
        borderSubtle: {
          light: '#30363D',
          dark:  '#30363D',
        },
      },

      fontFamily: {
        sans:    ['Inter', 'Outfit', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },

      borderRadius: {
        sm:  '6px',
        DEFAULT: '8px',
        md:  '8px',
        lg:  '10px',
        xl:  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },

      boxShadow: {
        'pro-sm': '0 1px 3px rgba(0,0,0,0.4)',
        'pro':    '0 2px 8px rgba(0,0,0,0.5)',
        'pro-lg': '0 4px 20px rgba(0,0,0,0.6)',
        'pro-xl': '0 8px 32px rgba(0,0,0,0.7)',
        'green-glow': '0 2px 12px rgba(35, 134, 54, 0.25)',
        'gold-glow':  '0 2px 12px rgba(201, 162, 39, 0.2)',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },

      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
