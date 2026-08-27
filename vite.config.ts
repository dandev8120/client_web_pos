import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const envDir = __dirname;
  const env = loadEnv(mode, envDir, '');
  const localEnvPath = path.resolve(envDir, '.env.local');
  const localEnv = fs.existsSync(localEnvPath)
    ? Object.fromEntries(
        fs.readFileSync(localEnvPath, 'utf-8')
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#') && line.includes('='))
          .map(line => {
            const separatorIndex = line.indexOf('=');
            return [
              line.slice(0, separatorIndex).trim(),
              line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, ''),
            ];
          })
      )
    : {};
  Object.assign(env, localEnv);
  const hmrEnabled = env.VITE_DEV_HMR_ENABLED === 'true';

  const metadataPath = path.resolve(__dirname, 'metadata.json');
  let metadata: any = {};
  try {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  } catch (e) {
    console.warn('Could not read metadata.json', e);
  }

  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html: string) {
        return html
          .replace(/%META_TITLE%/g, metadata.title || env.VITE_APP_TITLE || 'POS CENTER')
          .replace(/%META_DESCRIPTION%/g, metadata.description || env.VITE_APP_DESCRIPTION || '')
          .replace(/%META_KEYWORDS%/g, metadata.seoKeywords?.join(', ') || env.VITE_APP_KEYWORDS || '')
          .replace(/%META_AUTHOR%/g, env.VITE_APP_AUTHOR || "Biti's Retail Systems Division")
          .replace(/%META_ICON_TYPE%/g, metadata.logoUrl ? 'image/x-icon' : 'image/svg+xml')
          .replace(/%META_ICON_HREF%/g, metadata.logoUrl || '/favicon.svg');
      }
    };
  };

  return {
    envDir,
    plugins: [react(), tailwindcss(), htmlPlugin()],
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
        'lucide-react',
        'highcharts',
        'highcharts-react-official',
        'axios',
        'motion',
        '@dnd-kit/core',
        '@dnd-kit/sortable',
        '@dnd-kit/utilities'
      ],
    },
    server: {
      hmr: hmrEnabled,
      ws: hmrEnabled ? undefined : false,
      watch: {},
    },
  };
});
