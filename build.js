

var webpack = require("webpack");
var Config = require('webpack-config').default;
var helpers = require('./helpers');

var config = new Config().extend('./webpack.base.config.js').merge({
  plugins: [
    new webpack.DefinePlugin(helpers.getWebpackDefine('production'))
  ]
});

webpack(config, function(err, stats) {
    if (err) {
      throw err;
    }
    process.exit();
});
