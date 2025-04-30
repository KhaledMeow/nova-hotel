module.exports = function override(config, env) {
  if (config.devServer) {
    config.devServer.setupMiddlewares = (middlewares, devServer) => {
      return middlewares;
    };
  }
  return config;
};