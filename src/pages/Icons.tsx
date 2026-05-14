import React, { useState } from 'react';
import { Row, Col, Card, Typography, Input, message, Tabs, Button, App } from 'antd';
import * as Icons from '@ant-design/icons';

import PageContainer from '../components/PageContainer';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Search } = Input;

const IconsPage: React.FC = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter icons by search term
  const iconNames = Object.keys(Icons).filter(name => 
    name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    typeof (Icons as any)[name] === 'object'
  );

  const copyIconName = (name: string) => {
    navigator.clipboard.writeText(`<${name} />`);
    message.success(`Copied: <${name} />`);
  };

  return (
    <PageContainer 
      title={t('icons')} 
      subtitle="Ant Design Icons Library"
      extra={
        <Button 
          type="primary" 
          icon={<Icons.LinkOutlined />} 
          href="https://ant.design/components/icon" 
          target="_blank"
        >
          View Full Documentation
        </Button>
      }
    >
      <Card variant="borderless">
        <Search 
          placeholder="Search icons..." 
          allowClear 
          enterButton 
          size="large" 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: 32, maxWidth: 600 }}
        />

        <Row gutter={[16, 16]}>
          {iconNames.slice(0, 200).map(name => {
            const IconComponent = (Icons as any)[name];
            return (
              <Col xs={12} sm={8} md={6} lg={4} xl={3} key={name}>
                <Card 
                  hoverable 
                  style={{ textAlign: 'center', borderRadius: 12 }} 
                  styles={{ body: { padding: '24px 12px' } }}
                  onClick={() => copyIconName(name)}
                >
                  <div style={{ fontSize: 32, marginBottom: 12, color: '#1677ff' }}>
                    <IconComponent />
                  </div>
                  <Text style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                  </Text>
                </Card>
              </Col>
            );
          })}
        </Row>
        
        {iconNames.length > 200 && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Text type="secondary">Showing first 200 results. Please narrow your search for more.</Text>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default IconsPage;
