const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env) => {
  const isProduction = env.production;
  const mode = isProduction ? 'production' : 'development';

  console.log('------------------------');
  console.log(`Started ${mode} build...`);
  console.log('------------------------');

  return {
    mode,
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
    },
    ...(isProduction ? {} : { devtool: 'inline-source-map' }),
    module: {
      rules: [
        {
          test: /\.js$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ],
    },
    devServer: {
      open: true,
      port: 3000,
      publicPath: '/',
      contentBase: './demo',
    },
    plugins: [new CleanWebpackPlugin()],
  };
};
