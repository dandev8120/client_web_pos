import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Row, Col, Card, Typography, Button, Input, InputNumber, Badge, Table, Tabs, 
  Tag, Space, Divider, Select, Form, Tooltip, Popover, Popconfirm, Alert, App, Radio, Modal, Switch
} from 'antd';
import { 
  Search, ScanLine, ShoppingCart, User, Percent, Lock, Unlock, 
  Trash2, Plus, Minus, CreditCard, QrCode, Banknote, ShieldAlert, CheckCircle2, X, ArrowLeft, Home, Users,
  Gift, Briefcase, ShieldCheck, Ticket, Zap, Award, Sparkles, CornerDownRight, Laptop, Tv, Tags, PartyPopper, Settings
} from 'lucide-react';
import { logAction } from '../utils/auditLogger';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface POSOrderProps {
  onClose: () => void;
  onComplete: (newOrder: any) => void;
  currentUser: { name: string; role: string } | null;
}

export default function POSOrder({ onClose, onComplete, currentUser }: POSOrderProps) {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const navigate = useNavigate();

  // Cart State
  const [cart, setCart] = useState<any[]>([]);

  // Helper to format Vietnamese Dong
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // State for Nestable Menu Navigation Flow
  const [menuPath, setMenuPath] = useState<string[]>([]);
  const [activePromoTab, setActivePromoTab] = useState<string>('bill'); // 'bill' vs 'item' system promo level

  // Navigation utilities
  const pushMenu = (subPath: string) => {
    // REQUIREMENT 4: Block access and warn if cart is empty
    const allowedWithoutCart = ['products', 'customers', 'products_catalog', 'customer_loyalty'];
    if (!allowedWithoutCart.includes(subPath) && cart.length === 0) {
      modal.warning({
        title: 'Chưa chọn mã hàng',
        content: 'Yêu cầu hóa đơn phải có mã hàng trước khi cài đặt giảm giá, áp khuyến mãi hoặc thực hiện thanh toán!',
        okText: 'Tôi hiểu'
      });
      return;
    }
    setMenuPath(prev => [...prev, subPath]);
  };

  const popMenu = () => {
    setMenuPath(prev => prev.slice(0, -1));
  };

  const goHome = () => {
    setMenuPath([]);
  };

  // Generated Order Metadata
  const orderId = useMemo(() => `ORD-${2024}-${Math.floor(Math.random() * 90000) + 10000}`, []);
  const storeName = "Chi nhánh Miền Nam - Flagship Outlet";
  const deviceName = "POS-Terminal-01";

  // Mock Products Database in VND currency
  const [products] = useState([
    { id: 'PROD-1000', name: 'Giày Sneaker Thể Thao Nam Runner-X', price: 1450000, stock: 12, category: 'Electronics', barcode: '931123400000' },
    { id: 'PROD-1001', name: 'Giày Cao Gót Nữ Công Sở Vintage Bloom', price: 850000, stock: 45, category: 'Electronics', barcode: '931123400001' },
    { id: 'PROD-1002', name: 'Xăng Đan Quai Dù Đi Mưa Active-Fit', price: 380000, stock: 35, category: 'Electronics', barcode: '931123400002' },
    { id: 'PROD-1003', name: 'Giày Lười Da Bò Thật Classic Loafer', price: 1650000, stock: 18, category: 'Electronics', barcode: '931123400003' },
    { id: 'PROD-1004', name: 'Dép Quai Ngang Unisex Đúc Nguyên Khối', price: 150000, stock: 20, category: 'Electronics', barcode: '931123400004' },
    { id: 'PROD-1005', name: 'Balo Chống Nước Học Sinh Campus-Plus', price: 350000, stock: 30, category: 'Fashion', barcode: '931123400005' },
    { id: 'PROD-1006', name: 'Balo Phượt Dã Ngoại Explorer 45L', price: 750000, stock: 120, category: 'Fashion', barcode: '931123400006' },
    { id: 'PROD-1007', name: 'Túi Xách Nữ Đeo Chéo Luxury Saffiano', price: 1250000, stock: 80, category: 'Fashion', barcode: '931123400007' },
    { id: 'PROD-1008', name: 'Túi Bao Tử Đeo Hông Thể Thao Urban', price: 220000, stock: 55, category: 'Fashion', barcode: '931123400008' },
    { id: 'PROD-1009', name: 'Ví Da Bò Gập Nam Handcrafted', price: 450000, stock: 150, category: 'Food', barcode: '931123400009' },
    { id: 'PROD-1010', name: 'Ví Cầm Tay Nữ Dự Tiệc Clutches', price: 680000, stock: 95, category: 'Food', barcode: '931123400010' },
    { id: 'PROD-1011', name: 'Ví Đựng Thẻ Card Holder Minimalist', price: 180000, stock: 210, category: 'Food', barcode: '931123400011' },
    { id: 'PROD-1012', name: 'Thắt Lưng Da Bò Khóa Kim Cao Cấp', price: 420000, stock: 40, category: 'Food', barcode: '931123400012' },
    { id: 'PROD-1013', name: 'Set 3 Đôi Vớ Cotton Thể Thao Êm Ái', price: 950000, stock: 65, category: 'Sports', barcode: '931123400013' },
    { id: 'PROD-1014', name: 'Lót Giày Cao Su Non Giảm Áp Lực', price: 45000, stock: 22, category: 'Sports', barcode: '931123400014' },
    { id: 'PROD-1015', name: 'Xịt Khử Mùi Nano Bạc Bảo Vệ Giày Dép', price: 75000, stock: 15, category: 'Sports', barcode: '931123400015' },
    { id: 'PROD-1016', name: 'Bộ Vệ Sinh Đánh Bóng Giày Chuyên Nghiệp', price: 120000, stock: 50, category: 'Sports', barcode: '931123400016' }
  ]);

  // PROBLEM 2: Default customer is "Khách lẻ vãng lai" (CUST-R01)
  const [selectedParentTier, setSelectedParentTier] = useState<'retail' | 'wholesale'>('retail');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('CUST-R01');
  const [onlyEarnPoints, setOnlyEarnPoints] = useState<boolean>(false);
  const [specialVoucherCode, setSpecialVoucherCode] = useState<string>('');
  const [birthdayPromoActive, setBirthdayPromoActive] = useState<boolean>(false);
  const [birthdayPromoDiscount, setBirthdayPromoDiscount] = useState<number>(0);

  // Sync onlyEarnPoints status with selected customer identification
  useEffect(() => {
    const isReal = selectedCustomerId !== 'CUST-R01' && selectedCustomerId !== 'CUST-W01';
    if (!isReal) {
      setOnlyEarnPoints(false);
    }
  }, [selectedCustomerId]);

  const customersList = useMemo(() => {
    return {
      retail: [
        { id: 'CUST-R01', name: 'Khách lẻ vãng lai', phone: 'Không có', tier: 'Khách vãng lai', discRate: 0, subLevel: 'None' },
        { id: 'CUST-R02', name: 'Nguyễn Văn Hải (Thành viên Bạc)', phone: '0987654321', tier: 'Silver', discRate: 0.02, subLevel: 'Bạc' },
        { id: 'CUST-R03', name: 'Trần Thị Ngọc Dung (Thành viên Vàng)', phone: '0912345678', tier: 'Gold', discRate: 0.05, subLevel: 'Vàng' },
        { id: 'CUST-R04', name: 'Lê Hoàng Minh (Thành viên Kim Cương)', phone: '0945556667', tier: 'Platinum', discRate: 0.08, subLevel: 'Kim Cương' }
      ],
      wholesale: [
        { id: 'CUST-W01', name: 'Khách sỉ vãng lai (Đại lý mặc định)', phone: 'Không có', tier: 'Khách sỉ', discRate: 0, subLevel: 'None' },
        { id: 'CUST-W02', name: 'Đại lý phân phối Quận 1 - Minh Khuê', phone: '0901112223', tier: 'Wholesale Bronze', discRate: 0.10, subLevel: 'Đại lý Cấp 3' },
        { id: 'CUST-W03', name: 'Nhà bán sỉ khu vực Thủ Đức - Tiến Thành', phone: '0918333444', tier: 'Wholesale Silver', discRate: 0.12, subLevel: 'Đại lý Cấp 2' },
        { id: 'CUST-W04', name: 'Hộ kinh doanh phân phối Sài Gòn (VIP sỉ)', phone: '0933555666', tier: 'Wholesale Gold', discRate: 0.15, subLevel: 'Đại lý Cấp 1' }
      ]
    };
  }, []);

  const activeCustomerPool = useMemo(() => {
    return customersList[selectedParentTier];
  }, [customersList, selectedParentTier]);

  const selectedCustomer = useMemo(() => {
    const all = [...customersList.retail, ...customersList.wholesale];
    return all.find(c => c.id === selectedCustomerId) || customersList.retail[0];
  }, [customersList, selectedCustomerId]);

  // Product filters
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');

  // Helper to strip accents & normalize to capital letters
  const removeAccentsAndUpperCase = (str: string) => {
    return str
      .normalize('NFD')                     // Normalize accents
      .replace(/[\u0300-\u036f]/g, '')     // Remove diacritical marks
      .replace(/[đđ]/g, 'd')
      .replace(/[ĐĐ]/g, 'D')
      .toUpperCase()
      .replace(/[^A-Z0-9\s_-]/g, '');     // Keep uppercase, numbers, spaces, underscores, hyphens
  };

  // Extract flat available promos dynamically from nestable consoleMenus
  const extractPromotionsFromTree = (list: any[]): any[] => {
    let res: any[] = [];
    if (!Array.isArray(list)) return res;
    list.forEach(item => {
      if (!item) return;
      if (item.type === 'toggle_promo' || item.type === 'assigned_item_promo') {
        res.push({
          ...item,
          id: item.key,
          name: item.title,
          scope: item.scope || 'bill',
          type: item.promoType || 'bill',
          description: item.description,
          targetId: item.targetId,
          value: item.value,
          isRate: item.isRate !== undefined ? item.isRate : true,
          threshold: item.threshold
        });
      }
      if (item.children && Array.isArray(item.children)) {
        res.push(...extractPromotionsFromTree(item.children));
      }
    });
    return res;
  };

  // Utility to check if a promotion is expired or disabled in POS
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

    // 2. Cascade Year Limit
    const isRecur = promo.isRecurring === true;
    const recurType = promo.recurringType || 'yearly';
    
    const enforceYear = !isRecur || recurType === 'daily';
    if (enforceYear && promo.selectedYears && promo.selectedYears.length > 0) {
      if (!promo.selectedYears.includes(currentYear)) return true;
    }

    // 3. Cascade Quarter Limit
    const enforceQuarter = !isRecur || ['yearly', 'daily'].includes(recurType);
    if (enforceQuarter && promo.selectedQuarters && promo.selectedQuarters.length > 0) {
      if (!promo.selectedQuarters.includes(currentQuarter)) return true;
    }

    // 4. Cascade Month Limit
    const enforceMonth = !isRecur || ['yearly', 'quarterly', 'daily'].includes(recurType);
    if (enforceMonth && promo.selectedMonths && promo.selectedMonths.length > 0) {
      if (!promo.selectedMonths.includes(currentMonthNum)) return true;
    }

    // 5. Cascade Day Limit
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

      if (hasDaysConfigured && hasWeekdaysConfigured) {
        if (!dayMatches && !weekdayMatches) return true;
      } else if (hasDaysConfigured) {
        if (!dayMatches) return true;
      } else if (hasWeekdaysConfigured) {
        if (!weekdayMatches) return true;
      }
    }

    // 6. Cascade Hour Limit
    if (promo.startHour || promo.endHour) {
      if (promo.startHour && currentHourStr < promo.startHour) return true;
      if (promo.endHour && currentHourStr > promo.endHour) return true;
    }

    return false;
  };

  // Dynamically configured menu hierarchy state
  const [consoleMenus, setConsoleMenus] = useState<any[]>(() => {
    const saved = localStorage.getItem('pos_console_menus');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Autodetect old non-nested configuration and force update to new nested format
        const hasNestedPromos = JSON.stringify(parsed).includes('toggle_promo');
        if (hasNestedPromos) {
          return parsed;
        }
      } catch (e) {
        console.error("Error load pos_console_menus", e);
      }
    }
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
                    key: 'km_mathang_laptop',
                    title: 'Giảm Giày Sneaker Runner-X - 10%',
                    scope: 'item',
                    promoType: 'item',
                    description: 'Giảm ngay 10% khi áp dụng cho sản phẩm Giày Sneaker Thể Thao Nam Runner-X (PROD-1000)',
                    targetId: 'PROD-1000',
                    value: 0.10,
                    isRate: true,
                    type: 'assigned_item_promo',
                    icon: 'Gift',
                    color: '#fa541c'
                  },
                  {
                    key: 'km_nhom_electronics',
                    title: 'Chọn KM nhóm Giày dép - 15%',
                    scope: 'item',
                    promoType: 'category',
                    description: 'Giảm 15% khi áp mã cho bất kỳ sản phẩm thuộc ngành hàng Giày dép',
                    targetId: 'Electronics',
                    value: 0.15,
                    isRate: true,
                    type: 'assigned_item_promo',
                    icon: 'Percent',
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
    localStorage.setItem('pos_console_menus', JSON.stringify(defaultMenus));
    return defaultMenus;
  });

  const availablePromos = useMemo(() => {
    return extractPromotionsFromTree(consoleMenus);
  }, [consoleMenus]);

  useEffect(() => {
    localStorage.setItem('pos_promotions', JSON.stringify(availablePromos));
  }, [availablePromos]);

  // Raw JSON representation for Admin console
  const [jsonText, setJsonText] = useState<string>('');

  useEffect(() => {
    setJsonText(JSON.stringify(availablePromos, null, 2));
  }, [availablePromos]);

  const [menusJsonText, setMenusJsonText] = useState<string>('');

  useEffect(() => {
    setMenusJsonText(JSON.stringify(consoleMenus, null, 2));
  }, [consoleMenus]);

  // Synchronize dynamic campaign tab selection based on dynamic menu routes
  useEffect(() => {
    const activeView = menuPath.length > 0 ? menuPath[menuPath.length - 1] : '';
    if (activeView === 'system_bill') {
      setActivePromoTab('bill');
    } else if (activeView === 'system_item') {
      setActivePromoTab('item');
    }
  }, [menuPath]);

  // Helper to dynamically render a Lucide icon from its name string
  const renderMenuIcon = (iconName: string, size = 28, color?: string) => {
    const iconMap: { [key: string]: any } = {
      ShoppingCart, Users, Percent, Gift, Briefcase, ShieldCheck, Zap, Ticket, CreditCard,
      Award, Sparkles, CornerDownRight, Laptop, Tv, Tags, PartyPopper
    };
    const IconComponent = iconMap[iconName] || Gift;
    return <IconComponent size={size} style={{ color, display: 'block', margin: '0 auto' }} />;
  };

  // System active promos state
  const [activePromos, setActivePromos] = useState<string[]>([]);
  // Item-level mapping (productId mapping to promoId)
  const [appliedItemPromos, setAppliedItemPromos] = useState<{ [productId: string]: string }>({});

  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [employeeDiscountApplied, setEmployeeDiscountApplied] = useState<boolean>(false);
  const [employeeName, setEmployeeName] = useState<string>('');

  // Manager Approval Overrides
  const [managerUsername, setManagerUsername] = useState('manager01');
  const [managerPin, setManagerPin] = useState('');
  const [managerApproval, setManagerApproval] = useState<{ name: string } | null>(null);
  const [managerDiscountRate, setManagerDiscountRate] = useState<number>(0); 
  const [managerApprovalReason, setManagerApprovalReason] = useState<string>('');

  // Quick Manual Adjustment
  const [quickDiscountPercent, setQuickDiscountPercent] = useState<number>(0);
  const [quickDiscountReason, setQuickDiscountReason] = useState<string>('');

  const isWarningActive = useRef(false);

  // Styling presets and custom campaign forms state
  const [visualPresets, setVisualPresets] = useState<any[]>(() => {
    const saved = localStorage.getItem('pos_promo_presets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'preset_green', name: 'Sinh Thái Green', icon: 'Gift', background: '#f6ffed', border: '1px solid #b7eb8f', color: '#52c41a' },
      { id: 'preset_blue', name: 'Đặc Quyền Blue', icon: 'Sparkles', background: '#e6f7ff', border: '1px solid #91d5ff', color: '#1890ff' },
      { id: 'preset_orange', name: 'Hỏa Tốc Orange', icon: 'Zap', background: '#fff2e8', border: '1px solid #ffbb96', color: '#fa541c' },
      { id: 'preset_purple', name: 'Khai Trương Purple', icon: 'PartyPopper', background: '#f9f0ff', border: '1px solid #d3adf7', color: '#722ed1' },
      { id: 'preset_magenta', name: 'Tiền Mặt Magenta', icon: 'CornerDownRight', background: '#fff0f6', border: '1px solid #ffadd2', color: '#eb2f96' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('pos_promo_presets', JSON.stringify(visualPresets));
  }, [visualPresets]);

  // Sync state from localStorage on mount (ensuring absolute sync when navigating back)
  useEffect(() => {
    const savedMenus = localStorage.getItem('pos_console_menus');
    if (savedMenus) {
      try {
        setConsoleMenus(JSON.parse(savedMenus));
      } catch (e) {
        console.error("Error parsing pos_console_menus on mount", e);
      }
    }
    const savedPresets = localStorage.getItem('pos_promo_presets');
    if (savedPresets) {
      try {
        setVisualPresets(JSON.parse(savedPresets));
      } catch (e) {
        console.error("Error parsing pos_promo_presets on mount", e);
      }
    }
  }, []);

  // Visual preset form variables
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetFormName, setPresetFormName] = useState('');
  const [presetFormIcon, setPresetFormIcon] = useState('Gift');
  const [presetFormBg, setPresetFormBg] = useState('#fafafa');
  const [presetFormBorder, setPresetFormBorder] = useState('1px solid #d9d9d9');
  const [presetFormColor, setPresetFormColor] = useState('#1677ff');

  // Campaign promotion form variables
  const [editingPromoKey, setEditingPromoKey] = useState<string | null>(null);
  const [promoFormTitle, setPromoFormTitle] = useState('');
  const [promoFormId, setPromoFormId] = useState('');
  const [promoFormFolder, setPromoFormFolder] = useState(''); 
  const [promoFormScope, setPromoFormScope] = useState<'bill' | 'item'>('bill');
  const [promoFormValueType, setPromoFormValueType] = useState<'rate' | 'cash'>('rate');
  const [promoFormValue, setPromoFormValue] = useState<number>(0.10);
  const [promoFormThreshold, setPromoFormThreshold] = useState<number | undefined>(undefined);
  const [promoFormTargetId, setPromoFormTargetId] = useState(''); 
  const [promoFormDesc, setPromoFormDesc] = useState('');
  const [promoFormPresetId, setPromoFormPresetId] = useState('preset_green');
  const [promoFormExclusions, setPromoFormExclusions] = useState<string[]>([]);

  // Skuomorphic printable bill state
  const [receiptModelVisible, setReceiptModalVisible] = useState(false);
  const [isJsonModalVisible, setIsJsonModalVisible] = useState(false);
  const [checkoutReceipt, setCheckoutReceipt] = useState<any | null>(null);

  // Vouchers database
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVouchers, setAppliedVouchers] = useState<any[]>([]); // Gotit / Urbox

  // Payments multi-method in VND
  const [payments, setPayments] = useState({
    cash: 0,
    atm: 0,
    zalopay: 0,
    vnpay: 0
  });

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [activeQrMethod, setActiveQrMethod] = useState<'zalopay' | 'vnpay' | null>(null);
  const [qrRemainingAmount, setQrRemainingAmount] = useState(0);

  const isPaymentStarted = useMemo(() => {
    return (payments.cash > 0 || payments.atm > 0 || payments.zalopay > 0 || payments.vnpay > 0);
  }, [payments]);

  // Event handlers for visual style presets
  const handleSavePreset = () => {
    if (!presetFormName.trim()) return;
    if (editingPresetId) {
      setVisualPresets(prev => prev.map(p => p.id === editingPresetId ? {
        ...p,
        name: presetFormName,
        icon: presetFormIcon,
        background: presetFormBg,
        border: presetFormBorder,
        color: presetFormColor
      } : p));
      setEditingPresetId(null);
    } else {
      const newId = 'preset_' + Date.now();
      setVisualPresets(prev => [...prev, {
        id: newId,
        name: presetFormName,
        icon: presetFormIcon,
        background: presetFormBg,
        border: presetFormBorder,
        color: presetFormColor
      }]);
    }
    setPresetFormName('');
    setPresetFormIcon('Gift');
    setPresetFormBg('#fafafa');
    setPresetFormBorder('1px solid #d9d9d9');
    setPresetFormColor('#1677ff');
  };

  const handleEditPreset = (p: any) => {
    setEditingPresetId(p.id);
    setPresetFormName(p.name);
    setPresetFormIcon(p.icon);
    setPresetFormBg(p.background);
    setPresetFormBorder(p.border);
    setPresetFormColor(p.color);
  };

  const handleDeletePreset = (id: string) => {
    setVisualPresets(prev => prev.filter(p => p.id !== id));
    if (editingPresetId === id) {
      setEditingPresetId(null);
      setPresetFormName('');
    }
  };

  // Helper to harvest all folder nodes in consoleMenus tree dynamically
  const getAllFolders = (nodes: any[]): { key: string; title: string }[] => {
    let folders: { key: string; title: string }[] = [];
    if (!Array.isArray(nodes)) return folders;
    nodes.forEach(n => {
      if (n && n.type === 'folder') {
        folders.push({ key: n.key, title: n.title });
        if (n.children) {
          folders = [...folders, ...getAllFolders(n.children)];
        }
      }
    });
    return folders;
  };

  // Helper to add a promo recursively under a target folder key in tree
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

  // Helper to edit a promo keys recursively in tree
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

  // Helper to delete a promo recursively in tree
  const deletePromoFromTree = (nodes: any[], promoKey: string): any[] => {
    if (!Array.isArray(nodes)) return [];
    return nodes.reduce((acc, n) => {
      if (n.key === promoKey) {
        return acc; // Skip it!
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

  const handleSavePromo = () => {
    if (!promoFormTitle.trim()) return;
    
    const chosenPreset = visualPresets.find(p => p.id === promoFormPresetId) || visualPresets[0];
    const key = promoFormId.trim() || 'km_' + Math.random().toString(36).substr(2, 5);

    const promoPayload: any = {
      key: key,
      title: promoFormTitle,
      type: promoFormScope === 'bill' ? 'toggle_promo' : 'assigned_item_promo',
      scope: promoFormScope,
      promoType: promoFormScope === 'bill' ? 'bill' : 'item',
      description: promoFormDesc,
      value: Number(promoFormValue),
      isRate: promoFormValueType === 'rate',
      threshold: promoFormThreshold ? Number(promoFormThreshold) : undefined,
      targetId: promoFormScope === 'item' ? promoFormTargetId : undefined,
      excludePromoKeys: promoFormExclusions,
      icon: chosenPreset?.icon || 'Gift',
      background: chosenPreset?.background || '#f6ffed',
      border: chosenPreset?.border || '1px solid #b7eb8f',
      color: chosenPreset?.color || '#52c41a'
    };

    let updatedTree: any[];
    if (editingPromoKey) {
      if (promoFormFolder && promoFormFolder !== editingPromoKey) {
        const tempTree = deletePromoFromTree(consoleMenus, editingPromoKey);
        updatedTree = addPromoToTree(tempTree, promoFormFolder, promoPayload);
      } else {
        updatedTree = updatePromoInTree(consoleMenus, editingPromoKey, promoPayload);
      }
      setEditingPromoKey(null);
    } else {
      const folderKey = promoFormFolder || 'system_bill';
      updatedTree = addPromoToTree(consoleMenus, folderKey, promoPayload);
    }

    setConsoleMenus(updatedTree);
    localStorage.setItem('pos_console_menus', JSON.stringify(updatedTree));
    const flat = extractPromotionsFromTree(updatedTree);
    localStorage.setItem('pos_promotions', JSON.stringify(flat));

    setPromoFormTitle('');
    setPromoFormId('');
    setPromoFormFolder('');
    setPromoFormScope('bill');
    setPromoFormValueType('rate');
    setPromoFormValue(0.10);
    setPromoFormThreshold(undefined);
    setPromoFormTargetId('');
    setPromoFormDesc('');
    setPromoFormPresetId(visualPresets[0]?.id || 'preset_green');
    setPromoFormExclusions([]);
  };

  const handleEditPromo = (item: any) => {
    let folderKey = 'system_bill';
    const findFolderRecursive = (currNodes: any[], key: string, parentKey = 'system_bill'): string => {
      for (const n of currNodes) {
        if (!n) continue;
        if (n.key === key) return parentKey;
        if (n.children) {
          const ret = findFolderRecursive(n.children, key, n.key);
          if (ret) return ret;
        }
      }
      return '';
    };
    const fKey = findFolderRecursive(consoleMenus, item.id) || 'system_bill';

    setEditingPromoKey(item.id);
    setPromoFormTitle(item.name);
    setPromoFormId(item.id);
    setPromoFormFolder(fKey);
    setPromoFormScope(item.scope);
    setPromoFormValueType(item.isRate ? 'rate' : 'cash');
    setPromoFormValue(item.value);
    setPromoFormThreshold(item.threshold);
    setPromoFormTargetId(item.targetId || '');
    setPromoFormDesc(item.description || '');
    setPromoFormExclusions(item.excludePromoKeys || []);

    const matchingPreset = visualPresets.find(p => p.background === item.background && p.color === item.color);
    if (matchingPreset) {
      setPromoFormPresetId(matchingPreset.id);
    }
  };

  const handleDeletePromo = (promoKey: string) => {
    const updatedTree = deletePromoFromTree(consoleMenus, promoKey);
    setConsoleMenus(updatedTree);
    localStorage.setItem('pos_console_menus', JSON.stringify(updatedTree));
    const flat = extractPromotionsFromTree(updatedTree);
    localStorage.setItem('pos_promotions', JSON.stringify(flat));
    
    if (editingPromoKey === promoKey) {
      setEditingPromoKey(null);
    }
  };

  // PROBLEM 3 & PROBLEM 7: Billing calculations matching exact constraints:
  // - % and condition promotions cannot be applied simultaneously (Only apply the single best rate promo that yields highest discount amount)
  // - Static cash/VND reduction promotions can be compounded (applied simultaneously in full addition)
  const billingCalculations = useMemo(() => {
    let rawSubtotal = 0;
    
    // Calculate raw amount
    cart.forEach(item => {
      rawSubtotal += item.price * item.qty;
    });

    // We will calculate individual discount paths.
    // Since % discounts cannot be applied together, we compute the literal discount amounts of each candidate % discount pathway independently,
    // and then only retain the ONE pathway which yields the HIGHEST VND saving.
    
    // Pathway 1: % Item promotions (System automatic/manual item-level matching)
    let pathItemDiscountAmount = 0;
    const processedCartWithItemPromo = cart.map(item => {
      const lineRaw = item.price * item.qty;
      let appliedPromo: any = null;

      const promoId = appliedItemPromos[item.id];
      if (promoId) {
        appliedPromo = availablePromos.find(p => p.id === promoId);
      }

      let discount = 0;
      if (appliedPromo && appliedPromo.isRate) {
        discount = Math.round(lineRaw * appliedPromo.value);
      }

      pathItemDiscountAmount += discount;
      return {
        ...item,
        lineRaw,
        discount,
        promoName: appliedPromo ? appliedPromo.name : null,
        promoRate: appliedPromo ? appliedPromo.value : 0,
        finalSubtotal: lineRaw - discount
      };
    });

    // Pathway 2: % Bill Level system automatic promotions (km_bill_1000 or km_time_flash)
    let pathBillPercentDiscountAmount = 0;
    let selectedBillPercentPromoName = '';
    
    const candidateBillPromos = availablePromos.filter(p => p.scope === 'bill' && p.isRate && activePromos.includes(p.id));
    candidateBillPromos.forEach(p => {
      let active = true;
      if (p.threshold && rawSubtotal < p.threshold) active = false;
      if (active) {
        const amt = Math.round(rawSubtotal * p.value);
        if (amt > pathBillPercentDiscountAmount) {
          pathBillPercentDiscountAmount = amt;
          selectedBillPercentPromoName = `${p.name} (${p.value * 100}%)`;
        }
      }
    });

    // Pathway 3: Loyalty Membership rate (%)
    const loyaltyPercentRate = onlyEarnPoints ? 0 : selectedCustomer.discRate;
    const pathLoyaltyDiscountAmount = Math.round(rawSubtotal * loyaltyPercentRate);

    // Pathway 4: Employee flat 10% discount (%)
    const pathEmployeeDiscountAmount = employeeDiscountApplied ? Math.round(rawSubtotal * 0.10) : 0;

    // Pathway 5: Manager override rate (%) - REQUIRES EXPLICIT REASON OR WILL SET VALUE TO 0
    const managerReasonValid = managerApprovalReason.trim().length >= 3;
    const pathManagerDiscountAmount = (managerApproval && managerDiscountRate > 0 && managerReasonValid) ? Math.round(rawSubtotal * managerDiscountRate) : 0;

    // Pathway 6: Quick action complaints rate (%) - REQUIRES EXPLICIT REASON OR WILL SET VALUE TO 0
    const quickReasonValid = quickDiscountReason.trim().length >= 3;
    const pathQuickDiscountAmount = (quickDiscountPercent > 0 && quickReasonValid) ? Math.round(rawSubtotal * (quickDiscountPercent / 100)) : 0;

    // Pathway 7: Custom Special Voucher Birthday / loyalty inquiry (%)
    const pathBirthdayDiscountAmount = birthdayPromoActive ? Math.round(rawSubtotal * 0.15) : 0; // 15% for Birthday voucher

    // --- COMPARE ALL % DISCOUNT PATHS AND PRESERVE THE MAXIMUM BENEFICIAL ONE ---
    const percentPaths = [
      { key: 'item_promo', label: 'Khuyến mãi mã hàng (%)', amount: pathItemDiscountAmount },
      { key: 'bill_promo_rate', label: `Khuyến mãi bill %: ${selectedBillPercentPromoName || ''}`, amount: pathBillPercentDiscountAmount },
      { key: 'loyalty_member', label: `Hạng thành viên: ${selectedCustomer.name} (${selectedCustomer.subLevel})`, amount: pathLoyaltyDiscountAmount },
      { key: 'employee_rate', label: `NV Công Ty: ${employeeName || ''} (10%)`, amount: pathEmployeeDiscountAmount },
      { key: 'manager_pin', label: `Quản lý duyệt PIN (${managerDiscountRate * 100}%)`, amount: pathManagerDiscountAmount },
      { key: 'quick_adjust', label: `Giảm ca trực phàn nàn (${quickDiscountPercent}%)`, amount: pathQuickDiscountAmount },
      { key: 'birthday_special', label: 'Voucher Ưu đãi Sinh nhật VIP (15%)', amount: pathBirthdayDiscountAmount }
    ];

    // Sort to find the highest saving pathway
    const sortedPercentPaths = [...percentPaths].sort((a, b) => b.amount - a.amount);
    const bestPercentDiscount = sortedPercentPaths[0].amount > 0 ? sortedPercentPaths[0] : null;

    // --- COMPOUND CASH IN HAND DIRECT REDUCTIONS (Áp dụng khấu trừ tuần tự thông minh chống trùng lắp 0đ) ---
    let runningPayable = Math.max(0, rawSubtotal - (bestPercentDiscount?.amount || 0));
    const cashPromoBreakdown: Array<{ name: string; amount: number; originalValue: number; status: 'active' | 'ignored' }> = [];
    let processedCashDiscountsTotal = 0;

    // 1. Khuyến mãi hệ thống (tiền mặt): km_bill_500, km_store_south
    availablePromos.forEach(p => {
      if (p.scope === 'bill' && !p.isRate && activePromos.includes(p.id)) {
        let active = true;
        if (p.threshold && rawSubtotal < p.threshold) active = false;
        
        if (active) {
          const originalValue = p.value;
          const utilized = Math.min(runningPayable, originalValue);
          runningPayable -= utilized;
          processedCashDiscountsTotal += utilized;
          
          cashPromoBreakdown.push({ 
            name: p.name, 
            amount: utilized, 
            originalValue, 
            status: utilized > 0 ? 'active' : 'ignored' 
          });
        }
      }
    });

    // 2. Birthday loyalty manual cash reward
    if (birthdayPromoDiscount > 0) {
      const originalValue = birthdayPromoDiscount;
      const utilized = Math.min(runningPayable, originalValue);
      runningPayable -= utilized;
      processedCashDiscountsTotal += utilized;

      cashPromoBreakdown.push({ 
        name: 'Ưu đãi Sinh nhật VIP', 
        amount: utilized, 
        originalValue, 
        status: utilized > 0 ? 'active' : 'ignored' 
      });
    }

    // 3. Special static cash vouchers entered manually (Gotit / Urbox)
    const processedVouchersBreakdown = appliedVouchers.map(v => {
      const originalValue = v.value;
      const utilized = Math.min(runningPayable, originalValue);
      runningPayable -= utilized;
      processedCashDiscountsTotal += utilized;

      return {
        ...v,
        utilized,
        status: utilized > 0 ? 'active' : 'ignored'
      };
    });

    // Thêm các voucher nhập tay vào bảng phân rã
    processedVouchersBreakdown.forEach(v => {
      cashPromoBreakdown.push({ 
        name: `Voucher ${v.code} (${v.label})`, 
        amount: v.utilized, 
        originalValue: v.value, 
        status: v.status 
      });
    });

    // Calculate total Voucher leftovers (forfeited balance)
    let totalForfeitedVoucherAmount = 0;
    processedVouchersBreakdown.forEach(v => {
      const leftover = v.value - v.utilized;
      if (leftover > 0) {
        totalForfeitedVoucherAmount += leftover;
      }
    });

    const totalCashDiscountsTotal = processedCashDiscountsTotal;

    // Compute Final Bill total
    const finalBillTotal = runningPayable;
    const paidSum = payments.cash + payments.atm + payments.zalopay + payments.vnpay;
    const remainingToPay = Math.max(0, finalBillTotal - paidSum);

    // Apply the chosen best item-discount row layout details
    const finalizedProcessedCart = cart.map(item => {
      const lineRaw = item.price * item.qty;
      let note = '';
      let discountAmount = 0;
      
      // If item-promo is the universally chosen single % path, reflect it on the items
      if (bestPercentDiscount?.key === 'item_promo') {
        const promoId = appliedItemPromos[item.id];
        if (promoId) {
          const promo = availablePromos.find(p => p.id === promoId);
          if (promo) {
            discountAmount = Math.round(lineRaw * promo.value);
            note = `🏷️ ${promo.name} | Giảm ${promo.value * 100}% | Trừ ${formatVND(discountAmount)}`;
          }
        }
      }

      return {
        ...item,
        lineRaw,
        discountAmount,
        note,
        finalSubtotal: lineRaw - discountAmount
      };
    });

    // Build smart real-time warnings list for overlap check
    const warnings: string[] = [];

    // Check % overlap: Which channels are requested (they have something that would trigger it)
    const activePercentPaths = percentPaths.filter(p => {
      if (p.key === 'item_promo') return Object.keys(appliedItemPromos).length > 0;
      if (p.key === 'bill_promo_rate') return availablePromos.some(promo => promo.scope === 'bill' && promo.isRate && activePromos.includes(promo.id));
      if (p.key === 'loyalty_member') return selectedCustomer.discRate > 0 && !onlyEarnPoints;
      if (p.key === 'employee_rate') return employeeDiscountApplied;
      if (p.key === 'manager_pin') return managerApproval !== null && managerDiscountRate > 0 && managerApprovalReason.trim().length >= 3;
      if (p.key === 'quick_adjust') return quickDiscountPercent > 0 && quickDiscountReason.trim().length >= 3;
      if (p.key === 'birthday_special') return birthdayPromoActive;
      return false;
    });

    if (activePercentPaths.length > 1 && bestPercentDiscount) {
      const winner = bestPercentDiscount;
      const losers = activePercentPaths.filter(p => p.key !== winner.key);
      losers.forEach(loser => {
        warnings.push(`Xung đột %: Giao diện chọn thẻ "${loser.label}" nhưng vì chính sách độc quyền %, hệ thống ưu tiên giữ "${winner.label}" để khách hưởng mức giảm cao nhất!`);
      });
    }

    // Dynamic exclusionary checks
    const activePromoKeys = [...activePromos, ...Object.values(appliedItemPromos)];
    const activeSystemPromos = availablePromos.filter(p => activePromoKeys.includes(p.id));
    
    activeSystemPromos.forEach(p => {
      if (p.excludePromoKeys && Array.isArray(p.excludePromoKeys)) {
        p.excludePromoKeys.forEach((exKey: string) => {
          if (activePromoKeys.includes(exKey)) {
            const otherObj = availablePromos.find(o => o.id === exKey);
            warnings.push(`Ràng buộc Loại trừ: ${p.name} quy định loại trừ hoàn toàn (không được gộp) với "${otherObj?.name || exKey}". Vui lòng tắt bớt một chương trình!`);
          }
        });
      }
    });

    if (totalForfeitedVoucherAmount > 0) {
      warnings.push(`Lưu ý Voucher: Phiếu voucher cộng dồn còn dư thừa ${totalForfeitedVoucherAmount.toLocaleString()} đ từ mốc 0đ hóa đơn sẽ không được hoàn trả lại tiền mặt (Tịch thu).`);
    }

    return {
      rawSubtotal,
      bestPercentDiscount,
      percentPaths,
      totalCashDiscountsTotal,
      cashPromoBreakdown,
      finalBillTotal,
      paidSum,
      remainingToPay,
      processedCart: finalizedProcessedCart,
      totalForfeitedVoucherAmount,
      warnings
    };
  }, [
    cart, 
    activePromos, 
    appliedItemPromos, 
    selectedCustomer, 
    employeeDiscountApplied, 
    managerApproval, 
    managerDiscountRate, 
    quickDiscountPercent, 
    appliedVouchers, 
    payments, 
    birthdayPromoActive, 
    birthdayPromoDiscount,
    availablePromos,
    employeeName,
    onlyEarnPoints
  ]);

  // Handle adding products
  const handleAddToCart = (product: any) => {
    if (isPaymentStarted) {
      modal.warning({
        title: 'Hóa đơn đã khóa',
        content: 'Hóa đơn đã có giao dịch nạp tiền. Vui lòng bấm hủy thanh toán hoàn trả trước khi thêm sắm sản phẩm!'
      });
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          if (!isWarningActive.current) {
            isWarningActive.current = true;
            modal.warning({ 
              title: 'Kho không đủ', 
              content: `Sản phẩm này chỉ còn tồn kho ${product.stock} đơn vị.`,
              onOk: () => { isWarningActive.current = false; },
              onCancel: () => { isWarningActive.current = false; }
            });
          }
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, val: number | null) => {
    if (isPaymentStarted) return;
    const targetVal = val || 1;
    const prod = products.find(p => p.id === productId);
    if (prod && targetVal > prod.stock) {
      if (!isWarningActive.current) {
        isWarningActive.current = true;
        modal.warning({ 
          title: 'Tồn kho không đủ', 
          content: `Sản phẩm giới hạn tồn ${prod.stock} đơn vị.`,
          onOk: () => { isWarningActive.current = false; },
          onCancel: () => { isWarningActive.current = false; }
        });
      }
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, qty: targetVal } : item));
  };

  const handleRemoveFromCart = (productId: string) => {
    if (isPaymentStarted) return;
    setCart(prev => prev.filter(item => item.id !== productId));
    // Also clean item promo assignment if any
    setAppliedItemPromos(prev => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const handleBarcodeSubmit = () => {
    if (isPaymentStarted) return;
    const found = products.find(p => p.id === barcodeInput || p.barcode === barcodeInput);
    if (found) {
      handleAddToCart(found);
      setBarcodeInput('');
    } else {
      modal.error({
        title: 'Không thấy mặt hàng',
        content: `Không thấy mã hàng hoặc barcode tương ứng với "${barcodeInput}".`
      });
    }
  };

  // Toggle bill promos
  const handleTogglePromo = (promo: any) => {
    if (isPaymentStarted) return;
    
    const isAdding = !activePromos.includes(promo.id);
    if (isAdding && isPromoExpired(promo)) {
      modal.error({
        title: 'Chương trình khuyến mãi hết hạn / ngoài giờ',
        content: `Không thể áp dụng chương trình "${promo.title || promo.name || 'Khuyến mãi'}" vì đã hết hạn hoặc đang ngoài giờ hoạt động cấu hình!`,
        okText: 'Tôi hiểu'
      });
      return;
    }

    if (isAdding && billingCalculations.finalBillTotal <= 0) {
      modal.warning({
        title: 'Hóa đơn đã đạt 0 đ',
        content: 'Hóa đơn thực thu đã đạt mốc 0 ₫, từ chối áp dụng thêm chương trình khuyến mãi hóa đơn hệ thống.',
        okText: 'Tôi hiểu'
      });
      return;
    }

    if (isAdding) {
      const activePromoKeys = [...activePromos, ...Object.values(appliedItemPromos)];
      
      // 1. Check if the promo being added has exclusions that conflict with already active ones
      if (promo.excludePromoKeys && Array.isArray(promo.excludePromoKeys)) {
        const conflictingKey = promo.excludePromoKeys.find(k => activePromoKeys.includes(k));
        if (conflictingKey) {
          const otherObj = availablePromos.find(o => o.id === conflictingKey);
          modal.warning({
            title: 'Chồng chéo khuyến mãi bị loại trừ!',
            style: { top: 80 },
            content: `Không thể áp dụng "${promo.title || promo.name}" vì quy định loại trừ hoàn toàn (không được gộp) với chương trình "${otherObj?.name || conflictingKey}" hiện đang hoạt động. Vui lòng tắt chương trình kia trước!`,
            okText: 'Tôi hiểu'
          });
          return;
        }
      }

      // 2. Check if currently active promos exclude the one being added
      const excludingActivePromo = availablePromos.filter(p => activePromoKeys.includes(p.id))
        .find(p => p.excludePromoKeys && p.excludePromoKeys.includes(promo.id));
      if (excludingActivePromo) {
        modal.warning({
          title: 'Chồng chéo khuyến mãi bị loại trừ!',
          style: { top: 80 },
          content: `Không thể áp dụng "${promo.title || promo.name}" vì chương trình "${excludingActivePromo.name}" hiện đang hoạt động có quy định xung đột loại trừ hoàn toàn với chương trình này. Vui lòng tắt chương trình kia trước!`,
          okText: 'Tôi hiểu'
        });
        return;
      }

      // 3. Check for percentage (%) discount channel overlap
      if (promo.isRate) {
        const activeRatePromo = availablePromos.find(p => p.isRate && activePromos.includes(p.id));
        const hasItemRate = Object.keys(appliedItemPromos).length > 0;
        const hasLoyalty = selectedCustomer.discRate > 0 && !onlyEarnPoints;
        const hasEmployee = employeeDiscountApplied;
        const hasManager = managerApproval !== null && managerDiscountRate > 0;
        const hasQuick = quickDiscountPercent > 0;
        const hasBirthday = birthdayPromoActive;

        if (activeRatePromo || hasItemRate || hasLoyalty || hasEmployee || hasManager || hasQuick || hasBirthday) {
          let conflictSource = '';
          if (activeRatePromo) conflictSource = `Chương trình giảm bill "%" khác: "${activeRatePromo.name}"`;
          else if (hasItemRate) conflictSource = `Chiết khấu mã hàng từng mặt hàng (%) đang gắn`;
          else if (hasLoyalty) conflictSource = `Chiết khấu Hội viên tích lũy: "${selectedCustomer.name}"`;
          else if (hasEmployee) conflictSource = `Chiết khấu Nhân viên liên kết: "${employeeName}"`;
          else if (hasManager) conflictSource = `Giám sát phê duyệt đặc quyền vãng lai`;
          else if (hasQuick) conflictSource = `Mức phạt bù đắp ca trực`;
          else if (hasBirthday) conflictSource = `Ưu đãi sinh nhật vàng của khách hàng`;

          modal.warning({
            title: 'Chồng chéo chiết khấu phần trăm (%)!',
            style: { top: 80 },
            content: `Theo quy chuẩn cấu hình POS, hệ thống nghiêm cấm chồng chéo đồng thời nhiều loại chiết khấu %. Hiện đang có "${conflictSource}" hoạt động. Vui lòng hủy bỏ ưu đãi kia trước khi kích hoạt thẻ này!`,
            okText: 'Tôi hiểu'
          });
          return;
        }
      }
    }
    
    // For bill scope, easy toggle in array
    if (promo.scope === 'bill') {
      setActivePromos(prev => {
        const exist = prev.includes(promo.id);
        if (exist) {
          return prev.filter(id => id !== promo.id);
        } else {
          return [...prev, promo.id];
        }
      });
    }
  };

  // Handle assigning item-level promos (PROBLEM 7)
  const handleAssignItemPromo = (promoId: string, productId: string) => {
    if (isPaymentStarted) return;
    
    if (billingCalculations.finalBillTotal <= 0 && !appliedItemPromos[productId]) {
      modal.warning({
        title: 'Hóa đơn đã đạt 0 đ',
        content: 'Hóa đơn thực thu đã đạt mốc 0 ₫, từ chối gán thêm chương trình khuyến mãi mặt hàng cho sản phẩm này.',
        okText: 'Tôi hiểu'
      });
      return;
    }

    const promo = availablePromos.find(p => p.id === promoId);
    if (!promo) return;

    if (isPromoExpired(promo)) {
      modal.error({
        title: 'Chương trình khuyến mãi hết hạn / ngoài giờ',
        content: `Không thể áp dụng chương trình "${promo.title || promo.name || 'Khuyến mãi'}" vì đã hết hạn hoặc đang ngoài giờ hoạt động cấu hình!`,
        okText: 'Tôi hiểu'
      });
      return;
    }

    const activePromoKeys = [...activePromos, ...Object.values(appliedItemPromos)];
    
    // Check exclusions
    if (promo.excludePromoKeys && Array.isArray(promo.excludePromoKeys)) {
      const conflictingKey = promo.excludePromoKeys.find(k => activePromoKeys.includes(k));
      if (conflictingKey) {
        const otherObj = availablePromos.find(o => o.id === conflictingKey);
        modal.warning({
          title: 'Chồng chéo khuyến mãi bị loại trừ!',
          style: { top: 80 },
          content: `Không thể áp dụng "${promo.name}" vì quy định loại trừ hoàn toàn (không được gộp) với chương trình "${otherObj?.name || conflictingKey}" hiện đang hoạt động. Vui lòng tắt chương trình kia trước!`,
          okText: 'Tôi hiểu'
        });
        return;
      }
    }

    const excludingActivePromo = availablePromos.filter(p => activePromoKeys.includes(p.id))
      .find(p => p.excludePromoKeys && p.excludePromoKeys.includes(promo.id));
    if (excludingActivePromo) {
      modal.warning({
        title: 'Chồng chéo khuyến mãi bị loại trừ!',
        style: { top: 80 },
        content: `Không thể áp dụng "${promo.name}" vì chương trình "${excludingActivePromo.name}" hiện đang hoạt động có quy định xung đột loại trừ hoàn toàn với chương trình này. Vui lòng tắt chương trình kia trước!`,
        okText: 'Tôi hiểu'
      });
      return;
    }

    // Check % overlap
    const activeBillRatePromo = availablePromos.find(p => p.isRate && activePromos.includes(p.id));
    const hasLoyalty = selectedCustomer.discRate > 0 && !onlyEarnPoints;
    const hasEmployee = employeeDiscountApplied;
    const hasManager = managerApproval !== null && managerDiscountRate > 0;
    const hasQuick = quickDiscountPercent > 0;
    const hasBirthday = birthdayPromoActive;

    if (activeBillRatePromo || hasLoyalty || hasEmployee || hasManager || hasQuick || hasBirthday) {
      let conflictSource = '';
      if (activeBillRatePromo) conflictSource = `Chương trình giảm bill "%": "${activeBillRatePromo.name}"`;
      else if (hasLoyalty) conflictSource = `Chiết khấu Hội viên tích lũy: "${selectedCustomer.name}"`;
      else if (hasEmployee) conflictSource = `Chiết khấu Nhân viên liên kết`;
      else if (hasManager) conflictSource = `Giám sát trực ban phê duyệt`;
      else if (hasQuick) conflictSource = `Chiết khấu phạt khiếu nại ca trực`;
      else if (hasBirthday) conflictSource = `Ưu đãi sinh nhật vàng`;

      modal.warning({
        title: 'Chồng chéo chiết khấu phần trăm (%)!',
        style: { top: 80 },
        content: `Hệ thống khống chế: Không gộp chiết khấu % giữa mặt hàng và các ưu đãi tỉ lệ % khác. Hiện đang có "${conflictSource}" hoạt động. Vui lòng tắt ưu đãi kia trước khi áp cho mặt hàng này!`,
        okText: 'Tôi hiểu'
      });
      return;
    }

    setAppliedItemPromos(prev => ({
      ...prev,
      [productId]: promoId
    }));
    modal.success({
      title: 'Đã áp dụng mã',
      content: 'Đã gắn chương trình giảm giá mặt hàng thành công cho sản phẩm đã chọn.'
    });
  };

  const handleRemoveItemPromo = (productId: string) => {
    if (isPaymentStarted) return;
    setAppliedItemPromos(prev => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  // Corporate employee discount setup
  const handleEmployeeCodeSubmit = (code: string) => {
    if (billingCalculations.finalBillTotal <= 0) {
      modal.warning({
        title: 'Hóa đơn đã đạt 0 đ',
        content: 'Hóa đơn thực thu đã đạt mốc 0 ₫, hệ thống từ chối áp dụng thêm chiết khấu nhân viên.',
        okText: 'Tôi hiểu'
      });
      return;
    }

    const hasBillRate = availablePromos.some(p => p.isRate && activePromos.includes(p.id));
    const hasItemRate = Object.keys(appliedItemPromos).length > 0;
    const hasLoyalty = selectedCustomer.discRate > 0 && !onlyEarnPoints;
    const hasManager = managerApproval !== null && managerDiscountRate > 0;
    const hasQuick = quickDiscountPercent > 0;
    const hasBirthday = birthdayPromoActive;

    if (hasBillRate || hasItemRate || hasLoyalty || hasManager || hasQuick || hasBirthday) {
      modal.warning({
        title: 'Chồng chéo chiết khấu %',
        style: { top: 80 },
        content: 'Không thể áp dụng chiết khấu nhân viên đồng thời cùng với các ưu đãi tỉ lệ phần trăm (%) khác đang kích hoạt. Vui lòng tắt các ưu đãi % khác trước!',
        okText: 'Tôi hiểu'
      });
      return;
    }

    const norm = code.toUpperCase().trim();
    if (norm === 'EMP-100' || norm === 'EMP-200' || norm === 'EMP-300') {
      const name = norm === 'EMP-100' ? 'Đặng Văn Lâm' : norm === 'EMP-200' ? 'Phạm Minh Đức' : 'Nguyễn Khánh Linh';
      setEmployeeDiscountApplied(true);
      setEmployeeName(name);
      setEmployeeCode('');
      modal.success({ title: 'Áp dụng thành công', content: `Đã liên kết nhân viên: ${name} (Ưu đãi 10%).` });
    } else {
      modal.error({ title: 'Mã sai cấu trúc', content: 'Mã nhân viên kiểm thử bao gồm EMP-100, EMP-200, hoặc EMP-300.' });
    }
  };

  const handleClearEmployeeDiscount = () => {
    setEmployeeDiscountApplied(false);
    setEmployeeName('');
  };

  // Manager Approval code auth
  const handleManagerSubmit = () => {
    if (billingCalculations.finalBillTotal <= 0) {
      modal.warning({
        title: 'Hóa đơn đã đạt 0 đ',
        content: 'Hóa đơn thực thu đã đạt mốc 0 ₫, không cần thực hiện phê duyệt chiết khấu của quản lý.',
        okText: 'Tôi hiểu'
      });
      return;
    }

    const hasBillRate = availablePromos.some(p => p.isRate && activePromos.includes(p.id));
    const hasItemRate = Object.keys(appliedItemPromos).length > 0;
    const hasLoyalty = selectedCustomer.discRate > 0 && !onlyEarnPoints;
    const hasEmployee = employeeDiscountApplied;
    const hasQuick = quickDiscountPercent > 0;
    const hasBirthday = birthdayPromoActive;

    if (hasBillRate || hasItemRate || hasLoyalty || hasEmployee || hasQuick || hasBirthday) {
      modal.warning({
        title: 'Chồng chéo chiết khấu %',
        style: { top: 80 },
        content: 'Không thể ủy quyền giảm giá cho quản lý cấp cao tại chỗ vì hệ thống hiện đang có các chương trình chiết khấu (%) khác hoạt động. Vui lòng tắt các ưu đãi kia trước!',
        okText: 'Tôi hiểu'
      });
      return;
    }

    if (managerPin === '1234') {
      const label = managerUsername === 'admin' ? 'Admin Supervisor' : managerUsername === 'manager01' ? 'Cửa hàng trưởng - Anh Kỳ' : 'Giám sát trực - Chị Trang';
      setManagerApproval({ name: label });
      setManagerPin('');
      // Set a default of 10%
      setManagerDiscountRate(0.10);
      modal.success({ title: 'Phê duyệt thành công', content: `Chào mừng quản lý "${label}". Vui lòng điều chỉnh dải tỉ lệ chiết khấu bên dưới.` });
    } else {
      modal.error({ title: 'Nhập sai mã PIN', content: 'Mã PIN bảo mật ca trực không đúng (vui lòng sử dụng mã PIN dùng thử: 1234).' });
    }
  };

  const handleRemoveManagerDiscount = () => {
    setManagerApproval(null);
    setManagerDiscountRate(0);
  };

  // Quick complain reduction
  const handleQuickDiscount = (pct: number) => {
    if (pct > quickDiscountPercent && billingCalculations.finalBillTotal <= 0) {
      modal.warning({
        title: 'Hóa đơn đã đạt 0 đ',
        content: 'Hóa đơn thực thu đã đạt mốc 0 ₫, không thể tăng thêm tỷ lệ giảm ca trực.',
        okText: 'Tôi hiểu'
      });
      return;
    }

    if (pct > 0) {
      const hasBillRate = availablePromos.some(p => p.isRate && activePromos.includes(p.id));
      const hasItemRate = Object.keys(appliedItemPromos).length > 0;
      const hasLoyalty = selectedCustomer.discRate > 0 && !onlyEarnPoints;
      const hasEmployee = employeeDiscountApplied;
      const hasManager = managerApproval !== null && managerDiscountRate > 0;
      const hasBirthday = birthdayPromoActive;

      if (hasBillRate || hasItemRate || hasLoyalty || hasEmployee || hasManager || hasBirthday) {
        modal.warning({
          title: 'Chồng chéo chiết khấu %',
          style: { top: 80 },
          content: 'Không gộp tỷ lệ bồi hoàn ca trực với các ưu đãi phần trăm (%) khác. Vui lòng tắt các ưu đãi % hiện có trước!',
          okText: 'Tôi hiểu'
        });
        return;
      }
    }
    setQuickDiscountPercent(pct);
  };

  // Voucher validation and activation (Urbox / Gotit)
  const handleApplyVoucher = (code: string) => {
    if (isPaymentStarted) return;
    if (cart.length === 0) {
      modal.warning({
        title: 'Chưa chọn mã hàng',
        content: 'Yêu cầu giỏ hàng phải có ít nhất một sản phẩm trước khi cập nhật hay áp mã giảm giá!'
      });
      return;
    }

    if (billingCalculations.finalBillTotal <= 0) {
      modal.warning({
        title: 'Không thể áp dụng',
        content: 'Hóa đơn thực thu đã đạt mốc 0 ₫, hệ thống từ chối nạp thêm voucher chồng chéo dư thừa.'
      });
      return;
    }

    const normalized = code.toUpperCase().trim();
    let target = null;
    if (normalized.startsWith('GOTIT200')) target = { value: 200000, label: 'Gotit Voucher 200K' };
    else if (normalized.startsWith('GOTIT500')) target = { value: 500000, label: 'Gotit Voucher 500K' };
    else if (normalized.startsWith('URBOX1M')) target = { value: 1000000, label: 'Urbox Coupon 1 Triệu' };
    else if (normalized.startsWith('COMP500')) target = { value: 500000, label: 'Nội bộ Công ty 500K' };

    if (!target) {
      modal.error({
        title: 'Mã coupon lỗi',
        content: `Mã "${code}" không tồn tại hoặc đã quá hạn trên cổng đối soát.`
      });
      return;
    }

    if (appliedVouchers.some(v => v.code === normalized)) {
      modal.warning({ title: 'Trùng mã', content: 'Voucher này đã được nhập trước đó.' });
      return;
    }

    setAppliedVouchers(prev => [...prev, { code: normalized, ...target }]);
    setVoucherCode('');
    modal.success({ title: 'Nhập voucher thành công', content: `Đã bớt ${formatVND(target.value)} từ ${target.label}.` });
  };

  const handleRemoveVoucher = (code: string) => {
    if (isPaymentStarted) return;
    setAppliedVouchers(prev => prev.filter(v => v.code !== code));
  };

  // Special Gift Cards & Birthday vouchers (PROBLEM 2)
  const handleApplySpecialVoucher = () => {
    if (billingCalculations.finalBillTotal <= 0) {
      modal.warning({
        title: 'Hóa đơn đã đạt 0 đ',
        content: 'Hóa đơn thực thu đã đạt mốc 0 ₫, hệ thống từ chối áp dụng thêm voucher ưu đãi cá nhân thương nhân.',
        okText: 'Tôi hiểu'
      });
      return;
    }
    const code = specialVoucherCode.toUpperCase().trim();
    if (code === 'SINHNHATVIP' || code === 'BDAY500') {
      const hasBillRate = availablePromos.some(p => p.isRate && activePromos.includes(p.id));
      const hasItemRate = Object.keys(appliedItemPromos).length > 0;
      const hasLoyalty = selectedCustomer.discRate > 0 && !onlyEarnPoints;
      const hasEmployee = employeeDiscountApplied;
      const hasManager = managerApproval !== null && managerDiscountRate > 0;
      const hasQuick = quickDiscountPercent > 0;

      if (hasBillRate || hasItemRate || hasLoyalty || hasEmployee || hasManager || hasQuick) {
        modal.warning({
          title: 'Chồng chéo chiết khấu %',
          style: { top: 80 },
          content: 'Không thể kích hoạt ưu đãi phần trăm sinh nhật vàng (15%) vì hệ thống đang hoạt động một chương trình chiết khấu (%) khác. Vui lòng tắt chiết khấu kia trước!',
          okText: 'Tôi hiểu'
        });
        return;
      }

      setBirthdayPromoActive(true);
      setBirthdayPromoDiscount(500000); // 500,000 VND
      setSpecialVoucherCode('');
      modal.success({ 
        title: 'Sinh nhật hồng!', 
        content: 'Nhân diện voucher sinh nhật VIP: Áp dụng chương trình % có lợi nhất (15%) và cộng dồn bớt thêm 500.000 ₫!' 
      });
    } else if (code === 'LOVALTY100') {
      setBirthdayPromoActive(false);
      setBirthdayPromoDiscount(100000); // 100,000 VND
      setSpecialVoucherCode('');
      modal.success({ 
        title: 'Ưu đãi Loyalty', 
        content: 'Kích hoạt phiếu quà tặng thành viên: Bớt trực tiếp 100.000 ₫ cộng dồn vào bill!' 
      });
    } else {
      modal.error({ 
        title: 'Không tìm thấy ưu đãi', 
        content: 'Mã khuyến mãi cá nhân không hợp lệ. Hãy thử nhập mã: SINHNHATVIP hoặc LOVALTY100.' 
      });
    }
  };

  const handleSelectCustomer = (c: any) => {
    if (isPaymentStarted) return;
    
    // If they select a customer that has a discount rate > 0 and onlyEarnPoints is false (so it wants discount)
    if (c.discRate > 0 && !onlyEarnPoints) {
      const hasBillRate = availablePromos.some(p => p.isRate && activePromos.includes(p.id));
      const hasItemRate = Object.keys(appliedItemPromos).length > 0;
      const hasEmployee = employeeDiscountApplied;
      const hasManager = managerApproval !== null && managerDiscountRate > 0;
      const hasQuick = quickDiscountPercent > 0;
      const hasBirthday = birthdayPromoActive;

      // Conflict matches! Ask if we should assign them to Point accumulation only instead, or notify cleanly.
      if (hasBillRate || hasItemRate || hasEmployee || hasManager || hasQuick || hasBirthday) {
        modal.warning({
          title: 'Chồng chéo chiết khấu %',
          style: { top: 80 },
          content: `Hội viên "${c.name}" có quyền lợi chiết khấu -${c.discRate * 100}%. Tuy nhiên, hệ thống đã kích hoạt chương trình chiết khấu (%) khác. Để tránh xung đột chồng chéo, thẻ hội viên này sẽ được gắn liên kết tạm thời ở chế độ "Tích điểm 5%". Bạn có thể chuyển về giảm giá sau khi gỡ bỏ ưu đãi kia!`,
          okText: 'Tôi hiểu, đặt sang tích điểm',
          onOk: () => {
            setOnlyEarnPoints(true);
            setSelectedCustomerId(c.id);
          }
        });
        return;
      }
    }
    
    setSelectedCustomerId(c.id);
  };

  const handleToggleOnlyEarnPoints = (checked: boolean) => {
    if (isPaymentStarted) return;
    if (!checked) { // wants to activate the card rate (moving off Accumulation modes)
      const hasBillRate = availablePromos.some(p => p.isRate && activePromos.includes(p.id));
      const hasItemRate = Object.keys(appliedItemPromos).length > 0;
      const hasEmployee = employeeDiscountApplied;
      const hasManager = managerApproval !== null && managerDiscountRate > 0;
      const hasQuick = quickDiscountPercent > 0;
      const hasBirthday = birthdayPromoActive;

      if (hasBillRate || hasItemRate || hasEmployee || hasManager || hasQuick || hasBirthday) {
        modal.warning({
          title: 'Chồng chéo chiết khấu %',
          style: { top: 80 },
          content: 'Không thể chuyển đổi về chế độ giảm giá thẻ hội viên vì hóa đơn hiện đang chạy một chương trình chiết khấu tỉ lệ % khác. Vui lòng tắt chiết khấu kia trước!',
          okText: 'Tôi hiểu'
        });
        return;
      }
    }
    setOnlyEarnPoints(checked);
  };

  const handleClearSpecialVoucher = () => {
    setBirthdayPromoActive(false);
    setBirthdayPromoDiscount(0);
  };

  // Multi-payment setup
  const handlePaymentValueChange = (method: 'cash' | 'atm', val: number | null) => {
    const rawVal = val || 0;
    const otherPaymentsTotal = Object.entries(payments)
      .filter(([k]) => k !== method)
      .reduce((acc, [, v]) => acc + v, 0);

    const maxAllowed = Math.max(0, billingCalculations.finalBillTotal - otherPaymentsTotal);
    const finalVal = Math.min(rawVal, maxAllowed);

    setPayments(prev => ({
      ...prev,
      [method]: finalVal
    }));
  };

  const handleOpenQrGenerator = (method: 'zalopay' | 'vnpay') => {
    const outstanding = billingCalculations.remainingToPay;
    if (outstanding <= 0) {
      modal.info({ title: 'Thu đủ', content: 'Hóa đơn này hiện đã thu đủ tiền, không cần quét thêm QR.' });
      return;
    }
    setActiveQrMethod(method);
    setQrRemainingAmount(outstanding);
    setQrModalVisible(true);
  };

  const handleSimulateQrSuccess = () => {
    if (!activeQrMethod) return;
    
    setPayments(prev => ({
      ...prev,
      [activeQrMethod]: prev[activeQrMethod] + qrRemainingAmount
    }));

    setQrModalVisible(false);
    setActiveQrMethod(null);
    modal.success({ title: 'Thanh toán QR thành công', content: 'SandBox Gateway đã phản hồi mã giao dịch thành công.' });
  };

  const handleRefundPayments = () => {
    setPayments({ cash: 0, atm: 0, zalopay: 0, vnpay: 0 });
    modal.info({ title: 'Đã hoàn trả', content: 'Đã rút toàn bộ số quỹ thanh toán tạm tính để mở khóa sửa đổi hóa đơn.' });
  };

  // Completed print setup
  const handleCheckoutComplete = () => {
    if (billingCalculations.remainingToPay > 0) {
      modal.error({
        title: 'Số dư thiếu hụt',
        content: `Cần nạp bổ sung ${formatVND(billingCalculations.remainingToPay)} nữa trước khi đóng sổ và in bill.`
      });
      return;
    }

    if (cart.length === 0) {
      modal.error({
        title: 'Không thể in bill rỗng',
        content: 'Vui lòng thêm sản phẩm vào hóa đơn trước khi đóng giao dịch.'
      });
      return;
    }

    const currentLocalUser = currentUser || { name: 'Thu Ngân Kiosk', role: 'Premium Staff' };

    const transactionRecord = {
      key: orderId,
      id: orderId,
      customer: selectedCustomer.name,
      customerId: selectedCustomer.id,
      customerTier: selectedCustomer.tier,
      parentTier: selectedParentTier === 'retail' ? 'Khách lẻ' : 'Khách sỉ',
      onlyEarnPoints: onlyEarnPoints,
      loyaltyDiscountRate: selectedCustomer.discRate,
      pointsEarned: (selectedCustomer.id !== 'CUST-R01' && selectedCustomer.id !== 'CUST-W01') ? Math.round(billingCalculations.finalBillTotal * 0.05) : 0,
      amount: formatVND(billingCalculations.finalBillTotal),
      rawAmount: billingCalculations.finalBillTotal,
      date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      operator: currentLocalUser.name,
      productsCount: cart.length,
      detail: {
        items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: formatVND(c.price) })),
        discounts: {
          percentAppliedPath: billingCalculations.bestPercentDiscount ? `${billingCalculations.bestPercentDiscount.label} (-${formatVND(billingCalculations.bestPercentDiscount.amount)})` : 'Không có',
          cashAppliedCompounded: formatVND(billingCalculations.totalCashDiscountsTotal)
        },
        paymentBreakdown: payments
      }
    };

    logAction('POS_CHECKOUT_COMPLETE', {
      element: 'Button_Final',
      text: `Invoiced checkout complete: ${orderId}`,
      value: JSON.stringify(transactionRecord)
    });

    setCheckoutReceipt(transactionRecord);
    setReceiptModalVisible(true);
  };

  // Helper to dynamically locate title of a key in consoleMenus hierarchy
  const findMenuTitle = (keys: string[]): string => {
    let currentPool = consoleMenus;
    let title = '';
    for (let i = 0; i < keys.length; i++) {
      const matchKey = keys[i];
      const found = currentPool.find((n: any) => n.key === matchKey);
      if (found) {
        title = found.title;
        if (found.children) {
          currentPool = found.children;
        }
      }
    }
    return title || keys[keys.length - 1];
  };

  // Helper to find a specific menu node in our consoleMenus nestable structure by key path
  const findMenuNodeByPath = (keys: string[]): any => {
    let currentPool = consoleMenus;
    let foundNode: any = null;
    for (let i = 0; i < keys.length; i++) {
      const matchKey = keys[i];
      const match = currentPool.find((item: any) => item.key === matchKey);
      if (match) {
        foundNode = match;
        if (match.children) {
          currentPool = match.children;
        }
      } else {
        break;
      }
    }
    return foundNode;
  };

  // Clickable path breadcrumbs for hierarchy navigation with Home button support
  const renderBreadcrumbs = () => {
    if (menuPath.length === 0) return null;

    return (
      <div style={{ 
        background: '#fcfcfc', 
        padding: '8px 12px', 
        borderRadius: 8, 
        marginBottom: 14, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #f0f0f0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, flexWrap: 'wrap' }}>
          <span 
            style={{ cursor: 'pointer', color: '#1677ff', fontWeight: 500 }} 
            onClick={goHome}
          >
            🏠 Menu chính
          </span>
          {menuPath.map((path, idx) => {
            const isLast = idx === menuPath.length - 1;
            const subPathKeys = menuPath.slice(0, idx + 1);
            const label = findMenuTitle(subPathKeys);
            return (
              <React.Fragment key={idx}>
                <span style={{ color: '#bfbfbf' }}>/</span>
                <span 
                  style={{ 
                    cursor: isLast ? 'default' : 'pointer', 
                    color: isLast ? '#595959' : '#1677ff', 
                    fontWeight: isLast ? '600' : 'normal' 
                  }}
                  onClick={() => {
                    if (!isLast) {
                      setMenuPath(subPathKeys);
                    }
                  }}
                >
                  {label}
                </span>
              </React.Fragment>
            );
          })}
        </div>
        <Button 
          type="link" 
          size="small" 
          icon={<Home size={12} />} 
          onClick={goHome} 
          style={{ padding: 0, height: 'auto', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          Trực tiếp Home
        </Button>
      </div>
    );
  };

  // Operator Console View Components
  const renderOperatorConsoleView = () => {
    // Determine current active node & view
    const currentNode = menuPath.length > 0 ? findMenuNodeByPath(menuPath) : null;
    const currentView = currentNode ? currentNode.actionView : 'home';

    // 1. HOME GATEWAY ROOT (menuPath is empty or we are at home)
    if (currentView === 'home') {
      return (
        <div style={{ padding: '4px 0' }} id="pos-menu-root">
          <Title level={4} style={{ marginBottom: 4, letterSpacing: '-0.3px' }}>Bàn Điều Hành Kiosk Bán Hàng</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 13 }}>
            Thiết lập thuộc tính, chương trình khuyến mãi và xử lý thanh toán hóa đơn.
          </Text>

          <Row gutter={[12, 12]}>
            {consoleMenus.map(menuItem => {
              const textSnippet = menuItem.key === 'customers' 
                ? (selectedCustomer.name.length > 18 ? selectedCustomer.name.substring(0, 18) + '...' : selectedCustomer.name)
                : menuItem.key === 'payment'
                ? `Tổng phải thu: ${formatVND(billingCalculations.finalBillTotal)} • Đã nạp: ${formatVND(billingCalculations.paidSum)}`
                : menuItem.description;
              return (
                <Col span={menuItem.key === 'payment' ? 24 : 12} key={menuItem.key}>
                  <Card 
                    hoverable
                    onClick={() => pushMenu(menuItem.key)}
                    style={{ 
                      background: menuItem.background || '#f0f5ff', 
                      border: menuItem.border || '1px solid #adc6ff', 
                      borderRadius: 12,
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {renderMenuIcon(menuItem.icon, 28, menuItem.color || '#2f54eb')}
                    <Title level={5} style={{ margin: '6px 0 2px', color: menuItem.color || '#1d39c4', fontSize: 13.5 }}>
                      {menuItem.title}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {textSnippet}
                    </Text>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <div style={{ marginTop: 16, border: '1.5px dashed #fa541c', borderRadius: 10, background: '#fff2e8', padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Settings size={18} style={{ color: '#fa541c' }} />
                <div>
                  <strong style={{ fontSize: 12, color: '#fa541c', display: 'block' }}>⚙️ Trung Tâm Cấu Hình Khuyến Mãi (Quản Trị)</strong>
                  <span style={{ fontSize: 10, color: '#595959', display: 'block', marginTop: 1 }}>Cấu hình các Chương trình Ưu đãi của bạn tại đây, điều chỉnh luật hoặc sửa đồng bộ dữ liệu JSONB.</span>
                </div>
              </div>
              <Button 
                type="primary" 
                size="small" 
                style={{ backgroundColor: '#fa541c', borderColor: '#fa541c', fontSize: 10.5, fontWeight: 'bold' }}
                onClick={() => setIsJsonModalVisible(true)}
              >
                MỞ CẤU HÌNH
              </Button>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: 12, background: '#fafafa', borderRadius: 10, border: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <ShieldAlert size={18} style={{ color: '#1677ff', marginTop: 2 }} />
              <div>
                <Text strong style={{ fontSize: 12, display: 'block' }}>Quy tắc dòng tiền đặc thù:</Text>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                  - Tránh áp trùng lập nhiều loại % giảm giá (hệ thống tự chọn cái hấp dẫn nhất).<br />
                  - Tự do cộng hưởng, gộp tất cả các voucher giảm giá tiền mặt trực tiếp.<br />
                  - Yêu cầu bill có sản phẩm trước mới cho phép cấu hình chiết khấu/thanh toán.
                </Text>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 1B. DYNAMIC FOLDER VIEWS (Recursively displays and links children)
    if (currentNode && currentNode.type === 'folder') {
      const children = currentNode.children || [];
      const navChildren = children.filter((c: any) => c.type === 'folder' || c.type === 'action');
      const promoChildren = children.filter((c: any) => c.type === 'toggle_promo' || c.type === 'assigned_item_promo');

      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Button size="small" icon={<ArrowLeft size={12} />} onClick={popMenu}>
              {menuPath.length > 1 ? 'Quay lại' : 'Menu chính'}
            </Button>
            <Tag color="volcano" style={{ fontWeight: '600' }}>{currentNode.title}</Tag>
          </div>

          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginBottom: 14 }}>
            {currentNode.description || 'Chọn danh mục bên dưới để áp dụng cấu hình hoặc duyệt cấp tương ứng:'}
          </Text>

          {/* Subfolders & Action Buttons */}
          {navChildren.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {navChildren.map((child: any) => {
                const textSnippet = child.description && child.description.length > 55
                  ? child.description.substring(0, 52) + '...'
                  : child.description;
                return (
                  <Button 
                    key={child.key}
                    block 
                    type="dashed" 
                    size="large" 
                    style={{ 
                      height: 52, 
                      textAlign: 'left', 
                      padding: '4px 12px',
                      background: child.background || '#fff',
                      border: child.border || '1px solid #e8e8e8',
                      borderRadius: 10
                    }} 
                    onClick={() => pushMenu(child.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Space>
                        {renderMenuIcon(child.icon || 'Gift', 18, child.color)}
                        <div style={{ textAlign: 'left' }}>
                          <Text strong style={{ fontSize: 11.5, color: child.color || '#333', display: 'block', lineHeight: '14px' }}>
                            {child.title}
                          </Text>
                          <Text type="secondary" style={{ display: 'block', fontSize: 9.5, fontWeight: 'normal' }}>
                            {textSnippet}
                          </Text>
                        </div>
                      </Space>
                      <Tag color="blue" style={{ margin: 0, fontSize: 8 }}>Cấp con</Tag>
                    </div>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Inline Active Campaign Controls */}
          {promoChildren.length > 0 && (
            <div style={{ marginTop: navChildren.length > 0 ? 16 : 0 }}>
              <Divider orientation="left" style={{ margin: '12px 0 10px', fontSize: 10.5, color: '#8c8c8c', fontWeight: 'bold' }}>
                CHIẾN DỊCH KHUYẾN MÃI LIÊN KẾT TRỰC THUỘC
              </Divider>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {promoChildren.map((p: any) => {
                  if (p.type === 'toggle_promo') {
                    // Bill-level campaign toggle card
                    const isActive = activePromos.includes(p.key);
                    const isExpired = isPromoExpired(p);
                    const formattedValue = p.isRate ? `${p.value * 100}%` : formatVND(p.value);
                    return (
                      <div 
                        key={p.key}
                        onClick={() => handleTogglePromo({ id: p.key, scope: 'bill', ...p })}
                        style={{
                          background: isActive ? '#f6ffed' : (isExpired ? '#fff0f6' : '#fff'),
                          border: isActive ? '1.5px solid #52c41a' : (isExpired ? '1.5px dashed #ff4d4f' : '1px solid #e8e8e8'),
                          padding: '10px 12px',
                          borderRadius: 8,
                          cursor: isExpired ? 'not-allowed' : 'pointer',
                          opacity: isExpired ? 0.6 : 1,
                          filter: isExpired ? 'grayscale(30%)' : 'none',
                          transition: 'all 0.2s',
                          boxShadow: isActive ? '0 2px 6px rgba(82,196,26,0.06)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                          <Space size={6}>
                            {renderMenuIcon(p.icon || 'Sparkles', 14, isExpired ? '#ff4d4f' : (p.color || '#52c41a'))}
                            <Text strong style={{ fontSize: 11.5, color: isActive ? '#237804' : (isExpired ? '#cf1322' : '#333'), textDecoration: isExpired ? 'line-through' : 'none' }}>
                              {p.title}
                            </Text>
                          </Space>
                          {isExpired ? (
                            <Tag color="error" style={{ fontSize: 9, margin: 0, fontWeight: 'bold' }}>
                              ⚠️ HẾT HẠN / NGOÀI GIỜ
                            </Tag>
                          ) : (
                            <Tag color={isActive ? 'success' : 'default'} style={{ fontSize: 9, margin: 0 }}>
                              {isActive ? 'ĐANG BẬT' : 'TẮT'}
                            </Tag>
                          )}
                        </div>
                        <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>
                          {p.description} (Mốc giảm: <strong style={{ color: '#f5222d' }}>{formattedValue}</strong>)
                        </Text>
                      </div>
                    );
                  } else {
                    // Item-level campaign assignment card
                    const isExpired = isPromoExpired(p);
                    const formattedValue = `-${p.value * 100}%`;
                    return (
                      <Card 
                        key={p.key} 
                        size="small" 
                        style={{ 
                          border: isExpired ? '1.5px dashed #ff4d4f' : '1px solid #e8e8e8', 
                          borderRadius: 8, 
                          background: isExpired ? '#fff0f6' : '#fafafa',
                          opacity: isExpired ? 0.6 : 1
                        }}
                        styles={{ body: { padding: 10 } }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <Space size={6}>
                            {renderMenuIcon(p.icon || 'Tags', 14, isExpired ? '#ff4d4f' : (p.color || '#1890ff'))}
                            <Text strong style={{ fontSize: 11.5, color: isExpired ? '#cf1322' : '#111', textDecoration: isExpired ? 'line-through' : 'none' }}>{p.title}</Text>
                          </Space>
                          <Space size={4}>
                            <Tag color="purple" style={{ fontSize: 9, margin: 0, fontWeight: 'bold' }}>{formattedValue}</Tag>
                            {isExpired && (
                              <Tag color="error" style={{ fontSize: 9, margin: 0, fontWeight: 'bold' }}>
                                ⚠️ HẾT HẠN / NGOÀI GIỜ
                              </Tag>
                            )}
                          </Space>
                        </div>
                        <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>
                          {p.description}
                        </Text>

                        <div>
                          <Text type="secondary" style={{ fontSize: 9, display: 'block', fontWeight: 'bold', color: '#8c8c8c' }}>
                            ÁP DỤNG CHO DÒNG SP TRONG GIỎ:
                          </Text>
                          {cart.length === 0 ? (
                            <span style={{ fontSize: 9, color: '#bfbfbf', fontStyle: 'italic', display: 'block', marginTop: 4 }}>
                              Giỏ hàng đang trống. Thêm Giày dép hoặc Balo để gán.
                            </span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                              {cart.map(item => {
                                const isAssigned = appliedItemPromos[item.id] === p.key;
                                const isEligible = p.promoType === 'item'
                                  ? (p.targetId && p.targetId.split(',').map((s: string) => s.trim()).includes(item.id))
                                  : (p.targetId && p.targetId.split(',').map((s: string) => s.trim()).includes(item.category));
                                
                                return (
                                  <div 
                                    key={item.id} 
                                    style={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center', 
                                      padding: '4px 6px', 
                                      background: '#fff', 
                                      borderRadius: 4, 
                                      border: '1px solid #e8e8e8' 
                                    }}
                                  >
                                    <Text style={{ fontSize: 10 }} disabled={!isEligible || isExpired}>
                                      {item.name.substring(0, 22)}... {!isEligible && ' (Không khớp mẫu)'}
                                    </Text>
                                    {isAssigned ? (
                                      <Button 
                                        size="small" 
                                        type="link" 
                                        danger 
                                        style={{ fontSize: 9, padding: 0, height: 18 }} 
                                        onClick={() => handleRemoveItemPromo(item.id)}
                                      >
                                        Hủy gắn
                                      </Button>
                                    ) : (
                                      <Button 
                                        size="small" 
                                        type="primary" 
                                        ghost 
                                        disabled={!isEligible || isExpired}
                                        style={{ fontSize: 9, height: 18, lineHeight: 1, padding: '0 4px' }}
                                        onClick={() => handleAssignItemPromo(p.key, item.id)}
                                      >
                                        Gắn mã
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {/* Advanced linked JSON editor trigger at the root levels */}
          {(currentNode.key === 'promotions' || currentNode.key === 'system') && (
            <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px dashed #eee', paddingTop: 16 }}>
              <Button 
                type="dashed"
                icon={<Lock size={12} />} 
                onClick={() => setIsJsonModalVisible(true)}
                style={{ borderRadius: 8, fontSize: 11, color: '#fa541c', borderColor: '#ffbb96' }}
              >
                🔧 Đồng bộ & Quản lý Liên kết JSONB (Linh hoạt)
              </Button>
            </div>
          )}
        </div>
      );
    }

    // 2. DETAILED PRODUCTS CATALOG VIEW
    if (currentView === 'products_catalog' || currentView === 'products') {
      const filtered = products.filter(p => {
        const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.barcode.includes(searchQuery);
        return matchesCat && matchesSearch;
      });

      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Button size="small" icon={<ArrowLeft size={12} />} onClick={popMenu}>Menu chính</Button>
            <Tag color="blue">Kiosk Goods Inventory</Tag>
          </div>

          <div style={{ marginBottom: 14 }}>
            <Row gutter={[8, 8]}>
              <Col xs={12}>
                <Input
                  prefix={<Search size={13} style={{ color: '#999' }} />}
                  placeholder="Mã/Tên mặt hàng..."
                  allowClear
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                />
              </Col>
              <Col xs={12}>
                <Input
                  prefix={<ScanLine size={13} style={{ color: '#52c41a' }} />}
                  placeholder="Quét mã vạch..."
                  size="small"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onPressEnter={handleBarcodeSubmit}
                  addonAfter={
                    <Button type="link" size="small" onClick={handleBarcodeSubmit} style={{ border: 'none', height: 20, padding: 0 }}>
                      Scan
                    </Button>
                  }
                />
              </Col>
            </Row>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Tabs 
              activeKey={categoryFilter} 
              onChange={setCategoryFilter}
              size="small"
              tabBarStyle={{ marginBottom: 0 }}
              items={[
                { key: 'All', label: 'Tất cả' },
                { key: 'Electronics', label: '👟 Giày dép' },
                { key: 'Fashion', label: '🎒 Balo & Túi xách' },
                { key: 'Food', label: '💼 Ví & Thắt lưng' },
                { key: 'Sports', label: '🧴 Chăm sóc giày' },
              ]}
            />
            <Popover 
              title="Quét thử nhanh bằng Sim-Scan"
              content={
                <div style={{ width: 280, maxHeight: 180, overflowY: 'auto' }}>
                  {products.slice(0, 6).map(p => (
                    <div key={p.id} style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 4 }}>
                      <Text style={{ fontSize: 11 }}>{p.name.substring(0, 22)}...</Text>
                      <Button size="small" type="link" onClick={() => { setBarcodeInput(p.id); handleAddToCart(p); }}>
                        Thêm nhanh
                      </Button>
                    </div>
                  ))}
                </div>
              }
              trigger="click"
            >
              <Button size="small" type="dashed">💡 Quét mô phỏng</Button>
            </Popover>
          </div>

          <div style={{ maxHeight: '52vh', overflowY: 'auto', paddingRight: 4 }}>
            <Row gutter={[8, 8]}>
              {filtered.map(p => {
                const itemsInCart = cart.find(c => c.id === p.id);
                const isLowStock = p.stock < 15;
                return (
                  <Col xs={12} sm={8} key={p.id}>
                    <Badge count={itemsInCart?.qty || 0} color="#1677ff" style={{ width: '100%' }}>
                      <Card 
                        hoverable 
                        styles={{ body: { padding: 8 } }}
                        onClick={() => handleAddToCart(p)}
                        style={{ 
                          border: itemsInCart ? '1px solid #1677ff' : '1px solid #eee',
                          borderRadius: 8,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        {(() => {
                          const matchedItemPromos = availablePromos.filter(promo => 
                            promo.scope === 'item' && (
                              (promo.type === 'item' && promo.targetId && promo.targetId.split(',').map((s: string) => s.trim()).includes(p.id)) ||
                              (promo.type === 'category' && promo.targetId && promo.targetId.split(',').map((s: string) => s.trim()).includes(p.category))
                            )
                          );
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' }}>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                                  <Text strong style={{ fontSize: 11, display: 'block', height: 32, lineHeight: 1.3, overflow: 'hidden', flex: 1 }}>
                                    {p.name}
                                  </Text>
                                  {matchedItemPromos.length > 0 && (
                                    <Tag color="volcano" style={{ fontSize: 8, margin: 0, padding: '0 3px', fontWeight: 'bold', flexShrink: 0 }}>
                                      -{matchedItemPromos[0].value * 100}%
                                    </Tag>
                                  )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                  <Text type="secondary" style={{ fontSize: 9 }}>{p.id}</Text>
                                  {matchedItemPromos.length > 0 && (
                                    <Text style={{ fontSize: 8, color: '#f5222d', fontWeight: 'bold' }}>🔥 KM Giảm Sâu</Text>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                <Text strong style={{ color: '#f5222d', fontSize: 11 }}>{formatVND(p.price)}</Text>
                                <Tag color={isLowStock ? 'volcano' : 'blue'} style={{ fontSize: 8, margin: 0, padding: '0 2px' }}>
                                  Kho: {p.stock}
                                </Tag>
                              </div>
                            </div>
                          );
                        })()}
                      </Card>
                    </Badge>
                  </Col>
                );
              })}
            </Row>
          </div>
        </div>
      );
    }

    // 3. RETAILED CUSTOMER LOYALTY PROFILE & BIRTHDAY VOUCHER INQUIRY (PROBLEM 2)
    if (currentView === 'customer_loyalty' || currentView === 'customers') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Button size="small" icon={<ArrowLeft size={12} />} onClick={popMenu}>Xem chính</Button>
            <Tag color="green">Mặc định: Khách lẻ vãng lai</Tag>
          </div>

          {/* PROBLEM 2: Loyalty birthday or birthday voucher search option */}
          <Card title="🎫 Tra cứu Mã voucher quà tặng / Sinh nhật thành viên" variant="borderless" style={{ background: '#f6ffed', marginBottom: 12, border: '1px solid #b7eb8f', borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
              Khách có mã Voucher sinh nhật đặc quyền? Hãy nhập để áp dụng song song khấu trừ trực tiếp.
            </Text>
            <Space.Compact style={{ width: '100%' }}>
              <Input 
                placeholder="Ví dụ: SINHNHATVIP, LOVALTY100" 
                value={specialVoucherCode}
                onChange={(e) => setSpecialVoucherCode(e.target.value)}
              />
              <Button type="primary" style={{ background: '#52c41a' }} onClick={handleApplySpecialVoucher}>Áp mã</Button>
            </Space.Compact>
            <div style={{ marginTop: 6 }}>
              <Text type="secondary" style={{ fontSize: 10 }}>
                💡 Thử nhập mã: <strong style={{ color: '#52c41a' }}>SINHNHATVIP</strong> (Nhận 15% rate chiết khấu tốt nhất + tặng voucher 500k mặt hàng!)
              </Text>
            </div>

            {birthdayPromoDiscount > 0 && (
              <div style={{ marginTop: 10, padding: '6px 10px', background: '#fff', borderRadius: 6, border: '1px dashed #52c41a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ fontSize: 12, color: '#52c41a' }}>🎁 Khuyến mãi Sinh nhật đang chạy!</Text>
                  <Text type="secondary" style={{ display: 'block', fontSize: 10 }}>Mã đã khớp: Bớt trực tiếp {formatVND(birthdayPromoDiscount)} và kích hoạt % tối ưu.</Text>
                </div>
                <Button size="small" type="text" danger onClick={handleClearSpecialVoucher}><X size={12} /></Button>
              </div>
            )}
          </Card>

          {selectedCustomerId !== 'CUST-R01' && selectedCustomerId !== 'CUST-W01' && (
            <div style={{ background: '#e6f7ff', border: '1px dashed #1890ff', padding: '10px 12px', borderRadius: 8, marginTop: 4, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ fontSize: 11, color: '#1890ff', display: 'block' }}>⚙️ Chế độ thẻ Thành viên:</Text>
                <Text type="secondary" style={{ fontSize: 9, display: 'block' }}>Khi chọn "Tích điểm 5%", tỷ lệ giảm giá thẻ sẽ đặt về 0% để tích lũy 5% hóa đơn.</Text>
              </div>
              <div>
                <Switch 
                  checkedChildren="Tích điểm 5%" 
                  unCheckedChildren="Áp giảm giá thẻ" 
                  checked={onlyEarnPoints} 
                  onChange={handleToggleOnlyEarnPoints} 
                />
              </div>
            </div>
          )}

          <Title level={5} style={{ margin: '0 0 6px', fontSize: 13 }}>Phân Hạng Nhóm Khách Hàng</Title>
          <div style={{ background: '#fafafa', padding: 10, borderRadius: 8, border: '1px solid #e8e8e8', marginBottom: 10 }}>
            <Radio.Group 
              value={selectedParentTier} 
              onChange={(e) => {
                const tier = e.target.value;
                setSelectedParentTier(tier);
                if (tier === 'retail') {
                  setSelectedCustomerId('CUST-R01');
                } else {
                  setSelectedCustomerId('CUST-W01');
                }
              }}
              style={{ width: '100%', display: 'flex' }}
              size="small"
            >
              <Radio.Button value="retail" style={{ flex: 1, textAlign: 'center' }}>
                👤 Khách Lẻ (Bán Lẻ)
              </Radio.Button>
              <Radio.Button value="wholesale" style={{ flex: 1, textAlign: 'center' }}>
                🏢 Khách Đại Lý (Wholesale sỉ)
              </Radio.Button>
            </Radio.Group>
          </div>

          <Title level={5} style={{ margin: '0 0 6px', fontSize: 13 }}>Danh sách Thành Viên Liên Kết</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '24vh', overflowY: 'auto' }}>
            {activeCustomerPool.map(c => {
              const isSelected = c.id === selectedCustomerId;
              return (
                <div 
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  style={{
                    background: isSelected ? '#e6f7ff' : '#fff',
                    border: isSelected ? '1.5px solid #1890ff' : '1px solid #eee',
                    padding: '8px 10px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <Space size={6}>
                      <Text strong style={{ fontSize: 11, color: isSelected ? '#1890ff' : '#333' }}>
                        {c.name}
                      </Text>
                      <Tag color={selectedParentTier === 'retail' ? 'blue' : 'purple'} style={{ fontSize: 9 }}>
                        {c.subLevel}
                      </Tag>
                    </Space>
                    <Text type="secondary" style={{ display: 'block', fontSize: 9 }}>
                      SĐT: {c.phone} • Mã: {c.id}
                    </Text>
                  </div>
                  <div>
                    <Tag color={c.discRate > 0 ? 'red' : 'default'} style={{ fontSize: 9, fontWeight: 'bold', margin: 0 }}>
                      -{c.discRate * 100}%
                    </Tag>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // No hardcoded promotions routings or static tabs are necessary.
    // The entire category hierarchy and active campaigns are fully dynamic, and handled natively
    // by the recursive folder renderer 'currentNode.type === "folder"' from consoleMenus.

    // B. CORPORATE EMPLOYEE DISCOUNT VIEW
    if (currentView === 'corporate_employee' || currentView === 'employee') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Button size="small" icon={<ArrowLeft size={12} />} onClick={popMenu}>Quay lại Nhóm ưu đãi</Button>
            <Tag color="orange">Staff Loyalty</Tag>
          </div>

          <Title level={5} style={{ margin: '0 0 8px', fontSize: 13 }}>Xác minh nhân viên chính thức tập đoàn</Title>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 14 }}>
            Chính sách giảm giá flat 10% hỗ trợ đời sống cán bộ nhân viên công ty.
          </Text>

          {employeeDiscountApplied ? (
            <div style={{ background: '#fff2e8', border: '1px solid #ffbb96', padding: 14, borderRadius: 8, textAlign: 'center' }}>
              <CheckCircle2 size={24} style={{ color: '#fa541c', margin: '0 auto 8px' }} />
              <Title level={5} style={{ margin: '0 0 4px', color: '#fa8c16', fontSize: 13 }}>ĐÃ TÍCH HỢP ƯU ĐÃI NHÂN VIÊN</Title>
              <Text strong style={{ display: 'block', fontSize: 12 }}>Họ và tên: {employeeName}</Text>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>Flat suất ưu đãi: Trừ 10%</Text>
              <Button danger size="small" onClick={handleClearEmployeeDiscount}>Hủy liên kết thẻ</Button>
            </div>
          ) : (
            <Card style={{ border: '1px solid #ffbb96' }} styles={{ body: { padding: 12 } }}>
              <Form layout="vertical">
                <Form.Item label="Nhập mã số nhân viên nội bộ (ví dụ: EMP-100, EMP-200, EMP-300)" style={{ marginBottom: 10 }}>
                  <Input.Search 
                    placeholder="Mã: EMP-100..."
                    enterButton="Xác minh"
                    size="middle"
                    onSearch={handleEmployeeCodeSubmit}
                  />
                </Form.Item>
              </Form>
              <Text type="secondary" style={{ fontSize: 10 }}>
                *Lưu ý: Nghiêm cấm trục lợi mã nội bộ, toàn bộ dữ liệu đối soát tự động trên log KPI bảo mật ban quản lý.
              </Text>
            </Card>
          )}
        </div>
      );
    }

    // C. MANAGER PIN VIEW (PROBLEM 5: Extends from 0 - 100%)
    if (currentView === 'manager_pin' || currentView === 'manager') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Button size="small" icon={<ArrowLeft size={12} />} onClick={popMenu}>Quay lại Nhóm ưu đãi</Button>
            <Tag color="purple">Supervisor Keypass</Tag>
          </div>

          <Title level={5} style={{ margin: '0 0 8px', fontSize: 13 }}>Quyền Hạn Đặc Xét Của Cửa Hàng Trưởng / Quản Lý Trực Ca</Title>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>
            Ủy quyền PIN cho phép nới dốc dải chiết khấu từ 0% đến 100% để xử lý đền bù lớn hoặc tri ân đối tác quốc tế.
          </Text>

          {managerApproval ? (
            <div style={{ background: '#f9f0ff', border: '1px solid #d3adf7', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Duyệt chữ ký bởi:</Text>
                  <Text strong style={{ display: 'block', color: '#531dab', fontSize: 12 }}>{managerApproval.name}</Text>
                </div>
                <Button size="small" danger onClick={handleRemoveManagerDiscount}>Hủy quyền phê duyệt</Button>
              </div>

              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>
                  Chọn Nhanh / Hoặc nhập trực tiếp Tỉ lệ chiết khấu (%) cho Bill:
                </Text>
                
                {/* PROBLEM 5: Expanded discount options up to 100% */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {[0.05, 0.10, 0.15, 0.20, 0.30, 0.50, 0.80, 1.00].map(rate => (
                    <Button 
                      key={rate} 
                      type={managerDiscountRate === rate ? 'primary' : 'default'}
                      size="small"
                      style={{ fontSize: 10 }}
                      onClick={() => setManagerDiscountRate(rate)}
                    >
                      {rate * 100}% {rate === 1.0 && 'FREE'}
                    </Button>
                  ))}
                </div>

                <div style={{ background: '#fff', padding: 8, borderRadius: 6, border: '1px solid #dcdcdc' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 11 }}>Nhập số lẻ tự chọn (0 - 100%):</Text>
                    <InputNumber
                      min={0}
                      max={100}
                      size="small"
                      value={Math.round(managerDiscountRate * 100)}
                      onChange={(val) => setManagerDiscountRate((val || 0) / 100)}
                      addonAfter="%"
                      style={{ width: 120 }}
                    />
                  </Space>
                </div>

                <div style={{ marginTop: 12, borderTop: '1px dashed #e8e8e8', paddingTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Ghi chú Nguyên nhân Phê duyệt (Bắt buộc - Chữ In Hoa Không Dấu):
                  </Text>
                  <Input
                    placeholder="VD: VIPPARTNER, HANGCONGTY, SUADOI..."
                    size="small"
                    value={managerApprovalReason}
                    onChange={(e) => setManagerApprovalReason(removeAccentsAndUpperCase(e.target.value))}
                    status={managerApprovalReason.trim().length >= 3 ? '' : 'error'}
                  />
                  <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 9, color: '#8c8c8c' }}>*Nhập không dấu để đồng bộ quản lý</span>
                    {managerApprovalReason.trim().length >= 3 ? (
                      <Tag color="success" style={{ fontSize: 9, margin: 0 }}>✅ Đã hợp lệ</Tag>
                    ) : (
                      <Tag color="error" style={{ fontSize: 9, margin: 0 }}>❌ Thiếu lý do (&gt;2 ký tự)</Tag>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card style={{ border: '1px solid #d3adf7' }} styles={{ body: { padding: 12 } }}>
              <Form layout="vertical">
                <Form.Item label="Chọn Tài Khoản Kiểm Duyệt" style={{ marginBottom: 8 }}>
                  <Select 
                    value={managerUsername}
                    onChange={setManagerUsername}
                    size="small"
                    options={[
                      { value: 'admin', label: 'Admin Supervisor - Anh Hoàng' },
                      { value: 'manager01', label: 'Cửa hàng trưởng - Anh Kỳ' },
                      { value: 'supervisor', label: 'Giám sát trực - Chị Trang' }
                    ]}
                  />
                </Form.Item>
                <Form.Item label="PIN 4 số xác nhận ủy quyền" style={{ marginBottom: 12 }} extra="Nhập mã PIN thử nghiệm: 1234">
                  <Input.Password
                    placeholder="PIN bảo mật"
                    size="small"
                    value={managerPin}
                    onChange={(e) => setManagerPin(e.target.value)}
                  />
                </Form.Item>
                <Button block type="primary" onClick={handleManagerSubmit} style={{ background: '#722ed1', border: 'none', height: 32 }}>
                  Xác nhận ủy quyền tại chỗ
                </Button>
              </Form>
            </Card>
          )}
        </div>
      );
    }

    // D. COMPLAINT SHIFTS RELIEF VIEW (PROBLEM 5: From 0 to 100%)
    if (currentView === 'quick_discount' || currentView === 'quick') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Button size="small" icon={<ArrowLeft size={12} />} onClick={popMenu}>Quay lại Nhóm ưu đãi</Button>
            <Tag color="magenta">Internal Adjustment</Tag>
          </div>

          <Title level={5} style={{ margin: '0 0 8px', fontSize: 13 }}>Giảm Nhanh Xử Lý Khiếu Nại Phàn Nàn Ca Trực</Title>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 14 }}>
            Thao tác nhanh cho thu ngân được quyền chủ động bớt % trị giá hàng hóa khi hàng hư lỗi nhẹ móp méo hộp mà không cần PIN quản lý.
          </Text>

          <div style={{ background: '#fafafa', border: '1px solid #e8e8e8', padding: 12, borderRadius: 8, textAlign: 'center' }}>
            <Text style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>Tỷ lệ giảm nhanh ca trực ca:</Text>
            <Title level={3} style={{ margin: '0 0 10px', color: '#c41d7f' }}>
              {quickDiscountPercent}%
            </Title>
            
            {/* PROBLEM 5: Expanded options with range up to 100% */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 10 }}>
              {[0, 5, 10, 15, 20, 30, 50, 70, 100].map(pct => (
                <Button 
                  key={pct}
                  type={quickDiscountPercent === pct ? 'primary' : 'default'}
                  onClick={() => handleQuickDiscount(pct)}
                  size="small"
                  style={{ fontSize: 10 }}
                >
                  {pct === 0 ? 'Hủy' : `${pct}%`}
                </Button>
              ))}
            </div>

            <div style={{ background: '#fff', padding: 6, borderRadius: 6, border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 11 }}>Nhập số lẻ thủ công:</Text>
              <InputNumber
                min={0}
                max={100}
                size="small"
                value={quickDiscountPercent}
                onChange={(val) => handleQuickDiscount(val || 0)}
                addonAfter="%"
                style={{ width: 110 }}
              />
            </div>

            <div style={{ marginTop: 12, borderTop: '1px dashed #e8e8e8', paddingTop: 8, textAlign: 'left' }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Lý do Giảm Ca Trực / Phàn Nàn (Bắt buộc - Chữ In Hoa Không Dấu):
              </Text>
              <Input
                placeholder="VD: HANGHONG, DOPHO, TIEPKHACHCONGTY..."
                size="small"
                value={quickDiscountReason}
                onChange={(e) => setQuickDiscountReason(removeAccentsAndUpperCase(e.target.value))}
                status={quickDiscountReason.trim().length >= 3 ? '' : 'error'}
              />
              <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: '#8c8c8c' }}>*Nhập không dấu để lưu đồng bộ</span>
                {quickDiscountReason.trim().length >= 3 ? (
                  <Tag color="success" style={{ fontSize: 9, margin: 0 }}>✅ Đã hợp lệ</Tag>
                ) : (
                  <Tag color="error" style={{ fontSize: 9, margin: 0 }}>❌ Thiếu lý do (&gt;2 ký tự)</Tag>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 5. COUPON VOUCHERS INSERT VIEW
    if (currentView === 'voucher_gotit' || currentView === 'vouchers') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Button size="small" icon={<ArrowLeft size={12} />} onClick={popMenu}>Menu chính</Button>
            <Tag color="magenta">Gift Vouchers</Tag>
          </div>

          <Title level={5} style={{ margin: '0 0 8px', fontSize: 13 }}>Mã Giảm Giá Đối Tác Nạp Gotit / Urbox / Quà Tặng</Title>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 10 }}>
            Voucher giảm trừ trực tiếp tiền mặt, cho phép nạp nhiều mã cộng dồn giảm trừ trực tiếp!
          </Text>

          <div style={{ background: '#fafafa', padding: 8, borderRadius: 8, border: '1px solid #eee', marginBottom: 10 }}>
            <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 4, fontWeight: 'bold' }}>MÃ ĐÃ KHẤU TRỪ VÀO BILL:</Text>
            {appliedVouchers.length === 0 ? (
              <span style={{ fontSize: 10, color: '#999', fontStyle: 'italic' }}>Chưa nạp mã voucher khấu trừ tiền mặt nào.</span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {appliedVouchers.map(v => (
                  <Tag key={v.code} color="purple" closable onClose={() => handleRemoveVoucher(v.code)} style={{ fontSize: 10 }}>
                    {v.code} (-{formatVND(v.value)})
                  </Tag>
                ))}
              </div>
            )}
          </div>

          <Card style={{ border: '1px solid #f2cfeb' }} styles={{ body: { padding: 10 } }}>
            <Form layout="vertical">
              <Form.Item label="Nhập mã voucher đối tác chính chủ" style={{ marginBottom: 6 }}>
                <Input.Search 
                  placeholder="Ví dụ: GOTIT200, GOTIT500, URBOX1M, COMP500"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  onSearch={handleApplyVoucher}
                  enterButton="Nạp Thẻ"
                  size="small"
                />
              </Form.Item>
            </Form>
            
            <div style={{ marginTop: 2 }}>
              <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>
                <strong>💡 Mã nạp cộng dồn dùng thử:</strong>
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Button size="small" style={{ fontSize: 9, padding: '0 4px', height: 20 }} onClick={() => setVoucherCode('GOTIT200')}>Gotit 200k</Button>
                <Button size="small" style={{ fontSize: 9, padding: '0 4px', height: 20 }} onClick={() => setVoucherCode('GOTIT500')}>Gotit 500k</Button>
                <Button size="small" style={{ fontSize: 9, padding: '0 4px', height: 20 }} onClick={() => setVoucherCode('URBOX1M')}>Urbox 1Tr</Button>
                <Button size="small" style={{ fontSize: 9, padding: '0 4px', height: 20 }} onClick={() => setVoucherCode('COMP500')}>Cty bớt 500k</Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // 6. MULTI-PAYMENT CASH & TRANSACTIONS PREVIEWS
    if (currentView === 'payment_gate' || currentView === 'payment') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Button size="small" icon={<ArrowLeft size={12} />} onClick={popMenu}>Menu chính</Button>
            <Tag color="purple">Cổng nộp quỹ sandbox</Tag>
          </div>

          <Title level={5} style={{ margin: '0 0 2px', fontSize: 13 }}>Chi tiết thu ngân quỹ khách đóng góp</Title>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 10 }}>
            Hỗ trợ khách nộp từng phần tiền lẻ cộng gộp để khép thanh toán hóa đơn.
          </Text>

          {isPaymentStarted && (
            <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: 8, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: '#b77c0c' }}>
                ⚠️ Thu ngân quỹ đang hoạt động: Bill đã bị khóa chỉnh sửa ưu đãi để an toàn tránh gian lận.
              </Text>
              <Button danger size="small" onClick={handleRefundPayments} style={{ fontSize: 10, height: 22, padding: '0 6px' }}>Hủy sạch thu</Button>
            </div>
          )}

          <Row gutter={[8, 8]}>
            {/* Cash input */}
            <Col span={12}>
              <div style={{ padding: 8, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
                <Space size={4} style={{ marginBottom: 4 }}>
                  <Banknote size={13} style={{ color: '#52c41a' }} />
                  <Text strong style={{ fontSize: 11 }}>Nộp Tiền Mặt</Text>
                </Space>
                <InputNumber
                  style={{ width: '100%' }}
                  value={payments.cash || undefined}
                  onChange={(v) => handlePaymentValueChange('cash', v)}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => (value ? value.replace(/\$\s?|(,)/g, '') : '') as any}
                  size="small"
                  placeholder="Thu tiền mặt..."
                />
                <Button 
                  size="small" 
                  style={{ fontSize: 10, width: '100%', marginTop: 4, height: 22 }}
                  onClick={() => {
                    const outstanding = billingCalculations.remainingToPay;
                    if (outstanding > 0) {
                      setPayments(prev => ({ ...prev, cash: prev.cash + outstanding }));
                    }
                  }}
                >
                  Nạp Đủ Tiền Hàng
                </Button>
              </div>
            </Col>

            {/* ATM input */}
            <Col span={12}>
              <div style={{ padding: 8, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
                <Space size={4} style={{ marginBottom: 4 }}>
                  <CreditCard size={13} style={{ color: '#1890ff' }} />
                  <Text strong style={{ fontSize: 11 }}>Quẹt Thẻ POS</Text>
                </Space>
                <InputNumber
                  style={{ width: '100%' }}
                  value={payments.atm || undefined}
                  onChange={(v) => handlePaymentValueChange('atm', v)}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => (value ? value.replace(/\$\s?|(,)/g, '') : '') as any}
                  size="small"
                  placeholder="POS nạp..."
                />
                <Button 
                  size="small" 
                  style={{ fontSize: 10, width: '100%', marginTop: 4, height: 22 }}
                  onClick={() => {
                    const outstanding = billingCalculations.remainingToPay;
                    if (outstanding > 0) {
                      setPayments(prev => ({ ...prev, atm: prev.atm + outstanding }));
                    }
                  }}
                >
                  Quẹt Đủ Hết
                </Button>
              </div>
            </Col>

            {/* ZaloPay Dynamic QR */}
            <Col span={12}>
              <Card 
                hoverable 
                styles={{ body: { padding: 8 } }}
                onClick={() => handleOpenQrGenerator('zalopay')}
                style={{ border: payments.zalopay > 0 ? '1px solid #52c41a' : '1px solid #f0f0f0', background: '#fafafa', borderRadius: 8 }}
              >
                <div style={{ textAlign: 'center' }}>
                  <QrCode size={20} style={{ color: '#0084FF', margin: '0 auto 4px' }} />
                  <Text strong style={{ fontSize: 11, display: 'block' }}>Ví ZaloPay QR</Text>
                  <Text type="secondary" style={{ fontSize: 9 }}>Đã nạp: {formatVND(payments.zalopay)}</Text>
                </div>
              </Card>
            </Col>

            {/* VNPay QR */}
            <Col span={12}>
              <Card 
                hoverable 
                styles={{ body: { padding: 8 } }}
                onClick={() => handleOpenQrGenerator('vnpay')}
                style={{ border: payments.vnpay > 0 ? '1px solid #52c41a' : '1px solid #f0f0f0', background: '#fafafa', borderRadius: 8 }}
              >
                <div style={{ textAlign: 'center' }}>
                  <QrCode size={20} style={{ color: '#E01E26', margin: '0 auto 4px' }} />
                  <Text strong style={{ fontSize: 11, display: 'block' }}>Cổng VNPay QR</Text>
                  <Text type="secondary" style={{ fontSize: 9 }}>Đã nạp: {formatVND(payments.vnpay)}</Text>
                </div>
              </Card>
            </Col>
          </Row>

          <div style={{ marginTop: 14, background: '#f9f0ff', padding: 8, borderRadius: 6, border: '1px solid #d3adf7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <Text>Tổng đã nạp thanh toán:</Text>
              <Text strong style={{ color: '#52c41a' }}>{formatVND(billingCalculations.paidSum)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 2 }}>
              <Text>Số dư nợ còn thiếu:</Text>
              <Text strong style={{ color: '#f5222d' }}>{formatVND(billingCalculations.remainingToPay)}</Text>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ padding: '0 8px', minHeight: '85vh', background: '#f5f7fa', borderRadius: 8 }}>
      {/* Visual Top bar title */}
      <Card style={{ marginBottom: 12, borderRadius: 10, background: '#fff' }} styles={{ body: { padding: 12 } }}>
        <Row justify="space-between" align="middle" gutter={16}>
          <Col xs={24} sm={12}>
            <Space size="middle" align="baseline">
              <ArrowLeft onClick={onClose} style={{ cursor: 'pointer', color: '#1677ff' }} />
              <div>
                <Title level={4} style={{ margin: 0, display: 'inline' }}>{orderId} </Title>
                <Tag color="warning" style={{ margin: 0 }}>HÓA ĐƠN CHỜ PHÂN PHỐI</Tag>
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Space size="middle">
              <Button 
                type="primary"
                icon={<Settings size={13} />} 
                onClick={() => setIsJsonModalVisible(true)} 
                style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#fff', backgroundColor: '#fa541c', borderColor: '#fa541c', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                ⚙️ CẤU HÌNH KHUYẾN MÃI
              </Button>
              <Text strong style={{ fontSize: 11, background: '#e6f7ff', padding: '4px 8px', borderRadius: 4, color: '#1890ff' }}>
                📍 {storeName} ({deviceName})
              </Text>
              <Button type="text" danger icon={<X size={14} />} onClick={onClose} style={{ fontSize: 12 }}>
                Quay ra danh sách
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* PROBLEM 1: SWAPPED COLUMNS */}
        {/* LEFT COLUMN - PRISTINE BILL RECEIPT PREVIEW */}
        <Col xs={24} md={12} id="pos-billing-receipt-panel">
          <Card 
            title={
              <Space>
                <ShoppingCart size={15} style={{ color: '#1677ff' }} />
                <span style={{ fontSize: 13, fontWeight: 'bold' }}>Chi Tiết Hóa Đơn Khách Hàng ({cart.reduce((acc, i) => acc + i.qty, 0)} món)</span>
              </Space>
            }
            extra={
              isPaymentStarted ? (
                <Tag color="red" icon={<Lock size={12} />} style={{ fontSize: 9 }}>BILL KHÓA: ĐÃ CÓ THANH TOÁN</Tag>
              ) : (
                <Tag color="green" icon={<Unlock size={12} />} style={{ fontSize: 9 }}>BILL MỞ: ĐANG ĐIỀU CHỈNH</Tag>
              )
            }
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
            styles={{ body: { padding: 12 } }}
          >
            {/* Summary customer display */}
            <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 9, display: 'block' }}>LOẠI KHÁCH HÀNG BILL:</Text>
                  <Text strong style={{ fontSize: 13, color: '#333' }}>
                    💼 {selectedParentTier === 'retail' ? 'Khách lẻ' : 'Khách sỉ'}
                  </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Tag color={selectedParentTier === 'retail' ? 'blue' : 'purple'} style={{ margin: 0, fontWeight: 'bold', fontSize: 9 }}>
                    {selectedParentTier === 'retail' ? 'BÁN LẺ' : 'BÁN SỈ'}
                  </Tag>
                </div>
              </div>
              
              <Divider style={{ margin: '6px 0' }} />

              {selectedCustomerId !== 'CUST-R01' && selectedCustomerId !== 'CUST-W01' ? (
                <div style={{ background: '#e6f7ff', padding: '8px', borderRadius: 6, border: '1px solid #91d5ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 8, display: 'block', color: '#1890ff', fontWeight: 'bold' }}>👤 THÀNH VIÊN LIÊN KẾT:</Text>
                      <Text strong style={{ fontSize: 11, color: '#0050b3' }}>
                        {selectedCustomer.name}
                      </Text>
                      <span style={{ fontSize: 9, display: 'block', color: '#555', marginTop: 2 }}>Mã: {selectedCustomer.id} ({selectedCustomer.subLevel})</span>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                      {onlyEarnPoints ? (
                        <div>
                          <Tag color="cyan" style={{ fontSize: 8, margin: 0, fontWeight: 'bold' }}>Tích 5%</Tag>
                        </div>
                      ) : (
                        <div>
                          <Tag color="red" style={{ fontSize: 8, margin: 0, fontWeight: 'bold' }}>Thẻ -{selectedCustomer.discRate * 100}%</Tag>
                        </div>
                      )}
                      <div style={{ marginTop: 4 }}>
                        <Switch 
                          size="small"
                          checkedChildren="Tích điểm" 
                          unCheckedChildren="Giảm giá" 
                          checked={onlyEarnPoints} 
                          onChange={setOnlyEarnPoints} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2px 4px' }}>
                  <Text type="secondary" style={{ fontSize: 9, display: 'block' }}>ℹ️ THÀNH VIÊN CO-LTD:</Text>
                  <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic', display: 'block' }}>
                    Chưa liên kết thẻ thành viên (Khách lẻ/sỉ vãng lai)
                  </Text>
                </div>
              )}
            </div>

            {/* Warn if Manager PIN or Quick Compliant is selected but has less than 3 chars reason */}
            {((managerApproval && managerDiscountRate > 0 && managerApprovalReason.trim().length < 3) || (quickDiscountPercent > 0 && quickDiscountReason.trim().length < 3)) && (
              <Alert 
                type="warning"
                showIcon
                message="Đang Chờ Nhập Lý Do Chiết Khấu"
                description={
                  <div style={{ fontSize: 10 }}>
                    {managerApproval && managerDiscountRate > 0 && managerApprovalReason.trim().length < 3 && (
                      <div style={{ color: '#d46b08', margin: '2px 0' }}>• Quyền quản lý ({managerDiscountRate*100}%) chưa được áp dụng do thiếu ghi chú lý do duyệt ca (&gt;2 ký tự viết hoa không dấu) ở tab Chương Trình Khuyến Mãi &gt; Ủy quyền Giám sát.</div>
                    )}
                    {quickDiscountPercent > 0 && quickDiscountReason.trim().length < 3 && (
                      <div style={{ color: '#d46b08', margin: '2px 0' }}>• Giảm nhanh ca trực ({quickDiscountPercent}%) chưa được áp dụng do thiếu ghi chú lý do phàn nàn (&gt;2 ký tự viết hoa không dấu) ở tab Chương Trình Khuyến Mãi &gt; Giảm nhanh Ca trực.</div>
                    )}
                  </div>
                }
                style={{ marginBottom: 10, borderRadius: 8 }}
              />
            )}

            {/* Printable Receipt Items lists / PROBLEM 6 & 7: Shows discounts under name */}
            <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: 12, paddingRight: 2 }} className="custom-scrollbar">
              {cart.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <ShoppingCart size={28} style={{ color: '#ccc', marginBottom: 6, margin: '0 auto' }} />
                  <p style={{ margin: 0, color: '#999', fontSize: 11 }}>Trống. Vui lòng bấm Catalog ở bên phải để thêm mặt hàng.</p>
                </div>
              ) : (
                billingCalculations.processedCart.map(item => (
                  <div key={item.id} style={{ padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, marginRight: 8 }}>
                        <Text strong style={{ fontSize: 12, display: 'block' }}>{item.name}</Text>
                        <Space size={6}>
                          <Text type="secondary" style={{ fontSize: 10 }}>Đơn giá: {formatVND(item.price)}</Text>
                          <Tag style={{ fontSize: 9, margin: 0, padding: '0 3px' }} color="blue">Tồn kho: {item.stock}</Tag>
                        </Space>
                      </div>

                      <Space size="small" align="center">
                        <Space size={2}>
                          <Button 
                            icon={<Minus size={10} />} 
                            size="small"
                            style={{ width: 20, height: 20, padding: 0 }}
                            disabled={isPaymentStarted || item.qty <= 1}
                            onClick={() => {
                              handleUpdateQty(item.id, item.qty - 1);
                            }}
                          />
                          <InputNumber 
                            min={1}
                            value={item.qty}
                            disabled={isPaymentStarted}
                            style={{ width: 55, fontSize: 11 }}
                            size="small"
                            onChange={(val) => {
                              if (val !== null) {
                                handleUpdateQty(item.id, Math.floor(val));
                              }
                            }}
                          />
                          <Button 
                            icon={<Plus size={10} />} 
                            size="small"
                            style={{ width: 20, height: 20, padding: 0 }}
                            disabled={isPaymentStarted || item.qty >= item.stock}
                            onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                          />
                        </Space>
                        
                        <div style={{ width: 75, textAlign: 'right' }}>
                          <Text strong style={{ fontSize: 11 }}>{formatVND(item.finalSubtotal)}</Text>
                        </div>

                        <Button 
                          type="text" 
                          danger 
                          size="small" 
                          icon={<Trash2 size={11} />} 
                          onClick={() => handleRemoveFromCart(item.id)}
                          disabled={isPaymentStarted}
                          style={{ padding: 0, width: 18, height: 18 }}
                        />
                      </Space>
                    </div>

                    {/* PROBLEM 7: Show detailed item promo reduction under name */}
                    {item.note && (
                      <div style={{ marginTop: 2, background: '#faf0f6', padding: '2px 6px', borderRadius: 4, border: '1px dashed #f50' }}>
                        <Text style={{ fontSize: 9, color: '#f50', fontWeight: 'bold' }}>{item.note}</Text>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <Divider style={{ margin: '6px 0' }} />

            {billingCalculations.warnings && billingCalculations.warnings.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                {billingCalculations.warnings.map((w: string, i: number) => (
                  <Alert
                    key={i}
                    message={w}
                    type={w.includes('Xung đột') || w.includes('Loại trừ') ? 'warning' : 'info'}
                    showIcon
                    style={{ marginBottom: 4, borderRadius: 6, padding: '6px 10px', fontSize: '10.5px', lineHeight: '1.3' }}
                  />
                ))}
              </div>
            )}

            {/* PROBLEM 6: Show incredibly detailed promo deduction info & payments */}
            <div style={{ background: '#f6ffed', border: '1px solid #d9f7be', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, fontSize: 11 }}>
                <Text>Tổng cộng gộp tiền hàng:</Text>
                <Text strong>{formatVND(billingCalculations.rawSubtotal)}</Text>
              </div>

              {/* Unique maximum % discount pathway details */}
              {billingCalculations.bestPercentDiscount && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, color: '#1677ff', fontSize: 11, background: '#e6f7ff', padding: '3px 6px', borderRadius: 4, marginTop: 4 }}>
                  <Text strong style={{ fontSize: 9 }}>⭐ Ưu đãi % tốt nhất (Độc Quyền):</Text>
                  <Text strong>-{formatVND(billingCalculations.bestPercentDiscount.amount)}</Text>
                </div>
              )}
              {billingCalculations.bestPercentDiscount && (
                <div style={{ fontSize: 9, color: '#8c8c8c', textIndent: 6, marginBottom: 4 }}>
                  Phân tích: Áp dụng duy nhất 1 nguồn {billingCalculations.bestPercentDiscount.label} để tối ưu doanh thu.
                </div>
              )}

              {/* Compounded cash discounts breakdown display */}
              {billingCalculations.totalCashDiscountsTotal > 0 && (
                <div style={{ marginTop: 4, borderTop: '1px dashed #d9d9d9', paddingTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#f5222d', fontWeight: 'bold' }}>
                    <Text>Cộng dồn giảm giá tiền mặt (-):</Text>
                    <Text>-{formatVND(billingCalculations.totalCashDiscountsTotal)}</Text>
                  </div>
                  {billingCalculations.cashPromoBreakdown.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#595959', paddingLeft: 8 }}>
                      <Text>↳ {item.name}:</Text>
                      <Text>-{formatVND(item.amount)}</Text>
                    </div>
                  ))}
                </div>
              )}

              <Divider style={{ margin: '4px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 12 }}>Thực thu từ khách (Sau trừ):</Text>
                <Title level={4} style={{ margin: 0, color: '#52c41a', fontSize: 16 }}>
                  {formatVND(billingCalculations.finalBillTotal)}
                </Title>
              </div>
            </div>

            {/* PROBLEM 6: Show detailed, multi-method payment breakdown summary */}
            <div style={{ background: '#f5fafc', border: '1px solid #dcdcdc', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
              <Text strong style={{ fontSize: 10, color: '#333', display: 'block', marginBottom: 4 }}>CHI TIẾT PHƯƠNG THỨC NẠP QUỸ:</Text>
              
              <Row gutter={[4, 4]}>
                <Col span={12}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, background: '#fff', padding: '2px 4px', borderRadius: 4 }}>
                    <Text type="secondary">💵 Tiền mặt:</Text>
                    <Text strong>{formatVND(payments.cash)}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, background: '#fff', padding: '2px 4px', borderRadius: 4 }}>
                    <Text type="secondary">💳 Thẻ POS ATM:</Text>
                    <Text strong>{formatVND(payments.atm)}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, background: '#fff', padding: '2px 4px', borderRadius: 4 }}>
                    <Text type="secondary">📱 ZaloPay QR:</Text>
                    <Text strong>{formatVND(payments.zalopay)}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, background: '#fff', padding: '2px 4px', borderRadius: 4 }}>
                    <Text type="secondary">🔴 VNPay QR:</Text>
                    <Text strong>{formatVND(payments.vnpay)}</Text>
                  </div>
                </Col>
              </Row>
            </div>

            {/* CHECKOUT SUBMISSION ACTION BUTTONS */}
            <div style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 8, padding: 8 }}>
              <Row justify="space-between" align="middle" gutter={8}>
                <Col span={10}>
                  <div style={{ fontSize: 10, color: '#666' }}>
                    Đã thu: <strong style={{ color: '#52c41a' }}>{formatVND(billingCalculations.paidSum)}</strong>
                  </div>
                  <div style={{ fontSize: 10, color: '#666' }}>
                    Còn phải thu: <strong style={{ color: '#f5222d' }}>{formatVND(billingCalculations.remainingToPay)}</strong>
                  </div>
                </Col>

                <Col span={14}>
                  <Button 
                    type="primary" 
                    block
                    size="middle"
                    style={{ background: billingCalculations.remainingToPay === 0 ? '#52c41a' : '#1677ff', border: 'none', height: 34, fontSize: 11, fontWeight: 'bold' }}
                    icon={<CheckCircle2 size={14} />}
                    onClick={handleCheckoutComplete}
                  >
                    HOÀN TẤT & IN HOÁ ĐƠN
                  </Button>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* RIGHT COLUMN - THE OPERATOR CONSOLE WITH DYNAMIC NAVIGATION FLOW */}
        <Col xs={24} md={12} id="pos-operator-console-panel">
          <Card style={{ height: '100%', minHeight: '62vh', borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }} styles={{ body: { padding: 12 } }}>
            {renderBreadcrumbs()}
            {renderOperatorConsoleView()}
          </Card>
        </Col>
      </Row>

      {/* SIMULATED THERMAL PRINT RECEIPT DIALOG (Skeuomorphic Slip design) */}
      <Modal
        open={receiptModelVisible}
        title="📠 BIÊN LAI THANH TOÁN (MÔ PHỎNG IN BILL)"
        onCancel={() => {
          setReceiptModalVisible(false);
          onComplete(checkoutReceipt);
        }}
        footer={[
          <Button 
            key="test-print" 
            ghost 
            type="primary" 
            onClick={() => {
              modal.info({
                title: 'Yêu cầu in hóa đơn',
                content: 'Đang gửi lệnh đến máy in Kiosk Xprinter XP-350B... Đã kết nối qua cổng USB.'
              });
            }}
          >
            In hóa đơn trực tiếp (Print)
          </Button>,
          <Button 
            key="close" 
            type="primary" 
            onClick={() => {
              setReceiptModalVisible(false);
              onComplete(checkoutReceipt);
            }}
          >
            Giao dịch mới
          </Button>
        ]}
        width={400}
      >
        <div style={{
          background: '#fff',
          padding: '16px 12px',
          border: '1px solid #dcdcdc',
          borderRadius: 4,
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: 12,
          color: '#000',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
          lineHeight: '1.4'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <Title level={4} style={{ margin: '0 0 2px', fontFamily: '"Courier New", Courier, monospace', fontSize: 15, fontWeight: 'bold' }}>
              ⭐ FLAGSHIP KIOSK FOOD & GEAR ⭐
            </Title>
            <Text style={{ fontSize: 10, display: 'block' }}>Địa chỉ: 126 Nguyễn Thị Minh Khai, Quận 3, TP.HCM</Text>
            <Text style={{ fontSize: 10, display: 'block' }}>Hotline: 1900 8089 - MST: 0312456789</Text>
            <Divider style={{ margin: '8px 0', borderStyle: 'dashed', borderColor: '#333' }} />
            <Title level={5} style={{ margin: '4px 0', fontFamily: '"Courier New", Courier, monospace', fontSize: 13, fontWeight: 'bold' }}>
              HÓA ĐƠN THANH TOÁN
            </Title>
            <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{checkoutReceipt?.id}</Text>
          </div>

          <div style={{ fontSize: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Ngày: {new Date().toLocaleString('vi-VN')}</span>
              <span>Thu ngân: {currentUser?.name || 'Kiosk Staff'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Phân loại khách hàng:</span>
              <span style={{ fontWeight: 'bold' }}>{checkoutReceipt?.parentTier}</span>
            </div>
            {checkoutReceipt?.customerId && checkoutReceipt?.customerId !== 'CUST-R01' && checkoutReceipt?.customerId !== 'CUST-W01' ? (
              <div style={{ border: '1px dashed #333', padding: '4px', marginTop: '4px', borderRadius: '4px' }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 9, letterSpacing: '0.5px', marginBottom: 2 }}>
                  *** THÔNG TIN THÀNH VIÊN LIÊN KẾT ***
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Họ tên thành viên:</span>
                  <span>{checkoutReceipt?.customer}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mã số thẻ:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{checkoutReceipt?.customerId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Phân hạng thẻ:</span>
                  <span>{checkoutReceipt?.customerTier}</span>
                </div>
                {checkoutReceipt?.onlyEarnPoints ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Chế độ áp dụng:</span>
                    <span style={{ color: '#0050b3', fontWeight: 'bold' }}>Chỉ tích điểm (Dành 5%)</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Chế độ áp dụng:</span>
                    <span>Chiết khấu thẻ (-{checkoutReceipt?.loyaltyDiscountRate * 100}%)</span>
                  </div>
                )}
                {checkoutReceipt?.pointsEarned ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px dashed #ddd', marginTop: 2, paddingTop: 2 }}>
                    <span>Tích lũy điểm (5%):</span>
                    <span>+{checkoutReceipt?.pointsEarned.toLocaleString()} đ</span>
                  </div>
                ) : null}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                <span>Liên kết thành viên:</span>
                <span>Khách vãng lai (Chưa kết nối thẻ)</span>
              </div>
            )}
          </div>

          <Divider style={{ margin: '6px 0', borderStyle: 'dashed', borderColor: '#333' }} />

          {/* Product Rows */}
          <div style={{ fontSize: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '2px' }}>
              <span style={{ width: '45%' }}>Tên hàng</span>
              <span style={{ width: '15%', textAlign: 'center' }}>SL</span>
              <span style={{ width: '20%', textAlign: 'right' }}>Giá</span>
              <span style={{ width: '20%', textAlign: 'right' }}>T.Tiền</span>
            </div>
            {cart.map(item => {
              const promo = availablePromos.find(p => p.scope === 'item' && (
                (p.type === 'item' && p.targetId && p.targetId.split(',').map((s: string) => s.trim()).includes(item.id)) ||
                (p.type === 'category' && p.targetId && p.targetId.split(',').map((s: string) => s.trim()).includes(item.category))
              ));
              return (
                <div key={item.id} style={{ padding: '3px 0', borderBottom: '1px dashed #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ width: '45%' }}>{item.name}</span>
                    <span style={{ width: '15%', textAlign: 'center' }}>{item.qty}</span>
                    <span style={{ width: '20%', textAlign: 'right' }}>{Math.round(item.price).toLocaleString()}</span>
                    <span style={{ width: '20%', textAlign: 'right' }}>{Math.round(item.price * item.qty).toLocaleString()}</span>
                  </div>
                  {billingCalculations.bestPercentDiscount?.key === 'item_promo' && appliedItemPromos[item.id] && promo && (
                    <div style={{ fontSize: 9, color: '#f50', paddingLeft: 6 }}>
                      ↳ Gắn mã: {promo.name} (-{(promo.value * 100)}%)
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Divider style={{ margin: '6px 0', borderStyle: 'dashed', borderColor: '#333' }} />

          {/* Calculations Summary */}
          <div style={{ fontSize: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tổng tiền hàng (gộp):</span>
              <span>{billingCalculations.rawSubtotal.toLocaleString()} đ</span>
            </div>
            {billingCalculations.bestPercentDiscount && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1890ff', fontStyle: 'italic' }}>
                <span>Chiết khấu % tốt nhất ({billingCalculations.bestPercentDiscount.label}):</span>
                <span>-{billingCalculations.bestPercentDiscount.amount.toLocaleString()} đ</span>
              </div>
            )}
            {billingCalculations.totalCashDiscountsTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f5222d' }}>
                <span>Bớt tiền mặt cộng dồn:</span>
                <span>-{billingCalculations.totalCashDiscountsTotal.toLocaleString()} đ</span>
              </div>
            )}
            {billingCalculations.totalForfeitedVoucherAmount !== undefined && billingCalculations.totalForfeitedVoucherAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8c8c8c', fontStyle: 'italic', fontSize: 9 }}>
                <span>↳ Số dư dư thừa Voucher (hủy bỏ):</span>
                <span>{billingCalculations.totalForfeitedVoucherAmount.toLocaleString()} đ (Hủy)</span>
              </div>
            )}
            
            {/* If manager discount has note */}
            {managerApproval && managerApprovalReason.trim().length >= 3 && (
              <div style={{ fontSize: 9, color: '#531dab', paddingLeft: 6 }}>
                ↳ Lý do duyệt Manager: {managerApprovalReason}
              </div>
            )}
            {quickDiscountPercent > 0 && quickDiscountReason.trim().length >= 3 && (
              <div style={{ fontSize: 9, color: '#c41d7f', paddingLeft: 6 }}>
                ↳ Lý do bớt ca trực: {quickDiscountReason}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 13, borderTop: '1px solid #333', paddingTop: 4, marginTop: 4 }}>
              <span>THÀNH TIỀN TOÀN BILL:</span>
              <span>{billingCalculations.finalBillTotal.toLocaleString()} đ</span>
            </div>
          </div>

          <Divider style={{ margin: '6px 0', borderStyle: 'dashed', borderColor: '#333' }} />

          {/* Pay Breakdown */}
          <div style={{ fontSize: 9 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>CHI TIẾT DI CHUYỂN DÒNG TIỀN NẠP:</div>
            {payments.cash > 0 && <div>💵 Tiền mặt: {payments.cash.toLocaleString()} đ</div>}
            {payments.atm > 0 && <div>💳 Quẹt thẻ POS ATM: {payments.atm.toLocaleString()} đ</div>}
            {payments.zalopay > 0 && <div>📱 ZaloPay QR: {payments.zalopay.toLocaleString()} đ</div>}
            {payments.vnpay > 0 && <div>🔴 VNPay QR: {payments.vnpay.toLocaleString()} đ</div>}
            <div style={{ fontWeight: 'bold', marginTop: 4, fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span>TỔNG KHÁCH ĐÃ NẠP:</span>
              <span>{billingCalculations.paidSum.toLocaleString()} đ</span>
            </div>
          </div>

          <Divider style={{ margin: '8px 0', borderStyle: 'dotted', borderColor: '#333' }} />

          {/* Barcode representation */}
          <div style={{ textAlign: 'center', margin: '10px 0 6px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, height: 24, alignItems: 'stretch' }}>
              {[2,1,3,1,4,1,2,2,1,4,1,2,3,1,2,4,1,2,3,2,1,2,4].map((w, idx) => (
                <div key={idx} style={{ width: w, background: '#000' }}></div>
              ))}
            </div>
            <div style={{ fontSize: 8, marginTop: 2, fontFamily: 'monospace' }}>*POS-{checkoutReceipt?.id}*</div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 9, fontStyle: 'italic', marginTop: 10 }}>
            CẢM ƠN QUÝ KHÁCH - THANKS FOR YOUR PATRONAGE!<br />
            Hóa đơn đã phân phối Kiosk điện tử thành công.<br />
            v2.5 Full-stack Sandbox Engine
          </div>
        </div>
      </Modal>

      {/* DYNAMIC QR CODE SCANNING DIALOG */}
      <Modal
        title={`Cửa sổ Dynamic QR: ${activeQrMethod === 'zalopay' ? 'ZaloPay' : 'VNPay'}`}
        open={qrModalVisible}
        onCancel={() => { setQrModalVisible(false); setActiveQrMethod(null); }}
        footer={null}
        style={{ textAlign: 'center' }}
        width={380}
      >
        <div style={{ padding: '8px 0' }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>
            SỐ TIỀN CẦN THU QUÉT MÃ: <span style={{ color: '#f5222d' }}>{formatVND(qrRemainingAmount)}</span>
          </Text>

          <div style={{ 
            width: 160, 
            height: 160, 
            margin: '0 auto 12px', 
            border: '2px solid #1677ff', 
            borderRadius: 12,
            padding: 8,
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <svg viewBox="0 0 100 100" style={{ width: 110, height: 110 }}>
              <rect x="10" y="10" width="20" height="20" fill={activeQrMethod === 'zalopay' ? '#0084FF' : '#E01E26'} />
              <rect x="70" y="10" width="20" height="20" fill={activeQrMethod === 'zalopay' ? '#0084FF' : '#E01E26'} />
              <rect x="10" y="70" width="20" height="20" fill={activeQrMethod === 'zalopay' ? '#0084FF' : '#E01E26'} />
              <rect x="25" y="25" width="50" height="50" fill="#333" stroke="#fff" strokeWidth="2" strokeDasharray="3,3" />
              <circle cx="50" cy="50" r="10" fill="#52c41a" />
            </svg>
            <div style={{ marginTop: 2 }}>
              <Tag color="success" style={{ fontSize: 9 }}>DEMO WEBHOOK QR</Tag>
            </div>
          </div>

          <Alert
            message="Đang chờ phản hồi Webhook IPN từ ngân hàng..."
            type="info"
            showIcon
            style={{ marginBottom: 12, textAlign: 'left', fontSize: 11 }}
          />

          <Button type="primary" block onClick={handleSimulateQrSuccess} style={{ background: '#52c41a', border: 'none' }}>
            MÔ PHỎNG QUÉT THÀNH CÔNG
          </Button>
        </div>
      </Modal>

      {/* ADVANCED MULTI-TAB ADMINISTRATIVE CONFIGURATION MANAGEMENT MODAL */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '95%' }}>
            <Space>
              <span style={{ fontSize: 14 }}>📋 TRUNG TÂM QUẢN TRỊ CHIẾN DỊCH KHUYẾN MÃI & THIẾT KẾ MẪU BIỂU</span>
              <Tag color="cyan">Admin Panel v2.5</Tag>
            </Space>
          </div>
        }
        open={isJsonModalVisible}
        onCancel={() => setIsJsonModalVisible(false)}
        width={1100}
        styles={{ body: { padding: '8px 16px' } }}
        footer={[
          <Button key="close" onClick={() => setIsJsonModalVisible(false)}>
            Thoát cửa sổ
          </Button>,
          <Button 
            key="reset" 
            danger 
            onClick={() => {
              modal.confirm({
                title: 'Đặt lại cấu trúc Menu & Khuyến mãi mặc định?',
                content: 'Hệ thống sẽ xóa mọi thay đổi tùy chỉnh, khôi phục lại dải thư mục lồng kép chuẩn ban đầu.',
                okText: 'Xác nhận Khôi phục',
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
            Reset cấu hình gốc
          </Button>
        ]}
      >
        <Tabs defaultActiveKey="promo_mgr" size="small" type="card" style={{ marginTop: 6 }} items={[
          {
            key: 'promo_mgr',
            label: <span style={{ fontWeight: 'bold' }}>🎁 Thiết Lập Khuyến Mãi (Form Builder)</span>,
            children: (
              <div style={{ padding: '8px 0' }}>
                <Row gutter={16}>
                  <Col span={10} style={{ borderRight: '1px solid #f0f0f0', paddingRight: 16 }}>
                    <Card size="small" title={<strong style={{ fontSize: 12, color: '#1677ff' }}>{editingPromoKey ? '✏️ CHỈNH SỬA CHƯƠNG TRÌNH' : '➕ THÊM MỚI CHƯƠNG TRÌNH'}</strong>} style={{ background: '#fafafa', borderRadius: 8 }}>
                      <Form layout="vertical" size="small">
                        <Form.Item label="Tên chương trình khuyến mãi (Hiển thị):" required style={{ marginBottom: 8 }}>
                          <Input 
                            value={promoFormTitle} 
                            placeholder="Ví dụ: Giảm giá ROG Độc Quyền" 
                            onChange={(e) => {
                              setPromoFormTitle(e.target.value);
                              if (!editingPromoKey) {
                                // Auto-slugify key
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
                          <Col span={12}>
                            <Form.Item label="Mã hiệu (Unique Code):" required style={{ marginBottom: 8 }}>
                              <Input 
                                value={promoFormId} 
                                disabled={!!editingPromoKey} 
                                placeholder="km_auto_key" 
                                onChange={(e) => setPromoFormId(e.target.value)}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Thư mục vị trí:" required style={{ marginBottom: 8 }}>
                              <Select value={promoFormFolder} placeholder="Chọn Thư mục chứa" onChange={(val) => setPromoFormFolder(val)}>
                                {getAllFolders(consoleMenus).map(f => (
                                  <Select.Option key={f.key} value={f.key}>📁 {f.title}</Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={8}>
                          <Col span={12}>
                            <Form.Item label="Phạm vi tác dụng:" required style={{ marginBottom: 8 }}>
                              <Select value={promoFormScope} onChange={(val: any) => setPromoFormScope(val)}>
                                <Select.Option value="bill">Hóa đơn (Bill)</Select.Option>
                                <Select.Option value="item">Mặt hàng (Item)</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Loại khấu trừ:" required style={{ marginBottom: 8 }}>
                              <Select value={promoFormValueType} disabled={promoFormScope === 'item'} onChange={(val: any) => {
                                setPromoFormValueType(val);
                                if (val === 'rate') {
                                  setPromoFormValue(0.10);
                                } else {
                                  setPromoFormValue(50000);
                                }
                              }}>
                                <Select.Option value="rate">Phần trăm %</Select.Option>
                                <Select.Option value="cash">Tiền mặt VND</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={8}>
                          <Col span={12}>
                            <Form.Item label={promoFormValueType === 'rate' ? "Giá trị giảm (0.10 = 10%):" : "Số tiền mặt giảm (VND):"} required style={{ marginBottom: 8 }}>
                              <InputNumber 
                                style={{ width: '100%' }} 
                                value={promoFormValue} 
                                step={promoFormValueType === 'rate' ? 0.01 : 10000}
                                min={0}
                                onChange={(val) => setPromoFormValue(val || 0)}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Hóa đơn tối thiểu (VND):" style={{ marginBottom: 8 }}>
                              <InputNumber 
                                style={{ width: '100%' }} 
                                value={promoFormThreshold} 
                                placeholder="Ví dụ: 5000000"
                                onChange={(val) => setPromoFormThreshold(val || undefined)}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        {promoFormScope === 'item' && (
                          <Form.Item label="Sản phẩm / Ngành hàng áp dụng:" required style={{ marginBottom: 8 }}>
                            <Select value={promoFormTargetId} placeholder="Chọn Mục tiêu áp dụng" onChange={(val) => setPromoFormTargetId(val)}>
                              <Select.OptGroup label="🛍️ SẢN PHẨM KHỚP">
                                {products.map(p => (
                                  <Select.Option key={p.id} value={p.id}>[{p.id}] {p.name}</Select.Option>
                                ))}
                              </Select.OptGroup>
                              <Select.OptGroup label="📁 NGÀNH HÀNG">
                                <Select.Option value="Electronics">Ngành Giày dép - Footwear</Select.Option>
                                <Select.Option value="Fashion">Ngành Balo & Túi xách - Bags</Select.Option>
                                <Select.Option value="Food">Ngành Ví & Thắt lưng - Accessories</Select.Option>
                                <Select.Option value="Sports">Ngành Chăm sóc giày - Shoe Care</Select.Option>
                              </Select.OptGroup>
                            </Select>
                          </Form.Item>
                        )}

                        <Row gutter={8}>
                          <Col span={12}>
                            <Form.Item label="Chọn biểu mẫu diện mạo:" required style={{ marginBottom: 8 }}>
                              <Select value={promoFormPresetId} onChange={(val) => setPromoFormPresetId(val)}>
                                {visualPresets.map(p => (
                                  <Select.Option key={p.id} value={p.id}>🎨 {p.name}</Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Mẫu thiết kế (Xem trước):" style={{ marginBottom: 8 }}>
                              {(() => {
                                const activePr = visualPresets.find(p => p.id === promoFormPresetId) || visualPresets[0];
                                if (!activePr) return <span>Chưa tạo mẫu</span>;
                                return (
                                  <div style={{ 
                                    background: activePr.background, 
                                    border: activePr.border, 
                                    color: activePr.color, 
                                    padding: '4px 8px', 
                                    borderRadius: 6, 
                                    fontSize: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                  }}>
                                    {renderMenuIcon(activePr.icon, 16, activePr.color)}
                                    <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {promoFormTitle || 'Tên demo card'}
                                    </strong>
                                  </div>
                                );
                              })()}
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item label="Điều kiện Loại trừ (Không thể đi kèm các KM):" style={{ marginBottom: 8 }}>
                          <Select 
                            mode="multiple" 
                            style={{ width: '100%' }} 
                            placeholder="Chọn những mã KM bị xung đột loại trừ"
                            value={promoFormExclusions} 
                            onChange={(val) => setPromoFormExclusions(val)}
                          >
                            {availablePromos.filter(p => p.id !== promoFormId).map(p => (
                              <Select.Option key={p.id} value={p.id}>🚨 {p.name}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item label="Mô tả nội dung ý nghĩa chiến dịch:" style={{ marginBottom: 12 }}>
                          <Input.TextArea rows={2} value={promoFormDesc} placeholder="Mô tả tóm tắt..." onChange={(e) => setPromoFormDesc(e.target.value)} />
                        </Form.Item>

                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {editingPromoKey && (
                            <Button size="small" onClick={() => {
                              setEditingPromoKey(null);
                              setPromoFormTitle('');
                              setPromoFormId('');
                              setPromoFormFolder('');
                              setPromoFormScope('bill');
                              setPromoFormValueType('rate');
                              setPromoFormValue(0.10);
                              setPromoFormThreshold(undefined);
                              setPromoFormTargetId('');
                              setPromoFormDesc('');
                              setPromoFormPresetId(visualPresets[0]?.id || 'preset_green');
                              setPromoFormExclusions([]);
                            }}>Hủy bỏ chỉnh sửa</Button>
                          )}
                          <Button type="primary" size="small" onClick={handleSavePromo} style={{ background: '#52c41a', border: 'none' }}>
                            {editingPromoKey ? 'Cập Nhật Chiến Dịch' : 'Tạo Chương Trình'}
                          </Button>
                        </div>
                      </Form>
                    </Card>
                  </Col>

                  <Col span={14}>
                    <div style={{ marginBottom: 6, fontWeight: 'bold', fontSize: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🎁 DANH SÁCH CHIẾN DỊCH KHUYẾN MÃI HIỆN CÓ CHUẨN (FÁT-MAP)</span>
                      <Tag color="blue" style={{ fontSize: 9 }}>Tổng: {availablePromos.length} CTKM</Tag>
                    </div>
                    
                    <Table 
                      dataSource={availablePromos} 
                      rowKey="id" 
                      size="small" 
                      pagination={{ pageSize: 5 }}
                      columns={[
                        {
                          title: 'Tên / Mã',
                          key: 'name_code',
                          render: (it) => (
                            <div>
                              <strong style={{ fontSize: 11, color: '#333' }}>{it.name}</strong>
                              <div style={{ fontSize: 9, color: '#8c8c8c', fontFamily: 'monospace' }}>Mã: {it.id}</div>
                            </div>
                          )
                        },
                        {
                          title: 'Kiểu áp',
                          key: 'scope_type',
                          render: (it) => (
                            <div>
                              <Tag color={it.scope === 'bill' ? 'blue' : 'orange'} style={{ fontSize: 8 }}>{it.scope === 'bill' ? 'HĐ' : 'MÓN'}</Tag>
                              <div style={{ fontSize: 9, color: '#555' }}>
                                {it.isRate ? `Trừ ${it.value * 100}%` : `Giảm ${it.value.toLocaleString()} đ`}
                              </div>
                            </div>
                          )
                        },
                        {
                          title: 'Điều kiện',
                          key: 'conds',
                          render: (it) => (
                            <div style={{ fontSize: 9, maxWidth: 160 }}>
                              {it.threshold ? <div>Đơn từ: {it.threshold.toLocaleString()} đ</div> : null}
                              {it.targetId ? <div style={{ fontStyle: 'italic', color: '#1677ff' }}>Mục tiêu: {it.targetId}</div> : null}
                              {it.excludePromoKeys && it.excludePromoKeys.length > 0 ? (
                                <div style={{ color: '#ff4d4f' }}>Loại trừ: {it.excludePromoKeys.join(', ')}</div>
                              ) : null}
                            </div>
                          )
                        },
                        {
                          title: 'Visual',
                          key: 'preview',
                          render: (it) => (
                            <div style={{ 
                              background: it.background || '#f5f5f5', 
                              border: it.border || '1px solid #d9d9d9', 
                              color: it.color || '#333', 
                              padding: '2px 6px', 
                              borderRadius: 4, 
                              fontSize: 9,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              {renderMenuIcon(it.icon || 'Gift', 12, it.color || '#333')}
                              <span>Layout</span>
                            </div>
                          )
                        },
                        {
                          title: 'Hành động',
                          key: 'actions',
                          render: (it) => (
                            <Space size="middle">
                              <Button type="link" size="small" style={{ padding: 0, fontSize: 11 }} onClick={() => handleEditPromo(it)}>Sửa</Button>
                              <Popconfirm
                                title="Xóa chiến dịch này khỏi cấu trúc lồng ghép?"
                                onConfirm={() => handleDeletePromo(it.id)}
                                okText="Xóa hoàn toàn"
                                cancelText="Không"
                              >
                                <Button type="text" danger size="small" style={{ padding: 0, fontSize: 11 }}>Xóa</Button>
                              </Popconfirm>
                            </Space>
                          )
                        }
                      ]}
                    />
                  </Col>
                </Row>
              </div>
            )
          },
          {
            key: 'preset_mgr',
            label: <span style={{ fontWeight: 'bold' }}>🎨 Cấu Hình Thư Viện Mẫu (Visual Presets)</span>,
            children: (
              <div style={{ padding: '8px 0' }}>
                <Row gutter={16}>
                  <Col span={11}>
                    <Card size="small" title={<strong style={{ fontSize: 12, color: '#1677ff' }}>{editingPresetId ? '✏️ CHỈNH SỬA BIỂU MẪU' : '➕ THÊM MỚI BIỂU MẪU DIỆN MẠO'}</strong>} style={{ background: '#fafafa', borderRadius: 8 }}>
                      <Form layout="vertical" size="small">
                        <Form.Item label="Tên Mẫu Biểu:" required style={{ marginBottom: 8 }}>
                          <Input value={presetFormName} placeholder="Ví dụ: Thiết kế Đỏ chói - Saleoff" onChange={(e) => setPresetFormName(e.target.value)} />
                        </Form.Item>
                        
                        <Row gutter={8}>
                          <Col span={12}>
                            <Form.Item label="Icon biểu tượng:" required style={{ marginBottom: 8 }}>
                              <Select value={presetFormIcon} placeholder="Chọn Icon đại diện" onChange={(val) => setPresetFormIcon(val)}>
                                {['Gift', 'Zap', 'Sparkles', 'Award', 'Tags', 'Laptop', 'Tv', 'Ticket', 'PartyPopper', 'ShoppingCart', 'Users', 'Percent', 'Briefcase', 'ShieldCheck'].map(ic => (
                                  <Select.Option key={ic} value={ic}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      {renderMenuIcon(ic, 14, '#333')} <span>{ic}</span>
                                    </div>
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          
                          <Col span={12}>
                            <Form.Item label="Mẫu Text & Màu xem trước:" style={{ marginBottom: 8 }}>
                              <div style={{ 
                                background: presetFormBg, 
                                border: presetFormBorder, 
                                color: presetFormColor, 
                                padding: '6px 12px', 
                                borderRadius: 6,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 11
                              }}>
                                {renderMenuIcon(presetFormIcon, 16, presetFormColor)}
                                <strong>Văn bản demo</strong>
                              </div>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={8}>
                          <Col span={8}>
                            <Form.Item label="Màu nền (Background):" required style={{ marginBottom: 8 }}>
                              <Input 
                                type="color" 
                                style={{ height: 32, padding: 2 }} 
                                value={presetFormBg.startsWith('#') && presetFormBg.length === 7 ? presetFormBg : '#ffffff'} 
                                onChange={(e) => setPresetFormBg(e.target.value)} 
                              />
                              <Input size="small" style={{ marginTop: 4, fontSize: 10 }} value={presetFormBg} onChange={(e) => setPresetFormBg(e.target.value)} />
                            </Form.Item>
                          </Col>

                          <Col span={8}>
                            <Form.Item label="Màu viền (Border):" required style={{ marginBottom: 8 }}>
                              <Input 
                                type="color" 
                                style={{ height: 32, padding: 2 }} 
                                value={presetFormBorder.includes('#') ? ('#' + presetFormBorder.split('#')[1].substring(0,6)) : '#dddddd'} 
                                onChange={(e) => setPresetFormBorder(`1px solid ${e.target.value}`)} 
                              />
                              <Input size="small" style={{ marginTop: 4, fontSize: 10 }} value={presetFormBorder} onChange={(e) => setPresetFormBorder(e.target.value)} />
                            </Form.Item>
                          </Col>

                          <Col span={8}>
                            <Form.Item label="Màu chữ & Icon (Color):" required style={{ marginBottom: 8 }}>
                              <Input 
                                type="color" 
                                style={{ height: 32, padding: 2 }} 
                                value={presetFormColor.startsWith('#') && presetFormColor.length === 7 ? presetFormColor : '#000000'} 
                                onChange={(e) => setPresetFormColor(e.target.value)} 
                              />
                              <Input size="small" style={{ marginTop: 4, fontSize: 10 }} value={presetFormColor} onChange={(e) => setPresetFormColor(e.target.value)} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 12 }}>
                          {editingPresetId && (
                            <Button size="small" onClick={() => {
                              setEditingPresetId(null);
                              setPresetFormName('');
                              setPresetFormIcon('Gift');
                              setPresetFormBg('#fafafa');
                              setPresetFormBorder('1px solid #d9d9d9');
                              setPresetFormColor('#1677ff');
                            }}>Hủy bỏ sửa</Button>
                          )}
                          <Button type="primary" size="small" onClick={handleSavePreset} style={{ background: '#52c41a', border: 'none' }}>
                            {editingPresetId ? 'Cập Nhật Mẫu' : 'Thêm Mẫu Biểu'}
                          </Button>
                        </div>
                      </Form>
                    </Card>
                  </Col>

                  <Col span={13}>
                    <div style={{ marginBottom: 6, fontWeight: 'bold', fontSize: 11 }}>
                      🎨 BIỂU MẪU DIỆN MẠO HIỆN CÓ SẴN (Giao diện cấu hình biểu mẫu)
                    </div>
                    
                    <Table
                      dataSource={visualPresets}
                      rowKey="id"
                      size="small"
                      columns={[
                        {
                          title: 'Tên mẫu',
                          dataIndex: 'name',
                          key: 'name',
                          render: (val) => <strong style={{ fontSize: 11 }}>{val}</strong>
                        },
                        {
                          title: 'Biểu tượng',
                          dataIndex: 'icon',
                          key: 'icon',
                          render: (val, record) => (
                            <div style={{ display: 'inline-flex' }}>
                              {renderMenuIcon(val, 16, record.color)}
                            </div>
                          )
                        },
                        {
                          title: 'Hiển thị mẫu card',
                          key: 'look',
                          render: (record) => (
                            <div style={{ 
                              background: record.background,
                              border: record.border,
                              color: record.color,
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 'bold',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}>
                              {renderMenuIcon(record.icon, 12, record.color)}
                              <span>{record.name} Layout</span>
                            </div>
                          )
                        },
                        {
                          title: 'Thao tác',
                          key: 'ops',
                          render: (record) => (
                            <Space size="middle">
                              <Button type="link" size="small" style={{ padding: 0, fontSize: 11 }} onClick={() => handleEditPreset(record)}>Sửa</Button>
                              <Popconfirm
                                title="Xóa mẫu thiết kế này?"
                                onConfirm={() => handleDeletePreset(record.id)}
                                okText="Xóa mẫu"
                                cancelText="Không"
                              >
                                <Button type="text" danger size="small" style={{ padding: 0, fontSize: 11 }}>Xóa</Button>
                              </Popconfirm>
                            </Space>
                          )
                        }
                      ]}
                    />
                  </Col>
                </Row>
              </div>
            )
          },
          {
            key: 'raw_json',
            label: <span style={{ fontWeight: 'bold' }}>🔧 Cây Lồng Ghép JSONB Gộp (Source)</span>,
            children: (
              <div style={{ padding: '8px 0' }}>
                <Alert
                  message={
                    <div>
                      <strong>Cơ chế đồng bộ JSONB lồng kép cấp cha/con:</strong><br/>
                      Đoạn mã JSON dưới đây là cấu trúc chính thức lồng kép của operator console. Bạn có thể thay đổi để thực hiện các chỉnh sửa nâng cao hoặc sao lưu toàn bộ cấu hình. Khi bấm Lưu, hệ thống sẽ thực hiện phẳng hóa dải promostions ra bảng `pos_promotions`.
                    </div>
                  }
                  type="warning"
                  showIcon
                  style={{ marginBottom: 12 }}
                />

                <Row gutter={16}>
                  <Col span={14}>
                    <div style={{ marginBottom: 6, fontWeight: 'bold', fontSize: 11 }}>
                      📁 CÂY MENU & THƯ MỤC KHUYẾN MÃI LỒNG GHÉP (pos_console_menus)
                    </div>
                    <Input.TextArea
                      rows={14}
                      value={menusJsonText}
                      onChange={(e) => setMenusJsonText(e.target.value)}
                      style={{ 
                        fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', 
                        fontSize: 11, 
                        background: '#141414', 
                        color: '#fa8c16', 
                        borderRadius: 6,
                        padding: '10px'
                      }}
                    />
                    <div style={{ marginTop: 8, textAlign: 'right' }}>
                      <Button 
                        type="primary" 
                        size="small"
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(menusJsonText);
                            if (!Array.isArray(parsed)) {
                              throw new Error('Dữ liệu Cây danh mục phải là một mảng [] cấu trúc phân cấp.');
                            }
                            
                            // Save tree
                            setConsoleMenus(parsed);
                            localStorage.setItem('pos_console_menus', JSON.stringify(parsed));
                            
                            // Recalculate promos
                            const calculatedPromos = extractPromotionsFromTree(parsed);
                            localStorage.setItem('pos_promotions', JSON.stringify(calculatedPromos));
                            
                            modal.success({
                              title: 'Đồng bộ kết quả thành công',
                              content: 'Cấu trúc cây danh mục lồng ghép (pos_console_menus) và mảng khuyến mãi phẳng (pos_promotions) đã được lưu, ánh xạ và làm mới đồng bộ trên giao diện POS!'
                            });
                          } catch (err: any) {
                            modal.error({
                              title: 'Lỗi Cú pháp JSON!',
                              content: `Không thể phân tích chuỗi JSON: ${err.message}`
                            });
                          }
                        }}
                      >
                        Lưu & Áp Dụng JSON
                      </Button>
                    </div>
                  </Col>
                  
                  <Col span={10}>
                    <div style={{ marginBottom: 6, fontWeight: 'bold', fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
                      <span>🎁 MẢNG CHIẾN DỊCH PHẲNG TRÍCH XUẤT TRỰC TIẾP (pos_promotions)</span>
                    </div>
                    <pre style={{ 
                      margin: 0, 
                      height: '345px', 
                      overflow: 'auto',
                      fontSize: 11,
                      fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                      background: '#1f1f1f',
                      color: '#52c41a',
                      border: '1px solid #333',
                      borderRadius: 6,
                      padding: '10px'
                    }}>
                      {JSON.stringify(availablePromos, null, 2)}
                    </pre>
                  </Col>
                </Row>
              </div>
            )
          }
        ]} />
      </Modal>
    </div>
  );
}
