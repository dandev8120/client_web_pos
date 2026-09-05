import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Pagination,
  Divider,
  Modal,
  Empty,
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  ArrowLeftOutlined,
  EyeOutlined, 
  DeleteOutlined, 
  DownloadOutlined, 
  MoreOutlined,
  ReloadOutlined,
  FileTextOutlined,
  PlusOutlined,
  PrinterOutlined,
  BarChartOutlined,
  TableOutlined,
  UpOutlined,
  DownOutlined,
  FilterOutlined,
  LockOutlined,
  CopyOutlined,
  EditOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  FileExcelOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import { arrayMove } from '@dnd-kit/sortable';
import { motion } from 'motion/react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import PageContainer from '../components/PageContainer';
import { SmartTable } from '../components/SmartTable';
import { hasButtonPermission } from '../utils/accessControlPresets';
import { OrderSearchPayloadRequest, OrderSearchPayloadDto } from '../dtos/OrderDto';
import { orderService } from '../services/orderService';
import { API_CONFIG } from '../api/config';

// Import Modular Components & Types
import { DataType, OrderStats } from '../components/orders/orderTypes';
import { initialDataSource, getOrderDetailFull, mapBackendOrderToDataType, OrderMapper, sampleBackendJsonbOrder, formatOrderRowToText, parseDiscountCodesToLines, parsePaymentDetails, cleanSiteCode } from '../components/orders/orderHelpers';
import { StatusIndicator } from '../components/orders/StatusIndicator';
import { OrderStatsOverview } from '../components/orders/OrderStatsOverview';
import { OrderMobileCard } from '../components/orders/OrderMobileCard';
import { OrderFilterBar } from '../components/orders/OrderFilterBar';
import { message } from '../services/toastMessage';
import { DataSectionSkeleton } from '../components/DataSectionSkeleton';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import { STORAGE_KEYS } from '../constants/storageKeys';

const FancyUpload = React.lazy(() => import('../components/FancyUpload'));
const POSOrder = React.lazy(() => import('../components/POSOrder'));
const PrintInvoiceModal = React.lazy(() => import('../components/PrintInvoiceModal'));
const OrderDetailView = React.lazy(() =>
  import('../components/orders/OrderDetailView').then(({ OrderDetailView: component }) => ({ default: component }))
);

const { Text } = Typography;

const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  extra?: React.ReactNode;
}> = ({ title, icon, isOpen, onToggle, children, extra }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-4 transition-all duration-200 hover:border-slate-200">
      <div 
        className="flex justify-between items-center px-4 py-3 cursor-pointer bg-slate-50/50 select-none rounded-t-xl"
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
      {isOpen && (
        <div className="px-4 sm:px-5 py-4 border-t border-slate-100 bg-white rounded-b-xl">
          {children}
        </div>
      )}
    </div>
  );
};

