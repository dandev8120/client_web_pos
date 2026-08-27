import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { APP_VERSION } from '../generated/version';
import { TOKEN_STORAGE_KEY } from '../services/authStorage';
import { API_CONFIG } from './config';
import { ApiResponse } from './response';

export const CLIENT_APP_NAME = 'POS-CENTER-BITIS';
export const CSRF_COOKIE_NAME = 'POS_PORTAL_CSRF_TOKEN';
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

const UNSAFE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

function getStoredToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
}

function setHeader(config: InternalAxiosRequestConfig, key: string, value: string) {
  const headers = config.headers as any;
  if (headers && typeof headers.set === 'function') {
    headers.set(key, value);
    return;
  }

  config.headers = {
    ...(config.headers as Record<string, string> | undefined),
    [key]: value,
  } as any;
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return '';

  return document.cookie
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || '';
}

function getCsrfTokenFromCookie() {
  const value = getCookie(CSRF_COOKIE_NAME);
  return value ? decodeURIComponent(value) : '';
}

function isUnsafeMethod(method?: string) {
  return UNSAFE_METHODS.has((method || 'get').toLowerCase());
}

function isSameOriginRequest(config: InternalAxiosRequestConfig) {
  if (typeof window === 'undefined') return false;

  const requestUrl = new URL(config.url || '', config.baseURL || window.location.href);
  return requestUrl.origin === window.location.origin;
}

function isCsrfExemptRequest(config: InternalAxiosRequestConfig) {
  const requestUrl = new URL(config.url || '', config.baseURL || window.location.href);
  return requestUrl.pathname === '/api/session' && (config.method || 'get').toLowerCase() === 'post';
}

async function fetchCsrfToken() {
  if (typeof window === 'undefined') return '';

  try {
    const response = await axios.get('/api/csrf-token', {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const token = response.data?.data?.csrfToken;
    return typeof token === 'string' ? token : getCsrfTokenFromCookie();
  } catch {
    return getCsrfTokenFromCookie();
  }
}

async function attachCsrfHeader(config: InternalAxiosRequestConfig) {
  if (!isUnsafeMethod(config.method) || !isSameOriginRequest(config) || isCsrfExemptRequest(config)) {
    return;
  }

  const token = getCsrfTokenFromCookie() || await fetchCsrfToken();
  if (token) {
    setHeader(config, CSRF_HEADER_NAME, token);
  }
}

export function getDefaultHeaders() {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-App': CLIENT_APP_NAME,
    'X-Client-Version': APP_VERSION.fullDisplay || APP_VERSION.display,
    'ngrok-skip-browser-warning': 'true',
  };

  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export function createHttpClient(config: AxiosRequestConfig = {}) {
  const client = axios.create({
    timeout: API_CONFIG.timeout,
    withCredentials: true,
    xsrfCookieName: CSRF_COOKIE_NAME,
    xsrfHeaderName: CSRF_HEADER_NAME,
    ...config,
    headers: {
      ...getDefaultHeaders(),
      ...(config.headers || {}),
    },
  });

  client.interceptors.request.use(async (requestConfig) => {
    Object.entries(getDefaultHeaders()).forEach(([key, value]) => {
      setHeader(requestConfig, key, value);
    });
    await attachCsrfHeader(requestConfig);
    return requestConfig;
  });

  return client;
}

type BackendErrorResponse<T = unknown> = {
  success?: boolean;
  isSuccess?: boolean;
  code?: unknown;
  message?: unknown;
  data?: T;
  errors?: unknown;
  error?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function toStatusCode(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function toMessage(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function getAxiosErrorMessage<T = unknown>(
  error: unknown,
  fallback = 'Network Request Failed'
): ApiResponse<T> {
  if (!axios.isAxiosError(error)) {
    return ApiResponse.error<T>(error instanceof Error ? error.message : fallback, 500);
  }

  const axiosError = error as AxiosError<any>;
  const statusCode = axiosError.response?.status || 500;
  const body = axiosError.response?.data as BackendErrorResponse<T> | unknown;

  if (!isRecord(body)) {
    return ApiResponse.error<T>(axiosError.message || fallback, statusCode);
  }

  const responseBody = body as BackendErrorResponse<T>;
  const code = toStatusCode(responseBody.code, statusCode);
  const message = toMessage(
    responseBody.message,
    toMessage(responseBody.error, axiosError.message || fallback)
  );
  const data = responseBody.data !== undefined
    ? responseBody.data
    : responseBody.errors !== undefined
      ? responseBody.errors as T
      : undefined;

  return new ApiResponse<T>(
    responseBody.success === true || responseBody.isSuccess === true ? true : false,
    (data ?? null) as T,
    message,
    code
  );
}

export const httpClient = createHttpClient();
