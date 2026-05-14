import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Card, Typography, Space, Badge, Drawer, Descriptions, Divider, Modal, Form, Input, Select, DatePicker, App, Dropdown, Row, Col, theme } from 'antd';
import { 
  DownloadOutlined, 
  PrinterOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import dayjs from 'dayjs';
import PageContainer from '../components/PageContainer';
import type { MenuProps } from 'antd';

const { Title, Text } = Typography;

interface InvoiceRecord {
  key: string;
  id: string;
  client: string;
  date: string;
  due: string;
  amount: number;
  status: string;
  items: { name: string; qty: number; price: number }[];
}

const initialData: InvoiceRecord[] = Array.from({ length: 30 }).map((_, i) => ({
  key: `${i + 1}`,
  id: `INV-2024-${String(1001 + i)}`,
  client: i % 2 === 0 ? 'Acme Corp' : (i % 3 === 0 ? 'Global Fin' : 'Tech Start'),
  date: dayjs().subtract(i, 'day').format('YYYY-MM-DD'),
  due: dayjs().add(15 - i, 'day').format('YYYY-MM-DD'),
  amount: Math.floor(Math.random() * 20000) + 1000,
  status: i % 3 === 0 ? 'Paid' : (i % 3 === 1 ? 'Pending' : 'Overdue'),
  items: [
    { name: 'Service A', qty: 1, price: 5000 },
    { name: 'License B', qty: 2, price: 2500 }
  ]
}));

const Invoices: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal, notification } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();
  
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 10);
  const [data, setData] = useState<InvoiceRecord[]>(initialData);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const status = searchParams.get('status') || 'All';
    
    let filtered = initialData.filter(item => 
      item.id.toLowerCase().includes(q.toLowerCase()) || 
      item.client.toLowerCase().includes(q.toLowerCase())
    );

    if (status !== 'All') {
      filtered = filtered.filter(item => item.status === status);
    }
    
    setData(filtered);
    form.setFieldsValue({ q, status });
  }, [searchParams]);

  const onSearch = (values: any) => {
    const params: any = { page: 1, pageSize };
    if (values.q) params.q = values.q;
    if (values.status && values.status !== 'All') params.status = values.status;
    setSearchParams(params);
    setPage(1);
  };

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    const params = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...params, page: pagination.current.toString(), pageSize: pagination.pageSize.toString() });
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: t('delete') + ' ' + id + '?',
      icon: <ExclamationCircleOutlined />,
      content: 'This invoice will be permanently removed.',
      okText: t('delete'),
      okType: 'danger',
      cancelText: t('cancel'),
      onOk() {
        notification.success({
          message: 'Invoice Deleted',
          description: `Successfully deleted invoice ${id}`,
        });
      },
    });
  };

  const columns = [
    {
      title: 'Invoice #',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <span style={{ fontWeight: 'bold', color: '#1677ff' }}>{text}</span>,
    },
    {
      title: t('customer_name') || 'Client',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: 'Issue Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Due Date',
      dataIndex: 'due',
      key: 'due',
    },
    {
      title: t('amount') || 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => `$${val.toLocaleString()}`,
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: any = { Paid: 'success', Pending: 'processing', Overdue: 'error' };
        return <Badge status={colors[status]} text={status} />;
      },
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 70,
      fixed: 'right' as const,
      render: (_: any, record: InvoiceRecord) => {
        const items: MenuProps['items'] = [
          { key: 'view', label: 'View Details', icon: <EyeOutlined /> },
          { key: 'download', label: 'Download', icon: <DownloadOutlined /> },
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
        <Col xs={24} md={10}>
          <Form.Item name="q" label={t('search')}>
            <Input placeholder="Search invoice # or client..." prefix={<SearchOutlined />} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="status" label={t('status')} initialValue="All">
            <Select 
              style={{ width: '100%' }}
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Overdue', label: 'Overdue' },
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

  const statsContent = (
    <Row gutter={16}>
      <Col xs={24} sm={12} md={6}>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: '#fff', borderRadius: 12 }}>
            <Text type="secondary">{t('revenue')}</Text>
            <Title level={3} style={{ margin: '4px 0', color: token.colorPrimary }}>$45,200</Title>
            <Badge status="success" text="+15% vs LY" />
          </Card>
        </motion.div>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: '#fff', borderRadius: 12 }}>
            <Text type="secondary">Overdue</Text>
            <Title level={3} style={{ margin: '4px 0', color: '#ff4d4f' }}>$1,420</Title>
            <Badge status="error" text="3 invoices" />
          </Card>
        </motion.div>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: '#fff', borderRadius: 12 }}>
            <Text type="secondary">Pending</Text>
            <Title level={3} style={{ margin: '4px 0', color: '#faad14' }}>$5,800</Title>
            <Badge status="warning" text="8 invoices" />
          </Card>
        </motion.div>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: '#fff', borderRadius: 12 }}>
            <Text type="secondary">Average Cycle</Text>
            <Title level={3} style={{ margin: '4px 0' }}>12 Days</Title>
            <Badge status="default" text="Standard" />
          </Card>
        </motion.div>
      </Col>
    </Row>
  );

  return (
    <PageContainer
      title={t('invoices')}
      subtitle="Quản lý hóa đơn"
      searchForm={searchForm}
      statsContent={statsContent}
    >
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          {selectedRowKeys.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={() => App.useApp().message.info(`Delete ${selectedRowKeys.length} items`)}>
              Bulk Delete ({selectedRowKeys.length})
            </Button>
          )}
        </Space>
        <Space>
           <Button icon={<DownloadOutlined />}>{t('export')}</Button>
           <Button type="primary" icon={<PrinterOutlined />}>Báo cáo</Button>
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={data} 
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys)
        }}
        onChange={handleTableChange}
        scroll={{ x: 1000, y: 600 }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data.length,
          showSizeChanger: true,
        }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedInvoice(record);
            setDrawerVisible(true);
          },
          style: { cursor: 'pointer' }
        })}
      />

      <Drawer
        title={`Invoice Details: ${selectedInvoice?.id}`}
        placement="right"
        size="large"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>{t('cancel')}</Button>
            <Button type="primary" icon={<PrinterOutlined />}>Print</Button>
          </Space>
        }
      >
        {selectedInvoice && (
          <div>
            <Descriptions title="General Information" bordered column={1}>
              <Descriptions.Item label="Customer">{selectedInvoice.client}</Descriptions.Item>
              <Descriptions.Item label="Issue Date">{selectedInvoice.date}</Descriptions.Item>
              <Descriptions.Item label="Due Date">{selectedInvoice.due}</Descriptions.Item>
              <Descriptions.Item label="Status">
                 <Tag color={selectedInvoice.status === 'Paid' ? 'success' : selectedInvoice.status === 'Pending' ? 'processing' : 'error'}>
                  {selectedInvoice.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Title level={5}>Line Items</Title>
            <Table
              dataSource={selectedInvoice.items}
              pagination={false}
              size="small"
              columns={[
                { title: 'Item', dataIndex: 'name', key: 'name' },
                { title: 'Qty', dataIndex: 'qty', key: 'qty' },
                { title: 'Price', dataIndex: 'price', key: 'price', render: (v) => `$${v}` },
                { title: 'Total', key: 'total', render: (_, r) => `$${r.qty * r.price}` },
              ]}
              rowKey="name"
            />
            
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <div style={{ fontSize: 16 }}>
                <Text type="secondary">Subtotal: </Text>
                <Text strong>${selectedInvoice.amount.toLocaleString()}</Text>
              </div>
              <div style={{ fontSize: 16 }}>
                <Text type="secondary">Tax (0%): </Text>
                <Text strong>$0</Text>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <Title level={3}>Total: ${selectedInvoice.amount.toLocaleString()}</Title>
            </div>
          </div>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default Invoices;
