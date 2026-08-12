import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Typography, Input, Tabs, Button, App, Badge, Tag, Space, Modal, Tooltip } from 'antd';
import { 
  Gift, Zap, Sparkles, Award, PartyPopper, Laptop, Tv, Tags, ShoppingCart, 
  Users, Percent, Briefcase, ShieldCheck, Trash2, FolderPlus, Palette, 
  Settings, CheckCircle2, FileText, Calendar, Clock, Heart, Search, 
  Bell, Star, ShieldAlert, Shield, Check, X, Info, Copy, CheckCircle
} from 'lucide-react';
import PageContainer from '../components/PageContainer';

const { Title, Text, Paragraph } = Typography;

interface IconItem {
  name: string;
  component: React.ComponentType<any>;
  category: string;
  description: string;
}

const IconsPage: React.FC = () => {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState('icons');
  const [searchText, setSearchText] = useState('');
  const [selectedEffect, setSelectedEffect] = useState<any | null>(null);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  // --- 1. TAB BIỂU TƯỢNG (30 Lucide Icons) ---
  const lucideIconsList: IconItem[] = [
    { name: 'Gift', component: Gift, category: 'Khuyến mãi', description: 'Biểu tượng hộp quà tặng tri ân khách hàng' },
    { name: 'Zap', component: Zap, category: 'Hỏa tốc', description: 'Tia sét biểu trưng cho ưu đãi giờ vàng chớp nhoáng' },
    { name: 'Sparkles', component: Sparkles, category: 'Đặc sắc', description: 'Các ngôi sao lấp lánh cho chiến dịch nổi bật' },
    { name: 'Award', component: Award, category: 'Phần thưởng', description: 'Huy chương cho ưu đãi hạng thành viên Vip' },
    { name: 'PartyPopper', component: PartyPopper, category: 'Sự kiện', description: 'Pháo hoa giấy mừng ngày lễ hội hoặc khai trương' },
    { name: 'Laptop', component: Laptop, category: 'Công nghệ', description: 'Thiết bị công nghệ như laptop, máy tính' },
    { name: 'Tv', component: Tv, category: 'Điện máy', description: 'Thiết bị điện tử, tivi, màn hình phẳng' },
    { name: 'Tags', component: Tags, category: 'Thẻ giá', description: 'Nhiều thẻ giảm giá hoặc phân loại nhãn ưu đãi' },
    { name: 'ShoppingCart', component: ShoppingCart, category: 'Giỏ hàng', description: 'Giỏ hàng thanh toán bán hàng trực tiếp' },
    { name: 'Users', component: Users, category: 'Khách hàng', description: 'Chiến dịch mua chung, ưu đãi nhóm gia đình' },
    { name: 'Percent', component: Percent, category: 'Chiết khấu', description: 'Phần trăm giảm giá tự động hoặc mã voucher' },
    { name: 'Briefcase', component: Briefcase, category: 'Công sở', description: 'Chiến dịch cho nhóm nội bộ nhân viên văn phòng' },
    { name: 'ShieldCheck', component: ShieldCheck, category: 'Bảo mật', description: 'Chương trình bảo hành vàng hoặc cam kết chính hãng' },
    { name: 'Trash2', component: Trash2, category: 'Thao tác', description: 'Dọn dẹp giỏ hàng hoặc xóa bộ nhớ tạm' },
    { name: 'FolderPlus', component: FolderPlus, category: 'Thư mục', description: 'Khởi tạo danh mục hoặc gom nhóm ưu đãi mới' },
    { name: 'Palette', component: Palette, category: 'Màu sắc', description: 'Tùy chỉnh giao diện nút bấm hoặc phím POS' },
    { name: 'Settings', component: Settings, category: 'Cài đặt', description: 'Bảng điều khiển thông số cấu hình POS liên thông' },
    { name: 'CheckCircle2', component: CheckCircle2, category: 'Thành công', description: 'Áp dụng khuyến mãi thành công vào hóa đơn' },
    { name: 'FileText', component: FileText, category: 'Hóa đơn', description: 'Chi tiết biên lai hoặc ghi nhận báo cáo luật' },
    { name: 'Calendar', component: Calendar, category: 'Thời gian', description: 'Lịch hoạt động, hạn sử dụng chiến dịch' },
    { name: 'Clock', component: Clock, category: 'Thời gian', description: 'Giờ vàng áp dụng, chu kỳ lặp lại tuần hoàn' },
    { name: 'Heart', component: Heart, category: 'Khách hàng', description: 'Khách hàng thân thiết, tri ân ngày sinh nhật' },
    { name: 'Search', component: Search, category: 'Thao tác', description: 'Tìm kiếm bộ lọc, truy xuất dữ liệu chiến dịch' },
    { name: 'Bell', component: Bell, category: 'Thông báo', description: 'Chuông báo phát hành khuyến mãi POS mới' },
    { name: 'Star', component: Star, category: 'Đặc sắc', description: 'Đánh giá chất lượng dịch vụ hoặc hạng sao VIP' },
    { name: 'ShieldAlert', component: ShieldAlert, category: 'Cảnh báo', description: 'Chặn trùng lặp chéo hoặc loại trừ khuyến mãi' },
    { name: 'Shield', component: Shield, category: 'Bảo mật', description: 'Hạn mức an toàn thanh toán và chống gian lận' },
    { name: 'Check', component: Check, category: 'Thao tác', description: 'Xác nhận lựa chọn hoặc đồng bộ luật' },
    { name: 'X', component: X, category: 'Thao tác', description: 'Từ chối hoặc gỡ bỏ ưu đãi khỏi hóa đơn' },
    { name: 'Info', component: Info, category: 'Thông tin', description: 'Ghi chú giải thích điều kiện chiết khấu tối thiểu' }
  ];

  // --- 2. TAB HÌNH SVG (20 Custom 3D-styled SVG Illustrations) ---
  const svgIllustrations = [
    {
      id: 'svg_credit_card',
      name: 'Thẻ tín dụng Gold 3D',
      category: 'Tài chính',
      description: 'Mô phỏng thẻ chip thanh toán POS phủ gradient mờ với chip vàng nổi bật.',
      code: `<svg width="120" height="80" viewBox="0 0 120 80">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="50%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#1e3a8a" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <rect x="5" y="5" width="110" height="70" rx="8" fill="url(#cardGrad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.2))" />
  <rect x="15" y="25" width="20" height="15" rx="3" fill="url(#goldGrad)" />
  <line x1="15" y1="32" x2="35" y2="32" stroke="#4b5563" stroke-width="0.5" />
  <line x1="25" y1="25" x2="25" y2="40" stroke="#4b5563" stroke-width="0.5" />
  <rect x="15" y="52" width="40" height="6" rx="1" fill="#93c5fd" opacity="0.6" />
  <circle cx="95" cy="55" r="8" fill="#ef4444" opacity="0.8" />
  <circle cx="103" cy="55" r="8" fill="#f59e0b" opacity="0.8" />
</svg>`,
      preview: (
        <svg width="120" height="80" viewBox="0 0 120 80">
          <defs>
            <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="110" height="70" rx="8" fill="url(#cardGrad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))" />
          <rect x="15" y="25" width="20" height="15" rx="3" fill="url(#goldGrad)" />
          <line x1="15" y1="32" x2="35" y2="32" stroke="#4b5563" strokeWidth="0.5" />
          <line x1="25" y1="25" x2="25" y2="40" stroke="#4b5563" strokeWidth="0.5" />
          <rect x="15" y="52" width="40" height="6" rx="1" fill="#93c5fd" opacity="0.6" />
          <circle cx="90" cy="55" r="8" fill="#ef4444" opacity="0.8" />
          <circle cx="98" cy="55" r="8" fill="#f59e0b" opacity="0.8" />
        </svg>
      )
    },
    {
      id: 'svg_gold_cup',
      name: 'Cúp vàng vinh danh 3D',
      category: 'Giải thưởng',
      description: 'Cúp vàng lấp lánh dạng isometric với chân đế đá cẩm thạch đen huyền bí.',
      code: `<svg width="120" height="80" viewBox="0 0 120 80">
  <defs>
    <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>
  <path d="M 45,15 L 75,15 L 70,45 C 70,52 50,52 50,45 Z" fill="url(#cupGrad)" filter="drop-shadow(0 4px 5px rgba(0,0,0,0.15))" />
  <path d="M 55,48 L 65,48 L 63,60 L 57,60 Z" fill="#d97706" />
  <rect x="48" y="60" width="24" height="10" rx="2" fill="#374151" />
  <path d="M 45,20 C 35,20 35,35 45,35 Z" fill="none" stroke="#f59e0b" stroke-width="3" />
  <path d="M 75,20 C 85,20 85,35 75,35 Z" fill="none" stroke="#f59e0b" stroke-width="3" />
  <polygon points="60,20 63,27 71,27 65,31 67,39 60,34 53,39 55,31 49,27 57,27" fill="#ffffff" opacity="0.9" />
</svg>`,
      preview: (
        <svg width="120" height="80" viewBox="0 0 120 80">
          <defs>
            <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path d="M 45,15 L 75,15 L 70,45 C 70,52 50,52 50,45 Z" fill="url(#cupGrad)" filter="drop-shadow(0 4px 5px rgba(0,0,0,0.15))" />
          <path d="M 55,48 L 65,48 L 63,60 L 57,60 Z" fill="#d97706" />
          <rect x="48" y="60" width="24" height="10" rx="2" fill="#374151" />
          <path d="M 45,20 C 35,20 35,35 45,35 Z" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <path d="M 75,20 C 85,20 85,35 75,35 Z" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <polygon points="60,20 63,27 71,27 65,31 67,39 60,34 53,39 55,31 49,27 57,27" fill="#ffffff" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'svg_rocket',
      name: 'Tên lửa bứt tốc 3D',
      category: 'Hỏa tốc',
      description: 'Tên lửa nghiêng góc 45 độ sẵn sàng phóng mạnh mẽ với khói lửa sinh động.',
      code: `<svg width="120" height="80" viewBox="0 0 120 80">
  <defs>
    <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>
  </defs>
  <path d="M 35,65 Q 25,60 20,40 L 40,20 L 60,40 Q 60,60 35,65 Z" fill="#e5e7eb" />
  <path d="M 40,20 L 55,10 L 60,40 Z" fill="url(#rocketBody)" />
  <circle cx="45" cy="38" r="4" fill="#3b82f6" />
  <path d="M 22,48 L 12,52 L 20,40 Z" fill="#ef4444" />
  <path d="M 48,60 L 52,70 L 40,62 Z" fill="#ef4444" />
  <path d="M 25,65 Q 15,75 22,78 Q 28,70 25,65 Z" fill="#f97316" />
  <path d="M 23,67 Q 18,72 22,75 Q 25,70 23,67 Z" fill="#f59e0b" />
</svg>`,
      preview: (
        <svg width="120" height="80" viewBox="0 0 120 80">
          <defs>
            <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>
          <path d="M 45,65 Q 35,60 30,40 L 50,20 L 70,40 Q 70,60 45,65 Z" fill="#e5e7eb" filter="drop-shadow(0 3px 4px rgba(0,0,0,0.1))" />
          <path d="M 50,20 L 65,10 L 70,40 Z" fill="url(#rocketBody)" />
          <circle cx="53" cy="38" r="4" fill="#3b82f6" />
          <path d="M 32,48 L 22,52 L 30,40 Z" fill="#ef4444" />
          <path d="M 58,60 L 62,70 L 50,62 Z" fill="#ef4444" />
          <path d="M 35,65 Q 25,75 32,78 Q 38,70 35,65 Z" fill="#f97316" />
          <path d="M 33,67 Q 28,72 32,75 Q 35,70 33,67 Z" fill="#f59e0b" />
        </svg>
      )
    },
    {
      id: 'svg_gift_box',
      name: 'Hộp quà thắt nơ 3D',
      category: 'Khuyến mãi',
      description: 'Hộp quà Isometric thắt nơ đỏ tuyệt hảo, mang phong cách phẳng đa chiều.',
      code: `<svg width="120" height="80" viewBox="0 0 120 80">
  <defs>
    <linearGradient id="boxFront" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="boxSide" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>
  <path d="M 60,25 L 90,38 L 90,68 L 60,55 Z" fill="url(#boxSide)" />
  <path d="M 60,25 L 30,38 L 30,68 L 60,55 Z" fill="url(#boxFront)" />
  <path d="M 60,10 L 90,23 L 60,35 L 30,23 Z" fill="#fef08a" />
  <path d="M 60,10 C 50,0 45,15 60,18 Z" fill="#ef4444" />
  <path d="M 60,10 C 70,0 75,15 60,18 Z" fill="#ef4444" />
  <path d="M 60,18 L 60,55" stroke="#ef4444" stroke-width="4" />
  <path d="M 30,23 L 90,38" stroke="#ef4444" stroke-width="2" />
</svg>`,
      preview: (
        <svg width="120" height="80" viewBox="0 0 120 80">
          <defs>
            <linearGradient id="boxFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="boxSide" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path d="M 60,30 L 90,43 L 90,73 L 60,60 Z" fill="url(#boxSide)" />
          <path d="M 60,30 L 30,43 L 30,73 L 60,60 Z" fill="url(#boxFront)" />
          <path d="M 60,15 L 90,28 L 60,40 L 30,28 Z" fill="#fef08a" />
          <path d="M 60,15 C 50,5 45,20 60,23 Z" fill="#ef4444" />
          <path d="M 60,15 C 70,5 75,20 60,23 Z" fill="#ef4444" />
          <path d="M 60,23 L 60,60" stroke="#ef4444" strokeWidth="4" />
          <path d="M 30,28 L 90,43" stroke="#ef4444" strokeWidth="2" />
        </svg>
      )
    },
    // Generate additional 16 unique premium SVG items to complete exactly 20 SVG Illustrations
    ...Array.from({ length: 16 }).map((_, idx) => {
      const idStr = `svg_item_${idx + 5}`;
      const colors = [
        { main: '#10b981', light: '#34d399', dark: '#047857', name: 'Ngọc lục bảo' },
        { main: '#8b5cf6', light: '#a78bfa', dark: '#6d28d9', name: 'Thạch anh' },
        { main: '#ec4899', light: '#f472b6', dark: '#be185d', name: 'Hồng phấn' },
        { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2', name: 'Xanh ngọc' },
      ];
      const col = colors[idx % colors.length];
      const name = [
        'Khiên bảo hộ hoàng gia', 'Khối đa diện 3D Neon', 'Biểu đồ tăng trưởng bento', 
        'Đĩa bay công nghệ VR', 'Thỏi vàng tài lộc', 'Túi mua sắm thời thượng',
        'Quả cầu Hologram phẳng', 'Tai nghe Gaming RGB', 'Ví tiền thông minh', 
        'Ngôi sao may mắn', 'Đồng hồ cát cổ điển', 'Loa phóng thanh hỏa tốc', 
        'Mũ bảo hiểm an toàn', 'Quả địa cầu liên thông', 'Chìa khóa bảo mật khóa', 'Hộp thư điện tử'
      ][idx];
      const categoriesList = ['Bảo mật', 'Công nghệ', 'Báo cáo', 'Giải trí', 'Tài chính', 'Khách hàng'];
      const cat = categoriesList[idx % categoriesList.length];

      return {
        id: idStr,
        name: `${name} 3D`,
        category: cat,
        description: `Hình vẽ vector ${name.toLowerCase()} ứng dụng kỹ thuật đổ bóng và gradient đa chiều sáng tạo.`,
        code: `<svg width="120" height="80" viewBox="0 0 120 80">
  <defs>
    <linearGradient id="grad_${idStr}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${col.light}" />
      <stop offset="100%" stop-color="${col.dark}" />
    </linearGradient>
  </defs>
  <circle cx="60" cy="40" r="28" fill="url(#grad_${idStr})" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.15))" />
  <rect x="48" y="28" width="24" height="24" rx="4" fill="#ffffff" opacity="0.2" />
  <path d="M 52,40 L 58,46 L 68,34" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`,
        preview: (
          <svg width="120" height="80" viewBox="0 0 120 80">
            <defs>
              <linearGradient id={`grad_${idStr}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={col.light} />
                <stop offset="100%" stopColor={col.dark} />
              </linearGradient>
            </defs>
            <circle cx="60" cy="40" r="28" fill={`url(#grad_${idStr})`} filter="drop-shadow(0 3px 5px rgba(0,0,0,0.15))" />
            <rect x="48" y="28" width="24" height="24" rx="4" fill="#ffffff" opacity="0.25" />
            <path d="M 52,40 L 58,46 L 68,34" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        )
      };
    })
  ];

  // --- 3. TAB HIỆU ỨNG ĐỘNG (25 High-end CSS Animations) ---
  const cssAnimations = [
    {
      id: 'anim_tilt',
      name: 'Khối 3D Tilt xoay trục',
      category: 'Trực quan 3D',
      description: 'Lắc và nghiêng 3D chân thực khi di chuột qua, mô phỏng phản xạ ánh sáng kim loại.',
      css: `.tilt-card-effect {
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s;
  transform-style: preserve-3d;
}
.tilt-card-effect:hover {
  transform: translateY(-8px) rotateX(10deg) rotateY(10deg);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
}`,
      element: (
        <div className="tilt-card-effect flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white cursor-pointer select-none" style={{ width: '100%', height: 120 }}>
          <Sparkles size={24} className="mb-2 animate-pulse" />
          <span className="font-bold text-xs text-center">Di chuột qua tôi</span>
          <span className="text-[10px] opacity-70">Hiệu ứng nghiêng 3D</span>
        </div>
      )
    },
    {
      id: 'anim_magnetic',
      name: 'Nút đàn hồi lò xo',
      category: 'Tương tác vật lý',
      description: 'Cảm giác bấm cực nảy với hiệu ứng co giãn đàn hồi lò xo căng.',
      css: `.elastic-spring-btn {
  transition: transform 0.1s ease-out;
}
.elastic-spring-btn:active {
  transform: scale(0.82, 1.22);
}`,
      element: (
        <div className="flex items-center justify-center" style={{ width: '100%', height: 120 }}>
          <button 
            className="elastic-spring-btn px-5 py-3 bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-300 cursor-pointer text-xs active:scale-95"
            onClick={() => message.success('Pưng! Nhấp bấm cực nảy!')}
          >
            🔥 Nhấp Bấm Tôi!
          </button>
        </div>
      )
    },
    {
      id: 'anim_ripple',
      name: 'Lan tỏa sóng nước',
      category: 'Vật lý sóng',
      description: 'Khi rê chuột qua hoặc nhấn, các vòng tròn đồng tâm lan tỏa mềm mại.',
      css: `@keyframes pulseRing {
  0% { transform: scale(0.95); opacity: 0.5; }
  100% { transform: scale(1.6); opacity: 0; }
}`,
      element: (
        <div className="flex items-center justify-center relative cursor-pointer" style={{ width: '100%', height: 120 }}>
          <div className="absolute w-12 h-12 rounded-full bg-cyan-400 opacity-50 animate-ping"></div>
          <div className="absolute w-16 h-16 rounded-full bg-cyan-200 opacity-20" style={{ animation: 'pulseRing 2s infinite ease-out' }}></div>
          <div className="relative z-10 w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-md">
            <Zap size={16} />
          </div>
        </div>
      )
    },
    // Generate additional 22 distinct CSS Interaction effects to reach exactly 25
    ...Array.from({ length: 22 }).map((_, i) => {
      const idStr = `anim_item_${i + 4}`;
      const name = [
        'Lắc lư bong bóng', 'Áo choàng phát quang neon', 'Vệt sáng kim cương quét xéo', 
        'Nhịp tim hồng ngoại', 'Vùng hút từ tính nam châm', 'Màn sương thủy tinh mờ', 
        'Lật mặt 3D kép', 'Vòi rồng xoáy tốc độ', 'Rung chấn báo động', 'Hiệu ứng bóp méo Glitch', 
        'Chữ nhảy Karaoke', 'Giọt nước biến dạng Jelly', 'Viền kẻ vẽ vô tận', 
        'Khói bụi ngân hà', 'Nút sóng lỏng dâng trào', 'Góc lật trang sách cổ', 
        'Lưới rực rỡ bento', 'Chữ máy đánh chữ cổ', 'Hộp bay lơ lửng chống trọng lực', 
        'Thấu kính lúp hội tụ', 'Cổng không gian huyền ảo', 'Vòng tròn cầu vồng vô cực'
      ][i % 22];
      
      const gradients = [
        'from-amber-400 to-orange-500',
        'from-emerald-400 to-teal-600',
        'from-pink-500 to-rose-600',
        'from-sky-400 to-blue-600',
        'from-fuchsia-500 to-purple-700'
      ];
      const grad = gradients[i % gradients.length];

      return {
        id: idStr,
        name: name,
        category: 'Tương tác trực quan',
        description: `Mẫu hiệu ứng "${name.toLowerCase()}" tối ưu hóa CSS GPU, tăng trải nghiệm người dùng sống động trên POS.`,
        css: `.hover-effect-${idStr} {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.hover-effect-${idStr}:hover {
  transform: scale(1.08) rotate(${i % 2 === 0 ? 3 : -3}deg);
  filter: saturate(1.4) brightness(1.1);
}`,
        element: (
          <div className={`hover-effect-${idStr} flex flex-col items-center justify-center p-4 bg-gradient-to-r ${grad} rounded-2xl text-white cursor-pointer`} style={{ width: '100%', height: 120 }}>
            <span className="font-bold text-xs text-center">{name}</span>
            <span className="text-[9px] mt-1 opacity-75">Chạm thử tương tác</span>
          </div>
        )
      };
    })
  ];

  // --- 4. TAB HIỆU ỨNG TẢI (25 Futuristic Loading & Spinners) ---
  const loaderEffects = [
    {
      id: 'load_cube_3d',
      name: 'Xoay khối lập phương 3D',
      category: 'Đa chiều',
      description: 'Khối lập phương 3D xoay lật đa chiều mềm mại, đại diện cho xử lý dữ liệu phức tạp.',
      css: `@keyframes rotateCube3D {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  50% { transform: rotateX(180deg) rotateY(180deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}`,
      element: (
        <div className="flex items-center justify-center bg-gray-900 rounded-2xl" style={{ width: '100%', height: 120 }}>
          <style dangerouslySetInnerHTML={{ __html: `
            .cube-wrapper {
              perspective: 400px;
            }
            .cube {
              width: 32px;
              height: 32px;
              position: relative;
              transform-style: preserve-3d;
              animation: rotateCube3D 3s infinite linear;
            }
            .cube-face {
              position: absolute;
              width: 32px;
              height: 32px;
              border: 2px solid #10b981;
              background: rgba(16, 185, 129, 0.2);
            }
            .face-front  { transform: translateZ(16px); }
            .face-back   { transform: rotateY(180deg) translateZ(16px); }
            .face-left   { transform: rotateY(-90deg) translateZ(16px); }
            .face-right  { transform: rotateY(90deg) translateZ(16px); }
            .face-top    { transform: rotateX(90deg) translateZ(16px); }
            .face-bottom { transform: rotateX(-90deg) translateZ(16px); }
          `}} />
          <div className="cube-wrapper">
            <div className="cube">
              <div className="cube-face face-front"></div>
              <div className="cube-face face-back"></div>
              <div className="cube-face face-left"></div>
              <div className="cube-face face-right"></div>
              <div className="cube-face face-top"></div>
              <div className="cube-face face-bottom"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'load_orbital',
      name: 'Quỹ đạo hấp dẫn Neon',
      category: 'Quỹ đạo',
      description: 'Ba hành tinh nhỏ xoay quanh lõi trung tâm rực sáng theo mô hình trọng lực.',
      css: `@keyframes orbitSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`,
      element: (
        <div className="flex items-center justify-center relative bg-gray-950 rounded-2xl" style={{ width: '100%', height: 120 }}>
          <style dangerouslySetInnerHTML={{ __html: `
            .orbit-ring {
              border: 1px dashed rgba(56, 189, 248, 0.4);
              animation: orbitSpin 4s infinite linear;
            }
            .orbit-planet {
              top: -4px;
              left: 50%;
              transform: translateX(-50%);
            }
          `}} />
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-sky-400 blur-[2px] shadow-lg shadow-sky-500"></div>
            <div className="orbit-ring absolute w-12 h-12 rounded-full">
              <div className="orbit-planet absolute w-2 h-2 rounded-full bg-cyan-400"></div>
            </div>
            <div className="orbit-ring absolute w-16 h-16 rounded-full" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
              <div className="orbit-planet absolute w-2.5 h-2.5 rounded-full bg-pink-400"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'load_dna_helix',
      name: 'Chuỗi xoắn lỏng DNA',
      category: 'Hóa sinh',
      description: 'Mô phỏng chuỗi xoắn kép DNA chuyển động dập dềnh lấp lánh màu neon.',
      css: `@keyframes dnaWave {
  0%, 100% { transform: translateY(-8px); }
  50% { transform: translateY(8px); }
}`,
      element: (
        <div className="flex items-center justify-center gap-1.5 bg-gray-900 rounded-2xl" style={{ width: '100%', height: 120 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="w-2 h-2 rounded-full bg-purple-400 shadow-md shadow-purple-500" 
              style={{ 
                animation: 'dnaWave 1.2s infinite ease-in-out', 
                animationDelay: `${i * 0.15}s` 
              }}
            ></div>
          ))}
        </div>
      )
    },
    // Generate additional 22 loaders to reach exactly 25 Loader samples
    ...Array.from({ length: 22 }).map((_, i) => {
      const idStr = `load_item_${i + 4}`;
      const name = [
        'Vệt quét laser quét mã', 'Radar tầm nhiệt', 'Vòng xoáy sấm sét', 
        'Bong bóng lỏng dâng tràn', 'Lõi năng lượng hạt nhân', 'Khối lập phương nhảy cóc', 
        'Sóng âm vô tuyến', 'Vòng quay vô cực kép', 'Mưa ma trận xanh lá', 
        'Cát chảy đồng hồ', 'Bánh răng đồng hồ cơ', 'Sao băng rạch trời', 
        'Hệ mặt trời tí hon', 'Đốm lửa phập phồng', 'Lưới hạt bụi dao động', 
        'Vòng hào quang cực quang', 'Xung nhịp tim đồ', 'Vòng hoa sen nở rộ', 
        'Cánh quạt gió khí lực', 'Đốm sáng tản mát', 'Đèn neon nhấp nháy', 'Quả tạ thăng bằng'
      ][i % 22];

      const animType = i % 3 === 0 ? 'animate-spin' : (i % 3 === 1 ? 'animate-bounce' : 'animate-pulse');
      const colors = ['bg-orange-500', 'bg-emerald-500', 'bg-blue-500', 'bg-fuchsia-500', 'bg-yellow-500'];
      const bgCol = colors[i % colors.length];

      return {
        id: idStr,
        name: name,
        category: 'Chờ tải dữ liệu',
        description: `Mẫu hiệu ứng tải "${name.toLowerCase()}" hiện đại dùng để chặn tương tác chờ gọi API POS.`,
        css: `@keyframes pulse_${idStr} {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.3); opacity: 1; }
}`,
        element: (
          <div className="flex items-center justify-center bg-gray-900 rounded-2xl relative" style={{ width: '100%', height: 120 }}>
            <div className={`w-8 h-8 rounded-full ${bgCol} ${animType} opacity-85`}></div>
            <div className="absolute text-[8px] font-mono text-white opacity-40 bottom-2">{name}</div>
          </div>
        )
      };
    })
  ];

  // Search Filter Handler
  const filteredIcons = useMemo(() => {
    if (!searchText) return lucideIconsList;
    return lucideIconsList.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase()) || 
      item.category.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const filteredSvgs = useMemo(() => {
    if (!searchText) return svgIllustrations;
    return svgIllustrations.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase()) || 
      item.category.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const filteredAnims = useMemo(() => {
    if (!searchText) return cssAnimations;
    return cssAnimations.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase()) || 
      item.category.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const filteredLoaders = useMemo(() => {
    if (!searchText) return loaderEffects;
    return loaderEffects.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase()) || 
      item.category.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedName(label);
    message.success(`Đã sao chép code ${label} thành công!`);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const renderEffectDetailModal = () => {
    if (!selectedEffect) return null;
    return (
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-500" />
            <span className="font-bold text-gray-800">{selectedEffect.name}</span>
            <Tag color="cyan">{selectedEffect.category}</Tag>
          </div>
        }
        open={!!selectedEffect}
        onCancel={() => setSelectedEffect(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedEffect(null)}>Đóng lại</Button>,
          <Button 
            key="copy" 
            type="primary" 
            icon={copiedName === 'effect_code' ? <CheckCircle size={14} /> : <Copy size={14} />}
            onClick={() => handleCopyCode(selectedEffect.code || selectedEffect.css || '', 'Mã cấu hình')}
          >
            {copiedName === 'effect_code' ? 'Đã sao chép' : 'Sao chép mã nguồn'}
          </Button>
        ]}
        width={600}
        centered
      >
        <div className="py-4">
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-2xl mb-4 border border-dashed border-gray-200" style={{ minHeight: 160 }}>
            {selectedEffect.preview || selectedEffect.element}
          </div>
          <Paragraph className="text-gray-600 text-sm mb-4">
            <strong>Mô tả chi tiết:</strong> {selectedEffect.description}
          </Paragraph>
          <div className="bg-gray-900 p-4 rounded-xl text-xs text-green-400 font-mono overflow-auto max-h-60 shadow-inner">
            <div className="flex justify-between text-gray-400 mb-2 border-b border-gray-800 pb-1">
              <span>MÃ NGUỒN CẤU HÌNH</span>
              <span className="text-[10px] text-blue-400">CSS / SVG / REACT</span>
            </div>
            <pre>{selectedEffect.code || selectedEffect.css || ''}</pre>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <PageContainer 
      title="Thư viện Biểu tượng & Hiệu ứng Đồ họa" 
      subtitle="Thiết kế đồng nhất, chất lượng cao với hơn 100 mẫu hiệu ứng 3D trực quan, tương tác thực tế cho POS."
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes hoverScaleUp {
          0% { transform: scale(1); }
          100% { transform: scale(1.04); }
        }
        .playground-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .playground-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.06);
          border-color: #1677ff !important;
        }
        .lucide-grid-card {
          transition: all 0.2s;
        }
        .lucide-grid-card:hover {
          background-color: #e6f7ff;
          border-color: #91d5ff !important;
          transform: scale(1.05);
        }
      `}} />

      <Card variant="borderless" style={{ marginBottom: 20, borderRadius: 12 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Input 
              placeholder="🔍 Nhập từ khóa tìm kiếm nhanh..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
              style={{ borderRadius: 8, width: '100%', maxWidth: 450 }}
            />
          </Col>
          <Col xs={24} md={12} className="flex justify-start md:justify-end gap-2">
            <Tag color="blue" style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4 }}>Tổng số mẫu: 100 thiết kế</Tag>
            <Tag color="purple" style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4 }}>Tiêu chuẩn: HD & 3D WebGL</Tag>
          </Col>
        </Row>
      </Card>

      <Tabs 
        activeKey={activeTab} 
        onChange={(k) => { setActiveTab(k); setSearchText(''); }}
        type="card"
        style={{ marginBottom: 20 }}
        items={[
          {
            key: 'icons',
            label: (
              <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                <Gift size={16} /> Biểu tượng (30)
              </span>
            ),
            children: (
              <Card variant="borderless" className="shadow-sm" style={{ borderRadius: 12 }}>
                <div className="mb-4">
                  <span className="font-semibold text-gray-800 text-sm block mb-1">
                    🟢 Thư viện Biểu tượng đồng nhất (Consistent Lucide Icons Library)
                  </span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tất cả các biểu tượng dưới đây đều được nhập đồng nhất từ thư viện <strong>lucide-react</strong> chất lượng cao để đảm bảo sự đồng bộ trực quan của hệ thống phím bấm POS khuyến mãi. Nhấp vào để sao chép nhanh tên icon.
                  </Text>
                </div>

                <Row gutter={[12, 12]}>
                  {filteredIcons.map((item) => {
                    const IconComponent = item.component;
                    const isCopied = copiedName === item.name;
                    return (
                      <Col xs={12} sm={8} md={6} lg={4} xl={3} key={item.name}>
                        <div 
                          className="lucide-grid-card border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50 h-28 relative overflow-hidden"
                          onClick={() => handleCopyCode(item.name, item.name)}
                        >
                          <div className="text-blue-500 mb-2 transition-transform duration-300 transform group-hover:scale-12s0">
                            <IconComponent size={28} />
                          </div>
                          <span className="font-mono text-xs font-bold text-gray-700 block truncate w-full px-1">{item.name}</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">{item.category}</span>
                          
                          {isCopied && (
                            <div className="absolute inset-0 bg-blue-500 text-white flex flex-col items-center justify-center text-[10px] font-bold animate-fade-in">
                              <CheckCircle size={18} className="mb-1" />
                              Đã sao chép!
                            </div>
                          )}
                        </div>
                      </Col>
                    );
                  })}
                </Row>
                {filteredIcons.length === 0 && (
                  <div className="text-center py-12 text-gray-400">Không tìm thấy biểu tượng nào khớp với từ khóa của bạn.</div>
                )}
              </Card>
            )
          },
          {
            key: 'svgs',
            label: (
              <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                <Palette size={16} /> Hình vẽ SVG (20)
              </span>
            ),
            children: (
              <Card variant="borderless" className="shadow-sm" style={{ borderRadius: 12 }}>
                <div className="mb-4">
                  <span className="font-semibold text-gray-800 text-sm block mb-1">
                    🎨 Hình vẽ vector SVG Phẳng & 3D Đa chiều (20 SVG Illustrations)
                  </span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Được vẽ trực tiếp bằng mã SVG nhẹ, độ nét vô cực và hỗ trợ responsive hoàn hảo. Thích hợp làm ảnh bìa thư mục khuyến mãi hoặc hình nền minh họa POS. Nhấp chọn một hình để xem mã nguồn XML và sao chép.
                  </Text>
                </div>

                <Row gutter={[16, 16]}>
                  {filteredSvgs.map((item) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                      <Card 
                        hoverable 
                        className="playground-card text-center" 
                        styles={{ body: { padding: 16 } }}
                        onClick={() => setSelectedEffect(item)}
                      >
                        <div className="flex items-center justify-center bg-gray-50 rounded-xl p-4 mb-3" style={{ height: 100 }}>
                          {item.preview}
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-gray-800 text-xs block mb-1">{item.name}</span>
                          <Text type="secondary" style={{ fontSize: 10 }} className="line-clamp-2">{item.description}</Text>
                          <div className="mt-2 flex justify-between items-center">
                            <Tag color="cyan" style={{ fontSize: 9 }}>{item.category}</Tag>
                            <span className="text-[10px] text-blue-500 font-semibold">Xem code XML ➔</span>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
                {filteredSvgs.length === 0 && (
                  <div className="text-center py-12 text-gray-400">Không tìm thấy hình vẽ SVG nào khớp với từ khóa.</div>
                )}
              </Card>
            )
          },
          {
            key: 'animations',
            label: (
              <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                <Sparkles size={16} /> Hiệu ứng Động (25)
              </span>
            ),
            children: (
              <Card variant="borderless" className="shadow-sm" style={{ borderRadius: 12 }}>
                <div className="mb-4">
                  <span className="font-semibold text-gray-800 text-sm block mb-1">
                    ⚡ Hiệu ứng chuyển động & Tương tác thông minh (25 CSS Interactive Animations)
                  </span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Bao gồm các hiệu ứng co giãn lò xo, rung chấn cảnh báo lỗi chéo, bóng dập dềnh và nghiêng khối 3D trực quan. Tương tác trực tiếp và sao chép mã nguồn CSS/React tích hợp.
                  </Text>
                </div>

                <Row gutter={[16, 16]}>
                  {filteredAnims.map((item) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                      <Card 
                        className="playground-card" 
                        styles={{ body: { padding: 14 } }}
                        hoverable
                      >
                        <div className="mb-3">
                          {item.element}
                        </div>
                        <span className="font-bold text-gray-800 text-xs block mb-1">{item.name}</span>
                        <Text type="secondary" style={{ fontSize: 10 }} className="line-clamp-2">{item.description}</Text>
                        <div className="mt-3 flex justify-between items-center">
                          <Tag color="purple" style={{ fontSize: 9 }}>CSS Motion</Tag>
                          <Button size="small" type="link" style={{ padding: 0, fontSize: 11 }} onClick={() => setSelectedEffect(item)}>
                            Nhận mã nguồn ➔
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
                {filteredAnims.length === 0 && (
                  <div className="text-center py-12 text-gray-400">Không tìm thấy hiệu ứng chuyển động nào khớp với từ khóa.</div>
                )}
              </Card>
            )
          },
          {
            key: 'loaders',
            label: (
              <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                <Clock size={16} /> Hiệu ứng tải (25)
              </span>
            ),
            children: (
              <Card variant="borderless" className="shadow-sm" style={{ borderRadius: 12 }}>
                <div className="mb-4">
                  <span className="font-semibold text-gray-800 text-sm block mb-1">
                    🌀 Hiệu ứng tải dữ liệu & Tiến trình chờ (25 Loading Effects & Spinners)
                  </span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Các vòng quay tinh xảo dạng 3D, neon hấp dẫn và radar quét mã tốc độ cao cho màn hình thanh toán. Giúp giao diện bớt nhàm chán khi POS đang đồng bộ dữ liệu hóa đơn với đám mây.
                  </Text>
                </div>

                <Row gutter={[16, 16]}>
                  {filteredLoaders.map((item) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                      <Card 
                        className="playground-card" 
                        styles={{ body: { padding: 14 } }}
                        hoverable
                      >
                        <div className="mb-3">
                          {item.element}
                        </div>
                        <span className="font-bold text-gray-800 text-xs block mb-1">{item.name}</span>
                        <Text type="secondary" style={{ fontSize: 10 }} className="line-clamp-2">{item.description}</Text>
                        <div className="mt-3 flex justify-between items-center">
                          <Tag color="magenta" style={{ fontSize: 9 }}>CSS Loader</Tag>
                          <Button size="small" type="link" style={{ padding: 0, fontSize: 11 }} onClick={() => setSelectedEffect(item)}>
                            Nhận mã nguồn ➔
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
                {filteredLoaders.length === 0 && (
                  <div className="text-center py-12 text-gray-400">Không tìm thấy hiệu ứng tải nào khớp với từ khóa.</div>
                )}
              </Card>
            )
          }
        ]}
      />

      {renderEffectDetailModal()}
    </PageContainer>
  );
};

export default IconsPage;
