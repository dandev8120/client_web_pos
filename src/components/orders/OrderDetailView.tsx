import React, { useState } from 'react';
import { Button, Space, Divider, App, Tag, Timeline, Modal, Tooltip } from 'antd';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileTextOutlined, 
  CopyOutlined, 
  PrinterOutlined, 
  UpOutlined, 
  DownOutlined, 
  GiftOutlined, 
  TableOutlined, 
  TeamOutlined, 
  HistoryOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  SendOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  UserOutlined,
  RocketOutlined,
  NodeIndexOutlined,
  PlayCircleOutlined,
  CodeOutlined,
  CheckOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  CaretRightOutlined
} from '@ant-design/icons';
import { DataType } from './orderTypes';
import { getOrderDetailFull, generateVatLink } from './orderHelpers';
import { StatusIndicator } from './StatusIndicator';
import { PermissionGuard } from '../PermissionGuard';
import { PrintInvoice } from '../PrintInvoice';

interface OrderDetailViewProps {
  order: DataType;
  onPrint: (order: DataType) => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({ order, onPrint }) => {
  const { message } = App.useApp();
  const detail = getOrderDetailFull(order);

  const rawPromoNote = detail.rawJsonb?.promotions?.promotionNote || (order as Record<string, any>)?.promotionNote || order?.promotion || '';
  
  const parsePromoNoteLines = (note: string): string[] => {
    if (!note || note === 'Không' || note === 'N/A') return [];
    const commaParts = note.split(',');
    const lines: string[] = [];
    
    commaParts.forEach((part, idx) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      
      if (trimmed.includes('-')) {
        const subParts = trimmed.split('-');
        if (subParts.length > 1) {
          lines.push(subParts[0]);
          for (let i = 1; i < subParts.length; i++) {
            const hasMoreCommaParts = idx < commaParts.length - 1;
            const isLastSubPart = i === subParts.length - 1;
            const commaSuffix = (isLastSubPart && hasMoreCommaParts) ? ',' : '';
            lines.push(`-${subParts[i]}${commaSuffix}`);
          }
        } else {
          const commaSuffix = idx < commaParts.length - 1 ? ',' : '';
          lines.push(`${trimmed}${commaSuffix}`);
        }
      } else {
        const commaSuffix = idx < commaParts.length - 1 ? ',' : '';
        lines.push(`${trimmed}${commaSuffix}`);
      }
    });
    return lines;
  };
  
