import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tooltip, Tag } from 'antd';
import { motion } from 'motion/react';
import { 
  AppstoreOutlined, 
  CheckCircleOutlined, 
  AlertOutlined, 
  TagsOutlined, 
  RiseOutlined,
  DollarOutlined,
  BoxPlotOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { 
  Product3D, 
  BillingMachine3D, 
  ShoppingBasket3D, 
  DiscountTag3D 
} from '../Interactive3DIcon';

const { Text, Title } = Typography;

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  activeRate: number;
  totalInventoryValue: number;
  avgUnitPrice: number;
  totalStockUnits: number;
  lowStockCount: number;
  lowStockRate: number;
  promotedCount: number;
  syncedSapCount: number;
  categories: { name: string; count: number; color: string }[];
}

// 1. Custom SVG Dual Concentric Radial Arc Gauge for Product Status
const ProductStatusRadialGauge: React.FC<{ activeRate: number; totalProducts: number; activeProducts: number }> = ({ 
  activeRate, 
  totalProducts, 
  activeProducts 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const size = 110;
  const strokeWidth = 8;
  const center = size / 2;
  const radius1 = center - strokeWidth;
  const circ1 = 2 * Math.PI * radius1;
  const offset1 = circ1 - (activeRate / 100) * circ1;

  return (
    <div 
      className="relative flex flex-col items-center justify-center cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <defs>
          <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <filter id="glowActive" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius1}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />

        {/* Outer Active Progress Arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius1}
          fill="none"
          stroke="url(#activeGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circ1}
          strokeDashoffset={circ1}
          animate={{ strokeDashoffset: offset1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
          filter={isHovered ? "url(#glowActive)" : undefined}
        />
      </svg>

      {/* Center Percentage Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <motion.span 
          className="text-base font-black text-blue-700 font-mono tracking-tight leading-none"
          animate={{ scale: isHovered ? 1.1 : 1 }}
        >
          {activeRate}%
        </motion.span>
        <span className="text-[10px] font-semibold text-slate-500 mt-0.5">Kinh doanh</span>
      </div>
    </div>
  );
};

// 2. Custom SVG Inventory Value Line Chart
const InventoryValueLineChart: React.FC<{ totalValue: number }> = ({ totalValue }) => {
  const [isHovered, setIsHovered] = useState(false);

  // SVG dimensions & path points representing inventory trends
  const width = 160;
  const height = 60;
  const points = "10,48 40,32 70,38 100,20 130,26 150,12";
  const areaPoints = "10,48 40,32 70,38 100,20 130,26 150,12 150,58 10,58";

  return (
    <div 
      className="relative w-full h-[70px] flex items-center justify-center cursor-pointer overflow-hidden rounded-lg bg-slate-50/50 p-1 border border-slate-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="invLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="invAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Shaded Area */}
        <polygon points={areaPoints} fill="url(#invAreaGrad)" />

        {/* Trend Line */}
        <polyline
          fill="none"
          stroke="url(#invLineGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Pulsing end node */}
        <motion.circle
          cx="150"
          cy="12"
          r="4.5"
          fill="#10b981"
          stroke="#ffffff"
          strokeWidth="2"
          animate={{ r: isHovered ? [4.5, 7, 4.5] : 4.5 }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
      </svg>
    </div>
  );
};

// 3. Custom SVG Speedometer Needle Semi-Gauge Dial for Stock Safety
const StockSpeedometerSemiGauge: React.FC<{ lowStockRate: number; lowStockCount: number }> = ({ 
  lowStockRate, 
  lowStockCount 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const size = 120;
  const radius = 42;
  const cx = size / 2;
  const cy = size / 2 + 10;

  // Safety angle: 0% low stock = 180 deg (safe green), 100% low stock = 0 deg (danger red)
  const healthPercent = Math.max(0, 100 - lowStockRate);
  const angleDeg = 180 - (healthPercent / 100) * 180;

  return (
    <div 
      className="relative flex flex-col items-center justify-center cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg width={size} height={size - 20} viewBox={`0 0 ${size} ${size - 20}`}>
        <defs>
          <linearGradient id="speedometerArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Arc Track */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="url(#speedometerArc)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Needle */}
        <motion.g
          style={{ originX: `${cx}px`, originY: `${cy}px` }}
          animate={{ rotate: angleDeg }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={cx - radius + 10}
            y2={cy}
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="5" fill="#1e293b" />
        </motion.g>
      </svg>

      <div className="-mt-3 text-center">
        <span className="text-xs font-bold text-slate-800 font-mono">
          {healthPercent}% An toàn
        </span>
      </div>
    </div>
  );
};

// 4. Custom SVG Donut Slice Chart for Categories
const CategoryDonutChart: React.FC<{ categories: { name: string; count: number; color: string }[] }> = ({ categories }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = categories.reduce((acc, c) => acc + c.count, 0) || 1;

  let cumulativeAngle = 0;
  const slices = categories.map((cat, idx) => {
    const angle = (cat.count / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return { ...cat, angle, startAngle };
  });

  const size = 95;
  const center = size / 2;
  const radius = 36;
  const strokeWidth = 14;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {slices.map((slice, idx) => {
            const strokeDasharray = `${(slice.angle / 360) * circ} ${circ}`;
            const strokeDashoffset = -((slice.startAngle / 360) * circ);
            const isHov = hoveredIdx === idx;

            return (
              <motion.circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isHov ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-all duration-200"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xs font-black text-slate-800 font-mono leading-none">{total}</span>
          <span className="text-[9px] text-slate-500 font-medium mt-0.5">Sản phẩm</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-[11px] font-medium">
        {categories.slice(0, 3).map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
            <span className="truncate max-w-[100px]" title={c.name}>{c.name}:</span>
            <span className="font-bold font-mono text-slate-900">{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProductStatsOverview: React.FC<{ stats: ProductStats }> = ({ stats }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Helper for formatting VND string safely
  const formatMoney = (val: number) => {
    if (val >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toFixed(1)} Tỷ ₫`;
    }
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)} Tr ₫`;
    }
    return `${val.toLocaleString('vi-VN')} ₫`;
  };

  return (
    <Row gutter={[16, 16]}>
      {/* Card 1: Tổng sản phẩm */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div 
          whileHover={{ y: -4 }} 
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card 
            className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30"
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <Text type="secondary" className="text-xs font-medium uppercase tracking-wider text-slate-500 block">
                  Tổng sản phẩm
                </Text>
                
                <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                  <Title level={3} className="m-0 font-black text-slate-900 font-mono tracking-tight">
                    {stats.totalProducts.toLocaleString('vi-VN')}
                  </Title>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {stats.categories.length} Ngành
                  </span>
                </div>

                <div className="mt-3 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Đang kinh doanh:</span>
                    <span className="font-bold text-slate-800 font-mono">{stats.activeProducts} SP ({stats.activeRate}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Đã đồng bộ SAP:</span>
                    <span className="font-bold text-emerald-600 font-mono">{stats.syncedSapCount} SP</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-1">
                <ProductStatusRadialGauge 
                  activeRate={stats.activeRate} 
                  totalProducts={stats.totalProducts} 
                  activeProducts={stats.activeProducts} 
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </Col>

      {/* Card 2: Giá trị kho hàng */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div 
          whileHover={{ y: -4 }} 
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card 
            className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-white via-sky-50/20 to-blue-50/30"
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <Text type="secondary" className="text-xs font-medium uppercase tracking-wider text-slate-500 block">
                  Giá trị tồn kho
                </Text>
                
                <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                  <Title level={3} className="m-0 font-black text-sky-700 font-mono tracking-tight">
                    {formatMoney(stats.totalInventoryValue)}
                  </Title>
                </div>

                <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Đơn giá bình quân:</span>
                    <span className="font-bold text-slate-800 font-mono">{stats.avgUnitPrice.toLocaleString('vi-VN')} ₫/SP</span>
                  </div>
                </div>

                <div className="mt-2">
                  <InventoryValueLineChart totalValue={stats.totalInventoryValue} />
                </div>
              </div>

              <div className="shrink-0">
                <BillingMachine3D externalHover={hoveredCard === 2} />
              </div>
            </div>
          </Card>
        </motion.div>
      </Col>

      {/* Card 3: Tồn kho & Cảnh báo */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div 
          whileHover={{ y: -4 }} 
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card 
            className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30"
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <Text type="secondary" className="text-xs font-medium uppercase tracking-wider text-slate-500 block">
                  Tổng tồn kho & Cảnh báo
                </Text>

                <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                  <Title level={3} className="m-0 font-black text-amber-700 font-mono tracking-tight">
                    {stats.totalStockUnits.toLocaleString('vi-VN')}
                  </Title>
                  <span className="text-xs font-semibold text-slate-600">Đơn vị</span>
                </div>

                <div className="mt-3 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-rose-600 font-semibold">
                      <AlertOutlined /> Cảnh báo sắp hết:
                    </span>
                    <span className="font-bold text-rose-600 font-mono bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      {stats.lowStockCount} SP ({stats.lowStockRate}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-1">
                <StockSpeedometerSemiGauge 
                  lowStockRate={stats.lowStockRate} 
                  lowStockCount={stats.lowStockCount} 
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </Col>

      {/* Card 4: Cơ cấu Ngành hàng & Khuyến mãi */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div 
          whileHover={{ y: -4 }} 
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onMouseEnter={() => setHoveredCard(4)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card 
            className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-white via-rose-50/20 to-pink-50/30"
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <Text type="secondary" className="text-xs font-medium uppercase tracking-wider text-slate-500 block">
                  Cơ cấu Ngành hàng & KM
                </Text>

                <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                  <Title level={3} className="m-0 font-black text-rose-700 font-mono tracking-tight">
                    {stats.promotedCount} SP
                  </Title>
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    Đang KM
                  </span>
                </div>

                <div className="mt-3">
                  <CategoryDonutChart categories={stats.categories} />
                </div>
              </div>

              <div className="shrink-0">
                <DiscountTag3D externalHover={hoveredCard === 4} />
              </div>
            </div>
          </Card>
        </motion.div>
      </Col>
    </Row>
  );
};
