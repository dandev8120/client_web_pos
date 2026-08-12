import React, { useEffect, useCallback } from 'react';
import { logger, LogLevel } from './loggerService';

export const useAuditLog = () => {
  const logAction = useCallback((action: string, category: string, details?: any) => {
    logger.log(action, category, details);
  }, []);

  return { logAction };
};

export const withAuditLog = <P extends object>(
  Component: React.ComponentType<P>,
  category: string
) => {
  return (props: P) => {
    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const clickable = target.closest('button, a, .ant-menu-item, .ant-table-row');
        if (clickable) {
          const description = clickable.textContent?.trim() || clickable.getAttribute('aria-label') || 'element';
          logger.log(`Clicked ${description}`, category, { 
            tag: clickable.tagName,
            id: clickable.id,
            className: clickable.className
          });
        }
      };

      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }, []);

    return <Component {...props} />;
  };
};

/**
 * Component-level tracking
 */
export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Find the nearest button or link
      const interactive = target.closest('button, a, [role="button"], .ant-select-selector, .ant-picker');
      if (interactive) {
          let text = interactive.textContent?.trim();
          if (!text) {
              const icon = interactive.querySelector('.anticon');
              if (icon) {
                 text = icon.getAttribute('aria-label') || 'Icon Button';
              }
          }
          logger.log(`Interact with: ${text || 'Interactive Element'}`, 'Global Interaction', {
              path: window.location.pathname,
              element: interactive.tagName
          });
      }
    };

    const handleNavigation = () => {
       logger.log(`Navigated to ${window.location.pathname}`, 'Navigation');
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('popstate', handleNavigation);
    
    // Initial page load
    logger.log(`App Loaded: ${window.location.pathname}`, 'System');

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  return <>{children}</>;
};
