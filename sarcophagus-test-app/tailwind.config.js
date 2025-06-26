/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-900': '#0f1419',
        'dark-800': '#1a1f2e',
        'dark-700': '#2d3748',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 