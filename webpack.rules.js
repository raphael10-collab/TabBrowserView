module.exports = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules\/.+\.node$/,
    use: 'node-loader',
  },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.ts$/,
    //include: /src/,
    use: [{ loader: 'ts-loader' }]
  },
  {
    test: /\.tsx?$/,
    //include: /src/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  },
  { // https://babeljs.io/setup#installation
    test: /\.jsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    }
  },
  {
    test: /\.pcss$/,
    type: 'asset',
    use: {
      loader: 'postcss-loader',
      options: {
        plugins: [
          "postcss-preset-env",
        ],
      },
    },
  },
  {
    test: /\.css$/i,
    type: 'asset', // https://github.com/webpack-contrib/postcss-loader/issues/580#issuecomment-1130126061
    use: ["style-loader", "css-loader"],
    generator: {
      outputPath: '.webpack/assets/css/'
    },
  }
];
