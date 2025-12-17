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
        r7: {
          blue: '#1d4460',
          red: '#cf071d',
          light: '#f2f7f9',
          dark: '#0f2430',
          neon: '#00f0ff',
          purple: '#bc13fe',
          gold: '#ffd700',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
