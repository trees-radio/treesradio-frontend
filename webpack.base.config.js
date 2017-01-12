var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var Config = require('webpack-config').default;
var HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = new Config().merge({
  entry: ['babel-polyfill', path.resolve(__dirname, 'app/index.js')],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: "treesradio.js"
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
        loader: ExtractTextPlugin.extract("style", "css!sass")
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style", "css")
      },
      {
        test: /\.less$/, loader: ExtractTextPlugin.extract('style', 'css!less')
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader",
        query: {
          limit: '25000',
          minetype: 'application/font-woff',
          name: 'fonts/[hash].[ext]'
        }
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        query: {
          name: 'fonts/[hash].[ext]'
        }
      },
      {
        test: /\.(mp3|wav|ogg)$/,
        loader: 'file-loader',
        query: {
          name: 'audio/[hash].[ext]'
        }
      },
      {test: /\.json$/, loader: 'json-loader'},
      {
        test: /\.(jpg|png|gif)$/,
        loader: 'url-loader',
        query: {
          limit: '25000',
          name: 'img/[name].[ext]'
        }
      },
    ],
    noParse: [new RegExp('node_modules/localforage/dist/localforage.js')] //silences warning, see https://github.com/localForage/localForage/issues/599
  },
  resolve: {
    alias: {
      app: path.join(__dirname, 'app'),
      stores: path.join(__dirname, 'app/stores'),
      components: path.join(__dirname, 'app/components'),
      utils: path.join(__dirname, 'app/utils'),
      libs: path.join(__dirname, 'app/libs'),
      modules: path.join(__dirname, 'node_modules'),
      img: path.join(__dirname, 'app/img'),
      audio: path.join(__dirname, 'app/audio')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: 'jquery',
      "window.jQuery": 'jquery'
    }),
    new ExtractTextPlugin("treesradio.css"),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: require('html-webpack-template'),
      title: 'TreesRadio',
      inject: false,
      hash: true,
      favicon: 'app/img/favicon.png',
      appMountId: 'app'
    })
  ]
})
