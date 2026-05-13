/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,css}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          100: '#e0e0f0',
          200: '#c0c0d8',
          300: '#a0a0c0',
          400: '#7070a0',
          500: '#4a4a7a',
          600: '#2a2a4a',
          700: '#1a1a33',
          800: '#131327',
          900: '#0a0a1a',
        },
        gold: {
          400: '#f0c040',
          500: '#e8b422',
          600: '#c89010',
        },
        jade: {
          400: '#22c76a',
          500: '#1ab05e',
        }
      },
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
