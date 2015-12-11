var webpack = require("webpack");
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, './app/index.js'),
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: "app.js"
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
        test: /\.css$/,
        //loader: 'style!css!sass'
        loader: ExtractTextPlugin.extract("style", "css")
      },
      {
        test: /\.png$/,
        loader: 'file'
      },
      {
        test: /\.jpg$/,
        loader: 'file'
      },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
    ]
  },
  plugins: [
        new ExtractTextPlugin("app.css")
    ]
};
