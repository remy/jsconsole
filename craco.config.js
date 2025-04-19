// Do not use "homepage" value defined in package.json
// as the public path:
process.env.PUBLIC_URL = process.env.PUBLIC_URL || '/';

module.exports = {
  eslint: {
    mode: 'file',
  },
  style: {
    css: {
      // options passed to css-loader
      loaderOptions: {
        // Note(alichry, 2025): URLs specified in jsconsole.css
        // are not aligned with the project directory path but rather
        // to the public/ directory. We disable it to enable compilation
        url: false,
      }
    }
  },
  webpack: {
    alias: {
      "react": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",     // Must be below test-utils
      "react/jsx-runtime": "preact/jsx-runtime",
    },
    configure: (webpackConfig, { env, paths }) => {
      if (env === 'production') {
        webpackConfig.optimization = webpackConfig.optimization || {};
        webpackConfig.optimization.splitChunks = webpackConfig.optimization.splitChunks || {};
        webpackConfig.optimization.splitChunks.cacheGroups = webpackConfig.optimization.splitChunks.cacheGroups || {};
        webpackConfig.optimization.splitChunks.cacheGroups.styles = {
          ...webpackConfig.optimization.splitChunks.cacheGroups.styles,
          // Note(alichry, 2025): Extracting all CSS in a single file
          // https://webpack.js.org/plugins/mini-css-extract-plugin/#extracting-all-css-in-a-single-file
          name: "styles",
          type: "css/mini-extract",
          chunks: "all",
          enforce: true,
        };
      }
      return webpackConfig;
    }
  },
};