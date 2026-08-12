import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Button, Card, Typography, Avatar, Space, Input, Tooltip, Form, Select, Modal, App, Badge, Dropdown, Divider, Row, Col } from 'antd';
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

const { Title, Text } = Typography;

import { SmartTable } from '../components/SmartTable';
import { hasButtonPermission } from '../utils/rbacPresets';
import { customerService } from '../services/customerService';
import { CustomerResponseDto, CustomerRequestDto, CustomerMapper } from '../dtos/CustomerDto';

export type CustomerRecord = CustomerResponseDto;

const Customers: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { modal, message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();

  // Active User session from localStorage for RBAC checks
  const loggedUser = useMemo(() => {
    const saved = localStorage.getItem('@@WEB_POS_PORTAL');
    return saved ? JSON.parse(saved) : null;
  }, []);

  const userRoles = useMemo(() => {
    return loggedUser?.roles || [loggedUser?.role || 'user'];
  }, [loggedUser]);

  const canCreate = useMemo(() => {
    return hasButtonPermission(loggedUser?.buttonPermissions, 'sales.customers.btn_create', userRoles);
  }, [loggedUser, userRoles]);
  
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 10);
  const [data, setData] = useState<CustomerRecord[]>(() => customerService.getCustomers());
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const status = searchParams.get('status') || 'All';
    const plan = searchParams.get('plan') || 'All';
    
    const allCustomers = customerService.getCustomers();
    let filtered = allCustomers.filter(item => 
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
      searchable: true,
      resizable: true,
      width: 250,
      fixed: 'left' as const,
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
      title: t('phone'),
      key: 'contact',
      resizable: true,
      width: 250,
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
      title: t('category') || 'Subscription',
      dataIndex: 'plan',
      key: 'plan',
      resizable: true,
      width: 150,
      filters: [
        { text: 'Basic', value: 'Basic' },
        { text: 'Professional', value: 'Professional' },
        { text: 'Premium', value: 'Premium' },
      ],
      onFilter: (value: any, record: any) => record.plan === value,
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
      resizable: true,
      width: 150,
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'} style={{ borderRadius: 10 }}>
          ● {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('date'),
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      resizable: true,
      width: 150,
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 70,
      fixed: 'right' as const,
      render: (_: any, record: CustomerRecord) => {
        const items: MenuProps['items'] = [
          { key: 'view', label: t('view_details_action'), icon: <EyeOutlined /> },
          { key: 'edit', label: t('edit_action'), icon: <EditOutlined /> },
          { type: 'divider' },
          { key: 'delete', label: t('delete_action'), icon: <DeleteOutlined />, danger: true },
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

  const exportMenuItems: MenuProps['items'] = [
    { key: 'excel', label: t('export_excel'), onClick: () => message.success('Exporting as Excel...') },
    { key: 'pdf', label: t('export_pdf'), onClick: () => message.success('Exporting as PDF...') },
    { key: 'csv', label: t('export_csv'), onClick: () => message.success('Exporting as CSV...') },
    { key: 'text', label: t('export_text'), onClick: () => message.success('Exporting as Text...') },
  ];

  const isMobile = window.innerWidth < 768;

  return (
    <PageContainer
      title={t('customers')}
      subtitle={t('customers')}
      searchForm={searchForm}
      statsContent={statsContent}
    >
      <SmartTable 
        rowSelection={{ selectedRowKeys, onChange: onSelectChange }} 
        selectedRowKeys={selectedRowKeys}
        extraActions={
          <Space size={12}>
             <Button icon={<ReloadOutlined />} onClick={() => setSearchParams({ page: '1', pageSize: '10' })} />
             <Tooltip title={!canCreate ? "Lỗi 403 Forbidden: Tài khoản của bạn KHÔNG có quyền thêm khách hàng mới" : ""}>
               <Button 
                 type="primary" 
                 icon={<PlusOutlined />}
                 disabled={!canCreate}
                 onClick={() => {
                   if (!canCreate) {
                     message.error('Lỗi 403 Forbidden: Tài khoản của bạn KHÔNG có quyền thêm khách hàng mới!');
                     return;
                   }
                   message.success('Đang mở form Thêm khách hàng mới');
                 }}
               >
                 {t('add_customer')}
               </Button>
             </Tooltip>
          </Space>
        }
        columns={columns as any} 
        dataSource={data} 
        onChange={handleTableChange}
        scroll={{ x: 1000, y: 600 }}
        pagination={{
          position: ['bottomRight'],
          current: page,
          pageSize: pageSize,
          total: data.length,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total, range) => `${t('showing')} ${range[0]}-${range[1]} ${t('of')} ${total} ${t('items')}`,
          locale: i18n.language === 'vi' ? {
            jump_to: 'Đi đến',
            page: 'Trang',
            items_per_page: '/ trang',
          } : undefined,
        }}
      />
    </PageContainer>
  );
};

export default Customers;
