var webpack = require("webpack");
var Config = require("webpack-config").default;
var helpers = require("./helpers");

module.exports = new Config().extend("./webpack.base.config.js").merge({
  mode: "development",
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      maxSize: 600000,  // Added maxSize to match prod config
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "~",
      name: "treesradio",
      cacheGroups: {
        defaultVendors: {  // Changed to defaultVendors to match webpack 5
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
    new webpack.DefinePlugin(helpers.getWebpackDefine("development"))
  ]
});