import { AuditLogRequestDto, AuditLogResponseDto } from '../dtos/AuditLogDto';
import { auditService } from '../services/auditService';

export type AuditLog = AuditLogResponseDto;

type ClientContext = Pick<
  AuditLogRequestDto,
  | 'traceId'
  | 'sessionId'
  | 'ipAddress'
  | 'forwardedFor'
  | 'userAgent'
  | 'language'
  | 'geoLocation'
  | 'metadata'
>;

const AUDIT_PAGE_PREFIX = '/system/audit-logs';
const INTERNAL_AUDIT_API = '/api/audit/';
const SENSITIVE_KEY_PATTERN = /(password|pass|token|access_token|id_token|refresh_token|authorization|secret|cookie)/i;
const clientContext: ClientContext = {};

let originalFetchRef: typeof fetch | null = null;
let clientContextLoaded = false;

const createTraceId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const shouldSkipAudit = (path = window.location.pathname) => path.startsWith(AUDIT_PAGE_PREFIX);

const shouldSkipFetchAudit = (url: string) => {
  if (shouldSkipAudit()) return true;

  try {
    const targetUrl = new URL(url, window.location.origin);
    return targetUrl.pathname.startsWith(INTERNAL_AUDIT_API) || targetUrl.pathname.startsWith(AUDIT_PAGE_PREFIX);
  } catch {
    return url.includes(INTERNAL_AUDIT_API) || url.includes(AUDIT_PAGE_PREFIX);
  }
};

const sanitizeValue = (key: string, value: any): any => {
  if (SENSITIVE_KEY_PATTERN.test(key)) return '[MASKED]';

  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return value.length > 500 ? `${value.slice(0, 500)}...` : value;
  if (typeof value !== 'object') return value;
  if (value instanceof FormData) return '[FormData]';
  if (value instanceof Blob) return `[Blob ${value.type || 'unknown'}]`;
  if (value instanceof URLSearchParams) return Object.fromEntries(value.entries());
  if (Array.isArray(value)) return value.slice(0, 50).map(item => sanitizeValue(key, item));

  return Object.entries(value).reduce<Record<string, any>>((result, [entryKey, entryValue]) => {
    result[entryKey] = sanitizeValue(entryKey, entryValue);
    return result;
  }, {});
};

const parseBody = (body: BodyInit | null | undefined) => {
  if (!body) return undefined;
  if (typeof body !== 'string') return sanitizeValue('body', body);

  try {
    return sanitizeValue('body', JSON.parse(body));
  } catch {
    return sanitizeValue('body', body);
  }
};

const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  const browserPatterns: Array<[string, RegExp]> = [
    ['Microsoft Edge', /Edg\/([\d.]+)/],
    ['Google Chrome', /Chrome\/([\d.]+)/],
    ['Firefox', /Firefox\/([\d.]+)/],
    ['Safari', /Version\/([\d.]+).*Safari/],
  ];

  const matched = browserPatterns
    .map(([name, pattern]) => {
      const match = ua.match(pattern);
      return match ? { browserName: name, browserVersion: match[1] } : null;
    })
    .find(Boolean);

  return {
    browserName: matched?.browserName || 'Unknown',
    browserVersion: matched?.browserVersion,
    userAgent: ua,
    platform: navigator.platform,
    language: navigator.language,
  };
};

const getAuthUser = () => {
  try {
    const session = localStorage.getItem('@@WEB_POS_PORTAL');
    const parsedSession = session ? JSON.parse(session) : null;
    const oidcKey = Object.keys(localStorage).find(key => key.startsWith('oidc.user:'));
    const oidcUser = oidcKey ? JSON.parse(localStorage.getItem(oidcKey) || '{}') : null;
    const profile = oidcUser?.profile || parsedSession?.profile || parsedSession || {};

    return {
      sessionId: parsedSession?.session?.id || parsedSession?.sessionId || clientContext.sessionId,
      userId: profile.sub || profile.id || parsedSession?.id || parsedSession?.employeeId,
      userName: profile.name || profile.fullName || parsedSession?.name || parsedSession?.userName,
      userEmail: profile.email || parsedSession?.email,
      roles: profile.role || parsedSession?.roles || parsedSession?.role,
    };
  } catch {
    return {};
  }
};

const buildMetadata = (): Partial<AuditLogRequestDto> => {
  const browserInfo = getBrowserInfo();
  const authUser = getAuthUser();

  return {
    ...clientContext,
    ...browserInfo,
    ...authUser,
    traceId: createTraceId(),
    sessionId: authUser.sessionId || clientContext.sessionId,
    path: window.location.pathname,
    routeTitle: document.title,
    referrer: document.referrer || undefined,
    locationHref: window.location.href,
    locationOrigin: window.location.origin,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    screen: `${window.screen.width}x${window.screen.height}`,
    metadata: {
      devicePixelRatio: window.devicePixelRatio,
      online: navigator.onLine,
      roles: authUser.roles,
      contextCaptured: clientContext.metadata?.capturedAt,
    },
  };
};

