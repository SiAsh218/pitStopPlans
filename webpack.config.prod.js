const path = require("path");

module.exports = {
  entry: "./frontend/src/js/script.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "./frontend/dist"),
  },
  mode: "production",

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        type: "javascript/auto",
      },
    ],
  },
};
``;
