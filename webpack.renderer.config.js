const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    fallback: {
      fs: false,
      'stream': require.resolve('stream-browserify'),
      'buffer': require.resolve('buffer'),
      'util': require.resolve('util'),
      'assert': require.resolve('assert'),
      'http': require.resolve('stream-http'),
      'url': require.resolve('url'),
      'https': require.resolve('https-browserify'),
      'os': require.resolve('os-browserify'),
      'path': require.resolve('path-browserify')
    },
  },
};
