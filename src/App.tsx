import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { oidcConfig, extractOidcUser } from './services/oidcConfig';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Promotions from './pages/Promotions';
import Forms from './pages/Forms';
import Icons from './pages/Icons';
import RbacManagement from './pages/RbacManagement';
import AuditLogs from './pages/AuditLogs';
import Login from './pages/Login';
import PublicVATRegistration from './pages/PublicVATRegistration';
import VatConfig from './pages/VatConfig';
import { Error401, Error403, Error404, Error500, Error503, Maintenance, Upgrading } from './pages/error/ErrorPages';
import { initAuditLogger } from './utils/auditLogger';
import { PRESET_USERS } from './utils/rbacPresets';

const AUTH_KEY = '@@WEB_POS_PORTAL';

export interface UserSession {
  name: string;
  email?: string;
  role?: string;
  roles?: string[];
  allowedUrls?: string[];
  buttonPermissions?: string[];
  token?: string;
  isExpired?: boolean;
}

function OidcSync({ setUser }: { setUser: React.Dispatch<React.SetStateAction<UserSession>> }) {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      const mapped = extractOidcUser(auth.user);
      if (mapped) {
        const fullUser: UserSession = {
          name: mapped.name,
          email: mapped.email,
          role: mapped.role,
          roles: mapped.roles,
          allowedUrls: [
            '/',
            '/sales/orders',
            '/sales/products',
            '/sales/customers',
            '/sales/promotions',
            '/system/rbac',
            '/system/vat-config',
            '/system/audit-logs',
            '/system/forms',
            '/system/icons'
          ],
          buttonPermissions: ['CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'VIEW_FULL_PRICE', 'AUDIT_LOG_VIEW'],
          token: mapped.token,
          isExpired: false
        };
        setUser(fullUser);
        localStorage.setItem(AUTH_KEY, JSON.stringify(fullUser));
      }
    }
  }, [auth.isAuthenticated, auth.user, setUser]);

  return null;
}

function AppContent({ themeMode, setThemeMode, layout, setLayout }: any) {
  const auth = useAuth();
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
    } catch {
      // ignore
    }
    // If auth session exists in localStorage or preset, load it, otherwise null
    return null;
  });

  useEffect(() => {
    const cleanup = initAuditLogger();
    return cleanup;
  }, []);

  const handleLogin = async (usePopup = false) => {
    try {
      if (usePopup) {
        await auth.signinPopup();
      } else {
        await auth.signinRedirect();
      }
    } catch (err) {
      console.error('OIDC login trigger error:', err);
      const authorityUrl = import.meta.env.VITE_OIDC_AUTHORITY || 'https://identityserver.bitisgroup.vn';
      const clientId = import.meta.env.VITE_OIDC_CLIENT_ID || 'sso_portal_v2_web_client_client_id_prod';
      const redirectUri = import.meta.env.VITE_OIDC_REDIRECT_URI || `${window.location.origin}/signin-oidc`;
      const scope = import.meta.env.VITE_OIDC_SCOPE || 'openid email profile roles';
      window.location.href = `${authorityUrl}/connect/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    }
  };

  const handleMockLogin = (sessionData: UserSession) => {
    setUser(sessionData);
    localStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    if (auth.isAuthenticated) {
      try {
        auth.removeUser();
        auth.signoutRedirect();
      } catch (e) {
        console.warn('OIDC signout error:', e);
      }
    }
  };

  if (user?.isExpired) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Error401 />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <OidcSync setUser={setUser} />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} onMockLogin={handleMockLogin} />} />
        <Route path="/signin-oidc" element={<Navigate to="/" replace />} />
        <Route path="/signout-callback-oidc" element={<Navigate to="/login" replace />} />
        <Route path="/rp" element={<PublicVATRegistration />} />
        
        {/* Error Pages outside layout if needed, or inside */}
        <Route path="/401" element={<Error401 />} />
        <Route path="/403" element={<Error403 />} />
        <Route path="/500" element={<Error500 />} />
        <Route path="/503" element={<Error503 />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/upgrading" element={<Upgrading />} />

        <Route path="/" element={
          user ? (
            <DashboardLayout 
              user={user} 
              onLogout={handleLogout} 
              themeMode={themeMode} 
              setThemeMode={setThemeMode}
              layout={layout}
              setLayout={setLayout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }>
          <Route index element={<Dashboard />} />
          <Route path="sales">
            <Route path="orders" element={<Orders />} />
            <Route path="orders/detail/:site/:receipt" element={<Orders />} />
            <Route path="orders/detail/:site" element={<Orders />} />
            <Route path="orders/detail/*" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<Customers />} />
            <Route path="promotions" element={<Promotions />} />
          </Route>
          <Route path="system">
            <Route path="rbac" element={<RbacManagement />} />
            <Route path="vat-config" element={<VatConfig />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="common-forms" element={<Navigate to="/system/forms" replace />} />
            <Route path="forms" element={<Forms />} />
            <Route path="icons" element={<Icons />} />
          </Route>
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </Router>
  );
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[AppErrorBoundary] Uncaught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#ff4d4f' }}>Đã xảy ra lỗi hệ thống</h2>
          <p style={{ color: '#595959' }}>{this.state.error?.message || 'Vui lòng làm mới trang hoặc thử lại sau.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '8px 16px', backgroundColor: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Làm mới trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('themeMode') as 'light' | 'dark' | 'system') || 'system';
  });
  const [layout, setLayout] = useState<'sidebar' | 'top'>(() => {
    return (localStorage.getItem('layout') as 'sidebar' | 'top') || 'sidebar';
  });

  const isDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [themeMode, isDark]);

  useEffect(() => {
    localStorage.setItem('layout', layout);
  }, [layout]);

  const onSigninCallback = () => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return (
    <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
      <ConfigProvider
        locale={viVN}
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 6,
          },
        }}
      >
        <AntdApp>
          <AppErrorBoundary>
            <AppContent themeMode={themeMode} setThemeMode={setThemeMode} layout={layout} setLayout={setLayout} />
          </AppErrorBoundary>
        </AntdApp>
      </ConfigProvider>
    </AuthProvider>
  );
}
