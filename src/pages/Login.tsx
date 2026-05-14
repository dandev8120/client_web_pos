import React, { useEffect } from 'react';
import { Card, Button, Typography, Space, message, Layout, Divider, App } from 'antd';
import { GoogleOutlined, GithubOutlined, LoginOutlined, SecurityScanOutlined } from '@ant-design/icons';
import { motion } from 'motion/react';
import { useAuth } from 'react-oidc-context';

const { Title, Text } = Typography;

interface LoginProps {
  onLogin: (user: { name: string; role: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { message } = App.useApp();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      onLogin({
        name: auth.user.profile.name || auth.user.profile.preferred_username || 'OIDC User',
        role: 'admin' // In a real app, derive this from profile
      });
    }
  }, [auth.isAuthenticated, auth.user, onLogin]);

  const handleOIDCLogin = () => {
    auth.signinRedirect();
  };

  const handleOAuthLogin = async (provider: string) => {
    try {
      const res = await fetch('/api/auth/url');
      const { url } = await res.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        url,
        'oauth_popup',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err) {
      message.error('Failed to initiate login flow');
    }
  };

  const handleDemoLogin = () => {
    onLogin({ name: 'Demo Administrator', role: 'admin' });
    message.success('Logged in as Demo Admin');
  };

  if (auth.isLoading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text>Checking authentication...</Text>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', borderRadius: 12 }}>
          <Title level={2}>Admin Pro</Title>
          <Text type="secondary">Sign in to your admin dashboard</Text>
          
          <Space direction="vertical" style={{ width: '100%', marginTop: 32 }} size="middle">
            <Button 
              type="primary" 
              icon={<SecurityScanOutlined />} 
              block 
              size="large"
              onClick={handleOIDCLogin}
            >
              Sign in with OIDC
            </Button>

            <Divider>Standard Login</Divider>

            <Button 
              icon={<GoogleOutlined />} 
              block 
              size="large"
              onClick={() => handleOAuthLogin('google')}
            >
              Continue with Google
            </Button>
            <Button 
              icon={<GithubOutlined />} 
              block 
              size="large"
              onClick={() => handleOAuthLogin('github')}
            >
              Continue with GitHub
            </Button>
            
            <Divider>OR</Divider>
            
            <Button 
              type="dashed" 
              icon={<LoginOutlined />} 
              block 
              size="large"
              onClick={handleDemoLogin}
            >
              Use Demo Account
            </Button>
          </Space>
          
          <div style={{ marginTop: 24 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </div>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default Login;
