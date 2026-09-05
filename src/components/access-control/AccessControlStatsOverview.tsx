import React, { useState } from 'react';
import { Row, Col, Card, Tooltip, Tag } from 'antd';
import { motion } from 'motion/react';
import {
  SafetyCertificateOutlined,
  AppstoreOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  LockOutlined,
  UnlockOutlined,
  ApiOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import { AccessControlStats } from './accessControlTypes';
import {
  User3D,
  ShieldLock3D,
  SyncServer3D,
} from '../Interactive3DIcon';

interface AccessControlStatsOverviewProps {
  stats: AccessControlStats;
  onSelectRole?: (roleCode: string) => void;
}

// 1. Radial Gauge for Role Coverage Rate
const RoleCoverageRadialGauge: React.FC<{ grantedRate: number; isOwner: boolean }> = ({ grantedRate, isOwner }) => {
  const [isHovered, setIsHovered] = useState(false);
  const size = 96;
  const strokeWidth = 7;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circ = 2 * Math.PI * radius;
  const effectiveRate = isOwner ? 100 : Math.min(Math.max(grantedRate, 0), 100);
  const offset = circ - (effectiveRate / 100) * circ;

  return (
    <div
      className="relative flex flex-col items-center justify-center cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <defs>
          <linearGradient id="permRateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isOwner ? '#f59e0b' : '#3b82f6'} />
            <stop offset="100%" stopColor={isOwner ? '#ea580c' : '#8b5cf6'} />
          </linearGradient>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />

        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#permRateGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <motion.span
          className={`text-sm font-black font-mono tracking-tight leading-none ${isOwner ? 'text-amber-600' : 'text-purple-600'}`}
          animate={{ scale: isHovered ? 1.1 : 1 }}
        >
          {isOwner ? '100%' : `${effectiveRate}%`}
        </motion.span>
        <span className="text-[9px] font-semibold text-slate-500 mt-0.5">
          {isOwner ? 'Toàn quyền' : 'Được cấp'}
        </span>
      </div>
    </div>
  );
};

export const AccessControlStatsOverview: React.FC<AccessControlStatsOverviewProps> = ({ stats }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <Row gutter={[16, 16]} className="mb-1">
      {/* Thẻ 1: Tổng quan Vai trò */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
          className="h-full"
        >
          <Card
            className="h-full rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-300"
            styles={{ body: { padding: 16 } }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Vai trò Hệ thống</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-800 font-mono tracking-tight">
                    {stats.totalRoles}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">vai trò</span>
                </div>
              </div>
              <User3D />
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100/90 flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Tag color="blue" className="m-0 text-[10px] font-semibold font-mono px-1.5 py-0">
                  {stats.activeRoles} Hoạt động
                </Tag>
                <Tag color="gold" className="m-0 text-[10px] font-semibold font-mono px-1.5 py-0">
                  {stats.ownerRolesCount} Owner
                </Tag>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {stats.customRolesCount} Tùy biến
              </span>
            </div>
          </Card>
        </motion.div>
      </Col>

      {/* Thẻ 2: Cấu trúc Cây chức năng */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
          className="h-full"
        >
          <Card
            className="h-full rounded-xl border border-sky-100/80 bg-gradient-to-br from-white via-sky-50/20 to-cyan-50/30 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-sky-300"
            styles={{ body: { padding: 16 } }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Cây Chức năng & Quyền</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-sky-700 font-mono tracking-tight">
                    {stats.totalFunctions}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">chức năng</span>
                </div>
              </div>
              <ShieldLock3D externalHover={hoveredCard === 2} />
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100/90 flex flex-wrap items-center gap-1.5 text-xs">
              <Tag color="cyan" className="m-0 text-[10px] font-mono px-1.5 py-0">
                {stats.totalModules} Modules
              </Tag>
              <Tag color="purple" className="m-0 text-[10px] font-mono px-1.5 py-0">
                {stats.totalMenus} Menus
              </Tag>
              <Tag color="green" className="m-0 text-[10px] font-mono px-1.5 py-0">
                {stats.totalActions} Actions
              </Tag>
            </div>
          </Card>
        </motion.div>
      </Col>

      {/* Thẻ 3: Mức độ Phân quyền Vai trò đang chọn */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
          className="h-full"
        >
          <Card
            className="h-full rounded-xl border border-purple-100/80 bg-gradient-to-br from-white via-purple-50/20 to-fuchsia-50/30 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-purple-300"
            styles={{ body: { padding: 16 } }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase truncate block" title={stats.selectedRoleName}>
                  {stats.selectedRoleName || 'Vai trò đang chọn'}
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-purple-700 font-mono tracking-tight">
                    {stats.isOwnerRole ? stats.totalFunctions : stats.selectedRoleGrantedCount}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ {stats.totalFunctions} quyền</span>
                </div>
                <div className="mt-1">
                  <Tag color={stats.isOwnerRole ? 'gold' : 'purple'} className="m-0 text-[10px] font-mono font-semibold truncate max-w-full">
                    {stats.selectedRoleCode}
                  </Tag>
                </div>
              </div>
              <RoleCoverageRadialGauge
                grantedRate={stats.selectedRoleGrantedRate}
                isOwner={stats.isOwnerRole}
              />
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100/90 flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px] font-mono text-slate-500">
                {stats.selectedRoleAllowedUrlsCount} URLs | {stats.selectedRoleButtonPermsCount} Nút
              </span>
              <span className="text-[10px] font-semibold text-purple-600">
                {stats.isOwnerRole ? '★ Full (*)' : 'Quyền Giới hạn'}
              </span>
            </div>
          </Card>
        </motion.div>
      </Col>

      {/* Thẻ 4: Cơ chế Bảo mật & Đồng bộ Backend */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onMouseEnter={() => setHoveredCard(4)}
          onMouseLeave={() => setHoveredCard(null)}
          className="h-full"
        >
          <Card
            className="h-full rounded-xl border border-amber-100/80 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-amber-300"
            styles={{ body: { padding: 16 } }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Cơ chế & Bảo mật</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                    {stats.isOwnerRole ? 'Owner Security' : 'Least-Privilege'}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircleOutlined />
                  <span>Real-time RBAC Map</span>
                </div>
              </div>
              <SyncServer3D externalHover={hoveredCard === 4} />
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100/90 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                <ApiOutlined className="text-blue-500" />
                <span>JSONB Sync Ready</span>
              </div>
              <Tag color="geekblue" className="m-0 text-[10px] font-mono">
                Multilingual (VI/EN)
              </Tag>
            </div>
          </Card>
        </motion.div>
      </Col>
    </Row>
  );
};

export default AccessControlStatsOverview;
