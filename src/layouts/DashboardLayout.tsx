import React, { useState, useMemo } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, theme, Badge, Input, Popover, Divider, AutoComplete, Modal } from 'antd';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CloseOutlined,
  BellOutlined,
  SearchOutlined,
  MessageOutlined,
  SettingOutlined,
  KeyOutlined,
  IdcardOutlined,
  MailOutlined,
  FormatPainterOutlined,
  LayoutOutlined,
  GlobalOutlined,
  CheckOutlined,
  HistoryOutlined,
  PlusOutlined,
  FolderOpenOutlined,
  SafetyCertificateOutlined,
  MoonOutlined,
  SunOutlined,
  RiseOutlined,
  FileTextOutlined,
  GiftOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Breadcrumb, Drawer, Radio, Tooltip, Tag } from 'antd';
import TopLoadingBar from '../components/TopLoadingBar';
import ErrorBoundary from '../components/ErrorBoundary';
import { canAccessUrl } from '../utils/rbacPresets';
import { Error403 } from '../pages/error/ErrorPages';
import appMetadata from '../../metadata.json';
import { APP_VERSION } from '../generated/version';

const { Header, Content, Sider, Footer } = Layout;
const { Title, Text } = Typography;

interface DashboardLayoutProps {
  user: { name: string; role?: string; [key: string]: any };
  onLogout: () => void;
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  layout: 'sidebar' | 'top';
  setLayout: (layout: 'sidebar' | 'top') => void;
}

