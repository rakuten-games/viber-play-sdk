const path = require('path');
const Dotenv = require('dotenv-webpack');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const resolve = {
  extensions: ['.js', '.ts']
};

const rules = [
  {
    test: /\.(js|ts)$/,
    exclude: /node_modules\//,
    use: [
      'babel-loader'
      // {
      //   loader: 'eslint-loader',
      //   options: {
      //     quiet: true,
      //   },
      // },
    ]
  },
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
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
    libraryTarget: 'umd'
  },
  resolve,
  module: {
    rules
  },
  devtool: IS_PRODUCTION ? 'hidden-source-map' : 'eval-source-map',
  plugins: [new Dotenv()]
});

module.exports = getWebpackConfig;
