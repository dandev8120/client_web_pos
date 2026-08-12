import React, { useState, useMemo, useEffect } from 'react';
import { 
  Steps, Card, Form, Input, Select, InputNumber, Button, Table, Space, Tag, Tabs, 
  Popconfirm, Alert, Row, Col, Typography, App, Switch, Tooltip, Segmented,
  Modal, Progress, Divider, List, Popover, Badge, Dropdown, Checkbox,
  DatePicker, TimePicker
} from 'antd';
import dayjs from 'dayjs';
import { 
  GiftOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SettingOutlined,
  PlaySquareOutlined, FolderAddOutlined, BulbOutlined, ReloadOutlined,
  CrownOutlined, NotificationOutlined, LaptopOutlined, EyeOutlined,
  DownloadOutlined, FileTextOutlined, PrinterOutlined, SearchOutlined, DownOutlined,
  ArrowLeftOutlined, CalendarOutlined, ArrowDownOutlined, AppstoreOutlined,
  ClockCircleOutlined, CheckCircleOutlined, UpOutlined, QuestionCircleOutlined,
  DeploymentUnitOutlined, CopyOutlined
} from '@ant-design/icons';
import { 
  Gift, Zap, Sparkles, Award, CornerDownRight, PartyPopper, Laptop, 
  Tv, Tags, ShoppingCart, Users, Percent, Briefcase, ShieldCheck, 
  Trash2, FolderPlus, Palette, Settings, CheckCircle2, FileText, ChevronRight, HelpCircle,
  Calendar, ArrowDown, Layers, Clock, ChevronDown, ChevronUp,
  Heart, Star, Bell, ShieldAlert, Shield, Check, X, Info
} from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

import { SmartTable } from '../components/SmartTable';
import { hasButtonPermission } from '../utils/rbacPresets';
import { promotionService } from '../services/promotionService';
import { productService } from '../services/productService';

// SẢN PHẨM LIÊN KẾT KHI CẤU HÌNH (Lấy động từ productService)
const DEFAULT_PRODUCTS = productService.getProducts().map(p => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price
}));

interface CheckboxMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: { label: string; value: string; group?: string }[];
  placeholder: string;
  maxTagCount?: number;
}

