export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      colors: {
        night: {
          950: '#080613',
          900: '#0d0a1e',
          800: '#121029',
          700: '#1a1830',
          600: '#242240',
          500: '#302e52',
          400: '#3f3d66',
        },
        lavender: {
          100: '#ede9ff',
          200: '#d5cffb',
          300: '#b9b0f6',
          400: '#9b90ea',
          500: '#7d70db',
          600: '#6055c2',
        },
        rose: {
          grief: '#f0a8c0',
        }
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
