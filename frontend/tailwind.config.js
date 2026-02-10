/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0a',
          card: '#121212',
          cardHover: '#1a1a1a',
          border: '#2a2a2a',
          text: '#e0e0e0',
          textSecondary: '#a0a0a0'
        }
      }
    },
  },
  plugins: [],
}
