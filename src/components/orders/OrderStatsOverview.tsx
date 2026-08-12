import React, { useState } from 'react';
import { Row, Col, Card, Tooltip } from 'antd';
import { motion } from 'motion/react';
import { 
  FileTextOutlined, 
  QrcodeOutlined,
  DollarOutlined,
  CreditCardOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  PercentageOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { OrderStats } from './orderTypes';
import { 
  ShoppingBasket3D, 
  DiscountTag3D, 
  OrdersList3D,
  SyncServer3D
} from '../Interactive3DIcon';

interface OrderStatsOverviewProps {
  stats: OrderStats;
}

// Smart money formatter to handle up to Hundreds of Billions (Trăm tỷ) seamlessly
const formatMoneyFormatted = (val: number): string => {
  if (!val || isNaN(val)) return '0 ₫';
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000_000) {
    return `${(val / 1_000_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} Nghìn tỷ ₫`;
  }
  if (abs >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} Tỷ ₫`;
  }
  if (abs >= 100_000_000) {
    return `${(val / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Triệu ₫`;
  }
  return `${val.toLocaleString('vi-VN')} ₫`;
};

// ==========================================
// 4 DISTINCT BACKGROUND INTERACTIVE EFFECTS
// ==========================================

// Effect 1: Water Ripple & Smooth Wave (Thẻ 1 - Doanh thu & Đơn hàng)
const WaterRippleBackground: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-0 opacity-40">
      <svg className="w-full h-full" viewBox="0 0 300 160" preserveAspectRatio="none">
        <defs>
          <radialGradient id="rippleGrad" cx="85%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#rippleGrad)" />

        <motion.ellipse
          cx="255" cy="35" rx="25" ry="20"
          fill="none" stroke="#f97316" strokeWidth="1.2"
          animate={{
            rx: isHovered ? [25, 120, 170] : 25,
            ry: isHovered ? [20, 95, 130] : 20,
            opacity: isHovered ? [0.8, 0.2, 0] : 0.2,
          }}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0, ease: 'easeOut' }}
        />
        <motion.ellipse
          cx="255" cy="35" rx="15" ry="12"
          fill="none" stroke="#ea580c" strokeWidth="1.5"
          animate={{
            rx: isHovered ? [15, 80, 130] : 15,
            ry: isHovered ? [12, 65, 100] : 12,
            opacity: isHovered ? [0.9, 0.3, 0] : 0.25,
          }}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0, delay: 0.5, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
};

// Effect 2: Digital Radar Grid & Pulse Beams (Thẻ 2 - Đồng bộ SAP)
const RadarGridBackground: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-0 opacity-40">
      <svg className="w-full h-full" viewBox="0 0 300 160" preserveAspectRatio="none">
        <defs>
          <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridPattern)" />

        {/* Scanning Radar Line */}
        <motion.line
          x1="0" y1="0" x2="300" y2="0"
          stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 4"
          animate={{
            y1: isHovered ? [0, 160, 0] : 80,
            y2: isHovered ? [0, 160, 0] : 80,
            opacity: isHovered ? [0.3, 0.8, 0.3] : 0.2
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* Pulse Blip Nodes */}
        <motion.circle
          cx="240" cy="40" r="4" fill="#f59e0b"
          animate={{ scale: isHovered ? [1, 2.2, 1] : 1, opacity: isHovered ? [0.8, 0.2, 0.8] : 0.4 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
    </div>
  );
};

// Effect 3: Warehouse 3D Floating Isometric Cubes (Thẻ 3 - Tổng sản phẩm)
const WarehouseCubesBackground: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-0 opacity-40">
      <svg className="w-full h-full" viewBox="0 0 300 160">
        {/* Cube 1 */}
        <motion.g
          animate={{
            y: isHovered ? [-5, -18, -5] : 0,
            opacity: isHovered ? [0.4, 0.8, 0.4] : 0.3
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M 240,40 L 255,32 L 270,40 L 255,48 Z" fill="#34d399" opacity="0.6" />
          <path d="M 240,40 L 255,48 L 255,65 L 240,57 Z" fill="#059669" opacity="0.8" />
          <path d="M 270,40 L 255,48 L 255,65 L 270,57 Z" fill="#10b981" opacity="0.7" />
        </motion.g>

        {/* Cube 2 (Small) */}
        <motion.g
          animate={{
            y: isHovered ? [0, -12, 0] : 0,
            opacity: isHovered ? [0.3, 0.7, 0.3] : 0.2
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4, ease: 'easeInOut' }}
        >
          <path d="M 210,70 L 220,65 L 230,70 L 220,75 Z" fill="#34d399" opacity="0.5" />
          <path d="M 210,70 L 220,75 L 220,87 L 210,82 Z" fill="#059669" opacity="0.7" />
          <path d="M 230,70 L 220,75 L 220,87 L 230,82 Z" fill="#10b981" opacity="0.6" />
        </motion.g>
      </svg>
    </div>
  );
};

// Effect 4: Sparkle Rays & Star Burst Vouchers (Thẻ 4 - Chiết khấu)
const SparkleRaysBackground: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-0 opacity-40">
      <svg className="w-full h-full" viewBox="0 0 300 160">
        <defs>
          <radialGradient id="sparkleGrad" cx="80%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#sparkleGrad)" />

        {/* Bursting Star 1 */}
        <motion.path
          d="M 250,30 Q 250,40 260,40 Q 250,40 250,50 Q 250,40 240,40 Q 250,40 250,30 Z"
          fill="#f43f5e"
          animate={{
            rotate: isHovered ? [0, 90, 180] : 0,
            scale: isHovered ? [0.8, 1.4, 0.8] : 1,
            opacity: isHovered ? [0.5, 1, 0.5] : 0.4
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Bursting Star 2 */}
        <motion.path
          d="M 220,65 Q 220,72 227,72 Q 220,72 220,79 Q 220,72 213,72 Q 220,72 220,65 Z"
          fill="#fb7185"
          animate={{
            rotate: isHovered ? [0, -90, -180] : 0,
            scale: isHovered ? [0.6, 1.2, 0.6] : 0.8,
            opacity: isHovered ? [0.3, 0.9, 0.3] : 0.3
          }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 0.3, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT WITH REAL DATA VISUALIZATIONS
// ==========================================

export const OrderStatsOverview: React.FC<OrderStatsOverviewProps> = ({ stats }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // REAL CALCULATIONS FROM `stats`
  const totalOrders = stats.totalOrders || 0;
  const avgItemsVal = totalOrders > 0 ? (stats.totalQuantity / totalOrders) : 0;
  const avgItemsPerOrder = avgItemsVal.toFixed(1);
  const discountOrderRate = totalOrders > 0 ? Math.round((stats.discountedOrdersCount / totalOrders) * 100) : 0;
  const nonDiscountOrdersCount = Math.max(0, totalOrders - stats.discountedOrdersCount);
  const nonDiscountRate = Math.max(0, 100 - discountOrderRate);

  const moneyPerOrderStr = totalOrders > 0 
    ? `${formatMoneyFormatted(stats.totalAmount)} / ${totalOrders.toLocaleString('vi-VN')} đơn`
    : '0 ₫';

  // Precision Donut circumference for radius = 16px
  const donutRadius = 16;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~100.53
  const syncedDash = (stats.syncRate / 100) * donutCircumference;
  const pendingDash = (stats.pendingSapRate / 100) * donutCircumference;

  return (
    <Row gutter={[14, 14]}>
      {/* ==================================================== */}
      {/* 1. CARD 1: TỔNG ĐƠN & DOANH THU (Dual Concentric Radial Arc Gauge) */}
      {/* ==================================================== */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div 
          whileHover={{ y: -4 }} 
          transition={{ type: 'spring', stiffness: 300 }} 
          className="h-full"
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card 
            variant="borderless" 
            className="relative shadow-xs border border-orange-200/80 hover:border-orange-400 hover:shadow-md transition-all rounded-xl h-full bg-linear-to-b from-white via-orange-50/20 to-orange-100/10 overflow-hidden"
          >
            <WaterRippleBackground isHovered={hoveredCard === 1} />
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="text-[11px] text-orange-700 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span>Tổng đơn & Doanh thu</span>
                </div>
                
                <Tooltip title={`Tổng doanh thu: ${stats.totalAmount.toLocaleString('vi-VN')} ₫ từ ${totalOrders} đơn hàng`}>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight leading-tight truncate max-w-[210px]">
                    {moneyPerOrderStr}
                  </div>
                </Tooltip>
                
                <div className="text-[11px] font-semibold text-slate-500 mt-1">
                  TB: <span className="font-mono font-bold text-slate-800">{formatMoneyFormatted(stats.avgOrderValue)}</span> / đơn
                </div>
              </div>

              <OrdersList3D externalHover={hoveredCard === 1} />
            </div>

            {/* REAL CHART 1: Dual Concentric Radial Arc Gauge */}
            <div className="relative z-10 mt-3 pt-2 border-t border-orange-100/80">
              <div className="flex items-center justify-between gap-2">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                    {/* Background Tracks */}
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#fed7aa" strokeWidth="4" />
                    <circle cx="22" cy="22" r="12" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />

                    {/* VAT Arc (Outer Orange/Blue) */}
                    <motion.circle
                      cx="22" cy="22" r="18" fill="none" stroke="#2563eb" strokeWidth="4"
                      strokeDasharray={`${(Math.min(100, Math.max(0, stats.invoiceRate)) / 100) * 113.1} 113.1`} 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 113.1' }}
                      animate={{ strokeDasharray: `${(Math.min(100, Math.max(0, stats.invoiceRate)) / 100) * 113.1} 113.1` }}
                      transition={{ duration: 1 }}
                    />

                    {/* Payment Arc (Inner Multi-color Segment) */}
                    <motion.circle
                      cx="22" cy="22" r="12" fill="none" stroke="#059669" strokeWidth="3.5"
                      strokeDasharray={`${(Math.min(100, Math.max(0, stats.cashRate || 0)) / 100) * 75.4} 75.4`} 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 75.4' }}
                      animate={{ strokeDasharray: `${(Math.min(100, Math.max(0, stats.cashRate || 0)) / 100) * 75.4} 75.4` }}
                      transition={{ duration: 1, delay: 0.1 }}
                    />
                    <motion.circle
                      cx="22" cy="22" r="12" fill="none" stroke="#4f46e5" strokeWidth="3.5"
                      strokeDasharray={`${(Math.min(100, Math.max(0, stats.atmCkRate || 0)) / 100) * 75.4} 75.4`} 
                      strokeDashoffset={`-${((stats.cashRate || 0) / 100) * 75.4}`}
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 75.4' }}
                      animate={{ strokeDasharray: `${(Math.min(100, Math.max(0, stats.atmCkRate || 0)) / 100) * 75.4} 75.4` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                    <motion.circle
                      cx="22" cy="22" r="12" fill="none" stroke="#0284c7" strokeWidth="3.5"
                      strokeDasharray={`${(Math.min(100, Math.max(0, stats.qrRate || 0)) / 100) * 75.4} 75.4`} 
                      strokeDashoffset={`-${(((stats.cashRate || 0) + (stats.atmCkRate || 0)) / 100) * 75.4}`}
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 75.4' }}
                      animate={{ strokeDasharray: `${(Math.min(100, Math.max(0, stats.qrRate || 0)) / 100) * 75.4} 75.4` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </svg>
                </div>

                <div className="flex-1 space-y-1 text-[11px] font-medium">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1 text-slate-600">
                      <FileTextOutlined className="text-blue-500" />
                      <span>VAT:</span>
                    </span>
                    <span className="font-bold font-mono text-blue-700">{stats.totalWithInvoice.toLocaleString('vi-VN')} ({stats.invoiceRate}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1 text-slate-600">
                      <DollarOutlined className="text-emerald-600" />
                      <span>Tiền mặt:</span>
                    </span>
                    <span className="font-bold font-mono text-emerald-700">{(stats.totalCashOrders || 0).toLocaleString('vi-VN')} ({stats.cashRate || 0}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1 text-slate-600">
                      <CreditCardOutlined className="text-indigo-600" />
                      <span>ATM/CK:</span>
                    </span>
                    <span className="font-bold font-mono text-indigo-700">{(stats.totalAtmCkOrders || 0).toLocaleString('vi-VN')} ({stats.atmCkRate || 0}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1 text-slate-600">
                      <QrcodeOutlined className="text-sky-600" />
                      <span>QR Code:</span>
                    </span>
                    <span className="font-bold font-mono text-sky-700">{stats.totalQrOrders.toLocaleString('vi-VN')} ({stats.qrRate}%)</span>
                  </div>
                  {stats.totalVoucherOrders !== undefined && (
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1 text-slate-600">
                        <GiftOutlined className="text-purple-600" />
                        <span>Voucher:</span>
                      </span>
                      <span className="font-bold font-mono text-purple-700">{(stats.totalVoucherOrders || 0).toLocaleString('vi-VN')} ({stats.voucherRate || 0}%)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </Col>

      {/* ==================================================== */}
      {/* 2. CARD 2: CHỜ ĐỒNG BỘ SAP (Real Arc Donut Chart)     */}
      {/* ==================================================== */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div 
          whileHover={{ y: -4 }} 
          transition={{ type: 'spring', stiffness: 300 }} 
          className="h-full"
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card 
            variant="borderless" 
            className="relative shadow-xs border border-amber-200/80 hover:border-amber-400 hover:shadow-md transition-all rounded-xl h-full bg-linear-to-b from-white via-amber-50/20 to-amber-100/10 overflow-hidden"
          >
            <RadarGridBackground isHovered={hoveredCard === 2} />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="text-[11px] text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1">
                  <DatabaseOutlined className="text-amber-600" />
                  <span>Chờ đồng bộ SAP</span>
                </div>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {stats.pendingSapCount.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-slate-500">đơn</span>
                </div>
                <div className="text-[11px] font-bold text-amber-700 mt-0.5">
                  Tỷ lệ chờ: <span className="font-mono">{stats.pendingSapRate}%</span>
                </div>
              </div>

              <SyncServer3D externalHover={hoveredCard === 2} />
            </div>

            {/* REAL CHART 2: Precision Calculated SVG Donut Ring */}
            <div className="relative z-10 mt-3 pt-2 border-t border-amber-100/80 flex items-center justify-between gap-2">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                  {/* Track */}
                  <circle cx="20" cy="20" r={donutRadius} fill="none" stroke="#fef3c7" strokeWidth="5" />
                  
                  {/* Synced Arc (Emerald) */}
                  <motion.circle 
                    cx="20" 
                    cy="20" 
                    r={donutRadius} 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="5"
                    strokeDasharray={`${syncedDash} ${donutCircumference}`}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${donutCircumference}` }}
                    animate={{ strokeDasharray: `${syncedDash} ${donutCircumference}` }}
                    transition={{ duration: 1 }}
                  />

                  {/* Pending Arc (Amber) */}
                  <motion.circle 
                    cx="20" 
                    cy="20" 
                    r={donutRadius} 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="5"
                    strokeDasharray={`${pendingDash} ${donutCircumference}`}
                    strokeDashoffset={`-${syncedDash}`}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${donutCircumference}` }}
                    animate={{ strokeDasharray: `${pendingDash} ${donutCircumference}` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </svg>
                
                {/* Center Percentage */}
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono text-amber-600">
                  {stats.pendingSapRate}%
                </div>
              </div>

              <div className="flex-1 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <ClockCircleOutlined className="text-amber-500" />
                    <span>Chờ SAP:</span>
                  </span>
                  <span className="font-bold font-mono text-amber-600">
                    {stats.pendingSapCount.toLocaleString('vi-VN')} ({stats.pendingSapRate}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircleOutlined className="text-emerald-500" />
                    <span>Đã Sync:</span>
                  </span>
                  <span className="font-bold font-mono text-emerald-600">
                    {stats.syncedCount.toLocaleString('vi-VN')} ({stats.syncRate}%)
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </Col>

      {/* ==================================================== */}
      {/* 3. CARD 3: TỔNG SẢN PHẨM (Speedometer Semi-Gauge Dial) */}
      {/* ==================================================== */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div 
          whileHover={{ y: -4 }} 
          transition={{ type: 'spring', stiffness: 300 }} 
          className="h-full"
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card 
            variant="borderless" 
            className="relative shadow-xs border border-emerald-200/80 hover:border-emerald-400 hover:shadow-md transition-all rounded-xl h-full bg-linear-to-b from-white via-emerald-50/20 to-emerald-100/10 overflow-hidden"
          >
            <WarehouseCubesBackground isHovered={hoveredCard === 3} />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">Tổng sản phẩm</div>
                <div className="text-2xl font-black text-slate-800 mt-1">
                  {stats.totalQuantity.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-slate-500">SP</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                  TB: <span className="font-mono">{avgItemsPerOrder}</span> SP / đơn
                </div>
              </div>

              <ShoppingBasket3D externalHover={hoveredCard === 3} />
            </div>

            {/* REAL CHART 3: Speedometer Semi-Circle Needle Dial */}
            <div className="relative z-10 mt-3 pt-2 border-t border-emerald-100/80">
              <div className="flex items-center justify-between gap-2">
                <div className="relative w-14 h-10 flex-shrink-0 flex items-end justify-center pt-1">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 60 36">
                    {/* Outer Gauge Track */}
                    <path d="M 5,32 A 25,25 0 0,1 55,32" fill="none" stroke="#d1fae5" strokeWidth="6" strokeLinecap="round" />
                    
                    {/* Active Colored Arc */}
                    <motion.path 
                      d="M 5,32 A 25,25 0 0,1 55,32" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="6" 
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min(1, Math.max(0, avgItemsVal / 10)) * 78.5} 78.5`}
                      initial={{ strokeDasharray: "0 78.5" }}
                      animate={{ strokeDasharray: `${Math.min(1, Math.max(0, avgItemsVal / 10)) * 78.5} 78.5` }}
                      transition={{ duration: 1 }}
                    />

                    {/* Needle Pointer */}
                    <motion.g 
                      transform="translate(30, 32)"
                      initial={{ rotate: -90 }}
                      animate={{ rotate: -90 + (Math.min(1, Math.max(0, avgItemsVal / 10)) * 180) }}
                      transition={{ duration: 1.2, type: 'spring', stiffness: 100 }}
                    >
                      <line x1="0" y1="0" x2="0" y2="-20" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="0" cy="0" r="3.5" fill="#047857" stroke="#ffffff" strokeWidth="1" />
                    </motion.g>
                  </svg>
                </div>

                <div className="flex-1 space-y-1 text-[11px] font-medium">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1 text-slate-600">
                      <ShopOutlined className="text-emerald-600" />
                      <span>Sức chứa đơn:</span>
                    </span>
                    <span className="font-bold font-mono text-emerald-700">{avgItemsPerOrder} SP</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span>Tổng {stats.totalQuantity.toLocaleString('vi-VN')} món</span>
                    <span>/{totalOrders.toLocaleString('vi-VN')} đơn</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </Col>

      {/* ==================================================== */}
      {/* 4. CARD 4: TỔNG CHIẾT KHẤU (Real SVG Dual-Slice Pie Chart) */}
      {/* ==================================================== */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div 
          whileHover={{ y: -4 }} 
          transition={{ type: 'spring', stiffness: 300 }} 
          className="h-full"
          onMouseEnter={() => setHoveredCard(4)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card 
            variant="borderless" 
            className="relative shadow-xs border border-rose-200/80 hover:border-rose-400 hover:shadow-md transition-all rounded-xl h-full bg-linear-to-b from-white via-rose-50/20 to-rose-100/10 overflow-hidden"
          >
            <SparkleRaysBackground isHovered={hoveredCard === 4} />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="text-[11px] text-rose-700 font-bold uppercase tracking-wider">Tổng chiết khấu</div>
                <Tooltip title={`${stats.totalDiscounts.toLocaleString('vi-VN')} ₫`}>
                  <div className="text-2xl font-black text-rose-700 mt-1 truncate max-w-[170px]">
                    {formatMoneyFormatted(stats.totalDiscounts)}
                  </div>
                </Tooltip>
                <div className="text-[11px] font-bold text-rose-700 mt-0.5">
                  Đơn giảm: <span className="font-mono">{stats.discountedOrdersCount} đơn ({discountOrderRate}%)</span>
                </div>
              </div>

              <DiscountTag3D externalHover={hoveredCard === 4} />
            </div>

            {/* REAL CHART 4: SVG Dual Slice Donut/Pie Chart */}
            <div className="relative z-10 mt-3 pt-2 border-t border-rose-100/80">
              <div className="flex items-center justify-between gap-2">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#f1f5f9" strokeWidth="5" />

                    {/* Regular Price Arc (Slate) */}
                    <motion.circle 
                      cx="20" cy="20" r="16" fill="none" stroke="#cbd5e1" strokeWidth="5"
                      strokeDasharray={`${(nonDiscountRate / 100) * 100.53} 100.53`}
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 100.53' }}
                      animate={{ strokeDasharray: `${(nonDiscountRate / 100) * 100.53} 100.53` }}
                      transition={{ duration: 1 }}
                    />

                    {/* Discounted Arc (Rose) */}
                    <motion.circle 
                      cx="20" cy="20" r="16" fill="none" stroke="#f43f5e" strokeWidth="5"
                      strokeDasharray={`${(discountOrderRate / 100) * 100.53} 100.53`} 
                      strokeDashoffset={`-${(nonDiscountRate / 100) * 100.53}`} 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 100.53' }}
                      animate={{ strokeDasharray: `${(discountOrderRate / 100) * 100.53} 100.53` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono text-rose-600">
                    {discountOrderRate}%
                  </div>
                </div>

                <div className="flex-1 space-y-1 text-[11px] font-medium">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1 text-slate-600">
                      <GiftOutlined className="text-rose-500" />
                      <span>Có CK:</span>
                    </span>
                    <span className="font-bold font-mono text-rose-600">{stats.discountedOrdersCount.toLocaleString('vi-VN')} ({discountOrderRate}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1 text-slate-600">
                      <PercentageOutlined className="text-slate-400" />
                      <span>Nguyên giá:</span>
                    </span>
                    <span className="font-bold font-mono text-slate-600">{nonDiscountOrdersCount.toLocaleString('vi-VN')} ({nonDiscountRate}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </Col>
    </Row>
  );
};

