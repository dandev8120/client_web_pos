import React, { useMemo, useState } from 'react';
import { App, Button, Input, Segmented, Slider, Space, Tag, Tooltip } from 'antd';
import {
  Archive,
  BadgeCheck,
  BadgePercent,
  Banknote,
  BellRing,
  Boxes,
  CalendarClock,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  CloudUpload,
  Copy,
  CreditCard,
  DatabaseZap,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Filter,
  Footprints,
  Gift,
  Heart,
  History,
  KeyRound,
  Layers,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Minus,
  MonitorCog,
  PackageCheck,
  PackageSearch,
  Palette,
  Percent,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RefreshCcw,
  Search,
  SearchCheck,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Tag as TagIcon,
  Tags,
  Trash2,
  Truck,
  Upload,
  UserCog,
  UserRound,
  Users,
  Wallet,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import PageContainer from '../components/PageContainer';

type Tone = 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan' | 'slate' | 'indigo';
type GroupKey = 'all' | 'retail' | 'fashion' | 'pos' | 'system' | 'animated';

interface IconSpec {
  name: string;
  label: string;
  group: Exclude<GroupKey, 'all' | 'animated'>;
  icon: LucideIcon;
  tone: Tone;
}

interface AnimatedSvgSpec {
  key: string;
  title: string;
  tone: Tone;
  code: (color: string, size: number) => string;
}

const toneClasses: Record<Tone, string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
  violet: 'bg-violet-50 text-violet-600 border-violet-100',
  cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  slate: 'bg-slate-50 text-slate-600 border-slate-100',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
};

const solidToneClasses: Record<Tone, string> = {
  blue: 'bg-blue-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  amber: 'bg-amber-500 text-white',
  rose: 'bg-rose-600 text-white',
  violet: 'bg-violet-600 text-white',
  cyan: 'bg-cyan-600 text-white',
  slate: 'bg-slate-800 text-white',
  indigo: 'bg-indigo-600 text-white',
};

