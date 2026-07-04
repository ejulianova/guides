const webpack = require("webpack");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env) => {
  const isProduction = env.production;
  const mode = isProduction ? "production" : "development";

  console.log("------------------------");
  console.log(`Started ${mode} build...`);
  console.log("------------------------");

  // UMD output so the same built file works as `require("guides")` (Node/CJS),
  // `import Guides from "guides"` (bundlers), and a plain `<script>` tag
  // (attaches to the global via the UMD wrapper itself - see globalObject below).
  const umdLibrary = (name) => ({ type: "umd", name, export: "default" });

  return {
    mode,
    entry: isProduction
      ? {
          index: { import: "./src/index.js", library: umdLibrary("Guides") },
          react: { import: "./src/react.js", library: umdLibrary("GuidedTour") },
        }
      : {
          index: "./demo/index.js",
          react: { import: "./src/react.js", library: umdLibrary("GuidedTour") },
        },
    output: {
      path: isProduction
        ? path.resolve(__dirname, "dist")
        : path.resolve(__dirname, "demo/dist"),
      filename: "[name].js",
      // Required for UMD output to resolve "the global object" correctly in
      // both browser (window) and Node (global) environments.
      globalObject: "this",
    },
    ...(isProduction ? { externalsType: "umd" } : {}),
    // Per-module-system names: require("react") for CJS/AMD consumers,
    // but the bare `React`/`ReactDOM` global for plain <script>-tag consumers.
    externals: isProduction
      ? {
          react: { commonjs: "react", commonjs2: "react", amd: "react", root: "React" },
          "react-dom": {
            commonjs: "react-dom",
            commonjs2: "react-dom",
            amd: "react-dom",
            root: "ReactDOM",
          },
        }
      : { react: "React", "react-dom": "ReactDOM" },
    ...(isProduction ? {} : { devtool: "inline-source-map" }),
    module: {
      rules: [
        {
          test: /\.js$/,
          use: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
          use: [
            "style-loader",
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                implementation: require("sass"), // Required for modern Sass API
                api: "modern", // Use the new Sass API
              },
            },
          ],
        },
      ],
    },
    devServer: {
      open: true,
      port: 3000,
      compress: true,
      devMiddleware: {
        writeToDisk: true,
      },
      static: {
        directory: path.join(__dirname, "demo"),
      },
    },
    plugins: [new CleanWebpackPlugin()],
  };
};
