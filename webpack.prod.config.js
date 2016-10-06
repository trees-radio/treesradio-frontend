var webpack = require('webpack');

// must be imported with .default in ES5 code: https://github.com/mdreizin/webpack-config/issues/29#issuecomment-236699084
var Config = require('webpack-config').default;

module.exports = new Config().extend('./webpack.base.config.js').merge({
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.DedupePlugin()
  ]
});
