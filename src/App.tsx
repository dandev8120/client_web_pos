import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp, Spin } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { oidcConfig, extractOidcUser } from './services/oidcConfig';
import { Error401, Error403, Error404, Error500, Error503, Maintenance, Upgrading } from './pages/error/ErrorPages';
import { initAuditLogger } from './utils/auditLogger';
import { TOKEN_STORAGE_KEY } from './services/authStorage';
import { clearAppSession, createAppSession } from './services/appSession';
import { siteService } from './services/siteService';

const DashboardLayout = React.lazy(() => import('./layouts/DashboardLayout'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Products = React.lazy(() => import('./pages/Products'));
const Customers = React.lazy(() => import('./pages/Customers'));
const Promotions = React.lazy(() => import('./pages/Promotions'));
const Forms = React.lazy(() => import('./pages/Forms'));
const Icons = React.lazy(() => import('./pages/Icons'));
const RbacManagement = React.lazy(() => import('./pages/RbacManagement'));
const AuditLogs = React.lazy(() => import('./pages/AuditLogs'));
const Login = React.lazy(() => import('./pages/Login'));
const VatConfig = React.lazy(() => import('./pages/VatConfig'));

const REDIRECT_LOCK_KEY = '@@WEB_POS_OIDC_REDIRECTING';
const AUTH_RETURN_URL_KEY = '@@WEB_POS_AUTH_RETURN_URL';

const DEFAULT_ALLOWED_URLS = [
  '/',
  '/sales/orders',
  '/sales/products',
  '/sales/customers',
  '/sales/promotions',
  '/system/rbac',
  '/system/vat-config',
  '/system/audit-logs',
  '/system/forms',
  '/system/icons',
];

const DEFAULT_BUTTON_PERMISSIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'EXPORT',
  'IMPORT',
  'VIEW_FULL_PRICE',
  'AUDIT_LOG_VIEW',
];

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

function FullScreenLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-slate-700">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
        <Spin size="small" />
        <span>Đang xác thực phiên đăng nhập SSO...</span>
      </div>
    </div>
  );
}

function buildUserSession(authUser: ReturnType<typeof extractOidcUser>): UserSession | null {
  if (!authUser) return null;

  return {
    name: authUser.name,
    email: authUser.email,
    role: authUser.role,
    roles: authUser.roles,
    allowedUrls: DEFAULT_ALLOWED_URLS,
    buttonPermissions: DEFAULT_BUTTON_PERMISSIONS,
    token: authUser.token,
    isExpired: false,
  };
}

function getReturnPathFromLocation(location: ReturnType<typeof useLocation>) {
  return `${location.pathname}${location.search}${location.hash}`;
}

function normalizeReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';

  const lowerValue = value.toLowerCase();
  if (
    lowerValue.startsWith('/login')
    || lowerValue.startsWith('/signin-oidc')
    || lowerValue.startsWith('/signout-callback-oidc')
  ) {
    return '/';
  }

  return value;
}

function RequireAuthenticatedLayout({
  user,
  children,
}: {
  user: UserSession | null;
  children: React.ReactNode;
}) {
  const location = useLocation();

  if (!user) {
    const returnPath = normalizeReturnPath(getReturnPathFromLocation(location));
    sessionStorage.setItem(AUTH_RETURN_URL_KEY, returnPath);
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnPath)}`} replace />;
  }

  return <>{children}</>;
}

function AppContent({ themeMode, setThemeMode, layout, setLayout }: any) {
  const auth = useAuth();

  const user = useMemo(() => {
    if (!auth.isAuthenticated || !auth.user) return null;
    return buildUserSession(extractOidcUser(auth.user));
  }, [auth.isAuthenticated, auth.user]);

  useEffect(() => {
    const cleanup = initAuditLogger();
    return cleanup;
  }, []);

  useEffect(() => {
    if (auth.user?.access_token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, auth.user.access_token);
      localStorage.removeItem('access_token');
      localStorage.removeItem('@@WEB_POS_PORTAL');
      createAppSession(auth.user).catch((err) => {
        console.warn('Create app session error:', err);
      });
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [auth.user?.access_token]);

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user?.access_token) return;

    siteService.refreshTenantBranches().catch((err) => {
      console.warn('Refresh tenant branches error:', err);
    });
  }, [auth.isAuthenticated, auth.user?.access_token]);

  const handleLogout = async () => {
    sessionStorage.removeItem(REDIRECT_LOCK_KEY);
    sessionStorage.setItem(
      AUTH_RETURN_URL_KEY,
      normalizeReturnPath(`${window.location.pathname}${window.location.search}${window.location.hash}`)
    );
    await clearAppSession();

    try {
      await auth.signoutRedirect({
        id_token_hint: auth.user?.id_token,
        post_logout_redirect_uri:
          import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI ||
          `${window.location.origin}/signout-callback-oidc`,
      });
    } catch (err) {
      console.warn('OIDC signout error:', err);
      await auth.removeUser();
      window.location.replace('/login');
    }
  };

  if (auth.isLoading || auth.activeNavigator) {
    return <FullScreenLoading />;
  }

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
      <React.Suspense fallback={<FullScreenLoading />}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/signin-oidc" element={<FullScreenLoading />} />
          <Route path="/signout-callback-oidc" element={<Navigate to="/login" replace />} />

          <Route path="/401" element={<Error401 />} />
          <Route path="/403" element={<Error403 />} />
          <Route path="/500" element={<Error500 />} />
          <Route path="/503" element={<Error503 />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/upgrading" element={<Upgrading />} />

          <Route
            path="/"
            element={
              <RequireAuthenticatedLayout user={user}>
                <DashboardLayout
                    user={user!}
                    onLogout={handleLogout}
                    themeMode={themeMode}
                    setThemeMode={setThemeMode}
                    layout={layout}
                    setLayout={setLayout}
                  />
              </RequireAuthenticatedLayout>
            }
          >
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
      </React.Suspense>
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
          <p style={{ color: '#595959' }}>
            {this.state.error?.message || 'Vui lòng làm mới trang hoặc thử lại sau.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1677ff',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
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

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

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
    const returnPath = normalizeReturnPath(sessionStorage.getItem(AUTH_RETURN_URL_KEY));
    sessionStorage.removeItem(REDIRECT_LOCK_KEY);
    sessionStorage.removeItem(AUTH_RETURN_URL_KEY);
    window.history.replaceState({}, document.title, returnPath);
  };

  const onSignoutCallback = async () => {
    await clearAppSession();
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('access_token');
    localStorage.removeItem('@@WEB_POS_PORTAL');
    sessionStorage.removeItem(REDIRECT_LOCK_KEY);
    const returnPath = normalizeReturnPath(sessionStorage.getItem(AUTH_RETURN_URL_KEY));
    window.history.replaceState(
      {},
      document.title,
      `/login?returnUrl=${encodeURIComponent(returnPath)}`
    );
  };

  return (
    <AuthProvider
      {...oidcConfig}
      onSigninCallback={onSigninCallback}
      matchSignoutCallback={(settings) => {
        const postLogoutRedirectUri = settings.post_logout_redirect_uri;
        return Boolean(postLogoutRedirectUri) && window.location.href.startsWith(postLogoutRedirectUri);
      }}
      onSignoutCallback={onSignoutCallback}
    >
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
            <AppContent
              themeMode={themeMode}
              setThemeMode={setThemeMode}
              layout={layout}
              setLayout={setLayout}
            />
          </AppErrorBoundary>
        </AntdApp>
      </ConfigProvider>
    </AuthProvider>
  );
}
