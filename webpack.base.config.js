var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var Config = require('webpack-config').default; // must be imported with .default in ES5 code: https://github.com/mdreizin/webpack-config/issues/29#issuecomment-236699084
var HtmlWebpackPlugin = require('html-webpack-plugin');
var VersionFile = require('webpack-version-file-plugin');
var short = require('git-rev-sync').short();

module.exports = new Config().merge({
  entry: ['babel-polyfill', path.resolve(__dirname, 'app/index.js')],
  mode: "production",
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: "treesradio.js"
  },
  optimization: {
	  splitChunks: {
		  chunks: 'all'
	  }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use:[
	   "style-loader",
	   "css-loader",
	   "sass-loader"
	   ]
      },
      {
        test: /\.css$/,
        loader: "css-loader"
      },
      {
        test: /\.less$/, 
	loader: "less-loader"
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
      src: path.join(__dirname, 'app'),
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
    }),
    new VersionFile({
      packageFile: path.join(__dirname, 'package.json'),
      outputFile: path.join(__dirname, 'app/version.json'),
      templateString: `{"version": {"name": "<%= package.name %>", "buildDate": "<%= currentTime %>", "version": "<%= package.version %>", "short": "${short}"}}`
    })
  ]
})
