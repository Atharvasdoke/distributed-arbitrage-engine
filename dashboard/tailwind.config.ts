import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0f172a",
        slate: "#f7f9fb",
        emerald: "#10b981",
        alert: "#ef4444",
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
export default config;
