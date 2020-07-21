const createSharedConfig = require("../shared/createDevWebpackConfig.js").default

const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = createSharedConfig({ projectPath: __dirname, HtmlWebpackPlugin, webpack })
