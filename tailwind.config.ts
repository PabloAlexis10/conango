import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        conan: {
          dark: "#6B4423",      // Café oscuro principal
          light: "#A67B5B",     // Café claro secundario / bordes
          warm: "#F5EFEB",      // Fondo cálido suave
          creamy: "#FAF6F0",    // Fondo sutil tarjetas
          orange: "#F59E0B",    // Naranja acento principal
          orangeHover: "#D97706",
          gold: "#FBBF24",      // Dorado medallas
          goldHover: "#F59E0B",
          correctBg: "#DCFCE7",
          correctText: "#15803D",
          incorrectBg: "#FEE2E2",
          incorrectText: "#B91C1C",
        },
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "conan-btn": "0 4px 0 0 #D97706",
        "conan-card": "0 6px 0 0 #E5D5C5, 0 10px 25px -5px rgba(107, 68, 35, 0.1)",
        "conan-pop": "0 4px 0 0 #A67B5B",
      }
    },
  },
  plugins: [],
};
export default config;
