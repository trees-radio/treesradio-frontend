var webpack = require('webpack');

var Config = require('webpack-config').default;

module.exports = new Config().extend('./webpack.base.config.js').merge({
  // devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ]
});
