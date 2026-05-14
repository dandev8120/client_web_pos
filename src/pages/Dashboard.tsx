import React from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Space, Tooltip, Button, List, Avatar, Progress, theme, Divider } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  DollarOutlined, 
  AppstoreOutlined, 
  InfoCircleOutlined,
  HistoryOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  FireOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import PageContainer from '../components/PageContainer';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const chartOptions: Highcharts.Options = {
    chart: { height: 350, style: { fontFamily: 'inherit' }, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    yAxis: { title: { text: '' }, gridLineDashStyle: 'Dash' },
    series: [{
      name: t('revenue'),
      type: 'area',
      data: [12000, 15000, 18000, 16000, 21000, 25000, 24000, 28000, 32000, 31000, 35000, 42000],
      color: token.colorPrimary,
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, token.colorPrimary],
          [1, 'transparent']
        ]
      }
    }],
    credits: { enabled: false },
    plotOptions: {
      area: { marker: { enabled: false, radius: 2 }, lineWidth: 3 }
    }
  };

  const pieOptions: Highcharts.Options = {
    chart: { type: 'pie', height: 300, backgroundColor: 'transparent' },
    title: { text: '' },
    series: [{
      name: 'Percentage',
      type: 'pie',
      innerSize: '60%',
      data: [
        { name: 'Electronics', y: 45, color: token.colorPrimary },
        { name: 'Fashion', y: 25, color: '#faad14' },
        { name: 'Home Garden', y: 15, color: '#52c41a' },
        { name: 'Others', y: 15, color: '#f5222d' }
      ]
    }],
    credits: { enabled: false }
  };

  const activities = [
    { user: 'Bùi Thế Đán', action: t('new_order_action') || 'created a new order', time: '1 min ago', avatar: 'https://i.pravatar.cc/150?u=1' },
    { user: 'Nguyễn Văn A', action: t('added_product_action') || 'added product to stock', time: '5 mins ago', avatar: 'https://i.pravatar.cc/150?u=2' },
    { user: 'Trần Thị B', action: t('confirmed_payment_action') || 'confirmed payment', time: '12 mins ago', avatar: 'https://i.pravatar.cc/150?u=3' },
    { user: 'Lê Văn C', action: t('cancelled_order_action') || 'cancelled order #7724', time: '45 mins ago', avatar: 'https://i.pravatar.cc/150?u=4' },
  ];

  const columns = [
    { title: t('order_id'), dataIndex: 'id', key: 'id' },
    { title: t('customer_name'), dataIndex: 'customer', key: 'customer' },
    { title: t('product_name') || 'Product', dataIndex: 'product', key: 'product' },
    { title: t('amount'), dataIndex: 'amount', key: 'amount' },
    { 
      title: t('status'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = status === 'Completed' ? 'green' : 'gold';
        if (status === 'Cancelled') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      }
    },
  ];

  const data = [
    { key: '1', id: '#ORD-7721', customer: 'Nguyen Van A', product: 'MacBook Pro M3', amount: '$2,499', status: 'Completed' },
    { key: '2', id: '#ORD-7722', customer: 'Tran Thi B', product: 'iPhone 15 Pro', amount: '$1,099', status: 'Pending' },
    { key: '3', id: '#ORD-7723', customer: 'Le Van C', product: 'AirPods Pro', amount: '$249', status: 'Completed' },
    { key: '4', id: '#ORD-7724', customer: 'Pham Thi D', product: 'Apple Watch S9', amount: '$399', status: 'Cancelled' },
  ];

  return (
    <PageContainer title={t('dashboard')} subtitle={t('welcome')}>
      <motion.div variants={container} initial="hidden" animate="show">
        <Row gutter={[24, 24]}>
          <Col xs={24} xl={17}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <motion.div variants={item} whileHover={{ y: -5 }}>
                  <Card style={{ background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #40a9ff 100%)`, color: '#fff' }}>
                    <Statistic
                      title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>{t('revenue')}</span>}
                      value={112893}
                      precision={2}
                      valueStyle={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}
                      prefix={<DollarOutlined />}
                    />
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>+12% vs last month</Text>
                    </div>
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <motion.div variants={item} whileHover={{ y: -5 }}>
                  <Card variant="borderless">
                    <Statistic
                      title={t('new_orders')}
                      value={1124}
                      valueStyle={{ fontSize: 24, fontWeight: 'bold' }}
                      prefix={<ShoppingCartOutlined style={{ color: '#faad14' }} />}
                    />
                    <Progress percent={75} size="small" status="active" strokeColor="#faad14" showInfo={false} />
                    <Text type="secondary" style={{ fontSize: 12 }}>+5% vs last week</Text>
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <motion.div variants={item} whileHover={{ y: -5 }}>
                  <Card variant="borderless">
                    <Statistic
                      title={t('active_users')}
                      value={9321}
                      valueStyle={{ fontSize: 24, fontWeight: 'bold' }}
                      prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                    />
                    <Progress percent={92} size="small" strokeColor="#52c41a" showInfo={false} />
                    <Text type="secondary" style={{ fontSize: 12 }}>92% user satisfaction</Text>
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <motion.div variants={item} whileHover={{ y: -5 }}>
                  <Card variant="borderless">
                    <Statistic
                      title={t('total_products')}
                      value={142}
                      valueStyle={{ fontSize: 24, fontWeight: 'bold' }}
                      prefix={<AppstoreOutlined style={{ color: '#f5222d' }} />}
                    />
                    <Progress percent={45} size="small" status="exception" showInfo={false} />
                    <Text type="secondary" style={{ fontSize: 12 }}>45% on sale</Text>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              <Col span={24}>
                <motion.div variants={item}>
                  <Card 
                    title={<Space><RiseOutlined /> {t('sales_overview')}</Space>} 
                    variant="borderless" 
                    extra={<Button type="text" shape="circle" icon={<ReloadOutlined />} onClick={() => window.location.reload()} />}
                  >
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                  </Card>
                </motion.div>
              </Col>
            </Row>

            <motion.div variants={item} style={{ marginTop: 24 }}>
              <Card title={t('recent_orders')} variant="borderless" extra={<Button type="link">{t('view_all') || 'View All'}</Button>}>
                <Table columns={columns} dataSource={data} pagination={false} scroll={{ x: 'max-content' }} />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} xl={7}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <motion.div variants={item}>
                <Card 
                  title={<Space><ThunderboltOutlined /> {t('recent_activity') || 'Recent Activity'}</Space>} 
                  variant="borderless"
                  styles={{ body: { padding: '12px 24px' } }}
                >
                  <List
                    dataSource={activities}
                    renderItem={(item, i) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src={item.avatar} />}
                          title={<Text strong>{item.user}</Text>}
                          description={
                            <div>
                              <Text type="secondary" style={{ fontSize: 12 }}>{item.action}</Text>
                              <br />
                              <Text style={{ fontSize: 10, color: '#999' }}><HistoryOutlined /> {item.time}</Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card title={<Space><FireOutlined /> {t('sales_distribution') || 'Sales Distribution'}</Space>} variant="borderless">
                  <HighchartsReact highcharts={Highcharts} options={pieOptions} />
                  <Divider style={{ margin: '12px 0' }} />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Yearly Goal</Text>
                      <Text strong>$1M</Text>
                    </div>
                    <Progress percent={64} status="active" strokeColor={token.colorPrimary} />
                  </Space>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card variant="borderless" style={{ background: token.colorWarningBg }}>
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <Avatar size={64} icon={<UserOutlined />} style={{ background: token.colorPrimary, marginBottom: 16 }} />
                    <Title level={5} style={{ margin: 0 }}>Upgrade to Pro</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>Unlock 20+ advanced analytics features</Text>
                    <Button type="primary" block style={{ marginTop: 16 }}>Upgrade Now</Button>
                  </div>
                </Card>
              </motion.div>
            </Space>
          </Col>
        </Row>
      </motion.div>
    </PageContainer>
  );
};

export default Dashboard;