const iconSpecs: IconSpec[] = [
  { name: 'Receipt', label: 'Đơn', group: 'pos', icon: Receipt, tone: 'blue' },
  { name: 'ShoppingCart', label: 'POS', group: 'pos', icon: ShoppingCart, tone: 'emerald' },
  { name: 'SearchCheck', label: 'Scan', group: 'pos', icon: SearchCheck, tone: 'blue' },
  { name: 'QrCode', label: 'QR', group: 'pos', icon: QrCode, tone: 'slate' },
  { name: 'CreditCard', label: 'Thẻ', group: 'pos', icon: CreditCard, tone: 'indigo' },
  { name: 'Wallet', label: 'Ví', group: 'pos', icon: Wallet, tone: 'emerald' },
  { name: 'Banknote', label: 'Tiền', group: 'pos', icon: Banknote, tone: 'amber' },
  { name: 'Printer', label: 'In', group: 'pos', icon: Printer, tone: 'slate' },
  { name: 'Percent', label: '%', group: 'pos', icon: Percent, tone: 'rose' },
  { name: 'Gift', label: 'Quà', group: 'pos', icon: Gift, tone: 'violet' },
  { name: 'PackageSearch', label: 'SKU', group: 'retail', icon: PackageSearch, tone: 'cyan' },
  { name: 'PackageCheck', label: 'Tồn', group: 'retail', icon: PackageCheck, tone: 'emerald' },
  { name: 'Boxes', label: 'Kho', group: 'retail', icon: Boxes, tone: 'slate' },
  { name: 'Truck', label: 'Giao', group: 'retail', icon: Truck, tone: 'blue' },
  { name: 'Store', label: 'Shop', group: 'retail', icon: Store, tone: 'indigo' },
  { name: 'MapPin', label: 'Site', group: 'retail', icon: MapPin, tone: 'rose' },
  { name: 'DatabaseZap', label: 'Sync', group: 'retail', icon: DatabaseZap, tone: 'amber' },
  { name: 'FileSpreadsheet', label: 'Excel', group: 'retail', icon: FileSpreadsheet, tone: 'emerald' },
  { name: 'Archive', label: 'Lưu', group: 'retail', icon: Archive, tone: 'slate' },
  { name: 'CalendarClock', label: 'Ca', group: 'retail', icon: CalendarClock, tone: 'blue' },
  { name: 'Shirt', label: 'Áo', group: 'fashion', icon: Shirt, tone: 'blue' },
  { name: 'Footprints', label: 'Giày', group: 'fashion', icon: Footprints, tone: 'emerald' },
  { name: 'ShoppingBag', label: 'Túi', group: 'fashion', icon: ShoppingBag, tone: 'violet' },
  { name: 'Palette', label: 'Màu', group: 'fashion', icon: Palette, tone: 'rose' },
  { name: 'Tags', label: 'Tag', group: 'fashion', icon: Tags, tone: 'amber' },
  { name: 'BadgePercent', label: 'Sale', group: 'fashion', icon: BadgePercent, tone: 'rose' },
  { name: 'Star', label: 'VIP', group: 'fashion', icon: Star, tone: 'amber' },
  { name: 'Heart', label: 'Yêu', group: 'fashion', icon: Heart, tone: 'rose' },
  { name: 'Camera', label: 'Ảnh', group: 'fashion', icon: Camera, tone: 'slate' },
  { name: 'Sparkles', label: 'New', group: 'fashion', icon: Sparkles, tone: 'violet' },
  { name: 'Users', label: 'KH', group: 'system', icon: Users, tone: 'blue' },
  { name: 'UserRound', label: 'User', group: 'system', icon: UserRound, tone: 'cyan' },
  { name: 'UserCog', label: 'Role', group: 'system', icon: UserCog, tone: 'indigo' },
  { name: 'ShieldCheck', label: 'SSO', group: 'system', icon: ShieldCheck, tone: 'emerald' },
  { name: 'ShieldAlert', label: 'Cấm', group: 'system', icon: ShieldAlert, tone: 'rose' },
  { name: 'KeyRound', label: 'Key', group: 'system', icon: KeyRound, tone: 'amber' },
  { name: 'LockKeyhole', label: 'Lock', group: 'system', icon: LockKeyhole, tone: 'slate' },
  { name: 'History', label: 'Log', group: 'system', icon: History, tone: 'violet' },
  { name: 'Workflow', label: 'Flow', group: 'system', icon: Workflow, tone: 'blue' },
  { name: 'MonitorCog', label: 'App', group: 'system', icon: MonitorCog, tone: 'slate' },
  { name: 'BellRing', label: 'Tin', group: 'system', icon: BellRing, tone: 'amber' },
  { name: 'Mail', label: 'Mail', group: 'system', icon: Mail, tone: 'blue' },
  { name: 'ClipboardCheck', label: 'Duyệt', group: 'system', icon: ClipboardCheck, tone: 'emerald' },
  { name: 'FileText', label: 'Form', group: 'system', icon: FileText, tone: 'cyan' },
  { name: 'Settings2', label: 'Cài', group: 'system', icon: Settings2, tone: 'slate' },
  { name: 'Search', label: 'Tìm', group: 'system', icon: Search, tone: 'blue' },
  { name: 'Filter', label: 'Lọc', group: 'system', icon: Filter, tone: 'indigo' },
  { name: 'SlidersHorizontal', label: 'Tùy', group: 'system', icon: SlidersHorizontal, tone: 'violet' },
  { name: 'CloudUpload', label: 'Up', group: 'system', icon: CloudUpload, tone: 'cyan' },
  { name: 'Download', label: 'Down', group: 'system', icon: Download, tone: 'emerald' },
  { name: 'RefreshCcw', label: 'Làm', group: 'system', icon: RefreshCcw, tone: 'blue' },
  { name: 'Eye', label: 'Xem', group: 'system', icon: Eye, tone: 'slate' },
  { name: 'Edit3', label: 'Sửa', group: 'system', icon: Edit3, tone: 'amber' },
  { name: 'Copy', label: 'Copy', group: 'system', icon: Copy, tone: 'cyan' },
  { name: 'Trash2', label: 'Xóa', group: 'system', icon: Trash2, tone: 'rose' },
  { name: 'CheckCircle2', label: 'OK', group: 'system', icon: CheckCircle2, tone: 'emerald' },
  { name: 'X', label: 'Hủy', group: 'system', icon: X, tone: 'rose' },
  { name: 'Zap', label: 'Nhanh', group: 'system', icon: Zap, tone: 'amber' },
  { name: 'Layers', label: 'Layer', group: 'system', icon: Layers, tone: 'violet' },
];

