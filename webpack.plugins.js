const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin")
const path = require('path')

module.exports = [
  new ForkTsCheckerWebpackPlugin(),

];
