import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import { AuthProvider, AuthProviderProps, useAuth } from 'react-oidc-context';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Forms from './pages/Forms';
import Icons from './pages/Icons';
import Login from './pages/Login';

const oidcConfig: AuthProviderProps = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY || 'https://demo.duendesoftware.com',
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID || 'interactive.public',
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI || window.location.origin,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

function AppContent({ themeMode, setThemeMode, layout, setLayout }: any) {
  const auth = useAuth();
  const [user, setUser] = useState<{ name: string; role: string } | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      const userData = {
        name: auth.user.profile.name || auth.user.profile.preferred_username || 'OIDC User',
        role: 'admin'
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  }, [auth.isAuthenticated, auth.user]);

  const handleLogin = (userData: { name: string; role: string }) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    if (auth.isAuthenticated) {
      auth.removeUser();
    }
  };

  if (auth.isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        
        <Route path="/" element={user ? (
          <DashboardLayout 
            user={user} 
            onLogout={handleLogout} 
            themeMode={themeMode} 
            setThemeMode={setThemeMode}
            layout={layout}
            setLayout={setLayout}
          />
        ) : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="forms" element={<Forms />} />
          <Route path="icons" element={<Icons />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('themeMode') as 'light' | 'dark' | 'system') || 'system';
  });
  const [layout, setLayout] = useState<'sidebar' | 'top'>('sidebar');

  const isDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [themeMode, isDark]);

  return (
    <AuthProvider {...oidcConfig}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 6,
          },
        }}
      >
        <AntdApp>
          <AppContent themeMode={themeMode} setThemeMode={setThemeMode} layout={layout} setLayout={setLayout} />
        </AntdApp>
      </ConfigProvider>
    </AuthProvider>
  );
}
