/** Preset AMOR UI (mínimo, ampliable para apps consumidoras) */
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        xl: "var(--amor-radius)",
      },
      fontFamily: {
        sans: "var(--amor-font-sans)",
      },
      colors: {
        brand: "hsl(var(--amor-brand) / <alpha-value>)",
        surface: "hsl(var(--amor-surface) / <alpha-value>)",
        "surface-elevated": "hsl(var(--amor-surface-elevated) / <alpha-value>)",
        muted: "hsl(var(--amor-muted) / <alpha-value>)",
        "muted-foreground": "hsl(var(--amor-muted-foreground) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
