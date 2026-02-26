import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF6B35',
          'orange-light': '#FF8C5A',
          yellow: '#FFD93D',
          green: '#6BCB77',
          blue: '#4D96FF',
          pink: '#FF6B9D',
          purple: '#C77DFF',
          red: '#E74C3C',
        },
        dark: {
          DEFAULT: '#1A1A2E',
          2: '#16213E',
          3: '#0F172A',
          4: '#0B0F1A',
        },
        surface: {
          DEFAULT: '#FFFEF5',
          light: '#F8F9FF',
        },
      },
      fontFamily: {
        display: ['Fredoka One', 'cursive'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2s infinite',
        'slide-up': 'slideUp 0.6s ease forwards',
        'card-float-1': 'cardFloat1 4s ease-in-out infinite',
        'card-float-2': 'cardFloat2 4.5s ease-in-out infinite',
        'card-float-3': 'cardFloat3 5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-25px) scale(1.05)' },
        },
        pulseDot: {
          '50%': { transform: 'scale(1.5)', opacity: '0.5' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to: { opacity: '1', transform: 'none' },
        },
        cardFloat1: {
          '0%, 100%': { transform: 'rotate(-5deg) translateY(0)' },
          '50%': { transform: 'rotate(-4deg) translateY(-10px)' },
        },
        cardFloat2: {
          '0%, 100%': { transform: 'rotate(3deg) translateY(0)' },
          '50%': { transform: 'rotate(2deg) translateY(-8px)' },
        },
        cardFloat3: {
          '0%, 100%': { transform: 'rotate(-2deg) translateY(0)' },
          '50%': { transform: 'rotate(-1deg) translateY(-12px)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
    },
  },
  plugins: [],
}
export default config
