// tailwind.config.js — digi-gastro (combines all 4 template configs)
// This is the build-time config that replaces the runtime CDN config.
// All custom colors from menu.html, landing.html, login.html are merged here.
// admin.html has no custom config and uses standard Tailwind only.
//
// CRITICAL: Colors that need opacity modifier support (bg-surface/90 etc.)
// are defined using the rgb(var(--xxx-rgb) / <alpha-value>) pattern.
// The -rgb CSS variables are defined in design_system.css and change
// values between dark/light themes.

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan all 4 templates for class names
  content: [
    "./templates/menu.html",
    "./templates/admin.html",
    "./templates/landing.html",
    "./templates/login.html",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Theme-aware colors (support opacity modifiers via -rgb vars) ──
        // Bare class (bg-surface) → alpha=1 → solid color
        // Modified class (bg-surface/90) → alpha=0.9 → 90% opacity
        "on-surface": "rgb(var(--text-on-surface-rgb) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--text-on-surface-variant-rgb) / <alpha-value>)",
        "primary": "rgb(var(--color-primary-rgb) / <alpha-value>)",
        "accent": "rgb(var(--color-accent-gold-rgb) / <alpha-value>)",
        "background": "rgb(var(--bg-obsidian-rgb) / <alpha-value>)",
        "surface": "rgb(var(--bg-surface-rgb) / <alpha-value>)",
        "surface-container-high": "rgb(var(--bg-surface-elevated-rgb) / <alpha-value>)",

        // ── Border colors with default alpha ──
        // The original --border-subtle had built-in alpha (0.05 dark, 0.08 light).
        // We use a function to preserve this default for bare classes,
        // while still allowing /30, /50 etc. modifiers to override.
        "outline-variant": ({ opacityValue }) =>
          `rgb(var(--border-subtle-rgb) / ${opacityValue !== undefined ? opacityValue : 0.05})`,
        "outline-strong": ({ opacityValue }) =>
          `rgb(var(--border-strong-rgb) / ${opacityValue !== undefined ? opacityValue : 0.12})`,

        // ── Static gold palette from landing.html (no theme switching) ──
        "gold": {
          50: "#FDF8E8",
          100: "#FAF0C8",
          200: "#F5E08A",
          300: "#EFD04D",
          400: "#D4B94F",
          500: "#C9A84C",
          600: "#A8872E",
          700: "#866A24",
          800: "#654F1B",
          900: "#433512",
        },
        "charcoal": "#0b0c10",
      },
      // ── Font families (used across templates) ──
      fontFamily: {
        "display": ["Outfit", "Inter", "sans-serif"],
        "sans": ["Inter", "sans-serif"],
      },
      // ── Shadow color (used as shadow-primary/10 etc.) ──
      // Tailwind needs the color registered for shadow-{color} utilities
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
};
