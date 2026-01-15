/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        yy: {
          bg: "rgb(var(--yy-bg))",
          card: "rgb(var(--yy-card))",
          text: "rgb(var(--yy-text))",
          muted: "rgb(var(--yy-muted))",
          green: "rgb(var(--yy-green))",
          yellow: "rgb(var(--yy-yellow))",
          line: "rgb(var(--yy-line))",
        },
      },
    },
  },
  plugins: [],
}

