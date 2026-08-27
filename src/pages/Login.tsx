import React, { useEffect, useRef, useState } from 'react';
import { Alert, App, Button, Spin } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useAuth } from 'react-oidc-context';
import { useSearchParams } from 'react-router-dom';

const REDIRECT_LOCK_KEY = '@@WEB_POS_OIDC_REDIRECTING';
const AUTH_RETURN_URL_KEY = '@@WEB_POS_AUTH_RETURN_URL';

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

export const Login: React.FC = () => {
  const { message } = App.useApp();
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const redirectStartedRef = useRef(false);
  const [manualRetryVisible, setManualRetryVisible] = useState(false);

  const authorityUrl = import.meta.env.VITE_OIDC_AUTHORITY || 'https://identityserver.bitisgroup.vn';
  const clientId = import.meta.env.VITE_OIDC_CLIENT_ID || 'sso_portal_v2_web_client_client_id_prod';
  const canRedirect = !auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator;

  const signin = async () => {
    if (redirectStartedRef.current) return;

    const returnPath = normalizeReturnPath(
      searchParams.get('returnUrl') || sessionStorage.getItem(AUTH_RETURN_URL_KEY)
    );
    redirectStartedRef.current = true;
    sessionStorage.setItem(REDIRECT_LOCK_KEY, '1');
    sessionStorage.setItem(AUTH_RETURN_URL_KEY, returnPath);

    try {
      await auth.signinRedirect();
    } catch (err) {
      console.error('OIDC redirect error:', err);
      redirectStartedRef.current = false;
      sessionStorage.removeItem(REDIRECT_LOCK_KEY);
      setManualRetryVisible(true);
      message.error('Không thể chuyển hướng đến IdentityServer. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    if (!canRedirect) return;

    const redirectLock = sessionStorage.getItem(REDIRECT_LOCK_KEY);
    if (redirectLock === '1') {
      setManualRetryVisible(true);
      return;
    }

    const timer = window.setTimeout(() => {
      signin();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [canRedirect]);

  useEffect(() => {
    if (auth.error) {
      sessionStorage.removeItem(REDIRECT_LOCK_KEY);
      redirectStartedRef.current = false;
      setManualRetryVisible(true);
    }
  }, [auth.error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        {!manualRetryVisible && !auth.error ? (
          <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <Spin size="small" />
            <span>Đang điều hướng xác thực SSO...</span>
          </div>
        ) : (
          <>
            <Alert
              className="w-full text-left"
              type={auth.error ? 'error' : 'info'}
              showIcon
              message={auth.error ? 'Không thể đăng nhập SSO' : 'Cần xác thực lại'}
              description={auth.error?.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại bằng SSO.'}
            />
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              loading={auth.isLoading || Boolean(auth.activeNavigator)}
              onClick={signin}
              className="h-11 w-full rounded-md bg-blue-600 font-semibold"
            >
              Đăng nhập bằng SSO
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
