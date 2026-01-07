/** @type {import('tailwindcss').Config} */
export default {
  // Explicitly list directories to avoid scanning node_modules
  content: [
    './index.html',
    './*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        paper: '#fcfcfc',
        ink: '#2d2d2d',
      },
      fontFamily: {
        mono: ['"Courier Prime"', '"Courier New"', 'Courier', 'monospace'],
        // We rely on Google Fonts loaded in index.html for handwriting
      }
    },
  },
  plugins: [],
};