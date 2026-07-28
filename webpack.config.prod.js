const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./frontend/src/js/script.js",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "./frontend/dist"),
  },

  mode: "development",

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.js$/,
        type: "javascript/auto",
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "styles.css",
    }),
  ],
};
