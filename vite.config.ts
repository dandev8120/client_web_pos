import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-oidc-context', 'oidc-client-ts'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/receipts-center': {
          target: 'https://1fb3-2405-4802-8139-1c80-2894-42ee-9359-484f.ngrok-free.app',
          changeOrigin: true,
          secure: false,
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        },
        '/.well-known': {
          target: 'https://identityserver.bitisgroup.vn',
          changeOrigin: true,
          secure: false,
          headers: {
            Host: 'identityserver.bitisgroup.vn',
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Host', 'identityserver.bitisgroup.vn');
            });
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['access-control-allow-origin'] = '*';
              proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['access-control-allow-headers'] = 'X-Requested-With, content-type, Authorization';
            });
          },
        },
        '/oidc-proxy': {
          target: 'https://identityserver.bitisgroup.vn',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/oidc-proxy/, ''),
          headers: {
            Host: 'identityserver.bitisgroup.vn',
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Host', 'identityserver.bitisgroup.vn');
            });
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['access-control-allow-origin'] = '*';
              proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['access-control-allow-headers'] = 'X-Requested-With, content-type, Authorization';
            });
          },
        },
      },
    },
  };
});
