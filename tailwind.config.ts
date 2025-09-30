import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0066FF",
          dark: "#004FCC"
        },
        secondary: {
          DEFAULT: "#FF9F1C",
          dark: "#D67F00"
        }
      }
    }
  },
  plugins: []
};

export default config;
