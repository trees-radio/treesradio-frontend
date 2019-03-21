

var webpack = require("webpack");
var Config = require('webpack-config').default;
var helpers = require('./helpers');

var config = new Config().extend('./webpack.base.config.js').merge({
  mode: 'production',
  plugins: [
  	new webpack.DefinePlugin({
  	    'process.env.NODE_ENV': JSON.stringify('production')
	})
  ]
});

webpack(config, function(err, stats) {
    if (err) {
      throw err;
    }
    process.exit();
});
