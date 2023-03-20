const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  babel: {
    presets: [],
    plugins: [],
  },
  typescript: {
    enableTypeChecking: true,
  },
};
