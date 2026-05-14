import React, { useState, useMemo, useEffect } from 'react';
import { Tag, Space, Button, Input, Card, Typography, message, Table, Popover, Checkbox, Divider, Tooltip, Dropdown, MenuProps, notification, Modal, Form, Row as AntRow, Col, Select, DatePicker, Avatar, App } from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  HolderOutlined, 
  SettingOutlined, 
  DownloadOutlined, 
  ImportOutlined, 
  MoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  UploadOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageContainer from '../components/PageContainer';
import FancyUpload from '../components/FancyUpload';

const { Title, Text } = Typography;

interface DataType {
  key: string;
  id: string;
  customer: string;
  date: string;
  total: number;
  status: string;
  email: string;
}

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const SortableRow = (props: SortableRowProps) => {
  const { children, style, ...rest } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const combinedStyle: React.CSSProperties = {
    ...style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999, background: '#f5f5f5' } : {}),
  };

  return (
    <tr {...rest} ref={setNodeRef} style={combinedStyle} {...attributes}>
      {React.Children.map(children, (child: any) => {
        if (child.key === 'sort') {
          return React.cloneElement(child, {
            children: (
              <HolderOutlined
                style={{ cursor: 'move', color: '#999' }}
                {...listeners}
              />
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

const Orders: React.FC = () => {
  const { t } = useTranslation();
  const { message, modal, notification } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();

  // URL State Consistency
  useEffect(() => {
    if (!searchParams.get('page')) {
      setSearchParams(prev => {
        prev.set('page', '1');
        prev.set('pageSize', '10');
        return prev;
      }, { replace: true });
    }
  }, []);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const quickSearch = searchParams.get('q') || '';
  const searchInUrl = searchParams.get('search') || '';

  useEffect(() => {
    if (searchInUrl) {
      form.setFieldValue('q', searchInUrl);
      handleSearch({ q: searchInUrl });
    }
  }, [searchInUrl]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<DataType[]>(() => 
    Array.from({ length: 120 }).map((_, i) => ({
      key: `key-${i}`,
      id: `ORD-2024-${1000 + i}`,
      customer: ['John Doe', 'Jane Smith', 'Michael Chen', 'Sarah Jenkins', 'Alex Wong'][i % 5],
      email: ['john@example.com', 'jane@example.com', 'mike@test.com', 'sarah@web.com', 'alex@mail.com'][i % 5],
      date: `2024-05-${(i % 30) + 1}`,
      total: Math.random() * 500 + 50,
      status: ['pending', 'shipped', 'completed', 'cancelled'][i % 4],
    }))
  );

  const filteredData = useMemo(() => {
    let filtered = [...dataSource];
    if (quickSearch) {
      filtered = filtered.filter(f => f.customer.toLowerCase().includes(quickSearch.toLowerCase()) || f.id.toLowerCase().includes(quickSearch.toLowerCase()));
    }
    const status = searchParams.get('status');
    if (status && status !== 'All') {
      filtered = filtered.filter(f => f.status === status);
    }
    const orderId = searchParams.get('orderId');
    if (orderId) {
      filtered = filtered.filter(f => f.id.includes(orderId));
    }
    return filtered;
  }, [dataSource, quickSearch, searchParams]);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(['sort', 'id', 'customer', 'date', 'total', 'status', 'action']);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((prev) => {
        const activeIndex = prev.findIndex((i) => i.key === active.id);
        const overIndex = prev.findIndex((i) => i.key === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
      message.success('Priority reordered');
    }
  };

  const statusMap: Record<string, { color: string, icon: any }> = {
    pending: { color: 'gold', icon: <ClockCircleOutlined /> },
    shipped: { color: 'blue', icon: <SyncOutlined spin /> },
    completed: { color: 'green', icon: <CheckCircleOutlined /> },
    cancelled: { color: 'red', icon: <CloseCircleOutlined /> },
  };

  const handleSearch = (values: any) => {
    const params: any = { page: page.toString(), pageSize: pageSize.toString() };
    if (values.q) params.q = values.q;
    if (values.status) params.status = values.status;
    if (values.orderId) params.orderId = values.orderId;
    
    // Always reset to page 1 on active search
    params.page = '1';
    setSearchParams(params);
  };

  const handleReset = () => {
    form.resetFields();
    setSearchParams({ page: '1', pageSize: '10' });
  };

  const columns = [
    {
      key: 'sort',
      width: 50,
      render: () => null,
    },
    {
      title: t('order_id'),
      dataIndex: 'id',
      key: 'id',
      fixed: 'left' as const,
      render: (text: string) => <Text strong style={{ color: '#1677ff' }}>{text}</Text>,
    },
    {
      title: t('customer_name'),
      dataIndex: 'customer',
      key: 'customer',
      render: (text: string, record: any) => (
          <Space>
              <Avatar size="small" style={{ backgroundColor: '#f0f2f5', color: '#1677ff' }}>{text[0]}</Avatar>
              <div>
                  <div style={{ fontWeight: 500 }}>{text}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{record.email}</Text>
              </div>
          </Space>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: t('amount'),
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => <Text strong>${value.toFixed(2)}</Text>,
    },
    {
      title: t('status'),
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag icon={statusMap[status].icon} color={statusMap[status].color}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('actions'),
      key: 'action',
      fixed: 'right' as const,
      width: 70,
      render: (_: any, record: any) => {
          const items: MenuProps['items'] = [
              { key: 'view', label: 'View Details', icon: <EyeOutlined /> },
              { key: 'edit', label: 'Edit Order', icon: <SettingOutlined /> },
              { key: 'download', label: 'Download Invoice', icon: <DownloadOutlined /> },
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
    <Form form={form} layout="vertical" onFinish={handleSearch}>
        <AntRow gutter={16}>
            <Col xs={24} md={6}>
                <Form.Item name="orderId" label={t('order_id')}>
                    <Input placeholder="ORD-2024..." />
                </Form.Item>
            </Col>
            <Col xs={24} md={6}>
                <Form.Item name="status" label={t('status')}>
                    <Select 
                      placeholder="Select status" 
                      allowClear
                      options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'shipped', label: 'Shipped' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'cancelled', label: 'Cancelled' },
                      ]}
                    />
                </Form.Item>
            </Col>
            <Col xs={24} md={6}>
                <Form.Item name="dateRange" label={t('date_range')}>
                    <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
            </Col>
            <Col xs={24} md={6}>
                <Form.Item label="&nbsp;">
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>Tìm kiếm</Button>
                        <Button icon={<ReloadOutlined />} onClick={handleReset}>{t('reset')}</Button>
                    </Space>
                </Form.Item>
            </Col>
        </AntRow>
    </Form>
  );

  const tableContent = (
    <div style={{ background: '#fff' }}>
        <div style={{ padding: '0 0 16px 0', display: 'flex', justifyContent: 'space-between' }}>
            <Input
              placeholder={t('search_placeholder')}
              prefix={<SearchOutlined />}
              defaultValue={quickSearch}
              style={{ width: 300 }}
              allowClear
              onPressEnter={(e: any) => handleSearch({ ...form.getFieldsValue(), q: e.target.value })}
            />
            <Space>
               <Button icon={<DownloadOutlined />}>{t('export')}</Button>
               <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Create order')}>{t('add_new')}</Button>
            </Space>
        </div>

        <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext items={filteredData.map((i) => i.key)} strategy={verticalListSortingStrategy}>
            <Table
              rowSelection={{
                  selectedRowKeys,
                  onChange: setSelectedRowKeys
              }}
              components={{ body: { row: SortableRow } }}
              rowKey="key"
              columns={columns.filter(c => visibleColumns.includes(c.key)) as any}
              dataSource={filteredData}
              scroll={{ x: 1200, y: 600 }}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: filteredData.length,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                onChange: (p, ps) => {
                    const currentParams = Object.fromEntries(searchParams.entries());
                    setSearchParams({ ...currentParams, page: p.toString(), pageSize: ps.toString() });
                }
              }}
              onRow={(record) => ({
                 'data-row-key': record.key,
              } as any)}
            />
          </SortableContext>
        </DndContext>
    </div>
  );

  const statsContent = (
    <AntRow gutter={16}>
      <Col xs={24} sm={12} md={6}>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)', color: '#fff', borderRadius: 12 }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{t('total_orders')}</div>
            <Title level={2} style={{ color: '#fff', margin: '4px 0' }}>1,482</Title>
            <div style={{ fontSize: 12 }}><SyncOutlined /> +8% from yesterday</div>
          </Card>
        </motion.div>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)', color: '#fff', borderRadius: 12 }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{t('pending_items')}</div>
            <Title level={2} style={{ color: '#fff', margin: '4px 0' }}>42</Title>
            <div style={{ fontSize: 12 }}><ClockCircleOutlined /> Waiting for shipment</div>
          </Card>
        </motion.div>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)', color: '#fff', borderRadius: 12 }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{t('completed_items')}</div>
            <Title level={2} style={{ color: '#fff', margin: '4px 0' }}>1,200</Title>
            <div style={{ fontSize: 12 }}><CheckCircleOutlined /> Successfully delivered</div>
          </Card>
        </motion.div>
      </Col>
       <Col xs={24} sm={12} md={6}>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="borderless" style={{ background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)', color: '#fff', borderRadius: 12 }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{t('cancelled_items')}</div>
            <Title level={2} style={{ color: '#fff', margin: '4px 0' }}>38</Title>
            <div style={{ fontSize: 12 }}><CloseCircleOutlined /> Revenue lost: $4,200</div>
          </Card>
        </motion.div>
      </Col>
    </AntRow>
  );

  return (
    <PageContainer
      title={t('orders')}
      subtitle={t('welcome') + ", quản lý kinh doanh của bạn"}
      searchForm={searchForm}
      statsContent={statsContent}
      tabItems={[
        { key: 'all', label: t('all_orders'), children: tableContent },
        { key: 'upload', label: t('upload_docs'), children: <FancyUpload multiple /> },
        { key: 'settings', label: t('order_settings'), children: <div style={{ padding: 40, textAlign: 'center' }}><FileTextOutlined style={{ fontSize: 48, color: '#ccc' }} /><div style={{ marginTop: 16 }}>Settings content here</div></div> }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* tableContent is already inside tabs, so we don't need to repeat it here if we want only tabs to show */}
    </PageContainer>
  );
};

export default Orders;
