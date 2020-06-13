var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var Config = require("webpack-config").default;
var helpers = require("./helpers");

var config = new Config().extend("./webpack.config.js").merge({
  plugins: [new webpack.DefinePlugin(helpers.getWebpackDefine("development"))],
});

const path = require('path');

var compiler = webpack(config);

var server = new WebpackDevServer(compiler, {
  contentBase: path.join(__dirname, 'public'),
  contentBasePublicPath: path.join(__dirname, 'public'),
  compress: true,
  stats: { colors: true },
  clientLogLevel: 'trace',
  historyApiFallback: true,
});

server.listen(8081, "127.0.0.1");
