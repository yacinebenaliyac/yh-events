export default {
  content: ["./index.html", "./*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: { 50:"#f3f6f3", 100:"#e0e8e0", 700:"#2d5232", 800:"#234027", 900:"#1a301d" },
        cream: "#f7f4ec",
        gold: "#d4b878",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-20px)" } },
        gradientShift: { "0%,100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        fadeUp: { "0%": { opacity:0, transform:"translateY(20px)" }, "100%": { opacity:1, transform:"translateY(0)" } },
        pulse: { "0%,100%": { opacity:0.3 }, "50%": { opacity:0.7 } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        gradientShift: "gradientShift 12s ease infinite",
        fadeUp: "fadeUp 0.6s ease-out",
        pulse: "pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};