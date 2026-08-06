import type { Config } from "tailwindcss";

/**
 * Palette vernacular: an automation canvas.
 * Surfaces are cool "paper" (the canvas you drop nodes onto), and every accent
 * is a node type — trigger / agent / action / output. Four hues on purpose:
 * a workflow is never one colour, and a single-accent palette is the cliché.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#EDF0F6",
        paper: "#FFFFFF",
        ink: {
          DEFAULT: "#151B26",
          soft: "#3A4454",
          muted: "#67728A",
        },
        line: {
          DEFAULT: "#DDE3EE",
          strong: "#C6CFDF",
        },
        node: {
          trigger: "#E08A17",
          agent: "#6D4AFF",
          action: "#0E9D93",
          output: "#EC5A38",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      fontSize: {
        display: [
          "clamp(2.5rem, 1.4rem + 4.4vw, 4.75rem)",
          { lineHeight: "0.98", letterSpacing: "-0.035em" },
        ],
        section: [
          "clamp(1.75rem, 1.2rem + 2.2vw, 2.75rem)",
          { lineHeight: "1.06", letterSpacing: "-0.025em" },
        ],
      },
      boxShadow: {
        node: "0 1px 0 0 rgba(21,27,38,0.04), 0 8px 24px -12px rgba(21,27,38,0.28)",
        lift: "0 2px 0 0 rgba(21,27,38,0.03), 0 24px 48px -24px rgba(21,27,38,0.35)",
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.7)",
      },
      borderRadius: {
        node: "14px",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        dash: {
          to: { strokeDashoffset: "-24" },
        },
        pulseNode: {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.12)" },
        },
        riseIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        caret: {
          "0%, 45%": { opacity: "1" },
          "50%, 95%": { opacity: "0" },
        },
      },
      animation: {
        marquee: "marquee 42s linear infinite",
        dash: "dash 1.1s linear infinite",
        pulseNode: "pulseNode 2.4s ease-in-out infinite",
        riseIn: "riseIn 0.28s ease-out both",
        caret: "caret 1.1s steps(1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
