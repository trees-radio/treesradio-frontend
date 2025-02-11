var webpack = require("webpack");
var Config = require("webpack-config").default;
var helpers = require("./helpers");

module.exports = new Config().extend("./webpack.base.config.js").merge({
  mode: "production",
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: "async",
      minSize: 30000,
      maxSize: 600000,
      minChunks: 2,
      maxAsyncRequests: 10,
      maxInitialRequests: 6,
      automaticNameDelimiter: "~",
      name: "treesradio",
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin(helpers.getWebpackDefine("production"))
  ]
});
