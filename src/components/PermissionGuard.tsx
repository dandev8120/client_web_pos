import React, { useMemo } from 'react';
import { hasButtonPermission, isAccessControlBypassEnabled } from '../utils/accessControlPresets';
import { logAction } from '../utils/auditLogger';
import { message } from '../services/toastMessage';
import { STORAGE_KEYS } from '../constants/storageKeys';

interface PermissionGuardProps {
  buttonCode: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  /**
   * If true, renders children in disabled state instead of removing from DOM.
   * Default is false (strictly removes node from DOM to prevent DevTools inspection hack).
   */
  allowDisabledState?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  buttonCode,
  fallback = null,
  children,
  allowDisabledState = false,
}) => {
  if (isAccessControlBypassEnabled()) {
    return <>{children}</>;
  }

  // Read active session directly from localStorage to prevent stale context or DevTools tampering
  const activeUser = useMemo(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PORTAL_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const userRoles = useMemo(() => {
    return activeUser?.roles || [activeUser?.role || 'user'];
  }, [activeUser]);

  const isAllowed = useMemo(() => {
    if (!activeUser) return false;
    return hasButtonPermission(activeUser?.buttonPermissions, buttonCode, userRoles);
  }, [activeUser, buttonCode, userRoles]);

  if (!isAllowed) {
    if (allowDisabledState && React.isValidElement(children)) {
      // Return clone with disabled prop and click blocking interceptor
      return React.cloneElement(children as React.ReactElement<any>, {
        disabled: true,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          message.error(`Cảnh báo An ninh: Bạn không có quyền thực thi thao tác này! [Mã quyền: ${buttonCode}]`);
          logAction('SECURITY_VIOLATION', { element: buttonCode, text: `Cố gắng kích hoạt nút bấm bị khóa qua DevTools: ${buttonCode}` });
        }
      });
    }
    // Strict default: Zero DOM footprint - element completely removed from render tree
    return <>{fallback}</>;
  }

  // Intercept synthetic click events to re-verify permissions at execution time
  if (React.isValidElement(children)) {
    const originalOnClick = (children.props as any).onClick;
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        // Double-check live permission state right before invoking handler
        const currentSaved = localStorage.getItem(STORAGE_KEYS.PORTAL_SESSION);
        const currentUser = currentSaved ? JSON.parse(currentSaved) : activeUser;
        const currentRoles = currentUser?.roles || [currentUser?.role || 'user'];
        const currentAllowed = hasButtonPermission(currentUser?.buttonPermissions, buttonCode, currentRoles);

        if (!currentAllowed) {
          e.preventDefault();
          e.stopPropagation();
          message.error(`Cảnh báo Tamper: Phát hiện vi phạm phân quyền [${buttonCode}]! Thao tác đã bị ngăn chặn.`);
          logAction('SECURITY_VIOLATION', { element: buttonCode, text: `Phát hiện can thiệp DOM / JS synthetic click cho [${buttonCode}]` });
          return;
        }

        if (originalOnClick) {
          originalOnClick(e);
        }
      }
    });
  }

  return <>{children}</>;
};

export default PermissionGuard;