const animatedSvgSpecs: AnimatedSvgSpec[] = [
  {
    key: 'sync-ring',
    title: 'Sync',
    tone: 'blue',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .spin { transform-origin: 32px 32px; animation: spin 1.4s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
  <circle cx="32" cy="32" r="22" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-dasharray="76 40" class="spin"/>
  <path d="M42 18h8v8" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
  {
    key: 'payment-pulse',
    title: 'Pay',
    tone: 'emerald',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .pulse { animation: pulse 1.2s ease-in-out infinite; transform-origin: 32px 32px; }
    @keyframes pulse { 50% { transform: scale(.92); opacity: .55; } }
  </style>
  <rect x="10" y="18" width="44" height="30" rx="8" stroke="${color}" stroke-width="5"/>
  <path d="M16 28h32" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="45" cy="39" r="4" fill="${color}" class="pulse"/>
</svg>`,
  },
  {
    key: 'stock-scan',
    title: 'Scan',
    tone: 'cyan',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .line { animation: scan 1.35s ease-in-out infinite alternate; }
    @keyframes scan { from { transform: translateY(-13px); } to { transform: translateY(13px); } }
  </style>
  <path d="M16 20v-6h10M38 14h10v6M48 44v6H38M26 50H16v-6" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
  <path d="M18 32h28" stroke="${color}" stroke-width="5" stroke-linecap="round" class="line"/>
</svg>`,
  },
  {
    key: 'sale-spark',
    title: 'Sale',
    tone: 'rose',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .spark { animation: spark 1s ease-in-out infinite alternate; transform-origin: center; }
    @keyframes spark { to { transform: scale(1.2) rotate(8deg); opacity: .65; } }
  </style>
  <path d="M18 42L42 18" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="21" cy="21" r="6" stroke="${color}" stroke-width="5"/>
  <circle cx="43" cy="43" r="6" stroke="${color}" stroke-width="5"/>
  <path d="M48 10l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="${color}" class="spark"/>
</svg>`,
  },
  {
    key: 'secure-check',
    title: 'Auth',
    tone: 'indigo',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .draw { stroke-dasharray: 36; stroke-dashoffset: 36; animation: draw 1.4s ease-in-out infinite; }
    @keyframes draw { 55%,100% { stroke-dashoffset: 0; } }
  </style>
  <path d="M32 8l20 8v14c0 13-8 22-20 27-12-5-20-14-20-27V16l20-8z" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M23 32l6 6 13-15" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="draw"/>
</svg>`,
  },
  {
    key: 'delivery-move',
    title: 'Ship',
    tone: 'amber',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .move { animation: move 1.1s ease-in-out infinite alternate; }
    @keyframes move { to { transform: translateX(5px); } }
  </style>
  <g class="move">
    <path d="M10 36h28V20H10v16zM38 26h9l7 10v8H38V26z" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="20" cy="46" r="4" fill="${color}"/>
    <circle cx="46" cy="46" r="4" fill="${color}"/>
  </g>
</svg>`,
  },
  {
    key: 'cart-bounce',
    title: 'Cart',
    tone: 'emerald',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .cart { animation: cart 1.1s ease-in-out infinite alternate; transform-origin: 32px 40px; }
    @keyframes cart { to { transform: translateY(-4px); } }
  </style>
  <g class="cart" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 14h6l6 28h23l5-20H22"/>
    <circle cx="29" cy="50" r="3" fill="${color}" stroke="none"/>
    <circle cx="45" cy="50" r="3" fill="${color}" stroke="none"/>
  </g>
</svg>`,
  },
  {
    key: 'tag-wiggle',
    title: 'Tag',
    tone: 'rose',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .tag { animation: wiggle 1.25s ease-in-out infinite alternate; transform-origin: 18px 18px; }
    @keyframes wiggle { to { transform: rotate(-8deg); } }
  </style>
  <path class="tag" d="M12 14h18l22 22-18 18-22-22V14z" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="24" cy="26" r="4" fill="${color}"/>
</svg>`,
  },
  {
    key: 'bell-ring',
    title: 'Notify',
    tone: 'amber',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bell { animation: ring .9s ease-in-out infinite alternate; transform-origin: 32px 14px; }
    @keyframes ring { to { transform: rotate(8deg); } }
  </style>
  <g class="bell" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 42h24l-3-6V26c0-7-4-12-9-12s-9 5-9 12v10l-3 6z"/>
    <path d="M28 48c1 3 7 3 8 0"/>
  </g>
</svg>`,
  },
  {
    key: 'upload-cloud',
    title: 'Upload',
    tone: 'cyan',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .arrow { animation: upload 1.2s ease-in-out infinite; }
    @keyframes upload { 50% { transform: translateY(-7px); opacity: .65; } }
  </style>
  <path d="M22 48H18c-6 0-10-4-10-10 0-5 4-9 9-10 2-7 8-12 15-12 8 0 15 6 16 14 5 1 8 5 8 10 0 5-4 8-9 8h-5" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path class="arrow" d="M32 46V26M24 34l8-8 8 8" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
  {
    key: 'heart-pop',
    title: 'Like',
    tone: 'rose',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .heart { animation: pop 1s ease-in-out infinite alternate; transform-origin: 32px 34px; }
    @keyframes pop { to { transform: scale(1.12); } }
  </style>
  <path class="heart" d="M32 52S12 40 12 25c0-7 5-12 12-12 4 0 7 2 8 5 1-3 4-5 8-5 7 0 12 5 12 12 0 15-20 27-20 27z" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>
</svg>`,
  },
  {
    key: 'check-draw',
    title: 'Done',
    tone: 'emerald',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .mark { stroke-dasharray: 44; stroke-dashoffset: 44; animation: mark 1.15s ease-in-out infinite; }
    @keyframes mark { 60%,100% { stroke-dashoffset: 0; } }
  </style>
  <circle cx="32" cy="32" r="23" stroke="${color}" stroke-width="5"/>
  <path class="mark" d="M20 33l8 8 17-19" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
  {
    key: 'package-lift',
    title: 'Stock',
    tone: 'violet',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .lid { animation: lid 1.25s ease-in-out infinite alternate; transform-origin: 32px 22px; }
    @keyframes lid { to { transform: translateY(-7px); } }
  </style>
  <path class="lid" d="M14 22l18-10 18 10-18 10-18-10z" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M16 28v18l16 8 16-8V28M32 34v20" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>
</svg>`,
  },
  {
    key: 'user-ping',
    title: 'User',
    tone: 'indigo',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .ping { animation: ping 1.35s ease-out infinite; transform-origin: 48px 18px; }
    @keyframes ping { to { transform: scale(1.8); opacity: 0; } }
  </style>
  <circle cx="31" cy="24" r="10" stroke="${color}" stroke-width="5"/>
  <path d="M14 52c3-10 11-16 17-16s14 6 17 16" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
  <circle class="ping" cx="48" cy="18" r="5" fill="${color}" opacity=".45"/>
  <circle cx="48" cy="18" r="4" fill="${color}"/>
</svg>`,
  },
  {
    key: 'receipt-feed',
    title: 'Bill',
    tone: 'slate',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .paper { animation: feed 1.2s ease-in-out infinite alternate; }
    @keyframes feed { to { transform: translateY(5px); } }
  </style>
  <path d="M18 14h28v36l-5-3-5 3-4-3-4 3-5-3-5 3V14z" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>
  <g class="paper" stroke="${color}" stroke-width="4" stroke-linecap="round">
    <path d="M25 26h14M25 34h10"/>
  </g>
</svg>`,
  },
  {
    key: 'search-orbit',
    title: 'Find',
    tone: 'blue',
    code: (color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .dot { animation: orbit 1.5s linear infinite; transform-origin: 28px 28px; }
    @keyframes orbit { to { transform: rotate(360deg); } }
  </style>
  <circle cx="28" cy="28" r="15" stroke="${color}" stroke-width="5"/>
  <path d="M40 40l10 10" stroke="${color}" stroke-width="6" stroke-linecap="round"/>
  <circle class="dot" cx="28" cy="12" r="4" fill="${color}"/>
</svg>`,
  },
];

const groupOptions = [
  { label: 'All', value: 'all' },
  { label: 'Retail', value: 'retail' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'POS', value: 'pos' },
  { label: 'System', value: 'system' },
  { label: 'SVG', value: 'animated' },
];

const sourceLinks = [
  { title: 'Lucide React', url: 'https://lucide.dev/icons/' },
  { title: 'Ant Design Icons', url: 'https://ant.design/components/icon' },
  { title: 'Heroicons', url: 'https://heroicons.com/' },
  { title: 'Tabler Icons', url: 'https://tabler.io/icons' },
  { title: 'Iconify', url: 'https://icon-sets.iconify.design/' },
  { title: 'SVG Repo', url: 'https://www.svgrepo.com/' },
];

const createIconCode = (name: string, color: string, size: number, strokeWidth: number) =>
  `import { ${name} } from 'lucide-react';\n\n<${name} size={${size}} color="${color}" strokeWidth={${strokeWidth}} />`;

const createButtonCode = (name: string, color: string, size: number, strokeWidth: number) =>
  `import { ${name} } from 'lucide-react';\n\n<button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-slate-700 hover:border-blue-300">\n  <${name} size={${size}} color="${color}" strokeWidth={${strokeWidth}} />\n</button>`;

const IconButton: React.FC<{
  icon: LucideIcon;
  label: string;
  tone: Tone;
  active?: boolean;
  size?: number;
  color?: string;
  strokeWidth?: number;
}> = ({ icon: Icon, label, tone, active, size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Tooltip title={label}>
    <button
      type="button"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition hover:-translate-y-0.5 hover:shadow-sm ${
        active ? solidToneClasses[tone] : toneClasses[tone]
      }`}
    >
      <Icon size={Math.min(size, 22)} color={active ? '#ffffff' : color} strokeWidth={strokeWidth} />
    </button>
  </Tooltip>
);

const SamplePanel: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between gap-2">
      <Space size={8}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Icon size={16} />
        </div>
        <span className="text-sm font-bold text-slate-800">{title}</span>
      </Space>
    </div>
    {children}
  </div>
);

const IconsPage: React.FC = () => {
  const { message } = App.useApp();
  const [group, setGroup] = useState<GroupKey>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(iconSpecs[0]);
  const [color, setColor] = useState('#2563eb');
  const [size, setSize] = useState(22);
  const [strokeWidth, setStrokeWidth] = useState(2);

  const uniqueIconSpecs = useMemo(() => {
    const seen = new Set<string>();
    return iconSpecs.filter(item => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    });
  }, []);

  const filteredIcons = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return uniqueIconSpecs.filter(item => {
      const matchGroup = group === 'all' || group === 'animated' || item.group === group;
      const matchSearch = !keyword || [item.name, item.label, item.group].join(' ').toLowerCase().includes(keyword);
      return matchGroup && matchSearch;
    });
  }, [group, searchText, uniqueIconSpecs]);

  const copyText = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    message.success(`Đã copy ${label}`);
  };

  const actionIcons = [
    [Search, 'Tìm', 'blue'],
    [Filter, 'Lọc', 'indigo'],
    [Eye, 'Xem', 'slate'],
    [Edit3, 'Sửa', 'amber'],
    [Copy, 'Copy', 'cyan'],
    [Printer, 'In', 'slate'],
    [Download, 'Xuất', 'emerald'],
    [Trash2, 'Xóa', 'rose'],
  ] as Array<[LucideIcon, string, Tone]>;

  const moduleIcons = [
    [Receipt, 'Đơn', 'blue'],
    [PackageSearch, 'SKU', 'cyan'],
    [Users, 'KH', 'emerald'],
    [BadgePercent, 'Sale', 'rose'],
    [Store, 'Shop', 'indigo'],
    [ShieldCheck, 'SSO', 'slate'],
    [History, 'Audit', 'violet'],
    [Settings2, 'Config', 'amber'],
  ] as Array<[LucideIcon, string, Tone]>;

  return (
    <PageContainer noCard>
      <div className="space-y-4 sm:space-y-5">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <Space size={10}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Palette size={20} />
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">Icon UI Kit</div>
                <div className="text-xs text-slate-500">Retail · Fashion · POS · Animated SVG</div>
              </div>
            </Space>
            <Space wrap>
              <Input
                allowClear
                prefix={<Search size={15} className="text-slate-400" />}
                placeholder="Search icon"
                value={searchText}
                onChange={event => setSearchText(event.target.value)}
                className="w-56"
              />
              <Segmented value={group} onChange={value => setGroup(value as GroupKey)} options={groupOptions} />
            </Space>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <SamplePanel title="Library" icon={Layers}>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                {filteredIcons.map(spec => {
                  const Icon = spec.icon;
                  const active = selectedIcon.name === spec.name;
                  return (
                    <Tooltip title={spec.name} key={spec.name}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedIcon(spec)}
                        onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedIcon(spec);
                          }
                        }}
                        className={`group flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border bg-white px-2 py-3 shadow-sm transition hover:border-blue-200 hover:shadow-md ${
                          active ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-100'
                        }`}
                      >
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${toneClasses[spec.tone]}`}>
                          <Icon size={active ? size : 22} color={active ? color : 'currentColor'} strokeWidth={active ? strokeWidth : 2} />
                        </div>
                        <div className="flex w-full items-center justify-center gap-1">
                          <span className="min-w-0 truncate text-xs font-semibold text-slate-600">{spec.label}</span>
                          <Button
                            type="text"
                            size="small"
                            icon={<Copy size={12} />}
                            className="h-6 w-6 shrink-0 opacity-70 hover:opacity-100"
                            onClick={event => {
                              event.stopPropagation();
                              copyText(createIconCode(spec.name, active ? color : '#2563eb', active ? size : 22, active ? strokeWidth : 2), spec.name);
                            }}
                          />
                        </div>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </SamplePanel>

            <div className="grid gap-4 lg:grid-cols-2">
              <SamplePanel title="Module Dock" icon={Menu}>
                <div className="flex flex-wrap gap-2">
                  {moduleIcons.map(([Icon, label, tone]) => (
                    <IconButton key={label} icon={Icon} label={label} tone={tone} />
                  ))}
                </div>
              </SamplePanel>

              <SamplePanel title="Action Strip" icon={Zap}>
                <div className="flex flex-wrap gap-2">
                  {actionIcons.map(([Icon, label, tone]) => (
                    <IconButton key={label} icon={Icon} label={label} tone={tone} />
                  ))}
                </div>
              </SamplePanel>

              <SamplePanel title="POS Checkout" icon={ShoppingCart}>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    [SearchCheck, 'Scan', 'blue'],
                    [Tags, 'Tag', 'amber'],
                    [BadgePercent, 'Sale', 'rose'],
                    [Wallet, 'Pay', 'emerald'],
                    [QrCode, 'QR', 'slate'],
                    [CreditCard, 'Card', 'indigo'],
                    [Printer, 'Bill', 'slate'],
                    [CheckCircle2, 'Done', 'emerald'],
                  ].map(([Icon, label, tone]) => (
                    <IconButton key={label as string} icon={Icon as LucideIcon} label={label as string} tone={tone as Tone} />
                  ))}
                </div>
              </SamplePanel>

              <SamplePanel title="Order Flow" icon={Workflow}>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    [Receipt, 'blue'],
                    [CircleDollarSign, 'emerald'],
                    [DatabaseZap, 'amber'],
                    [Truck, 'indigo'],
                    [BadgeCheck, 'emerald'],
                  ].map(([Icon, tone], index) => (
                    <React.Fragment key={index}>
                      <IconButton icon={Icon as LucideIcon} label={`Step ${index + 1}`} tone={tone as Tone} active={index < 2} />
                      {index < 4 && <div className="h-px w-8 shrink-0 bg-slate-200" />}
                    </React.Fragment>
                  ))}
                </div>
              </SamplePanel>
            </div>

            <SamplePanel title="Animated SVG" icon={Sparkles}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {animatedSvgSpecs.map(item => (
                  <div key={item.key} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-xl border bg-white ${toneClasses[item.tone]}`} dangerouslySetInnerHTML={{ __html: item.code('#2563eb', 56) }} />
                      <Button size="small" icon={<Copy size={14} />} onClick={() => copyText(item.code('#2563eb', 56), item.title)}>
                        Copy
                      </Button>
                    </div>
                    <div className="mt-2 text-xs font-bold text-slate-700">{item.title}</div>
                  </div>
                ))}
              </div>
            </SamplePanel>

            <div className="grid gap-4 lg:grid-cols-3">
              {[
                { icon: Footprints, title: 'Shoes', tone: 'emerald' as Tone, tag: '42' },
                { icon: Shirt, title: 'Shirt', tone: 'blue' as Tone, tag: 'M' },
                { icon: ShoppingBag, title: 'Bag', tone: 'violet' as Tone, tag: 'New' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                    <div className={`flex aspect-[4/3] items-center justify-center rounded-xl border ${toneClasses[item.tone]}`}>
                      <Icon size={48} color="currentColor" strokeWidth={2} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Space size={8}>
                        <Tag bordered={false}>{item.tag}</Tag>
                        <span className="text-sm font-bold text-slate-800">{item.title}</span>
                      </Space>
                      <Space size={6}>
                        <IconButton icon={Heart} label="Yêu thích" tone="rose" />
                        <IconButton icon={ShoppingCart} label="Thêm" tone="emerald" />
                      </Space>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <SamplePanel title="Customize" icon={SlidersHorizontal}>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <Space>
                    <selectedIcon.icon size={size} color={color} strokeWidth={strokeWidth} />
                    <div>
                      <div className="text-sm font-bold text-slate-800">{selectedIcon.name}</div>
                      <div className="text-xs text-slate-500">{selectedIcon.group}</div>
                    </div>
                  </Space>
                  <Tag bordered={false}>{uniqueIconSpecs.length} unique</Tag>
                </div>

                <div>
                  <div className="mb-1 text-xs font-semibold text-slate-500">Size</div>
                  <Slider min={14} max={48} value={size} onChange={setSize} />
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold text-slate-500">Stroke</div>
                  <Slider min={1} max={3} step={0.25} value={strokeWidth} onChange={setStrokeWidth} />
                </div>
                <div>
                  <div className="mb-2 text-xs font-semibold text-slate-500">Color</div>
                  <div className="flex flex-wrap gap-2">
                    {['#111827', '#2563eb', '#14b8a6', '#ef4444', '#f97316', '#a855f7', '#facc15', '#64748b'].map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setColor(item)}
                        className={`h-8 w-8 rounded-full border-2 border-white shadow ring-2 ${color === item ? 'ring-slate-900' : 'ring-slate-100'}`}
                        style={{ backgroundColor: item }}
                      />
                    ))}
                    <input value={color} onChange={event => setColor(event.target.value)} type="color" className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-white" />
                  </div>
                </div>
                <Space wrap>
                  <Button icon={<Copy size={14} />} type="primary" onClick={() => copyText(createIconCode(selectedIcon.name, color, size, strokeWidth), selectedIcon.name)}>
                    Copy icon
                  </Button>
                  <Button icon={<Copy size={14} />} onClick={() => copyText(createButtonCode(selectedIcon.name, color, size, strokeWidth), `${selectedIcon.name} button`)}>
                    Copy button
                  </Button>
                </Space>
              </div>
            </SamplePanel>

            <SamplePanel title="Source Links" icon={CloudUpload}>
              <div className="grid gap-2">
                {sourceLinks.map(item => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-600"
                  >
                    {item.title}
                    <ChevronDown size={15} className="-rotate-90 text-slate-400" />
                  </a>
                ))}
              </div>
            </SamplePanel>

            <SamplePanel title="Mobile Nav" icon={Menu}>
              <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-3 shadow-sm">
                <div className="rounded-[22px] bg-white p-3">
                  <div className="grid grid-cols-5 gap-2">
                    {[Store, Receipt, Shirt, Users, Settings2].map((Icon, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`flex aspect-square items-center justify-center rounded-2xl ${index === 1 ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600'}`}
                      >
                        <Icon size={20} strokeWidth={2} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SamplePanel>

            <SamplePanel title="Tiny Commands" icon={Settings2}>
              <div className="grid grid-cols-6 gap-2">
                {[Plus, Minus, Check, X, EyeOff, RefreshCcw, Upload, Download, Copy, Trash2, TagIcon, SlidersHorizontal].map((Icon, index) => (
                  <IconButton
                    key={index}
                    icon={Icon}
                    label={`Cmd ${index + 1}`}
                    tone={index % 3 === 0 ? 'blue' : index % 3 === 1 ? 'slate' : 'rose'}
                  />
                ))}
              </div>
            </SamplePanel>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default IconsPage;