function safeJsonParse(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readOidcProfile() {
  try {
    const oidcKey = Object.keys(localStorage).find(key => key.startsWith('oidc.user:'));
    const oidcUser = safeJsonParse(oidcKey ? localStorage.getItem(oidcKey) : null);
    return oidcUser?.profile || {};
  } catch {
    return {};
  }
}

function firstText(...values: any[]) {
  const found = values.find(value => value !== undefined && value !== null && String(value).trim() !== '');
  return found !== undefined ? String(found).trim() : '';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  onLogout, 
  themeMode, 
  setThemeMode, 
  layout, 
  setLayout 
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [userInfoVisible, setUserInfoVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = React.useRef<any>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (collapsed) {
          setCollapsed(false);
        }
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collapsed]);
  
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 992;
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { t, i18n } = useTranslation();

  const [notifications, setNotifications] = useState([
    { id: 1, title: t('notification_new_order'), desc: 'Order #ORD-2024-1001 just came in', time: '5 mins ago', read: false },
    { id: 2, title: t('notification_payment'), desc: 'Invoice #INV-001 has been paid', time: '1 hour ago', read: false },
    { id: 3, title: t('notification_inventory'), desc: 'Stock for "Gaming Laptop" is below threshold', time: '3 hours ago', read: true },
  ]);

  const handleLogout = () => {
    onLogout();
  };

  const openSsoAccountManagement = () => {
    const authority = (import.meta.env.VITE_OIDC_AUTHORITY || 'https://identityserver.bitisgroup.vn').replace(/\/+$/, '');
    const accountPath = import.meta.env.VITE_OIDC_ACCOUNT_MANAGEMENT_PATH || '/manage';
    window.location.assign(`${authority}${accountPath.startsWith('/') ? accountPath : `/${accountPath}`}`);
  };

  const openSsoChangePassword = () => {
    const authority = (import.meta.env.VITE_OIDC_AUTHORITY || 'https://identityserver.bitisgroup.vn').replace(/\/+$/, '');
    const returnUrl = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
    const targetUrl = new URL('/manage/changepassword', `${authority}/`);
    targetUrl.searchParams.set('returnUrl', returnUrl);
    window.location.assign(targetUrl.toString());
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const menuItems = [
    { key: '/', icon: <PieChartOutlined />, label: t('dashboard') },
    { 
      key: 'sales', 
      icon: <RiseOutlined />, 
      label: t('sales'),
      children: [
        { key: '/sales/orders', label: t('orders'), icon: <ShoppingCartOutlined /> },
        { key: '/sales/products', label: t('products'), icon: <AppstoreOutlined /> },
        { 
          key: 'sales-customers', 
          label: t('customers'), 
          icon: <TeamOutlined />,
          children: [
            { key: '/sales/customers', label: `${t('level')} 1 - ${t('module')} 1` },
            { 
              key: 'cust-lvl2', 
              label: `${t('level')} 2`,
              children: [
                { key: '/sales/customers?lvl3=1', label: `${t('level')} 3 - ${t('module')} 1` },
                { key: '/sales/customers?lvl3=2', label: `${t('level')} 3 - ${t('module')} 2` },
              ]
            }
          ]
        },
        { key: '/sales/promotions', label: 'Cấu hình Khuyến mãi', icon: <GiftOutlined /> },
      ]
    },
    { 
      key: 'level-demo', 
      icon: <FolderOpenOutlined />, 
      label: `${t('level')} 5 Demo`,
      children: [
        { 
          key: 'l2', label: `${t('level')} 2`,
          children: [
            { 
              key: 'l3', label: `${t('level')} 3`,
              children: [
                { 
                  key: 'l4', label: `${t('level')} 4`,
                  children: [
                    { 
                      key: 'l5', label: `${t('level')} 5`,
                      children: [
                        { key: '/demo/l5/m1', label: `${t('module')} 1` },
                        { key: '/demo/l5/m2', label: `${t('module')} 2` },
                      ]
                    },
                    { key: '/demo/l4/m2', label: `${t('module')} 2` },
                  ]
                },
                { key: '/demo/l3/m2', label: `${t('module')} 2` },
              ]
            },
            { key: '/demo/l2/m2', label: `${t('module')} 2` },
          ]
        }
      ]
    },
    { 
      key: 'system', 
      icon: <DesktopOutlined />, 
      label: t('system_settings'),
      children: [
        { key: '/system/rbac', label: 'Phân quyền & Vai trò (RBAC)', icon: <SafetyCertificateOutlined /> },
        { key: '/system/vat-config', label: 'Cấu hình UI VAT', icon: <SettingOutlined /> },
        { key: '/system/audit-logs', label: t('audit_logs'), icon: <HistoryOutlined /> },
        { key: '/system/forms', label: t('forms', 'Biểu mẫu'), icon: <LayoutOutlined /> },
        { key: '/system/icons', label: t('icons'), icon: <SafetyCertificateOutlined /> },
        { 
          key: 'errors', 
          label: t('error_pages'), 
          icon: <ExclamationCircleOutlined />,
          children: [
            { key: '/401', label: '401 Unauthorized' },
            { key: '/403', label: '403 Forbidden' },
            { key: '/404', label: '404 Not Found' },
            { key: '/500', label: '500 Server Error' },
            { key: '/503', label: '503 Service Unavailable' },
            { key: '/maintenance', label: 'Maintenance' },
            { key: '/upgrading', label: 'Upgrading' },
          ]
        },
      ]
    },
  ];

  // Live State for activeUserSession synchronized with localStorage
  const [activeUser, setActiveUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('@@WEB_POS_PORTAL');
      return saved ? JSON.parse(saved) : user;
    } catch {
      return user;
    }
  });

  React.useEffect(() => {
    const syncUser = () => {
      try {
        const saved = localStorage.getItem('@@WEB_POS_PORTAL');
        if (saved) {
          setActiveUser(JSON.parse(saved));
        } else {
          setActiveUser(user);
        }
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    };

    window.addEventListener('storage', syncUser);
    window.addEventListener('rbac-update', syncUser);
    window.addEventListener('authChange', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('rbac-update', syncUser);
      window.removeEventListener('authChange', syncUser);
    };
  }, [user]);

  // RBAC Permission Filter for Menu
  const userRoles = useMemo(() => {
    return activeUser?.roles || [activeUser?.role || 'user'];
  }, [activeUser]);

  const userAllowedUrls = activeUser?.allowedUrls;

  const displayUser = useMemo(() => {
    const profile = readOidcProfile();
    const roles = Array.isArray(user?.roles) ? user.roles : Array.isArray(activeUser?.roles) ? activeUser.roles : [];
    const role = firstText(user?.role, activeUser?.role, profile.role, roles[0]);
    const code = firstText(
      profile.employeeCode,
      profile.employee_code,
      profile.employeeId,
      profile.employee_id,
      activeUser?.employeeCode,
      activeUser?.employeeId,
      user?.employeeCode,
      user?.employeeId,
      profile.sub,
      activeUser?.id,
      user?.id
    );

    return {
      name: firstText(profile.name, profile.preferred_username, profile.nickname, user?.name, activeUser?.name, profile.email, 'OIDC User'),
      preferredUsername: firstText(profile.preferred_username, user?.preferred_username, activeUser?.preferred_username, user?.username, activeUser?.username),
      email: firstText(profile.email, user?.email, activeUser?.email),
      code,
      role,
    };
  }, [activeUser, user]);
  const displayUserMeta = firstText(displayUser.email, displayUser.code, displayUser.role);
  const userProfileRows = useMemo(() => [
    { key: 'name', label: 'Họ tên', value: displayUser.name, icon: <UserOutlined /> },
    { key: 'preferred_username', label: 'Mã nhân viên', value: displayUser.preferredUsername || 'Chưa có', icon: <IdcardOutlined /> },
    { key: 'email', label: 'Email', value: displayUser.email || 'Chưa có', icon: <MailOutlined /> },
  ], [displayUser]);

  const filteredMenuItems = useMemo(() => {
    const filterTree = (items: any[]): any[] => {
      return items
        .map(item => {
          if (item.children) {
            const validChildren = filterTree(item.children);
            if (validChildren.length > 0) {
              return { ...item, children: validChildren };
            }
            return null;
          }
          if (canAccessUrl(userAllowedUrls, item.key, userRoles)) {
            return item;
          }
          return null;
        })
        .filter(Boolean);
    };

    return filterTree(menuItems);
  }, [menuItems, userAllowedUrls, userRoles]);

  const isRouteAllowed = useMemo(() => {
    return canAccessUrl(userAllowedUrls, location.pathname, userRoles);
  }, [userAllowedUrls, location.pathname, userRoles]);

  // Flatten menu for search
  const searchableModules = useMemo(() => {
    const modules: { key: string; value: string; label: string; path: string }[] = [];
    const walk = (items: any[]) => {
      items.forEach(item => {
        if (item.children) {
          walk(item.children);
        } else {
          modules.push({ 
            key: item.key, 
            value: item.label, 
            label: `${item.label} (${item.key})`, 
            path: item.key 
          });
        }
      });
    };
    walk(filteredMenuItems);
    return modules;
  }, [filteredMenuItems, i18n.language]);

  const breadcrumbs = useMemo(() => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    
    const pathMap: Record<string, string> = {
      'orders': t('orders'),
      'products': t('products'),
      'customers': t('customers'),
      'invoices': t('invoices'),
      'forms': t('forms'),
      'icons': t('icons'),
      'sales': t('sales'),
      'system': 'System',
      'inventory': t('inventory'),
      'ui_elements': t('ui_elements'),
      'components': 'Components'
    };

    const homeItem = { title: <Link to="/">{t('home')}</Link> };
    
    if (location.pathname === '/' || location.pathname === '') {
      return [homeItem, { title: t('dashboard') }];
    }

    const breadcrumbItems = pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const snippet = pathSnippets[index];
      const label = pathMap[snippet] || snippet.charAt(0).toUpperCase() + snippet.slice(1);
      
      const isLast = index === pathSnippets.length - 1;
      return {
        title: isLast ? label : <Link to={url}>{label}</Link>,
      };
    });

    return [homeItem, ...breadcrumbItems];
  }, [location.pathname, t]);

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const currentLang = (i18n.language || 'vi').startsWith('en') ? 'en' : 'vi';

  const flagImages: Record<string, string> = {
    en: 'https://flagcdn.com/w20/us.png',
    vi: 'https://flagcdn.com/w20/vn.png',
  };

  const themeMenuItems = [
    { key: 'light', label: t('theme_light'), icon: <SunOutlined />, onClick: () => setThemeMode('light') },
    { key: 'dark', label: t('theme_dark'), icon: <MoonOutlined />, onClick: () => setThemeMode('dark') },
    { key: 'system', label: t('theme_system'), icon: <DesktopOutlined />, onClick: () => setThemeMode('system') },
  ];

  const langMenuItems = [
    { key: 'vi', label: <Space><img src="https://flagcdn.com/w20/vn.png" alt="VN" style={{ width: 18 }} /> Tiếng Việt</Space>, onClick: () => changeLanguage('vi') },
    { key: 'en', label: <Space><img src="https://flagcdn.com/w20/us.png" alt="US" style={{ width: 18 }} /> English</Space>, onClick: () => changeLanguage('en') },
  ];

  const notificationContent = (
    <div style={{ width: 320 }}>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        <span style={{ fontWeight: 600 }}>{t('notifications')}</span>
        {unreadCount > 0 && <Button type="link" size="small" onClick={markAllAsRead} style={{ padding: 0 }}>{t('mark_all_read')}</Button>}
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: token.colorTextSecondary }}>{t('no_notifications')}</div>
        ) : (
          notifications.map((item) => (
            <div 
              key={item.id} 
              onClick={() => markAsRead(item.id)}
              style={{ 
                padding: '12px 16px', 
                cursor: 'pointer', 
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                transition: 'all 0.2s',
                background: item.read ? 'transparent' : `${token.colorPrimaryBg}`
              }}
              className="notification-item"
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  background: item.title.includes('Order') ? token.colorInfoBg : (item.title.includes('Payment') ? token.colorSuccessBg : token.colorWarningBg),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {item.title.includes('Order') ? <ShoppingCartOutlined style={{ color: token.colorInfo }} /> : (item.title.includes('Payment') ? <CheckOutlined style={{ color: token.colorSuccess }} /> : <BellOutlined style={{ color: token.colorWarning }} />)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 13, fontWeight: item.read ? 500 : 700, lineHeight: '1.4' }}>{item.title}</div>
                    {!item.read && <Badge dot color={token.colorPrimary} />}
                  </div>
                  <div style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 2 }}>{item.desc}</div>
                  <div style={{ fontSize: 11, color: token.colorTextDescription, marginTop: 8 }}>{item.time}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Button type="link" block style={{ height: 44 }}>{t('view_all_notifications')}</Button>
      </div>
    </div>
  );

  const messageContent = (
    <div style={{ width: 300 }}>
      <div style={{ padding: '12px 16px', fontWeight: 'bold', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        {t('messages')}
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {[
          { user: 'Nguyen Van A', msg: 'Hi, can you check the shipping status?', time: '2 mins ago' },
          { user: 'Tran Thi B', msg: 'I received the invoice, thank you!', time: '10 mins ago' },
        ].map((item, index) => (
          <div 
            key={index} 
            style={{ 
              padding: '12px 16px', 
              cursor: 'pointer', 
              display: 'flex',
              gap: 12,
              borderBottom: index === 0 ? `1px solid ${token.colorBorderSecondary}` : 'none',
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Avatar icon={<UserOutlined />} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{item.user}</span>
                <span style={{ fontSize: 11, color: '#999' }}>{item.time}</span>
              </div>
              <div style={{ fontSize: 12, color: token.colorTextSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.msg}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Divider style={{ margin: 0 }} />
      <Button type="link" block>{t('check_all_messages')}</Button>
    </div>
  );

  const userMenuItems: any[] = [
    {
      key: 'user-info',
      label: (
        <div className="py-1 px-1 border-b border-slate-100 dark:border-slate-800 max-w-[220px] cursor-pointer">
          <div className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{displayUser.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{displayUserMeta}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'account-management',
      label: 'Quản lý tài khoản',
      icon: <UserOutlined />,
    },
    {
      key: 'change-password',
      label: 'Đổi mật khẩu',
      icon: <KeyOutlined />,
    },
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'user-info') {
      setUserInfoVisible(true);
      return;
    }
    if (key === 'account-management') {
      openSsoAccountManagement();
      return;
    }
    if (key === 'change-password') {
      openSsoChangePassword();
      return;
    }
    if (key === 'logout') {
      handleLogout();
    }
  };

  const logoSection = (isCollapsed: boolean, isSidebar: boolean) => {
    const logoUrl = (appMetadata as any)?.logoUrl;
    const projectName = (appMetadata as any)?.shortName || 'POS CENTER';

    return (
      <div style={{ 
        height: 64, 
        margin: isSidebar ? '16px 12px' : '0 24px 0 0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: (isCollapsed && isSidebar) ? 'center' : 'flex-start', 
        background: isSidebar ? (themeMode === 'dark' ? '#141414' : '#f8f9fa') : 'transparent', 
        borderRadius: 12, 
        padding: (isCollapsed && isSidebar) ? 0 : '0 16px', 
        flexShrink: 0 
      }}>
        <div style={{ 
          width: 34, 
          height: 34, 
          background: logoUrl ? 'transparent' : token.colorPrimary, 
          borderRadius: 8, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginRight: (isCollapsed && isSidebar) ? 0 : 12,
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={projectName} 
              referrerPolicy="no-referrer"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
            />
          ) : (
            <AppstoreOutlined style={{ color: '#fff', fontSize: 18 }} />
          )}
        </div>
        {(!(isCollapsed && isSidebar)) && (
          <Title level={4} style={{ margin: 0, color: token.colorText, fontSize: 18, whiteSpace: 'nowrap' }}>
            {projectName}
          </Title>
        )}
      </div>
    );
  };

  React.useEffect(() => {
    setMobileMenuVisible(false);
  }, [location.pathname]);

  const mainMenu = (mode: 'horizontal' | 'inline') => (
    <Menu 
      theme={themeMode === 'dark' ? 'dark' : 'light'} 
      selectedKeys={[location.pathname]} 
      mode={mode} 
      items={filteredMenuItems} 
      onClick={({ key }) => {
        navigate(key);
        setMobileMenuVisible(false);
      }}
      style={{ 
        border: 'none', 
        background: 'transparent',
        flex: mode === 'horizontal' ? 1 : 'none',
        minWidth: 0
      }}
    />
  );

  const mobileSettingsMenuItems = [
    {
      key: 'theme',
      label: 'Giao diện',
      icon: themeMode === 'light' ? <SunOutlined /> : themeMode === 'dark' ? <MoonOutlined /> : <DesktopOutlined />,
      children: [
        { key: 'theme-light', label: t('theme_light'), icon: <SunOutlined />, onClick: () => setThemeMode('light') },
        { key: 'theme-dark', label: t('theme_dark'), icon: <MoonOutlined />, onClick: () => setThemeMode('dark') },
        { key: 'theme-system', label: t('theme_system'), icon: <DesktopOutlined />, onClick: () => setThemeMode('system') },
      ]
    },
    {
      key: 'settings',
      label: 'Cấu hình hệ thống',
      icon: <SettingOutlined />,
      onClick: () => {
        setSettingsVisible(true);
        setMobileMenuVisible(false);
      }
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        setMobileMenuVisible(false);
        handleLogout();
      }
    }
  ];

  const getSidebarContent = (isDrawer: boolean = false) => {
    const isCollapsed = isDrawer ? false : collapsed;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: isDrawer ? 8 : 0 }}>
          <div style={{ flex: 1 }}>{logoSection(isCollapsed, true)}</div>
          {isDrawer && (
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={() => setMobileMenuVisible(false)}
              style={{ fontSize: 16, marginRight: 8 }}
            />
          )}
        </div>
        <div style={{ padding: isCollapsed ? '4px 8px' : '4px 12px', marginBottom: 8 }}>
          <AutoComplete
            options={searchableModules}
            style={{ width: '100%' }}
            onSelect={(value, option) => {
              navigate(option.path);
              setSearchValue('');
              if (isDrawer) setMobileMenuVisible(false);
            }}
            filterOption={(inputValue, option) =>
              option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
          >
            <Input
              ref={searchInputRef}
              placeholder={isCollapsed ? "..." : "Tìm nhanh (Ctrl+K)..."}
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              suffix={!isCollapsed && <Tag className="text-[10px] bg-slate-100 text-slate-500 font-mono border-slate-200 m-0">Ctrl K</Tag>}
              variant="borderless"
              style={{
                borderRadius: 8,
                background: themeMode === 'dark' ? '#262626' : '#f5f5f5',
                fontSize: 12
              }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </AutoComplete>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }} className="custom-scrollbar">
          {mainMenu('inline')}
        </div>

        {/* Sidebar Footer - Only rendered on Mobile/Tablet Drawer */}
        {isDrawer && (
          <div style={{ 
            borderTop: `1px solid ${token.colorBorderSecondary}`, 
            padding: '12px 14px',
            background: themeMode === 'dark' ? '#141414' : '#fafafa'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar style={{ backgroundColor: token.colorPrimary }} icon={<UserOutlined />} size="small" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{displayUser.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono truncate">{displayUserMeta}</span>
                </div>
              </div>

              <Dropdown menu={{ items: mobileSettingsMenuItems }} placement="topRight" trigger={['click']}>
                <Button 
                  type="text" 
                  icon={<SettingOutlined className="text-slate-600 dark:text-slate-300" />} 
                  style={{ borderRadius: 8 }}
                />
              </Dropdown>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {layout === 'sidebar' && !isTablet && (
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          theme={themeMode === 'dark' ? 'dark' : 'light'}
          width={260}
          style={{
            boxShadow: themeMode === 'dark' ? 'none' : '2px 0 8px 0 rgba(29,35,41,.05)',
            zIndex: 100,
            position: 'sticky',
            top: 0,
            height: '100vh',
            borderRight: themeMode === 'dark' ? `1px solid ${token.colorBorderSecondary}` : 'none'
          }}
        >
          {getSidebarContent(false)}
        </Sider>
      )}

      <Drawer
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={280}
        styles={{ body: { padding: 0 } }}
        closable={false}
      >
        <div 
          style={{ height: '100%', background: themeMode === 'dark' ? '#001529' : '#fff' }} 
        >
          {getSidebarContent(true)}
        </div>
      </Drawer>
      <Layout>
        <Header style={{ 
          padding: isMobile ? '0 12px' : '0 24px', 
          background: token.colorBgContainer, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          position: 'sticky',
          top: 0,
          zIndex: 99,
          width: '100%',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0, gap: isMobile ? 8 : 16 }}>
            {layout === 'sidebar' ? (
              <Button
                type="text"
                icon={isTablet ? (mobileMenuVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />) : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
                onClick={() => isTablet ? setMobileMenuVisible(prev => !prev) : setCollapsed(prev => !prev)}
                style={{ fontSize: '18px', width: 40, height: 40, flexShrink: 0 }}
              />
            ) : (
              isTablet ? (
                <Button
                  type="text"
                  icon={mobileMenuVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                  onClick={() => setMobileMenuVisible(prev => !prev)}
                  style={{ fontSize: '18px', width: 40, height: 40, flexShrink: 0 }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flexShrink: 0 }}>
                  {logoSection(false, false)}
                  <div style={{ minWidth: 0 }}>
                    {mainMenu('horizontal')}
                  </div>
                </div>
              )
            )}

            {/* Breadcrumbs moved into Header */}
            <div style={{ minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flexShrink: 1 }}>
              <Breadcrumb 
                separator=">" 
                items={breadcrumbs} 
                style={{ fontSize: isMobile ? 12 : 13 }} 
              />
            </div>
          </div>
          <Space size={isMobile ? "small" : "middle"} style={{ marginLeft: 12, display: 'flex', alignItems: 'center' }} align="center">
            {!isMobile && (
              <Dropdown menu={{ items: themeMenuItems }} placement="bottomRight" trigger={['click']}>
                <Tooltip title={themeMode === 'light' ? t('theme_light') : themeMode === 'dark' ? t('theme_dark') : t('theme_system')}>
                  <Button 
                    type="text" 
                    icon={themeMode === 'light' ? <SunOutlined /> : themeMode === 'dark' ? <MoonOutlined /> : <DesktopOutlined />} 
                    style={{ color: themeMode === 'dark' ? '#faad14' : 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 32, width: 32 }}
                  />
                </Tooltip>
              </Dropdown>
            )}

            {!isMobile && (
              <Tooltip title="Settings">
                <Button type="text" icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 32, width: 32 }} />
              </Tooltip>
            )}

            <Dropdown menu={{ items: langMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button type="text" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: isMobile ? '0 4px' : '4px 12px', height: 32 }}>
                <img src={flagImages[currentLang]} alt={currentLang} style={{ width: 18, height: 'auto', borderRadius: 2 }} />
                {!isMobile && <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1 }}>{currentLang === 'vi' ? 'Tiếng Việt' : 'English'}</span>}
              </Button>
            </Dropdown>
            
            {!isMobile && (
              <Popover content={messageContent} trigger="click" placement="bottomRight">
                <Badge count={2} size="small" offset={[-2, 4]}>
                  <Button type="text" icon={<MessageOutlined style={{ fontSize: 18 }} />} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 32, width: 32 }} />
                </Badge>
              </Popover>
            )}

            <Popover content={notificationContent} trigger="click" placement="bottomRight">
              <Badge count={unreadCount} dot={unreadCount > 0} color="red" offset={[-2, 4]}>
                <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 32, width: 32 }} />
              </Badge>
            </Popover>

            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight" trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', height: 32, padding: '0 4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.2 }}>
                  <Typography.Text strong style={{ fontSize: 13, lineHeight: '16px', display: 'block' }}>{displayUser.name}</Typography.Text>
                  {!isMobile && (
                    <Typography.Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace', lineHeight: '14px', display: 'block' }}>{displayUserMeta}</Typography.Text>
                  )}
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>
        <TopLoadingBar />
        <Content style={{ margin: isMobile ? '12px 12px 0' : '16px 20px 0', overflow: 'initial' }}>
          <div key={location.pathname} style={{ minHeight: 'calc(100vh - 160px)' }}>
            <ErrorBoundary>
              {isRouteAllowed ? <Outlet /> : <Error403 />}
            </ErrorBoundary>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', color: token.colorTextSecondary, fontSize: 13 }}>
          <Space size={8} wrap style={{ justifyContent: 'center' }}>
            <span>
              {(appMetadata as any)?.footer || "© 2026 Công ty TNHH Sản Xuất Hàng Tiêu Dùng Bình Tiên (Biti's). Bản quyền thuộc về POS CENTER."}
            </span>
            <Tag color="blue" bordered={false} style={{ marginInlineEnd: 0, fontFamily: 'monospace' }}>
              {APP_VERSION.fullDisplay}
            </Tag>
          </Space>
        </Footer>
      </Layout>

      <Drawer
        title={t('theme_settings')}
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={300}
      >
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 12 }}><FormatPainterOutlined /> {t('theme_mode')}</Text>
          <Radio.Group value={themeMode} onChange={(e) => setThemeMode(e.target.value)} buttonStyle="solid">
            <Radio.Button value="light">{t('theme_light')}</Radio.Button>
            <Radio.Button value="dark">{t('theme_dark')}</Radio.Button>
            <Radio.Button value="system">{t('theme_system')}</Radio.Button>
          </Radio.Group>
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 12 }}><LayoutOutlined /> {t('layout_style')}</Text>
          <div style={{ display: 'flex', gap: 12 }}>
            <div 
              style={{ 
                cursor: 'pointer', 
                border: `2px solid ${layout === 'sidebar' ? token.colorPrimary : 'transparent'}`,
                padding: 4,
                borderRadius: 8
              }}
              onClick={() => setLayout('sidebar')}
            >
              <div style={{ width: 60, height: 40, background: '#f0f2f5', display: 'flex', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '30%', background: '#001529' }} />
                <div style={{ flex: 1, padding: 4 }}>
                  <div style={{ width: '100%', height: 4, background: '#fff' }} />
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>{t('sidebar')}</Text>
            </div>
            <div 
              style={{ 
                cursor: 'pointer', 
                border: `2px solid ${layout === 'top' ? token.colorPrimary : 'transparent'}`,
                padding: 4,
                borderRadius: 8
              }}
              onClick={() => setLayout('top')}
            >
              <div style={{ width: 60, height: 40, background: '#f0f2f5', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '20%', background: '#001529' }} />
                <div style={{ flex: 1, padding: 4 }}>
                  <div style={{ width: '100%', height: 4, background: '#fff' }} />
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>{t('top_nav')}</Text>
            </div>
          </div>
        </div>
      </Drawer>

      <Modal
        title="Thông tin người dùng"
        open={userInfoVisible}
        onCancel={() => setUserInfoVisible(false)}
        footer={null}
        width={430}
      >
        <div style={{ paddingTop: 4 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              marginBottom: 16,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 8,
              background: token.colorFillAlter,
            }}
          >
            <Avatar
              size={44}
              style={{
                background: token.colorPrimary,
                fontWeight: 700,
              }}
            >
              {(displayUser.name.charAt(0) || 'U').toUpperCase()}
            </Avatar>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: token.colorText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayUser.name}
              </div>
              <div style={{ marginTop: 2, fontSize: 12, fontWeight: 600, color: token.colorPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayUser.preferredUsername || 'OIDC Profile'}
              </div>
            </div>
          </div>

          <div
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 8,
              overflow: 'hidden',
              background: token.colorBgContainer,
            }}
          >
            {userProfileRows.map(item => (
              <div
                key={item.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '150px minmax(0, 1fr)',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderBottom: item.key === userProfileRows[userProfileRows.length - 1].key ? 'none' : `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, color: token.colorTextSecondary, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: token.colorPrimary, lineHeight: 1 }}>
                  {item.icon}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                </div>
                <div style={{ minWidth: 0, color: token.colorText, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <Button type="primary" block style={{ marginTop: 16 }} onClick={() => setUserInfoVisible(false)}>
            Đóng
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default DashboardLayout;
