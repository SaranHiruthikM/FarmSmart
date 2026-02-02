/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4CAF50",   // Light Green
        secondary: "#EF5350", // Soft Red
        neutral: "#9E9E9E",
      },
    },
  },
  plugins: [],
};
