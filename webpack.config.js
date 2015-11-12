var webpack = require("webpack");
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, './app/Main.js'),
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
        //loader: 'style!css!sass'
        loader: ExtractTextPlugin.extract("style", "css!sass")
      },
      {
        test: /\.png$/,
        loader: 'file'
      },
      {
        test: /\.jpg$/,
        loader: 'file'
      }
    ]
  },
  plugins: [
        new ExtractTextPlugin("app.css")
    ]
};
