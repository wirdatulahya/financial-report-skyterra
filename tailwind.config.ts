import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        skyterra: {
          dark: "#090d16",
          navy: "#00284d",
          blue: "#004b87",
          cyan: "#00a3e0",
          accent: "#06b6d4",
          surface: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
