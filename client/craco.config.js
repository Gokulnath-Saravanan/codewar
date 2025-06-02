module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Allow imports from outside src directory
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => !plugin.constructor.name.includes('ModuleScopePlugin')
      );
      return webpackConfig;
    },
  },
}; 