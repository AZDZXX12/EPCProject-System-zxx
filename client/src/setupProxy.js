const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 代理所有API请求到后端
  app.use(
    ['/api', '/v1'],
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('[Proxy] Forwarding:', req.method, req.url, '-> http://localhost:8000' + req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('[Proxy] Response:', proxyRes.statusCode, req.url);
      },
      onError: (err, req, res) => {
        console.error('[Proxy] Error:', err.message);
      }
    })
  );
  
  app.use(
    '/health',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true
    })
  );
};


