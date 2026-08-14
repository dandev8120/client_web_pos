/**
 * POS CENTER - Biti's Retail Platform Multi-Service API Configuration
 * Auto-detects Vite mode and environment files under /.env.
 */

export interface AppEnvConfig {
  env: string;
  isDev: boolean;
  isProd: boolean;
  services: {
    posCenter: {
      baseUrl: string;
      timeout: number;
    };
    authService?: {
      baseUrl: string;
      timeout: number;
    };
    catalogService?: {
      baseUrl: string;
      timeout: number;
    };
    sapGateway?: {
      baseUrl: string;
      timeout: number;
    };
  };
}

const getEnvVar = (key: string, fallback: string = ''): string => {
  return (import.meta.env[key] as string) || fallback;
};

export const envConfig: AppEnvConfig = {
  env: (import.meta.env.MODE as string) || 'development',
  isDev: import.meta.env.DEV ?? (import.meta.env.MODE === 'development'),
  isProd: import.meta.env.PROD ?? (import.meta.env.MODE === 'production'),
  services: {
    posCenter: {
      baseUrl: getEnvVar('VITE_POS_CENTER_API_URL') || getEnvVar('VITE_API_POS_HOST') || getEnvVar('VITE_API_BASE_URL') || 'https://46f2-115-79-139-93.ngrok-free.app',
      timeout: Number(getEnvVar('VITE_POS_CENTER_TIMEOUT', '30000')),
    },
    authService: {
      baseUrl: getEnvVar('VITE_AUTH_SERVICE_API_URL', ''),
      timeout: 10000,
    },
    catalogService: {
      baseUrl: getEnvVar('VITE_CATALOG_SERVICE_API_URL', ''),
      timeout: 10000,
    },
    sapGateway: {
      baseUrl: getEnvVar('VITE_SAP_GATEWAY_API_URL', ''),
      timeout: 20000,
    },
  },
};

export const API_CONFIG = {
  posHost: envConfig.services.posCenter.baseUrl,
  timeout: envConfig.services.posCenter.timeout,
};

export default envConfig;

