/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          50:  '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae2',
          300: '#b0b8c5',
          400: '#838ea2',
          500: '#636e85',
          600: '#4e576c',
          700: '#404758',
          800: '#373c4a',
          900: '#1a1d26',
          950: '#0f1117',
        },
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      boxShadow: {
        'card': '0 1px 2px rgba(15, 17, 23, 0.04), 0 1px 3px rgba(15, 17, 23, 0.06)',
        'card-hover': '0 4px 12px rgba(15, 17, 23, 0.08), 0 2px 4px rgba(15, 17, 23, 0.04)',
        'pop': '0 12px 32px rgba(15, 17, 23, 0.12), 0 4px 8px rgba(15, 17, 23, 0.06)',
      },
      backgroundImage: {
        'grid': "linear-gradient(to right, rgba(15,17,23,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,17,23,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
