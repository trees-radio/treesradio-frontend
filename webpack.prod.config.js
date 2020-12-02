var webpack = require("webpack");

// must be imported with .default in ES5 code: https://github.com/mdreizin/webpack-config/issues/29#issuecomment-236699084
var Config = require("webpack-config").default;

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
      name: false,
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
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      FIREBASE_URL: JSON.stringify("https://treesradio-live.firebaseio.com"),
      FIREBASE_KEY: JSON.stringify("AIzaSyBqtjxpWp17r6wfOTxF4WvzV6_MgRN-zwk"),
      FIREBASE_AUTH: JSON.stringify("treesradio-live.firebaseapp.com"),
      FIREBASE_BUCKET: JSON.stringify("treesradio-live.appspot.com")
    })
  ]
});
