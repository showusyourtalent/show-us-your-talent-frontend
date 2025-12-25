/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gold': {
          50: '#fff9e6',
          100: '#ffedb3',
          200: '#ffe180',
          300: '#ffd54d',
          400: '#ffc91a',
          500: '#e6b800', // Or principal
          600: '#b38f00',
          700: '#806600',
          800: '#4d3d00',
          900: '#1a1400',
        },
        'dark-red': {
          50: '#fde8e8',
          100: '#f9bfbf',
          200: '#f59696',
          300: '#f16d6d',
          400: '#ed4444',
          500: '#c53030', // Rouge foncé principal
          600: '#9b2424',
          700: '#711818',
          800: '#470c0c',
          900: '#1d0000',
        },
        'custom': {
          'gold': '#e6b800',
          'dark-red': '#8B0000',
          'white': '#ffffff',
          'black': '#000000',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #e6b800 0%, #ffd700 100%)',
        'gradient-dark': 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
      }
    },
  },
  plugins: [],
}