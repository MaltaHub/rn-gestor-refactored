/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#0f172a",
        surface: "#121c32",
        accent: {
          100: "#1d4ed8",
          200: "#2563eb",
        },
      },
      boxShadow: {
        card: "0 20px 30px -15px rgba(15, 23, 42, 0.4)",
      },
    },
  },
  plugins: [],
};
