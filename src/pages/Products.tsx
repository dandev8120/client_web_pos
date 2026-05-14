import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Card, Typography, message, Modal, Form, InputNumber, Select, Row, Col, Space as AntSpace, Tag, App, Dropdown, Divider } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  DownloadOutlined, 
  FilterOutlined, 
  ReloadOutlined,
  MoreOutlined,
  EyeOutlined,
  AppstoreOutlined,
  CheckOutlined,
  HistoryOutlined,
  AlertOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import PageContainer from '../components/PageContainer';
import FancyUpload from '../components/FancyUpload';
import type { MenuProps } from 'antd';

const { Title, Text } = Typography;

interface ProductRecord {
  key: string;
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const initialData: ProductRecord[] = Array.from({ length: 40 }).map((_, i) => ({
  key: `${i + 1}`,
  id: `PROD-${1000 + i}`,
  name: `Sample Product ${i + 1}`,
  price: Math.floor(Math.random() * 1000) + 10,
  stock: Math.floor(Math.random() * 200),
  category: i % 4 === 0 ? 'Electronics' : (i % 4 === 1 ? 'Fashion' : (i % 4 === 2 ? 'Food' : 'Sports')),
}));

const Products: React.FC = () => {
  const { t } = useTranslation();
  const { modal, message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 10);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductRecord[]>(initialData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'All';
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    
    let filtered = initialData.filter(item => 
      item.name.toLowerCase().includes(q.toLowerCase()) || 
      item.id.toLowerCase().includes(q.toLowerCase())
    );

    if (category !== 'All') {
      filtered = filtered.filter(item => item.category === category);
    }
    
    if (minPrice > 0) {
      filtered = filtered.filter(item => item.price >= minPrice);
    }
    
    setData(filtered);
    form.setFieldsValue({ q, category, minPrice: minPrice || undefined });
  }, [searchParams]);

  const onSearch = (values: any) => {
    const params: any = { page: 1, pageSize };
    if (values.q) params.q = values.q;
    if (values.category && values.category !== 'All') params.category = values.category;
    if (values.minPrice) params.minPrice = values.minPrice;
    setSearchParams(params);
    setPage(1);
  };

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    const params = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...params, page: pagination.current.toString(), pageSize: pagination.pageSize.toString() });
  };

  const deleteProduct = (record: ProductRecord) => {
    modal.confirm({
      title: `${t('delete')} ${record.name}?`,
      content: 'This action will remove the product from inventory permanently.',
      okText: t('delete'),
      okType: 'danger',
      cancelText: t('cancel'),
      onOk: () => {
        message.success(`Product ${record.name} deleted`);
      },
    });
  };

  const columns = [
    { title: t('product_id') || 'Product ID', dataIndex: 'id', key: 'id' },
    { title: t('product_name') || 'Product Name', dataIndex: 'name', key: 'name', sorter: (a: ProductRecord, b: ProductRecord) => a.name.localeCompare(b.name) },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { 
      title: t('amount') || 'Price', 
      dataIndex: 'price', 
      key: 'price',
      render: (val: number) => `$${val.toFixed(2)}`,
      sorter: (a: ProductRecord, b: ProductRecord) => a.price - b.price
    },
    { 
      title: 'Stock', 
      dataIndex: 'stock', 
      key: 'stock',
      render: (val: number) => (
        <Tag color={val < 20 ? 'volcano' : 'green'}>{val}</Tag>
      )
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_: any, record: ProductRecord) => {
        const items: MenuProps['items'] = [
          { key: 'view', label: 'View', icon: <EyeOutlined /> },
          { key: 'edit', label: 'Edit', icon: <EditOutlined /> },
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
            <Input placeholder="Search name or ID..." prefix={<SearchOutlined />} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={5}>
          <Form.Item name="category" label={t('category') || 'Category'} initialValue="All">
            <Select 
              style={{ width: '100%' }}
              options={[
                { value: 'All', label: 'All Categories' },
                { value: 'Electronics', label: 'Electronics' },
                { value: 'Fashion', label: 'Fashion' },
                { value: 'Food', label: 'Food' },
                { value: 'Sports', label: 'Sports' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={5}>
          <Form.Item name="minPrice" label={t('min_price') || 'Min Price'}>
            <InputNumber placeholder="Min Price" prefix="$" style={{ width: '100%' }} />
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

  // Stats for the header
  const statsContent = (
    <Row gutter={16}>
      <Col xs={24} sm={12} md={6}>
        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)', color: '#fff', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{t('total_items')}</Text>
                <Title level={2} style={{ color: '#fff', margin: '4px 0 0' }}>1,254</Title>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AppstoreOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>+15%</div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>vs last month</Text>
            </div>
          </Card>
        </motion.div>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)', color: '#fff', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{t('active_items')}</Text>
                <Title level={2} style={{ color: '#fff', margin: '4px 0 0' }}>842</Title>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>92%</div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>in stock</Text>
            </div>
          </Card>
        </motion.div>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)', color: '#fff', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{t('pending_items')}</Text>
                <Title level={2} style={{ color: '#fff', margin: '4px 0 0' }}>156</Title>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HistoryOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>+5</div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>new today</Text>
            </div>
          </Card>
        </motion.div>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)', color: '#fff', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Low Stock</Text>
                <Title level={2} style={{ color: '#fff', margin: '4px 0 0' }}>12</Title>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>Action</div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>required now</Text>
            </div>
          </Card>
        </motion.div>
      </Col>
    </Row>
  );

  return (
    <PageContainer
      title={t('products')}
      subtitle={t('all_products')}
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
           <Button icon={<DownloadOutlined />}>{t('export')}</Button>
           <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
             {t('add_product')}
           </Button>
        </Space>
      </div>

      <Table 
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys)
        }}
        columns={columns} 
        dataSource={data} 
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1000, y: 600 }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data.length,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} products`,
        }}
      />

      <Modal
        title="Add New Product"
        open={isModalVisible}
        onOk={() => {
            addForm.validateFields().then(values => {
                message.success(`Product ${values.name} added successfully`);
                setIsModalVisible(false);
                addForm.resetFields();
            }).catch(info => {
                console.log('Validate Failed:', info);
            });
        }}
        onCancel={() => setIsModalVisible(false)}
      >
        <FancyUpload maxCount={1} />
        <Divider />
        <Form form={addForm} layout="vertical">
          <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Category" name="category" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'Electronics', label: 'Electronics' },
                { value: 'Fashion', label: 'Fashion' },
                { value: 'Food', label: 'Food' },
                { value: 'Sports', label: 'Sports' },
              ]}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Price" name="price" rules={[{ required: true }]}>
                <InputNumber prefix="$" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Initial Stock" name="stock" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Products;