export const Orders: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { modal } = App.useApp();

  const [dataSource, setDataSource] = useState<DataType[]>(initialDataSource);
  const [form] = Form.useForm();
  
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState<DataType | null>(null);

  // Edit order modal state
  const [editingOrder, setEditingOrder] = useState<DataType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();

  // JSONB Import modal state
  const [isJsonbModalOpen, setIsJsonbModalOpen] = useState(false);
  const [jsonbInputText, setJsonbInputText] = useState('');
  const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleImportJsonb = () => {
    try {
      if (!jsonbInputText.trim()) {
        message.warning('Vui lòng nhập dữ liệu JSON / JSONB!');
        return;
      }
      const newMappedItems = OrderMapper.parseAndMap(jsonbInputText);
      if (newMappedItems.length === 0) {
        message.warning('Không tìm thấy dữ liệu đơn hàng hợp lệ trong JSON!');
        return;
      }
      setDataSource(prev => [...newMappedItems, ...prev]);
      message.success(`Đã nạp & map thành công ${newMappedItems.length} chứng từ từ Backend API!`);
      setIsJsonbModalOpen(false);
      setJsonbInputText('');
    } catch (err: any) {
      message.error(`Cú pháp JSON không hợp lệ: ${err.message}`);
    }
  };

  // Permission Checks for Current Logged User
  const [currentUserSession, setCurrentUserSession] = useState<any>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PORTAL_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.PORTAL_SESSION);
        if (saved) setCurrentUserSession(JSON.parse(saved));
      } catch (e) {
        console.error('Error syncing user session', e);
      }
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('access-control-update', handleSync);
    window.addEventListener('authChange', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('access-control-update', handleSync);
      window.removeEventListener('authChange', handleSync);
    };
  }, []);

  const canCreateOrder = useMemo(() => {
    return hasButtonPermission(currentUserSession?.buttonPermissions, 'sales.orders.btn_create', currentUserSession?.roles);
  }, [currentUserSession]);

  const canCancelOrder = useMemo(() => {
    return hasButtonPermission(currentUserSession?.buttonPermissions, 'sales.orders.btn_cancel', currentUserSession?.roles);
  }, [currentUserSession]);

  const canPrintInvoice = useMemo(() => {
    return hasButtonPermission(currentUserSession?.buttonPermissions, 'sales.orders.btn_print', currentUserSession?.roles);
  }, [currentUserSession]);

  const canExportExcel = useMemo(() => {
    return hasButtonPermission(currentUserSession?.buttonPermissions, 'sales.orders.btn_export', currentUserSession?.roles);
  }, [currentUserSession]);

  const routeParams = useParams<{ site?: string; receipt?: string; '*': string }>();
  const navigate = useNavigate();

  // Derived search params
  const quickSearch = searchParams.get('q') || searchParams.get('keyword') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const normalizeStatsText = (value: unknown): string => {
    if (value === undefined || value === null) return '';
    if (Array.isArray(value)) return value.map(normalizeStatsText).filter(Boolean).join('/');
    if (typeof value === 'object') return '';
    return String(value).toUpperCase().trim();
  };

  const safeDecode = (str: string): string => {
    if (!str) return '';
    try {
      return decodeURIComponent(str).trim();
    } catch {
      return str.trim();
    }
  };

  let rawSite = safeDecode(routeParams.site || searchParams.get('site') || searchParams.get('siteCode') || '');
  let rawReceipt = safeDecode(routeParams.receipt || searchParams.get('receipt') || searchParams.get('receiptNumber') || searchParams.get('detailOrderId') || '');
  const wildcardParam = routeParams['*'] || '';

  if (wildcardParam && !rawReceipt) {
    const segments = wildcardParam.split('/').filter(Boolean);
    if (segments.length >= 1) {
      if (!rawSite) rawSite = safeDecode(segments[0]);
      else rawReceipt = safeDecode(segments[0]);
    }
    if (segments.length >= 2) {
      rawReceipt = safeDecode(segments[1]);
    }
  }

  // Handle single param in detail URL e.g. /sales/orders/detail/POS%201101/ or /sales/orders/detail/0001K7PX1120826
  if (rawSite && !rawReceipt) {
    if (rawSite.length > 8 || rawSite.includes('PX') || rawSite.startsWith('HD') || rawSite.startsWith('C26')) {
      rawReceipt = rawSite;
      rawSite = '1134';
    } else {
      if (rawSite.includes('1101')) {
        rawReceipt = '0001K7PX1120826';
      } else if (rawSite.includes('1125')) {
        rawReceipt = '0008K7PX1290726';
      } else {
        rawReceipt = '0008K7PX1290726';
      }
    }
  }

  const siteParam = cleanSiteCode(rawSite);
  const receiptParam = rawReceipt ? safeDecode(rawReceipt) : '';

  // Check if URL has query parameters for search (excluding detail view only params)
  const searchParamKeys = [
    'page', 'pageSize', 'keyword', 'q', 'maSites', 'storeId', 'soCTus', 'orderId',
    'maKH', 'customerCode', 'fromDate', 'startDate', 'toDate', 'endDate', 'dienThoai',
    'phone', 'thucThuMin', 'minTotal', 'thucThuMax', 'maxTotal', 'tienTheMin', 'minCardPay',
    'tienPhieuMin', 'maHH', 'sku', 'maBC', 'barcode', 'chietKhauMin', 'minDiscount',
    'chietKhauMax', 'maxDiscount', 'loaiCK', 'discountType', 'status', 'forceRefresh',
    'paymentKeyword', 'invoiceKeyword'
  ];

  const hasQueryParameters = useMemo(() => {
    return searchParamKeys.some(key => searchParams.has(key) && searchParams.get(key) !== '');
  }, [searchParams]);
  const currentSearchSignature = useMemo(() => searchParams.toString(), [searchParams]);

  // POST Search states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const showOrdersLoadingSkeleton = useDelayedLoading(isLoading, 400);
  const [postSearchResults, setPostSearchResults] = useState<DataType[]>([]);
  const [postTotalCount, setPostTotalCount] = useState<number>(0);
  const [postPayloadUsed, setPostPayloadUsed] = useState<OrderSearchPayloadDto | null>(null);
  const [postSearchSignatureUsed, setPostSearchSignatureUsed] = useState<string>('');

  // Custom flexible Page Size input state
  const [customPageSizeInput, setCustomPageSizeInput] = useState<number | null>(pageSize);

  useEffect(() => {
    setCustomPageSizeInput(pageSize);
  }, [pageSize]);

  const handleApplyCustomPageSize = () => {
    if (customPageSizeInput && customPageSizeInput > 0) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('page', '1');
        next.set('pageSize', customPageSizeInput.toString());
        return next;
      });
    }
  };

  // URL State Synchronization: URL is Single Source of Truth
  useEffect(() => {
    if (siteParam && receiptParam) {
      // Viewing detail page - skip summary search API call
      return;
    }

    if (!hasQueryParameters) {
      // 1. Initial access without query params: DO NOT call API, clear table and reset form
      form.resetFields();
      setPostSearchResults([]);
      setPostTotalCount(0);
      setPostPayloadUsed(null);
      setPostSearchSignatureUsed('');
      return;
    }

    // 2. Has query parameters in URL: Sync URL -> Form -> Execute POST API
    const curPage = parseInt(searchParams.get('page') || '1', 10);
    const curPageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const maSites = searchParams.get('maSites') 
      ? searchParams.get('maSites')!.split(',').map(s => s.trim()).filter(Boolean)
      : (searchParams.get('storeId') ? [searchParams.get('storeId')!] : undefined);

    const soCTus = searchParams.get('soCTus')
      ? searchParams.get('soCTus')!.split(',').map(s => s.trim()).filter(Boolean)
      : (searchParams.get('orderId') ? [searchParams.get('orderId')!] : undefined);

    const maKH = searchParams.get('maKH') || searchParams.get('customerCode') || undefined;
    const keyword = searchParams.get('keyword') || searchParams.get('q') || undefined;
    const dienThoai = searchParams.get('dienThoai') || searchParams.get('phone') || undefined;
    const maHH = searchParams.get('maHH') || searchParams.get('sku') || undefined;
    const maBC = searchParams.get('maBC') || searchParams.get('barcode') || undefined;
    const loaiCK = searchParams.get('loaiCK') || searchParams.get('discountType') || undefined;

    const fromDate = searchParams.get('fromDate') || searchParams.get('startDate') || undefined;
    const toDate = searchParams.get('toDate') || searchParams.get('endDate') || undefined;
    const dateRange = (fromDate && toDate) ? [dayjs(fromDate), dayjs(toDate)] : undefined;

    const thucThuMin = searchParams.get('thucThuMin') !== null && searchParams.get('thucThuMin') !== '' ? Number(searchParams.get('thucThuMin')) : undefined;
    const thucThuMax = searchParams.get('thucThuMax') !== null && searchParams.get('thucThuMax') !== '' ? Number(searchParams.get('thucThuMax')) : undefined;
    const tienTheMin = searchParams.get('tienTheMin') !== null && searchParams.get('tienTheMin') !== '' ? Number(searchParams.get('tienTheMin')) : undefined;
    const tienPhieuMin = searchParams.get('tienPhieuMin') !== null && searchParams.get('tienPhieuMin') !== '' ? Number(searchParams.get('tienPhieuMin')) : undefined;
    const chietKhauMin = searchParams.get('chietKhauMin') !== null && searchParams.get('chietKhauMin') !== '' ? Number(searchParams.get('chietKhauMin')) : undefined;
    const chietKhauMax = searchParams.get('chietKhauMax') !== null && searchParams.get('chietKhauMax') !== '' ? Number(searchParams.get('chietKhauMax')) : undefined;
    const paymentKeyword = searchParams.get('paymentKeyword') || undefined;
    const invoiceKeyword = searchParams.get('invoiceKeyword') || undefined;

    // Synchronize to Form UI
    const formValues = {
      maSites,
      soCTus,
      maKH,
      keyword,
      dienThoai,
      maHH,
      maBC,
      loaiCK,
      dateRange,
      thucThuMin,
      thucThuMax,
      tienTheMin,
      tienPhieuMin,
      chietKhauMin,
      chietKhauMax,
      paymentKeyword,
      invoiceKeyword
    };

    form.setFieldsValue(formValues);

    // Auto expand advanced filter panel if advanced fields are present
    if (dienThoai || maHH || maBC || loaiCK || thucThuMin !== undefined || thucThuMax !== undefined || tienTheMin !== undefined || tienPhieuMin !== undefined || chietKhauMin !== undefined || chietKhauMax !== undefined || paymentKeyword || invoiceKeyword) {
      setIsAdvancedSearchOpen(true);
    }

    // Build POST payload DTO request cleanly
    const payloadReq = new OrderSearchPayloadRequest({
      pageIndex: Math.max(1, curPage),
      pageSize: curPageSize,
      keyword,
      maSites,
      soCTus,
      maKH,
      fromDate,
      toDate,
      dienThoai,
      maHH,
      maBC,
      loaiCK,
      thucThuMin,
      thucThuMax,
      tienTheMin,
      tienPhieuMin,
      chietKhauMin,
      chietKhauMax,
      paymentKeyword,
      invoiceKeyword,
      forceRefresh: searchParams.get('forceRefresh') === 'true' ? true : undefined
    });

    let isMounted = true;
    const requestSignature = currentSearchSignature;
    setSelectedRowKeys([]);
    setIsLoading(true);

    orderService.searchOrdersPost(payloadReq)
      .then(res => {
        if (isMounted) {
          setPostSearchResults(res.items);
          setPostTotalCount(res.total);
          setPostPayloadUsed(res.payload);
          setPostSearchSignatureUsed(requestSignature);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.warn('POST searchReceipts API catch:', err);
        if (isMounted) {
          message.warning(`${err instanceof Error ? err.message : 'Có lỗi xảy ra'}`);
          setPostSearchResults([]);
          setPostTotalCount(0);
          setPostSearchSignatureUsed('');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams, currentSearchSignature]);

  // Detail View API State & Fetching
  const [detailOrder, setDetailOrder] = useState<DataType | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const showDetailLoadingSkeleton = useDelayedLoading(isLoadingDetail, 400);
  const [detailLoadingStatus, setDetailLoadingStatus] = useState<string>('Đang kết nối và lấy dữ liệu chi tiết chứng từ từ máy chủ POS Center...');
  const [detailElapsedSeconds, setDetailElapsedSeconds] = useState<number>(0);

  const forceRefreshParam = searchParams.get('forceRefresh') ?? 'true';

  useEffect(() => {
    if (!siteParam || !receiptParam) {
      setDetailOrder(null);
      setIsLoadingDetail(false);
      return;
    }

    let isMounted = true;
    setIsLoadingDetail(true);
    setDetailLoadingStatus('Đang kết nối máy chủ POS Center và truy vấn chi tiết chứng từ...');
    setDetailElapsedSeconds(0);

    const forceRefresh = forceRefreshParam !== 'false';
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      if (isMounted) {
        setDetailElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    // 5s notice
    const timer5s = setTimeout(() => {
      if (isMounted) {
        setDetailLoadingStatus('Máy chủ POS Center đang xử lý truy vấn dữ liệu, vui lòng chờ trong giây lát...');
        message.info({
          content: 'Đang phản hồi từ máy chủ POS Center, vui lòng chờ trong giây lát...',
          key: 'detail-loading-msg',
          duration: 4,
        });
      }
    }, 5000);

    // 10s notice
    const timer10s = setTimeout(() => {
      if (isMounted) {
        setDetailLoadingStatus('Kết nối máy chủ POS Center đang phản hồi chậm, hệ thống vẫn đang tiếp tục chờ máy chủ...');
        message.warning({
          content: 'Phản hồi từ máy chủ POS Center đang chậm, hệ thống vẫn đang tiếp tục xử lý request (không ngắt kết nối)...',
          key: 'detail-loading-msg',
          duration: 6,
        });
      }
    }, 10000);

    // 30s (or API_CONFIG.timeout) timeout notice
    const timeoutMs = API_CONFIG.timeout || 30000;
    const timer30s = setTimeout(() => {
      if (isMounted) {
        setDetailLoadingStatus(`Đã hết thời gian chờ phản hồi từ máy chủ POS Center (${Math.round(timeoutMs / 1000)}s).`);
        message.error({
          content: `Kết nối đến máy chủ POS Center quá thời gian quy định (${Math.round(timeoutMs / 1000)}s).`,
          key: 'detail-loading-msg',
          duration: 6,
        });
      }
    }, timeoutMs);

    orderService.getReceiptDetail(siteParam, receiptParam, forceRefresh)
      .then(res => {
        if (isMounted) {
          setDetailOrder(res);
          setIsLoadingDetail(false);
          message.destroy('detail-loading-msg');
        }
      })
      .catch(err => {
        console.error('Error fetching receipt detail API:', err);
        if (isMounted) {
          message.error(`Không thể tải chi tiết chứng từ ${receiptParam}: ${err.message || 'Lỗi kết nối'}`);
          setDetailOrder(null);
          setIsLoadingDetail(false);
          message.destroy('detail-loading-msg');
        }
      })
      .finally(() => {
        clearInterval(intervalId);
        clearTimeout(timer5s);
        clearTimeout(timer10s);
        clearTimeout(timer30s);
      });

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      clearTimeout(timer5s);
      clearTimeout(timer10s);
      clearTimeout(timer30s);
    };
  }, [siteParam, receiptParam, forceRefreshParam]);

  const handleOpenDetail = (record: DataType) => {
    const site = cleanSiteCode(record.storeId || (record as any).siteCode || '1134');
    const receipt = record.id || (record as any).receiptNumber || '';
    navigate(`/sales/orders/detail/${encodeURIComponent(site)}/${encodeURIComponent(receipt)}?forceRefresh=false`);
  };

  const handleCloseDetail = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/sales/orders');
    }
  };

  const handleSearch = (values?: any) => {
    setIsTableOpen(true);
    setIsSearchOpen(true);
    const rawForm = values || form.getFieldsValue();

    const params: Record<string, string> = {
      page: '1',
      pageSize: (searchParams.get('pageSize') || '10')
    };

    const isValValid = (v: any) => v !== undefined && v !== null && String(v).trim() !== '';

    if (rawForm.keyword && rawForm.keyword.trim() !== '') params.keyword = rawForm.keyword.trim();
    if (rawForm.maSites && (Array.isArray(rawForm.maSites) ? rawForm.maSites.length > 0 : String(rawForm.maSites).trim() !== '')) {
      params.maSites = Array.isArray(rawForm.maSites) ? rawForm.maSites.join(',') : rawForm.maSites;
    }
    if (rawForm.soCTus && (Array.isArray(rawForm.soCTus) ? rawForm.soCTus.length > 0 : String(rawForm.soCTus).trim() !== '')) {
      params.soCTus = Array.isArray(rawForm.soCTus) ? rawForm.soCTus.join(',') : rawForm.soCTus;
    }
    if (rawForm.maKH && rawForm.maKH.trim() !== '') params.maKH = rawForm.maKH.trim();
    if (rawForm.dateRange && rawForm.dateRange.length === 2 && rawForm.dateRange[0] && rawForm.dateRange[1]) {
      params.fromDate = rawForm.dateRange[0].format('YYYY-MM-DD');
      params.toDate = rawForm.dateRange[1].format('YYYY-MM-DD');
    }
    if (rawForm.dienThoai && rawForm.dienThoai.trim() !== '') params.dienThoai = rawForm.dienThoai.trim();
    if (rawForm.maHH && rawForm.maHH.trim() !== '') params.maHH = rawForm.maHH.trim();
    if (rawForm.maBC && rawForm.maBC.trim() !== '') params.maBC = rawForm.maBC.trim();
    if (rawForm.loaiCK && rawForm.loaiCK.trim() !== '') params.loaiCK = rawForm.loaiCK;

    if (isValValid(rawForm.thucThuMin)) params.thucThuMin = rawForm.thucThuMin.toString();
    if (isValValid(rawForm.thucThuMax)) params.thucThuMax = rawForm.thucThuMax.toString();
    if (isValValid(rawForm.tienTheMin)) params.tienTheMin = rawForm.tienTheMin.toString();
    if (isValValid(rawForm.tienPhieuMin)) params.tienPhieuMin = rawForm.tienPhieuMin.toString();
    if (isValValid(rawForm.chietKhauMin)) params.chietKhauMin = rawForm.chietKhauMin.toString();
    if (isValValid(rawForm.chietKhauMax)) params.chietKhauMax = rawForm.chietKhauMax.toString();
    if (rawForm.paymentKeyword && rawForm.paymentKeyword.trim() !== '') params.paymentKeyword = rawForm.paymentKeyword.trim();
    if (rawForm.invoiceKeyword && rawForm.invoiceKeyword.trim() !== '') params.invoiceKeyword = rawForm.invoiceKeyword.trim();

    setSearchParams(params);
  };

  const handleRefresh = () => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);

      if (![...params].length) {
        params.set('page', '1');
        params.set('pageSize', '10');
      }

      params.set('forceRefresh', 'true');
      return params;
    });
    message.success('Đã gửi yêu cầu làm mới dữ liệu.');
  };

  const handleReset = () => {
    form.resetFields();
    setSearchParams({});
    message.info('Đã làm mới điều kiện tra cứu. Vui lòng nhập thông tin chứng từ cần tìm.');
  };

  const handleQuickLoadDefault = () => {
    setSearchParams({ page: '1', pageSize: '10' });
  };

  // Table columns definition (16 Columns according to requirements)
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      fixed: 'left' as const,
      align: 'center' as const,
      resizable: false,
      render: (_: any, __: any, index: number) => (
        <span className="text-xs font-mono font-medium text-slate-500">
          {(page - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: 'Mã cửa hàng',
      dataIndex: 'storeId',
      key: 'storeId',
      width: 130,
      fixed: 'left' as const,
      align: 'center' as const,
      searchable: true,
      resizable: false,
      render: (text: string) => <Tag color="blue" className="font-mono text-xs m-0">{text}</Tag>
    },
    {
      title: 'Số chứng từ',
      dataIndex: 'id',
      key: 'id',
      width: 190,
      fixed: 'left' as const,
      align: 'center' as const,
      searchable: true,
      resizable: false,
      render: (text: string, record: DataType) => (
        <a 
          onClick={(e) => {
            e.preventDefault();
            handleOpenDetail(record);
          }}
          className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer inline-block whitespace-nowrap"
          title={text}
        >
          {text}
        </a>
      ),
    },
    {
      title: 'Số hóa đơn',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
      align: 'center' as const,
      searchable: true,
      resizable: true,
      render: (text: string) => {
        if (text === 'Chưa xuất') {
          return <span className="text-amber-600 font-medium text-xs bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block">{text}</span>;
        }
        return <code className="text-xs font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 inline-block whitespace-nowrap" title={text}>{text}</code>;
      }
    },
    {
      title: 'Mã giao dịch Qr',
      dataIndex: 'qrDetails',
      key: 'qrDetails',
      align: 'center' as const,
      resizable: true,
      render: (_: any, record: DataType) => {
        const payment = parsePaymentDetails(record);

        if (!payment.hasInfo) {
          return <span className="text-slate-400 text-xs font-mono">N/A</span>;
        }

        const { paymentMethod, bankCode, transactionCode, transactionStatus, rawList } = payment;

        return (
          <div className="space-y-1 py-0.5 text-[11px] font-mono flex flex-col items-center">
            {/* Payment Method & Bank */}
            {(paymentMethod || bankCode) && (
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <QrcodeOutlined className="text-sky-600 shrink-0 text-xs" />
                <span className="whitespace-normal break-words">
                  {paymentMethod}
                  {bankCode ? <span className="text-slate-400 font-normal"> / {bankCode}</span> : ''}
                </span>
              </div>
            )}

            {/* Transaction Code */}
            {transactionCode && (
              <div className="flex items-center justify-between gap-1.5 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded text-sky-950 w-full">
                <span className="text-[10px] text-sky-700 font-sans font-medium shrink-0">Mã GD:</span>
                <span className="font-bold text-sky-900 break-all flex-1 font-mono select-all text-center">{transactionCode}</span>
                <Tooltip title="Sao chép">
                  <CopyOutlined
                    className="cursor-pointer text-sky-500 hover:text-sky-700 text-[10px] shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(transactionCode);
                      message.success(`Đã sao chép mã GD: ${transactionCode}`);
                    }}
                  />
                </Tooltip>
              </div>
            )}

            {/* Transaction Status Tag */}
            {transactionStatus && (
              <div>
                <Tag
                  color={
                    transactionStatus === 'SUCCESS' ? 'green' :
                    transactionStatus === 'CANCELED' || transactionStatus === 'CANCELLED' || transactionStatus === 'FAILED' ? 'red' : 'orange'
                  }
                  className="font-mono text-[10px] font-bold px-1.5 py-0 m-0 border-0"
                >
                  {transactionStatus}
                </Tag>
              </div>
            )}

            {/* Fallback for unparsed lines if any */}
            {rawList.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1 text-[11px] text-slate-600 whitespace-normal break-words" title={item}>
                <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0"></span>
                <span className="break-words">{item}</span>
              </div>
            ))}
          </div>
        );
      }
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      align: 'center' as const,
      searchable: true,
      searchFields: ['customerCode', 'phone'],
      resizable: true,
      render: (text: string, record: DataType) => (
        <div className="space-y-1 py-0.5 text-center flex flex-col items-center">
          <div className="text-xs font-semibold text-slate-800" title={text}>
            {text}
          </div>
          <div>
            <Tag color="blue" className="font-mono text-[10px] px-1.5 py-0 m-0 border-blue-200 bg-blue-50 text-blue-700">
              {record.customerCode}
            </Tag>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {record.phone ? record.phone : 'Chưa có SĐT'}
          </div>
        </div>
      ),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employee',
      key: 'employee',
      align: 'center' as const,
      resizable: true,
      render: (text: string, record: DataType) => (
        <div className="space-y-1 py-0.5 text-center flex flex-col items-center">
          <div className="text-xs font-medium text-slate-800" title={text}>
            {text}
          </div>
          <div>
            <Tag className="text-[10px] px-1.5 py-0 text-slate-600 bg-slate-100 border-slate-200 m-0 font-mono">
              {record.employeeCode || 'NV001'}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Lượng hàng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      resizable: true,
      render: (value: number) => <span className="font-semibold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">{value}</span>
    },
    {
      title: 'Chiết khấu',
      dataIndex: 'totalDiscount',
      key: 'totalDiscount',
      align: 'center' as const,
      resizable: true,
      render: (value: number, record: DataType) => {
        const val = record.totalDiscount !== undefined && record.totalDiscount !== null
          ? record.totalDiscount
          : (record.lineDiscount ?? record.discount ?? 0);
        return (
          <span className="text-slate-700 text-xs font-medium font-mono">
            {val ? `${val.toLocaleString('vi-VN')} ₫` : '0 ₫'}
          </span>
        );
      }
    },
    {
      title: 'Mã giảm giá',
      dataIndex: 'promotionNote',
      key: 'promotionNote',
      align: 'center' as const,
      resizable: true,
      render: (value: string, record: DataType) => {
        let rawStr = record.promotionNote || '';
        if (!rawStr || rawStr === 'Không') {
          if (record.promotion && record.promotion !== 'Không') {
            rawStr = record.promotion;
          } else if (record.discountsList && record.discountsList.length > 0) {
            rawStr = record.discountsList.join(',');
          }
        }

        if (!rawStr || rawStr === 'Không') {
          return <span className="text-slate-400 text-xs font-mono">Không</span>;
        }

        const lines = parseDiscountCodesToLines(rawStr);

        return (
          <div className="flex items-start justify-between gap-1.5 bg-rose-50/80 border border-rose-200/80 text-rose-950 px-2.5 py-1.5 rounded-md group hover:bg-rose-100/80 transition-colors max-w-full mx-auto">
            <div className="font-mono text-[11px] leading-snug space-y-0.5 break-all text-left">
              {lines.map((line, idx) => (
                <div key={idx} className="hover:text-rose-600 transition-colors select-text">
                  {line}
                </div>
              ))}
            </div>
            <Tooltip title="Sao chép toàn bộ mã giảm giá">
              <CopyOutlined 
                className="cursor-pointer text-rose-400 hover:text-rose-700 shrink-0 text-xs mt-0.5" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(rawStr);
                  message.success(`Đã sao chép: ${rawStr}`);
                }} 
              />
            </Tooltip>
          </div>
        );
      }
    },
    {
      title: 'Thực thu',
      dataIndex: 'total',
      key: 'total',
      align: 'center' as const,
      resizable: true,
      sorter: (a: DataType, b: DataType) => a.total - b.total,
      render: (value: number) => (
        <Text strong className="text-blue-600 text-xs font-mono">
          {value.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Tên ca',
      dataIndex: 'shiftName',
      key: 'shiftName',
      align: 'center' as const,
      resizable: true,
      render: (text: string) => (
        <Tag className="text-[11px] bg-purple-50 text-purple-700 border-purple-200 m-0">
          {text || 'Ca 1 (Sáng)'}
        </Tag>
      )
    },
    {
      title: 'Tên vụ việc',
      dataIndex: 'caseCode',
      key: 'caseCode',
      align: 'center' as const,
      resizable: true,
      render: (text: string) => <code className="text-xs font-mono text-slate-600 bg-slate-50 px-1 py-0.5 rounded border border-slate-200">{text || 'N/A'}</code>
    },
    {
      title: 'Giờ chứng từ',
      dataIndex: 'time',
      key: 'time',
      align: 'center' as const,
      resizable: true,
      render: (text: string) => <span className="text-xs text-slate-500 font-mono">{text}</span>
    },
    {
      title: 'Trạng thái SAP',
      dataIndex: 'sapStatus',
      key: 'sapStatus',
      align: 'center' as const,
      resizable: true,
      render: (status: any) => (
        <StatusIndicator status={status} type="sap" />
      )
    },
    {
      title: 'Trạng thái đơn',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      resizable: true,
      render: (status: any) => (
        <StatusIndicator status={status} type="order" />
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right' as const,
      align: 'center' as const,
      width: 90,
      render: (_: any, record: DataType) => {
        const handleMenuClick = ({ key }: { key: string }) => {
          if (key === 'view') {
            handleOpenDetail(record);
          } else if (key === 'print') {
            if (!canPrintInvoice) {
              message.error('Lỗi 403 Forbidden: Bạn KHÔNG có quyền In Hóa đơn (sales.orders.btn_print)');
              return;
            }
            setPrintOrder(record);
            setIsPrintModalOpen(true);
          } else if (key === 'download_vat') {
            if (record.invoiceNo !== 'Chưa xuất') {
              window.open(`/api/vat/download?oid=${record.id}&sid=${record.storeId}&rid=${record.rid}&sig=mock_sig&a=${record.total}&ct=VND`, '_blank');
              message.success('Đang tải hóa đơn VAT PDF...');
            } else {
              message.warning('Đơn hàng chưa đăng ký xuất hóa đơn VAT.');
            }
          } else if (key === 'copy_row') {
            const rowText = formatOrderRowToText(record);
            navigator.clipboard.writeText(rowText);
            message.success(`Đã sao chép dữ liệu dòng chứng từ [${record.id}] dạng text!`);
          } else if (key === 'edit') {
            setEditingOrder(record);
            editForm.setFieldsValue({
              ...record,
              status: (record.status === null || record.status === undefined) ? 'null' : record.status,
              discountsListText: record.discountsList ? record.discountsList.join('\n') : '',
              qrDetailsText: record.qrDetails ? record.qrDetails.join('\n') : record.qrTransactionId || ''
            });
            setIsEditModalOpen(true);
          } else if (key === 'delete') {
            if (!canCancelOrder) {
              message.error('Lỗi 403 Forbidden: Tài khoản của bạn KHÔNG có quyền Hủy / Xóa Đơn Hàng (sales.orders.btn_cancel)');
              return;
            }
            modal.confirm({
              title: `Xác nhận xóa chứng từ ${record.id}?`,
              content: 'Hành động này không thể hoàn tác.',
              okText: 'Xóa',
              okType: 'danger',
              cancelText: 'Hủy',
              onOk() {
                setDataSource(prev => prev.filter(item => item.key !== record.key));
                message.success(`Đã xóa thành công chứng từ ${record.id}`);
              }
            });
          } else if (key === 'sync_sap') {
            setDataSource(prev => prev.map(item => item.key === record.key ? { ...item, sapStatus: 1 } : item));
            message.success(`Đã đồng bộ thành công chứng từ [${record.id}] sang hệ thống SAP!`);
          } else if (key === 'sync_bill') {
            message.loading(`Đang đồng bộ lại Bill [${record.id}]...`, 1);
            setTimeout(() => {
              message.success(`Đã đồng bộ lại Bill [${record.id}] thành công!`);
            }, 800);
          } else if (key === 'allow_vat') {
            const newInvoiceNo = record.invoiceNo === 'Chưa xuất' ? `INV-${Math.floor(100000 + Math.random() * 900000)}` : record.invoiceNo;
            setDataSource(prev => prev.map(item => item.key === record.key ? { ...item, invoiceNo: newInvoiceNo } : item));
            message.success(`Đã phê duyệt Cho xuất hóa đơn VAT [${newInvoiceNo}] cho chứng từ [${record.id}]!`);
          } else if (key === 'export_excel') {
            const csvData = [
              ['Mã cửa hàng', 'Số chứng từ', 'Số hóa đơn', 'Mã QR Txn', 'Khách hàng', 'Mã KH', 'SĐT', 'Nhân viên', 'Lượng hàng', 'Chiết khấu', 'Mã giảm giá', 'Thực thu', 'Tên ca', 'Tên vụ việc', 'Giờ', 'Trạng thái SAP', 'Trạng thái đơn'],
              [
                record.storeId,
                record.id,
                record.invoiceNo,
                record.qrDetails?.join('; ') || record.qrTransactionId || '',
                record.customer,
                record.customerCode || '',
                record.phone || '',
                record.employee,
                record.quantity,
                record.lineDiscount || 0,
                record.discount,
                record.total,
                record.shiftName || '',
                record.caseCode || '',
                record.time,
                record.sapStatus === 1 || record.sapStatus === '1' ? 'Đã đồng bộ' : 'Chờ',
                record.status || 'Hoàn thành'
              ]
            ];
            const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvData.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Order_Detail_${record.id}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            message.success(`Đã xuất dữ liệu chi tiết chứng từ [${record.id}] ra file Excel (CSV)!`);
          }
        };

        const items: MenuProps['items'] = [
          { key: 'view', label: 'Xem chi tiết', icon: <EyeOutlined className="text-blue-600" /> },
          canPrintInvoice && { key: 'print', label: 'In bill', icon: <PrinterOutlined className="text-slate-600" /> },
          { key: 'download_vat', label: 'Tải hóa đơn VAT', icon: <DownloadOutlined className="text-indigo-600" /> },
          { key: 'copy_row', label: 'Copy dòng dữ liệu', icon: <CopyOutlined className="text-emerald-600" /> },
          { type: 'divider' },
          canCancelOrder && { key: 'edit', label: 'Sửa', icon: <EditOutlined className="text-amber-600" /> },
          { key: 'sync_sap', label: 'Đồng bộ SAP', icon: <SyncOutlined className="text-emerald-600" /> },
          { key: 'sync_bill', label: 'Đồng bộ bill', icon: <ReloadOutlined className="text-cyan-600" /> },
          { key: 'allow_vat', label: 'Cho Xuất hóa đơn VAT', icon: <CheckCircleOutlined className="text-blue-600" /> },
          { key: 'export_excel', label: 'Xuất dữ liệu chi tiết excel', icon: <FileExcelOutlined className="text-emerald-700" /> },
          { type: 'divider' },
          ...(canCancelOrder ? [{ key: 'delete', label: 'Xóa', icon: <DeleteOutlined />, danger: true }] : []),
        ].filter(Boolean) as MenuProps['items'];

        return (
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={['click']}
            placement="bottomRight"
            getPopupContainer={() => document.body}
            overlayClassName="smart-table-action-dropdown"
            overlayStyle={{
              zIndex: 1200,
              maxHeight: 'min(280px, calc(100vh - 24px))',
              overflowY: 'auto',
            }}
          >
            <Button type="text" shape="circle" icon={<MoreOutlined className="text-slate-600" />} />
          </Dropdown>
        );
      },
    },
  ];

  // Table Statistics calculation (derived strictly from current page table data)
  const tableStats: OrderStats = useMemo(() => {
    const statsData = (hasQueryParameters ? postSearchResults : []).filter(Boolean);
    const totalOrders = statsData.length;

    // 1. Total orders with invoice
    const totalWithInvoice = statsData.filter(curr => 
      curr && curr.invoiceNo && curr.invoiceNo !== 'Chưa xuất' && curr.invoiceNo.trim() !== ''
    ).length;
    const invoiceRate = totalOrders > 0 ? Math.round((totalWithInvoice / totalOrders) * 100) : 0;

    // 2. Payment Methods Breakdown (Voucher, Tiền mặt, QR, ATM/CK)
    // Only counted if transactionStatus = SUCCESS
    let totalCashOrders = 0;
    let totalAtmCkOrders = 0;
    let totalQrOrders = 0;
    let totalVoucherOrders = 0;

    statsData.forEach(curr => {
      if (!curr) return;
      const pay = parsePaymentDetails(curr);
      const pm = normalizeStatsText(pay.paymentMethod || (curr as any).paymentMethod || (curr.rawJsonb?.paymentMethod) || (curr.rawJsonb?.payment?.paymentMethod));
      const st = normalizeStatsText(pay.transactionStatus || (curr as any).transactionStatus || (curr as any).paymentStatus || (curr.rawJsonb?.transactionStatus) || (curr.rawJsonb?.payment?.transactionStatus));

      // Check transactionStatus = SUCCESS
      const isSuccess = st === 'SUCCESS' || st.includes('SUCCESS') || (!st && curr.status !== 'cancelled');
      if (!isSuccess) return;

      const pmParts = pm.split('/').map((p: string) => p.trim());

      for (const part of pmParts) {
        if (part === 'TM') {
          totalCashOrders++;
        } else if (part === 'VOUCHER') {
          totalVoucherOrders++;
        } else if (part === 'CK' || part === 'ATM') {
          totalAtmCkOrders++;
        } else if (
          part.includes('QR') || part.includes('ZALOPAY') || part.includes('VNPAY') ||
          (curr.qrTransactionId && curr.qrTransactionId !== 'N/A')
        ) {
          totalQrOrders++;
        } else {
          totalCashOrders++; // fallback
        }
      }
    });

    const qrRate = totalOrders > 0 ? Math.round((totalQrOrders / totalOrders) * 100) : 0;
    const cashRate = totalOrders > 0 ? Math.round((totalCashOrders / totalOrders) * 100) : 0;
    const atmCkRate = totalOrders > 0 ? Math.round((totalAtmCkOrders / totalOrders) * 100) : 0;
    const voucherRate = totalOrders > 0 ? Math.round((totalVoucherOrders / totalOrders) * 100) : 0;

    // 3. Total Amount & Average Order Value
    const totalAmount = statsData.reduce((acc, curr) => acc + (curr?.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalAmount / totalOrders) : 0;

    // 4. Total Quantity
    const totalQuantity = statsData.reduce((acc, curr) => acc + (curr?.quantity || 0), 0);

    // 5. Total Discounts & Discounted Orders count (Exact match with "Chiết khấu" table column)
    const totalDiscounts = statsData.reduce((acc, curr) => {
      if (!curr) return acc;
      const val = curr.totalDiscount !== undefined && curr.totalDiscount !== null
        ? curr.totalDiscount
        : (curr.lineDiscount ?? curr.discount ?? 0);
      return acc + (typeof val === 'number' && !isNaN(val) ? val : 0);
    }, 0);

    const discountedOrdersCount = statsData.filter(curr => {
      if (!curr) return false;
      const val = curr.totalDiscount !== undefined && curr.totalDiscount !== null
        ? curr.totalDiscount
        : (curr.lineDiscount ?? curr.discount ?? 0);
      return val > 0 || (curr.discountsList && curr.discountsList.length > 0) || (curr.promotion && curr.promotion !== 'Không');
    }).length;

    // 6. SAP Sync Status
    const syncedCount = statsData.filter(curr => curr && (curr.sapStatus === 'sync' || curr.sapStatus === 1 || curr.sapStatus === true)).length;
    const syncRate = totalOrders > 0 ? Math.round((syncedCount / totalOrders) * 100) : 0;
    const pendingSapCount = statsData.filter(curr => curr && (curr.sapStatus !== 'sync' && curr.sapStatus !== 1 && curr.sapStatus !== true)).length;
    const pendingSapRate = totalOrders > 0 ? Math.round((pendingSapCount / totalOrders) * 100) : 0;

    return {
      totalOrders,
      totalWithInvoice,
      invoiceRate,
      totalQrOrders,
      qrRate,
      totalCashOrders,
      cashRate,
      totalAtmCkOrders,
      atmCkRate,
      totalVoucherOrders,
      voucherRate,
      totalAmount,
      avgOrderValue,
      totalQuantity,
      totalDiscounts,
      discountedOrdersCount,
      syncedCount,
      pendingSapCount,
      pendingSapRate,
      syncRate,
    };
  }, [hasQueryParameters, postSearchResults, postTotalCount]);

  const isLargeResultSet = postSearchResults.length > 200;
  const useVirtualTable = isLargeResultSet;
  const tableScrollX = 2600;
  const tableTargetRows = Math.min(Math.max(pageSize, 10), 12);
  const tableScrollY = isLargeResultSet
    ? 'clamp(720px, calc(100vh - 220px), 1180px)'
    : `clamp(720px, calc(100vh - 220px), ${tableTargetRows * 112}px)`;
  const tableDataSource = postSearchSignatureUsed === currentSearchSignature
    ? postSearchResults
    : [];

  const orderIdOptions = useMemo(() => {
    return Array.from(new Set((dataSource || []).filter(Boolean).map(d => d?.id).filter(Boolean))).map(id => ({ value: id, label: id }));
  }, [dataSource]);

  const tableContent = (
    <div className="bg-white space-y-4">
      {/* Action Bar & Quick Controls */}
      <div className="flex flex-wrap justify-end items-center gap-3 pb-2 border-b border-slate-100">
        <Space size={8} wrap>
          <Input
            placeholder={t('search_placeholder')}
            prefix={<SearchOutlined className="hover:border-slate-400 whitespace-nowrap" />}
            value={quickSearch}
            onChange={(e) => {
              const val = e.target.value;
              setSearchParams(prev => {
                if (val) prev.set('keyword', val);
                else prev.delete('keyword');
                return prev;
              });
            }}
            allowClear
            className="rounded-lg w-40 sm:w-60"
            onPressEnter={(e: any) => handleSearch({ ...form.getFieldsValue(), keyword: e.target.value })}
          />
          <Tooltip title={t('refresh')}>
            <Button
              icon={<ReloadOutlined className="text-blue-600" />} 
              onClick={handleRefresh}
              loading={isLoading}
              className="hover:border-slate-400 whitespace-nowrap"
            >
              Làm mới
            </Button>
          </Tooltip>

          {canCreateOrder && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreating(true)} className="hover:border-slate-400 whitespace-nowrap">
              {t('add_new')}
            </Button>
          )}
        </Space>
      </div>

      {/* Search API results display table */}
      <div className="space-y-3">
        {showOrdersLoadingSkeleton ? (
          <DataSectionSkeleton rows={Math.min(tableTargetRows, 10)} titleKey="orders_loading_title" />
        ) : (
        <div className="overflow-hidden border border-slate-200/80 rounded-xl bg-white">
          <SmartTable
            loading={false}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              columnWidth: 48,
              fixed: true,
            }}
            selectedRowKeys={selectedRowKeys}
            rowDraggable={false}
            onRowDragEnd={(activeId, overId) => {
              if (activeId !== overId) {
                setDataSource((prev) => {
                  const activeIndex = prev.findIndex((i) => i.key === activeId);
                  const overIndex = prev.findIndex((i) => i.key === overId);
                  return arrayMove(prev, activeIndex, overIndex);
                });
              }
            }}
            rowKey="key"
            columns={columns as any}
            dataSource={tableDataSource}
            scroll={{ x: tableScrollX, y: tableScrollY }}
            sticky
            tableLayout="fixed"
            virtual={useVirtualTable}
            responsiveExpanded={isMobile}
            pagination={{
              position: isMobile ? ['bottomCenter'] : ['bottomRight'],
              current: page,
              pageSize: pageSize,
              total: postTotalCount,
              showSizeChanger: !isMobile,
              showQuickJumper: !isMobile,
              pageSizeOptions: Array.from(new Set(['10', '20', '50', '100', '200', '500', pageSize.toString()])).sort((a, b) => Number(a) - Number(b)),
              showTotal: (total, range) => (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-slate-600 text-xs py-1 max-w-full">
                  <span className="whitespace-nowrap">Hiển thị <b className="text-slate-800">{range[0]}-{range[1]}</b> / <b className="text-slate-800">{total}</b> đơn hàng</span>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:ml-2 bg-slate-100/90 px-2 py-1 rounded-md border border-slate-200/80 max-w-full">
                    <span className="text-slate-600 font-medium whitespace-nowrap">Nhập số dòng:</span>
                    <InputNumber
                      min={1}
                      max={10000}
                      size="small"
                      placeholder="1000..."
                      value={customPageSizeInput}
                      onChange={(val) => setCustomPageSizeInput(val)}
                      onPressEnter={handleApplyCustomPageSize}
                      className="w-16 sm:w-20 font-mono text-xs"
                    />
                    <Button 
                      type="primary" 
                      size="small" 
                      onClick={handleApplyCustomPageSize}
                      className="text-xs px-2 sm:px-2.5 h-6 bg-blue-600 hover:bg-blue-700"
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              ),
              onChange: (p, ps) => {
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  next.set('page', ps !== pageSize ? '1' : p.toString());
                  next.set('pageSize', ps.toString());
                  return next;
                });
              }
            }}
          />
        </div>
        )}
      </div>
    </div>
  );

  // If order details selected, render OrderDetailView with real API state
  if (siteParam && receiptParam) {
    return (
      <PageContainer
        title={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleCloseDetail}
              className="hover:text-blue-600 transition-colors border-slate-200 shadow-sm flex items-center justify-center font-medium text-xs sm:text-sm"
            >
              Quay lại danh sách
            </Button>
            <Divider type="vertical" className="h-5 bg-slate-200 hidden sm:inline-block" />
                    <span className="text-base sm:text-lg font-extrabold text-slate-800 break-all">Chi tiết chứng từ {siteParam} {receiptParam}</span>
          </div>
        }
        noCard={true}
      >
        {isLoadingDetail ? (
          showDetailLoadingSkeleton ? (
            <div className="my-4 mx-auto max-w-3xl space-y-4">
              <DataSectionSkeleton rows={5} titleKey="order_detail_loading_title" />
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                <div className="font-semibold text-slate-800">Đang tải chi tiết chứng từ {receiptParam}</div>
                <div className="mt-1 text-slate-600">{detailLoadingStatus}</div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-mono text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span>Thời gian xử lý: {detailElapsedSeconds}s / {Math.round((API_CONFIG.timeout || 30000) / 1000)}s</span>
                </div>

                {detailElapsedSeconds >= 5 && (
                  <Alert
                    type={detailElapsedSeconds >= 10 ? "warning" : "info"}
                    showIcon
                    message={
                      detailElapsedSeconds >= 10
                        ? "Máy chủ POS Center đang xử lý dữ liệu. Hệ thống đang giữ kết nối cho đến khi máy chủ phản hồi hoàn tất."
                        : "Đang truy vấn dữ liệu POS Center. Vui lòng giữ kết nối."
                    }
                    className="mt-3 text-xs"
                  />
                )}
              </div>
            </div>
          ) : null
        ) : detailOrder ? (
          <>
            <OrderDetailView 
              order={detailOrder} 
              onPrint={(ord) => {
                setPrintOrder(ord);
                setIsPrintModalOpen(true);
              }} 
            />

            <PrintInvoiceModal 
              open={isPrintModalOpen} 
              onClose={() => setIsPrintModalOpen(false)} 
              order={printOrder} 
              detail={printOrder ? getOrderDetailFull(printOrder) : null} 
            />
          </>
        ) : (
          <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-200 my-4 flex flex-col items-center justify-center gap-4">
            <Empty description={`Không thể tìm thấy hoặc tải chi tiết chứng từ ${receiptParam}`} />
            <Button type="primary" onClick={handleCloseDetail}>
              Quay lại
            </Button>
          </div>
        )}
      </PageContainer>
    );
  }

  // If creating new POS order
  if (isCreating) {
    return (
      <POSOrder 
        onClose={() => setIsCreating(false)}
        onComplete={(newOrder) => {
          setDataSource(prev => [newOrder, ...prev]);
          setIsCreating(false);
          message.success('Đơn hàng đã được tạo thành công!');
        }}
        currentUser={(() => {
          const saved = localStorage.getItem(STORAGE_KEYS.PORTAL_SESSION);
          return saved ? JSON.parse(saved) : null;
        })()}
      />
    );
  }

  return (
    <PageContainer
      noCard={true}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* 1. Collapsible Stats Section (Topmost) */}
        <CollapsibleSection
          title="Thống kê"
          icon={<BarChartOutlined />}
          isOpen={isStatsOpen}
          onToggle={() => setIsStatsOpen(!isStatsOpen)}
        >
          <OrderStatsOverview stats={tableStats} />
        </CollapsibleSection>

        {/* 2. Collapsible Search Section */}
        <CollapsibleSection
          title="Tìm kiếm"
          icon={<SearchOutlined />}
          isOpen={isSearchOpen}
          onToggle={() => setIsSearchOpen(!isSearchOpen)}
        >
          <OrderFilterBar
            form={form}
            quickSearch={quickSearch}
            isExpanded={isAdvancedSearchOpen}
            onToggleExpand={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
            onSearch={handleSearch}
            onRefresh={handleRefresh}
            onReset={handleReset}
          />
        </CollapsibleSection>

        {/* 3. Main Content Tabs */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 sm:p-5">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            items={[
              {
                key: 'all',
                label: t('all_orders'),
                children: (
                  <div className="pt-2 sm:pt-4 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                          <TableOutlined />
                        </div>
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">Danh sách chứng từ bán hàng</span>
                      </div>
                      {selectedRowKeys.length > 0 && (
                        <span className="text-xs text-blue-600 font-semibold bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full animate-pulse">
                          Đã chọn {selectedRowKeys.length} đơn
                        </span>
                      )}
                    </div>
                    {tableContent}
                  </div>
                )
              },
              {
                key: 'upload',
                label: t('upload_docs'),
                children: (
                  <div className="pt-2 sm:pt-4">
                    <FancyUpload multiple />
                  </div>
                )
              },
              {
                key: 'settings',
                label: t('order_settings'),
                children: (
                  <div className="pt-4 text-center py-10">
                    <FileTextOutlined className="text-4xl text-slate-300" />
                    <div className="mt-2 text-slate-500 text-xs">Cấu hình tham số đơn hàng</div>
                  </div>
                )
              }
            ]}
            animated={{ inkBar: true, tabPane: true }}
          />
        </div>
      </div>

      <PrintInvoiceModal 
        open={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)} 
        order={printOrder} 
        detail={printOrder ? getOrderDetailFull(printOrder) : null} 
      />

      {/* Modal Chỉnh sửa chứng từ */}
      <Modal
        title={`Chỉnh sửa chứng từ bán hàng: ${editingOrder?.id}`}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => {
          editForm.validateFields().then(values => {
            const discountsList = values.discountsListText 
              ? values.discountsListText.split('\n').map((s: string) => s.trim()).filter(Boolean)
              : [];
            const qrDetails = values.qrDetailsText 
              ? values.qrDetailsText.split('\n').map((s: string) => s.trim()).filter(Boolean)
              : [];

            const status = values.status === 'null' ? null : values.status;

            setDataSource(prev => prev.map(item => {
              if (item.key === editingOrder?.key) {
                return {
                  ...item,
                  ...values,
                  status,
                  discountsList,
                  qrDetails,
                  qrTransactionId: qrDetails.length > 0 ? qrDetails[0] : values.qrTransactionId
                };
              }
              return item;
            }));

            message.success(`Đã cập nhật chứng từ [${editingOrder?.id}] thành công!`);
            setIsEditModalOpen(false);
            setEditingOrder(null);
          });
        }}
        width={700}
        okText="Cập nhật chứng từ"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-blue-600 font-bold' }}
      >
        <Form form={editForm} layout="vertical" className="pt-3 space-y-2">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="storeId" label="Mã cửa hàng" rules={[{ required: true }]}>
                <Input placeholder="ST-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="invoiceNo" label="Số hóa đơn">
                <Input placeholder="INV-889012 hoặc Chưa xuất" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="customer" label="Tên khách hàng" rules={[{ required: true }]}>
                <Input placeholder="Tên khách" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="customerCode" label="Mã KH">
                <Input placeholder="KH001" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="0901234567" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="employee" label="Tên nhân viên" rules={[{ required: true }]}>
                <Input placeholder="Tên nhân viên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="employeeCode" label="Mã nhân viên">
                <Input placeholder="NV001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="quantity" label="Lượng hàng" rules={[{ required: true }]}>
                <InputNumber className="w-full" min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="lineDiscount" label="Chiết khấu (₫)">
                <InputNumber className="w-full" min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="total" label="Thực thu (₫)" rules={[{ required: true }]}>
                <InputNumber className="w-full" min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="shiftName" label="Tên ca">
                <Input placeholder="Ca 1 (Sáng)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="caseCode" label="Mã vụ việc">
                <Input placeholder="CASE-2026-001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="discountsListText" label="Các mã giảm giá (Mỗi dòng 1 mã)">
                <Input.TextArea rows={3} placeholder="SUMMER2026 (-50k)&#10;VIP10 (-30k)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qrDetailsText" label="Mã giao dịch QR (Mỗi dòng 1 giao dịch)">
                <Input.TextArea rows={3} placeholder="VNPay: 88492042&#10;ZaLoPay: 99402123" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="sapStatus" label="Trạng thái SAP (0: Chờ, 1: Đã đồng bộ)">
                <Select
                  options={[
                    { value: 0, label: '0 - Chờ' },
                    { value: 1, label: '1 - Đã đồng bộ' }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái đơn (null: Auto Hoàn thành)">
                <Select
                  options={[
                    { value: 'null', label: 'null (Auto Hoàn thành)' },
                    { value: 'completed', label: 'Hoàn thành' },
                    { value: 'cancelled', label: 'Đã hủy' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Orders;
