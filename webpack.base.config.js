var webpack = require("webpack");
const Dotenv = require('dotenv-webpack');
var path = require("path");
var Config = require("webpack-config").default; // must be imported with .default in ES5 code: https://github.com/mdreizin/webpack-config/issues/29#issuecomment-236699084
var HtmlWebpackPlugin = require("html-webpack-plugin");
var VersionFile = require("webpack-version-file-plugin");
var short = require("git-rev-sync").short();
var WebpackPwaManifest = require('webpack-pwa-manifest');
const WorkboxPlugin = require('workbox-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const currentTime = new Date().toLocaleString();

module.exports = new Config().merge({
  entry: "./app/index.js",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass")
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"]
      },
      {
        test: /\.(woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 250000
          }
        },
        generator: {
          filename: 'fonts/[hash][ext]'
        }
      },
      {
        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext]'
        }
      },
      {
        test: /\.(mp3|wav|ogg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'audio/[hash][ext]'
        }
      },
      {
        test: /\.(jpg|png|gif|svg|svgz|cur)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      app: path.join(__dirname, "app"),
      src: path.join(__dirname, "app"),
      stores: path.join(__dirname, "app/stores"),
      components: path.join(__dirname, "app/components"),
      utils: path.join(__dirname, "app/utils"),
      libs: path.join(__dirname, "app/libs"),
      modules: path.join(__dirname, "node_modules"),
      img: path.join(__dirname, "app/img"),
      audio: path.join(__dirname, "app/audio")
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      xhtml: true,
      template: require("html-webpack-template"),
      title: "TreesRadio",
      hash: true,
      favicon: "app/img/favicon.png",
      appMountId: "app",
      meta: { "viewport": { name: "viewport", content: "width=device-width, initial-scale=1" } }
    }),
    new WebpackPwaManifest({
      name: 'TreesRadio',
      short_name: 'TR',
      description: 'Toke to great music with fellow ents',
      background_color: '#0a0a0a',
      icons: [
        {
          src: path.resolve('app/img/favicon.png'),
          sizes: [96, 128, 192, 256, 384, 512, 1024]
        }
      ]
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
    new VersionFile({
      packageFile: path.join(__dirname, "package.json"),
      outputFile: path.join(__dirname, "app/version.json"),
      templateString: `{"version": {"name": "<%= package.name %>", "buildDate": "${currentTime}", "version": "<%= package.version %>", "short": "${short}"}}`
    }),
    new Dotenv({
      path: `./.env.${process.env.NODE_ENV}`,
      safe: true,
    })
  ]
});