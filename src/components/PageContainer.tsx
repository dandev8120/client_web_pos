import React, { useState } from 'react';
import { Card, Typography, Space, Button, Divider, Tabs, theme } from 'antd';
import { FilterOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface PageContainerProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  searchForm?: React.ReactNode;
  tabItems?: { key: string; label: string; children: React.ReactNode }[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  defaultSearchOpen?: boolean;
  statsContent?: React.ReactNode;
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
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(defaultSearchOpen);
  const [contentVisible, setContentVisible] = useState(true);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>{title}</Title>
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>
        <Space>
          {searchForm && (
            <Button 
              icon={searchOpen ? <UpOutlined /> : <FilterOutlined />} 
              onClick={() => setSearchOpen(!searchOpen)}
              type={searchOpen ? 'primary' : 'default'}
            >
              {searchOpen ? t('collapse_search') : t('expand_search')}
            </Button>
          )}
          <Button 
            icon={contentVisible ? <UpOutlined /> : <DownOutlined />} 
            onClick={() => setContentVisible(!contentVisible)}
          >
            {contentVisible ? t('collapse_content') : t('expand_content')}
          </Button>
          {extra}
        </Space>
      </div>

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
            <Card variant="borderless" styles={{ body: { padding: 24 } }} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {searchForm}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statsContent && contentVisible && (
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

      <AnimatePresence initial={false}>
        {contentVisible && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto', display: 'block' },
              collapsed: { opacity: 0, height: 0, transitionEnd: { display: 'none' } }
            }}
          >
            {tabItems ? (
              <Card variant="borderless" styles={{ body: { padding: '0 24px 24px' } }} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Tabs 
                  activeKey={activeTab} 
                  onChange={onTabChange} 
                  items={tabItems}
                  animated={{ inkBar: true, tabPane: true }}
                />
              </Card>
            ) : (
              <Card variant="borderless" styles={{ body: { padding: 24 } }} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {children}
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageContainer;
