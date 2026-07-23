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
        brand: {
          oxblood: '#450A0A',
          crimson: '#991B1B',
          emerald: {
            DEFAULT: '#059669',
            dark: '#10B981',
          },
          amber: {
            DEFAULT: '#F59E0B',
            dark: '#FBBF24',
          },
        },
        surface: {
          light: '#FFFFFF',
          dark: '#111827',
          subtle: {
            light: '#F1F5F9',
            dark: '#1E293B',
          },
        },
        borderSubtle: {
          light: '#E2E8F0',
          dark: '#1F2937',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
export default config
