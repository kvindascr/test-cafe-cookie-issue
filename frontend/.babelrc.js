const { IS_DEV, IS_FAST_REFRESH } = require('./webpack/common')

const plugins = [
  ['@babel/plugin-proposal-class-properties', { loose: true }],
  '@babel/plugin-proposal-nullish-coalescing-operator',
  '@babel/plugin-proposal-optional-chaining']

module.exports = (api) => {
  api.cache(true);

  const runPlugins = [...plugins];

  if (IS_DEV && IS_FAST_REFRESH && process.env.NODE_ENV !== 'test') {
    runPlugins.push('react-refresh/babel')
  }

  return {
    presets: ['@babel/preset-typescript', '@babel/preset-env', '@babel/preset-react'],
    plugins: runPlugins,
  };
};
