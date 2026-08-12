import React, { useState } from 'react';
import { Card, Typography, Space, Button, Divider, Tabs, theme } from 'antd';
import { FilterOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface PageContainerProps {
  title?: React.ReactNode;
  subtitle?: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  searchForm?: React.ReactNode;
  tabItems?: { key: string; label: string; children: React.ReactNode }[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  defaultSearchOpen?: boolean;
  statsContent?: React.ReactNode;
  noCard?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  extra,
  children,
  searchForm,
  tabItems,
  activeTab,
  onTabChange,
  defaultSearchOpen = false,
  statsContent,
  noCard = false,
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(defaultSearchOpen);
  const [contentVisible, setContentVisible] = useState(true);

  const isMobile = window.innerWidth < 768;

  return (
    <div className="page-container">
      {(title || subtitle || extra || searchForm) && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'stretch' : 'flex-start', 
          marginBottom: (title || subtitle || extra || searchForm) ? (isMobile ? 12 : 16) : 0,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 12 : 0
        }}>
          {(title || subtitle) && (
            <div style={{ overflow: 'hidden' }}>
              {title && <Title level={isMobile ? 4 : 3} style={{ margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{title}</Title>}
              {subtitle && <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>{subtitle}</Text>}
            </div>
          )}
          {(extra || searchForm) && (
            <Space wrap={isMobile} style={{ width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
              {searchForm && (
                <Button 
                  icon={searchOpen ? <UpOutlined /> : <FilterOutlined />} 
                  onClick={() => setSearchOpen(!searchOpen)}
                  type={searchOpen ? 'primary' : 'default'}
                  size={isMobile ? 'small' : 'middle'}
                >
                  {isMobile ? '' : (searchOpen ? 'Thu' : 'Mở')}
                </Button>
              )}
              {extra}
            </Space>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {searchForm && (
          <motion.div
            initial={defaultSearchOpen ? "open" : "collapsed"}
            animate={searchOpen ? "open" : "collapsed"}
            variants={{
              open: { height: 'auto', opacity: 1, marginBottom: 24, display: 'block' },
              collapsed: { height: 0, opacity: 0, marginBottom: 0, transitionEnd: { display: 'none' } }
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: 'hidden' }}
          >
            <Card variant="borderless" styles={{ body: { padding: isMobile ? 12 : 24 } }} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {searchForm}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statsContent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ marginBottom: 24 }}
          >
            {statsContent}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        {tabItems ? (
          <Card variant="borderless" styles={{ body: { padding: isMobile ? '0 12px 12px' : '0 24px 24px' } }} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={onTabChange} 
              items={tabItems}
              animated={{ inkBar: true, tabPane: true }}
            />
          </Card>
        ) : noCard ? (
          children
        ) : (
          <Card variant="borderless" styles={{ body: { padding: isMobile ? 12 : 24 } }} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {children}
          </Card>
        )}
      </div>
    </div>
  );
};

export default PageContainer;
