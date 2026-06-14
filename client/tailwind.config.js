/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 25px 80px rgba(95, 73, 153, 0.12)",
      },
    },
  },
  plugins: [],
};
