/**
 * Simple audit logger to track user interactions
 */

import { auditService } from '../services/auditService';
import { AuditLogResponseDto } from '../dtos/AuditLogDto';

export type AuditLog = AuditLogResponseDto;

export const logAction = (action: string, details: Partial<AuditLog>) => {
  const newLog = auditService.logAction({
    action,
    element: details.element,
    path: details.path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
    text: details.text,
    value: details.value,
    method: details.method,
    url: details.url,
    status: details.status,
    durationMs: details.durationMs,
    requestBody: details.requestBody,
    responseBody: details.responseBody,
  });
  console.log('[Audit Log]:', newLog);
};

export const initAuditLogger = () => {
  // Click handler
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const closestButton = target.closest('button');
    const closestLink = target.closest('a');
    const closestInput = target.closest('input');

    let element = 'Element';
    let text = target.innerText?.trim().substring(0, 50);

    if (closestButton) {
      element = 'Button';
      text = closestButton.innerText || closestButton.getAttribute('aria-label') || 'Icon Button';
    } else if (closestLink) {
      element = 'Link';
      text = closestLink.innerText || closestLink.getAttribute('href') || 'Link';
    } else if (closestInput) {
      element = 'Input';
      text = closestInput.getAttribute('placeholder') || closestInput.name || 'Input';
    }

    logAction('CLICK', { element, text });
  };

  // Change handler
  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.type === 'password') return; // Don't log passwords
    
    if (e.type === 'change') {
      logAction('CHANGE', { 
        element: 'Input', 
        text: target.name || target.placeholder,
        value: target.value.substring(0, 50) 
      });
    }
  };

  // Global Fetch Interceptor for API Request & Response Logging
  const originalFetch = typeof window !== 'undefined' ? window.fetch : null;
  
  if (originalFetch) {
    const interceptedFetch = async function (...args: Parameters<typeof fetch>) {
      const startTime = performance.now();
      let url = typeof args[0] === 'string' ? args[0] : (args[0] instanceof Request ? args[0].url : String(args[0]));
      let method = 'GET';
      let reqBody: any = undefined;

      if (args[1]) {
        if (args[1].method) method = args[1].method.toUpperCase();
        if (args[1].body) {
          try {
            reqBody = typeof args[1].body === 'string' ? JSON.parse(args[1].body) : args[1].body;
          } catch {
            reqBody = String(args[1].body);
          }
        }
      } else if (args[0] instanceof Request) {
        method = args[0].method.toUpperCase();
      }

      try {
        const response = await originalFetch.apply(window, args);
        const durationMs = Math.round(performance.now() - startTime);

        let respBody: any = undefined;
        try {
          const cloned = response.clone();
          respBody = await cloned.json();
        } catch {
          // Not JSON or empty body
        }

        auditService.logAction({
          action: `API_${method}`,
          element: `HTTP ${response.status}`,
          path: typeof window !== 'undefined' ? window.location.pathname : '/',
          text: `${method} ${url}`,
          value: `Status: ${response.status} | Duration: ${durationMs}ms`,
          method,
          url,
          status: response.status,
          durationMs,
          requestBody: reqBody,
          responseBody: respBody,
        });

        return response;
      } catch (err: any) {
        const durationMs = Math.round(performance.now() - startTime);
        auditService.logAction({
          action: `API_${method}_ERROR`,
          element: 'HTTP ERR',
          path: typeof window !== 'undefined' ? window.location.pathname : '/',
          text: `${method} ${url}`,
          value: `Error: ${err.message || 'Network Failed'} (${durationMs}ms)`,
          method,
          url,
          status: 0,
          durationMs,
          requestBody: reqBody,
          responseBody: { error: err.message || 'Network Failure' },
        });
        throw err;
      }
    };

    const patchFetch = (newFetch: any) => {
      try {
        (window as any).fetch = newFetch;
      } catch {
        try {
          Object.defineProperty(window, 'fetch', {
            value: newFetch,
            writable: true,
            configurable: true,
          });
        } catch {
          try {
            Object.defineProperty(Window.prototype, 'fetch', {
              value: newFetch,
              writable: true,
              configurable: true,
            });
          } catch (e) {
            console.warn('[AuditLogger] Could not patch fetch:', e);
          }
        }
      }
    };

    patchFetch(interceptedFetch);

    document.addEventListener('click', handleClick, true);
    document.addEventListener('change', handleInput, true);

    return () => {
      patchFetch(originalFetch);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('change', handleInput, true);
    };
  }

  document.addEventListener('click', handleClick, true);
  document.addEventListener('change', handleInput, true);

  return () => {
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('change', handleInput, true);
  };
};

export const getAuditLogs = (): AuditLog[] => {
  return auditService.getLogs();
};
