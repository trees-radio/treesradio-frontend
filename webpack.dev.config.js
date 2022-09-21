var webpack = require("webpack");

// must be imported with .default in ES5 code: https://github.com/mdreizin/webpack-config/issues/29#issuecomment-236699084
var Config = require("webpack-config").default;

module.exports = new Config().extend("./webpack.base.config.js").merge({
  mode: "development",
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: "all",
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "~",
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("staging"),
      FIREBASE_URL: JSON.stringify("https://treesradio-staging.firebaseio.com"),
      FIREBASE_KEY: JSON.stringify("AIzaSyB_w_sx6mMUQil5nWhn0sd5CjgOtDFGICw"),
      FIREBASE_AUTH: JSON.stringify("treesradio-staging.firebaseapp.com"),
      FIREBASE_BUCKET: JSON.stringify("treesradio-stagin.appspot.com"),
    }),
  ],
});

/*
plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
      FIREBASE_URL: JSON.stringify("https://treesradio-staging.firebaseio.com"),
      FIREBASE_KEY: JSON.stringify("AIzaSyB_w_sx6mMUQil5nWhn0sd5CjgOtDFGICw"),
      FIREBASE_AUTH: JSON.stringify("treesradio-staging.firebaseapp.com"),
      FIREBASE_BUCKET: JSON.stringify("treesradio-staging.appspot.com"),
    }),
  ],
  */
