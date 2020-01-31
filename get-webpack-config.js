const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const rules = [
  {
    test: /\.(ts|js)$/,
    exclude: /node_modules\//,
    use: [
      'ts-loader'
    ]
  }
];

const getWebpackConfig = () => ({
  mode: IS_PRODUCTION ? 'production' : 'development',
  entry: {
    sdk: path.resolve(__dirname, 'src/index.ts')
  },
  output: {
    path: path.join(__dirname, 'lib'),
    filename: 'bundle.js',
    chunkFilename: IS_PRODUCTION ? '[name].[chunkhash].js' : '[name].chunk.js',
    publicPath: '', // set dynamically at entry point
    library: {
      root: 'ViberPlay',
      amd: 'viber-play-sdk',
      commonjs: 'viber-play-sdk'
    },
    jsonpFunction: 'ViberPlayJsonp',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules
  },
  devtool: IS_PRODUCTION ? 'hidden-source-map' : 'eval-source-map',
  plugins: [
    new Dotenv(),
    new webpack.DefinePlugin({
      'process.env.npm_package_name': JSON.stringify(process.env.npm_package_name),
      'process.env.npm_package_version': JSON.stringify(IS_PRODUCTION ? process.env.npm_package_version : 'next')
    })
  ]
});

module.exports = getWebpackConfig;
