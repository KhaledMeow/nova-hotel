const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
dotenv.config();

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      }
    })
  );
};