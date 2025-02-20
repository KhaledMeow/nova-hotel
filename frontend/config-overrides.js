module.exports = function override(config, env) {
  if (config.devServer) {
    config.devServer.setupMiddlewares = (middlewares, devServer) => {
      // Your middleware logic can go here
      return middlewares;
    };
  }
  return config;
};