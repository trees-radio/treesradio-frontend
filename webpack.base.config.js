var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var Config = require('webpack-config').default;
var HtmlWebpackPlugin = require('html-webpack-plugin');

// console.log("WEBPACK_ENV", process.env);

const acceptedEnv = ["FBASE", "FBASE_API", "NODE_ENV", "API", "API_PROTOCOL"];

function cherrypickEnv(env) {
  var keys = Object.keys(env);
  keys = keys.filter(e => acceptedEnv.includes(e));
  var webpackEnv = {};
  keys.forEach(k => webpackEnv['process.env.'+k] = JSON.stringify(env[k]));
  // console.log("WEBPACK_ENV", webpackEnv, keys, env);
  return webpackEnv;
}


module.exports = new Config().merge({
  entry: path.resolve(__dirname, 'app/index.js'),
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
    ]
  },
  resolve: {
    alias: {
      app: path.join(__dirname, 'app'),
      stores: path.join(__dirname, 'app/stores'),
      components: path.join(__dirname, 'app/components'),
      utils: path.join(__dirname, 'app/utils'),
      libs: path.join(__dirname, 'app/libs'),
      modules: path.join(__dirname, 'node_modules')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: 'jquery',
      "window.jQuery": 'jquery'
    }),
    new ExtractTextPlugin("treesradio.css"),
    new webpack.DefinePlugin(cherrypickEnv(process.env)),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'TreesRadio',
      inject: 'body',
      hash: true,
      favicon: 'src/img/favicon.ico'
    })
  ]
})
