import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Layout, App, Tag, Segmented, Row, Col, Alert, Divider } from 'antd';
import { 
  SecurityScanOutlined, 
  SafetyCertificateOutlined, 
  LoginOutlined, 
  UserOutlined, 
  CheckCircleOutlined, 
  SyncOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { motion } from 'motion/react';
import { useAuth } from 'react-oidc-context';
import mockData from '../data/mockAuthData.json';

const { Title, Text, Paragraph } = Typography;

export interface MockUserSeed {
  id: string;
  username: string;
  name: string;
  email: string;
  roleTitle: string;
  roles: string[];
  allowedUrls: string[];
  buttonPermissions: string[];
  avatarBg: string;
  description: string;
  jwtToken: string;
  isExpired?: boolean;
}

interface LoginProps {
  onLogin?: (usePopup?: boolean) => void;
  onMockLogin?: (userData: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onMockLogin }) => {
  const { message } = App.useApp();
  const auth = useAuth();

  const isMockDefault = import.meta.env.VITE_USE_MOCK_AUTH === 'true' || import.meta.env.VITE_USE_MOCK_AUTH === true || import.meta.env.VITE_USE_MOCK_AUTH === undefined;
  const [authMode, setAuthMode] = useState<'mock' | 'sso'>(isMockDefault ? 'mock' : 'sso');

  const authorityUrl = import.meta.env.VITE_OIDC_AUTHORITY || 'https://identityserver.bitisgroup.vn';
  const clientId = import.meta.env.VITE_OIDC_CLIENT_ID || 'sso_portal_v2_web_client_client_id_prod';
  const redirectUri = import.meta.env.VITE_OIDC_REDIRECT_URI || `${window.location.origin}/signin-oidc`;
  const scope = import.meta.env.VITE_OIDC_SCOPE || 'openid email profile roles';

  const mockUsers: MockUserSeed[] = mockData.users || [];
  const [selectedMockUser, setSelectedMockUser] = useState<MockUserSeed>(mockUsers[0]);

  const handleOidcLogin = (usePopup = false) => {
    message.loading({ content: 'Đang chuyển hướng đến IdentityServer Biti\'s SSO...', key: 'oidc' });

    if (onLogin) {
      onLogin(usePopup);
      return;
    }

    if (usePopup) {
      auth.signinPopup().catch((err) => {
        console.warn('signinPopup error:', err);
      });
      return;
    }

    if (auth && typeof auth.signinRedirect === 'function') {
      auth.signinRedirect().catch(() => {
        const authorizeUrl = `${authorityUrl}/connect/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
        window.location.href = authorizeUrl;
      });
    } else {
      const authorizeUrl = `${authorityUrl}/connect/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
      window.location.href = authorizeUrl;
    }
  };

  const handleExecuteMockLogin = (usr: MockUserSeed) => {
    message.success(`Đăng nhập giả lập thành công: ${usr.name} (${usr.roleTitle})`);
    const sessionData = {
      name: usr.name,
      email: usr.email,
      role: usr.roles[0],
      roles: usr.roles,
      allowedUrls: usr.allowedUrls,
      buttonPermissions: usr.buttonPermissions,
      token: usr.jwtToken,
      isExpired: usr.isExpired || false,
    };
    if (onMockLogin) {
      onMockLogin(sessionData);
    }
  };

  // Auto-redirect to IdentityServer only if explicitly in SSO mode and not authenticated
  useEffect(() => {
    if (authMode === 'sso' && !auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator) {
      const timer = setTimeout(() => {
        handleOidcLogin(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [authMode, auth.isAuthenticated, auth.isLoading, auth.activeNavigator]);

  return (
    <Layout className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl z-10 my-6"
      >
        <div className="bg-slate-800/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden text-white">
          {/* Header Bar */}
          <div className="p-6 bg-slate-900/60 border-b border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <SecurityScanOutlined className="text-2xl" />
              </div>
              <div>
                <Title level={4} className="!text-white font-black m-0 tracking-tight">
                  WEB POS & ERP PORTAL
                </Title>
                <Text className="text-slate-400 text-xs">
                  Xác thực Phân quyền Biti's SSO & Seed Data Testing Sandbox
                </Text>
              </div>
            </div>

            {/* Mode Selector Toggle */}
            <div className="bg-slate-900 p-1 rounded-2xl border border-slate-700/80">
              <Segmented
                value={authMode}
                onChange={(val) => setAuthMode(val as 'mock' | 'sso')}
                options={[
                  {
                    label: (
                      <div className="flex items-center gap-1.5 px-2 py-1 font-semibold text-xs">
                        <ExperimentOutlined className="text-amber-400" />
                        <span>Seed Data (Giả lập)</span>
                      </div>
                    ),
                    value: 'mock',
                  },
                  {
                    label: (
                      <div className="flex items-center gap-1.5 px-2 py-1 font-semibold text-xs">
                        <SafetyCertificateOutlined className="text-blue-400" />
                        <span>IdentityServer (SSO Thật)</span>
                      </div>
                    ),
                    value: 'sso',
                  },
                ]}
                className="custom-segmented-dark"
              />
            </div>
          </div>

          <div className="p-6">
            {authMode === 'mock' ? (
              <div>
                <Alert
                  message="Chế độ Seed Data Auth (VITE_USE_MOCK_AUTH = true)"
                  description="Dữ liệu xác thực được khởi tạo từ file JSON seed data (/src/data/mockAuthData.json). Bạn có thể chọn bất kỳ vai trò nào bên dưới để kiểm thử tính năng hiển thị Menu, phân quyền Nút bấm (Button Permissions) và trang lỗi RBAC."
                  type="info"
                  showIcon
                  className="mb-6 bg-blue-950/40 border-blue-800/60 text-blue-200 rounded-2xl"
                />

                <Title level={5} className="!text-slate-200 mb-4 flex items-center gap-2">
                  <UserOutlined className="text-blue-400" />
                  <span>Chọn Tài Khoản Kiểm Thử (Seed Users):</span>
                </Title>

                <Row gutter={[16, 16]} className="mb-6">
                  {mockUsers.map((usr) => {
                    const isSelected = selectedMockUser.id === usr.id;
                    return (
                      <Col xs={24} sm={12} key={usr.id}>
                        <div
                          onClick={() => setSelectedMockUser(usr)}
                          className={`cursor-pointer transition-all duration-200 p-4 rounded-2xl border-2 relative ${
                            isSelected
                              ? 'border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-500/10'
                              : 'border-slate-700/70 bg-slate-900/50 hover:border-slate-600'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 text-blue-400 text-lg">
                              <CheckCircleOutlined />
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md"
                              style={{ backgroundColor: usr.avatarBg }}
                            >
                              {usr.name ? (usr.name.split(' ').slice(-1)[0]?.[0] || 'U') : 'U'}
                            </div>

                            <div className="flex-1 pr-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-100 text-sm">{usr.name}</span>
                                {usr.roles.map((r) => (
                                  <Tag key={r} color="blue" className="text-[10px] font-mono border-0">
                                    {r}
                                  </Tag>
                                ))}
                              </div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{usr.email}</div>
                              <div className="text-xs font-semibold text-blue-300 mt-1">{usr.roleTitle}</div>
                              <p className="text-xs text-slate-400 mt-2 mb-0 line-clamp-2">{usr.description}</p>
                            </div>
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                      style={{ backgroundColor: selectedMockUser.avatarBg }}
                    >
                      {selectedMockUser.name ? (selectedMockUser.name.split(' ').slice(-1)[0]?.[0] || 'U') : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        Sẵn sàng vào ứng dụng: <span className="text-blue-400">{selectedMockUser.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Vai trò: {selectedMockUser.roles.join(', ')}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    icon={<LoginOutlined />}
                    onClick={() => handleExecuteMockLogin(selectedMockUser)}
                    className="bg-blue-600 hover:bg-blue-500 h-11 px-8 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 border-0 w-full sm:w-auto"
                  >
                    Vào POS Portal (Giả lập)
                  </Button>
                </div>
              </div>
            ) : (
              /* IdentityServer SSO Mode */
              <div className="py-4 space-y-6 text-center">
                <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">Xác thực IdentityServer SSO</span>
                    <Tag color="blue" className="m-0 font-mono text-[10px]">OpenID Connect</Tag>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 shrink-0">
                      <SafetyCertificateOutlined className="text-2xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-xs font-bold font-mono truncate">{authorityUrl}</div>
                      <div className="text-slate-400 text-[11px] font-mono mt-0.5 truncate">Client ID: {clientId}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs text-amber-400">
                    <SyncOutlined spin />
                    <span>Đang sẵn sàng kết nối đến Biti's SSO IdentityServer...</span>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={<LoginOutlined />}
                  loading={auth.isLoading}
                  onClick={() => handleOidcLogin(false)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 h-12 px-10 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/30 border-0 max-w-md w-full"
                >
                  Đăng Nhập SSO Ngay
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Login;
