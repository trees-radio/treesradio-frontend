var webpack = require("webpack");
var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './app/components/Main.js'),
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
      {
        test: /\.scss$/,
        loader: 'style!css!sass'
      },
      {
        test: /\.png$/,
        loader: 'url?limit=25000'
      },
      {
        test: /\.jpg$/,
        loader: 'file'
      }
    ]
  },

};
