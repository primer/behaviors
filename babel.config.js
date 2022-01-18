const defines = require('./babel-defines')

function replacementPlugin(env) {
  return ['babel-plugin-transform-replace-expressions', {replace: defines[env]}]
}

const sharedPlugins = ['@babel/plugin-proposal-nullish-coalescing-operator', '@babel/plugin-proposal-optional-chaining']

const presets = ['@babel/preset-typescript']

module.exports = {
  env: {
    development: {
      presets,
      plugins: [
        ...(process.env.BABEL_MODULE === 'commonjs' ? ['@babel/plugin-transform-modules-commonjs'] : []),
        ...sharedPlugins,
        replacementPlugin('development')
      ]
    },
    production: {
      presets,
      plugins: [...sharedPlugins, replacementPlugin('production')]
    }
  }
}
