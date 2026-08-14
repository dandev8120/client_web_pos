import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const envDir = __dirname;
  const env = loadEnv(mode, envDir, '');
  const hmrEnabled = env.VITE_DEV_HMR_ENABLED === 'true';

  return {
    envDir,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-router-dom',
        'react-oidc-context',
        'oidc-client-ts',
        'antd',
        '@ant-design/icons',
        'i18next',
        'react-i18next',
        'dayjs',
      ],
    },
    server: {
      hmr: hmrEnabled,
      watch: hmrEnabled ? {} : null,
    },
  };
});
