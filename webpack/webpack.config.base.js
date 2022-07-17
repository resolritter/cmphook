const webpack = require("webpack")
const merge = require("lodash").merge
const path = require("path")

function extendConfiguration(otherConfiguration) {
  let config = {
    module: {
      rules: [
        {
          test: /\.js$/,
          loaders: ["babel-loader"],
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      modules: [path.resolve("."), path.resolve("node_modules")],
      extensions: [".js"],
    },
    node: {
      fs: "empty",
    },
  }
  if (otherConfiguration) {
    config = merge(config, otherConfiguration)
  }
  return config
}

module.exports = {
  extendConfiguration,
}
