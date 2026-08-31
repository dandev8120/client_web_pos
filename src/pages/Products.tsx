import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tag, 
  Space, 
  Button, 
  Input, 
  InputNumber, 
  Typography, 
  Tooltip, 
  Dropdown, 
  MenuProps, 
  Form, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  Avatar, 
  App, 
  Tabs, 
  Divider,
  Modal,
  Badge,
  Card,
  Drawer,
  Timeline
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  DownloadOutlined, 
  MoreOutlined,
  ReloadOutlined,
  PlusOutlined,
  BarChartOutlined,
  TableOutlined,
  UpOutlined,
  DownOutlined,
  FilterOutlined,
  CopyOutlined,
  EditOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  FileExcelOutlined,
  AppstoreOutlined,
  QrcodeOutlined,
  AlertOutlined,
  BoxPlotOutlined,
  CodeOutlined,
  TagsOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import PageContainer from '../components/PageContainer';
import FancyUpload from '../components/FancyUpload';
import { SmartTable } from '../components/SmartTable';
import { hasButtonPermission } from '../utils/rbacPresets';
import { ProductStatsOverview, ProductStats } from '../components/products/ProductStatsOverview';
import { productService } from '../services/productService';
import { ProductResponseDto, ProductRequestDto, ProductMapper } from '../dtos/ProductDto';
import { message } from '../services/toastMessage';
import { STORAGE_KEYS } from '../constants/storageKeys';

const { Text, Title } = Typography;

export type ProductRecord = ProductResponseDto;

