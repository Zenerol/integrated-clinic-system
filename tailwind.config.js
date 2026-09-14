/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        clinic: {
          teal: '#0d9488',
          cyan: '#0891b2',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#dc2626',
          purple: '#7e22ce',
          slate: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Figtree', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
