/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'r7-navy': '#1B365D',      // Horizon Blue
        'r7-blue': '#1B365D',      // Alias for navy (used throughout app)
        'r7-dark': '#0F1E38',      // Darker navy for hover states
        'r7-red': '#E31837',       // Launch Red
        'r7-red-dark': '#8A0000',  // After Burn
        'r7-teal': '#A2C1C1',      // Sports Drink
        'r7-gray-light': '#F1F5F9', // Light Gray
        'r7-light': '#E8EDF3'      // Very light blue-gray for hover states
      }
    }
  },
  plugins: [],
}