function CheckboxMultiSelect({
  value = [],
  onChange,
  options = [],
  placeholder,
  maxTagCount = 3,
}: CheckboxMultiSelectProps) {
  const [searchText, setSearchText] = useState('');
  const [visible, setVisible] = useState(false);

  // Filter options based on search text
  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return options;
    const lower = searchText.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(lower) || o.value.toLowerCase().includes(lower));
  }, [options, searchText]);

  // Is "All" checked? All of the currently *filtered* options are in `value`
  const isAllChecked = useMemo(() => {
    if (filteredOptions.length === 0) return false;
    return filteredOptions.every(o => value.includes(o.value));
  }, [filteredOptions, value]);

  // Is "All" indeterminate? Some but not all of the filtered options are in `value`
  const isAllIndeterminate = useMemo(() => {
    if (filteredOptions.length === 0) return false;
    const count = filteredOptions.filter(o => value.includes(o.value)).length;
    return count > 0 && count < filteredOptions.length;
  }, [filteredOptions, value]);

  const handleToggleAll = (checked: boolean) => {
    const filteredValues = filteredOptions.map(o => o.value);
    if (checked) {
      // Add all filtered values that are not already present
      const newValue = Array.from(new Set([...value, ...filteredValues]));
      onChange(newValue);
    } else {
      // Remove all filtered values
      const newValue = value.filter(v => !filteredValues.includes(v));
      onChange(newValue);
    }
  };

  const handleToggleItem = (itemValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, itemValue]);
    } else {
      onChange(value.filter(v => v !== itemValue));
    }
  };

  const handleRemoveValue = (e: React.MouseEvent, itemValue: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== itemValue));
  };

  // Content to display in the popover
  const popoverContent = (
    <div style={{ width: 340, padding: '4px 0' }} onClick={(e) => e.stopPropagation()}>
      {/* Search Input */}
      <div style={{ padding: '0 8px 8px 8px', borderBottom: '1px solid #f0f0f0' }}>
        <Input
          placeholder="Tìm kiếm..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          allowClear
          size="small"
        />
      </div>

      {/* Select All Option */}
      <div style={{ padding: '8px 12px', borderBottom: '1px dashed #e8e8e8' }}>
        <Checkbox
          checked={isAllChecked}
          indeterminate={isAllIndeterminate}
          onChange={e => handleToggleAll(e.target.checked)}
        >
          <strong style={{ color: '#1677ff' }}>[Tất cả]</strong>
        </Checkbox>
      </div>

      {/* Scrollable List of Options */}
      <div style={{ maxHeight: 240, overflowY: 'auto', padding: '4px 0' }}>
        {filteredOptions.length === 0 ? (
          <div style={{ padding: '12px', textAlign: 'center', color: '#bfbfbf', fontSize: 12 }}>
            Không tìm thấy kết quả
          </div>
        ) : (
          filteredOptions.map((opt, idx) => {
            const isChecked = value.includes(opt.value);
            return (
              <div
                key={opt.value}
                onClick={() => handleToggleItem(opt.value, !isChecked)}
                style={{
                  padding: '8px 12px',
                  borderBottom: idx === filteredOptions.length - 1 ? 'none' : '1px dashed #f0f0f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                }}
                className="hover:bg-blue-50/50"
              >
                <Checkbox
                  checked={isChecked}
                  onChange={e => handleToggleItem(opt.value, e.target.checked)}
                  onClick={e => e.stopPropagation()}
                  style={{ marginRight: 8 }}
                />
                <span style={{ fontSize: 12, flex: 1, color: isChecked ? '#1677ff' : '#262626' }}>
                  {opt.label}
                </span>
                {opt.group && (
                  <Tag color="cyan" style={{ fontSize: 9, margin: 0, padding: '0 4px', height: 'fit-content' }}>
                    {opt.group}
                  </Tag>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer statistics */}
      <div style={{ padding: '8px 12px 0 12px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#8c8c8c' }}>
          Đã chọn: <strong>{value.length}</strong> / {options.length}
        </span>
        {value.length > 0 && (
          <Button type="link" size="small" danger style={{ padding: 0, fontSize: 11, height: 'auto' }} onClick={() => onChange([])}>
            Xóa hết
          </Button>
        )}
      </div>
    </div>
  );

  // Trigger element that looks like a native Select input
  return (
    <Popover
      content={popoverContent}
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
      placement="bottomLeft"
      styles={{ body: { padding: '8px 4px' } }}
    >
      <div
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          padding: '4px 12px',
          background: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 32,
          transition: 'all 0.3s',
        }}
        className="hover:border-blue-400"
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flex: 1, overflow: 'hidden' }}>
          {value.length === 0 ? (
            <span style={{ color: '#bfbfbf', fontSize: 13 }}>{placeholder}</span>
          ) : value.length > maxTagCount ? (
            <Tag color="blue" style={{ fontSize: 12, margin: 0, fontWeight: 'bold' }}>
              🎯 {value.length}/{options.length} được chọn
            </Tag>
          ) : (
            value.map(val => {
              const opt = options.find(o => o.value === val);
              return (
                <Tag
                  key={val}
                  color="processing"
                  closable
                  onClose={(e) => handleRemoveValue(e, val)}
                  style={{ fontSize: 11, margin: 0 }}
                >
                  {opt ? (opt.label.length > 25 ? opt.label.slice(0, 25) + '...' : opt.label) : val}
                </Tag>
              );
            })
          )}
        </div>
        <DownOutlined style={{ fontSize: 10, color: '#bfbfbf', marginLeft: 8 }} />
      </div>
    </Popover>
  );
}

export default function Promotions() {
  const { message, modal } = App.useApp();

  // Active User session from localStorage for RBAC checks
  const loggedUser = useMemo(() => {
    const saved = localStorage.getItem('@@WEB_POS_PORTAL');
    return saved ? JSON.parse(saved) : null;
  }, []);

  const userRoles = useMemo(() => {
    return loggedUser?.roles || [loggedUser?.role || 'user'];
  }, [loggedUser]);

  const canCreate = useMemo(() => {
    return hasButtonPermission(loggedUser?.buttonPermissions, 'sales.promotions.btn_create', userRoles);
  }, [loggedUser, userRoles]);

  const canEdit = useMemo(() => {
    return hasButtonPermission(loggedUser?.buttonPermissions, 'sales.promotions.btn_edit', userRoles);
  }, [loggedUser, userRoles]);

  const canDelete = useMemo(() => {
    return hasButtonPermission(loggedUser?.buttonPermissions, 'sales.promotions.btn_delete', userRoles);
  }, [loggedUser, userRoles]);

  const canExport = useMemo(() => {
    return hasButtonPermission(loggedUser?.buttonPermissions, 'sales.promotions.btn_export', userRoles);
  }, [loggedUser, userRoles]);
  
  // State 1: Console Menus Tree
  const [consoleMenus, setConsoleMenus] = useState<any[]>(() => promotionService.getConsoleMenus());

  // State 2: Visual Presets (Mẫu Card Giao Diện)
  const [visualPresets, setVisualPresets] = useState<any[]>(() => promotionService.getVisualPresets());

  // Load and fallback initialized trees if empty (matching POSOrder)
  useEffect(() => {
    if (consoleMenus.length === 0) {
      const defaultMenus = [
        {
          key: 'products',
          title: 'Catalog Hàng hóa',
          icon: 'ShoppingCart',
          background: '#f0f5ff',
          border: '1px solid #adc6ff',
          color: '#2f54eb',
          description: 'F2-Tra cứu mặt hàng & Sim-Scan',
          type: 'action',
          actionView: 'products_catalog'
        },
        {
          key: 'customers',
          title: 'Thành viên & Loyalty',
          icon: 'Users',
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          color: '#52c41a',
          description: 'Phân hạng và code sinh nhật',
          type: 'action',
          actionView: 'customer_loyalty'
        },
        {
          key: 'promotions',
          title: 'Chương trình Khuyến mãi',
          icon: 'Percent',
          background: '#fff2e8',
          border: '1px solid #ffbb96',
          color: '#fa541c',
          description: 'Ưu đãi theo bill, mã hàng, nhân viên, quản lý',
          type: 'folder',
          children: [
            {
              key: 'system',
              title: 'CTKM Hệ thống',
              icon: 'Gift',
              background: '#e6f7ff',
              border: '1px solid #91d5ff',
              color: '#1890ff',
              description: 'Khuyến mãi tự động theo bill hoặc theo mã mặt hàng',
              type: 'folder',
              children: [
                {
                  key: 'system_bill',
                  title: 'Giảm Toàn Bill (VND & %)',
                  icon: 'Award',
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  color: '#52c41a',
                  description: 'Áp dụng giảm trừ tự động hoặc chủ động cho toàn hóa đơn',
                  type: 'folder',
                  children: [
                    {
                      key: 'km_bill_1000',
                      title: 'Hóa đơn lớn >= 12tr giảm 10%',
                      scope: 'bill',
                      promoType: 'bill',
                      description: 'Tự động giảm 10% tổng hóa đơn khi hóa đơn đạt từ 12,000,000 đ',
                      threshold: 12000000,
                      value: 0.10,
                      isRate: true,
                      type: 'toggle_promo',
                      icon: 'Sparkles',
                      color: '#fa8c16'
                    },
                    {
                      key: 'km_time_flash',
                      title: 'Flash Sale giờ vàng - 5%',
                      scope: 'bill',
                      promoType: 'time',
                      description: 'Chương trình Flash Sale áp dụng 5% chiết khấu thêm trên toàn hóa đơn',
                      value: 0.05,
                      isRate: true,
                      type: 'toggle_promo',
                      icon: 'Zap',
                      color: '#1890ff'
                    },
                    {
                      key: 'km_bill_500',
                      title: 'Hóa đơn >= 5tr trừ trực tiếp 300k',
                      scope: 'bill',
                      promoType: 'bill',
                      description: 'Cộng dồn bớt trực tiếp 300,000 đ cho hóa đơn đạt mốc 5,000,000 đ trở lên',
                      threshold: 5000000,
                      value: 300000,
                      isRate: false,
                      type: 'toggle_promo',
                      icon: 'CornerDownRight',
                      color: '#eb2f96'
                    },
                    {
                      key: 'km_store_south',
                      title: 'Mừng khai trương giảm 1 triệu',
                      scope: 'bill',
                      promoType: 'store',
                      description: 'Mừng khai trương bớt trực tiếp 1,000,000 đ khi giá trị bill từ 7,500,000 đ',
                      threshold: 7500000,
                      value: 1000000,
                      isRate: false,
                      type: 'toggle_promo',
                      icon: 'PartyPopper',
                      color: '#722ed1'
                    }
                  ]
                },
                {
                  key: 'system_item',
                  title: 'Chiết Khấu Mã Hàng (%)',
                  icon: 'Tags',
                  background: '#e6f7ff',
                  border: '1px solid #91d5ff',
                  color: '#1890ff',
                  description: 'Giảm theo % của từng dòng mặt hàng có trong giỏ',
                  type: 'folder',
                  children: [
                    {
                      key: 'km_mathang_bitis',
                      title: 'Giảm Giày Biti\'s Hunter - 10%',
                      scope: 'item',
                      promoType: 'item',
                      description: 'Giảm ngay 10% khi mua Giày Thể Thao Sneaker Biti\'s Hunter Street (PROD-1001)',
                      targetId: 'PROD-1001',
                      value: 0.10,
                      isRate: true,
                      type: 'assigned_item_promo',
                      icon: 'Sparkles',
                      color: '#fa541c'
                    },
                    {
                      key: 'km_nhom_giaydep',
                      title: 'Chọn KM nhóm Giày Dép - 15%',
                      scope: 'item',
                      promoType: 'category',
                      description: 'Giảm 15% khi áp mã cho bất kỳ sản phẩm thuộc nhóm Giày dép',
                      targetId: 'Giày dép',
                      value: 0.15,
                      isRate: true,
                      type: 'assigned_item_promo',
                      icon: 'Award',
                      color: '#2f54eb'
                    }
                  ]
                }
              ]
            },
            {
              key: 'employee',
              title: 'Nội bộ Nhân viên',
              icon: 'Briefcase',
              background: '#fdf8e2',
              border: '1px solid #ffe58f',
              color: '#d4b106',
              description: 'Mã số nhân viên công ty (10%)',
              type: 'action',
              actionView: 'corporate_employee'
            },
            {
              key: 'manager',
              title: 'Ủy quyền Giám sát',
              icon: 'ShieldCheck',
              background: '#f9f0ff',
              border: '1px solid #d3adf7',
              color: '#722ed1',
              description: 'Yêu cầu duyệt PIN cấp quản lý',
              type: 'action',
              actionView: 'manager_pin'
            },
            {
              key: 'quick',
              title: 'Giảm nhanh Ca trực',
              icon: 'Zap',
              background: '#fff0f6',
              border: '1px solid #ffadd2',
              color: '#eb2f96',
              description: 'Bớt mốc tiền/phàn nàn dịch vụ',
              type: 'action',
              actionView: 'quick_discount'
            }
          ]
        },
        {
          key: 'vouchers',
          title: 'Voucher Gotit/Urbox',
          icon: 'Ticket',
          background: '#fcf0fa',
          border: '1px solid #f2cfeb',
          color: '#c41d7f',
          description: 'Mã coupon trừ trực tiếp tiền mặt',
          type: 'action',
          actionView: 'voucher_gotit'
        },
        {
          key: 'payment',
          title: 'Thanh toán Hóa đơn',
          icon: 'CreditCard',
          background: '#f9f0ff',
          border: '1px solid #d3adf7',
          color: '#722ed1',
          description: 'ATM, chuyển khoản, ví điện tử',
          type: 'action',
          actionView: 'payment_gate'
        }
      ];
      setConsoleMenus(defaultMenus);
      localStorage.setItem('pos_console_menus', JSON.stringify(defaultMenus));
    }
  }, [consoleMenus]);

  // Persist Visual presets
  useEffect(() => {
    localStorage.setItem('pos_promo_presets', JSON.stringify(visualPresets));
  }, [visualPresets]);

  // Recursively extract all promos from console tree
  const extractPromotions = (items: any[]): any[] => {
    let promos: any[] = [];
    if (!Array.isArray(items)) return promos;
    items.forEach(it => {
      if (it && (it.type === 'toggle_promo' || it.type === 'assigned_item_promo')) {
        promos.push({
          ...it,
          id: it.key,
          key: it.key,
          name: it.title,
          title: it.title,
          scope: it.scope || (it.type === 'toggle_promo' ? 'bill' : 'item'),
          promoType: it.promoType || (it.type === 'toggle_promo' ? 'bill' : 'item'),
          value: it.value || 0,
          isRate: it.isRate !== undefined ? it.isRate : true,
          threshold: it.threshold,
          targetId: it.targetId,
          icon: it.icon,
          background: it.background,
          border: it.border,
          color: it.color,
          description: it.description,
          excludePromoKeys: it.excludePromoKeys || [],
          itConfigured: it.itConfigured
        });
      }
      if (it.children && Array.isArray(it.children)) {
        promos = [...promos, ...extractPromotions(it.children)];
      }
    });
    return promos;
  };

  // Recursively gather all folders in tree with nesting depth
  const getAllFolders = (nodes: any[], depth = 0): { key: string; title: string; depth: number }[] => {
    let folders: { key: string; title: string; depth: number }[] = [];
    if (!Array.isArray(nodes)) return folders;
    nodes.forEach(n => {
      if (n && n.type === 'folder') {
        folders.push({ key: n.key, title: n.title, depth });
        if (n.children) {
          folders = [...folders, ...getAllFolders(n.children, depth + 1)];
        }
      }
    });
    return folders;
  };

  // -----------------------------------------------------
  // STATE MANAGEMENT FOR STEP-BY-STEP (1 -> 2 -> 3) WIZARD
  // -----------------------------------------------------
  const [userRole, setUserRole] = useState<'all' | 'mtk' | 'it'>('all');
  const [mainActiveTab, setMainActiveTab] = useState('promo_list');
  const [currentStep, setCurrentStep] = useState(0);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

  // New Table & Interactive Flow States
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [promoSearchText, setPromoSearchText] = useState('');
  const [promoSearchScope, setPromoSearchScope] = useState<string>('all');
  const [promoSearchStatus, setPromoSearchStatus] = useState<string>('all');
  const [showPromoDetailsModal, setShowPromoDetailsModal] = useState(false);
  const [selectedDetailPromo, setSelectedDetailPromo] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<string>('');
  const [isFlowAnimating, setIsFlowAnimating] = useState(false);
  const [activeFlowStep, setActiveFlowStep] = useState<number>(-1);
  const [flowShowAlert, setFlowShowAlert] = useState(false);
  const [isFlowCollapsed, setIsFlowCollapsed] = useState(false);

  const availablePromos = useMemo(() => {
    return extractPromotions(consoleMenus);
  }, [consoleMenus]);

  const filteredPromos = useMemo(() => {
    let promos = extractPromotions(consoleMenus);
    if (promoSearchText.trim()) {
      const lower = promoSearchText.toLowerCase();
      promos = promos.filter(p => 
        (p.name || '').toLowerCase().includes(lower) || 
        (p.id || '').toLowerCase().includes(lower) ||
        (p.description || '').toLowerCase().includes(lower)
      );
    }
    if (promoSearchScope !== 'all') {
      promos = promos.filter(p => p.scope === promoSearchScope);
    }
    if (promoSearchStatus !== 'all') {
      if (promoSearchStatus === 'configured') {
        promos = promos.filter(p => p.itConfigured !== false);
      } else if (promoSearchStatus === 'waiting') {
        promos = promos.filter(p => p.itConfigured === false);
      }
    }
    return promos;
  }, [consoleMenus, promoSearchText, promoSearchScope, promoSearchStatus]);

  // Form Fields State
  const [isNewFolderMode, setIsNewFolderMode] = useState<boolean>(false);
  
  // Step 1 variables: Location folder OR Create brand new folder
  const [promoFormFolder, setPromoFormFolder] = useState<string>('system_bill');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderId, setNewFolderId] = useState('');
  const [newFolderParent, setNewFolderParent] = useState('promotions');
  const [newFolderIcon, setNewFolderIcon] = useState('Gift');

  // Step 2 variables: Rule logic
  const [promoFormTitle, setPromoFormTitle] = useState('');
  const [promoFormId, setPromoFormId] = useState('');
  const [collapsedCards, setCollapsedCards] = useState<{ [key: string]: boolean }>({
    step2_1: false,
    step2_2: false,
    step2_3: false,
    step2_4: false
  });
  const [shakeStep2_1, setShakeStep2_1] = useState<boolean>(false);
  const [shakeStep2_2, setShakeStep2_2] = useState<boolean>(false);
  const [shakeStep2_3, setShakeStep2_3] = useState<boolean>(false);
  const [shakeStep2_4, setShakeStep2_4] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  const [promoFormScope, setPromoFormScope] = useState<'bill' | 'item'>('bill');
  const [promoFormValueType, setPromoFormValueType] = useState<'rate' | 'cash'>('rate');
  const [promoFormValue, setPromoFormValue] = useState<number>(0.10);
  const [promoFormThreshold, setPromoFormThreshold] = useState<number | undefined>(undefined);
  const [promoFormTargetId, setPromoFormTargetId] = useState<string>('');
  const [promoFormExclusions, setPromoFormExclusions] = useState<string[]>([]);
  const [promoFormDesc, setPromoFormDesc] = useState('');
  
  // Detailed time configurations & goals
  const [promoFormTimeType, setPromoFormTimeType] = useState<string>('always'); // 'always' | 'detailed'
  const [promoFormTimeDepth, setPromoFormTimeDepth] = useState<string>('always'); // 'always' | 'year' | 'quarter' | 'month' | 'date_range'
  const [timeCascadeLevel, setTimeCascadeLevel] = useState<'year' | 'quarter' | 'month' | 'day' | 'hour'>('year');
  const [promoFormSelectedYears, setPromoFormSelectedYears] = useState<number[]>([2026]);
  const [promoFormIsRecurring, setPromoFormIsRecurring] = useState<boolean>(false);
  const [promoFormRecurringType, setPromoFormRecurringType] = useState<string>('yearly'); // 'yearly' | 'quarterly' | 'monthly' | 'daily'
  const [promoFormStartDate, setPromoFormStartDate] = useState<string>('');
  const [promoFormEndDate, setPromoFormEndDate] = useState<string>('');
  const [promoFormStartHour, setPromoFormStartHour] = useState<string>('');
  const [promoFormEndHour, setPromoFormEndHour] = useState<string>('');
  const [promoFormSelectedMonths, setPromoFormSelectedMonths] = useState<number[]>([]);
  const [promoFormSelectedQuarters, setPromoFormSelectedQuarters] = useState<string[]>([]);
  const [promoFormSelectedDays, setPromoFormSelectedDays] = useState<number[]>([]);
  const [promoFormSelectedWeekdays, setPromoFormSelectedWeekdays] = useState<string[]>([]);
  const [promoFormGoal, setPromoFormGoal] = useState<string>('');
  const [promoFormRelatedDeps, setPromoFormRelatedDeps] = useState<string[]>(['Marketing', 'IT Kỹ Thuật']);
  const [promoFormStores, setPromoFormStores] = useState<string[]>(['STORE-ALL']);

  // Extension feature
  const [showExtendModal, setShowExtendModal] = useState<boolean>(false);
  const [promoToExtend, setPromoToExtend] = useState<any>(null);
  const [extendNewEndDate, setExtendNewEndDate] = useState<string>('');

  // Utility to check if a promotion is expired or disabled
  const isPromoExpired = (promo: any) => {
    if (!promo) return false;
    if (promo.isActive === false) return true; // Bị tắt thủ công

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1; // 1-12
    const currentQuarter = `Q${Math.floor(now.getMonth() / 3) + 1}`;
    const currentDayOfMonth = now.getDate(); // 1-31
    const currentHourStr = now.toTimeString().substring(0, 5); // "HH:MM"

    // Weekday checking (e.g., 'Mon', 'Tue'...)
    const weekdayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentWeekdayStr = weekdayMap[now.getDay()];

    const depth = promo.timeDepth || (promo.timeType === 'always' ? 'always' : 'date_range');
    const isAlways = depth === 'always';

    // 1. If always active (Vô thời hạn)
    if (isAlways) {
      if (promo.startHour || promo.endHour) {
        if (promo.startHour && currentHourStr < promo.startHour) return true;
        if (promo.endHour && currentHourStr > promo.endHour) return true;
      }
      return false;
    }

    // 2. Cascade Year Limit (Check if list has items and doesn't include currentYear)
    // Only enforced if isRecurring is false OR recurringType does not bypass year
    const isRecur = promo.isRecurring === true;
    const recurType = promo.recurringType || 'yearly';
    
    const enforceYear = !isRecur || recurType === 'daily'; // daily recurrence might still require year limit if specified
    if (enforceYear && promo.selectedYears && promo.selectedYears.length > 0) {
      if (!promo.selectedYears.includes(currentYear)) return true;
    }

    // 3. Cascade Quarter Limit (Only check if configured)
    const enforceQuarter = !isRecur || ['yearly', 'daily'].includes(recurType);
    if (enforceQuarter && promo.selectedQuarters && promo.selectedQuarters.length > 0) {
      if (!promo.selectedQuarters.includes(currentQuarter)) return true;
    }

    // 4. Cascade Month Limit (Only check if configured)
    const enforceMonth = !isRecur || ['yearly', 'quarterly', 'daily'].includes(recurType);
    if (enforceMonth && promo.selectedMonths && promo.selectedMonths.length > 0) {
      if (!promo.selectedMonths.includes(currentMonthNum)) return true;
    }

    // 5. Cascade Day Limit (Only check if configured)
    const hasDaysConfigured = promo.selectedDays && promo.selectedDays.length > 0;
    const hasWeekdaysConfigured = promo.selectedWeekdays && promo.selectedWeekdays.length > 0;

    if (hasDaysConfigured || hasWeekdaysConfigured) {
      let dayMatches = false;
      let weekdayMatches = false;

      if (hasDaysConfigured) {
        if (promo.selectedDays.includes(currentDayOfMonth)) dayMatches = true;
      }
      if (hasWeekdaysConfigured) {
        if (promo.selectedWeekdays.includes(currentWeekdayStr)) weekdayMatches = true;
      }

      // If both are configured, require at least one to match (OR match)
      if (hasDaysConfigured && hasWeekdaysConfigured) {
        if (!dayMatches && !weekdayMatches) return true;
      } else if (hasDaysConfigured) {
        if (!dayMatches) return true;
      } else if (hasWeekdaysConfigured) {
        if (!weekdayMatches) return true;
      }
    }

    // 6. Cascade Hour Limit (Golden Hour)
    if (promo.startHour || promo.endHour) {
      if (promo.startHour && currentHourStr < promo.startHour) return true;
      if (promo.endHour && currentHourStr > promo.endHour) return true;
    }

    return false;
  };

  // Step 3 variables: Styling
  const [promoFormPresetId, setPromoFormPresetId] = useState<string>('preset_green');

  // Helpers for multi-select Select All & Clear All features
  const handleSelectAllProducts = () => {
    const allIds = [
      ...DEFAULT_PRODUCTS.map(p => p.id),
      'Giày dép', 'Balo & Túi xách', 'Ví & Phụ kiện'
    ];
    setPromoFormTargetId(allIds.join(','));
  };

  const handleClearAllProducts = () => {
    setPromoFormTargetId('');
  };

  const handleSelectAllExclusions = () => {
    const allIds = availablePromos.filter(p => p.id !== promoFormId).map(p => p.id);
    setPromoFormExclusions(allIds);
  };

  const handleClearAllExclusions = () => {
    setPromoFormExclusions([]);
  };

  // Load selected promo into form for editing
  const handleEditPromo = (promo: any) => {
    setEditingPromoId(promo.id);
    setPromoFormId(promo.id);
    setPromoFormTitle(promo.name || promo.title);
    setPromoFormScope(promo.scope);
    setPromoFormValueType(promo.isRate ? 'rate' : 'cash');
    setPromoFormValue(promo.value);
    setPromoFormThreshold(promo.threshold);
    setPromoFormTargetId(promo.targetId || '');
    setPromoFormExclusions(promo.excludePromoKeys || []);
    setPromoFormDesc(promo.description || '');
    
    // Load detailed time configuration
    setPromoFormTimeType(promo.timeType || 'always');
    setPromoFormTimeDepth(promo.timeDepth === 'always' ? 'always' : (promo.timeDepth ? 'cascade' : (promo.timeType === 'always' ? 'always' : 'cascade')));
    
    // Compute cascade level
    if (promo.startHour || promo.endHour) {
      setTimeCascadeLevel('hour');
    } else if ((promo.selectedDays && promo.selectedDays.length > 0) || (promo.selectedWeekdays && promo.selectedWeekdays.length > 0)) {
      setTimeCascadeLevel('day');
    } else if (promo.selectedMonths && promo.selectedMonths.length > 0) {
      setTimeCascadeLevel('month');
    } else if (promo.selectedQuarters && promo.selectedQuarters.length > 0) {
      setTimeCascadeLevel('quarter');
    } else {
      setTimeCascadeLevel('year');
    }

    setPromoFormSelectedYears(promo.selectedYears || [2026]);
    setPromoFormIsRecurring(promo.isRecurring || false);
    setPromoFormRecurringType(promo.recurringType || 'yearly');
    setPromoFormStartDate(promo.startDate || '');
    setPromoFormEndDate(promo.endDate || '');
    setPromoFormStartHour(promo.startHour || '');
    setPromoFormEndHour(promo.endHour || '');
    setPromoFormSelectedMonths(promo.selectedMonths || []);
    setPromoFormSelectedQuarters(promo.selectedQuarters || []);
    setPromoFormSelectedDays(promo.selectedDays || []);
    setPromoFormSelectedWeekdays(promo.selectedWeekdays || []);
    setPromoFormGoal(promo.goal || '');
    setPromoFormRelatedDeps(promo.relatedDeps || ['Marketing', 'IT Kỹ Thuật']);
    setPromoFormStores(promo.applicableStores || ['STORE-ALL']);
    
    // Find matching folder
    const containingFolder = findFolderForPromo(consoleMenus, promo.id);
    if (containingFolder) {
      setPromoFormFolder(containingFolder);
      setIsNewFolderMode(false);
    }

    // Try finding matching styling preset or make default
    const matchedPreset = visualPresets.find(p => p.background === promo.background && p.color === promo.color);
    if (matchedPreset) {
      setPromoFormPresetId(matchedPreset.id);
    } else {
      setPromoFormPresetId('custom_designed');
    }
    
    if (userRole === 'mtk') {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
    setMainActiveTab('wizard');
    message.success(`Đã tải thông tin "${promo.title || promo.name || ''}" - Đã chuyển sang tab Quy trình thiết lập.`);
  };

  const handleDuplicatePromo = (promo: any) => {
    const flatPromos = extractPromotions(consoleMenus);
    
    // Find unique ID
    let newId = `${promo.id || promo.key || 'km_copy'}_Copy`;
    let count = 1;
    while (flatPromos.some(p => p.id === newId)) {
      newId = `${promo.id || promo.key || 'km_copy'}_Copy${count}`;
      count++;
    }

    // Find unique Name
    let newName = `${promo.name || promo.title || 'Ưu đãi Copy'}_Copy`;
    let nameCount = 1;
    while (flatPromos.some(p => (p.name || p.title) === newName)) {
      newName = `${promo.name || promo.title || 'Ưu đãi Copy'}_Copy${nameCount}`;
      nameCount++;
    }

    // Clone the promotion payload
    const clonedPromo = {
      ...promo,
      id: newId,
      key: newId,
      name: newName,
      title: newName,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      isActive: true, // default to active/ready
    };

    // Find the original folder and insert there
    const folderKey = findFolderForPromo(consoleMenus, promo.id) || 'system_bill';
    const updatedTree = addPromoToTree([...consoleMenus], folderKey, clonedPromo);

    setConsoleMenus(updatedTree);
    localStorage.setItem('pos_console_menus', JSON.stringify(updatedTree));
    
    // Save flat representation
    const flatPromosUpdated = extractPromotions(updatedTree);
    localStorage.setItem('pos_promotions', JSON.stringify(flatPromosUpdated));

    message.success(`Đã sao chép chương trình thành công thành "${newName}"!`);
  };

  const findFolderForPromo = (items: any[], promoId: string): string | null => {
    for (const item of items) {
      if (item.children && Array.isArray(item.children)) {
        const hasDirectPromo = item.children.some((child: any) => child.key === promoId);
        if (hasDirectPromo) {
          return item.key;
        }
        const deepMatch = findFolderForPromo(item.children, promoId);
        if (deepMatch) return deepMatch;
      }
    }
    return null;
  };

  // Recursive helpers to manipulate tree
  const addFolderToTree = (nodes: any[], parentKey: string, newFolder: any): any[] => {
    if (!Array.isArray(nodes)) return [];
    
    // If placing at root of promotions (which is usually nested in 'promotions')
    if (parentKey === 'root') {
      return [...nodes, newFolder];
    }

    return nodes.map(n => {
      if (n.key === parentKey) {
        return {
          ...n,
          children: [...(n.children || []), newFolder]
        };
      }
      if (n.children && Array.isArray(n.children)) {
        return {
          ...n,
          children: addFolderToTree(n.children, parentKey, newFolder)
        };
      }
      return n;
    });
  };

  const addPromoToTree = (nodes: any[], folderKey: string, newPromo: any): any[] => {
    if (!Array.isArray(nodes)) return [];
    return nodes.map(n => {
      if (n.key === folderKey) {
        return {
          ...n,
          children: [...(n.children || []), newPromo]
        };
      }
      if (n.children && Array.isArray(n.children)) {
        return {
          ...n,
          children: addPromoToTree(n.children, folderKey, newPromo)
        };
      }
      return n;
    });
  };

  const updatePromoInTree = (nodes: any[], promoKey: string, updatedFields: any): any[] => {
    if (!Array.isArray(nodes)) return [];
    return nodes.map(n => {
      if (n.key === promoKey) {
        return {
          ...n,
          ...updatedFields
        };
      }
      if (n.children && Array.isArray(n.children)) {
        return {
          ...n,
          children: updatePromoInTree(n.children, promoKey, updatedFields)
        };
      }
      return n;
    });
  };

  const deletePromoFromTree = (nodes: any[], promoKey: string): any[] => {
    if (!Array.isArray(nodes)) return [];
    return nodes.reduce((acc, n) => {
      if (n.key === promoKey) {
        return acc; // filter out
      }
      if (n.children && Array.isArray(n.children)) {
        acc.push({
          ...n,
          children: deletePromoFromTree(n.children, promoKey)
        });
      } else {
        acc.push(n);
      }
      return acc;
    }, [] as any[]);
  };

  const handleDeletePromo = (promoId: string) => {
    const updatedTree = deletePromoFromTree(consoleMenus, promoId);
    setConsoleMenus(updatedTree);
    localStorage.setItem('pos_console_menus', JSON.stringify(updatedTree));
    
    const remainingPromos = extractPromotions(updatedTree);
    localStorage.setItem('pos_promotions', JSON.stringify(remainingPromos));
    
    message.success('Đã xóa thành công chương trình ưu đãi!');
  };

  const handleBatchDelete = (keys: React.Key[]) => {
    modal.confirm({
      title: `Xóa ${keys.length} chương trình khuyến mãi đã chọn?`,
      content: 'Thao tác này sẽ gỡ hoàn toàn các chương trình này khỏi cây danh mục POS bán hàng.',
      okText: 'Xác nhận Xóa',
      cancelText: 'Hủy bỏ',
      okType: 'danger',
      onOk: () => {
        let updatedTree = [...consoleMenus];
        keys.forEach(k => {
          updatedTree = deletePromoFromTree(updatedTree, k as string);
        });
        setConsoleMenus(updatedTree);
        setSelectedRowKeys([]);
        message.success(`Đã xóa thành công ${keys.length} chương trình khuyến mãi!`);
      }
    });
  };

  const handleBatchExport = (keys: React.Key[], format: 'csv' | 'excel' | 'pdf') => {
    const targetKeys = keys.length > 0 ? keys : filteredPromos.map(p => p.id);
    setIsExporting(true);
    setExportType(format.toUpperCase());
    setExportProgress(10);
    
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            const listToExport = filteredPromos.filter(p => targetKeys.includes(p.id));
            if (format === 'csv' || format === 'excel') {
              let csvContent = 'ID,Name,Scope,Value,IsRate,Threshold,IT Configured,Background,Color\n';
              listToExport.forEach(p => {
                csvContent += `"${p.id}","${p.name || ''}","${p.scope || ''}",${p.value},${p.isRate},${p.threshold || ''},${p.itConfigured !== false},"${p.background || ''}","${p.color || ''}"\n`;
              });
              const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `DS_Khuyen_Mai_${Date.now()}.${format === 'csv' ? 'csv' : 'csv'}`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              message.success(`Đã xuất và tải thành công danh sách gồm ${listToExport.length} ưu đãi!`);
            } else {
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(`
                  <html>
                    <head>
                      <title>Bao_Cao_Chinh_Sach_Khuyen_Mai</title>
                      <style>
                        body { font-family: 'Times New Roman', serif; padding: 40px; }
                        h1 { text-align: center; font-size: 20px; text-transform: uppercase; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #000; padding: 10px; text-align: left; font-size: 13px; }
                        th { background: #f2f2f2; }
                      </style>
                    </head>
                    <body>
                      <h1>Báo Cáo Tổng Hợp Danh Sách Chính Sách Khuyến Mãi</h1>
                      <p>Ngày kết xuất: 28/06/2026 | Người kết xuất: Hệ thống POS Portal</p>
                      <table>
                        <thead>
                          <tr>
                            <th>Mã KM</th>
                            <th>Tên chương trình</th>
                            <th>Phạm vi</th>
                            <th>Giá trị</th>
                            <th>Ngưỡng tối thiểu</th>
                            <th>Trạng thái POS</th>
                          </tr>
                        </thead>
                        <tbody>
                          \${listToExport.map(p => \`
                            <tr>
                              <td><b>\${p.id}</b></td>
                              <td>\${p.name}</td>
                              <td>\${p.scope === 'bill' ? 'Toàn Bill' : 'Dòng Món'}</td>
                              <td>\${p.isRate ? (p.value * 100) + '%' : p.value.toLocaleString() + ' đ'}</td>
                              <td>\${p.threshold ? p.threshold.toLocaleString() + ' đ' : '0 đ'}</td>
                              <td>\${p.itConfigured !== false ? 'Đã gán nút' : 'Chờ IT setup'}</td>
                            </tr>
                          \`).join('')}
                        </tbody>
                      </table>
                      <script>window.onload = function() { window.print(); }</script>
                    </body>
                  </html>
                `);
                printWindow.document.close();
              }
            }
          }, 400);
          return 100;
        }
        return prev + 30;
      });
    }, 250);
  };

  const getFolderTitleByKey = (nodes: any[], folderKey: string | null): string => {
    if (!folderKey) return 'Khuyến mãi Hệ thống';
    const findNode = (items: any[]): any => {
      for (const item of items) {
        if (item.key === folderKey) return item;
        if (item.children) {
          const deep = findNode(item.children);
          if (deep) return deep;
        }
      }
      return null;
    };
    const node = findNode(nodes);
    return node ? node.title : 'Khuyến mãi Hệ thống';
  };

  const handlePrintMemo = (promo: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('Không thể mở cửa sổ in. Vui lòng tắt blocker pop-up.');
      return;
    }
    const isConfigured = promo.itConfigured !== false;
    const folderKey = findFolderForPromo(consoleMenus, promo.id);
    const folderLabel = getFolderTitleByKey(consoleMenus, folderKey);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Quyet_Dinh_Khuyen_Mai_${promo.id}</title>
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              padding: 40px;
              line-height: 1.6;
              color: #000;
              background: #fff;
              font-size: 14px;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .header-table td {
              vertical-align: top;
              font-size: 13px;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              margin-top: 30px;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 13px;
              font-style: italic;
              text-align: center;
              margin-bottom: 30px;
            }
            .section-title {
              font-weight: bold;
              text-decoration: underline;
              margin-top: 20px;
              margin-bottom: 8px;
              font-size: 15px;
            }
            .content-block {
              margin-left: 20px;
              margin-bottom: 15px;
            }
            .signature-table {
              width: 100%;
              margin-top: 50px;
              border-collapse: collapse;
            }
            .signature-table td {
              text-align: center;
              width: 50%;
              font-size: 14px;
            }
            .pos-button-preview {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 8px 16px;
              border-radius: 8px;
              font-weight: bold;
              border: ${isConfigured ? (promo.border || '1px solid #ddd') : '1px dashed #d9d9d9'};
              background: ${isConfigured ? (promo.background || '#fafafa') : '#fafafa'};
              color: ${isConfigured ? (promo.color || '#333') : '#8c8c8c'};
              font-size: 12px;
              margin-top: 8px;
              font-family: Arial, sans-serif;
            }
            @media print {
              @page {
                size: A4;
                margin: 20mm;
              }
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 45%;">
                <div class="text-center">
                  <strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ POS PORTAL</strong><br/>
                  <strong>BỘ PHẬN PHÁT TRIỂN KINH DOANH</strong><br/>
                  <span style="font-size: 11px;">Số: QD/KM-${promo.id.toUpperCase()}-2026</span>
                  <div style="margin: 4px auto; width: 60px; border-bottom: 1px solid #000;"></div>
                </div>
              </td>
              <td style="width: 55%;">
                <div class="text-center">
                  <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
                  <strong>Độc lập - Tự do - Hạnh phúc</strong>
                  <div style="margin: 4px auto; width: 120px; border-bottom: 1px solid #000;"></div>
                  <span style="font-size: 11px; font-style: italic;">Hà Nội, ngày 28 tháng 06 năm 2026</span>
                </div>
              </td>
            </tr>
          </table>

          <div class="title">QUYẾT ĐỊNH</div>
          <div class="subtitle">V/v: Phê duyệt chính sách ưu đãi và ban hành phím bấm kỹ thuật POS liên thông</div>

          <div class="text-center" style="margin-bottom: 20px; font-weight: bold;">GIÁM ĐỐC CÔNG TY CỔ PHẦN CÔNG NGHỆ POS PORTAL</div>

          <p style="text-align: justify; font-style: italic;">- Căn cứ vào kế hoạch kinh doanh và chương trình kích cầu tiêu dùng năm 2026;<br/>
          - Căn cứ đề xuất thiết lập của Bộ phận Marketing / Kỹ thuật (KT) về các mốc khuyến mãi chiết khấu hóa đơn;<br/>
          - Căn cứ vào khả năng kỹ thuật của hệ thống POS lồng ghép danh mục Real-time.</p>

          <div class="title" style="font-size: 15px; margin-top: 15px; margin-bottom: 15px;">QUYẾT ĐỊNH:</div>

          <div class="section-title">Điều 1. Phê duyệt chiến dịch Khuyến mãi nội bộ</div>
          <div class="content-block">
            <strong>1.1. Tên chiến dịch:</strong> ${promo.name || promo.title}<br/>
            <strong>1.2. Mã chương trình (ID):</strong> ${promo.id}<br/>
            <strong>1.3. Mô tả chiến dịch:</strong> ${promo.description || 'Chương trình ưu đãi nội bộ hệ thống bán hàng.'}<br/>
            <strong>1.4. Trạng thái khởi tạo:</strong> Đã duyệt trực tuyến hệ thống.
          </div>

          <div class="section-title">Điều 2. Các quy định về Luật áp dụng và Định mức</div>
          <div class="content-block">
            <strong>2.1. Phạm vi chiết khấu:</strong> ${promo.scope === 'bill' ? 'TOÀN BỘ HÓA ĐƠN (BILL)' : 'DÒNG MÓN ĂN / SẢN PHẨM RIÊNG BIỆT'}<br/>
            <strong>2.2. Trị giá ưu đãi:</strong> ${promo.isRate ? `Chiết khấu ${promo.value * 100}%` : `Giảm trừ trực tiếp -${promo.value.toLocaleString()} VND`}<br/>
            <strong>2.3. Ngưỡng hóa đơn tối thiểu (Threshold):</strong> ${promo.threshold ? `${promo.threshold.toLocaleString()} VND` : 'Không yêu cầu (Áp dụng từ 0 đồng)'}<br/>
            <strong>2.4. Đối tượng/Sản phẩm chỉ định:</strong> ${promo.targetId || 'Áp dụng chung tất cả mã hàng của hệ thống'}<br/>
            <strong>2.5. Luật loại trừ chéo (Exclusions):</strong> ${promo.excludePromoKeys && promo.excludePromoKeys.length > 0 ? promo.excludePromoKeys.join(', ') : 'Không áp dụng loại trừ chéo (Cộng dồn tự do)'}
          </div>

          <div class="section-title">Điều 3. Quy chuẩn kỹ thuật bố trí phím bấm POS (Phòng IT thi hành)</div>
          <div class="content-block">
            <strong>3.1. Thư mục hiển thị phím:</strong> Thư mục Folder ${folderLabel}<br/>
            <strong>3.2. Cấu hình diện mạo phím bấm:</strong><br/>
            <div class="pos-button-preview">
              🎨 ${promo.name || 'Phím bấm POS'}
            </div><br/>
            - Màu phím: <code>${promo.background || '#ffffff'}</code><br/>
            - Viền: <code>${promo.border || '1px solid #ddd'}</code><br/>
            - Màu chữ: <code>${promo.color || '#333333'}</code><br/>
            - Biểu tượng Icon: <code>${promo.icon || 'Gift'}</code>
          </div>

          <div class="section-title">Điều 4. Điều khoản thi hành</div>
          <div class="content-block" style="text-align: justify;">
            Quyết định này có hiệu lực kể từ ngày ký. Bộ phận Marketing (KT), Phòng Kỹ thuật Hệ thống (IT), Bộ phận Kế toán vận hành và Trưởng các quầy POS retail chịu trách nhiệm thi hành quyết định này. Hệ thống tự động đồng bộ Real-time xuống các máy POS ngay sau khi văn bản này được ký duyệt trên hệ thống quản trị.
          </div>

          <table class="signature-table">
            <tr>
              <td>
                <strong>ĐẠI DIỆN BỘ PHẬN IT</strong><br/>
                <span style="font-size: 11px; font-style: italic;">(Ký duyệt kỹ thuật hệ thống)</span>
                <div style="margin-top: 60px; font-weight: bold;">Lê Hoàng Nam</div>
                <div style="font-size: 11px; color: #555;">it_system_admin</div>
              </td>
              <td>
                <strong>ĐẠI DIỆN BAN GIÁM ĐỐC</strong><br/>
                <span style="font-size: 11px; font-style: italic;">(Đã ký thông qua Token điện tử)</span>
                <div style="margin-top: 60px; font-weight: bold; color: red;">ĐÃ PHÊ DUYỆT</div>
                <div style="font-size: 11px; color: #555;">Trần Quốc Bảo - CEO</div>
              </td>
            </tr>
          </table>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleTriggerFlowAnimation = () => {
    if (isFlowAnimating) return;
    setIsFlowAnimating(true);
    setFlowShowAlert(false);
    setActiveFlowStep(0);

    const stepsTimeouts = [
      setTimeout(() => setActiveFlowStep(1), 1200),
      setTimeout(() => setActiveFlowStep(2), 2400),
      setTimeout(() => setActiveFlowStep(3), 3600),
      setTimeout(() => setActiveFlowStep(4), 4800),
      setTimeout(() => {
        setActiveFlowStep(5);
        setIsFlowAnimating(false);
        setFlowShowAlert(true);
        message.success('⚡ ĐÃ ĐỒNG BỘ LIÊN THÔNG TOÀN BỘ QUY TRÌNH XUỐNG POS THÀNH CÔNG!');
      }, 6000)
    ];

    return () => {
      stepsTimeouts.forEach(clearTimeout);
    };
  };

  const validateStep2 = () => {
    const errors: { [key: string]: boolean } = {};
    let firstErrorCard: string | null = null;

    const triggerShake = (cardKey: 'step2_1' | 'step2_2' | 'step2_3' | 'step2_4') => {
      if (cardKey === 'step2_1') setShakeStep2_1(true);
      if (cardKey === 'step2_2') setShakeStep2_2(true);
      if (cardKey === 'step2_3') setShakeStep2_3(true);
      if (cardKey === 'step2_4') setShakeStep2_4(true);
      
      setTimeout(() => {
        if (cardKey === 'step2_1') setShakeStep2_1(false);
        if (cardKey === 'step2_2') setShakeStep2_2(false);
        if (cardKey === 'step2_3') setShakeStep2_3(false);
        if (cardKey === 'step2_4') setShakeStep2_4(false);
      }, 800);
    };

    // 1. Check Card 2.1
    if (!promoFormTitle.trim()) {
      errors.promoFormTitle = true;
      if (!firstErrorCard) firstErrorCard = 'step2_1';
    }
    if (!promoFormId.trim()) {
      errors.promoFormId = true;
      if (!firstErrorCard) firstErrorCard = 'step2_1';
    }

    // 2. Check Card 2.2
    if (!promoFormValue || promoFormValue <= 0) {
      errors.promoFormValue = true;
      if (!firstErrorCard) firstErrorCard = 'step2_2';
    }
    if (promoFormScope === 'item' && !promoFormTargetId.trim()) {
      errors.promoFormTargetId = true;
      if (!firstErrorCard) firstErrorCard = 'step2_2';
    }
    if (promoFormScope === 'bill' && promoFormValueType === 'rate' && promoFormValue > 1) {
      errors.promoFormValueOverLimit = true;
      if (!firstErrorCard) firstErrorCard = 'step2_2';
    }

    // 3. Check Card 2.3
    if (promoFormTimeDepth !== 'always' && (!promoFormSelectedYears || promoFormSelectedYears.length === 0)) {
      errors.promoFormSelectedYears = true;
      if (!firstErrorCard) firstErrorCard = 'step2_3';
    }

    // 4. Check Card 2.4
    if (!promoFormRelatedDeps || promoFormRelatedDeps.length === 0) {
      errors.promoFormRelatedDeps = true;
      if (!firstErrorCard) firstErrorCard = 'step2_4';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      if (firstErrorCard) {
        const cardToExpand = firstErrorCard;
        setCollapsedCards(prev => ({
          ...prev,
          [cardToExpand]: false
        }));
        triggerShake(cardToExpand as any);

        if (errors.promoFormTitle) {
          message.error('Vui lòng nhập Tên ưu đãi hiển thị tại POS (Bước 2.1)!');
        } else if (errors.promoFormId) {
          message.error('Vui lòng nhập Mã hiệu duy nhất (Bước 2.1)!');
        } else if (errors.promoFormValue) {
          message.error('Vui lòng nhập Giá trị chiết khấu / số tiền giảm lớn hơn 0 (Bước 2.2)!');
        } else if (errors.promoFormTargetId) {
          message.error('Vui lòng nhập Mã SP hoặc Mã ngành hàng được áp dụng (Bước 2.2)!');
        } else if (errors.promoFormValueOverLimit) {
          message.error('Tỷ lệ giảm giá không được vượt quá 100% (1.0) (Bước 2.2)!');
        } else if (errors.promoFormSelectedYears) {
          message.error('Vui lòng chọn ít nhất một Năm áp dụng (Cấp độ 1 ở Bước 2.3)!');
        } else if (errors.promoFormRelatedDeps) {
          message.error('Vui lòng chọn ít nhất một Phòng ban triển khai (Bước 2.4)!');
        }
      }
      return false;
    }

    setValidationErrors({});
    return true;
  };

  // Handle final submission after Step 3
  const handleWizardSubmit = () => {
    if (!validateStep2()) {
      setCurrentStep(1);
      return;
    }

    const key = promoFormId.trim() || 'km_' + Math.random().toString(36).substr(2, 5);
    const chosenPreset = visualPresets.find(p => p.id === promoFormPresetId) || visualPresets[0];

    // Preserve active state if we are editing
    const currentFlat = extractPromotions(consoleMenus);
    const existingPromo = currentFlat.find(p => p.id === (editingPromoId || key));
    const isPromoActive = existingPromo ? (existingPromo.isActive ?? true) : true;

    const promoPayload: any = {
      key: key,
      title: promoFormTitle,
      type: promoFormScope === 'bill' ? 'toggle_promo' : 'assigned_item_promo',
      scope: promoFormScope,
      promoType: promoFormScope === 'bill' ? 'bill' : 'item',
      value: promoFormValue,
      isRate: promoFormValueType === 'rate',
      background: chosenPreset.background,
      border: chosenPreset.border,
      color: chosenPreset.color,
      icon: chosenPreset.icon,
      description: promoFormDesc,
      excludePromoKeys: promoFormExclusions,
      itConfigured: userRole === 'mtk' ? false : true,
      timeType: promoFormTimeType,
      timeDepth: promoFormTimeDepth,
      selectedYears: promoFormSelectedYears,
      isRecurring: promoFormIsRecurring,
      recurringType: promoFormRecurringType,
      startDate: promoFormStartDate,
      endDate: promoFormEndDate,
      startHour: promoFormStartHour,
      endHour: promoFormEndHour,
      selectedMonths: promoFormSelectedMonths,
      selectedQuarters: promoFormSelectedQuarters,
      selectedDays: promoFormSelectedDays,
      selectedWeekdays: promoFormSelectedWeekdays,
      goal: promoFormGoal,
      relatedDeps: promoFormRelatedDeps,
      applicableStores: promoFormStores,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      isActive: isPromoActive
    };

    if (promoFormScope === 'bill' && promoFormThreshold) {
      promoPayload.threshold = promoFormThreshold;
    }
    if (promoFormScope === 'item' && promoFormTargetId) {
      promoPayload.targetId = promoFormTargetId;
    }

    let updatedTree = [...consoleMenus];

    // Determine target folder
    let targetFolderKey = promoFormFolder;

    if (isNewFolderMode) {
      // Create new folder dynamically
      const folderKey = newFolderId.trim() || 'fld_' + Math.random().toString(36).substr(2, 5);
      const newFolderNode = {
        key: folderKey,
        title: newFolderName || 'Thư mục ưu đãi mới',
        icon: newFolderIcon,
        background: '#fff7e6',
        border: '1px solid #ffd591',
        color: '#d46b08',
        description: 'Thư mục ưu đãi tùy biến tạo linh động',
        type: 'folder',
        children: []
      };

      updatedTree = addFolderToTree(updatedTree, newFolderParent, newFolderNode);
      targetFolderKey = folderKey;
      message.success(`Thư mục mới "${newFolderName}" đã được tạo linh động thành công!`);
    }

    if (editingPromoId) {
      // 1. Remove old promo if folder changed to avoid duplication, then add
      const currentFolder = findFolderForPromo(consoleMenus, editingPromoId);
      if (currentFolder && currentFolder !== targetFolderKey) {
        updatedTree = deletePromoFromTree(updatedTree, editingPromoId);
        updatedTree = addPromoToTree(updatedTree, targetFolderKey, promoPayload);
      } else {
        // Just update in place
        updatedTree = updatePromoInTree(updatedTree, editingPromoId, promoPayload);
      }
      message.success('Đồng bộ cập nhật chương trình khuyến mãi thành công!');
    } else {
      // Adding new
      // Check if key already exists in flat promos
      if (availablePromos.some(p => p.id === key)) {
        message.error(`Mã khuyến mãi "${key}" đã trùng lặp. Vui lòng đổi Mã hiệu đại diện.`);
        setCurrentStep(1);
        return;
      }
      updatedTree = addPromoToTree(updatedTree, targetFolderKey, promoPayload);
      message.success('Đã thêm thành công chương trình khuyến mãi mới!');
    }

    setConsoleMenus(updatedTree);
    localStorage.setItem('pos_console_menus', JSON.stringify(updatedTree));
    
    // Save flat representation
    const flatPromos = extractPromotions(updatedTree);
    localStorage.setItem('pos_promotions', JSON.stringify(flatPromos));

    // Reset forms & go back to list
    handleResetWizard();
    setMainActiveTab('promo_list');
  };

  const handleExtendTime = () => {
    if (!promoToExtend) return;
    if (!extendNewEndDate) {
      message.error('Vui lòng chọn ngày kết thúc mới!');
      return;
    }

    let updatedTree = [...consoleMenus];
    
    // Create updated payload with extended end date
    const updatedPayload = {
      ...promoToExtend,
      timeType: 'detailed',
      endDate: extendNewEndDate
    };

    updatedTree = updatePromoInTree(updatedTree, promoToExtend.id, updatedPayload);
    
    setConsoleMenus(updatedTree);
    localStorage.setItem('pos_console_menus', JSON.stringify(updatedTree));
    
    // Save flat representation
    const flatPromos = extractPromotions(updatedTree);
    localStorage.setItem('pos_promotions', JSON.stringify(flatPromos));

    // If currently viewing detailed promo, update the viewed object
    if (selectedDetailPromo && selectedDetailPromo.id === promoToExtend.id) {
      setSelectedDetailPromo(updatedPayload);
    }

    message.success(`Đã gia hạn thành công chương trình "${promoToExtend.name || promoToExtend.title}" đến ngày ${new Date(extendNewEndDate).toLocaleDateString('vi-VN')}!`);
    setShowExtendModal(false);
    setPromoToExtend(null);
  };

  const handleTogglePromoActive = (promoId: string, checked: boolean) => {
    let updatedTree = [...consoleMenus];
    
    // Find the promo to preserve all fields
    const flatList = extractPromotions(consoleMenus);
    const foundPromo = flatList.find(p => p.id === promoId);
    if (!foundPromo) return;
    
    const updatedPayload = {
      ...foundPromo,
      isActive: checked
    };
    
    updatedTree = updatePromoInTree(updatedTree, promoId, updatedPayload);
    setConsoleMenus(updatedTree);
    localStorage.setItem('pos_console_menus', JSON.stringify(updatedTree));
    
    const flatPromos = extractPromotions(updatedTree);
    localStorage.setItem('pos_promotions', JSON.stringify(flatPromos));
    
    if (selectedDetailPromo && selectedDetailPromo.id === promoId) {
      setSelectedDetailPromo(updatedPayload);
    }
    
    message.success(`Đã ${checked ? 'bật' : 'tắt'} hiển thị nút bấm khuyến mãi "${foundPromo.name || foundPromo.title}" trên POS!`);
  };

  const handleResetWizard = () => {
    setEditingPromoId(null);
    setPromoFormId('');
    setPromoFormTitle('');
    setCollapsedCards({
      step2_1: false,
      step2_2: false,
      step2_3: false,
      step2_4: false
    });
    setShakeStep2_1(false);
    setShakeStep2_2(false);
    setShakeStep2_3(false);
    setShakeStep2_4(false);
    setValidationErrors({});
    setPromoFormScope('bill');
    setPromoFormValueType('rate');
    setPromoFormValue(0.10);
    setPromoFormThreshold(undefined);
    setPromoFormTargetId('');
    setPromoFormExclusions([]);
    setPromoFormDesc('');
    setPromoFormPresetId('preset_green');
    setIsNewFolderMode(false);
    setNewFolderName('');
    setNewFolderId('');
    setPromoFormFolder('system_bill');
    
    // Reset detailed times & goals
    setPromoFormTimeType('always');
    setPromoFormTimeDepth('always');
    setTimeCascadeLevel('year');
    setPromoFormSelectedYears([2026]);
    setPromoFormIsRecurring(false);
    setPromoFormRecurringType('yearly');
    setPromoFormStartDate('');
    setPromoFormEndDate('');
    setPromoFormStartHour('');
    setPromoFormEndHour('');
    setPromoFormSelectedMonths([]);
    setPromoFormSelectedQuarters([]);
    setPromoFormSelectedDays([]);
    setPromoFormSelectedWeekdays([]);
    setPromoFormGoal('');
    setPromoFormRelatedDeps(['Marketing', 'IT Kỹ Thuật']);
    setPromoFormStores(['STORE-ALL']);
    
    if (userRole === 'mtk') {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  };

  // Raw JSON Source Editor Logic
  const [menusJsonText, setMenusJsonText] = useState('');
  useEffect(() => {
    setMenusJsonText(JSON.stringify(consoleMenus, null, 2));
  }, [consoleMenus]);

  const handleSaveRawJson = () => {
    try {
      const parsed = JSON.parse(menusJsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Dữ liệu Cây danh mục phải là một mảng [] cấu trúc lồng.');
      }
      setConsoleMenus(parsed);
      localStorage.setItem('pos_console_menus', JSON.stringify(parsed));
      
      const calculatedPromos = extractPromotions(parsed);
      localStorage.setItem('pos_promotions', JSON.stringify(calculatedPromos));
      
      modal.success({
        title: 'Đồng bộ JSONB thành công!',
        content: 'Toàn bộ danh mục ưu đãi và luật lồng ghép đã được khớp nối hoàn hảo sang bộ nhớ POS!'
      });
    } catch (err: any) {
      modal.error({
        title: 'Lỗi cấu trúc cú pháp JSON!',
        content: `Kiểm tra các dấu ngoặc hoặc định dạng: ${err.message}`
      });
    }
  };

  // Helper to render Lucide Icons dynamically
  const renderIconWithColor = (name: string, size = 16, color = '#333') => {
    const iconStyle = { color, width: size, height: size, strokeWidth: 2.2 };
    if (name && name.trim().length === 1) {
      return (
        <span style={{ 
          color, 
          fontSize: size * 0.9, 
          fontWeight: '900', 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          lineHeight: 1,
          textAlign: 'center'
        }}>
          {name.trim().toUpperCase()}
        </span>
      );
    }
    switch (name) {
      case 'Gift': return <Gift style={iconStyle} />;
      case 'Zap': return <Zap style={iconStyle} />;
      case 'Sparkles': return <Sparkles style={iconStyle} />;
      case 'Award': return <Award style={iconStyle} />;
      case 'CornerDownRight': return <CornerDownRight style={iconStyle} />;
      case 'PartyPopper': return <PartyPopper style={iconStyle} />;
      case 'Laptop': return <Laptop style={iconStyle} />;
      case 'Tv': return <Tv style={iconStyle} />;
      case 'Tags': return <Tags style={iconStyle} />;
      case 'ShoppingCart': return <ShoppingCart style={iconStyle} />;
      case 'Users': return <Users style={iconStyle} />;
      case 'Percent': return <Percent style={iconStyle} />;
      case 'Briefcase': return <Briefcase style={iconStyle} />;
      case 'ShieldCheck': return <ShieldCheck style={iconStyle} />;
      case 'Settings': return <Settings style={iconStyle} />;
      case 'Heart': return <Heart style={iconStyle} />;
      case 'Star': return <Star style={iconStyle} />;
      case 'Bell': return <Bell style={iconStyle} />;
      case 'ShieldAlert': return <ShieldAlert style={iconStyle} />;
      case 'Shield': return <Shield style={iconStyle} />;
      case 'Check': return <Check style={iconStyle} />;
      case 'X': return <X style={iconStyle} />;
      case 'Info': return <Info style={iconStyle} />;
      case 'Calendar': return <Calendar style={iconStyle} />;
      case 'Clock': return <Clock style={iconStyle} />;
      default: return <Gift style={iconStyle} />;
    }
  };

  // Visual presets form builder variables
  const [presetFormName, setPresetFormName] = useState('');
  const [presetFormIcon, setPresetFormIcon] = useState('Gift');
  const [presetFormBg, setPresetFormBg] = useState('#fafafa');
  const [presetFormBorder, setPresetFormBorder] = useState('1px solid #d9d9d9');
  const [presetFormColor, setPresetFormColor] = useState('#1677ff');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);

  const handleEditPreset = (preset: any) => {
    setEditingPresetId(preset.id);
    setPresetFormName(preset.name);
    setPresetFormIcon(preset.icon);
    setPresetFormBg(preset.background);
    setPresetFormBorder(preset.border);
    setPresetFormColor(preset.color);
    message.info(`Đang sửa mẫu "${preset.name}".`);
  };

  const handleSavePreset = () => {
    if (!presetFormName.trim()) {
      message.error('Vui lòng điền tên mẫu biểu diễn mạo!');
      return;
    }
    const targetId = editingPresetId || 'preset_' + Math.random().toString(36).substr(2, 5);
    const payload = {
      id: targetId,
      name: presetFormName,
      icon: presetFormIcon,
      background: presetFormBg,
      border: presetFormBorder,
      color: presetFormColor
    };

    if (editingPresetId) {
      setVisualPresets(prev => prev.map(p => p.id === targetId ? payload : p));
      setEditingPresetId(null);
      message.success('Đã cập nhật mẫu diện mạo thành công!');
    } else {
      setVisualPresets(prev => [...prev, payload]);
      message.success('Đã thêm mẫu diện mạo mới vào Thư viện!');
    }

    setPresetFormName('');
    setPresetFormIcon('Gift');
    setPresetFormBg('#ffffff');
    setPresetFormBorder('1px solid #ddd');
    setPresetFormColor('#1677ff');
  };

  const handleDeletePreset = (id: string) => {
    setVisualPresets(prev => prev.filter(p => p.id !== id));
    if (editingPresetId === id) {
      setEditingPresetId(null);
      setPresetFormName('');
    }
    message.success('Đã xóa mẫu diện mạo khỏi Thư viện.');
  };

  return (
    <div style={{ padding: '8px 16px', minHeight: '80vh', background: '#f5f7fa', borderRadius: 10 }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }
        .shake-card-error {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
          border-color: #ff4d4f !important;
          box-shadow: 0 0 10px rgba(255, 77, 79, 0.2) !important;
        }
      `}} />
      {/* Title Header Section */}
      <Card variant="borderless" style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <Row justify="space-between" align="middle" gutter={16}>
          <Col xs={24} sm={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ padding: 10, background: '#fff2e8', borderRadius: 8, color: '#fa541c' }}>
                <Percent size={28} strokeWidth={2.5} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>
                  HỆ THỐNG QUẢN TRỊ CHIẾN DỊCH KHUYẾN MÃI CHI TIẾT
                </Title>
                <Paragraph style={{ margin: '4px 0 0', color: '#595959', fontSize: 13 }}>
                  Khởi chạy các chiến dịch chiết khấu tự động, thiết lập dải thư mục lồng kép hoặc chỉnh sửa giao diện đại diện hiển thị linh động tại POS.
                </Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
            <Button 
              type="dashed" 
              danger
              icon={<ReloadOutlined />}
              onClick={() => {
                modal.confirm({
                  title: 'Reset Toàn Bộ Khuyến Mãi Gốc?',
                  content: 'Tất cả cấu trúc danh mục, visual presets và luật lệ sẽ khôi phục về ban đầu.',
                  okText: 'Xác nhận Reset',
                  cancelText: 'Hủy bỏ',
                  onOk: () => {
                    localStorage.removeItem('pos_console_menus');
                    localStorage.removeItem('pos_promotions');
                    localStorage.removeItem('pos_promo_presets');
                    window.location.reload();
                  }
                });
              }}
            >
              Reset Cấu Hình Gốc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Simulation Account Switcher (Premium Design) */}
      <Card 
        style={{ 
          marginBottom: 20, 
          borderRadius: 16, 
          background: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          border: '1px solid #e8e8e8'
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 'bold', color: '#1f1f1f' }}>
              🔑 CỔNG ĐĂNG NHẬP GIẢ LẬP HỆ THỐNG & PHÂN QUYỀN VAI TRÒ
            </span>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
              Thay đổi tài khoản đăng nhập để kiểm thử luồng quy trình phân cấp liên thông giữa bộ phận KT/Marketing và bộ phận Kỹ thuật IT.
            </div>
          </div>
          <Tag color="purple" style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>
            ⚡ Live Testing Env
          </Tag>
        </div>

        <Row gutter={[16, 16]}>
          {/* Admin Switcher Card */}
          <Col xs={24} md={8}>
            <div 
              onClick={() => {
                setUserRole('all');
                setCurrentStep(0);
                message.success('Đã đăng nhập giả lập tài khoản ADMIN_ROOT (Toàn quyền)');
              }}
              style={{ 
                border: userRole === 'all' ? '2px solid #fa541c' : '1px solid #f0f0f0',
                background: userRole === 'all' ? '#fff9f6' : '#fafafa',
                padding: '12px 16px',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {userRole === 'all' && (
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: '#fa541c', borderRadius: '50%', display: 'inline-block' }}></span>
                  <span style={{ fontSize: 9, color: '#fa541c', fontWeight: 'bold' }}>ACTIVE</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ padding: 6, background: '#fff2e8', color: '#fa541c', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
                  <CrownOutlined style={{ fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 13, color: '#262626' }}>Trần Quốc Bảo (Admin)</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>admin_root | Ban Giám Đốc</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#595959', lineHeight: '1.4' }}>
                • Thấy toàn bộ quy trình cấu hình.<br />
                • Cài đặt Luật KM ➔ Setup Vị trí ➔ Setup Diện mạo nút POS.
              </div>
            </div>
          </Col>

          {/* KT/Marketing Switcher Card */}
          <Col xs={24} md={8}>
            <div 
              onClick={() => {
                setUserRole('mtk');
                setCurrentStep(1);
                message.success('Đã đăng nhập giả lập tài khoản MTK_MANAGER (Phòng Marketing/KT)');
              }}
              style={{ 
                border: userRole === 'mtk' ? '2px solid #52c41a' : '1px solid #f0f0f0',
                background: userRole === 'mtk' ? '#f6ffed' : '#fafafa',
                padding: '12px 16px',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {userRole === 'mtk' && (
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: '#52c41a', borderRadius: '50%', display: 'inline-block' }}></span>
                  <span style={{ fontSize: 9, color: '#52c41a', fontWeight: 'bold' }}>ACTIVE</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ padding: 6, background: '#f6ffed', color: '#52c41a', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
                  <NotificationOutlined style={{ fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 13, color: '#262626' }}>Nguyễn Thùy Chi (KT)</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>mtk_manager | Phòng Marketing</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#595959', lineHeight: '1.4' }}>
                • <strong style={{ color: '#389e0d' }}>Chỉ tập trung Bước 2 (Luật)</strong>.<br />
                • Tạo chiến dịch, mức giảm, mốc bill. Ẩn bước 1 và 3 (Chờ IT Setup).
              </div>
            </div>
          </Col>

          {/* IT Switcher Card */}
          <Col xs={24} md={8}>
            <div 
              onClick={() => {
                setUserRole('it');
                setCurrentStep(0);
                message.success('Đã đăng nhập giả lập tài khoản IT_SYSTEM (Phòng Kỹ thuật IT)');
              }}
              style={{ 
                border: userRole === 'it' ? '2px solid #1890ff' : '1px solid #f0f0f0',
                background: userRole === 'it' ? '#e6f7ff' : '#fafafa',
                padding: '12px 16px',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {userRole === 'it' && (
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: '#1890ff', borderRadius: '50%', display: 'inline-block' }}></span>
                  <span style={{ fontSize: 9, color: '#1890ff', fontWeight: 'bold' }}>ACTIVE</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ padding: 6, background: '#e6f7ff', color: '#1890ff', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
                  <LaptopOutlined style={{ fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 13, color: '#262626' }}>Lê Hoàng Nam (IT)</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>it_system | Phòng Kỹ thuật</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#595959', lineHeight: '1.4' }}>
                • <strong style={{ color: '#096dd9' }}>Chỉ làm Bước 1 & 3 (Vị trí & Nút)</strong>.<br />
                • Click dòng KM do KT tạo ➔ Setup Nút bấm. Ẩn hoàn toàn Bước 2 (Luật).
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Main Content Area - Full-Width Tabs like Orders tab layout */}
      <Tabs 
        activeKey={mainActiveTab}
        onChange={(key) => setMainActiveTab(key)}
        size="middle"
        type="line"
        style={{ background: '#fff', padding: '16px 20px', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
        items={[
          {
            key: "promo_list",
            label: (
              <span className="font-bold" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                🎁 Danh Sách Chương Trình ({availablePromos.length})
              </span>
            ),
            children: (
              <div style={{ padding: '8px 0' }}>
                
                {/* 1. CHỈ SỐ THỐNG KÊ (STATS CARDS) */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col xs={24} sm={8}>
                    <Card size="small" style={{ background: '#f9f0ff', border: '1px solid #d3adf7', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11, color: '#531dab', fontWeight: 'bold' }}>TỔNG CHƯƠNG TRÌNH</Text>
                          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#531dab', marginTop: 4 }}>
                            {availablePromos.length} Chiến dịch
                          </div>
                        </div>
                        <div style={{ background: '#f3e8ff', padding: '6px 10px', borderRadius: 8, color: '#722ed1', fontSize: 18 }}>
                          🎁
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: '#722ed1', marginTop: 8 }}>
                        Toàn bill: {availablePromos.filter(p => p.scope === 'bill').length} | Dòng món: {availablePromos.filter(p => p.scope === 'item').length}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11, color: '#389e0d', fontWeight: 'bold' }}>ĐA LIÊN THÔNG POS</Text>
                          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#389e0d', marginTop: 4 }}>
                            {availablePromos.filter(p => p.itConfigured !== false).length} Hoàn thiện
                          </div>
                        </div>
                        <div style={{ background: '#e6ffed', padding: '6px 10px', borderRadius: 8, color: '#52c41a', fontSize: 18 }}>
                          ●
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: '#52c41a', marginTop: 8 }}>
                        Đạt tỉ lệ phủ phím bấm: {availablePromos.length > 0 ? Math.round((availablePromos.filter(p => p.itConfigured !== false).length / availablePromos.length) * 100) : 0}%
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card size="small" style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11, color: '#d46b08', fontWeight: 'bold' }}>CHỜ IT SETUP PHÍM</Text>
                          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#d48008', marginTop: 4 }}>
                            {availablePromos.filter(p => p.itConfigured === false).length} Ưu đãi
                          </div>
                        </div>
                        <div style={{ background: '#fffbe6', padding: '6px 10px', borderRadius: 8, color: '#fa8c16', fontSize: 18 }}>
                          ⚠️
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: '#fa8c16', marginTop: 8 }}>
                        Cần IT cấu hình bổ sung thư mục và nhãn hiển thị nút
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* 3. QUẢN LÝ TIÊU ĐỀ & KHỞI TẠO BUTTON */}
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <Text strong style={{ fontSize: 14 }}>QUẢN LÝ CHƯƠNG TRÌNH KHUYẾN MÃI HIỆN HÀNH</Text>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                      Toàn bộ ưu đãi kích cầu tiêu dùng được phân quyền liên thông đa bộ phận:
                    </div>
                  </div>
                  {userRole !== 'it' ? (
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      style={{ background: userRole === 'mtk' ? '#52c41a' : '#fa541c', borderColor: userRole === 'mtk' ? '#52c41a' : '#fa541c' }}
                      onClick={() => {
                        handleResetWizard();
                        if (userRole === 'mtk') {
                          setCurrentStep(1);
                        } else {
                          setCurrentStep(0);
                        }
                        setMainActiveTab('wizard');
                      }}
                    >
                      {userRole === 'mtk' ? 'Thêm chương trình khuyến mãi mới (KT)' : 'Thêm chương trình khuyến mãi mới'}
                    </Button>
                  ) : (
                    <div style={{ background: '#e6f7ff', padding: '8px 14px', borderRadius: 8, border: '1px solid #91d5ff', fontSize: 12, color: '#0050b3' }}>
                      💡 <strong>Quy trình IT:</strong> Hãy chọn dòng khuyến mãi bên dưới và click <strong>"⚙️ Setup Nút POS"</strong> để bố trí thư mục & phím bấm.
                    </div>
                  )}
                </div>

                {/* 4. THANH BỘ LỌC TÌM KIẾM NÂNG CAO (Advanced Filters) */}
                <Card size="small" style={{ marginBottom: 16, borderRadius: 10, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                  <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} md={8}>
                      <Input
                        placeholder="Tìm theo tên ưu đãi, mã ID, hoặc mô tả..."
                        allowClear
                        value={promoSearchText}
                        onChange={(e) => setPromoSearchText(e.target.value)}
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        style={{ width: '100%', borderRadius: 6 }}
                      />
                    </Col>
                    <Col xs={12} md={5}>
                      <Select
                        value={promoSearchScope}
                        onChange={(v) => setPromoSearchScope(v)}
                        style={{ width: '100%' }}
                        options={[
                          { value: 'all', label: 'Tất cả Phạm vi' },
                          { value: 'bill', label: 'Hóa đơn (Toàn Bill)' },
                          { value: 'item', label: 'Món ăn (Dòng món)' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} md={5}>
                      <Select
                        value={promoSearchStatus}
                        onChange={(v) => setPromoSearchStatus(v)}
                        style={{ width: '100%' }}
                        options={[
                          { value: 'all', label: 'Tất cả Trạng thái' },
                          { value: 'configured', label: 'Đã hoàn thiện nút POS' },
                          { value: 'waiting', label: 'Đang chờ IT thiết lập' },
                        ]}
                      />
                    </Col>
                    <Col xs={24} md={6} style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Button 
                        icon={<ReloadOutlined />}
                        onClick={() => {
                          setPromoSearchText('');
                          setPromoSearchScope('all');
                          setPromoSearchStatus('all');
                          setSelectedRowKeys([]);
                          message.info('Đã hoàn tác bộ lọc!');
                        }}
                        style={{ borderRadius: 6 }}
                      >
                        Làm mới
                      </Button>
                      {selectedRowKeys.length > 0 && (
                        <Dropdown
                          menu={{
                            items: [
                              { 
                                key: 'batch_print', 
                                label: 'In Quyết Định loạt', 
                                icon: <PrinterOutlined style={{ color: '#1890ff' }} />,
                                onClick: () => {
                                  const items = filteredPromos.filter(p => selectedRowKeys.includes(p.id));
                                  items.forEach(p => handlePrintMemo(p));
                                }
                              },
                              { 
                                key: 'batch_export_csv', 
                                label: 'Kết xuất CSV hàng loạt', 
                                icon: <DownloadOutlined style={{ color: '#52c41a' }} />,
                                onClick: () => handleBatchExport(selectedRowKeys, 'csv')
                              },
                              { 
                                key: 'batch_delete', 
                                label: 'Xóa hàng loạt', 
                                icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                                danger: true,
                                onClick: () => handleBatchDelete(selectedRowKeys)
                              }
                            ]
                          }}
                          placement="bottomRight"
                        >
                          <Button type="primary" danger style={{ borderRadius: 6 }}>
                            Thao tác nhanh ({selectedRowKeys.length}) ▾
                          </Button>
                        </Dropdown>
                      )}
                    </Col>
                  </Row>
                </Card>

                {/* 5. BẢNG DỮ LIỆU THÔNG MINH LIÊN THÔNG (Smart Table) */}
                <SmartTable 
                  dataSource={filteredPromos} 
                  rowKey="id" 
                  size="small" 
                  pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (total) => `Tổng cộng ${total} chương trình` }}
                  selectedRowKeys={selectedRowKeys}
                  rowSelection={{
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys)
                  }}
                  onBatchDelete={handleBatchDelete}
                  onBatchExport={(keys, format) => handleBatchExport(keys, format)}
                  onRow={(record: any) => {
                    const isCurrentlyActive = record.isActive ?? true;
                    if (!isCurrentlyActive) {
                      return {
                        style: {
                          opacity: 0.55,
                          filter: 'grayscale(45%)',
                          backgroundColor: '#fafafa',
                          transition: 'all 0.3s ease'
                        }
                      };
                    }
                    return {
                      style: {
                        transition: 'all 0.3s ease'
                      }
                    };
                  }}
                  rowClassName={(record, index) => `${index % 2 === 0 ? 'zebra-row-even' : 'zebra-row-odd'} hover-row-effect`}
                  columns={[
                    {
                      title: 'Mã ID',
                      key: 'p_id',
                      dataIndex: 'id',
                      width: 100,
                      resizable: true,
                      render: (id: string) => <Text style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#555' }}>{id}</Text>
                    },
                    {
                      title: 'Chương trình ưu đãi',
                      key: 'p_info',
                      dataIndex: 'name',
                      searchable: true,
                      resizable: true,
                      render: (_, promo: any) => (
                        <div style={{ padding: '4px 0' }}>
                          <strong style={{ fontSize: 13, color: '#1677ff', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {promo.name}
                            {promo.itConfigured !== false && (
                              <span style={{ display: 'inline-block', width: 6, height: 6, background: '#52c41a', borderRadius: '50%' }}></span>
                            )}
                          </strong>
                          {promo.description ? (
                            <span style={{ fontSize: 11, color: '#595959', display: 'block', marginTop: 4, fontStyle: 'italic' }}>
                              {promo.description}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: '#bfbfbf', display: 'block', marginTop: 4 }}>
                              Không có mô tả bổ sung.
                            </span>
                          )}
                        </div>
                      )
                    },
                    {
                      title: 'Trạng thái POS',
                      key: 'p_status',
                      width: 150,
                      render: (_, promo: any) => {
                        const isConfigured = promo.itConfigured !== false;
                        return isConfigured ? (
                          <Badge status="success" text={<span style={{ color: '#389e0d', fontWeight: '500', fontSize: 12 }}>Đã gán nút POS</span>} />
                        ) : (
                          <Badge status="processing" text={<span style={{ color: '#fa8c16', fontWeight: '600', fontSize: 12 }}>Chờ IT Setup</span>} />
                        );
                      }
                    },
                    {
                      title: 'Mức giảm & Điều kiện',
                      key: 'p_conditions',
                      dataIndex: 'value',
                      resizable: true,
                      width: 220,
                      render: (_, promo: any) => (
                        <div>
                          <Space size={4}>
                            <Tag color={promo.scope === 'bill' ? 'blue' : 'purple'} style={{ fontSize: 9, borderRadius: 4, fontWeight: 'bold' }}>
                              {promo.scope === 'bill' ? 'BILL' : 'DÒNG MÓN'}
                            </Tag>
                            {promo.excludePromoKeys && promo.excludePromoKeys.length > 0 && (
                              <Tag color="red" style={{ fontSize: 9, borderRadius: 4 }}>LOẠI TRỪ CHÉO</Tag>
                            )}
                          </Space>
                          <div style={{ fontSize: 13, fontWeight: 'bold', marginTop: 4, color: '#262626' }}>
                            {promo.isRate ? `Giảm ${promo.value * 100}%` : `Giảm -${promo.value.toLocaleString()} ₫`}
                          </div>
                          {promo.threshold ? (
                            <span style={{ fontSize: 11, color: '#d46b08', display: 'block', marginTop: 2 }}>
                              Ngưỡng tối thiểu: <strong>{promo.threshold.toLocaleString()} đ</strong>
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, color: '#8c8c8c', display: 'block', marginTop: 2 }}>Không yêu cầu ngưỡng</span>
                          )}
                        </div>
                      )
                    },
                    {
                      title: 'Bật/Tắt phím & Trạng thái',
                      key: 'p_display_status',
                      width: 210,
                      render: (_, promo: any) => {
                        const expired = isPromoExpired(promo);
                        const isCurrentlyActive = promo.isActive ?? true;
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Switch 
                                checked={isCurrentlyActive} 
                                size="small"
                                checkedChildren="Bật"
                                unCheckedChildren="Tắt"
                                onChange={(checked) => handleTogglePromoActive(promo.id, checked)}
                              />
                              <span style={{ fontSize: 12, fontWeight: 'bold', color: isCurrentlyActive ? '#52c41a' : '#bfbfbf' }}>
                                {isCurrentlyActive ? 'Sẵn sàng' : 'Bị Khóa/Lỗi'}
                              </span>
                            </div>
                            
                            {isCurrentlyActive ? (
                              expired ? (
                                <Tag color="error" style={{ margin: 0, fontWeight: 'bold', fontSize: 10, width: 'fit-content' }}>
                                  ⚠️ Hết hạn / Ngoài giờ
                                </Tag>
                              ) : (
                                <Tag color="success" style={{ margin: 0, fontWeight: 'bold', fontSize: 10, width: 'fit-content' }}>
                                  🟢 Hiện nút POS (Hiệu lực)
                                </Tag>
                              )
                            ) : (
                              <Tag color="default" style={{ margin: 0, fontWeight: 'bold', fontSize: 10, width: 'fit-content' }}>
                                🔴 Đã tắt thủ công (Khóa phím)
                              </Tag>
                            )}

                            {promo.endDate && (
                              <span style={{ fontSize: 10, color: expired ? '#ff4d4f' : '#8c8c8c' }}>
                                Hạn: {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                        );
                      }
                    },
                    {
                      title: 'Thiết kế phím POS',
                      key: 'p_layout',
                      resizable: true,
                      width: 200,
                      render: (_, promo: any) => {
                        const isConfigured = promo.itConfigured !== false;
                        return (
                          <div>
                            <div style={{ 
                              background: isConfigured ? (promo.background || '#ffffff') : '#fafafa', 
                              border: isConfigured ? (promo.border || '1px solid #ddd') : '1px dashed #d9d9d9', 
                              color: isConfigured ? (promo.color || '#333') : '#8c8c8c', 
                              padding: '6px 12px', 
                              borderRadius: 8, 
                              fontSize: 11,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontWeight: 'bold',
                              opacity: isConfigured ? 1 : 0.4,
                              boxShadow: isConfigured ? '0 2px 4px rgba(0,0,0,0.04)' : 'none'
                            }}>
                              {renderIconWithColor(promo.icon || 'Gift', 14, isConfigured ? (promo.color || '#333') : '#bfbfbf')}
                              <span>{promo.name || 'Mẫu Phím'}</span>
                            </div>
                            <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 4 }}>
                              Folder: {isConfigured ? (getFolderTitleByKey(consoleMenus, findFolderForPromo(consoleMenus, promo.id))) : 'Chưa định vị'}
                            </div>
                          </div>
                        );
                      }
                    },
                    {
                      title: 'Hành động liên thông',
                      key: 'p_actions',
                      width: 140,
                      render: (_, promo: any) => {
                        const expired = isPromoExpired(promo);
                        const menuItems = [
                          {
                            key: 'view_details',
                            label: 'Xem chi tiết hồ sơ',
                            icon: <EyeOutlined style={{ color: '#1677ff' }} />,
                            onClick: () => {
                              setSelectedDetailPromo(promo);
                              setMainActiveTab('promo_details');
                            }
                          },
                          {
                            key: 'edit_promo',
                            label: userRole === 'mtk' ? 'Hiệu chỉnh Luật' : userRole === 'it' ? 'Setup phím POS' : 'Hiệu chỉnh toàn diện',
                            icon: <EditOutlined style={{ color: '#722ed1' }} />,
                            onClick: () => handleEditPromo(promo)
                          },
                          {
                            key: 'extend_time',
                            label: 'Gia hạn thời gian',
                            icon: <ReloadOutlined style={{ color: '#fa8c16' }} />,
                            onClick: () => {
                              setPromoToExtend(promo);
                              setExtendNewEndDate(promo.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                              setShowExtendModal(true);
                            }
                          },
                          {
                            key: 'duplicate_promo',
                            label: 'Sao chép chương trình',
                            icon: <CopyOutlined style={{ color: '#52c41a' }} />,
                            onClick: () => handleDuplicatePromo(promo)
                          },
                          {
                            key: 'divider',
                            type: 'divider' as const
                          },
                          {
                            key: 'delete_promo',
                            label: 'Xóa chương trình',
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: () => {
                              modal.confirm({
                                title: `Bạn có chắc chắn muốn xóa chương trình "${promo.name || promo.title}"?`,
                                content: 'Hành động này sẽ xóa hoàn toàn ưu đãi khỏi các quầy POS và không thể hoàn tác.',
                                okText: 'Xóa ngay',
                                okType: 'danger',
                                cancelText: 'Hủy bỏ',
                                onOk: () => {
                                  handleDeletePromo(promo.id);
                                }
                              });
                            }
                          }
                        ];

                        return (
                          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                            <Button 
                              type="primary" 
                              icon={<SettingOutlined />} 
                              style={{ 
                                background: expired ? '#8c8c8c' : '#1677ff', 
                                borderColor: expired ? '#8c8c8c' : '#1677ff',
                                borderRadius: 6
                              }}
                              size="small"
                            >
                              Thao tác ▾
                            </Button>
                          </Dropdown>
                        );
                      }
                    }
                  ]}
                />
              </div>
            )
          },
          {
            key: "wizard",
            label: (
              <span className="font-bold" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                ✨ {editingPromoId ? `⚙️ Hiệu Chỉnh: ${promoFormTitle}` : '➕ Quy Trình Thiết Lập (Wizard)'}
              </span>
            ),
            children: (
              <div style={{ padding: '16px 0', width: '100%' }}>
                <Card 
                  title={
                    <Space>
                      <Palette size={18} style={{ color: userRole === 'mtk' ? '#52c41a' : userRole === 'it' ? '#1890ff' : '#fa541c' }} />
                      <span style={{ fontSize: 13, fontWeight: 'bold' }}>
                        {userRole === 'mtk' ? (
                          editingPromoId ? `📣 KT: HIỆU CHỈNH LUẬT & ĐIỀU KIỆN - ${promoFormTitle}` : '📣 KT: KHỞI TẠO CHIẾN DỊCH KHUYẾN MÃI MỚI'
                        ) : userRole === 'it' ? (
                          `⚙️ IT: THIẾT LẬP NÚT BẤM POS - ${promoFormTitle}`
                        ) : (
                          editingPromoId ? `⚙️ ADMIN: HIỆU CHỈNH TOÀN DIỆN - ${promoFormTitle}` : '✨ ADMIN: KHỞI TẠO CHIẾN DỊCH KHUYẾN MÃI (3 BƯỚC)'
                        )}
                      </span>
                      {editingPromoId && <Tag color="blue">Mã gốc: {editingPromoId}</Tag>}
                    </Space>
                  }
                  extra={
                    (editingPromoId || (userRole === 'all' && currentStep > 0) || (userRole === 'it' && currentStep === 2)) && (
                      <Button size="small" type="text" onClick={() => {
                        handleResetWizard();
                        if (userRole === 'mtk') {
                          setCurrentStep(1);
                        }
                      }}>
                        Xóa bộ nhớ tạm / Tạo mới
                      </Button>
                    )
                  }
                  style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}
                >
                  {/* Steps indicator based on role */}
                  {userRole === 'all' && (
                    <Steps 
                      current={currentStep} 
                      onChange={(step) => {
                        if (step > currentStep && !promoFormTitle.trim() && currentStep === 1) {
                          message.error('Nhập tên ưu đãi để đi tiếp!');
                          return;
                        }
                        setCurrentStep(step);
                      }}
                      size="small" 
                      style={{ marginBottom: 24 }}
                      items={[
                        { title: 'Bước 1', description: 'Vị trí hiển thị' },
                        { title: 'Bước 2', description: 'Logic áp dụng' },
                        { title: 'Bước 3', description: 'Diện mạo POS' }
                      ]}
                    />
                  )}

                  {userRole === 'it' && (
                    <Steps 
                      current={currentStep === 2 ? 1 : 0} 
                      onChange={(step) => {
                        if (step === 0) setCurrentStep(0);
                        if (step === 1) setCurrentStep(2);
                      }}
                      size="small" 
                      style={{ marginBottom: 24 }}
                      items={[
                        { title: 'Bước 1', description: 'Vị trí hiển thị' },
                        { title: 'Bước 2', description: 'Diện mạo POS' }
                      ]}
                    />
                  )}

                  {userRole === 'mtk' && (
                    <div style={{ marginBottom: 20, background: '#f6ffed', padding: '10px 14px', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                      <strong style={{ color: '#389e0d', display: 'block', fontSize: 12 }}>📣 KHÔNG GIAN LÀM VIỆC CỦA MARKETING / KT:</strong>
                      <span style={{ fontSize: 11, color: '#237804' }}>Bạn có quyền cấu hình Luật & Điều kiện ưu đãi. Hệ thống tự động ẩn Bước 1 (Vị trí) và Bước 3 (Nút bấm) thuộc thẩm quyền của IT.</span>
                    </div>
                  )}

                  <Form layout="vertical" size="small">
                    
                    {/* STEP 1: POSITION DIRECTORY SELECTION / DYNAMIC CREATION */}
                    {currentStep === 0 && (
                      <div style={{ minHeight: '260px' }}>
                        {userRole === 'mtk' && (
                          <Alert
                            message="[PHÂN CẤP QUY TRÌNH] Thiết lập Thư mục & Vị trí nút bấm"
                            description="Thông tin này thuộc chuyên môn kỹ thuật của bộ phận IT để thiết lập cấu trúc bàn phím POS. Bộ phận MTK có thể giữ nguyên mặc định và bấm 'Tiếp tục sang Bước 2' để cấu hình luật chương trình."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                          />
                        )}
                        {(userRole === 'it' || userRole === 'all') && (
                          <div style={{ marginBottom: 16, background: '#e6f7ff', padding: '10px 14px', borderRadius: 8, border: '1px solid #91d5ff' }}>
                            <strong style={{ color: '#0050b3', display: 'block', fontSize: 12 }}>💻 BỘ PHẬN IT THỰC HIỆN CHÍNH:</strong>
                            <span style={{ fontSize: 11, color: '#002c8c' }}>Xác lập sơ đồ phím bấm và phân cấp cây thư mục cha-con cho chiến dịch khuyến mãi này tại màn hình POS.</span>
                          </div>
                        )}

                        <Alert 
                          message={
                            <div>
                              <strong>Bước 1: Thiết lập thư mục vị trí hiển thị ưu đãi</strong><br/>
                              <span style={{ fontSize: 11 }}>Quyết định nơi mã khuyến mại sẽ xuất hiện. Bạn có thể chọn thư mục có sẵn hoặc tạo một thư mục mới hoàn toàn linh động.</span>
                            </div>
                          }
                          type="info" 
                          showIcon 
                          style={{ marginBottom: 16 }}
                        />

                        {/* Dynamic directory toggle */}
                        <div style={{ background: '#f9f9f9', padding: '12px 14px', borderRadius: 8, border: '1px solid #e8e8e8', marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text strong style={{ fontSize: 12 }}>Tùy chọn tạo Folder vị trí linh hoạt:</Text>
                            <Switch 
                              checkedChildren="Tạo Folder mới 📁" 
                              unCheckedChildren="Chọn Folder cũ 📁" 
                              checked={isNewFolderMode} 
                              onChange={(checked) => setIsNewFolderMode(checked)}
                            />
                          </div>

                          {!isNewFolderMode ? (
                            <Form.Item label="Chọn thư mục chứa hiện tại (Rê chuột để xem tên đầy đủ):" required style={{ marginBottom: 0 }}>
                              <Select 
                                showSearch
                                optionFilterProp="label"
                                value={promoFormFolder} 
                                style={{ width: '100%' }}
                                onChange={(val) => setPromoFormFolder(val)}
                                placeholder="Tìm kiếm thư mục..."
                              >
                                {getAllFolders(consoleMenus).map(f => {
                                  const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(f.depth);
                                  const prefix = f.depth > 0 ? '↳ 📁 ' : '📁 ';
                                  const optText = `${f.title} (Key: ${f.key})`;
                                  return (
                                    <Select.Option key={f.key} value={f.key} label={optText} title={optText}>
                                      {indent}{prefix}{f.title} (Key: {f.key})
                                    </Select.Option>
                                  );
                                })}
                              </Select>
                            </Form.Item>
                          ) : (
                            <div style={{ marginTop: 10, background: '#fff', padding: 10, borderRadius: 6, border: '1px solid #ffe7ba' }}>
                              <strong style={{ fontSize: 11, color: '#d46b08', display: 'block', marginBottom: 8 }}>📁 KHỞI TẠO THƯ MỤC ƯU ĐÃI LIÊN KẾT MỚI:</strong>
                              
                              <Form.Item label="Tên Thư mục mới:" required style={{ marginBottom: 8 }}>
                                <Input 
                                  value={newFolderName}
                                  placeholder="Ví dụ: Ưu Đãi Mùa Hè Rực Rỡ"
                                  onChange={(e) => {
                                    setNewFolderName(e.target.value);
                                    const slug = e.target.value
                                      .toLowerCase()
                                      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                                      .replace(/[đĐ]/g, 'd')
                                      .replace(/\s+/g, '_');
                                    setNewFolderId('fld_' + slug);
                                  }}
                                />
                              </Form.Item>

                              <Row gutter={8}>
                                <Col span={12}>
                                  <Form.Item label="Mã Folder đại diện (Unique):" required style={{ marginBottom: 8 }}>
                                    <Input 
                                      value={newFolderId}
                                      placeholder="fld_summer_sale"
                                      onChange={(e) => setNewFolderId(e.target.value)}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item label="Đặt trong Thư mục cha (Rê chuột xem tên đầy đủ):" required style={{ marginBottom: 8 }}>
                                    <Select 
                                      showSearch
                                      optionFilterProp="label"
                                      value={newFolderParent} 
                                      onChange={(val) => setNewFolderParent(val)}
                                      placeholder="Chọn thư mục cha..."
                                    >
                                      <Select.Option key="static-folder-root" value="root" label="Cấp gốc cao nhất (Root Layout)" title="Cấp gốc cao nhất (Root Layout)">📁 Cấp gốc cao nhất (Root Layout)</Select.Option>
                                      <Select.Option key="static-folder-promotions" value="promotions" label="Chương trình Khuyến mãi (Gốc)" title="Chương trình Khuyến mãi (Gốc)">📁 Chương trình Khuyến mãi (Gốc)</Select.Option>
                                      {getAllFolders(consoleMenus).map(f => {
                                        const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(f.depth + 1);
                                        const prefix = '↳ 📁 ';
                                        const optText = `${f.title} (Key: ${f.key})`;
                                        return (
                                          <Select.Option key={f.key} value={f.key} label={optText} title={optText}>
                                            {indent}{prefix}{f.title}
                                          </Select.Option>
                                        );
                                      })}
                                    </Select>
                                  </Form.Item>
                                </Col>
                              </Row>

                              <Form.Item label="Icon biểu tượng Folder:" required style={{ marginBottom: 0 }}>
                                <Select 
                                  showSearch
                                  optionFilterProp="label"
                                  value={newFolderIcon} 
                                  onChange={(val) => setNewFolderIcon(val)}
                                  placeholder="Chọn biểu tượng..."
                                >
                                  {['Gift', 'Zap', 'Sparkles', 'Award', 'Tags', 'Laptop', 'Tv', 'Ticket', 'PartyPopper', 'ShoppingCart', 'Users', 'Percent', 'Briefcase', 'ShieldCheck'].map(ic => (
                                    <Select.Option key={ic} value={ic} label={ic} title={ic}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {renderIconWithColor(ic, 14, '#d46b08')} <span>{ic}</span>
                                      </div>
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </div>
                          )}
                        </div>

                        <div style={{ marginTop: 24, textAlign: 'right' }}>
                          {userRole === 'it' ? (
                            <Button 
                              type="primary" 
                              onClick={() => {
                                if (!promoFormTitle.trim()) {
                                  message.error('Vui lòng quay lại danh sách chọn chương trình khuyến mãi để setup!');
                                  return;
                                }
                                setCurrentStep(2);
                              }} 
                              style={{ background: '#1890ff', borderColor: '#1890ff', fontWeight: 'bold' }}
                            >
                              Tiếp tục: Cấu hình Diện Mạo Nút POS →
                            </Button>
                          ) : (
                            <Button 
                              type="primary" 
                              onClick={() => setCurrentStep(1)} 
                              style={{ background: '#fa541c', borderColor: '#fa541c' }}
                            >
                              Tiếp tục: Cài đặt Luật (Bước 2) →
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 2: PROMOTION RULES / LOGIC */}
                    {currentStep === 1 && (
                      <div style={{ minHeight: '260px' }}>
                        {userRole === 'it' && (
                          <Alert
                            message="[PHÂN CẤP QUY TRÌNH] Cài đặt Luật & Điều kiện khuyến mãi"
                            description="Nghiệp vụ cấu hình luật lệ, dải chiết khấu, mốc doanh thu và sản phẩm loại trừ thuộc chuyên môn chính của bộ phận Marketing (MTK). Bộ phận IT có thể xem tham khảo hoặc bấm 'Tiếp tục sang Bước 3' để cấu hình diện mạo nút bấm."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                          />
                        )}
                        {(userRole === 'mtk' || userRole === 'all') && (
                          <div style={{ marginBottom: 16, background: '#f6ffed', padding: '10px 14px', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                            <strong style={{ color: '#389e0d', display: 'block', fontSize: 12 }}>📣 BỘ PHẬN MARKETING (MTK) THỰC HIỆN CHÍNH:</strong>
                            <span style={{ fontSize: 11, color: '#237804' }}>Định nghĩa dải điều kiện áp dụng, tỷ lệ % hoặc số tiền bớt, mặt hàng tặng kèm / loại trừ để kích hoạt doanh số POS.</span>
                          </div>
                        )}

                        <Alert 
                          message="Bước 2: Thiết lập Chi tiết Luật Áp dụng & Điều kiện Khuyến mãi" 
                          type="info" 
                          showIcon 
                          style={{ marginBottom: 16 }}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                          {/* CARD A: 📋 TIÊU ĐỀ & MỤC TIÊU CHIẾN DỊCH */}
                            <Card 
                              title={
                                <div 
                                  onClick={() => setCollapsedCards(prev => ({ ...prev, step2_1: !prev.step2_1 }))}
                                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', width: '100%' }}
                                >
                                  <Space>
                                    <span style={{ color: '#1677ff', fontWeight: 'bold' }}>📋 Bước 2.1: Tên gọi & Mục tiêu chiến dịch</span>
                                    {validationErrors.promoFormTitle || validationErrors.promoFormId ? (
                                      <Tag color="error" style={{ fontSize: 9, fontWeight: 'bold' }}>⚠️ THIẾU THÔNG TIN</Tag>
                                    ) : (
                                      promoFormTitle ? <Tag color="success" style={{ fontSize: 9 }}>✓ Đã hoàn tất</Tag> : <Tag color="warning" style={{ fontSize: 9 }}>Yêu cầu</Tag>
                                    )}
                                  </Space>
                                  <Button 
                                    type="text" 
                                    size="small" 
                                    icon={collapsedCards.step2_1 ? <ChevronDown size={14} /> : <ChevronUp size={14} />} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCollapsedCards(prev => ({ ...prev, step2_1: !prev.step2_1 }));
                                    }} 
                                  />
                                </div>
                              }
                          className={shakeStep2_1 ? 'shake-card-error' : ''}
                          variant="outlined"
                          style={{ 
                            marginBottom: 16, 
                            borderRadius: 8, 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                            borderColor: (validationErrors.promoFormTitle || validationErrors.promoFormId) ? '#ff4d4f' : '#e8e8e8',
                            transition: 'all 0.3s'
                          }}
                        >
                          {!collapsedCards.step2_1 && (
                            <div>
                              <Form.Item label="Tên ưu đãi hiển thị tại POS:" required validateStatus={validationErrors.promoFormTitle ? 'error' : ''} help={validationErrors.promoFormTitle ? 'Vui lòng nhập tên chương trình ưu đãi' : ''} style={{ marginBottom: 12 }}>
                                <Input 
                                  value={promoFormTitle}
                                  placeholder="Ví dụ: Giảm giá ROG Độc Quyền hoặc Gold Member Giảm Toàn Bill"
                                  onChange={(e) => {
                                    setPromoFormTitle(e.target.value);
                                    if (validationErrors.promoFormTitle) {
                                      setValidationErrors(prev => ({ ...prev, promoFormTitle: false }));
                                    }
                                    if (!editingPromoId) {
                                      const slug = e.target.value
                                        .toLowerCase()
                                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                                        .replace(/[đĐ]/g, 'd')
                                        .replace(/[^a-z0-9\s_-]/g, '')
                                        .replace(/\s+/g, '_');
                                      setPromoFormId('km_' + slug);
                                    }
                                  }}
                                />
                              </Form.Item>

                              <Row gutter={8}>
                                <Col span={24}>
                                  <Form.Item label="Mã hiệu duy nhất (Unique ID):" required validateStatus={validationErrors.promoFormId ? 'error' : ''} help={validationErrors.promoFormId ? 'Vui lòng nhập mã hiệu duy nhất' : ''} style={{ marginBottom: 12 }}>
                                    <Input 
                                      value={promoFormId}
                                      disabled={!!editingPromoId}
                                      placeholder="km_summer_vip"
                                      onChange={(e) => {
                                        setPromoFormId(e.target.value);
                                        if (validationErrors.promoFormId) {
                                          setValidationErrors(prev => ({ ...prev, promoFormId: false }));
                                        }
                                      }}
                                    />
                                  </Form.Item>
                                </Col>
                              </Row>

                              <Form.Item label="Mục tiêu chiến dịch (KPI / Kế hoạch tăng trưởng doanh số):" style={{ marginBottom: 12 }}>
                                <Input.TextArea 
                                  rows={2}
                                  value={promoFormGoal}
                                  placeholder="Ví dụ: Đạt doanh thu 500 triệu đồng dải sản phẩm ASUS Gaming trong tháng hoạt động..."
                                  onChange={(e) => setPromoFormGoal(e.target.value)}
                                />
                              </Form.Item>

                              <Form.Item label="Mô tả tóm tắt chiến dịch (Hiển thị ghi chú nội bộ thu ngân):" style={{ marginBottom: 0 }}>
                                <Input.TextArea 
                                  rows={2} 
                                  value={promoFormDesc} 
                                  placeholder="Ý nghĩa chiến dịch, ghi chú hướng dẫn nhanh cho thu ngân áp dụng..." 
                                  onChange={(e) => setPromoFormDesc(e.target.value)}
                                />
                              </Form.Item>
                            </div>
                          )}
                        </Card>

                        {/* CARD B: 🎯 PHẠM VI & ĐIỀU KIỆN ÁP DỤNG */}
                        <Card 
                          title={
                            <div 
                              onClick={() => setCollapsedCards(prev => ({ ...prev, step2_2: !prev.step2_2 }))}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', width: '100%' }}
                            >
                              <Space>
                                <span style={{ color: '#1677ff', fontWeight: 'bold' }}>🎯 Bước 2.2: Phạm vi & Điều kiện áp dụng</span>
                                {(validationErrors.promoFormValue || validationErrors.promoFormTargetId || validationErrors.promoFormValueOverLimit) ? (
                                  <Tag color="error" style={{ fontSize: 9, fontWeight: 'bold' }}>⚠️ LỖI KHAI BÁO</Tag>
                                ) : (
                                  (promoFormValue > 0 && (promoFormScope !== 'item' || promoFormTargetId)) ? (
                                    <Tag color="success" style={{ fontSize: 9 }}>✓ Đã hoàn tất</Tag>
                                  ) : (
                                    <Tag color="warning" style={{ fontSize: 9 }}>Yêu cầu</Tag>
                                  )
                                )}
                              </Space>
                              <Button 
                                type="text" 
                                size="small" 
                                icon={collapsedCards.step2_2 ? <ChevronDown size={14} /> : <ChevronUp size={14} />} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCollapsedCards(prev => ({ ...prev, step2_2: !prev.step2_2 }));
                                }} 
                              />
                            </div>
                          }
                          className={shakeStep2_2 ? 'shake-card-error' : ''}
                          variant="outlined"
                          style={{ 
                            marginBottom: 16, 
                            borderRadius: 8, 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                            borderColor: (validationErrors.promoFormValue || validationErrors.promoFormTargetId || validationErrors.promoFormValueOverLimit) ? '#ff4d4f' : '#e8e8e8',
                            transition: 'all 0.3s'
                          }}
                        >
                          {!collapsedCards.step2_2 && (
                            <div>
                              <Row gutter={8}>
                                <Col span={12}>
                                  <Form.Item label="Phạm vi hoạt động (Scope):" required style={{ marginBottom: 12 }}>
                                    <Select 
                                      showSearch
                                      optionFilterProp="label"
                                      value={promoFormScope} 
                                      onChange={(val: any) => {
                                        setPromoFormScope(val);
                                        if (validationErrors.promoFormTargetId) {
                                          setValidationErrors(prev => ({ ...prev, promoFormTargetId: false }));
                                        }
                                      }}
                                      placeholder="Chọn phạm vi..."
                                    >
                                      <Select.Option value="bill" label="Chiết khấu toàn hóa đơn (Bill)" title="Chiết khấu toàn hóa đơn (Bill)">Chiết khấu toàn hóa đơn (Bill)</Select.Option>
                                      <Select.Option value="item" label="Chiết khấu theo dòng mặt hàng (Item)" title="Chiết khấu theo dòng mặt hàng (Item)">Chiết khấu theo dòng mặt hàng (Item)</Select.Option>
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item label="Hình thức khấu trừ:" required style={{ marginBottom: 12 }}>
                                    <Select 
                                      showSearch
                                      optionFilterProp="label"
                                      value={promoFormValueType} 
                                      disabled={promoFormScope === 'item'} 
                                      onChange={(val: any) => {
                                        setPromoFormValueType(val);
                                        setPromoFormValue(val === 'rate' ? 0.10 : 100000);
                                        if (validationErrors.promoFormValueOverLimit) {
                                          setValidationErrors(prev => ({ ...prev, promoFormValueOverLimit: false }));
                                        }
                                      }}
                                      placeholder="Chọn hình thức..."
                                    >
                                      <Select.Option value="rate" label="Phần trăm chiết khấu %" title="Phần trăm chiết khấu %">Phần trăm chiết khấu %</Select.Option>
                                      <Select.Option value="cash" label="Trừ tiền mặt cố định (VND)" title="Trừ tiền mặt cố định (VND)">Trừ tiền mặt cố định (VND)</Select.Option>
                                    </Select>
                                  </Form.Item>
                                </Col>
                              </Row>

                              <Row gutter={8}>
                                <Col span={24}>
                                  <Form.Item 
                                    label={promoFormValueType === 'rate' ? 'Tỷ lệ chiết khấu (VD: 0.15 = 15%):' : 'Số tiền mặt giảm trừ (VND):'} 
                                    required 
                                    validateStatus={(validationErrors.promoFormValue || validationErrors.promoFormValueOverLimit) ? 'error' : ''}
                                    help={
                                      validationErrors.promoFormValue 
                                        ? 'Giá trị chiết khấu phải lớn hơn 0' 
                                        : validationErrors.promoFormValueOverLimit 
                                          ? 'Tỷ lệ chiết khấu % không được lớn hơn 100% (1.0)' 
                                          : ''
                                    }
                                    style={{ marginBottom: 12 }}
                                  >
                                    <InputNumber 
                                      style={{ width: '100%' }}
                                      value={promoFormValue}
                                      step={promoFormValueType === 'rate' ? 0.01 : 10000}
                                      min={0}
                                      max={promoFormValueType === 'rate' ? 1.0 : undefined}
                                      onChange={(val) => {
                                        setPromoFormValue(val || 0);
                                        if (validationErrors.promoFormValue) {
                                          setValidationErrors(prev => ({ ...prev, promoFormValue: false }));
                                        }
                                        if (validationErrors.promoFormValueOverLimit) {
                                          setValidationErrors(prev => ({ ...prev, promoFormValueOverLimit: false }));
                                        }
                                      }}
                                    />
                                  </Form.Item>
                                </Col>
                              </Row>

                              {promoFormScope === 'bill' ? (
                                <Form.Item label="Giá trị hóa đơn tối thiểu để tự động áp dụng (VND):" style={{ marginBottom: 12 }}>
                                  <InputNumber 
                                    style={{ width: '100%' }}
                                    value={promoFormThreshold}
                                    placeholder="Để trống nếu không ràng buộc giá trị bill, VD: 500000"
                                    onChange={(val) => setPromoFormThreshold(val || undefined)}
                                  />
                                </Form.Item>
                              ) : (
                                <Form.Item 
                                  label="Sản phẩm hoặc Nhóm Ngành Hàng mục tiêu:" 
                                  required 
                                  validateStatus={validationErrors.promoFormTargetId ? 'error' : ''}
                                  help={validationErrors.promoFormTargetId ? 'Vui lòng chọn ít nhất một sản phẩm hoặc ngành hàng' : ''}
                                  style={{ marginBottom: 12 }}
                                >
                                  {(() => {
                                    const selectedProdArray = promoFormTargetId ? promoFormTargetId.split(',').filter(Boolean) : [];
                                    const productOptions = [
                                      ...DEFAULT_PRODUCTS.map(p => ({
                                        label: `[${p.id}] ${p.name} (${p.price.toLocaleString()} đ)`,
                                        value: p.id,
                                        group: 'Mặt hàng'
                                      })),
                                      { label: 'Nhóm Giày dép tiêu dùng', value: 'Giày dép', group: 'Ngành hàng' },
                                      { label: 'Nhóm Balo & Túi xách', value: 'Balo & Túi xách', group: 'Ngành hàng' },
                                      { label: 'Nhóm Ví & Phụ kiện', value: 'Ví & Phụ kiện', group: 'Ngành hàng' },
                                    ];

                                    return (
                                      <CheckboxMultiSelect
                                        value={selectedProdArray}
                                        onChange={(val: string[]) => {
                                          setPromoFormTargetId(val.join(','));
                                          if (validationErrors.promoFormTargetId) {
                                            setValidationErrors(prev => ({ ...prev, promoFormTargetId: false }));
                                          }
                                        }}
                                        options={productOptions}
                                        placeholder="Chọn các sản phẩm hoặc ngành hàng áp dụng"
                                        maxTagCount={3}
                                      />
                                    );
                                  })()}
                                </Form.Item>
                              )}

                              <Form.Item label="Cửa hàng áp dụng chương trình:" style={{ marginBottom: 12 }}>
                                {(() => {
                                  const storeOptions = [
                                    { label: 'Tất cả cửa hàng (Hệ thống liên thông)', value: 'STORE-ALL' },
                                    { label: 'Cửa hàng Hà Nội - Nguyễn Trãi', value: 'STORE-HN01' },
                                    { label: 'Cửa hàng TP.HCM - Lê Lợi', value: 'STORE-HCM01' },
                                    { label: 'Cửa hàng Đà Nẵng - Hùng Vương', value: 'STORE-DN01' },
                                    { label: 'Cửa hàng Hải Phòng - Lạch Tray', value: 'STORE-HP01' },
                                    { label: 'Cửa hàng Cần Thơ - Mậu Thân', value: 'STORE-CT01' },
                                  ];

                                  return (
                                    <CheckboxMultiSelect
                                      value={promoFormStores}
                                      onChange={(val: string[]) => {
                                        if (val.includes('STORE-ALL') && !promoFormStores.includes('STORE-ALL')) {
                                          setPromoFormStores(['STORE-ALL']);
                                        } else if (val.includes('STORE-ALL') && val.length > 1) {
                                          setPromoFormStores(val.filter(v => v !== 'STORE-ALL'));
                                        } else if (val.length === 0) {
                                          setPromoFormStores(['STORE-ALL']);
                                        } else {
                                          setPromoFormStores(val);
                                        }
                                      }}
                                      options={storeOptions}
                                      placeholder="Chọn cửa hàng áp dụng ưu đãi..."
                                      maxTagCount={3}
                                    />
                                  );
                                })()}
                              </Form.Item>

                              <Form.Item label="Các ưu đãi bị Xung đột loại trừ chéo (Hệ thống sẽ chặn khi chọn chung):" style={{ marginBottom: 0 }}>
                                {(() => {
                                  const selectedExcl = promoFormExclusions || [];
                                  const exclusionOptions = availablePromos
                                    .filter(p => p.id !== promoFormId)
                                    .map(p => ({
                                      label: `${p.name} (Mã: ${p.id})`,
                                      value: p.id
                                    }));

                                  return (
                                    <CheckboxMultiSelect
                                      value={selectedExcl}
                                      onChange={(val: string[]) => setPromoFormExclusions(val)}
                                      options={exclusionOptions}
                                      placeholder="Chọn các chương trình không hoạt động song song"
                                      maxTagCount={3}
                                    />
                                  );
                                })()}
                              </Form.Item>
                            </div>
                          )}
                        </Card>

                        {/* CARD C: ⏰ CẤU HÌNH KHUNG THỜI GIAN HOẠT ĐỘNG (CASCADE LEVEL) */}
                        <Card 
                          title={
                            <div 
                              onClick={() => setCollapsedCards(prev => ({ ...prev, step2_3: !prev.step2_3 }))}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', width: '100%' }}
                            >
                              <Space>
                                <span style={{ color: '#1677ff', fontWeight: 'bold' }}>⏰ Bước 2.3: Cấu hình Khung thời gian hoạt động</span>
                                {validationErrors.promoFormSelectedYears ? (
                                  <Tag color="error" style={{ fontSize: 9, fontWeight: 'bold' }}>⚠️ THIẾU NĂM ÁP DỤNG</Tag>
                                ) : (
                                  (promoFormTimeDepth === 'always' || (promoFormSelectedYears && promoFormSelectedYears.length > 0)) ? (
                                    <Tag color="success" style={{ fontSize: 9 }}>✓ Đã hoàn tất</Tag>
                                  ) : (
                                    <Tag color="warning" style={{ fontSize: 9 }}>Yêu cầu</Tag>
                                  )
                                )}
                              </Space>
                              <Button 
                                type="text" 
                                size="small" 
                                icon={collapsedCards.step2_3 ? <DownOutlined style={{ fontSize: 14 }} /> : <UpOutlined style={{ fontSize: 14 }} />} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCollapsedCards(prev => ({ ...prev, step2_3: !prev.step2_3 }));
                                }} 
                              />
                            </div>
                          }
                          className={shakeStep2_3 ? 'shake-card-error' : ''}
                          variant="outlined"
                          style={{ 
                            marginBottom: 16, 
                            borderRadius: 8, 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                            borderColor: validationErrors.promoFormSelectedYears ? '#ff4d4f' : '#e8e8e8',
                            transition: 'all 0.3s'
                          }}
                        >
                          {!collapsedCards.step2_3 && (
                            <div>
                              <Form.Item 
                                label={<strong style={{ fontSize: 13 }}>Loại khung thời gian áp dụng:</strong>} 
                                required 
                                style={{ marginBottom: 14 }}
                              >
                                <Select
                                  value={promoFormTimeDepth === 'always' ? 'always' : 'cascade'} 
                                  onChange={(v) => {
                                    setPromoFormTimeDepth(v);
                                    setPromoFormTimeType(v === 'always' ? 'always' : 'detailed');
                                    
                                    // Reset fields if they switch to always
                                    if (v === 'always') {
                                      setPromoFormSelectedYears([2026]);
                                      setPromoFormSelectedQuarters([]);
                                      setPromoFormSelectedMonths([]);
                                      setPromoFormSelectedDays([]);
                                      setPromoFormSelectedWeekdays([]);
                                      setPromoFormStartHour('');
                                      setPromoFormEndHour('');
                                      setTimeCascadeLevel('year');
                                    }
                                    if (validationErrors.promoFormSelectedYears) {
                                      setValidationErrors(prev => ({ ...prev, promoFormSelectedYears: false }));
                                    }
                                  }}
                                  options={[
                                    { label: '♾️ A. Vô thời hạn (Hoạt động liên tục không giới hạn ngày)', value: 'always' },
                                    { label: '⏳ B. Giới hạn phân cấp (Năm ➔ Quý ➔ Tháng ➔ Ngày ➔ Giờ)', value: 'cascade' }
                                  ]}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>

                              {/* IF ALWAYS IS CHOSEN */}
                              {promoFormTimeDepth === 'always' && (
                                <div style={{ background: '#f6ffed', padding: 14, borderRadius: 8, border: '1px solid #b7eb8f', marginBottom: 14 }}>
                                  <span style={{ fontSize: 13, color: '#52c41a', fontWeight: '500' }}>
                                    🟢 Chương trình đang chạy liên tục vô thời hạn. Bạn có thể bật Lặp lại tuần hoàn hoặc cài đặt Giờ vàng ở bên dưới.
                                  </span>
                                </div>
                              )}

                              {/* CASCADE SELECTION BLOCK */}
                              {promoFormTimeDepth !== 'always' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8, background: '#fafafa', padding: 14, borderRadius: 8, border: '1px dashed #d9d9d9', marginBottom: 14 }}>
                                  
                                  {/* SELECT TERMINAL DEPTH LEVEL */}
                                  <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 8, border: '1px solid #91d5ff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                      <SettingOutlined style={{ fontSize: 16, color: '#096dd9' }} />
                                      <strong style={{ fontSize: 13, color: '#0050b3' }}>Thiết lập điểm DỪNG PHÂN CẤP thời gian (Cascade Depth):</strong>
                                    </div>
                                    <p style={{ fontSize: 12, color: '#595959', margin: '0 0 10px 0' }}>
                                      Chọn cấp độ chi tiết mà chương trình này sẽ kết thúc phân tích. Ví dụ: Dừng ở <strong>Quý</strong> thì hết Quý đó sẽ tự động hết khuyến mãi.
                                    </p>
                                    <Segmented
                                      value={timeCascadeLevel}
                                      onChange={(val: any) => {
                                        setTimeCascadeLevel(val);
                                        // Clear fields belonging to deeper levels than the selected level to prevent dirty state
                                        if (val === 'year') {
                                          setPromoFormSelectedQuarters([]);
                                          setPromoFormSelectedMonths([]);
                                          setPromoFormSelectedDays([]);
                                          setPromoFormSelectedWeekdays([]);
                                          setPromoFormStartHour('');
                                          setPromoFormEndHour('');
                                        } else if (val === 'quarter') {
                                          setPromoFormSelectedMonths([]);
                                          setPromoFormSelectedDays([]);
                                          setPromoFormSelectedWeekdays([]);
                                          setPromoFormStartHour('');
                                          setPromoFormEndHour('');
                                        } else if (val === 'month') {
                                          setPromoFormSelectedDays([]);
                                          setPromoFormSelectedWeekdays([]);
                                          setPromoFormStartHour('');
                                          setPromoFormEndHour('');
                                        } else if (val === 'day') {
                                          setPromoFormStartHour('');
                                          setPromoFormEndHour('');
                                        }
                                      }}
                                      options={[
                                        { label: 'Năm', value: 'year', icon: <CalendarOutlined /> },
                                        { label: 'Quý', value: 'quarter', icon: <AppstoreOutlined /> },
                                        { label: 'Tháng', value: 'month', icon: <CalendarOutlined /> },
                                        { label: 'Ngày', value: 'day', icon: <CalendarOutlined /> },
                                        { label: 'Giờ', value: 'hour', icon: <ClockCircleOutlined /> }
                                      ]}
                                      block
                                    />
                                  </div>

                                  {/* LEVEL 1: NĂM (YEAR) - ALWAYS SHOWN */}
                                  <div style={{ background: '#f6ffed', padding: 12, borderRadius: 8, border: '1px solid #b7eb8f' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                      <CalendarOutlined style={{ fontSize: 16, color: '#389e0d' }} />
                                      <strong style={{ fontSize: 13, color: '#276c0a' }}>Cấp độ 1: Chọn Năm áp dụng (Bắt buộc)</strong>
                                    </div>
                                    <Form.Item 
                                      validateStatus={validationErrors.promoFormSelectedYears ? 'error' : ''}
                                      help={validationErrors.promoFormSelectedYears ? 'Vui lòng chọn ít nhất một năm áp dụng' : ''}
                                      style={{ marginBottom: 0 }}
                                    >
                                      <Select
                                        mode="multiple"
                                        placeholder="Chọn các năm áp dụng (mặc định: 2026)"
                                        value={promoFormSelectedYears}
                                        onChange={(values) => {
                                          setPromoFormSelectedYears(values);
                                          if (values.length === 0) {
                                            setPromoFormSelectedQuarters([]);
                                            setPromoFormSelectedMonths([]);
                                            setPromoFormSelectedDays([]);
                                            setPromoFormSelectedWeekdays([]);
                                          } else {
                                            if (validationErrors.promoFormSelectedYears) {
                                              setValidationErrors(prev => ({ ...prev, promoFormSelectedYears: false }));
                                            }
                                          }
                                        }}
                                        options={[
                                          { label: 'Năm 2025', value: 2025 },
                                          { label: 'Năm 2026', value: 2026 },
                                          { label: 'Năm 2027', value: 2027 },
                                          { label: 'Năm 2028', value: 2028 }
                                        ]}
                                        style={{ width: '100%' }}
                                      />
                                    </Form.Item>
                                  </div>

                                  {/* LEVEL 2: QUÝ (QUARTER) */}
                                  {['quarter', 'month', 'day', 'hour'].includes(timeCascadeLevel) && promoFormSelectedYears.length > 0 && (
                                    <>
                                      <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
                                        <ArrowDownOutlined style={{ fontSize: 16, color: '#096dd9', opacity: 0.7 }} />
                                      </div>
                                      <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 8, border: '1px solid #91d5ff' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                          <AppstoreOutlined style={{ fontSize: 16, color: '#096dd9' }} />
                                          <strong style={{ fontSize: 13, color: '#0050b3' }}>Cấp độ 2: Chọn Quý áp dụng</strong>
                                        </div>
                                        <Select
                                          mode="multiple"
                                          placeholder="Chọn các quý áp dụng (Nếu bỏ trống, áp dụng cho cả năm)"
                                          value={promoFormSelectedQuarters}
                                          onChange={(values) => {
                                            setPromoFormSelectedQuarters(values);
                                            if (values.length === 0) {
                                              setPromoFormSelectedMonths([]);
                                              setPromoFormSelectedDays([]);
                                              setPromoFormSelectedWeekdays([]);
                                            } else {
                                              let autoMonths: number[] = [];
                                              if (values.includes('Q1')) autoMonths.push(1, 2, 3);
                                              if (values.includes('Q2')) autoMonths.push(4, 5, 6);
                                              if (values.includes('Q3')) autoMonths.push(7, 8, 9);
                                              if (values.includes('Q4')) autoMonths.push(10, 11, 12);
                                              setPromoFormSelectedMonths(autoMonths);
                                            }
                                          }}
                                          options={[
                                            { label: 'Quý 1 (Tháng 1 - Tháng 3)', value: 'Q1' },
                                            { label: 'Quý 2 (Tháng 4 - Tháng 6)', value: 'Q2' },
                                            { label: 'Quý 3 (Tháng 7 - Tháng 9)', value: 'Q3' },
                                            { label: 'Quý 4 (Tháng 10 - Tháng 12)', value: 'Q4' }
                                          ]}
                                          style={{ width: '100%' }}
                                        />
                                      </div>
                                    </>
                                  )}

                                  {/* LEVEL 3: THÁNG (MONTH) */}
                                  {['month', 'day', 'hour'].includes(timeCascadeLevel) && promoFormSelectedYears.length > 0 && (
                                    <>
                                      <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
                                        <ArrowDownOutlined style={{ fontSize: 16, color: '#722ed1', opacity: 0.7 }} />
                                      </div>
                                      <div style={{ background: '#f9f0ff', padding: 12, borderRadius: 8, border: '1px solid #d3adf7' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                          <CalendarOutlined style={{ fontSize: 16, color: '#531dab' }} />
                                          <strong style={{ fontSize: 13, color: '#391085' }}>Cấp độ 3: Chọn Tháng áp dụng</strong>
                                        </div>
                                        <Select
                                          mode="multiple"
                                          placeholder="Chọn các tháng áp dụng"
                                          value={promoFormSelectedMonths}
                                          onChange={(values) => {
                                            setPromoFormSelectedMonths(values);
                                            if (values.length === 0) {
                                              setPromoFormSelectedDays([]);
                                              setPromoFormSelectedWeekdays([]);
                                            }
                                          }}
                                          options={Array.from({ length: 12 }, (_, i) => {
                                            const m = i + 1;
                                            let group = 'Q1';
                                            if (m >= 4 && m <= 6) group = 'Q2';
                                            else if (m >= 7 && m <= 9) group = 'Q3';
                                            else if (m >= 10 && m <= 12) group = 'Q4';
                                            return {
                                              label: `Tháng ${m} (${group})`,
                                              value: m,
                                              disabled: promoFormSelectedQuarters.length > 0 && !promoFormSelectedQuarters.includes(group)
                                            };
                                          })}
                                          style={{ width: '100%' }}
                                        />
                                      </div>
                                    </>
                                  )}

                                  {/* LEVEL 4: NGÀY (DAY) */}
                                  {['day', 'hour'].includes(timeCascadeLevel) && promoFormSelectedYears.length > 0 && (
                                    <>
                                      <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
                                        <ArrowDownOutlined style={{ fontSize: 16, color: '#fa8c16', opacity: 0.7 }} />
                                      </div>
                                      <div style={{ background: '#fff7e6', padding: 12, borderRadius: 8, border: '1px solid #ffd591' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                          <CalendarOutlined style={{ fontSize: 16, color: '#d46b08' }} />
                                          <strong style={{ fontSize: 13, color: '#873800' }}>Cấp độ 4: Chọn Ngày áp dụng (Ngày trong tháng hoặc Thứ trong tuần)</strong>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                          {/* Days of Month */}
                                          <div>
                                            <div style={{ fontSize: 11, color: '#595959', marginBottom: 6, fontWeight: '500' }}>
                                              📆 Chọn ngày trong tháng (1 - 31):
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, maxWidth: 280, background: '#ffffff', padding: 6, borderRadius: 6, border: '1px solid #f0f0f0' }}>
                                              {Array.from({ length: 31 }, (_, i) => {
                                                const day = i + 1;
                                                const isSelected = promoFormSelectedDays.includes(day);
                                                return (
                                                  <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => {
                                                      if (isSelected) {
                                                        setPromoFormSelectedDays(promoFormSelectedDays.filter(d => d !== day));
                                                      } else {
                                                        setPromoFormSelectedDays([...promoFormSelectedDays, day]);
                                                      }
                                                    }}
                                                    style={{
                                                      border: 'none',
                                                      borderRadius: '50%',
                                                      width: 30,
                                                      height: 30,
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      fontSize: 11,
                                                      fontWeight: isSelected ? 'bold' : 'normal',
                                                      backgroundColor: isSelected ? '#fa8c16' : '#f5f5f5',
                                                      color: isSelected ? '#ffffff' : '#262626',
                                                      cursor: 'pointer',
                                                      transition: 'all 0.15s ease'
                                                    }}
                                                  >
                                                    {day}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                              <Button size="small" type="dashed" onClick={() => setPromoFormSelectedDays(Array.from({ length: 31 }, (_, i) => i + 1))}>Chọn tất cả</Button>
                                              <Button size="small" type="dashed" onClick={() => setPromoFormSelectedDays([])}>Bỏ chọn hết</Button>
                                            </div>
                                          </div>

                                          {/* Days of Week */}
                                          <div style={{ borderTop: '1px dashed #ffd591', paddingTop: 8 }}>
                                            <div style={{ fontSize: 11, color: '#595959', marginBottom: 6, fontWeight: '500' }}>
                                              🔄 Chọn theo Thứ trong tuần (Áp dụng đồng thời):
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                              {[
                                                { label: 'T2', value: 'Mon' },
                                                { label: 'T3', value: 'Tue' },
                                                { label: 'T4', value: 'Wed' },
                                                { label: 'T5', value: 'Thu' },
                                                { label: 'T6', value: 'Fri' },
                                                { label: 'T7', value: 'Sat' },
                                                { label: 'CN', value: 'Sun' }
                                              ].map(item => {
                                                const isSelected = promoFormSelectedWeekdays.includes(item.value);
                                                return (
                                                  <Button
                                                    key={item.value}
                                                    size="small"
                                                    type={isSelected ? 'primary' : 'default'}
                                                    onClick={() => {
                                                      if (isSelected) {
                                                        setPromoFormSelectedWeekdays(promoFormSelectedWeekdays.filter(w => w !== item.value));
                                                      } else {
                                                        setPromoFormSelectedWeekdays([...promoFormSelectedWeekdays, item.value]);
                                                      }
                                                    }}
                                                    style={{
                                                      borderRadius: 4,
                                                      backgroundColor: isSelected ? '#fa8c16' : undefined,
                                                      borderColor: isSelected ? '#fa8c16' : undefined,
                                                      color: isSelected ? '#ffffff' : undefined
                                                    }}
                                                  >
                                                    {item.label}
                                                  </Button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {/* LEVEL 5: GIỜ VÀNG (HOUR) */}
                                  {timeCascadeLevel === 'hour' && promoFormSelectedYears.length > 0 && (
                                    <>
                                      <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
                                        <ArrowDownOutlined style={{ fontSize: 16, color: '#eb2f96', opacity: 0.7 }} />
                                      </div>
                                      <div style={{ background: '#fff0f6', padding: 12, borderRadius: 8, border: '1px solid #ffadd2' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                          <ClockCircleOutlined style={{ fontSize: 16, color: '#eb2f96' }} />
                                          <strong style={{ fontSize: 13, color: '#c41d7f' }}>Cấp độ 5: Chọn Giờ áp dụng trong ngày</strong>
                                        </div>
                                        <Row gutter={8}>
                                          <Col span={12}>
                                            <Form.Item label="Giờ bắt đầu áp dụng:" style={{ marginBottom: 0 }}>
                                              <TimePicker
                                                value={promoFormStartHour ? dayjs(promoFormStartHour, 'HH:mm') : null}
                                                onChange={(time, timeString) => setPromoFormStartHour(timeString as string)}
                                                format="HH:mm"
                                                style={{ width: '100%' }}
                                                placeholder="Bắt đầu"
                                              />
                                            </Form.Item>
                                          </Col>
                                          <Col span={12}>
                                            <Form.Item label="Giờ kết thúc áp dụng:" style={{ marginBottom: 0 }}>
                                              <TimePicker
                                                value={promoFormEndHour ? dayjs(promoFormEndHour, 'HH:mm') : null}
                                                onChange={(time, timeString) => setPromoFormEndHour(timeString as string)}
                                                format="HH:mm"
                                                style={{ width: '100%' }}
                                                placeholder="Kết thúc"
                                              />
                                            </Form.Item>
                                          </Col>
                                        </Row>
                                      </div>
                                    </>
                                  )}

                                </div>
                              )}

                              {/* RECURRING CYCLE */}
                              <div style={{ marginTop: 14, padding: 12, background: '#fff7e6', borderRadius: 8, border: '1px solid #ffd591' }}>
                                <Checkbox 
                                  checked={promoFormIsRecurring} 
                                  onChange={(e) => setPromoFormIsRecurring(e.target.checked)}
                                  style={{ fontWeight: 'bold', color: '#d46b08' }}
                                >
                                  Kích hoạt Lặp lại tuần hoàn (Recurrence)
                                </Checkbox>
                                
                                {promoFormIsRecurring && (
                                  <div style={{ marginTop: 10 }}>
                                    <span style={{ fontSize: 11, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>
                                      Chu kỳ lặp tuần hoàn (Sẽ tự động hiển thị lặp lại khi tới chu kỳ tương ứng):
                                    </span>
                                    <Select
                                      value={promoFormRecurringType}
                                      onChange={(v) => setPromoFormRecurringType(v)}
                                      options={[
                                        { label: '🔄 Lặp lại hàng năm (Chạy cùng Quý/Tháng mỗi năm kế tiếp)', value: 'yearly' },
                                        { label: '🔄 Lặp lại hàng quý (Chạy cùng các Tháng của từng quý kế tiếp)', value: 'quarterly' },
                                        { label: '🔄 Lặp lại hàng tháng (Chạy lặp lại định kỳ mỗi tháng kế tiếp)', value: 'monthly' },
                                        { label: '🔄 Lặp lại hàng ngày (Chạy lặp lại theo ngày trong tuần hoặc ngày trong tháng)', value: 'daily' }
                                      ]}
                                      style={{ width: '100%' }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Card>

                        {/* CARD D: 👥 TRIỂN KHAI & GIÁM SÁT */}
                        <Card 
                          title={
                            <div 
                              onClick={() => setCollapsedCards(prev => ({ ...prev, step2_4: !prev.step2_4 }))}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', width: '100%' }}
                            >
                              <Space>
                                <span style={{ color: '#1677ff', fontWeight: 'bold' }}>👥 Bước 2.4: Triển khai & Giám sát liên thông</span>
                                {validationErrors.promoFormRelatedDeps ? (
                                  <Tag color="error" style={{ fontSize: 9, fontWeight: 'bold' }}>⚠️ THIẾU PHÒNG BAN</Tag>
                                ) : (
                                  (promoFormRelatedDeps && promoFormRelatedDeps.length > 0) ? (
                                    <Tag color="success" style={{ fontSize: 9 }}>✓ Đã hoàn tất</Tag>
                                  ) : (
                                    <Tag color="warning" style={{ fontSize: 9 }}>Yêu cầu</Tag>
                                  )
                                )}
                              </Space>
                              <Button 
                                type="text" 
                                size="small" 
                                icon={collapsedCards.step2_4 ? <DownOutlined style={{ fontSize: 14 }} /> : <UpOutlined style={{ fontSize: 14 }} />} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCollapsedCards(prev => ({ ...prev, step2_4: !prev.step2_4 }));
                                }} 
                              />
                            </div>
                          }
                          className={shakeStep2_4 ? 'shake-card-error' : ''}
                          variant="outlined"
                          style={{ 
                            marginBottom: 16, 
                            borderRadius: 8, 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                            borderColor: validationErrors.promoFormRelatedDeps ? '#ff4d4f' : '#e8e8e8',
                            transition: 'all 0.3s'
                          }}
                        >
                          {!collapsedCards.step2_4 && (
                            <div>
                              <Form.Item 
                                label="Các Phòng ban liên quan triển khai & giám sát:" 
                                required
                                validateStatus={validationErrors.promoFormRelatedDeps ? 'error' : ''}
                                help={validationErrors.promoFormRelatedDeps ? 'Vui lòng chọn ít nhất một phòng ban triển khai' : ''}
                                style={{ marginBottom: 0 }}
                              >
                                <Checkbox.Group 
                                  value={promoFormRelatedDeps} 
                                  onChange={(checkedValues) => {
                                    setPromoFormRelatedDeps(checkedValues as string[]);
                                    if (checkedValues.length > 0 && validationErrors.promoFormRelatedDeps) {
                                      setValidationErrors(prev => ({ ...prev, promoFormRelatedDeps: false }));
                                    }
                                  }}
                                  options={[
                                    { label: 'Marketing (MTK)', value: 'Marketing' },
                                    { label: 'IT Kỹ Thuật (Sản Phẩm)', value: 'IT Kỹ Thuật' },
                                    { label: 'Phòng Kế Toán', value: 'Phòng Kế Toán' },
                                    { label: 'Ban Giám Đốc', value: 'Ban Giám Đốc' },
                                    { label: 'Hội Đồng Quản Trị', value: 'Hội Đồng Quản Trị' }
                                  ]}
                                />
                              </Form.Item>
                            </div>
                          )}
                        </Card>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                          {userRole === 'mtk' ? (
                            <>
                              <Button 
                                onClick={() => {
                                  handleResetWizard();
                                  setMainActiveTab('promo_list');
                                }}
                              >
                                Hủy bỏ & Quay lại danh sách
                              </Button>
                              <Button 
                                type="primary" 
                                onClick={handleWizardSubmit}
                                style={{ background: '#52c41a', borderColor: '#52c41a', fontWeight: 'bold' }}
                                icon={<CheckCircle2 size={15} />}
                              >
                                {editingPromoId ? 'Lưu & Cập Nhật Luật Ưu Đãi' : 'Kích Hoạt & Lưu Luật Ưu Đãi'}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => setCurrentStep(0)}>← Bước 1</Button>
                              <Button 
                                type="primary" 
                                onClick={() => {
                                  if (validateStep2()) {
                                    setCurrentStep(2);
                                  }
                                }}
                                style={{ background: '#fa541c', borderColor: '#fa541c' }}
                              >
                                Tiếp tục: Diện mạo (Bước 3) →
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 3: VISUAL DESIGN PRESET & LIVE PREVIEW */}
                    {currentStep === 2 && (
                      <div style={{ minHeight: '260px' }}>
                        <div style={{ marginBottom: 16, background: '#f9f0ff', padding: '10px 14px', borderRadius: 8, border: '1px solid #d3adf7' }}>
                          <strong style={{ color: '#531dab', display: 'block', fontSize: 12 }}>🎨 PHỐI HỢP LIÊN BỘ PHẬN (MTK & IT):</strong>
                          <span style={{ fontSize: 11, color: '#391085' }}>Bộ phận MTK đề xuất bảng màu visual; Bộ phận IT nghiệm thu hiển thị để đồng bộ nút phím tắt tối ưu trên UI bán hàng.</span>
                        </div>

                        <Alert 
                          message="Bước 3: Chọn biểu mẫu visual bọc ngoài hiển thị POS" 
                          type="info" 
                          showIcon 
                          style={{ marginBottom: 12 }}
                        />

                        <Form.Item label="Lựa chọn bảng biểu màu sắc diện mạo (Rê chuột xem tên đầy đủ):" required style={{ marginBottom: 12 }}>
                          <Select 
                            showSearch
                            optionFilterProp="label"
                            value={promoFormPresetId} 
                            onChange={(val) => setPromoFormPresetId(val)}
                            placeholder="Tìm kiếm mẫu diện mạo..."
                          >
                            {visualPresets.map(p => {
                              const optText = `${p.name} (${p.icon})`;
                              return (
                                <Select.Option key={p.id} value={p.id} label={optText} title={optText}>🎨 {p.name} ({p.icon})</Select.Option>
                              );
                            })}
                          </Select>
                        </Form.Item>

                        {/* LIVE PREVIEW OF CARD IN OPERATOR CONSOLE */}
                        <div style={{ margin: '14px 0', border: '1px solid #ddd', borderRadius: 10, padding: 14, background: '#fafafa' }}>
                          <Text strong style={{ fontSize: 11, display: 'block', marginBottom: 8, color: '#8c8c8c' }}>XEM TRƯỚC SỰ KIỆN NÚT/CARD TẠI POS CONSOLE:</Text>
                          
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            {(() => {
                              const activePr = visualPresets.find(p => p.id === promoFormPresetId) || visualPresets[0];
                              if (!activePr) return <span>Không tìm thấy biểu mẫu diện mạo</span>;
                              return (
                                <div 
                                  style={{ 
                                    background: activePr.background, 
                                    border: activePr.border, 
                                    color: activePr.color, 
                                    padding: '16px 20px', 
                                    borderRadius: 10, 
                                    width: '280px',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    transition: 'transform 0.2s'
                                  }}
                                >
                                  <div style={{ padding: 8, background: '#fff', borderRadius: '50%' }}>
                                    {renderIconWithColor(activePr.icon, 20, activePr.color)}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <strong style={{ fontSize: 13, display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                      {promoFormTitle || 'ƯU ĐÃI CHƯA ĐẶT TÊN'}
                                    </strong>
                                    <span style={{ fontSize: 10, display: 'block', opacity: 0.8, marginTop: 2 }}>
                                      {promoFormScope === 'bill' 
                                        ? (promoFormValueType === 'rate' ? `Giảm ${promoFormValue * 100}% hóa đơn` : `Trực tiếp -${promoFormValue.toLocaleString()} đ`)
                                        : `Dòng sản phẩm -${promoFormValueType === 'rate' ? (promoFormValue * 100) + '%' : promoFormValue}`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                          {userRole === 'it' ? (
                            <>
                              <Button onClick={() => setCurrentStep(0)}>← Quay lại: Vị trí (Bước 1)</Button>
                              <Button 
                                type="primary" 
                                onClick={handleWizardSubmit} 
                                style={{ background: '#1890ff', borderColor: '#1890ff', fontWeight: 'bold' }}
                                icon={<CheckCircle2 size={15} />}
                              >
                                {editingPromoId ? 'Hoàn Tất & Lưu Phím Bấm POS' : 'Setup Phím Bấm POS Mới'}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => setCurrentStep(1)}>← Bước 2</Button>
                              <Button 
                                type="primary" 
                                onClick={handleWizardSubmit} 
                                style={{ background: '#52c41a', borderColor: '#52c41a', fontWeight: 'bold' }}
                                icon={<CheckCircle2 size={15} />}
                              >
                                {editingPromoId ? 'Cập Nhật Toàn Diện' : 'Kích Hoạt Chiến Dịch Toàn Diện'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                  </Form>
                </Card>
              </div>
            )
          },
          {
            key: "preset_mgr",
            label: (
              <span className="font-bold" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                🎨 Thư Viện Diện Mạo ({visualPresets.length})
              </span>
            ),
            children: (
              <div style={{ padding: '8px 0' }}>
                <Card size="small" style={{ borderRadius: 8 }}>
                  <Row gutter={24}>
                    <Col span={10}>
                      <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #eee' }}>
                        <strong style={{ fontSize: 13, display: 'block', color: '#1677ff', marginBottom: 12 }}>
                          {editingPresetId ? '✏️ CHỈNH SỬA BIỂU MẪU DIỆN MẠO' : '➕ THÊM BIỂU MẪU DIỆN MẠO MỚI'}
                        </strong>
                        
                        <Form layout="vertical" size="small">
                          <Form.Item label="Tên Mẫu Biểu:" required style={{ marginBottom: 12 }}>
                            <Input 
                              value={presetFormName} 
                              placeholder="Ví dụ: Đỏ Chói Flash Sale" 
                              onChange={(e) => setPresetFormName(e.target.value)} 
                            />
                          </Form.Item>

                          <Form.Item label="Chọn biểu tượng Icon:" required style={{ marginBottom: 12 }}>
                            <Select 
                              showSearch
                              optionFilterProp="label"
                              value={presetFormIcon} 
                              onChange={(val) => setPresetFormIcon(val)}
                              placeholder="Chọn icon..."
                            >
                              {[
                                'Gift', 'Zap', 'Sparkles', 'Award', 'Tags', 'Laptop', 'Tv', 'PartyPopper', 
                                'ShoppingCart', 'Users', 'Percent', 'Briefcase', 'ShieldCheck',
                                'Heart', 'Star', 'Bell', 'ShieldAlert', 'Shield', 'Check', 'X', 'Info', 'Calendar', 'Clock',
                                'A', 'B', 'C', '1', '2', '3'
                              ].map(ic => (
                                <Select.Option key={ic} value={ic} label={ic} title={ic}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {renderIconWithColor(ic, 14, '#333')} <span>{ic}</span>
                                  </div>
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <Form.Item label="Màu nền (Background Hex):" required style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Input 
                                type="color" 
                                style={{ width: 44, height: 32, padding: 2 }} 
                                value={presetFormBg.startsWith('#') && presetFormBg.length === 7 ? presetFormBg : '#ffffff'} 
                                onChange={(e) => setPresetFormBg(e.target.value)} 
                              />
                              <Input value={presetFormBg} onChange={(e) => setPresetFormBg(e.target.value)} />
                            </div>
                          </Form.Item>

                          <Form.Item label="Màu chữ (Text Color Hex):" required style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Input 
                                type="color" 
                                style={{ width: 44, height: 32, padding: 2 }} 
                                value={presetFormColor.startsWith('#') && presetFormColor.length === 7 ? presetFormColor : '#000000'} 
                                onChange={(e) => setPresetFormColor(e.target.value)} 
                              />
                              <Input value={presetFormColor} onChange={(e) => setPresetFormColor(e.target.value)} />
                            </div>
                          </Form.Item>

                          <Form.Item label="Mã viền (Border CSS):" required style={{ marginBottom: 16 }}>
                            <Input 
                              value={presetFormBorder} 
                              placeholder="1px solid #ffadd2"
                              onChange={(e) => setPresetFormBorder(e.target.value)} 
                            />
                          </Form.Item>

                          <div style={{ textAlign: 'right' }}>
                            <Space>
                              {editingPresetId && (
                                <Button size="small" onClick={() => {
                                  setEditingPresetId(null);
                                  setPresetFormName('');
                                }}>Hủy</Button>
                              )}
                              <Button type="primary" size="small" onClick={handleSavePreset} style={{ background: '#52c41a', border: 'none', padding: '0 16px' }}>
                                Lưu mẫu diện mạo
                              </Button>
                            </Space>
                          </div>
                        </Form>
                      </div>
                    </Col>

                    <Col span={14}>
                      <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 12, color: '#595959' }}>
                        DANH SÁCH BẢNG PHỐI MÀU HIỆN TẠI TRONG THƯ VIỆN:
                      </Text>

                      <Table 
                        dataSource={visualPresets}
                        rowKey="id"
                        size="small"
                        pagination={{ pageSize: 6 }}
                        columns={[
                          {
                            title: 'Tên mẫu',
                            dataIndex: 'name',
                            key: 'n_name',
                            render: (val) => <strong style={{ fontSize: 12 }}>{val}</strong>
                          },
                          {
                            title: 'Mẫu thể hiện',
                            key: 'tag_look',
                            render: (it) => (
                              <div style={{ 
                                background: it.background, 
                                border: it.border, 
                                color: it.color, 
                                padding: '4px 10px', 
                                borderRadius: 6, 
                                fontSize: 11,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontWeight: 'bold'
                              }}>
                                {renderIconWithColor(it.icon, 12, it.color)}
                                <span>Ví dụ giao diện</span>
                              </div>
                            )
                          },
                          {
                            title: 'Hành động',
                            key: 'action_presets',
                            render: (it) => (
                              <Space size="middle">
                                <Button type="link" size="small" style={{ padding: 0 }} onClick={() => handleEditPreset(it)}>Sửa</Button>
                                <Button type="link" danger size="small" style={{ padding: 0 }} onClick={() => handleDeletePreset(it.id)}>Xóa</Button>
                              </Space>
                            )
                          }
                        ]}
                      />
                    </Col>
                  </Row>
                </Card>
              </div>
            )
          },
          {
            key: "promo_details",
            label: (
              <span className="font-bold" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                📁 Chi Tiết Hồ Sơ Ưu Đãi
              </span>
            ),
            children: (
              <div style={{ padding: '8px 0' }}>
                {selectedDetailPromo ? (
                  <div>
                    <Card 
                      style={{ borderRadius: 12, border: '1px solid #d9d9d9', overflow: 'hidden' }}
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <Button 
                              icon={<ArrowLeftOutlined />} 
                              onClick={() => setMainActiveTab('promo_list')}
                              size="small"
                            >
                              Trở lại danh sách
                            </Button>
                            <strong style={{ color: '#1677ff' }}>HỒ SƠ KHUYẾN MÃI CHI TIẾT: {selectedDetailPromo.name}</strong>
                          </Space>
                          <Space>
                            <Button 
                              type="primary" 
                              icon={<PrinterOutlined />} 
                              style={{ background: '#fa541c', borderColor: '#fa541c' }}
                              onClick={() => handlePrintMemo(selectedDetailPromo)}
                            >
                              In quyết định (PDF)
                            </Button>
                            <Button 
                              icon={<ReloadOutlined />} 
                              onClick={() => {
                                setPromoToExtend(selectedDetailPromo);
                                setExtendNewEndDate(selectedDetailPromo.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                                setShowExtendModal(true);
                              }}
                            >
                              Gia hạn đợt này
                            </Button>
                          </Space>
                        </div>
                      }
                    >
                      {/* TABLE DETAIL CLOESED BORDER */}
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #333', fontSize: 13, marginBottom: 24 }}>
                        <thead>
                          <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #333' }}>
                            <th style={{ border: '1px solid #333', padding: '10px 12px', textAlign: 'left', width: '30%', fontWeight: 'bold' }}>Hạng mục thông tin</th>
                            <th style={{ border: '1px solid #333', padding: '10px 12px', textAlign: 'left', fontWeight: 'bold' }}>Nội dung chi tiết chương trình ưu đãi</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', background: '#fafafa' }}>Tên chương trình ưu đãi:</td>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', color: '#1677ff', fontSize: 14 }}>{selectedDetailPromo.name || selectedDetailPromo.title}</td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', background: '#fafafa' }}>Mã hiệu (ID):</td>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontFamily: 'monospace', fontWeight: 'bold' }}>{selectedDetailPromo.id}</td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', background: '#fafafa' }}>Ngày tạo hành chính:</td>
                            <td style={{ border: '1px solid #333', padding: '8px 12px' }}>{selectedDetailPromo.createdAt || '28/06/2026'}</td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', background: '#fafafa' }}>Phòng ban liên quan:</td>
                            <td style={{ border: '1px solid #333', padding: '8px 12px' }}>
                              <Space size={6}>
                                {(selectedDetailPromo.relatedDeps || ['Marketing', 'IT Kỹ Thuật', 'Phòng Kế Toán']).map((dep: string) => (
                                  <Tag key={dep} color="blue" style={{ fontWeight: '500' }}>{dep}</Tag>
                                ))}
                              </Space>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', background: '#fafafa' }}>Mục tiêu chiến dịch (KPI):</td>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontStyle: 'italic', color: '#555' }}>
                              {selectedDetailPromo.goal || 'Tăng trưởng doanh số ngành hàng ăn uống, tối ưu hóa điểm chạm giỏ hàng POS.'}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', background: '#fafafa' }}>Loại hình & Phạm vi:</td>
                            <td style={{ border: '1px solid #333', padding: '8px 12px' }}>
                              <Tag color={selectedDetailPromo.scope === 'bill' ? 'cyan' : 'geekblue'} style={{ fontWeight: 'bold' }}>
                                {selectedDetailPromo.scope === 'bill' ? 'HOÁ ĐƠN (ALL BILL)' : 'MÓN ĂN LẺ (ITEM RANGE)'}
                              </Tag>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', background: '#fafafa' }}>Mức chiết khấu giảm giá:</td>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', color: '#f5222d', fontSize: 14 }}>
                              {selectedDetailPromo.isRate ? `Giảm ${selectedDetailPromo.value * 100}% tổng Bill` : `Trừ thẳng -${selectedDetailPromo.value.toLocaleString()} đ`}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', background: '#fafafa' }}>Điều kiện kích hoạt (Min):</td>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: '600' }}>
                              {selectedDetailPromo.threshold ? `Tổng hóa đơn từ ${selectedDetailPromo.threshold.toLocaleString()} đ trở lên` : 'Không giới hạn giá trị tối thiểu (Áp dụng tự do)'}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', background: '#fafafa' }}>Loại trừ chéo (Conflict list):</td>
                            <td style={{ border: '1px solid #333', padding: '8px 12px' }}>
                              {selectedDetailPromo.excludePromoKeys && selectedDetailPromo.excludePromoKeys.length > 0 ? (
                                <Space wrap>
                                  {selectedDetailPromo.excludePromoKeys.map((ex: string) => (
                                    <Tag color="red" key={ex} style={{ fontSize: 11 }}>Chặn dùng chung với: {ex}</Tag>
                                  ))}
                                </Space>
                              ) : (
                                <span style={{ color: '#8c8c8c' }}>Không có chính sách loại trừ (Có thể tích lũy đồng thời)</span>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', background: '#fafafa' }}>Khung thời gian chi tiết:</td>
                            <td style={{ border: '1px solid #333', padding: '8px 12px' }}>
                              {selectedDetailPromo.timeType === 'detailed' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <div>📅 Ngày hiệu lực: <strong style={{ color: '#52c41a' }}>{selectedDetailPromo.startDate || 'Bắt đầu ngay'}</strong> đến ngày <strong style={{ color: '#f5222d' }}>{selectedDetailPromo.endDate || 'Hết hạn'}</strong></div>
                                  {(selectedDetailPromo.startHour || selectedDetailPromo.endHour) && (
                                    <div>⏰ Giờ vàng áp dụng: <strong>{selectedDetailPromo.startHour || '00:00'}</strong> - <strong>{selectedDetailPromo.endHour || '23:59'}</strong></div>
                                  )}
                                  {selectedDetailPromo.selectedMonths && selectedDetailPromo.selectedMonths.length > 0 && (
                                    <div>📆 Chỉ áp dụng trong: <strong>Tháng {selectedDetailPromo.selectedMonths.join(', ')}</strong></div>
                                  )}
                                  {selectedDetailPromo.selectedQuarters && selectedDetailPromo.selectedQuarters.length > 0 && (
                                    <div>🏆 Chỉ áp dụng trong: <strong>Quý {selectedDetailPromo.selectedQuarters.join(', ')}</strong></div>
                                  )}
                                </div>
                              ) : (
                                <Tag color="green" style={{ fontWeight: 'bold' }}>♾️ Vô thời hạn - Luôn luôn hoạt động trên POS</Tag>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', background: '#fafafa' }}>Trạng thái hoạt động POS:</td>
                            <td style={{ border: '1px solid #333', padding: '8px 12px' }}>
                              {isPromoExpired(selectedDetailPromo) ? (
                                <Badge status="error" text={<strong style={{ color: '#ff4d4f' }}>ĐÃ HẾT HẠN - Hệ thống POS tự động khóa phím bấm</strong>} />
                              ) : (
                                <Badge status="success" text={<strong style={{ color: '#52c41a' }}>ĐANG HOẠT ĐỘNG - Đã phát hành và gán nút trên POS</strong>} />
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', fontWeight: 'bold', background: '#fafafa' }}>Ghi chú hành chính nội bộ:</td>
                            <td style={{ border: '1px solid #333', padding: '8px 12px', color: '#595959' }}>{selectedDetailPromo.description || 'Không có ghi chú thêm.'}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* SƠ ĐỒ LIÊN THÔNG ĐẶT DƯỚI NÀY THEO YÊU CẦU */}
                      <div style={{ marginTop: 24, borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div>
                            <strong style={{ color: '#fa541c', fontSize: 13 }}>⚡ SƠ ĐỒ LIÊN THÔNG QUY TRÌNH CHƯƠNG TRÌNH KHUYẾN MÃI NÀY:</strong>
                            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>Biểu đồ thể hiện cách chính sách này kết nối xuyên suốt các quầy POS</div>
                          </div>
                          <Button 
                            type="primary" 
                            size="small" 
                            onClick={handleTriggerFlowAnimation}
                            disabled={isFlowAnimating}
                            style={{ background: '#fa541c', borderColor: '#fa541c' }}
                          >
                            {isFlowAnimating ? 'Đang kích điện...' : 'Kích điện chạy thử luồng'}
                          </Button>
                        </div>

                        {/* Interactive flow inside detail view */}
                        <div style={{ position: 'relative', height: 130, width: '100%', margin: '16px 0 8px 0', overflowX: 'auto', overflowY: 'hidden', border: '1px solid #f0f0f0', background: '#fafafa', borderRadius: 8 }}>
                          {/* Sơ đồ giống y chang ngoài nhưng đặt dưới nội dung bảng */}
                          <svg 
                            style={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              width: '100%', 
                              height: '100%', 
                              pointerEvents: 'none',
                              minWidth: 800 
                            }}
                            viewBox="0 0 1000 120"
                            preserveAspectRatio="none"
                          >
                            {/* Lines */}
                            <path d="M 80 60 Q 180 20 280 60" fill="none" stroke={activeFlowStep >= 1 ? "#fa541c" : "#e8e8e8"} strokeWidth={activeFlowStep >= 1 ? "4" : "2"} />
                            <path d="M 280 60 Q 380 90 480 60" fill="none" stroke={activeFlowStep >= 2 ? "#fa541c" : "#e8e8e8"} strokeWidth={activeFlowStep >= 2 ? "4" : "2"} />
                            <path d="M 480 60 Q 580 20 680 60" fill="none" stroke={activeFlowStep >= 3 ? "#fa541c" : "#e8e8e8"} strokeWidth={activeFlowStep >= 3 ? "4" : "2"} />
                            <path d="M 680 60 Q 780 90 880 60" fill="none" stroke={activeFlowStep >= 4 ? "#fa541c" : "#e8e8e8"} strokeWidth={activeFlowStep >= 4 ? "4" : "2"} />

                            {/* Flow dots animate */}
                            {isFlowAnimating && activeFlowStep === 0 && <circle r="6" fill="#1890ff"><animateMotion dur="1.2s" repeatCount="indefinite" path="M 80 60 Q 180 20 280 60" /></circle>}
                            {isFlowAnimating && activeFlowStep === 1 && <circle r="6" fill="#52c41a"><animateMotion dur="1.2s" repeatCount="indefinite" path="M 280 60 Q 380 90 480 60" /></circle>}
                            {isFlowAnimating && activeFlowStep === 2 && <circle r="6" fill="#fa8c16"><animateMotion dur="1.2s" repeatCount="indefinite" path="M 480 60 Q 580 20 680 60" /></circle>}
                            {isFlowAnimating && activeFlowStep === 3 && <circle r="6" fill="#f5222d"><animateMotion dur="1.2s" repeatCount="indefinite" path="M 680 60 Q 780 90 880 60" /></circle>}
                          </svg>

                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', minWidth: 800, position: 'relative', zIndex: 1, marginTop: 10 }}>
                            {/* Step 1: MTK Rule */}
                            <div style={{ textAlign: 'center', width: 140 }}>
                              <div style={{ width: 44, height: 44, background: activeFlowStep >= 0 ? '#fff2e8' : '#f5f5f5', border: activeFlowStep >= 0 ? '2px solid #fa541c' : '1px solid #d9d9d9', color: activeFlowStep >= 0 ? '#fa541c' : '#8c8c8c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', fontWeight: 'bold', fontSize: 16 }}>
                                ✍️
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 'bold' }}>Marketing (MTK)</div>
                              <div style={{ fontSize: 9, color: '#8c8c8c' }}>Thiết lập Luật & Min Bill</div>
                            </div>

                            {/* Step 2: Cây Folder */}
                            <div style={{ textAlign: 'center', width: 140 }}>
                              <div style={{ width: 44, height: 44, background: activeFlowStep >= 1 ? '#f6ffed' : '#f5f5f5', border: activeFlowStep >= 1 ? '2px solid #52c41a' : '1px solid #d9d9d9', color: activeFlowStep >= 1 ? '#52c41a' : '#8c8c8c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', fontWeight: 'bold', fontSize: 16 }}>
                                📁
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 'bold' }}>Phân định Folder</div>
                              <div style={{ fontSize: 9, color: '#8c8c8c' }}>Bố cục cây sơ đồ POS</div>
                            </div>

                            {/* Step 3: Thiết kế Nút */}
                            <div style={{ textAlign: 'center', width: 140 }}>
                              <div style={{ width: 44, height: 44, background: activeFlowStep >= 2 ? '#e6f7ff' : '#f5f5f5', border: activeFlowStep >= 2 ? '2px solid #1890ff' : '1px solid #d9d9d9', color: activeFlowStep >= 2 ? '#1890ff' : '#8c8c8c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', fontWeight: 'bold', fontSize: 16 }}>
                                🎨
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 'bold' }}>IT Diện mạo phím</div>
                              <div style={{ fontSize: 9, color: '#8c8c8c' }}>Gán Icon & Màu sắc</div>
                            </div>

                            {/* Step 4: Sync POS */}
                            <div style={{ textAlign: 'center', width: 140 }}>
                              <div style={{ width: 44, height: 44, background: activeFlowStep >= 3 ? '#fff7e6' : '#f5f5f5', border: activeFlowStep >= 3 ? '2px solid #fa8c16' : '1px solid #d9d9d9', color: activeFlowStep >= 3 ? '#fa8c16' : '#8c8c8c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', fontWeight: 'bold', fontSize: 16 }}>
                                ⚡
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 'bold' }}>Đồng bộ POS máy trạm</div>
                              <div style={{ fontSize: 9, color: '#8c8c8c' }}>Tự động đẩy về quầy</div>
                            </div>

                            {/* Step 5: Bấm áp dụng */}
                            <div style={{ textAlign: 'center', width: 140 }}>
                              <div style={{ width: 44, height: 44, background: activeFlowStep >= 4 ? '#feffe6' : '#f5f5f5', border: activeFlowStep >= 4 ? '2px solid #a0d911' : '1px solid #d9d9d9', color: activeFlowStep >= 4 ? '#a0d911' : '#8c8c8c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', fontWeight: 'bold', fontSize: 16 }}>
                                🛒
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 'bold' }}>Khách mua / Áp dụng</div>
                              <div style={{ fontSize: 9, color: '#8c8c8c' }}>Thu ngân Click nút</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Card style={{ textAlign: 'center', padding: '40px 0', borderRadius: 12 }}>
                    <BulbOutlined style={{ fontSize: 40, color: '#bfbfbf', marginBottom: 16 }} />
                    <div style={{ fontSize: 14, color: '#595959', fontWeight: '500' }}>Vui lòng chọn xem chi tiết một chương trình khuyến mãi ở danh sách để hiển thị hồ sơ!</div>
                    <Button type="primary" onClick={() => setMainActiveTab('promo_list')} style={{ marginTop: 16, borderRadius: 6 }}>
                      Xem danh sách ưu đãi
                    </Button>
                  </Card>
                )}
              </div>
            )
          },
          {
            key: "json_source",
            label: (
              <span className="font-bold" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                🔧 Cấu Trúc JSON Gốc
              </span>
            ),
            children: (
              <div style={{ padding: '8px 0' }}>
                <Card size="small" style={{ borderRadius: 8 }}>
                  <Alert 
                    message="Mục đồng bộ cây lồng ghép gốc"
                    description="Bạn có thể sao lưu, sao chép hoặc ghi đè toàn bộ cây lồng ghép Folder hoặc Actions này trực tiếp dưới dạng cấu trúc JSONB. Hệ thống sẽ tự động phẳng hóa khuyến mãi và cập nhật POS ngay tức khắc."
                    type="warning" 
                    showIcon 
                    style={{ marginBottom: 16 }}
                  />

                  <Input.TextArea 
                    rows={16}
                    value={menusJsonText}
                    onChange={(e) => setMenusJsonText(e.target.value)}
                    style={{ 
                      fontFamily: 'monospace', 
                      fontSize: 12, 
                      background: '#141414', 
                      color: '#fa8c16',
                      padding: 12,
                      borderRadius: 8 
                    }}
                  />

                  <div style={{ marginTop: 16, textAlign: 'right' }}>
                    <Button 
                      type="primary" 
                      onClick={handleSaveRawJson} 
                      style={{ background: '#fa541c', borderColor: '#fa541c', fontWeight: 'bold' }}
                      icon={<Settings size={14} />}
                    >
                      Đồng Bộ Ghi Đè Gốc
                    </Button>
                  </div>
                </Card>
              </div>
            )
          }
        ]}
      />

      {/* 1. CHI TIẾT TỜ TRÌNH CTKM (MEMO DETAIL MODAL) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
            <FileText size={20} style={{ color: '#1890ff' }} />
            <div>
              <Text strong style={{ fontSize: 15 }}>TỜ TRÌNH PHÊ DUYỆT CHI TIẾT CHƯƠNG TRÌNH KHUYẾN MÃI</Text>
              <div style={{ fontSize: 11, fontWeight: 'normal', color: '#8c8c8c' }}>
                Hồ sơ ban hành & Quy chuẩn thiết kế kỹ thuật nút bấm POS liên thông
              </div>
            </div>
          </div>
        }
        open={showPromoDetailsModal}
        onCancel={() => setShowPromoDetailsModal(false)}
        width={720}
        footer={[
          <Button key="close" onClick={() => setShowPromoDetailsModal(false)}>
            Đóng
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />} 
            onClick={() => {
              if (selectedDetailPromo) handlePrintMemo(selectedDetailPromo);
            }}
            style={{ background: '#fa541c', borderColor: '#fa541c' }}
          >
            In Quyết Định Memo (PDF)
          </Button>
        ]}
        styles={{ body: { padding: '20px 24px', maxHeight: '70vh', overflowY: 'auto' } }}
      >
        {selectedDetailPromo && (
          <div className="promo-memo-print-view" style={{ fontFamily: 'Inter, sans-serif', color: '#333' }}>
            {/* Quốc hiệu tiêu ngữ */}
            <Row justify="space-between" align="top" style={{ borderBottom: '2px double #000', paddingBottom: 12, marginBottom: 20 }}>
              <Col span={10}>
                <Text strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  TẬP ĐOÀN BÁN LẺ & F&B RETAIL-FLOW
                </Text>
                <div style={{ fontSize: 10, color: '#595959' }}>Số: {selectedDetailPromo.id}/QĐ-MKT-{new Date().getFullYear()}</div>
              </Col>
              <Col span={14} style={{ textAlign: 'right' }}>
                <Text strong style={{ fontSize: 11, textTransform: 'uppercase' }}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </Text>
                <div style={{ fontSize: 10, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
                <div style={{ fontSize: 9, color: '#8c8c8c', marginTop: 4, fontStyle: 'italic' }}>TP. Hồ Chí Minh, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
              </Col>
            </Row>

            {/* Tiêu đề quyết định */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Text strong style={{ fontSize: 16, textTransform: 'uppercase', color: '#1f1f1f', display: 'block' }}>
                QUYẾT ĐỊNH BAN HÀNH & PHÂN PHỐI PHÍM BẤM KHUYẾN MÃI
              </Text>
              <Text italic style={{ fontSize: 12, color: '#595959' }}>
                (V/v: Phê duyệt chính sách chiết khấu và liên thông giao diện máy POS thu ngân)
              </Text>
            </div>

            {/* Các căn cứ pháp lý */}
            <div style={{ fontSize: 11, color: '#595959', lineHeight: '1.6', marginBottom: 16, borderLeft: '3px solid #d9d9d9', paddingLeft: 10 }}>
              <p style={{ margin: '0 0 4px 0' }}>- <em>Căn cứ Quy chế Tài chính và Thẩm quyền phê duyệt ngân sách khuyến mãi F&B hiện hành;</em></p>
              <p style={{ margin: '0 0 4px 0' }}>- <em>Căn cứ kế hoạch kích cầu tiêu dùng đề xuất bởi Phòng Kinh Doanh & Marketing (KT);</em></p>
              <p style={{ margin: '0 0 0 0' }}>- <em>Căn cứ Biên bản đánh giá khả năng tương thích phần cứng máy POS bởi Phòng IT Kỹ Thuật Hệ Thống.</em></p>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Điều 1: Luật Khuyến mãi */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 13, color: '#fa541c', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                ĐIỀU 1: CHÍNH SÁCH CHƯƠNG TRÌNH & ĐIỀU KIỆN ÁP DỤNG (PHÒNG MKT CẤU HÌNH)
              </Text>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 0', width: '35%', color: '#8c8c8c' }}>Tên chương trình:</td>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#000' }}>{selectedDetailPromo.name}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 0', color: '#8c8c8c' }}>Mã ưu đãi (ID):</td>
                    <td style={{ padding: '6px 0', fontFamily: 'monospace', fontWeight: 'bold' }}>{selectedDetailPromo.id}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 0', color: '#8c8c8c' }}>Mô tả chiến dịch:</td>
                    <td style={{ padding: '6px 0', color: '#595959' }}>{selectedDetailPromo.description || 'Không có mô tả bổ sung.'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 0', color: '#8c8c8c' }}>Phạm vi áp dụng:</td>
                    <td style={{ padding: '6px 0' }}>
                      <Tag color={selectedDetailPromo.scope === 'bill' ? 'blue' : 'purple'} style={{ fontSize: 9, borderRadius: 4, fontWeight: 'bold' }}>
                        {selectedDetailPromo.scope === 'bill' ? 'ÁP DỤNG TOÀN BỘ HÓA ĐƠN (BILL)' : 'ÁP DỤNG TRÊN TỪNG DÒNG MÓN'}
                      </Tag>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 0', color: '#8c8c8c' }}>Trị giá chiết khấu:</td>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#cf1322', fontSize: 13 }}>
                      {selectedDetailPromo.isRate ? `Giảm ${selectedDetailPromo.value * 100}% trên tổng tiền` : `Khấu trừ thẳng -${selectedDetailPromo.value.toLocaleString()} ₫`}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 0', color: '#8c8c8c' }}>Ngưỡng tối thiểu kích hoạt:</td>
                    <td style={{ padding: '6px 0', fontWeight: 'bold' }}>
                      {selectedDetailPromo.threshold ? `${selectedDetailPromo.threshold.toLocaleString()} ₫` : 'Không yêu cầu định mức tối thiểu'}
                    </td>
                  </tr>
                  {selectedDetailPromo.excludePromoKeys && selectedDetailPromo.excludePromoKeys.length > 0 && (
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '6px 0', color: '#8c8c8c' }}>Quy tắc loại trừ chéo:</td>
                      <td style={{ padding: '6px 0' }}>
                        <Space wrap size={4}>
                          {selectedDetailPromo.excludePromoKeys.map((key: string) => (
                            <Tag key={key} color="red" style={{ fontSize: 9 }}>Loại trừ: {key}</Tag>
                          ))}
                        </Space>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Điều 2: Định cấu hình nút POS */}
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ fontSize: 13, color: '#1890ff', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                ĐIỀU 2: TIÊU CHUẨN KỸ THUẬT NÚT BẤM POS (PHÒNG IT LIÊN THÔNG)
              </Text>
              
              {selectedDetailPromo.itConfigured !== false ? (
                <div style={{ background: '#fafafa', padding: 12, borderRadius: 8, border: '1px solid #e8e8e8' }}>
                  <Row gutter={16} align="middle">
                    <Col span={14}>
                      <div style={{ fontSize: 11, color: '#595959', marginBottom: 4 }}>
                        <strong>Vị trí hiển thị:</strong> Thư mục {getFolderTitleByKey(consoleMenus, findFolderForPromo(consoleMenus, selectedDetailPromo.id)) || 'Ưu Đãi Phổ Thông'}
                      </div>
                      <div style={{ fontSize: 11, color: '#595959', marginBottom: 4 }}>
                        <strong>Biểu tượng nút (Icon):</strong> {selectedDetailPromo.icon || 'Gift'}
                      </div>
                      <div style={{ fontSize: 11, color: '#595959' }}>
                        <strong>Được cấu hình bởi:</strong> Kỹ thuật IT (Phòng Hệ Thống)
                      </div>
                    </Col>
                    <Col span={10} style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: '#8c8c8c', marginBottom: 4, fontStyle: 'italic' }}>Mẫu nút hiển thị quầy POS:</div>
                      <div style={{ 
                        background: selectedDetailPromo.background || '#ffffff', 
                        border: selectedDetailPromo.border || '1px solid #ddd', 
                        color: selectedDetailPromo.color || '#333', 
                        padding: '8px 16px', 
                        borderRadius: 8, 
                        fontSize: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                      }}>
                        {renderIconWithColor(selectedDetailPromo.icon || 'Gift', 14, selectedDetailPromo.color || '#333')}
                        <span>{selectedDetailPromo.name}</span>
                      </div>
                    </Col>
                  </Row>
                </div>
              ) : (
                <Alert 
                  type="warning"
                  showIcon
                  message="CHỜ CẤU HÌNH KỸ THUẬT TỪ PHÒNG IT"
                  description="Khuyến mãi này đã được Marketing duyệt phần luật nhưng chưa được gán phím nóng tương tác trên quầy POS thu ngân. Vui lòng đăng nhập tài khoản IT hoặc Admin để thiết lập phím bấm ở bước 3."
                  style={{ fontSize: 11 }}
                />
              )}
            </div>

            {/* Chữ ký phê duyệt */}
            <div style={{ marginTop: 32 }}>
              <Row justify="space-between" style={{ fontSize: 11, textAlign: 'center' }}>
                <Col span={7}>
                  <Text strong style={{ display: 'block', marginBottom: 40 }}>ĐẠI DIỆN PHÒNG MKT</Text>
                  <Text type="secondary">(Ký, ghi rõ họ tên)</Text>
                  <div style={{ marginTop: 8, color: '#52c41a', fontWeight: 'bold' }}>[ĐÃ ĐIỆN TỬ PHÊ DUYỆT]</div>
                </Col>
                <Col span={7}>
                  <Text strong style={{ display: 'block', marginBottom: 40 }}>ĐẠI DIỆN PHÒNG IT</Text>
                  <Text type="secondary">(Ký, ghi rõ họ tên)</Text>
                  {selectedDetailPromo.itConfigured !== false ? (
                    <div style={{ marginTop: 8, color: '#1890ff', fontWeight: 'bold' }}>[ĐÃ LIÊN THÔNG POS]</div>
                  ) : (
                    <div style={{ marginTop: 8, color: '#d46b08', fontWeight: 'bold' }}>[CHỜ IT XỬ LÝ]</div>
                  )}
                </Col>
                <Col span={7}>
                  <Text strong style={{ display: 'block', marginBottom: 40 }}>BAN GIÁM ĐỐC</Text>
                  <Text type="secondary">(Đóng dấu & Phê duyệt)</Text>
                  <div style={{ marginTop: 8, color: '#595959', fontStyle: 'italic' }}>Ủy quyền phê duyệt điện tử</div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. TIẾN TRÌNH KẾT XUẤT (EXPORT PROGRESS MODAL) */}
      <Modal
        title={
          <Space>
            <DownloadOutlined style={{ color: '#52c41a' }} />
            <span style={{ fontWeight: 'bold' }}>TIẾN TRÌNH KẾT XUẤT HỒ SƠ KHUYẾN MÃI</span>
          </Space>
        }
        open={isExporting}
        closable={false}
        footer={null}
        destroyOnHidden
        width={400}
        centered
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <Progress 
            type="circle" 
            percent={exportProgress} 
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            size={70}
          />
          <div style={{ marginTop: 16, fontSize: 13, fontWeight: '500' }}>
            Đang biên dịch tệp danh sách .{exportType}...
          </div>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
            Đóng gói dữ liệu cấu trúc phím nóng & luật loại trừ chéo POS
          </div>
        </div>
      </Modal>

      {/* 3. GIA HẠN KHUYẾN MÃI (EXTEND DURATION MODAL) */}
      <Modal
        title={
          <Space>
            <ReloadOutlined style={{ color: '#fa8c16' }} />
            <span style={{ fontWeight: 'bold' }}>GIA HẠN CHƯƠNG TRÌNH KHUYẾN MÃI</span>
          </Space>
        }
        open={showExtendModal}
        onCancel={() => {
          setShowExtendModal(false);
          setPromoToExtend(null);
        }}
        onOk={handleExtendTime}
        okText="Gia hạn ngay 🚀"
        cancelText="Hủy bỏ"
        okButtonProps={{ style: { background: '#fa8c16', borderColor: '#fa8c16' } }}
        destroyOnHidden
        width={420}
        centered
      >
        {promoToExtend && (
          <div style={{ padding: '10px 0' }}>
            <Alert
              message="Yêu cầu gia hạn hiệu lực tự động"
              description={`Gia hạn hiệu lực phím bấm POS cho chương trình: "${promoToExtend.name || promoToExtend.title}".`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Mã ID ưu đãi:</span>
              <strong style={{ fontFamily: 'monospace', fontSize: 13 }}>{promoToExtend.id}</strong>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Ngày kết thúc hiện tại:</span>
              <strong style={{ color: '#f5222d' }}>{promoToExtend.endDate ? new Date(promoToExtend.endDate).toLocaleDateString('vi-VN') : 'Áp dụng vô thời hạn'}</strong>
            </div>

            <div>
              <span style={{ color: '#262626', display: 'block', fontWeight: 'bold', marginBottom: 8 }}>Chọn ngày kết thúc mới (Gia hạn):</span>
              <DatePicker 
                value={extendNewEndDate ? dayjs(extendNewEndDate) : null} 
                onChange={(date, dateString) => setExtendNewEndDate(dateString as string)}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                style={{ width: '100%', borderRadius: 6 }}
                placeholder="Chọn ngày kết thúc mới"
              />
              <span style={{ fontSize: 11, color: '#8c8c8c', display: 'block', marginTop: 6, fontStyle: 'italic' }}>
                Hệ thống máy trạm POS thu ngân sẽ tự động kéo dài hiển thị phím nóng tương ứng đến ngày được gia hạn này.
              </span>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @keyframes electric-flow {
          to { stroke-dashoffset: -40; }
        }
        @keyframes pulse-wave {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.4; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .marching-glow {
          stroke-dasharray: 6, 12;
          animation: electric-flow 1.5s linear infinite;
        }
        .simulating-ring {
          position: absolute;
          border-radius: 50%;
          border: 3px solid;
          width: 54px;
          height: 54px;
          top: -5px;
          left: -5px;
          pointer-events: none;
          box-sizing: border-box;
          animation: pulse-wave 1.5s ease-out infinite;
        }
        .zebra-row-even {
          background-color: #fafafa;
        }
        .zebra-row-odd {
          background-color: #ffffff;
        }
        .hover-row-effect:hover {
          background-color: #f0f5ff !important;
          cursor: pointer;
        }
        .active-node-ring {
          width: 54px;
          height: 54px;
          top: -5px;
          left: -5px;
        }
      `}</style>
    </div>
  );
}
