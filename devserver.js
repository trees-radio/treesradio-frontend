var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var Config = require("webpack-config").default;
var helpers = require("./helpers");

var config = new Config().extend("./webpack.config.js").merge({
  plugins: [new webpack.DefinePlugin(helpers.getWebpackDefine("development"))],
});

var compiler = webpack(config);

var server = new WebpackDevServer({
  compress: true,
  historyApiFallback: true,
  port: 8081,
}, compiler);

server.start();
