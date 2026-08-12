import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Typography, Space, Tooltip, Button, List, Avatar, Progress, theme, Divider, Select, Rate, Radio, Form, DatePicker } from 'antd';
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
  ReloadOutlined,
  ShopOutlined,
  TeamOutlined,
  StarOutlined,
  CalendarOutlined,
  CheckOutlined,
  CrownOutlined,
  SearchOutlined
} from '@ant-design/icons';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import PageContainer from '../components/PageContainer';
import { Revenue3D, Order3D, User3D, Product3D } from '../components/Interactive3DIcon';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';

const { Title, Text } = Typography;

// Custom Animated Progress Bar with shimmer effect
const AnimatedProgressBar: React.FC<{ 
  percent: number; 
  strokeColor: string; 
  height?: number;
  className?: string;
}> = ({ percent, strokeColor, height = 6, className = "" }) => {
  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden relative ${className}`} style={{ height }}>
      <motion.div
        className="h-full rounded-full relative"
        style={{ backgroundColor: strokeColor }}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {/* Shimmer overlay animation */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent -translate-x-full"
          style={{
            animation: 'shimmer 1.8s infinite linear',
          }}
        />
      </motion.div>
    </div>
  );
};

interface DashboardData {
  revenue: number;
  revenueVsLast: number;
  orders: number;
  ordersVsLast: number;
  customers: number;
  customersVsLast: number;
  activeProducts: number;
  productsVsLast: number;
  chartCategories: string[];
  chartRevenueData: number[];
  chartOrderData: number[];
  pieData: { name: string; y: number; color: string }[];
  topStores: { name: string; id: string; revenue: number; percentage: number }[];
  topEmployees: { name: string; role: string; revenue: number; orders: number; avatar: string; rating: number }[];
  bestSellers: { name: string; category: string; sales: number; revenue: number; stockPercent: number; trend: 'up' | 'down' }[];
  newCustomers: { name: string; email: string; spent: number; orders: number; avatar: string; isPotential: boolean }[];
  ratingMetrics: { average: number; totalBills: number; ratedBillsPercent: number; distribution: { rate: number; count: number; percent: number }[] };
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [form] = Form.useForm();
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<string>('All');
  const [timeRange, setTimeRange] = useState<string>('month'); // today, week, month, quarter, year

  const handleSearch = (values: any) => {
    if (values?.storeId) {
      setSelectedStore(values.storeId);
    }
    if (values?.timeRange) {
      setTimeRange(values.timeRange);
    }
    setHasSearched(true);
  };

  const handleReset = () => {
    form.resetFields();
    setSelectedStore('All');
    setTimeRange('month');
    setHasSearched(false);
  };

  // 1. Generate realistic data based on filters dynamically
  const dashboardData = useMemo<DashboardData>(() => {
    // Basic multipliers for store specific variations
    let storeMult = 1.0;
    if (selectedStore === 'ST-HN-01') storeMult = 0.35;
    else if (selectedStore === 'ST-HN-02') storeMult = 0.20;
    else if (selectedStore === 'ST-HCM-01') storeMult = 0.45;
    else if (selectedStore === 'ST-HCM-02') storeMult = 0.28;
    else if (selectedStore === 'ST-HCM-03') storeMult = 0.25;
    else if (selectedStore === 'ST-DN-02') storeMult = 0.15;

    // Time ranges statistics
    if (timeRange === 'today') {
      const rev = Math.round(18500000 * storeMult);
      return {
        revenue: rev,
        revenueVsLast: 4.8,
        orders: Math.round(52 * storeMult) || 1,
        ordersVsLast: -2.1,
        customers: Math.round(18 * storeMult) || 1,
        customersVsLast: 8.5,
        activeProducts: 142,
        productsVsLast: 1.2,
        chartCategories: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        chartRevenueData: [1200000, 2400000, 4100000, 3100000, 5200000, 6800000, 4500000, 1500000].map(v => Math.round(v * storeMult)),
        chartOrderData: [4, 8, 12, 10, 15, 18, 12, 5].map(v => Math.max(1, Math.round(v * storeMult))),
        pieData: [
          { name: 'Giày dép', y: 48, color: token.colorPrimary },
          { name: 'Balo & Túi xách', y: 32, color: '#faad14' },
          { name: 'Ví & Phụ kiện', y: 20, color: '#52c41a' }
        ],
        topStores: [
          { name: 'Cửa hàng Nguyễn Trãi - HCM', id: 'ST-HCM-01', revenue: Math.round(8200000 * storeMult), percentage: 44 },
          { name: 'Cửa hàng Phố Huế - HN', id: 'ST-HN-01', revenue: Math.round(6100000 * storeMult), percentage: 33 },
          { name: 'Cửa hàng CMT8 - HCM', id: 'ST-HCM-02', revenue: Math.round(4200000 * storeMult), percentage: 23 },
        ],
        topEmployees: [
          { name: 'Nguyễn Văn Hùng', role: 'Thu ngân chính', revenue: Math.round(11200000 * storeMult), orders: Math.round(28 * storeMult), avatar: 'https://i.pravatar.cc/150?u=hungnv', rating: 4.9 },
          { name: 'Trần Thị Mai', role: 'Nhân viên bán hàng', revenue: Math.round(7300000 * storeMult), orders: Math.round(24 * storeMult), avatar: 'https://i.pravatar.cc/150?u=maitt', rating: 4.8 }
        ],
        bestSellers: [
          { name: "Sneaker Hunter Street", category: 'Giày dép', sales: Math.round(18 * storeMult), revenue: Math.round(11700000 * storeMult), stockPercent: 65, trend: 'up' },
          { name: "Balo Laptop Tucano", category: 'Balo & Túi xách', sales: Math.round(8 * storeMult), revenue: Math.round(6800000 * storeMult), stockPercent: 42, trend: 'up' },
          { name: "Ví Da Nam Saffiano", category: 'Ví & Phụ kiện', sales: Math.round(5 * storeMult), revenue: Math.round(4500000 * storeMult), stockPercent: 18, trend: 'down' }
        ],
        newCustomers: [
          { name: 'Bùi Thế Đán', email: 'danbt@gmail.com', spent: 3450000, orders: 1, avatar: 'https://i.pravatar.cc/150?u=dan', isPotential: true },
          { name: 'Nguyễn Hồng Liên', email: 'lien.nh@yahoo.com', spent: 1850000, orders: 1, avatar: 'https://i.pravatar.cc/150?u=lien', isPotential: false }
        ],
        ratingMetrics: {
          average: 4.82,
          totalBills: Math.round(52 * storeMult),
          ratedBillsPercent: 88,
          distribution: [
            { rate: 5, count: Math.round(42 * storeMult), percent: 81 },
            { rate: 4, count: Math.round(7 * storeMult), percent: 13 },
            { rate: 3, count: Math.round(2 * storeMult), percent: 4 },
            { rate: 2, count: Math.round(1 * storeMult), percent: 2 },
            { rate: 1, count: 0, percent: 0 }
          ]
        }
      };
    }

    if (timeRange === 'week') {
      const rev = Math.round(145000000 * storeMult);
      return {
        revenue: rev,
        revenueVsLast: 9.3,
        orders: Math.round(412 * storeMult) || 5,
        ordersVsLast: 3.5,
        customers: Math.round(145 * storeMult) || 4,
        customersVsLast: 12.1,
        activeProducts: 142,
        productsVsLast: 2.5,
        chartCategories: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
        chartRevenueData: [15000000, 18000000, 22000000, 19500000, 24000000, 29000000, 17500000].map(v => Math.round(v * storeMult)),
        chartOrderData: [45, 52, 60, 55, 68, 80, 52].map(v => Math.max(1, Math.round(v * storeMult))),
        pieData: [
          { name: 'Giày dép', y: 44, color: token.colorPrimary },
          { name: 'Balo & Túi xách', y: 36, color: '#faad14' },
          { name: 'Ví & Phụ kiện', y: 20, color: '#52c41a' }
        ],
        topStores: [
          { name: 'Cửa hàng Nguyễn Trãi - HCM', id: 'ST-HCM-01', revenue: Math.round(62000000 * storeMult), percentage: 43 },
          { name: 'Cửa hàng Phố Huế - HN', id: 'ST-HN-01', revenue: Math.round(48000000 * storeMult), percentage: 33 },
          { name: 'Cửa hàng CMT8 - HCM', id: 'ST-HCM-02', revenue: Math.round(35000000 * storeMult), percentage: 24 },
        ],
        topEmployees: [
          { name: 'Nguyễn Văn Hùng', role: 'Thu ngân chính', revenue: Math.round(85000000 * storeMult), orders: Math.round(210 * storeMult), avatar: 'https://i.pravatar.cc/150?u=hungnv', rating: 4.88 },
          { name: 'Trần Thị Mai', role: 'Nhân viên bán hàng', revenue: Math.round(60000000 * storeMult), orders: Math.round(202 * storeMult), avatar: 'https://i.pravatar.cc/150?u=maitt', rating: 4.82 }
        ],
        bestSellers: [
          { name: "Sneaker Hunter Street", category: 'Giày dép', sales: Math.round(112 * storeMult), revenue: Math.round(72800000 * storeMult), stockPercent: 70, trend: 'up' },
          { name: "Balo Laptop Tucano", category: 'Balo & Túi xách', sales: Math.round(52 * storeMult), revenue: Math.round(44200000 * storeMult), stockPercent: 48, trend: 'up' },
          { name: "Ví Da Nam Saffiano", category: 'Ví & Phụ kiện', sales: Math.round(38 * storeMult), revenue: Math.round(28000000 * storeMult), stockPercent: 25, trend: 'up' }
        ],
        newCustomers: [
          { name: 'Vương Đình Huệ', email: 'huevd@gmail.com', spent: 12500000, orders: 3, avatar: 'https://i.pravatar.cc/150?u=hue', isPotential: true },
          { name: 'Lê Minh Tuấn', email: 'tuanlm@outlook.com', spent: 5400000, orders: 2, avatar: 'https://i.pravatar.cc/150?u=tuan', isPotential: true }
        ],
        ratingMetrics: {
          average: 4.79,
          totalBills: Math.round(412 * storeMult),
          ratedBillsPercent: 85,
          distribution: [
            { rate: 5, count: Math.round(315 * storeMult), percent: 76 },
            { rate: 4, count: Math.round(68 * storeMult), percent: 17 },
            { rate: 3, count: Math.round(21 * storeMult), percent: 5 },
            { rate: 2, count: Math.round(8 * storeMult), percent: 2 },
            { rate: 1, count: 0, percent: 0 }
          ]
        }
      };
    }

    if (timeRange === 'quarter') {
      const rev = Math.round(1850000000 * storeMult);
      return {
        revenue: rev,
        revenueVsLast: 15.6,
        orders: Math.round(5240 * storeMult) || 50,
        ordersVsLast: 8.9,
        customers: Math.round(1950 * storeMult) || 20,
        customersVsLast: 14.2,
        activeProducts: 142,
        productsVsLast: 8.5,
        chartCategories: ['Tháng 1', 'Tháng 2', 'Tháng 3'],
        chartRevenueData: [550000000, 620000000, 680000000].map(v => Math.round(v * storeMult)),
        chartOrderData: [1540, 1800, 1900].map(v => Math.max(1, Math.round(v * storeMult))),
        pieData: [
          { name: 'Giày dép', y: 46, color: token.colorPrimary },
          { name: 'Balo & Túi xách', y: 34, color: '#faad14' },
          { name: 'Ví & Phụ kiện', y: 20, color: '#52c41a' }
        ],
        topStores: [
          { name: 'Cửa hàng Nguyễn Trãi - HCM', id: 'ST-HCM-01', revenue: Math.round(795000000 * storeMult), percentage: 43 },
          { name: 'Cửa hàng Phố Huế - HN', id: 'ST-HN-01', revenue: Math.round(610000000 * storeMult), percentage: 33 },
          { name: 'Cửa hàng CMT8 - HCM', id: 'ST-HCM-02', revenue: Math.round(445000000 * storeMult), percentage: 24 },
        ],
        topEmployees: [
          { name: 'Nguyễn Văn Hùng', role: 'Thu ngân chính', revenue: Math.round(980000000 * storeMult), orders: Math.round(2400 * storeMult), avatar: 'https://i.pravatar.cc/150?u=hungnv', rating: 4.82 },
          { name: 'Trần Thị Mai', role: 'Nhân viên bán hàng', revenue: Math.round(870000000 * storeMult), orders: Math.round(2840 * storeMult), avatar: 'https://i.pravatar.cc/150?u=maitt', rating: 4.75 }
        ],
        bestSellers: [
          { name: "Sneaker Hunter Street", category: 'Giày dép', sales: Math.round(1450 * storeMult), revenue: Math.round(942500000 * storeMult), stockPercent: 88, trend: 'up' },
          { name: "Balo Laptop Tucano", category: 'Balo & Túi xách', sales: Math.round(680 * storeMult), revenue: Math.round(578000000 * storeMult), stockPercent: 72, trend: 'up' },
          { name: "Ví Da Nam Saffiano", category: 'Ví & Phụ kiện', sales: Math.round(410 * storeMult), revenue: Math.round(329500000 * storeMult), stockPercent: 64, trend: 'up' }
        ],
        newCustomers: [
          { name: 'Tô Lâm', email: 'tolam.police@gov.vn', spent: 48900000, orders: 12, avatar: 'https://i.pravatar.cc/150?u=tolam', isPotential: true },
          { name: 'Phạm Minh Chính', email: 'chinhpm@gmail.com', spent: 25400000, orders: 8, avatar: 'https://i.pravatar.cc/150?u=chinh', isPotential: true }
        ],
        ratingMetrics: {
          average: 4.73,
          totalBills: Math.round(5240 * storeMult),
          ratedBillsPercent: 82,
          distribution: [
            { rate: 5, count: Math.round(3930 * storeMult), percent: 75 },
            { rate: 4, count: Math.round(890 * storeMult), percent: 17 },
            { rate: 3, count: Math.round(310 * storeMult), percent: 6 },
            { rate: 2, count: Math.round(110 * storeMult), percent: 2 },
            { rate: 1, count: 0, percent: 0 }
          ]
        }
      };
    }

    if (timeRange === 'year') {
      const rev = Math.round(7450000000 * storeMult);
      return {
        revenue: rev,
        revenueVsLast: 24.5,
        orders: Math.round(21450 * storeMult) || 200,
        ordersVsLast: 12.8,
        customers: Math.round(8200 * storeMult) || 80,
        customersVsLast: 18.9,
        activeProducts: 142,
        productsVsLast: 14.5,
        chartCategories: ['Q1', 'Q2', 'Q3', 'Q4'],
        chartRevenueData: [1650000000, 1850000000, 1950000000, 2000000000].map(v => Math.round(v * storeMult)),
        chartOrderData: [4500, 5200, 5800, 5950].map(v => Math.max(1, Math.round(v * storeMult))),
        pieData: [
          { name: 'Giày dép', y: 45, color: token.colorPrimary },
          { name: 'Balo & Túi xách', y: 35, color: '#faad14' },
          { name: 'Ví & Phụ kiện', y: 20, color: '#52c41a' }
        ],
        topStores: [
          { name: 'Cửa hàng Nguyễn Trãi - HCM', id: 'ST-HCM-01', revenue: Math.round(3203000000 * storeMult), percentage: 43 },
          { name: 'Cửa hàng Phố Huế - HN', id: 'ST-HN-01', revenue: Math.round(2458000000 * storeMult), percentage: 33 },
          { name: 'Cửa hàng CMT8 - HCM', id: 'ST-HCM-02', revenue: Math.round(1789000000 * storeMult), percentage: 24 },
        ],
        topEmployees: [
          { name: 'Nguyễn Văn Hùng', role: 'Thu ngân chính', revenue: Math.round(3980000000 * storeMult), orders: Math.round(11200 * storeMult), avatar: 'https://i.pravatar.cc/150?u=hungnv', rating: 4.78 },
          { name: 'Trần Thị Mai', role: 'Nhân viên bán hàng', revenue: Math.round(3470000000 * storeMult), orders: Math.round(10250 * storeMult), avatar: 'https://i.pravatar.cc/150?u=maitt', rating: 4.71 }
        ],
        bestSellers: [
          { name: "Sneaker Hunter Street", category: 'Giày dép', sales: Math.round(5820 * storeMult), revenue: Math.round(3783000000 * storeMult), stockPercent: 92, trend: 'up' },
          { name: "Balo Laptop Tucano", category: 'Balo & Túi xách', sales: Math.round(2840 * storeMult), revenue: Math.round(2414000000 * storeMult), stockPercent: 81, trend: 'up' },
          { name: "Ví Da Nam Saffiano", category: 'Ví & Phụ kiện', sales: Math.round(1680 * storeMult), revenue: Math.round(1253000000 * storeMult), stockPercent: 74, trend: 'up' }
        ],
        newCustomers: [
          { name: 'Tô Lâm', email: 'tolam.police@gov.vn', spent: 48900000, orders: 12, avatar: 'https://i.pravatar.cc/150?u=tolam', isPotential: true },
          { name: 'Nguyễn Thị Kim Ngân', email: 'ngannk@outlook.com', spent: 34500000, orders: 10, avatar: 'https://i.pravatar.cc/150?u=ngan', isPotential: true }
        ],
        ratingMetrics: {
          average: 4.71,
          totalBills: Math.round(21450 * storeMult),
          ratedBillsPercent: 79,
          distribution: [
            { rate: 5, count: Math.round(15873 * storeMult), percent: 74 },
            { rate: 4, count: Math.round(3861 * storeMult), percent: 18 },
            { rate: 3, count: Math.round(1287 * storeMult), percent: 6 },
            { rate: 2, count: Math.round(429 * storeMult), percent: 2 },
            { rate: 1, count: 0, percent: 0 }
          ]
        }
      };
    }

    // Default 'month' data (Primary Default fallback view)
    const rev = Math.round(589230000 * storeMult);
    return {
      revenue: rev,
      revenueVsLast: 12.4,
      orders: Math.round(1482 * storeMult) || 12,
      ordersVsLast: 6.8,
      customers: Math.round(582 * storeMult) || 8,
      customersVsLast: 10.5,
      activeProducts: 142,
      productsVsLast: 4.8,
      chartCategories: ['01/07', '05/07', '10/07', '15/07', '20/07', '25/07', '31/07'],
      chartRevenueData: [52000000, 68000000, 85000000, 79000000, 94000000, 112000000, 99230000].map(v => Math.round(v * storeMult)),
      chartOrderData: [120, 150, 185, 160, 210, 245, 412].map(v => Math.max(1, Math.round(v * storeMult))),
      pieData: [
        { name: 'Giày dép', y: 45, color: token.colorPrimary },
        { name: 'Balo & Túi xách', y: 35, color: '#faad14' },
        { name: 'Ví & Phụ kiện', y: 20, color: '#52c41a' }
      ],
      topStores: [
        { name: 'Cửa hàng Nguyễn Trãi - HCM', id: 'ST-HCM-01', revenue: Math.round(253000000 * storeMult), percentage: 43 },
        { name: 'Cửa hàng Phố Huế - HN', id: 'ST-HN-01', revenue: Math.round(194000000 * storeMult), percentage: 33 },
        { name: 'Cửa hàng CMT8 - HCM', id: 'ST-HCM-02', revenue: Math.round(142230000 * storeMult), percentage: 24 },
      ],
      topEmployees: [
        { name: 'Nguyễn Văn Hùng', role: 'Thu ngân chính', revenue: Math.round(312000000 * storeMult), orders: Math.round(812 * storeMult), avatar: 'https://i.pravatar.cc/150?u=hungnv', rating: 4.85 },
        { name: 'Trần Thị Mai', role: 'Nhân viên bán hàng', revenue: Math.round(277230000 * storeMult), orders: Math.round(670 * storeMult), avatar: 'https://i.pravatar.cc/150?u=maitt', rating: 4.79 }
      ],
      bestSellers: [
        { name: "Sneaker Hunter Street", category: 'Giày dép', sales: Math.round(412 * storeMult), revenue: Math.round(267800000 * storeMult), stockPercent: 78, trend: 'up' },
        { name: "Balo Laptop Tucano", category: 'Balo & Túi xách', sales: Math.round(185 * storeMult), revenue: Math.round(157200000 * storeMult), stockPercent: 55, trend: 'up' },
        { name: "Ví Da Nam Saffiano", category: 'Ví & Phụ kiện', sales: Math.round(112 * storeMult), revenue: Math.round(100800000 * storeMult), stockPercent: 41, trend: 'up' }
      ],
      newCustomers: [
        { name: 'Phạm Minh Chính', email: 'chinh.pm@gmail.com', spent: 3450000, orders: 1, avatar: 'https://i.pravatar.cc/150?u=chinh', isPotential: true },
        { name: 'Nguyễn Thị Kim Ngân', email: 'ngannk@outlook.com', spent: 12500000, orders: 4, avatar: 'https://i.pravatar.cc/150?u=ngan', isPotential: true }
      ],
      ratingMetrics: {
        average: 4.76,
        totalBills: Math.round(1482 * storeMult),
        ratedBillsPercent: 81,
        distribution: [
          { rate: 5, count: Math.round(1110 * storeMult), percent: 75 },
          { rate: 4, count: Math.round(252 * storeMult), percent: 17 },
          { rate: 3, count: Math.round(89 * storeMult), percent: 6 },
          { rate: 2, count: Math.round(31 * storeMult), percent: 2 },
          { rate: 1, count: 0, percent: 0 }
        ]
      }
    };
  }, [selectedStore, timeRange, token]);

  // Highcharts Graph Configuration (Interactive & Fluid)
  const mainChartOptions: Highcharts.Options = {
    chart: { 
      type: 'areaspline',
      height: 350, 
      style: { fontFamily: 'inherit' }, 
      backgroundColor: 'transparent' 
    },
    title: { text: '' },
    xAxis: { 
      categories: dashboardData.chartCategories,
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineWidth: 0,
      lineColor: '#cbd5e1'
    },
    yAxis: [
      { // Revenue axis
        title: { text: 'Doanh thu (VNĐ)', style: { color: token.colorPrimary, fontSize: '11px', fontWeight: 'bold' } },
        labels: { 
          formatter: function(this: any) {
            const val = Number(this?.value || 0);
            return val >= 1000000 ? (val / 1000000).toFixed(0) + 'M' : val.toLocaleString('vi-VN');
          },
          style: { color: '#64748b' }
        },
        gridLineDashStyle: 'Dash',
        gridLineColor: '#f1f5f9'
      },
      { // Orders axis (opposite side)
        title: { text: 'Số lượng đơn', style: { color: '#f59e0b', fontSize: '11px', fontWeight: 'bold' } },
        labels: { style: { color: '#64748b' } },
        opposite: true,
        gridLineWidth: 0
      }
    ],
    tooltip: {
      shared: true,
      useHTML: true,
      headerFormat: '<div style="font-size: 11px; color: #94a3b8; font-weight: bold; margin-bottom: 4px;">Kỳ báo cáo: {point.key}</div>',
      pointFormat: '<div style="display: flex; align-items: center; gap: 8px; font-size: 12px; margin: 3px 0;">' +
        '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: {series.color}"></span>' +
        '<span style="color: #64748b">{series.name}:</span> ' +
        '<span style="font-weight: bold; color: #1e293b">{point.y:,.0f}</span>' +
        '</div>',
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 12,
      shadow: {
        offsetX: 0,
        offsetY: 6,
        opacity: 0.05,
        width: 10
      }
    },
    series: [
      {
        name: 'Doanh thu thực tế',
        type: 'column',
        yAxis: 0,
        data: dashboardData.chartRevenueData,
        color: token.colorPrimary,
        borderRadius: 4,
        maxPointWidth: 35,
      },
      {
        name: 'Số đơn hàng',
        type: 'spline',
        yAxis: 1,
        data: dashboardData.chartOrderData,
        color: '#f59e0b',
        lineWidth: 3,
        marker: {
          radius: 4,
          states: {
            hover: {
              enabled: true,
              radius: 6
            }
          }
        }
      }
    ],
    credits: { enabled: false },
    plotOptions: {
      series: {
        cursor: 'pointer',
        point: {
          events: {
            click: function (this: any) {
              const xVal = this?.category;
              const yVal = this?.y;
              if (xVal !== undefined && yVal !== undefined) {
                console.log(`Selected data point: ${xVal}, Value: ${yVal}`);
              }
            }
          }
        }
      }
    }
  };

  // Pie chart reflecting proportions & share ratios
  const pieOptions: Highcharts.Options = {
    chart: { 
      type: 'pie', 
      height: 250, 
      backgroundColor: 'transparent' 
    },
    title: { text: '' },
    tooltip: {
      pointFormat: '<span style="font-size:12px; color:#64748b">{series.name}:</span> <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%',
          style: {
            fontSize: '11px',
            color: '#334155'
          },
          connectorColor: '#e2e8f0'
        },
        innerSize: '65%'
      }
    },
    series: [{
      name: 'Tỷ trọng ngành hàng',
      type: 'pie',
      data: dashboardData.pieData
    }],
    credits: { enabled: false }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageContainer title={t('dashboard')} subtitle={t('welcome')}>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}} />

        {/* Top Search & Filter Bar similar to Orders page (No ID, no status) */}
        <motion.div variants={item} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <Form
            form={form}
            layout="vertical"
            initialValues={{ storeId: 'All', timeRange: 'month' }}
            onFinish={handleSearch}
          >
            <Row gutter={[16, 16]} align="bottom">
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="storeId" label="Mã cửa hàng" style={{ marginBottom: 0 }}>
                  <Select 
                    style={{ width: '100%' }}
                    placeholder="Chọn cửa hàng"
                    suffixIcon={<ShopOutlined />}
                    options={[
                      { value: 'All', label: 'Tất cả cửa hàng (Hệ thống)' },
                      { value: 'ST-HN-01', label: 'ST-HN-01 (Phố Huế - HN)' },
                      { value: 'ST-HN-02', label: 'ST-HN-02 (Kim Mã - HN)' },
                      { value: 'ST-HCM-01', label: 'ST-HCM-01 (Nguyễn Trãi - HCM)' },
                      { value: 'ST-HCM-02', label: 'ST-HCM-02 (CMT8 - HCM)' },
                      { value: 'ST-HCM-03', label: 'ST-HCM-03 (Minh Khai - HCM)' },
                      { value: 'ST-DN-02', label: 'ST-DN-02 (Hùng Vương - ĐN)' },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="timeRange" label="Kỳ báo cáo" style={{ marginBottom: 0 }}>
                  <Select 
                    style={{ width: '100%' }}
                    placeholder="Chọn kỳ báo cáo"
                    options={[
                      { value: 'today', label: 'Hôm nay' },
                      { value: 'week', label: 'Tuần này' },
                      { value: 'month', label: 'Tháng này' },
                      { value: 'quarter', label: 'Quý này' },
                      { value: 'year', label: 'Năm nay' },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="dateRange" label="Khoảng ngày tùy chọn" style={{ marginBottom: 0 }}>
                  <DatePicker.RangePicker 
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY" 
                    placeholder={['Từ ngày', 'Đến ngày']} 
                    placement="bottomLeft"
                    classNames={{ popup: { root: 'mobile-responsive-picker' } }}
                    presets={[
                      { label: 'Hôm nay', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
                      { label: '3 ngày', value: [dayjs().subtract(2, 'day').startOf('day'), dayjs().endOf('day')] },
                      { label: '7 ngày', value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')] },
                      { label: 'Tuần này', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
                      { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                      { label: 'Năm này', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <Space size={12}>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    Xóa bộ lọc
                  </Button>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    Tìm kiếm
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </motion.div>

        {!hasSearched ? (
          /* Welcome Card Prompt before search */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center py-20 px-6 bg-white border border-slate-100 rounded-2xl shadow-sm"
          >
            <div className="max-w-md mx-auto space-y-5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600">
                <CalendarOutlined style={{ fontSize: 26 }} className="animate-pulse" />
              </div>
              <Title level={4} className="text-slate-800 m-0 font-bold">Hệ thống Phân tích Dữ liệu Bán lẻ</Title>
              <Text className="text-slate-400 block text-xs leading-relaxed">
                Chào mừng bạn đến với bảng điều khiển phân tích thời gian thực. Vui lòng thiết lập bộ lọc (cửa hàng & kỳ báo cáo) ở trên và nhấn nút <span className="font-bold text-blue-600">"Tìm kiếm"</span> để bắt đầu phân tích trực quan hóa số liệu.
              </Text>
              <div className="pt-2">
                <Button type="primary" size="large" onClick={() => form.submit()} icon={<SearchOutlined />}>
                  Tải dữ liệu phân tích ngay
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">

        {/* Major Visual Metric Modules with Interactive 3D SVG Icons */}
        <Row gutter={[20, 20]}>
          
          {/* Card 1: Revenue (Doanh thu) */}
          <Col xs={24} sm={12} md={6}>
            <motion.div variants={item} whileHover={{ y: -4 }} className="h-full">
              <Card variant="borderless" className="shadow-sm border border-slate-100 hover:border-blue-200 transition-all rounded-xl h-full">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{t('revenue')}</span>
                    <div className="text-xl font-extrabold text-slate-800 tracking-tight">
                      {dashboardData.revenue.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  {/* Dynamic 3D SVG Icon replacement */}
                  <Revenue3D />
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs">
                  <span className={`flex items-center gap-0.5 font-bold ${dashboardData.revenueVsLast >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {dashboardData.revenueVsLast >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(dashboardData.revenueVsLast)}%
                  </span>
                  <span className="text-slate-400">so với kỳ trước</span>
                </div>
                <AnimatedProgressBar percent={Math.min(100, Math.round(75 + dashboardData.revenueVsLast))} strokeColor={token.colorPrimary} className="mt-2.5" />
              </Card>
            </motion.div>
          </Col>

          {/* Card 2: Orders (Đơn hàng) */}
          <Col xs={24} sm={12} md={6}>
            <motion.div variants={item} whileHover={{ y: -4 }} className="h-full">
              <Card variant="borderless" className="shadow-sm border border-slate-100 hover:border-amber-200 transition-all rounded-xl h-full">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{t('new_orders')}</span>
                    <div className="text-xl font-extrabold text-slate-800 tracking-tight">
                      {dashboardData.orders.toLocaleString('vi-VN')} đơn
                    </div>
                  </div>
                  {/* Dynamic 3D SVG Icon replacement */}
                  <Order3D />
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs">
                  <span className={`flex items-center gap-0.5 font-bold ${dashboardData.ordersVsLast >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {dashboardData.ordersVsLast >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(dashboardData.ordersVsLast)}%
                  </span>
                  <span className="text-slate-400">tần suất giao dịch</span>
                </div>
                <AnimatedProgressBar percent={Math.min(100, Math.round(68 + dashboardData.ordersVsLast))} strokeColor="#faad14" className="mt-2.5" />
              </Card>
            </motion.div>
          </Col>

          {/* Card 3: Customers (Khách hàng) */}
          <Col xs={24} sm={12} md={6}>
            <motion.div variants={item} whileHover={{ y: -4 }} className="h-full">
              <Card variant="borderless" className="shadow-sm border border-slate-100 hover:border-emerald-200 transition-all rounded-xl h-full">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{t('active_users') || 'Khách hàng mới'}</span>
                    <div className="text-xl font-extrabold text-slate-800 tracking-tight">
                      {dashboardData.customers.toLocaleString('vi-VN')} hội viên
                    </div>
                  </div>
                  {/* Dynamic 3D SVG Icon replacement */}
                  <User3D />
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs">
                  <span className={`flex items-center gap-0.5 font-bold ${dashboardData.customersVsLast >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {dashboardData.customersVsLast >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(dashboardData.customersVsLast)}%
                  </span>
                  <span className="text-slate-400">tỉ lệ đăng ký mới</span>
                </div>
                <AnimatedProgressBar percent={Math.min(100, Math.round(82 + dashboardData.customersVsLast))} strokeColor="#52c41a" className="mt-2.5" />
              </Card>
            </motion.div>
          </Col>

          {/* Card 4: Products (Sản phẩm) */}
          <Col xs={24} sm={12} md={6}>
            <motion.div variants={item} whileHover={{ y: -4 }} className="h-full">
              <Card variant="borderless" className="shadow-sm border border-slate-100 hover:border-red-200 transition-all rounded-xl h-full">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{t('total_products')}</span>
                    <div className="text-xl font-extrabold text-slate-800 tracking-tight">
                      {dashboardData.activeProducts.toLocaleString('vi-VN')} SKU
                    </div>
                  </div>
                  {/* Dynamic 3D SVG Icon replacement */}
                  <Product3D />
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs">
                  <span className="flex items-center gap-0.5 font-bold text-emerald-600">
                    <CheckOutlined /> 100%
                  </span>
                  <span className="text-slate-400">Đang lưu kho & mở bán</span>
                </div>
                <AnimatedProgressBar percent={100} strokeColor="#f5222d" className="mt-2.5" />
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Middle Section: Main Sales Line-Area Graph + Product share proportions */}
        <Row gutter={[20, 20]}>
          {/* Main Sales Trend - Spline Area */}
          <Col xs={24} xl={16}>
            <motion.div variants={item}>
              <Card 
                title={<Space className="text-slate-800 font-bold text-xs uppercase tracking-wider"><RiseOutlined className="text-blue-500" /> Báo cáo Xu hướng Doanh thu & Lượng đơn</Space>} 
                variant="borderless" 
                className="shadow-sm border border-slate-100 rounded-xl"
                extra={<Button type="text" shape="circle" icon={<ReloadOutlined />} onClick={() => window.location.reload()} />}
              >
                <HighchartsReact highcharts={Highcharts} options={mainChartOptions} />
              </Card>
            </motion.div>
          </Col>

          {/* Sector/Category Sales distribution and Goal tracking */}
          <Col xs={24} xl={8}>
            <motion.div variants={item} className="h-full">
              <Card 
                title={<Space className="text-slate-800 font-bold text-xs uppercase tracking-wider"><FireOutlined className="text-amber-500" /> Tỷ trọng doanh thu ngành hàng</Space>} 
                variant="borderless"
                className="shadow-sm border border-slate-100 rounded-xl h-full"
              >
                <HighchartsReact highcharts={Highcharts} options={pieOptions} />
                <Divider style={{ margin: '12px 0' }} />
                
                <Space direction="vertical" style={{ width: '100%' }} className="text-xs pt-1">
                  <div className="flex justify-between">
                    <Text type="secondary">Chỉ tiêu quý hiện tại</Text>
                    <Text strong>1.2 Tỷ VNĐ</Text>
                  </div>
                  <AnimatedProgressBar percent={Math.min(100, Math.round((dashboardData.revenue / 1200000000) * 100))} strokeColor={token.colorPrimary} height={8} className="mt-2" />
                  <div className="text-[10px] text-slate-400 italic text-center mt-1">Đã hoàn thành {((dashboardData.revenue / 1200000000) * 100).toFixed(1)}% tiến trình đề ra</div>
                </Space>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Lower Section: Store Breakdown, Top Employees, Best Sellers, and Bill Rating */}
        <Row gutter={[20, 20]}>
          
          {/* Top Performance (Stores & Employees) */}
          <Col xs={24} lg={12}>
            <motion.div variants={item} className="h-full">
              <Card 
                title={<Space className="text-slate-800 font-bold text-xs uppercase tracking-wider"><ShopOutlined className="text-blue-500" /> Top Doanh thu cửa hàng & nhân viên</Space>}
                variant="borderless"
                className="shadow-sm border border-slate-100 rounded-xl h-full"
              >
                <div className="space-y-6">
                  {/* Stores segment */}
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Hiệu suất Doanh thu theo cửa hàng</div>
                    <div className="space-y-3.5">
                      {dashboardData.topStores.map((store, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700">{store.name}</span>
                            <span className="text-slate-900 font-bold">{store.revenue.toLocaleString('vi-VN')} đ ({store.percentage}%)</span>
                          </div>
                          <AnimatedProgressBar percent={store.percentage} strokeColor={token.colorPrimary} height={5} className="mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  {/* Employees segment */}
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Nhân viên Xuất sắc tiêu biểu</div>
                    <List
                      dataSource={dashboardData.topEmployees}
                      renderItem={(emp, idx) => (
                        <List.Item className="border-b border-slate-50 last:border-0 py-2">
                          <List.Item.Meta
                            avatar={<Avatar src={emp.avatar} className="border border-blue-100" />}
                            title={<span className="font-bold text-slate-800 text-xs">{emp.name} <CrownOutlined className="text-amber-500 ml-1" /></span>}
                            description={<span className="text-[10px] text-slate-400 font-semibold">{emp.role}</span>}
                          />
                          <div className="text-right">
                            <div className="font-extrabold text-blue-600 text-xs">{emp.revenue.toLocaleString('vi-VN')} đ</div>
                            <div className="text-[10px] text-slate-400 font-medium">{emp.orders} đơn • Rating: <Rate disabled defaultValue={emp.rating} allowHalf style={{ fontSize: 9 }} /></div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* Best Selling Products and Ratings */}
          <Col xs={24} lg={12}>
            <motion.div variants={item} className="h-full">
              <Card 
                title={<Space className="text-slate-800 font-bold text-xs uppercase tracking-wider"><FireOutlined className="text-red-500" /> Sản phẩm bán chạy & Tỷ lệ Rating trên Bill</Space>}
                variant="borderless"
                className="shadow-sm border border-slate-100 rounded-xl h-full"
              >
                <div className="space-y-6">
                  {/* Bestselling items list */}
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Top Sản phẩm bán chạy hàng đầu</div>
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                            <th className="p-2.5">Sản phẩm</th>
                            <th className="p-2.5 text-center">Doanh số</th>
                            <th className="p-2.5 text-right">Doanh thu</th>
                            <th className="p-2.5 text-center">Tình trạng kho</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                          {dashboardData.bestSellers.map((prod, index) => (
                            <tr key={index} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-bold text-slate-800">{prod.name}</td>
                              <td className="p-2.5 text-center font-bold text-amber-600">{prod.sales} cái</td>
                              <td className="p-2.5 text-right font-bold text-blue-600">{prod.revenue.toLocaleString('vi-VN')} đ</td>
                              <td className="p-2.5 text-center">
                                <AnimatedProgressBar percent={prod.stockPercent} strokeColor={prod.stockPercent < 30 ? '#ef4444' : '#10b981'} height={5} className="max-w-[70px] mx-auto mt-1" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  {/* Rating Metrics & CSAT breakdown */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ đánh giá & Phản hồi (Rating)</span>
                      <Tag color="purple" className="font-bold text-[10px]">{dashboardData.ratingMetrics.ratedBillsPercent}% đơn đã đánh giá</Tag>
                    </div>

                    <Row gutter={16} className="items-center">
                      <Col span={8} className="text-center">
                        <div className="text-4xl font-extrabold text-slate-800">{dashboardData.ratingMetrics.average}</div>
                        <Rate disabled allowHalf defaultValue={dashboardData.ratingMetrics.average} style={{ fontSize: 11 }} />
                        <div className="text-[9px] text-slate-400 mt-1">Dựa trên {dashboardData.ratingMetrics.totalBills} hóa đơn</div>
                      </Col>
                      
                      <Col span={16} className="space-y-1.5">
                        {dashboardData.ratingMetrics.distribution.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                            <span className="w-8 shrink-0">{d.rate} Sao</span>
                            <AnimatedProgressBar percent={d.percent} strokeColor="#facc15" height={5} className="flex-1 mt-1" />
                            <span className="w-10 text-right text-[10px] text-slate-400">{d.percent}%</span>
                          </div>
                        ))}
                      </Col>
                    </Row>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Row 4: New Customers & Potential Clients Panel */}
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <motion.div variants={item}>
              <Card 
                title={<Space className="text-slate-800 font-bold text-xs uppercase tracking-wider"><UserOutlined className="text-emerald-500" /> Thành viên mới gia nhập & Khách hàng tiềm năng</Space>} 
                variant="borderless"
                className="shadow-sm border border-slate-100 rounded-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dashboardData.newCustomers.map((cust, i) => (
                    <div key={i} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between gap-4 transition-all">
                      <div className="flex items-center gap-3">
                        <Avatar src={cust.avatar} size={48} className="border border-blue-100 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            {cust.name}
                            {cust.isPotential && <Tag color="gold" className="font-extrabold text-[9px] uppercase tracking-wider">Tiềm năng VIP</Tag>}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">{cust.email}</div>
                          <div className="text-[10px] text-slate-500 font-bold mt-1">Hạng: {cust.spent > 10000000 ? 'Kim cương' : 'Vàng'}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-medium">Tổng tiền tích lũy</div>
                        <div className="font-extrabold text-slate-800 text-xs">{cust.spent.toLocaleString('vi-VN')} đ</div>
                        <div className="text-[9px] text-emerald-600 font-semibold">{cust.orders} giao dịch</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>

          </div>
        )}

      </motion.div>
    </PageContainer>
  );
};

export default Dashboard;
