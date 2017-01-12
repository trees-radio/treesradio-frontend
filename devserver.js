var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var Config = require('webpack-config').default;
var helpers = require('./helpers');

var config = new Config().extend('./webpack.base.config.js').merge({
  plugins: [
    new webpack.DefinePlugin(helpers.getWebpackDefine('development'))
  ]
});

config.entry.unshift("webpack-dev-server/client?http://localhost:8080/"); //required for dev server

var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {contentBase: "public"});

server.listen(8080,'127.0.0.1');
