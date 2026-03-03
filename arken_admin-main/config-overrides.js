const webpack = require("webpack");

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    fs: false, // 'fs' can't be used in the browser, so set it to false
    zlib: false, // 'zlib' can't be used in the browser, set to false
    querystring: false, // 'querystring' can't be used in the browser
    stream: false, // 'stream' can't be used in the browser
    async_hooks: false,  // 'async_hooks' can't be used in the browser
    crypto: false, // Optional polyfill for crypto-browserify
    assert: false, // Optional polyfill for assert
    http: false, // Optional polyfill for http-browserify
    https: false, // Optional polyfill for https-browserify
    os: false, // Optional polyfill for os-browserify
    url: false, // Optional polyfill for url
    path: false
  });
  config.resolve.fallback = fallback;
  
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);

  config.ignoreWarnings = [/Failed to parse source map/];

  config.module.rules.push({
    test: /\.(js|mjs|jsx)$/,
    enforce: "pre",
    loader: require.resolve("source-map-loader"),
    resolve: {
      fullySpecified: false,
    },
  });

  return config;
};
