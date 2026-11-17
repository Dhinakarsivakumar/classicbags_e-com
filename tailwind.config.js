/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf7ee',
          100: '#f4ebd4',
          200: '#ebd8ab',
          300: '#dec07a',
          400: '#d1a74d',
          500: '#b88931',
          600: '#9d6d27',
          700: '#7e5222',
          800: '#674221',
          900: '#55371f',
          950: '#301c0e',
        },
        kraft: {
          light: '#f2e8dc',
          DEFAULT: '#c9a87c',
          dark: '#8b693e'
        }
      },
      aspectRatio: {
        '4/5': '4 / 5',
        '9/16': '9 / 16',
      }
    },
  },
  plugins: [],
}
