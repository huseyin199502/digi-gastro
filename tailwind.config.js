/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./templates/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        // admin.html colors
        gastro: '#009900',
        gastro2: '#1f2937',
        
        // landing.html & login.html colors
        charcoal: '#0b0c10',
        
        // menu.html colors (mapped to CSS variables)
        "on-surface": "var(--text-on-surface)",
        "outline-variant": "var(--border-subtle)",
        "primary": "var(--color-primary)",
        "accent": "var(--color-accent-gold)",
        "background": "var(--bg-obsidian)",
        "surface": "var(--bg-surface)",
        "surface-container-high": "var(--bg-surface-elevated)",
        "on-surface-variant": "var(--text-on-surface-variant)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
