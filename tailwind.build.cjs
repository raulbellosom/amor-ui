module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("./tailwind-preset.cjs")],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
};