const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  extra?: React.ReactNode;
}> = ({ title, icon, isOpen, onToggle, children, extra }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-4 overflow-hidden transition-all duration-200 hover:border-slate-200">
      <div 
        className="flex justify-between items-center px-4 py-3 cursor-pointer bg-slate-50/50 select-none"
        onClick={onToggle}
      >
        <Space size={10} className="flex-1">
          <Tooltip title={title} placement="right">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base hover:bg-blue-100 transition-colors">
              {icon}
            </div>
          </Tooltip>
          <span className="font-bold text-slate-800 text-xs sm:text-sm">{title}</span>
        </Space>
        <Space size={12} onClick={(e) => e.stopPropagation()}>
          {extra}
          <Button 
            type="text" 
            size="small" 
            icon={isOpen ? <UpOutlined /> : <DownOutlined />} 
            onClick={onToggle}
            className="text-slate-400 hover:text-slate-600"
          />
        </Space>
      </div>
      <motion.div
        initial={isOpen ? "open" : "collapsed"}
        animate={isOpen ? "open" : "collapsed"}
        variants={{
          open: { height: 'auto', opacity: 1, display: 'block' },
          collapsed: { height: 0, opacity: 0, transitionEnd: { display: 'none' } }
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <div className="px-4 sm:px-5 py-4 border-t border-slate-100 bg-white">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const Products: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { modal } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [dataSource, setDataSource] = useState<ProductRecord[]>(() => productService.getProducts());
  const [form] = Form.useForm();
  
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('table');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [editForm] = Form.useForm();

  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ProductRecord | null>(null);

  const [isJsonbModalOpen, setIsJsonbModalOpen] = useState(false);
  const [jsonbInputText, setJsonbInputText] = useState('');

  // Active User session from localStorage for RBAC checks
  const loggedUser = useMemo(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PORTAL_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const userRoles = useMemo(() => {
    return loggedUser?.roles || [loggedUser?.role || 'user'];
  }, [loggedUser]);

  const canCreate = useMemo(() => {
    return hasButtonPermission(loggedUser?.buttonPermissions, 'sales.products.btn_create', userRoles);
  }, [loggedUser, userRoles]);

  const canEdit = useMemo(() => {
    return hasButtonPermission(loggedUser?.buttonPermissions, 'sales.products.btn_edit', userRoles);
  }, [loggedUser, userRoles]);

  const canDelete = useMemo(() => {
    return hasButtonPermission(loggedUser?.buttonPermissions, 'sales.products.btn_delete', userRoles);
  }, [loggedUser, userRoles]);

  // Derived search params
  const quickSearch = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  // Filtered dataset
  const filteredData = useMemo(() => {
    let result = [...dataSource];

    // Quick search
    if (quickSearch) {
      const qs = quickSearch.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(qs) ||
        item.id.toLowerCase().includes(qs) ||
        item.barcode.includes(qs) ||
        item.supplier.toLowerCase().includes(qs)
      );
    }

    // Category filter
    const catParam = searchParams.get('category');
    if (catParam && catParam !== 'All') {
      const cats = catParam.split(',');
      result = result.filter(item => cats.includes(item.category));
    }

    // Store filter
    const storeParam = searchParams.get('storeId');
    if (storeParam) {
      const storesList = storeParam.split(',');
      result = result.filter(item => storesList.includes(item.storeId));
    }

    // Status filter (from search form)
    const statusParam = searchParams.get('status');
    if (statusParam && statusParam !== 'All') {
      const statuses = statusParam.split(',');
      result = result.filter(item => statuses.includes(item.status));
    }

    // Tab filter
    if (activeTab === 'active') {
      result = result.filter(item => item.status === 'active');
    } else if (activeTab === 'low_stock') {
      result = result.filter(item => item.stock <= 20 && item.stock > 0);
    } else if (activeTab === 'out_of_stock') {
      result = result.filter(item => item.stock === 0);
    } else if (activeTab === 'promoted') {
      result = result.filter(item => item.promotion && item.promotion !== 'Không');
    }

    // Advanced search: Supplier
    const supplierParam = searchParams.get('supplier');
    if (supplierParam) {
      const sup = supplierParam.toLowerCase();
      result = result.filter(item => item.supplier.toLowerCase().includes(sup));
    }

    // Advanced search: Price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice) result = result.filter(item => item.price >= Number(minPrice));
    if (maxPrice) result = result.filter(item => item.price <= Number(maxPrice));

    // Advanced search: VAT Rate
    const vatParam = searchParams.get('vatRate');
    if (vatParam && vatParam !== 'All') {
      result = result.filter(item => item.vatRate === Number(vatParam));
    }

    return result;
  }, [dataSource, quickSearch, searchParams, activeTab]);

  // Product Stats Calculation
  const productStats: ProductStats = useMemo(() => {
    const totalProducts = filteredData.length;
    const activeProducts = filteredData.filter(p => p.status === 'active').length;
    const activeRate = totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0;

    const totalInventoryValue = filteredData.reduce((acc, p) => acc + p.price * p.stock, 0);
    const avgUnitPrice = totalProducts > 0 ? Math.round(filteredData.reduce((acc, p) => acc + p.price, 0) / totalProducts) : 0;

    const totalStockUnits = filteredData.reduce((acc, p) => acc + p.stock, 0);
    const lowStockCount = filteredData.filter(p => p.stock <= 20).length;
    const lowStockRate = totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0;

    const promotedCount = filteredData.filter(p => p.promotion && p.promotion !== 'Không').length;
    const syncedSapCount = filteredData.filter(p => Number(p.sapStatus) === 1).length;

    // Categories breakdown
    const catMap: Record<string, number> = {};
    filteredData.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    const categories = Object.keys(catMap).map((catName, idx) => ({
      name: catName,
      count: catMap[catName],
      color: colors[idx % colors.length]
    }));

    return {
      totalProducts,
      activeProducts,
      activeRate,
      totalInventoryValue,
      avgUnitPrice,
      totalStockUnits,
      lowStockCount,
      lowStockRate,
      promotedCount,
      syncedSapCount,
      categories
    };
  }, [filteredData]);

  const paginatedData = useMemo(() => {
    return filteredData.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredData, page, pageSize]);

  const handleSearch = (values: any) => {
    const params: any = { page: '1', pageSize: pageSize.toString() };
    if (values.q) params.q = values.q;
    if (values.category) params.category = Array.isArray(values.category) ? values.category.join(',') : values.category;
    if (values.storeId) params.storeId = Array.isArray(values.storeId) ? values.storeId.join(',') : values.storeId;
    if (values.status) params.status = Array.isArray(values.status) ? values.status.join(',') : values.status;
    if (values.supplier) params.supplier = values.supplier;
    if (values.vatRate !== undefined && values.vatRate !== 'All') params.vatRate = values.vatRate.toString();
    if (values.minPrice !== undefined && values.minPrice !== null) params.minPrice = values.minPrice.toString();
    if (values.maxPrice !== undefined && values.maxPrice !== null) params.maxPrice = values.maxPrice.toString();

    setSearchParams(params);
  };

  const handleReset = () => {
    form.resetFields();
    setSearchParams({ page: '1', pageSize: '10' });
  };

  const handleImportJsonb = () => {
    try {
      if (!jsonbInputText.trim()) {
        message.warning('Vui lòng nhập dữ liệu JSON sản phẩm!');
        return;
      }
      const parsed = JSON.parse(jsonbInputText);
      const itemsToImport = Array.isArray(parsed) ? parsed : [parsed];

      const newRecords: ProductRecord[] = itemsToImport.map((item, idx) => ({
        key: `import-${Date.now()}-${idx}`,
        id: item.sku || item.id || `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: item.barcode || `89385${Math.floor(100000 + Math.random() * 900000)}`,
        name: item.name || item.productName || `Sản phẩm nạp #${idx + 1}`,
        category: item.category || 'Giày dép',
        storeId: item.storeId || 'ST-001',
        price: Number(item.price || item.sellingPrice || 500000),
        costPrice: Number(item.costPrice || item.cost || 300000),
        stock: Number(item.stock || item.quantity || 50),
        unit: item.unit || 'Đôi',
        vatRate: Number(item.vatRate || 8),
        promotion: item.promotion || 'Không',
        supplier: item.supplier || 'Nhà cung cấp tổng',
        createdDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        sapStatus: 1,
        status: 'active',
        image: item.image || `https://picsum.photos/seed/import_${idx}/120/120`
      }));

      setDataSource(prev => [...newRecords, ...prev]);
      message.success(`Đã nạp thành công ${newRecords.length} sản phẩm từ JSON!`);
      setIsJsonbModalOpen(false);
      setJsonbInputText('');
    } catch (err: any) {
      message.error(`Cú pháp JSON không hợp lệ: ${err.message}`);
    }
  };

  // Columns for Table
  const columns = [
    {
      title: 'Mã CH / Ngành',
      dataIndex: 'storeId',
      key: 'storeId',
      width: 130,
      render: (text: string, record: ProductRecord) => (
        <div className="space-y-1 py-0.5">
          <Tag color="blue" className="font-mono text-xs m-0">{text}</Tag>
          <div className="text-[11px] text-slate-500 font-medium truncate">{record.category}</div>
        </div>
      )
    },
    {
      title: 'Mã SKU / Barcode',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left' as const,
      width: 170,
      render: (text: string, record: ProductRecord) => (
        <div className="space-y-1 py-0.5">
          <a 
            onClick={(e) => {
              e.preventDefault();
              setDetailProduct(record);
              setIsDetailDrawerOpen(true);
            }}
            className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer block truncate"
          >
            {text}
          </a>
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
            <QrcodeOutlined className="text-slate-400" />
            <span className="truncate">{record.barcode}</span>
            <Tooltip title="Sao chép Barcode">
              <CopyOutlined 
                className="cursor-pointer text-slate-400 hover:text-blue-600 text-[10px]" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(record.barcode);
                  message.success(`Đã sao chép Barcode: ${record.barcode}`);
                }}
              />
            </Tooltip>
          </div>
        </div>
      )
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      render: (text: string, record: ProductRecord) => (
        <div className="flex items-center gap-2.5 py-1">
          <Avatar 
            shape="square" 
            size={40} 
            src={record.image} 
            icon={<BoxPlotOutlined />} 
            className="shrink-0 rounded-lg border border-slate-200"
          />
          <div className="overflow-hidden">
            <div className="font-semibold text-xs text-slate-800 truncate" title={text}>
              {text}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <span>ĐVT: <strong className="text-slate-700">{record.unit}</strong></span>
              <span>•</span>
              <span>VAT: <strong className="text-blue-600">{record.vatRate}%</strong></span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Đơn giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      sorter: (a: ProductRecord, b: ProductRecord) => a.price - b.price,
      render: (val: number) => (
        <Text strong className="text-blue-600 text-xs font-mono">
          {val.toLocaleString('vi-VN')} ₫
        </Text>
      )
    },
    {
      title: 'Giá vốn',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 120,
      render: (val: number, record: ProductRecord) => {
        const margin = record.price > 0 ? Math.round(((record.price - val) / record.price) * 100) : 0;
        return (
          <div className="space-y-0.5">
            <div className="text-xs font-mono text-slate-600">{val.toLocaleString('vi-VN')} ₫</div>
            <div className="text-[10px] text-emerald-600 font-semibold font-mono">Lãi: +{margin}%</div>
          </div>
        );
      }
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      width: 110,
      align: 'center' as const,
      sorter: (a: ProductRecord, b: ProductRecord) => a.stock - b.stock,
      render: (val: number, record: ProductRecord) => {
        let color = 'green';
        let label = `${val} ${record.unit}`;
        if (val === 0) {
          color = 'volcano';
          label = 'Hết hàng';
        } else if (val <= 20) {
          color = 'warning';
          label = `${val} ${record.unit} (Ít)`;
        }
        return <Tag color={color} className="font-mono font-bold text-xs m-0 px-2 py-0.5">{label}</Tag>;
      }
    },
    {
      title: 'Khuyến mãi',
      dataIndex: 'promotion',
      key: 'promotion',
      width: 180,
      render: (text: string) => {
        if (!text || text === 'Không') {
          return <span className="text-slate-400 text-xs font-mono">Không có</span>;
        }
        return (
          <Tag color="magenta" icon={<TagsOutlined />} className="text-[11px] font-mono m-0 py-0.5">
            {text}
          </Tag>
        );
      }
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 180,
      render: (text: string) => (
        <span className="text-xs text-slate-700 font-medium truncate block" title={text}>
          {text}
        </span>
      )
    },
    {
      title: 'Trạng thái SAP',
      dataIndex: 'sapStatus',
      key: 'sapStatus',
      width: 130,
      render: (val: any) => {
        if (val === 1 || val === '1' || val === true) {
          return <Badge status="success" text={<span className="text-xs text-emerald-600 font-medium">Đã đồng bộ</span>} />;
        }
        return <Badge status="warning" text={<span className="text-xs text-amber-600 font-medium">Chờ đồng bộ</span>} />;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 90,
      fixed: 'right' as const,
      render: (_: any, record: ProductRecord) => {
        const handleMenuClick = ({ key }: { key: string }) => {
          if (key === 'view') {
            setDetailProduct(record);
            setIsDetailDrawerOpen(true);
          } else if (key === 'edit') {
            if (!canEdit) {
              message.error('Lỗi 403 Forbidden: Tài khoản của bạn KHÔNG có quyền sửa thông tin sản phẩm!');
              return;
            }
            setEditingProduct(record);
            editForm.setFieldsValue(record);
            setIsEditModalOpen(true);
          } else if (key === 'sync_sap') {
            productService.syncSap(record.key);
            setDataSource(productService.getProducts());
            message.success(`Đã đồng bộ sản phẩm [${record.id}] lên SAP thành công!`);
          } else if (key === 'copy_json') {
            navigator.clipboard.writeText(JSON.stringify(record, null, 2));
            message.success(`Đã sao chép cấu trúc JSON của sản phẩm [${record.id}]!`);
          } else if (key === 'delete') {
            if (!canDelete) {
              message.error('Lỗi 403 Forbidden: Tài khoản của bạn KHÔNG có quyền xóa sản phẩm!');
              return;
            }
            modal.confirm({
              title: `Xác nhận xóa sản phẩm ${record.name}?`,
              content: 'Hành động này sẽ xóa dữ liệu sản phẩm khỏi danh mục.',
              okText: 'Xóa',
              okType: 'danger',
              cancelText: 'Hủy',
              onOk() {
                productService.deleteProduct(record.key);
                setDataSource(productService.getProducts());
                message.success(`Đã xóa sản phẩm ${record.name}`);
              }
            });
          }
        };

        const items: MenuProps['items'] = [
          { key: 'view', label: 'Xem chi tiết', icon: <EyeOutlined className="text-blue-600" /> },
          { key: 'edit', label: canEdit ? 'Chỉnh sửa' : 'Chỉnh sửa (Bị khóa 403)', icon: <EditOutlined className="text-amber-600" />, disabled: !canEdit },
          { key: 'sync_sap', label: 'Đồng bộ SAP', icon: <SyncOutlined className="text-emerald-600" /> },
          { key: 'copy_json', label: 'Copy JSON data', icon: <CopyOutlined className="text-indigo-600" /> },
          { type: 'divider' },
          { key: 'delete', label: canDelete ? 'Xóa sản phẩm' : 'Xóa (Bị khóa 403)', icon: <DeleteOutlined />, danger: true, disabled: !canDelete },
        ];

        return (
          <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={['click']} placement="bottomRight">
            <Button type="text" shape="circle" icon={<MoreOutlined className="text-slate-600" />} />
          </Dropdown>
        );
      }
    }
  ];

  // Search Form Content
  const searchFormContent = (
    <Form form={form} layout="vertical" onFinish={handleSearch}>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="q" label="Từ khóa tìm kiếm" style={{ marginBottom: 0 }}>
            <Input placeholder="Tên SP, SKU, Barcode..." prefix={<SearchOutlined />} allowClear />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item name="category" label="Ngành hàng" style={{ marginBottom: 0 }}>
            <Select 
              mode="multiple" 
              maxTagCount="responsive"
              placeholder="Chọn ngành hàng" 
              allowClear
              options={[
                { value: 'Giày dép', label: 'Giày dép' },
                { value: 'Balo & Túi xách', label: 'Balo & Túi xách' },
                { value: 'Ví & Phụ kiện', label: 'Ví & Phụ kiện' },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item name="storeId" label="Mã cửa hàng" style={{ marginBottom: 0 }}>
            <Select 
              mode="multiple" 
              maxTagCount="responsive"
              placeholder="Chọn cửa hàng" 
              allowClear
              options={[
                { value: 'ST-001', label: 'ST-001 (Cửa hàng Q1)' },
                { value: 'ST-002', label: 'ST-002 (Cửa hàng Q3)' },
                { value: 'ST-003', label: 'ST-003 (Cửa hàng Q7)' },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item name="status" label="Trạng thái hàng" style={{ marginBottom: 0 }}>
            <Select 
              placeholder="Chọn trạng thái" 
              allowClear
              options={[
                { value: 'active', label: 'Đang kinh doanh' },
                { value: 'low_stock', label: 'Sắp hết hàng (Tồn ≤ 20)' },
                { value: 'out_of_stock', label: 'Hết hàng (Tồn = 0)' },
                { value: 'discontinued', label: 'Ngừng kinh doanh' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Advanced Filter Expansion */}
      {isAdvancedSearchOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-slate-200 bg-slate-50/70 p-3 sm:p-4 rounded-xl border"
        >
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <FilterOutlined className="text-blue-600" /> Tiêu chí lọc mở rộng:
          </div>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="supplier" label="Nhà cung cấp" style={{ marginBottom: 0 }}>
                <Input placeholder="Tên nhà cung cấp..." allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item name="vatRate" label="Mức thuế VAT (%)" style={{ marginBottom: 0 }}>
                <Select 
                  placeholder="Chọn VAT" 
                  allowClear
                  options={[
                    { value: 0, label: '0% (Miễn thuế)' },
                    { value: 5, label: '5%' },
                    { value: 8, label: '8% (Ưu đãi)' },
                    { value: 10, label: '10% (Tiêu chuẩn)' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Khoảng giá bán (₫)" style={{ marginBottom: 0 }}>
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item name="minPrice" noStyle>
                    <InputNumber placeholder="Giá từ" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} style={{ width: '50%' }} />
                  </Form.Item>
                  <Form.Item name="maxPrice" noStyle>
                    <InputNumber placeholder="Giá đến" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} style={{ width: '50%' }} />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
            </Col>
          </Row>
        </motion.div>
      )}

      {/* Buttons */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 flex-wrap gap-2">
        <Button 
          type="link" 
          onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)} 
          icon={<FilterOutlined />}
          className="text-xs text-blue-600 p-0 hover:underline"
        >
          {isAdvancedSearchOpen ? 'Thu gọn bộ lọc nâng cao' : 'Mở rộng bộ lọc nâng cao'}
        </Button>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>Xóa bộ lọc</Button>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>Tìm kiếm</Button>
        </Space>
      </div>
    </Form>
  );

  return (
    <PageContainer
      title={t('products')}
      subtitle="Quản lý danh mục hàng hóa, giá vốn, tồn kho & đồng bộ SAP"
    >
      {/* 1. Section 1: Khung Tìm kiếm */}
      <CollapsibleSection
        title="Khung Tìm kiếm & Bộ lọc Sản phẩm"
        icon={<SearchOutlined />}
        isOpen={isSearchOpen}
        onToggle={() => setIsSearchOpen(!isSearchOpen)}
      >
        {searchFormContent}
      </CollapsibleSection>

      {/* 2. Section 2: Báo cáo Thống kê Hiệu năng */}
      <CollapsibleSection
        title="Thống kê Hiệu năng Sản phẩm"
        icon={<BarChartOutlined />}
        isOpen={isStatsOpen}
        onToggle={() => setIsStatsOpen(!isStatsOpen)}
      >
        <ProductStatsOverview stats={productStats} />
      </CollapsibleSection>

      {/* 3. Section 3: Bảng Danh sách Sản phẩm */}
      <CollapsibleSection
        title="Bảng Danh sách Sản phẩm"
        icon={<TableOutlined />}
        isOpen={isTableOpen}
        onToggle={() => setIsTableOpen(!isTableOpen)}
        extra={
          <Space size={8}>
            <Button 
              type="primary" 
              ghost 
              icon={<CodeOutlined />} 
              onClick={() => setIsJsonbModalOpen(true)}
              className="text-xs font-semibold"
            >
              Terminal / Import JSON
            </Button>
            <Button 
              icon={<FileExcelOutlined className="text-emerald-600" />} 
              onClick={() => {
                message.success('Đang xuất danh sách sản phẩm ra Excel (CSV)...');
              }}
              className="text-xs font-semibold"
            >
              Xuất Excel
            </Button>
            <Tooltip title={!canCreate ? "Lỗi 403 Forbidden: Bạn KHÔNG có quyền thêm sản phẩm" : ""}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                disabled={!canCreate}
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs font-semibold"
              >
                Thêm sản phẩm
              </Button>
            </Tooltip>
          </Space>
        }
      >
        {/* Tabs Filter */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'all', label: `Tất cả (${dataSource.length})` },
              { key: 'active', label: `Đang kinh doanh (${dataSource.filter(p => p.status === 'active').length})` },
              { key: 'low_stock', label: `Sắp hết hàng (${dataSource.filter(p => p.stock <= 20 && p.stock > 0).length})` },
              { key: 'out_of_stock', label: `Hết hàng (${dataSource.filter(p => p.stock === 0).length})` },
              { key: 'promoted', label: `Có Khuyến mãi (${dataSource.filter(p => p.promotion && p.promotion !== 'Không').length})` },
            ]}
          />

          {selectedRowKeys.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Space className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                <span className="text-xs font-bold text-blue-800">Đã chọn {selectedRowKeys.length} mục</span>
                <Button 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />} 
                  disabled={!canDelete}
                  onClick={() => {
                    modal.confirm({
                      title: `Xác nhận xóa ${selectedRowKeys.length} sản phẩm đã chọn?`,
                      okText: 'Xóa hàng loạt',
                      okType: 'danger',
                      onOk() {
                        setDataSource(prev => prev.filter(p => !selectedRowKeys.includes(p.key)));
                        setSelectedRowKeys([]);
                        message.success('Đã xóa thành công các sản phẩm đã chọn!');
                      }
                    });
                  }}
                >
                  Xóa hàng loạt
                </Button>
              </Space>
            </motion.div>
          )}
        </div>

        {/* Smart Table */}
        <SmartTable
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys)
          }}
          selectedRowKeys={selectedRowKeys}
          columns={columns as any}
          dataSource={filteredData}
          scroll={{ x: 1200, y: 550 }}
          pagination={{
            position: ['bottomRight'],
            current: page,
            pageSize: pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của ${total} sản phẩm`,
            onChange: (p, ps) => setSearchParams({ page: p.toString(), pageSize: ps.toString() })
          }}
        />
      </CollapsibleSection>

      {/* Detail Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <BoxPlotOutlined className="text-blue-600" />
            <span>Chi tiết Sản phẩm #{detailProduct?.id}</span>
          </div>
        }
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        width={500}
      >
        {detailProduct && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Avatar shape="square" size={72} src={detailProduct.image} icon={<BoxPlotOutlined />} className="rounded-lg shrink-0 border" />
              <div>
                <Title level={5} className="m-0 text-slate-800">{detailProduct.name}</Title>
                <div className="mt-1 flex items-center gap-2">
                  <Tag color="blue" className="font-mono">{detailProduct.id}</Tag>
                  <Tag color="purple">{detailProduct.category}</Tag>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border">
                <Text type="secondary" className="block mb-1">Giá bán công bố</Text>
                <Text strong className="text-blue-600 font-mono text-base">{detailProduct.price.toLocaleString('vi-VN')} ₫</Text>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border">
                <Text type="secondary" className="block mb-1">Giá vốn / Nhập</Text>
                <Text strong className="text-slate-700 font-mono text-base">{detailProduct.costPrice.toLocaleString('vi-VN')} ₫</Text>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border">
                <Text type="secondary" className="block mb-1">Tồn kho hiện tại</Text>
                <Text strong className="text-emerald-600 font-mono text-base">{detailProduct.stock} {detailProduct.unit}</Text>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border">
                <Text type="secondary" className="block mb-1">Thuế VAT áp dụng</Text>
                <Text strong className="text-slate-800 font-mono text-base">{detailProduct.vatRate}%</Text>
              </div>
            </div>

            <div>
              <Text strong className="text-xs uppercase tracking-wider text-slate-500 block mb-2">Mã Barcode & Nhà cung cấp</Text>
              <div className="bg-slate-50 p-3 rounded-xl border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Barcode:</span>
                  <span className="font-bold font-mono text-slate-800">{detailProduct.barcode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nhà cung cấp:</span>
                  <span className="font-bold text-slate-800">{detailProduct.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã Cửa hàng:</span>
                  <Tag color="blue" className="m-0 font-mono">{detailProduct.storeId}</Tag>
                </div>
              </div>
            </div>

            <div>
              <Text strong className="text-xs uppercase tracking-wider text-slate-500 block mb-2">Lịch sử Kho & Đồng bộ SAP</Text>
              <Timeline
                items={[
                  { color: 'green', children: `Nhập kho ban đầu: ${detailProduct.stock} ${detailProduct.unit}` },
                  { color: 'blue', children: `Đồng bộ dữ liệu sang SAP (Mã chứng từ: SAP-${detailProduct.id})` },
                  { color: 'gray', children: `Cập nhật lần cuối: ${detailProduct.createdDate}` }
                ]}
              />
            </div>

            <div>
              <Text strong className="text-xs uppercase tracking-wider text-slate-500 block mb-2">Raw JSON Data</Text>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40">
                {JSON.stringify(detailProduct, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Product Modal */}
      <Modal
        title="Thêm sản phẩm mới"
        open={isAddModalOpen}
        onOk={() => {
          addForm.validateFields().then(values => {
            const reqDto: ProductRequestDto = {
              id: values.id,
              barcode: values.barcode,
              name: values.name,
              category: values.category,
              storeId: values.storeId,
              price: values.price,
              costPrice: values.costPrice,
              stock: values.stock,
              unit: values.unit,
              vatRate: values.vatRate,
              promotion: values.promotion,
              supplier: values.supplier
            };
            productService.createProduct(reqDto);
            setDataSource(productService.getProducts());
            message.success(`Đã thêm sản phẩm mới ${values.name} thành công!`);
            setIsAddModalOpen(false);
            addForm.resetFields();
          });
        }}
        onCancel={() => setIsAddModalOpen(false)}
        width={600}
      >
        <FancyUpload maxCount={1} />
        <Divider className="my-3" />
        <Form form={addForm} layout="vertical">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Mã SKU sản phẩm" name="id" rules={[{ required: true }]}>
                <Input placeholder="Ví dụ: PROD-1099" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mã Barcode" name="barcode">
                <Input placeholder="Ví dụ: 893850123401" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên sản phẩm đầy đủ..." />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Ngành hàng" name="category" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'Giày dép', label: 'Giày dép' },
                    { value: 'Balo & Túi xách', label: 'Balo & Túi xách' },
                    { value: 'Ví & Phụ kiện', label: 'Ví & Phụ kiện' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Cửa hàng" name="storeId" initialValue="ST-001">
                <Select
                  options={[
                    { value: 'ST-001', label: 'ST-001' },
                    { value: 'ST-002', label: 'ST-002' },
                    { value: 'ST-003', label: 'ST-003' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item label="Giá bán (₫)" name="price" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Giá vốn (₫)" name="costPrice">
                <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Số lượng tồn" name="stock" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        title={`Chỉnh sửa Sản phẩm #${editingProduct?.id}`}
        open={isEditModalOpen}
        onOk={() => {
          editForm.validateFields().then(values => {
            if (!editingProduct) return;
            productService.updateProduct(editingProduct.key, values);
            setDataSource(productService.getProducts());
            message.success(`Đã cập nhật thông tin sản phẩm ${editingProduct.id}`);
            setIsEditModalOpen(false);
          });
        }}
        onCancel={() => setIsEditModalOpen(false)}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Giá bán (₫)" name="price" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tồn kho" name="stock" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* JSON Import Modal */}
      <Modal
        title="Terminal / Import dữ liệu JSON Sản phẩm"
        open={isJsonbModalOpen}
        onOk={handleImportJsonb}
        onCancel={() => setIsJsonbModalOpen(false)}
        okText="Nạp dữ liệu"
        width={650}
      >
        <div className="space-y-3">
          <Text type="secondary" className="text-xs">
            Dán mảng hoặc đối tượng JSON chứa danh sách sản phẩm từ Backend API:
          </Text>
          <Input.TextArea
            rows={10}
            value={jsonbInputText}
            onChange={(e) => setJsonbInputText(e.target.value)}
            placeholder={`[\n  {\n    "sku": "PROD-9999",\n    "name": "Giày Sneaker Mẫu Mới 2024",\n    "category": "Giày dép",\n    "price": 990000,\n    "costPrice": 600000,\n    "stock": 100\n  }\n]`}
            className="font-mono text-xs bg-slate-900 text-emerald-400 p-3 rounded-xl border"
          />
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Products;
