const webpack = require('webpack');
const config = require('../webpack/webpack.config.dev');
const webpackDevServer = require('webpack-dev-server');

config.entry.unshift("webpack-dev-server/client?http://localhost:3000/");
const compiler = webpack(config);
const server = webpackDevServer(compiler, config.devServer);
server.listen(3000);