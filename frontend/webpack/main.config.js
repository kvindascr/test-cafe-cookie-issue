// ensure we've set some kind of NODE_ENV
const path = require('path');
const fs = require('fs');
const process = require('process');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const {
  commonPlugins,
  commonWebpackConfig,
  IS_DEV,
  IS_STYLEGUIDE,
  ASSETS_ROOT,
  BUILD_ROOT,
  IS_FAST_REFRESH,
  TEST_APP_TITLE,
  NGINX_ENABLED,
} = require('./common');

const PUBLIC_ASSETS = fs
  .readdirSync(path.resolve('public'))
  .filter((file) => {
    // do not include into the public build
    if (!NGINX_ENABLED && (file === 'mobile-react-devtools.js' || file === 'mobile-react-devtools.client.js')) {
      return false;
    }

    return file !== 'index.html';
  })
  .map((file) => path.join(ASSETS_ROOT, file));

const ASSET_PATTERNS = PUBLIC_ASSETS.map((asset) => {
  return { from: asset, to: asset.replace(ASSETS_ROOT + '/', '') };
}).reduce((result, value) => {
  const { from, to } = value;
  if (!path.extname(to)) {
    const stat = fs.statSync(from);
    if (!stat.isDirectory()) {
      return [...result, { from, to: to + '/', toType: 'file', force: true }];
    }
  }
  return [...result, { from, to }];
}, []);

const plugins = [
  new HtmlWebpackPlugin(
    Object.assign(
      {},
      {
        inject: true,
        template: path.join(ASSETS_ROOT, 'index.html'),
        TEST_APP_TITLE: TEST_APP_TITLE,
      },
    ),
  ),
  new CopyPlugin({
    patterns: ASSET_PATTERNS,
  }),
];

if (IS_DEV) {
  if (IS_FAST_REFRESH) {
    const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
    plugins.push(new ReactRefreshWebpackPlugin());
  }

  if (process.env.PERFORMANCE) {
    plugins.push(new SpeedMeasurePlugin());
    plugins.push(new BundleAnalyzerPlugin());
  }
}

if (IS_STYLEGUIDE) {
  plugins.push(new webpack.ProgressPlugin());
}

module.exports = {
  ...commonWebpackConfig,
  entry: {
    main: ['./src/index.tsx'],
  },
  output: {
    filename: '[name].[contenthash].js',
    path: BUILD_ROOT,
    publicPath: '/',
  },
  plugins: [...commonPlugins, ...plugins],
};
