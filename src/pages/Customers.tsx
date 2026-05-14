import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Card, Typography, Avatar, Space, message, Input, Tooltip, Form, Select, Modal, App } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  SearchOutlined, 
  FilterOutlined,
  ReloadOutlined,
  PlusOutlined,
  MoreOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import type { MenuProps } from 'antd';
import { Dropdown, Divider, Row, Col } from 'antd';

const { Title, Text } = Typography;

interface CustomerRecord {
  key: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  lastLogin: string;
  color: string;
}

const initialData: CustomerRecord[] = [
  { key: '1', id: 'CUST-001', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 234 567 890', plan: 'Premium', status: 'active', lastLogin: '2 hours ago', color: '#1677ff' },
  { key: '2', id: 'CUST-002', name: 'Bob Wilson', email: 'bob@example.com', phone: '+1 345 678 901', plan: 'Basic', status: 'active', lastLogin: '1 day ago', color: '#722ed1' },
  { key: '3', id: 'CUST-003', name: 'Carol Smith', email: 'carol@example.com', phone: '+1 456 789 012', plan: 'Premium', status: 'inactive', lastLogin: '1 month ago', color: '#eb2f96' },
  { key: '4', id: 'CUST-004', name: 'David Brown', email: 'david@example.com', phone: '+1 567 890 123', plan: 'Professional', status: 'active', lastLogin: '5 mins ago', color: '#fa8c16' },
  { key: '5', id: 'CUST-005', name: 'Eva Green', email: 'eva@example.com', phone: '+1 678 901 234', plan: 'Basic', status: 'active', lastLogin: '10 mins ago', color: '#52c41a' },
  { key: '6', id: 'CUST-006', name: 'Frank Miller', email: 'frank@example.com', phone: '+1 789 012 345', plan: 'Professional', status: 'active', lastLogin: '1 hour ago', color: '#f5222d' },
  { key: '7', id: 'CUST-007', name: 'Grace Lee', email: 'grace@example.com', phone: '+1 890 123 456', plan: 'Basic', status: 'inactive', lastLogin: '2 days ago', color: '#13c2c2' },
  { key: '8', id: 'CUST-008', name: 'Harry Potter', email: 'harry@hogwarts.edu', phone: '+44 123 456 789', plan: 'Premium', status: 'active', lastLogin: '5 secs ago', color: '#722ed1' },
];

const Customers: React.FC = () => {
  const { t } = useTranslation();
  const { modal, message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();
  
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 10);
  const [data, setData] = useState<CustomerRecord[]>(initialData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const status = searchParams.get('status') || 'All';
    const plan = searchParams.get('plan') || 'All';
    
    let filtered = initialData.filter(item => 
      item.name.toLowerCase().includes(q.toLowerCase()) || 
      item.email.toLowerCase().includes(q.toLowerCase()) ||
      item.id.toLowerCase().includes(q.toLowerCase())
    );

    if (status !== 'All') {
        filtered = filtered.filter(item => item.status === status.toLowerCase());
    }
    if (plan !== 'All') {
        filtered = filtered.filter(item => item.plan === plan);
    }
    
    setData(filtered);
    form.setFieldsValue({ q, status, plan });
  }, [searchParams]);

  const onSearch = (values: any) => {
    const params: any = { page: 1, pageSize };
    if (values.q) params.q = values.q;
    if (values.status && values.status !== 'All') params.status = values.status;
    if (values.plan && values.plan !== 'All') params.plan = values.plan;
    setSearchParams(params);
    setPage(1);
  };

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    const params = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...params, page: pagination.current.toString(), pageSize: pagination.pageSize.toString() });
  };

  const handleDelete = (name: string) => {
    modal.confirm({
        title: `${t('delete')} ${name}?`,
        content: 'This will permanently remove the user from the directory.',
        okText: t('delete'),
        okType: 'danger',
        cancelText: t('cancel'),
        onOk: () => {
            message.success(`${name} removed`);
        }
    });
  };

  const columns = [
    {
      title: t('user') || 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CustomerRecord) => (
        <motion.div whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Space>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: record.color }} />
            <div>
              <div style={{ fontWeight: 'bold' }}>{text}</div>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>ID: {record.id}</div>
            </div>
          </Space>
        </motion.div>
      ),
    },
    {
      title: 'Contact Info',
      key: 'contact',
      render: (_: any, record: CustomerRecord) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <MailOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
            <Text copyable style={{ fontSize: 13 }}>{record.email}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PhoneOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
            <Text style={{ fontSize: 13 }}>{record.phone}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Subscription',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: string) => (
        <Tag color={plan === 'Premium' ? 'gold' : plan === 'Professional' ? 'purple' : 'blue'}>
          {plan.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'} style={{ borderRadius: 10 }}>
          ● {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 70,
      fixed: 'right' as const,
      render: (_: any, record: CustomerRecord) => {
        const items: MenuProps['items'] = [
          { key: 'view', label: 'View Profile', icon: <EyeOutlined /> },
          { key: 'edit', label: 'Edit', icon: <EditOutlined /> },
          { type: 'divider' },
          { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" shape="circle" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const searchForm = (
    <Form form={form} layout="vertical" onFinish={onSearch}>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="q" label={t('search')}>
            <Input placeholder="Search name, email, or ID..." prefix={<SearchOutlined />} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={5}>
          <Form.Item name="status" label={t('status')} initialValue="All">
            <Select 
              style={{ width: '100%' }}
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={5}>
          <Form.Item name="plan" label={t('plan') || 'Plan'} initialValue="All">
            <Select 
              style={{ width: '100%' }}
              options={[
                { value: 'All', label: 'All Plans' },
                { value: 'Basic', label: 'Basic' },
                { value: 'Professional', label: 'Professional' },
                { value: 'Premium', label: 'Premium' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label="&nbsp;">
            <Space>
              <Button type="primary" htmlType="submit" icon={<FilterOutlined />}>{t('filter')}</Button>
              <Button icon={<ReloadOutlined />} onClick={() => setSearchParams({ page: '1', pageSize: '10' })}>{t('reset')}</Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const statsContent = (
    <Row gutter={16}>
      <Col xs={24} sm={12} md={8}>
        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Space direction="vertical" size={0}>
              <Text type="secondary">{t('total_customers')}</Text>
              <Title level={3} style={{ margin: '4px 0' }}>8,432</Title>
              <Text type="success">+12% from last month</Text>
            </Space>
          </Card>
        </motion.div>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Space direction="vertical" size={0}>
              <Text type="secondary">{t('active_users')}</Text>
              <Title level={3} style={{ margin: '4px 0' }}>5,210</Title>
              <Text type="warning">62% active rate</Text>
            </Space>
          </Card>
        </motion.div>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Space direction="vertical" size={0}>
              <Text type="secondary">New Customers (30d)</Text>
              <Title level={3} style={{ margin: '4px 0' }}>420</Title>
              <Text type="success">Average growth</Text>
            </Space>
          </Card>
        </motion.div>
      </Col>
    </Row>
  );

  return (
    <PageContainer
      title={t('customers')}
      subtitle="Quản lý khách hàng"
      searchForm={searchForm}
      statsContent={statsContent}
    >
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          {selectedRowKeys.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={() => message.info(`Delete ${selectedRowKeys.length} items`)}>
              Bulk Delete ({selectedRowKeys.length})
            </Button>
          )}
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>{t('add_customer')}</Button>
        </Space>
      </div>
      
      <Table 
        rowSelection={{ selectedRowKeys, onChange: onSelectChange }} 
        columns={columns} 
        dataSource={data} 
        onChange={handleTableChange}
        scroll={{ x: 1000, y: 600 }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data.length,
          showSizeChanger: true,
        }}
      />
    </PageContainer>
  );
};

export default Customers;
