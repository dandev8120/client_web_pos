import React, { useState, useMemo } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, theme, Badge, Input, Popover, Divider, AutoComplete } from 'antd';
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
  BellOutlined,
  SearchOutlined,
  MessageOutlined,
  SettingOutlined,
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
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Breadcrumb, Drawer, Radio, Tooltip } from 'antd';

const { Header, Content, Sider, Footer } = Layout;
const { Title, Text } = Typography;

interface DashboardLayoutProps {
  user: { name: string; role: string };
  onLogout: () => void;
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  layout: 'sidebar' | 'top';
  setLayout: (layout: 'sidebar' | 'top') => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  onLogout, 
  themeMode, 
  setThemeMode, 
  layout, 
  setLayout 
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { t, i18n } = useTranslation();
  const auth = useAuth();

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Order Received', desc: 'Order #ORD-2024-1001 just came in', time: '5 mins ago', read: false },
    { id: 2, title: 'Payment Confirmed', desc: 'Invoice #INV-001 has been paid', time: '1 hour ago', read: false },
    { id: 3, title: 'Inventory Alert', desc: 'Stock for "Gaming Laptop" is below threshold', time: '3 hours ago', read: true },
  ]);

  const handleLogout = () => {
    if (auth.isAuthenticated) {
      auth.removeUser();
    }
    onLogout();
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const menuItems = [
    { key: '/', icon: <PieChartOutlined />, label: t('dashboard') },
    { 
      key: 'sales', 
      icon: <ShoppingCartOutlined />, 
      label: t('sales'),
      children: [
        { key: '/orders', label: t('orders'), icon: <HistoryOutlined /> },
        { key: '/invoices', label: t('invoices'), icon: <FileOutlined /> },
      ]
    },
    { 
      key: 'inventory', 
      icon: <AppstoreOutlined />, 
      label: t('inventory'),
      children: [
        { key: '/products', label: t('products'), icon: <PlusOutlined /> },
      ]
    },
    { key: '/customers', icon: <TeamOutlined />, label: t('customers') },
    { 
      key: 'ui_elements', 
      icon: <DesktopOutlined />, 
      label: t('ui_elements'),
      children: [
        { 
          key: 'components', 
          label: 'Components',
          icon: <FolderOpenOutlined />,
          children: [
            { key: '/forms', label: t('forms'), icon: <FileOutlined /> },
            { key: '/icons', label: t('icons'), icon: <SafetyCertificateOutlined /> },
          ]
        },
      ]
    },
  ];

  // Flatten menu for search
  const searchableModules = useMemo(() => {
    const modules: { value: string; label: string; path: string }[] = [];
    const walk = (items: any[]) => {
      items.forEach(item => {
        if (item.children) {
          walk(item.children);
        } else {
          modules.push({ value: item.label, label: item.label, path: item.key });
        }
      });
    };
    walk(menuItems);
    return modules;
  }, [menuItems, i18n.language]);

  const breadcrumbs = location.pathname.split('/').filter(i => i).map((sub, index, arr) => {
    const url = `/${arr.slice(0, index + 1).join('/')}`;
    return {
      title: <Link to={url}>{t(sub) || sub.charAt(0).toUpperCase() + sub.slice(1)}</Link>,
    };
  });

  const fullBreadcrumbs = [{ title: <Link to="/">{t('dashboard')}</Link> }, ...breadcrumbs];

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

  const flagImages: Record<string, string> = {
    en: 'https://flagcdn.com/w20/us.png',
    vi: 'https://flagcdn.com/w20/vn.png',
    zh: 'https://flagcdn.com/w20/cn.png',
  };

  const langMenuItems = [
    { key: 'en', label: <Space><img src="https://flagcdn.com/w20/us.png" alt="US" style={{ width: 18 }} /> English</Space>, onClick: () => changeLanguage('en') },
    { key: 'vi', label: <Space><img src="https://flagcdn.com/w20/vn.png" alt="VN" style={{ width: 18 }} /> Tiếng Việt</Space>, onClick: () => changeLanguage('vi') },
    { key: 'zh', label: <Space><img src="https://flagcdn.com/w20/cn.png" alt="CN" style={{ width: 18 }} /> 中文</Space>, onClick: () => changeLanguage('zh') },
  ];

  const notificationContent = (
    <div style={{ width: 320 }}>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        <span style={{ fontWeight: 'bold' }}>{t('notifications')}</span>
        {unreadCount > 0 && <Button type="link" size="small" onClick={markAllAsRead}>{t('mark_as_read')}</Button>}
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: token.colorTextSecondary }}>{t('no_data')}</div>
        ) : (
          notifications.map((item) => (
            <div 
              key={item.id} 
              onClick={() => markAsRead(item.id)}
              style={{ 
                padding: '12px 16px', 
                cursor: 'pointer', 
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                transition: 'background 0.3s',
                background: item.read ? 'transparent' : `${token.colorPrimaryBg}`
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = item.read ? '#f5f5f5' : `${token.colorPrimaryBgHover}`)}
              onMouseOut={(e) => (e.currentTarget.style.background = item.read ? 'transparent' : `${token.colorPrimaryBg}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: item.read ? 400 : 600 }}>{item.title}</div>
                {!item.read && <Badge dot color="blue" />}
              </div>
              <div style={{ fontSize: 12, color: token.colorTextSecondary }}>{item.desc}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: '#999' }}>{item.time}</span>
                <Button type="text" size="small" style={{ height: 20, padding: '0 4px', fontSize: 11 }}>{t('view_details')}</Button>
              </div>
            </div>
          ))
        )}
      </div>
      <Divider style={{ margin: 0 }} />
      <Button type="link" block>{t('view_all_notifications') || 'View All Notifications'}</Button>
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
      <Button type="link" block>Check all messages</Button>
    </div>
  );

  const userMenuItems = [
    { key: 'profile', label: t('profile'), icon: <UserOutlined /> },
    { key: 'logout', label: t('logout'), icon: <LogoutOutlined />, onClick: handleLogout },
  ];

  const sidebarContent = (
    <>
      <div style={{ height: 64, margin: '16px 12px', display: 'flex', alignItems: 'center', justifyContent: (collapsed && layout === 'sidebar') ? 'center' : 'flex-start', background: themeMode === 'dark' ? '#141414' : '#f8f9fa', borderRadius: 12, padding: (collapsed && layout === 'sidebar') ? 0 : '0 16px' }}>
         <div style={{ width: 32, height: 32, background: token.colorPrimary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: (collapsed && layout === 'sidebar') ? 0 : 12 }}>
            <AppstoreOutlined style={{ color: '#fff', fontSize: 18 }} />
         </div>
         {(!(collapsed && layout === 'sidebar')) && <Title level={4} style={{ margin: 0, color: token.colorText, fontSize: 18 }}>Admin Pro</Title>}
      </div>
      <Menu 
        theme={themeMode === 'dark' ? 'dark' : 'light'} 
        selectedKeys={[location.pathname]} 
        mode={layout === 'top' ? 'horizontal' : 'inline'} 
        items={menuItems} 
        onClick={({ key }) => navigate(key)}
        style={{ border: 'none', flex: layout === 'top' ? 1 : 'unset' }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {layout === 'sidebar' && (
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          theme={themeMode === 'dark' ? 'dark' : 'light'}
          width={260}
          style={{
            boxShadow: themeMode === 'dark' ? 'none' : '2px 0 8px 0 rgba(29,35,41,.05)',
            zIndex: 10,
            position: 'sticky',
            top: 0,
            height: '100vh',
            borderRight: themeMode === 'dark' ? `1px solid ${token.colorBorderSecondary}` : 'none'
          }}
        >
          {sidebarContent}
        </Sider>
      )}
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: token.colorBgContainer, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Space size="middle" style={{ flex: layout === 'top' ? 1 : 'unset' }}>
            {layout === 'sidebar' ? (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '18px', width: 40, height: 40 }}
              />
            ) : sidebarContent}
            
            {layout === 'sidebar' && (
              <AutoComplete
                options={searchableModules}
                style={{ width: 240 }}
                onSelect={(value, option) => {
                  navigate(option.path);
                  setSearchValue('');
                }}
                filterOption={(inputValue, option) =>
                  option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
              >
                <Input 
                  placeholder={t('search_placeholder')} 
                  prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                  variant="borderless"
                  style={{ borderRadius: 8, background: themeMode === 'dark' ? '#262626' : '#f5f5f5' }}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </AutoComplete>
            )}
          </Space>
          <Space size="large">
            <Tooltip title={t('toggle_theme')}>
              <Button 
                type="text" 
                icon={themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />} 
                onClick={toggleTheme} 
                style={{ color: themeMode === 'dark' ? '#faad14' : 'inherit' }}
              />
            </Tooltip>

            <Tooltip title="Settings">
              <Button type="text" icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)} />
            </Tooltip>

            <Dropdown menu={{ items: langMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {flagImages[i18n.language] ? (
                  <img src={flagImages[i18n.language]} alt={i18n.language} style={{ width: 20, height: 'auto', borderRadius: 2 }} />
                ) : (
                  <span style={{ fontSize: 18 }}>🌐</span>
                )}
                <span style={{ fontSize: 13, fontWeight: 500 }}>{i18n.language.toUpperCase()}</span>
              </Button>
            </Dropdown>
            
            <Popover content={messageContent} trigger="click" placement="bottomRight">
              <Badge count={2} size="small" offset={[-2, 8]}>
                <Button type="text" icon={<MessageOutlined style={{ fontSize: 18 }} />} />
              </Badge>
            </Popover>

            <Popover content={notificationContent} trigger="click" placement="bottomRight">
              <Badge count={unreadCount} dot={unreadCount > 0} color="red" offset={[-2, 8]}>
                <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
              </Badge>
            </Popover>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: token.colorPrimary }} icon={<UserOutlined />} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <Typography.Text strong style={{ fontSize: 13 }}>{user.name}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>{user.role.toUpperCase()}</Typography.Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}>
          <div style={{ marginBottom: 16 }}>
            <Breadcrumb items={fullBreadcrumbs} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ minHeight: 'calc(100vh - 200px)' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Content>
        <Footer style={{ textAlign: 'center', color: token.colorTextSecondary }}>
          Admin Pro Design ©2026 Created by Antigravity | v1.2.0 | <GlobalOutlined /> {t('dashboard')}
        </Footer>
      </Layout>

      <Drawer
        title="Theme Settings"
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={300}
      >
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 12 }}><FormatPainterOutlined /> Theme Mode</Text>
          <Radio.Group value={themeMode} onChange={(e) => setThemeMode(e.target.value)} buttonStyle="solid">
            <Radio.Button value="light">Light</Radio.Button>
            <Radio.Button value="dark">Dark</Radio.Button>
            <Radio.Button value="system">System</Radio.Button>
          </Radio.Group>
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 12 }}><LayoutOutlined /> Layout Style</Text>
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
              <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>Sidebar</Text>
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
              <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>Top Nav</Text>
            </div>
          </div>
        </div>
      </Drawer>
    </Layout>
  );
};

export default DashboardLayout;
