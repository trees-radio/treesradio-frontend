var webpack = require("webpack");

// must be imported with .default in ES5 code: https://github.com/mdreizin/webpack-config/issues/29#issuecomment-236699084
var Config = require("webpack-config").default;

module.exports = new Config().extend("./webpack.base.config.js").merge({
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
      FIREBASE_URL: JSON.stringify("https://treesradio-staging.firebaseio.com"),
      FIREBASE_KEY: JSON.stringify("AIzaSyB_w_sx6mMUQil5nWhn0sd5CjgOtDFGICw"),
      FIREBASE_AUTH: JSON.stringify("treesradio-staging.firebaseapp.com"),
      FIREBASE_BUCKET: JSON.stringify("treesradio-staging.appspot.com")
    })
  ]
});
