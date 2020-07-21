const path = require("path")

module.exports = {
  default: function ({ projectPath, HtmlWebpackPlugin, webpack }) {
    return {
      entry: {
        app: [path.join(projectPath, "./src/index.js")],
      },
      devtool: "inline-source-map",
      devServer: {
        host: "localhost",
        port: "3000",
        clientLogLevel: "none",
        open: true,
        stats: "errors-only",
        historyApiFallback: true,
        hot: true,
      },
      plugins: [
        new HtmlWebpackPlugin({
          inject: true,
          template: path.join(__dirname, "index.html"),
        }),
        new webpack.HotModuleReplacementPlugin(),
      ],
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            use: [
              {
                loader: "babel-loader",
              },
            ],
            exclude: /node_modules/,
          },
        ],
      },
      resolve: {
        extensions: [".js", ".jsx"],
        alias: {
          src: path.resolve(projectPath, "src"),
        },
      },
    }
  },
}