  const [collapsedCards, setCollapsedCards] = useState<{ [key: string]: boolean }>({});
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState<any | null>(null);
  const [executingStep, setExecutingStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeWireSegment, setActiveWireSegment] = useState<number | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);

  const toggleCard = (key: string) => {
    setCollapsedCards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRunFromStep = (startNum: number) => {
    if (executingStep !== null) return;
    message.loading({ content: `Đang chạy từ Bước ${startNum}...`, key: 'wf-run' });

    let curr = startNum;
    setExecutingStep(curr);

    const stepInterval = setInterval(() => {
      setCompletedSteps(prev => Array.from(new Set([...prev, curr])));
      
      if (curr < 5) {
        setActiveWireSegment(curr);
        setTimeout(() => {
          curr++;
          setExecutingStep(curr);
          setActiveWireSegment(null);
        }, 450);
      } else {
        setExecutingStep(null);
        setActiveWireSegment(null);
        clearInterval(stepInterval);
        message.success({ content: 'Hoàn tất quy trình', key: 'wf-run' });
      }
    }, 850);
  };

  const isPOSOrder = (detail?.order?.salesChannel || '').includes('POS') || String(order?.storeId || '').startsWith('ST-');

  const promotionsList = (order?.discount || 0) > 0 ? [
    { 
      name: order?.promotion && order.promotion !== 'Không' ? order.promotion : 'Chiết khấu bán lẻ tại quầy', 
      code: `PROMO-${String(order?.id || '').split('-')[2] || '001'}`, 
      value: Math.floor((order?.discount || 0) * 0.5) 
    },
    { 
      name: `Đặc quyền Thành viên ${detail.customer.memberRank}`, 
      code: 'LOYALTY-TIER-DISC', 
      value: Math.floor((order.discount || 0) * 0.3) 
    },
    { 
      name: 'Chiết khấu ưu đãi thanh toán', 
      code: 'EPAY-PROMO', 
      value: (order.discount || 0) - Math.floor((order.discount || 0) * 0.5) - Math.floor((order.discount || 0) * 0.3) 
    }
  ].filter(p => p.value > 0) : [];

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-start gap-2 sm:gap-4 py-1.5 text-xs border-b border-slate-50 last:border-0">
      <span className="text-slate-400 shrink-0 font-medium">{label}</span>
      <span className="text-slate-700 font-semibold text-right break-words max-w-[65%]">{value}</span>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quick Top Actions Header Card */}
      <div className="bg-white rounded-xl border border-slate-100 p-3.5 sm:p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold">Đồng bộ SAP:</span>
            <StatusIndicator status={order.sapStatus} type="sap" />
          </div>
          <Divider type="vertical" className="bg-slate-200 h-4 hidden sm:inline-block" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold">Trạng thái:</span>
            <StatusIndicator status={order.status} type="order" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <PermissionGuard buttonCode="sales.orders.btn_export">
            <Button 
              icon={<CopyOutlined />} 
              onClick={() => {
                const link = generateVatLink(order);
                navigator.clipboard.writeText(link);
                message.success('Đã sao chép liên kết xuất hóa đơn VAT!');
              }}
              className="hover:border-blue-500 hover:text-blue-500 text-xs flex-1 sm:flex-initial"
            >
              Copy Link VAT
            </Button>
          </PermissionGuard>

          <PermissionGuard buttonCode="sales.orders.btn_export">
            <Button 
              type="primary" 
              className="bg-blue-600 hover:bg-blue-700 font-medium text-xs flex-1 sm:flex-initial" 
              icon={<FileTextOutlined />}
              onClick={() => {
                const link = generateVatLink(order);
                window.open(link, '_blank');
              }}
            >
              Mở cổng VAT
            </Button>
          </PermissionGuard>

          <PermissionGuard buttonCode="sales.orders.btn_print">
            <Button 
              icon={<PrinterOutlined />}
              type="primary"
              className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-xs flex-1 sm:flex-initial"
              onClick={() => {
                setIsPrintOpen(true);
                if (onPrint) onPrint(order);
              }}
            >
              In Hóa Đơn
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column - Invoice & Items details (8 out of 12) */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* 1. Hóa Đơn Bán Lẻ Centric Document Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div 
              className="flex justify-between items-center px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-100 cursor-pointer select-none"
              onClick={() => toggleCard('invoiceMeta')}
            >
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-blue-600 text-base" />
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Thông tin hóa đơn chứng từ</span>
              </div>
              <Button 
                type="text" 
                size="small" 
                icon={collapsedCards.invoiceMeta ? <DownOutlined /> : <UpOutlined />} 
                onClick={(e) => { e.stopPropagation(); toggleCard('invoiceMeta'); }}
              />
            </div>

            <AnimatePresence initial={false}>
              {!collapsedCards.invoiceMeta && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 sm:p-6 border-t border-slate-100 space-y-4 sm:space-y-6">
                    {/* Store Header & Receipt Header Info */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-100">
                      {/* Store info - Hóa đơn bán lẻ */}
                      <div className="space-y-2 max-w-full md:max-w-md">
                        <div className="flex items-center gap-3">
                          <img src={detail.store.logo} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">Hóa đơn bán lẻ</h3>
                            <p className="text-[11px] text-slate-400 font-semibold">{detail.store.name}</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 space-y-1.5 pt-1">
                          <div><span className="font-semibold text-slate-600">Số chứng từ:</span> <span className="font-mono font-bold text-blue-600">{detail.order.orderId}</span></div>
                          <div><span className="font-semibold text-slate-600">Tên công ty:</span> {detail.store.name}</div>
                          <div><span className="font-semibold text-slate-600">Địa chỉ:</span> {detail.store.address}</div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <div><span className="font-semibold text-slate-600">MST:</span> {detail.store.taxCode}</div>
                            <div><span className="font-semibold text-slate-600">Mã HĐ:</span> {detail.store.invoiceCode}</div>
                          </div>
                        </div>
                      </div>

                      {/* Receipt Meta Info - Phiếu thu */}
                      <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-100/80 space-y-2 w-full md:w-72 shrink-0">
                        <div className="text-xs font-bold text-slate-700 border-b border-slate-200/60 pb-1.5 mb-2 uppercase tracking-wide flex justify-between items-center">
                          <span>Phiếu thu</span>
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-semibold">{detail.receiptVoucher.voucherType}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Loại hình:</span>
                          <span className="font-semibold text-slate-700">{detail.receiptVoucher.voucherType}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Tên vụ việc:</span>
                          <span className="font-mono font-medium text-slate-700">{detail.receiptVoucher.caseCode}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Số chứng từ:</span>
                          <span className="font-mono font-bold text-blue-600">{detail.receiptVoucher.documentNo}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Uuid:</span>
                          <span className="font-mono text-[10px] text-slate-600 truncate max-w-[150px]" title={detail.receiptVoucher.uuid}>{detail.receiptVoucher.uuid}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Số hóa đơn:</span>
                          <span className="font-mono font-bold text-slate-800">{detail.order.invoiceNo || 'Chưa phát hành'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Kênh bán:</span>
                          <span className="font-semibold text-slate-700">{detail.receiptVoucher.salesChannel}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Thời gian:</span>
                          <span className="font-semibold text-slate-600">{detail.receiptVoucher.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer & VAT / Invoice Info blocks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                      {/* Customer block */}
                      <div className="space-y-2 sm:space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Thông tin khách hàng</h4>
                        <div className="space-y-1 text-xs">
                          <DetailRow label="Mã khách hàng" value={<span className="font-mono text-slate-700">{detail.customer.customerId}</span>} />
                          <DetailRow label="Tên khách hàng" value={<span className="font-bold text-slate-800">{detail.customer.fullName}</span>} />
                          <DetailRow label="Số điện thoại" value={detail.customer.phone} />
                          <DetailRow label="Email liên hệ" value={detail.customer.email === 'Không có dữ liệu' ? <span className="text-slate-400 italic">Không có dữ liệu</span> : detail.customer.email} />
                          <DetailRow label="Quận / Huyện" value={detail.customer.address === 'Không có dữ liệu' ? <span className="text-slate-400 italic">Không có dữ liệu</span> : detail.customer.address} />
                          <DetailRow label="Ngày đăng ký" value={detail.rawJsonb?.customer?.registrationDate ? String(detail.rawJsonb.customer.registrationDate).replace('T', ' ') : <span className="text-slate-400 italic">Không có dữ liệu</span>} />
                          <DetailRow label="Hạng thành viên" value={
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              detail.customer.memberRank === 'Platinum' || detail.customer.memberRank === 'Kim cương' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              detail.customer.memberRank === 'Vàng' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>{detail.customer.memberRank}</span>
                          } />
                        </div>
                      </div>

                      {/* Invoice & Buyer block */}
                      <div className="space-y-2 sm:space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Thông tin xuất hóa đơn (Invoice Info)</h4>
                        <div className="space-y-1 text-xs">
                          <DetailRow label="Tên người mua" value={detail.vat.fullName === 'Không có dữ liệu' ? <span className="text-slate-400 italic">Không có dữ liệu</span> : detail.vat.fullName} />
                          <DetailRow label="Tên đơn vị mua" value={detail.vat.companyName === 'Không có dữ liệu' ? <span className="text-slate-400 italic">Không có dữ liệu</span> : detail.vat.companyName} />
                          <DetailRow label="Mã số thuế" value={detail.vat.taxCode === 'Không có dữ liệu' ? <span className="text-slate-400 italic">Không có dữ liệu</span> : <span className="font-mono text-slate-700">{detail.vat.taxCode}</span>} />
                          <DetailRow label="Địa chỉ HĐ" value={detail.vat.companyAddress === 'Không có dữ liệu' ? <span className="text-slate-400 italic">Không có dữ liệu</span> : detail.vat.companyAddress} />
                          <DetailRow label="SĐT người mua" value={detail.vat.phone === 'Không có dữ liệu' ? <span className="text-slate-400 italic">Không có dữ liệu</span> : detail.vat.phone} />
                          <DetailRow label="Email nhận HĐ" value={detail.vat.invoiceEmail === 'Không có dữ liệu' ? <span className="text-slate-400 italic">Không có dữ liệu</span> : detail.vat.invoiceEmail} />
                          <DetailRow label="Mã đối tượng" value={detail.vat.enterpriseRelCode ? <span className="font-mono text-slate-700">{detail.vat.enterpriseRelCode}</span> : <span className="text-slate-400 italic">Không có dữ liệu</span>} />
                        </div>
                      </div>
                    </div>

                    {!isPOSOrder && (
                      <div className="pt-3 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2">Thông tin giao hàng vận chuyển</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <DetailRow label="Người nhận hàng" value={detail.delivery.recipientName} />
                            <DetailRow label="Số điện thoại" value={detail.delivery.recipientPhone} />
                            <DetailRow label="Đơn vị vận chuyển" value={detail.delivery.carrier} />
                          </div>
                          <div className="space-y-1">
                            <DetailRow label="Địa chỉ giao" value={detail.delivery.deliveryAddress} />
                            <DetailRow label="Mã vận đơn" value={<span className="font-mono text-slate-700">{detail.delivery.trackingNo}</span>} />
                            <DetailRow label="Phí giao" value={detail.delivery.shippingFee} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Products List Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div 
              className="flex justify-between items-center px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-100 cursor-pointer select-none"
              onClick={() => toggleCard('products')}
            >
              <div className="flex items-center gap-2">
                <TableOutlined className="text-blue-600 text-base" />
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Danh sách chi tiết mặt hàng</span>
              </div>
              <Button 
                type="text" 
                size="small" 
                icon={collapsedCards.products ? <DownOutlined /> : <UpOutlined />} 
                onClick={(e) => { e.stopPropagation(); toggleCard('products'); }}
              />
            </div>

            <AnimatePresence initial={false}>
              {!collapsedCards.products && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 sm:p-6 border-t border-slate-100 space-y-4 sm:space-y-6">
                    {/* Responsive table wrapper for touch devices */}
                    <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white w-full">
                      <table className="w-full text-left border-collapse text-xs min-w-[650px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                            <th className="p-3">Mặt hàng</th>
                            <th className="p-3">SKU / Barcode</th>
                            <th className="p-3 text-center">Phân loại / Kích cỡ</th>
                            <th className="p-3 text-center">ĐVT</th>
                            <th className="p-3 text-center">Số lượng</th>
                            <th className="p-3 text-right">Đơn giá</th>
                            <th className="p-3 text-right">Chiết khấu SP</th>
                            <th className="p-3 text-right">VAT (10%)</th>
                            <th className="p-3 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                          {detail.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-800 text-xs">{item.productName}</td>
                              <td className="p-3 font-mono text-slate-400 leading-tight">
                                <div>SKU: {item.sku}</div>
                                <div>BC: {item.barcode}</div>
                              </td>
                              <td className="p-3 text-center font-mono text-[11px]">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 mr-1">{item.category}</span>
                                <span className="bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded">{item.size} / {item.color}</span>
                              </td>
                              <td className="p-3 text-center text-slate-500">{item.unit}</td>
                              <td className="p-3 text-center font-bold text-slate-800 text-xs">{item.quantity}</td>
                              <td className="p-3 text-right font-semibold text-slate-700">{item.price.toLocaleString('vi-VN')} đ</td>
                              <td className="p-3 text-right text-rose-500 font-semibold">-{item.discount.toLocaleString('vi-VN')} đ</td>
                              <td className="p-3 text-right text-slate-500">{item.vat.toLocaleString('vi-VN')} đ</td>
                              <td className="p-3 text-right font-bold text-blue-600 text-xs">{item.total.toLocaleString('vi-VN')} đ</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Calculations & Multiple Promotions Panel */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6 pt-4 border-t border-slate-100">
                      {/* Multiple Promotions block */}
                      <div className="w-full md:max-w-md space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="flex items-center gap-1.5">
                            <GiftOutlined className="text-rose-500 animate-bounce" />
                            <span>Khuyến mại & Chiết khấu chi tiết</span>
                          </span>
                          {rawPromoNote && (
                            <Button
                              type="text"
                              size="small"
                              icon={<CopyOutlined className="text-xs text-rose-500 hover:text-rose-700" />}
                              onClick={() => {
                                const textToCopy = parsePromoNoteLines(rawPromoNote).join('\n');
                                navigator.clipboard.writeText(textToCopy);
                                message.success('Đã sao chép danh sách mã khuyến mãi!');
                              }}
                              className="p-0 text-[10px] text-rose-600 font-semibold hover:bg-rose-50 px-1.5 rounded"
                            >
                              Sao chép mã
                            </Button>
                          )}
                        </h4>
                        
                        {/* Render rawPromoNote formatted line-by-line if available */}
                        {parsePromoNoteLines(rawPromoNote).length > 0 ? (
                          <div className="bg-rose-50/70 text-rose-900 p-3 rounded-xl border border-rose-200/80 font-mono text-xs space-y-1 shadow-sm">
                            <div className="text-[10px] uppercase text-rose-700 font-sans font-bold border-b border-rose-200/60 pb-1 mb-1.5 flex justify-between">
                              <span>Mã Khuyến Mãi Áp Dụng:</span>
                              <span className="text-rose-600 font-semibold">{parsePromoNoteLines(rawPromoNote).length} dòng</span>
                            </div>
                            <div className="space-y-0.5 select-all">
                              {parsePromoNoteLines(rawPromoNote).map((line, idx) => (
                                <div key={idx} className="hover:bg-rose-100/70 px-1.5 py-0.5 rounded text-rose-800 font-medium tracking-wide">
                                  {line}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : promotionsList.length > 0 ? (
                          <div className="space-y-2">
                            {promotionsList.map((promo, idx) => (
                              <div key={idx} className="bg-rose-50/40 hover:bg-rose-50 border border-rose-100/50 rounded-lg p-3 flex justify-between items-center text-xs transition-colors">
                                <div>
                                  <div className="font-bold text-rose-700">{promo.name}</div>
                                  <div className="text-[10px] text-rose-400 font-mono mt-0.5">Mã: {promo.code}</div>
                                </div>
                                <span className="text-rose-600 font-bold">-{promo.value.toLocaleString('vi-VN')} đ</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-slate-400 italic text-xs py-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center w-full">
                            Hóa đơn không sử dụng mã khuyến mãi.
                          </div>
                        )}
                      </div>

                      {/* Right Side: Totals Summary block */}
                      <div className="w-full md:w-80 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Tạm tính hóa đơn:</span>
                          <span className="text-slate-700 font-semibold">{detail.totals.subtotal}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between py-1 border-b border-slate-50 text-rose-600">
                            <span className="font-medium">Tổng giảm giá:</span>
                            <span className="font-bold">-{detail.totals.discountTotal}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Cộng tiền thuế GTGT (VAT):</span>
                          <span className="text-slate-700 font-semibold">{detail.totals.vatTotal}</span>
                        </div>
                        <div className="border-t border-dashed border-slate-200 pt-3 my-2 flex justify-between items-center">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">TỔNG CỘNG THANH TOÁN:</span>
                          <span className="text-blue-600 font-extrabold text-sm sm:text-base">{detail.totals.totalAmount}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100/80">
                          <span className="font-semibold text-slate-600">Bằng chữ:</span> {detail.rawJsonb?.receiptTotals?.totalAmountWithTaxInWords || 'Không có dữ liệu'}
                        </div>
                        
                        <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100/80 mt-3 space-y-2">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex justify-between items-center">
                            <span>Phân rã Thanh toán (Split Payment)</span>
                            <span className="font-mono text-blue-600 bg-blue-50 px-1 py-0.2 rounded text-[8px]">Hỗn Hợp</span>
                          </div>
                          {detail.payment.splits && detail.payment.splits.length > 0 ? (
                            <div className="space-y-1.5 border-b border-dashed border-slate-100 pb-2">
                              {detail.payment.splits.map((s, sIdx) => (
                                <div key={sIdx} className="flex justify-between items-center text-xs">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-700">{s.method}</span>
                                    {s.reference !== 'N/A' && <span className="text-[9px] text-slate-400 font-mono">Ref: {s.reference}</span>}
                                  </div>
                                  <span className="font-bold text-slate-800">{s.amount.toLocaleString('vi-VN')} đ</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex justify-between border-b border-dashed border-slate-100 pb-2 text-xs">
                              <span className="text-slate-400">Hình thức thanh toán:</span>
                              <span className="font-bold text-slate-700">{detail.payment.method}</span>
                            </div>
                          )}
                          <div className="pt-1.5 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Khách đã thanh toán:</span>
                              <span className="font-bold text-blue-600">{detail.payment.amountPaid}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Tiền thối lại:</span>
                              <span className="font-semibold text-slate-800">{detail.payment.changeAmount}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-dashed border-slate-200 text-xs">
                              <span className="text-slate-400">Trạng thái:</span>
                              <span className="font-bold text-emerald-600">{detail.payment.paymentStatus}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column - Management & Operation Logs (4 out of 12) */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* 3. Internal Management Info Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div 
              className="flex justify-between items-center px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-100 cursor-pointer select-none"
              onClick={() => toggleCard('management')}
            >
              <div className="flex items-center gap-2">
                <TeamOutlined className="text-blue-600 text-base" />
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Thông tin bán hàng & Ca kíp</span>
              </div>
              <Button 
                type="text" 
                size="small" 
                icon={collapsedCards.management ? <DownOutlined /> : <UpOutlined />} 
                onClick={(e) => { e.stopPropagation(); toggleCard('management'); }}
              />
            </div>

            <AnimatePresence initial={false}>
              {!collapsedCards.management && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 sm:p-5 border-t border-slate-100 space-y-1 text-xs">
                    <DetailRow label="Ngày chứng từ" value={detail.rawJsonb?.activity_log?.receipt?.receiptDate || detail.rawJsonb?.activityLog?.receipt?.receiptDate || detail.receiptVoucher.createdAt} />
                    <DetailRow label="Thu ngân" value={detail.employees.cashier} />
                    <DetailRow label="NV bán hàng" value={detail.employees.salesStaff} />
                    <DetailRow label="Mã ca kíp" value={detail.employees.workShift} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Multi-Stage Workflow Activity Log Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div 
              className="flex justify-between items-center px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-100 cursor-pointer select-none"
              onClick={() => toggleCard('logs')}
            >
              <div className="flex items-center gap-2">
                <NodeIndexOutlined className="text-blue-600 text-base" />
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Tiến trình Workflow & Nhật ký hoạt động</span>
              </div>
              <Button 
                type="text" 
                size="small" 
                icon={collapsedCards.logs ? <DownOutlined /> : <UpOutlined />} 
                onClick={(e) => { e.stopPropagation(); toggleCard('logs'); }}
              />
            </div>

            <AnimatePresence initial={false}>
              {!collapsedCards.logs && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-3 sm:p-5 border-t border-slate-200/80 bg-white rounded-b-xl relative overflow-hidden">
                    {/* n8n Node Workflow Canvas */}
                    {(() => {
                      const actLog = detail.rawJsonb?.activity_log || detail.rawJsonb?.activityLog || {};
                      const receipt = actLog.receipt || {};
                      const payment = actLog.payment || {};
                      const invoice = actLog.invoice || {};
                      const billPrinting = actLog.billPrinting || {};
                      const sapSync = actLog.sapSync || {};

                      const steps = [
                        {
                          key: 'receipt',
                          num: 1,
                          title: 'Khởi tạo chứng từ',
                          nodeType: 'n8n Webhook Trigger',
                          headerBg: 'bg-[#FF6D5A]',
                          badgeText: 'TRIGGER',
                          icon: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                            </svg>
                          ),
                          statusText: '200 OK',
                          isSuccess: true,
                          rawPayload: receipt,
                          subItems: [
                            { label: 'Ngày chứng từ', time: receipt.receiptDate || detail.receiptVoucher.createdAt }
                          ]
                        },
                        {
                          key: 'payment',
                          num: 2,
                          title: 'Thanh toán Gateway',
                          nodeType: 'HTTP Request (Payment)',
                          headerBg: 'bg-blue-600',
                          badgeText: 'ACTION',
                          icon: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                              <line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                          ),
                          statusText: '200 OK',
                          isSuccess: true,
                          rawPayload: payment,
                          subItems: [
                            { label: 'Khởi tạo', time: payment.createdAt || detail.history.systemLogs.paymentTime },
                            { label: 'Xác nhận', time: payment.lastUpdatedAt || payment.createdAt }
                          ]
                        },
                        {
                          key: 'invoice',
                          num: 3,
                          title: 'Phát hành Hóa đơn VAT',
                          nodeType: 'E-Invoice API Connector',
                          headerBg: 'bg-purple-600',
                          badgeText: 'ACTION',
                          icon: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10 9 9 9 8 9"/>
                            </svg>
                          ),
                          statusText: '200 OK',
                          isSuccess: true,
                          rawPayload: invoice,
                          subItems: [
                            { label: 'Khởi tạo', time: invoice.createdAt || detail.history.systemLogs.createdTime },
                            { label: 'Yêu cầu', time: invoice.entryDate || detail.history.systemLogs.eInvoiceSentTime },
                            { label: 'Kết quả', time: invoice.lastUpdatedAt || invoice.updatedAt }
                          ]
                        },
                        {
                          key: 'billPrinting',
                          num: 4,
                          title: 'In phiếu hóa đơn bill',
                          nodeType: 'Print Service Queue',
                          headerBg: 'bg-cyan-600',
                          badgeText: 'ACTION',
                          icon: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 6 2 18 2 18 9"/>
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                              <rect x="6" y="14" width="12" height="8"/>
                            </svg>
                          ),
                          statusText: '200 OK',
                          isSuccess: true,
                          rawPayload: billPrinting,
                          subItems: [
                            { label: 'Thời gian in', time: billPrinting.printedDate || detail.receiptVoucher.createdAt }
                          ]
                        },
                        {
                          key: 'sapSync',
                          num: 5,
                          title: 'Đồng bộ SAP ERP System',
                          nodeType: 'SAP Enterprise Node',
                          headerBg: (sapSync.status === true || order.sapStatus === 'sync') ? 'bg-emerald-600' : 'bg-rose-600',
                          badgeText: 'INTEGRATION',
                          icon: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={(sapSync.status === false && order.sapStatus !== 'sync') ? 'animate-spin' : ''}>
                              <polyline points="23 4 23 10 17 10"/>
                              <polyline points="1 20 1 14 7 14"/>
                              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                            </svg>
                          ),
                          statusText: (sapSync.status === true || order.sapStatus === 'sync') ? '200 OK' : '500 ERROR',
                          isSuccess: (sapSync.status === true || order.sapStatus === 'sync'),
                          rawPayload: sapSync,
                          subItems: [
                            { label: 'Trạng thái', time: (sapSync.status === true || order.sapStatus === 'sync') ? 'Đã đồng bộ' : 'Chờ đồng bộ' },
                            { label: 'Thời gian sync', time: sapSync.createdTime || detail.history.systemLogs.sapSyncTime }
                          ]
                        }
                      ];

                      return (
                        <div className="relative max-w-2xl mx-auto py-2">
                          {/* n8n Connected Cable Line - Starts at Center of Node 1 (top-7 = 28px) and ends at Center of Node 5 (bottom-7 = 28px), aligned at dead-center x=20px */}
                          <div className="absolute left-[20px] top-[28px] bottom-[28px] w-[5px] -translate-x-1/2 z-0 rounded-full overflow-hidden bg-slate-200 shadow-inner">
                            {/* n8n Wire Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#FF6D5A] via-blue-500 via-purple-500 via-cyan-500 to-emerald-500 opacity-90" />
                            
                            {/* Animated Flowing Signal Particle along the cable */}
                            <motion.div 
                              className="absolute left-0 right-0 h-10 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,1)] z-10"
                              initial={{ top: '-15%' }}
                              animate={{ top: ['-15%', '115%'] }}
                              transition={{ 
                                duration: executingStep !== null ? 1.0 : 3.0, 
                                repeat: Infinity, 
                                ease: 'easeInOut' 
                              }}
                            />
                          </div>

                          {/* Render n8n Node Cards Stack */}
                          <div className="space-y-6 relative z-10">
                            {steps.map((step) => {
                              const isExecuting = executingStep === step.num;

                              return (
                                <motion.div 
                                  key={step.key}
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="relative flex items-center gap-4 group"
                                >
                                  {/* Left Node Handle Pin & Icon */}
                                  <div className="relative shrink-0 z-20">
                                    <Tooltip title={`Bấm để test chạy từ Step ${step.num}`} placement="right">
                                      <button 
                                        onClick={() => handleRunFromStep(step.num)}
                                        className={`w-10 h-10 rounded-xl ${step.headerBg} flex items-center justify-center cursor-pointer shadow-md hover:scale-110 active:scale-95 transition-all duration-200 border-2 ${isExecuting ? 'border-amber-300 ring-4 ring-amber-200 animate-pulse' : 'border-white'}`}
                                      >
                                        {isExecuting ? (
                                          <SyncOutlined spin className="text-white text-base animate-spin" />
                                        ) : (
                                          step.icon
                                        )}
                                      </button>
                                    </Tooltip>

                                    {/* n8n Output Connection Port Pin */}
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-2xs z-30 group-hover:bg-[#FF6D5A] transition-colors" />
                                    {/* n8n Input Connection Port Pin */}
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-2xs z-30 group-hover:bg-[#FF6D5A] transition-colors" />
                                  </div>

                                  {/* n8n Node Card UI */}
                                  <div 
                                    className={`flex-1 bg-white rounded-xl border ${isExecuting ? 'border-amber-400 ring-2 ring-amber-200 shadow-lg' : 'border-slate-200/90'} shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden`}
                                  >
                                    {/* Node Card Body */}
                                    <div className="p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-slate-800">
                                            Step {step.num}: {step.title}
                                          </span>
                                        </div>
                                        <div className="mt-1 space-y-0.5">
                                          {step.subItems.map((sub, sIdx) => sub.time ? (
                                            <p key={sIdx} className="text-[11px] text-slate-500 m-0 flex items-center gap-1.5 font-mono">
                                              <span className="text-slate-400">{sub.label}:</span>
                                              <span className="font-semibold text-slate-700">{sub.time}</span>
                                            </p>
                                          ) : null)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. JSON Chi tiết Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div 
              className="flex justify-between items-center px-4 sm:px-5 py-3.5 bg-slate-900 text-white cursor-pointer select-none"
              onClick={() => toggleCard('terminal')}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 mr-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                </div>
                <CodeOutlined className="text-emerald-400 text-base" />
                <span className="font-bold text-slate-100 text-xs uppercase tracking-wider font-mono">Dữ liệu JSON Chi tiết</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  type="text"
                  icon={<CopyOutlined className="text-slate-300 text-xs" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    const jsonStr = JSON.stringify(detail.rawJsonb || order, null, 2);
                    navigator.clipboard.writeText(jsonStr);
                    message.success('Đã sao chép toàn bộ dữ liệu JSON!');
                  }}
                  className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-mono border border-slate-700/80 rounded px-2"
                >
                  Sao chép
                </Button>
                <Button 
                  type="text" 
                  size="small" 
                  icon={collapsedCards.terminal ? <DownOutlined className="text-slate-300" /> : <UpOutlined className="text-slate-300" />} 
                  onClick={(e) => { e.stopPropagation(); toggleCard('terminal'); }}
                />
              </div>
            </div>

            <AnimatePresence initial={false}>
              {!collapsedCards.terminal && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-[#0D1117] p-4 text-xs font-mono relative">
                    <pre className="text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[480px] p-3 rounded-lg bg-slate-950/90 border border-slate-800/90 shadow-inner select-all whitespace-pre">
                      {JSON.stringify(detail.rawJsonb || order, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <PrintInvoice 
        open={isPrintOpen} 
        onClose={() => setIsPrintOpen(false)} 
        order={order}
        siteCode={order.storeId || (order as any).siteCode || '1134'}
        receiptNumber={order.id || (order as any).receiptNumber || ''}
      />
    </div>
  );
};
