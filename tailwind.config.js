/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom Nigerian Agritech Colors
        'farm-green': '#166534',
        'farm-orange': '#f97316',
      }
    },
  },
  plugins: [],
}
