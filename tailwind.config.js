/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#4FD1C5",
          DEFAULT: "#38B2AC",
          dark: "#319795",
        },
        secondary: {
          light: "#F6AD55",
          DEFAULT: "#ED8936",
          dark: "#DD6B20",
        },
        accent: {
          red: "#E53E3E",
          green: "#48BB78",
        },
        dark: {
          DEFAULT: "#2D3748",
          muted: "#718096",
        },
      },
      fontFamily: {
        sans: ['"Poppins"', ...defaultTheme.fontFamily.sans],
        heading: ['"Montserrat"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
