/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d"
        },
        soil: "#7c4a28",
        cream: "#fffdf5"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.08)",
        card: "0 12px 30px rgba(21, 128, 61, 0.10)"
      },
      backgroundImage: {
        'farm-gradient': 'radial-gradient(circle at top left, rgba(187,247,208,.65), transparent 30%), linear-gradient(135deg, #f7fee7 0%, #fffdf5 48%, #ecfdf5 100%)'
      }
    }
  },
  plugins: []
};
