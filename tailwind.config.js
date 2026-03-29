/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'engineeringPurple': '#ACACED',
      },
      fontFamily: {
        'engineeringHeader': ['Inter', 'Arial Black', '"Arial Bold"', 'sans-serif'],
        'engineeringMono': ['ui-monospace', 'Menlo', 'Monaco', 'Cascadia Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} 