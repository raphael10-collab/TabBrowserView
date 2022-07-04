const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.ts$/,
  use: [{ loader: 'ts-loader' }],
});


module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: {
    main: './src/main/index.ts'
  },
  // Put your normal webpack config below here
  module: {
    //rules: require('./webpack.rules'),
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
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
