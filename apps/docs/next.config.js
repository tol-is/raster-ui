const withTM = require("next-transpile-modules")([
  "@raster-ui/elements",
  "@raster-ui/fontkit",
]);

module.exports = withTM({
  reactStrictMode: true,
});
