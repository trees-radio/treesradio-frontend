var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "./app/index.js"),
  output: {
    path: path.resolve(__dirname, "./public/assets"),
    filename: "app.js",
    sourceMapFilename: "smaps/[file].map"
  },
  devtool: "source-map",
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel",
        query: {
          cacheDirectory: true,
          presets: ["react", "es2015"]
        }
      },
      {
        test: /\.scss$/,
        // loader: 'style!css!sass'
        loader: ExtractTextPlugin.extract("style", "css!sass", {publicPath: "/assets/"})
      },
      {
        test: /\.css$/,
        // loader: 'style!css!sass'
        loader: ExtractTextPlugin.extract("style", "css", {publicPath: "/assets/"})
      },
      {
        test: /\.png$/,
        loader: "file"
      },
      {
        test: /\.jpg$/,
        loader: "file"
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg)(\?\S*)?$/,
        loader: "url?limit=100000&name=[name].[ext]"
      }
    ]
  },
  plugins: [new ExtractTextPlugin("app.css")]
};
