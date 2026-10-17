import plugin from "tailwindcss/plugin";

const rtlVariants = plugin(({ addVariant }) => {
  addVariant("rtl", '&:where([dir="rtl"], [dir="rtl"] *)');
  addVariant("ltr", '&:where([dir="ltr"], [dir="ltr"] *)');
});

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edf8ef",
          100: "#d8efdd",
          200: "#b5dfbf",
          300: "#84c795",
          400: "#4da864",
          500: "#2e8a48",
          600: "#206f38",
          700: "#1b5a30",
          800: "#174828",
          900: "#123820",
          950: "#092015",
        },
        gold: {
          50: "#fff8e5",
          100: "#ffedb8",
          200: "#ffdd80",
          300: "#ffc847",
          400: "#f5ad18",
          500: "#d98f0c",
          600: "#ad6a08",
          700: "#874f0c",
          800: "#6f4010",
          900: "#5f3712",
        },
        parchment: {
          50: "#fffdf7",
          100: "#fbfaf6",
          200: "#f4ead8",
          300: "#ead7b8",
          400: "#dcc193",
          500: "#c9a66a",
        },
        ink: {
          900: "#141714",
          950: "#090b0a",
        },

        
        pine: "#174A3A",
        bronze: "#A78343",
        goldlight: "#C9A45C",
        sand: "#F3F0E7",
        cream: "#FAF9F6",
        muted: "#68736F",

        wird: {
          green: "#003325",
          gold: "#C69234",
          "gold-dark": "#785A19",
          mist: "#E6EFE9",
          card: "#FFFFFFF2",
          "gold-soft": "#FDD48766",
        },


      },

      
        
      fontFamily: {
        body: ['"Cairo"', "system-ui", "sans-serif"],
        display: ['"Cairo"', '"Amiri"', "serif"],
        quran: ['"KFGQPC Uthman Taha Naskh"', '"Uthmani"', '"Amiri"', "serif"],
      },
      boxShadow: {
        soft: "0 18px 60px rgba(9, 32, 21, 0.12)",
      },
    },
  },
  plugins: [rtlVariants],
};
