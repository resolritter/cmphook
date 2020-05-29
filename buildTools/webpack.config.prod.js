const webpack = require("webpack")
const path = require("path")
const UglifyPlugin = require("uglifyjs-webpack-plugin")

const _ = require("lodash")
const { name } = require(path.resolve(__dirname, "../package.json"))
const base = require("./webpack.config.base")

const configuration = base.extendConfiguration({
  entry: {
    index: path.resolve("src/hooks.js"),
  },
  devtool: "hidden-source-map",
  mode: "production",
  output: {
    path: path.resolve("dist"),
    filename: "[name].js",
    library: name,
    libraryTarget: "umd",
    umdNamedDefine: true,
    globalObject: '(typeof global!=="undefined"?global:window)',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyPlugin({
        uglifyOptions: {
          compress: true,
          mangle: true,
          output: {
            comments: false,
          },
        },
        sourceMap: false,
      }),
    ],
  },
  plugins: [new webpack.HashedModuleIdsPlugin()],
})

module.exports = configuration