const maskInputValue = (target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
  const inputType = target instanceof HTMLInputElement ? target.type : '';
  const inputName = target.getAttribute('name') || target.getAttribute('id') || '';

  if (inputType === 'password' || SENSITIVE_KEY_PATTERN.test(inputName)) return '[MASKED]';
  return String(target.value || '').slice(0, 80);
};

const loadClientContext = async () => {
  if (clientContextLoaded || !originalFetchRef) return;
  clientContextLoaded = true;

  try {
    const response = await originalFetchRef('/api/audit/client-context', { credentials: 'include' });
    const payload = await response.json();
    Object.assign(clientContext, payload?.context || {});
  } catch {
    // Context enrichment is best-effort; the audit log still records browser/session data.
  }

  try {
    const permissionStatus = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
    if (permissionStatus?.state === 'granted') {
      navigator.geolocation.getCurrentPosition(position => {
        clientContext.geoLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
      });
    }
  } catch {
    // Do not prompt the user for location just to enrich audit metadata.
  }
};

export const logAction = (action: string, details: Partial<AuditLog>) => {
  if (shouldSkipAudit(details.path || window.location.pathname)) return;

  auditService.logAction({
    ...buildMetadata(),
    ...details,
    action,
    path: details.path || window.location.pathname,
    requestBody: sanitizeValue('requestBody', details.requestBody),
    responseBody: sanitizeValue('responseBody', details.responseBody),
  });
};

export const initAuditLogger = () => {
  const handleClick = (event: MouseEvent) => {
    if (shouldSkipAudit()) return;

    const target = event.target as HTMLElement;
    const closestButton = target.closest('button');
    const closestLink = target.closest('a');
    const closestInput = target.closest('input, textarea, select');

    let element = target.tagName || 'Element';
    let text = target.innerText?.trim().slice(0, 80);

    if (closestButton) {
      element = 'Button';
      text = closestButton.innerText?.trim() || closestButton.getAttribute('aria-label') || closestButton.title || 'Icon Button';
    } else if (closestLink) {
      element = 'Link';
      text = closestLink.innerText?.trim() || closestLink.getAttribute('href') || 'Link';
    } else if (closestInput) {
      element = closestInput.tagName;
      text = closestInput.getAttribute('placeholder') || closestInput.getAttribute('name') || closestInput.id || 'Input';
    }

    logAction('UI_CLICK', { element, text });
  };

  const handleInput = (event: Event) => {
    if (shouldSkipAudit() || event.type !== 'change') return;

    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (!target || !('value' in target)) return;

    logAction('UI_CHANGE', {
      element: target.tagName,
      text: target.getAttribute('name') || target.getAttribute('placeholder') || target.id || 'Input',
      value: maskInputValue(target),
    });
  };

  originalFetchRef = typeof window !== 'undefined' ? window.fetch : null;
  void loadClientContext();

  if (originalFetchRef) {
    const interceptedFetch = async function (...args: Parameters<typeof fetch>) {
      const startTime = performance.now();
      const input = args[0];
      const init = args[1];
      const request = input instanceof Request ? input : null;
      const url = typeof input === 'string' ? input : request?.url || String(input);
      const method = (init?.method || request?.method || 'GET').toUpperCase();
      const requestBody = parseBody(init?.body || null);

      if (shouldSkipFetchAudit(url)) {
        return originalFetchRef!.apply(window, args);
      }

      try {
        const response = await originalFetchRef!.apply(window, args);
        const durationMs = Math.round(performance.now() - startTime);
        let responseBody: any;

        try {
          responseBody = sanitizeValue('responseBody', await response.clone().json());
        } catch {
          responseBody = undefined;
        }

        logAction(`API_${method}`, {
          element: `HTTP ${response.status}`,
          text: `${method} ${url}`,
          value: `Status: ${response.status} | Duration: ${durationMs}ms`,
          method,
          url,
          status: response.status,
          durationMs,
          requestBody,
          responseBody,
        });

        return response;
      } catch (error: any) {
        const durationMs = Math.round(performance.now() - startTime);
        logAction(`API_${method}_ERROR`, {
          element: 'HTTP ERROR',
          text: `${method} ${url}`,
          value: `Error: ${error?.message || 'Network Failed'} (${durationMs}ms)`,
          method,
          url,
          status: 0,
          durationMs,
          requestBody,
          responseBody: { error: error?.message || 'Network Failure' },
        });
        throw error;
      }
    };

    window.fetch = interceptedFetch;
  }

  document.addEventListener('click', handleClick, true);
  document.addEventListener('change', handleInput, true);

  return () => {
    if (originalFetchRef) window.fetch = originalFetchRef;
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('change', handleInput, true);
  };
};

export const getAuditLogs = (): AuditLog[] => auditService.getLogs();
