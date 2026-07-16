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
        ink: {
          DEFAULT: "#0B0C0E",
          deep: "#0B0C0E",
          soft: "#16181C",
          muted: "#1B1E22",
          border: "#292C31",
        },
        ivory: {
          DEFAULT: "#F2F0EB",
          soft: "#F7F4EE",
          dim: "#B6B7BA",
          warm: "#FAF8F3",
          muted: "#85888E",
        },
        gold: {
          DEFAULT: "#C7AA70",
          light: "#DFC58F",
          deep: "#A98D58",
          champagne: "#CFC1A5",
          muted: "#A99A7D",
          hover: "#E4CE9F",
        },
        rosegold: {
          DEFAULT: "#B76E79",
          soft: "#C9959E",
        },
        pearl: {
          DEFAULT: "#F0EBE5",
          gray: "#E8E4DF",
        },
        danger: {
          hover: "rgba(220,60,60,0.15)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "var(--font-serif-cn)", "'Noto Serif SC'", "Georgia", "serif"],
        sans: ["var(--font-sans)", "var(--font-sans-cn)", "Inter", "'Noto Sans SC'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #B99B61 0%, #D8BD84 100%)",
        "gold-rose": "linear-gradient(135deg, #D4AF37 0%, #B76E79 55%, #D4AF37 100%)",
        "subtle-radial":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212, 175, 55, 0.08), transparent)",
        "canvas-vignette":
          "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 45%, rgba(0,0,0,0.6) 100%)",
      },
      boxShadow: {
        luxury: "0 20px 64px rgba(0, 0, 0, 0.34)",
        card: "inset 0 2px 12px rgba(0, 0, 0, 0.4)",
        "card-hover": "inset 0 2px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212, 175, 55, 0.08)",
        "gold-glow": "0 0 24px rgba(212, 175, 55, 0.12)",
        "btn-press": "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "fade-up": "fadeUp 0.28s ease-out forwards",
        "fade-in": "fadeIn 0.28s ease-out forwards",
        shimmer: "shimmer 3s ease-in-out infinite",
        "gold-flow": "goldFlow 2s ease-in-out infinite",
        "press": "press 0.15s ease-out",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        goldFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        press: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.97)" },
          "100%": { transform: "scale(1)" },
        },
      },
      transitionDuration: {
        "280": "280ms",
      },
    },
  },
  plugins: [],
};

export default config;
