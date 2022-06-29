const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');

const webpack = require('webpack');
const objectHash = require('object-hash');

const IS_DEV = process.env.NODE_ENV !== 'production';
const NGINX_ENABLED = process.env.NGINX_ENABLED === 'true';
const ENV_PREFIX = 'REACT_APP_';
const ALLOWED_ENVS = new Set(['NODE_ENV', 'DEBUG']);
const BUILD_ROOT = path.resolve(__dirname, '../build');
const ASSETS_ROOT = path.resolve('public');
const IS_STYLEGUIDE = !!process.env['IS_STYLEGUIDE'];
const IS_FAST_REFRESH = IS_DEV;
const TEST_APP_TITLE = 'TestAPP';

const INJECT_ENVS = (() => {
  const envs = process.env;
  const result = { NODE_ENV: process.env.NODE_ENV || 'development' };

  for (const key in envs) {
    if (ALLOWED_ENVS.has(key) || key.startsWith(ENV_PREFIX)) {
      result[key] = envs[key];
    }
  }
  return result;
})();

const processPart = IS_STYLEGUIDE
  ? {
      process: JSON.stringify({
        env: { ...INJECT_ENVS, STYLEGUIDIST_ENV: IS_DEV ? 'development' : 'production' },
      }),
    }
  : { 'process.env': JSON.stringify(INJECT_ENVS) };

const getHash = () => {
  return `${objectHash(processPart)}`;
};

const commonPlugins = [
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: IS_DEV ? '[name].css' : '[name].[contenthash].css',
    chunkFilename: IS_DEV ? '[id].css' : '[id].[contenthash].css',
  }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // TODO: Configure this for CDN if needed.
    PUBLIC_URL: '/',
    TEST_APP_TITLE: JSON.stringify(TEST_APP_TITLE),
    ...processPart,
  }),
].concat(
  NGINX_ENABLED
    ? [
        // add react-devtools support for mobile
        new HtmlWebpackTagsPlugin({
          tags: ['mobile-react-devtools.js', 'mobile-react-devtools.client.js'],
          append: false,
        }),
      ]
    : [],
);

const commonWebpackConfig = {
  mode: IS_DEV ? 'development' : 'production',
  /**
   * browserslist returns some kind of optimized mode that does not work with any HMR solution.
   * The trick si to use it only in production.
   */
  target: IS_DEV ? 'web' : 'browserslist',
  devtool: IS_DEV || process.env.GENERATE_SOURCEMAP === 'true' ? 'source-map' : 'nosources-source-map',
  cache: IS_STYLEGUIDE
    ? {
        // styleguide has broken cache busting mechanism so requires manually
        // removing content. Rather than require this we simply use in memory
        // cache so it will refresh when restarting.
        type: 'memory',
      }
    : {
        type: 'filesystem',
        cacheLocation: path.resolve(__dirname, '../node_modules/.webpack_cache'),
        version: getHash(),
      },
  devServer:
    IS_DEV && !IS_STYLEGUIDE
      ? {
          host: '0.0.0.0',
          port: 3000,
          historyApiFallback: true,
          static: {
            directory: BUILD_ROOT,
          },
          client: {
            logging: 'verbose',
            overlay: true,
            progress: true,
            webSocketURL: 'auto://0.0.0.0/ws',
          },
          allowedHosts: ['.myapp.app', 'localhost'],
          hot: true,
        }
      : { hot: true, host: '0.0.0.0', port: 6060, historyApiFallback: true },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  resolve: {
    // XXX: Temporary workaround until third party libraries update their extensions in modules.
    extensions: ['*', '.mjs', '.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      path: require.resolve('path-browserify'),
      domain: false,
      crypto: false,
      stream: require.resolve('stream-browserify'),
      vm: false,
      os: false,
      fs: false,
    },
  },

  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(ts|tsx|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { cacheDirectory: true },
      },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        loader: '@svgr/webpack',
        options: {
          svgo: false,
          memo: true,
        },
      },
      {
        test: /\.url\.svg$/,
        exclude: /node_modules/,
        loader: 'file-loader',
      },
      {
        test: /\.css$/i,
        use: [IS_DEV ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|mp3|wav)$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
};

module.exports = {
  commonWebpackConfig,
  commonPlugins,
  getHash,
  ASSETS_ROOT,
  BUILD_ROOT,
  IS_STYLEGUIDE,
  IS_DEV,
  IS_FAST_REFRESH,
  ALLOWED_ENVS,
  INJECT_ENVS,
  TEST_APP_TITLE,
  NGINX_ENABLED,
};
