import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep "ink" navy for chrome (navbar/footer) — reads like a study planner cover
        ink: {
          950: "#0f1631",
          900: "#161f3f",
          800: "#212c56",
        },
        // Warm paper background instead of default white
        paper: "#f7f5f0",
        // Amber "highlighter" accent for interactive/active states
        highlight: {
          400: "#f5b83d",
          500: "#eea60f",
        },
      },
      fontFamily: {
        // System font stacks — no network fetch at build time, and every
        // OS already ships a face that looks good in these roles.
        display: [
          "'Avenir Next'",
          "Poppins",
          "'Segoe UI'",
          "sans-serif",
        ],
        body: [
          "'Inter'",
          "system-ui",
          "-apple-system",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
