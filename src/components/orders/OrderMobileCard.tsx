import React from 'react';
import { Button, Dropdown, MenuProps, Tag } from 'antd';
import { 
  ClockCircleOutlined, 
  EyeOutlined, 
  PrinterOutlined, 
  MoreOutlined, 
  DownloadOutlined, 
  DeleteOutlined,
  CopyOutlined,
  UserOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import { DataType } from './orderTypes';
import { StatusIndicator } from './StatusIndicator';
import { formatOrderRowToText, parsePaymentDetails } from './orderHelpers';
import { message } from '../../services/toastMessage';

interface OrderMobileCardProps {
  item: DataType;
  onOpenDetail: (record: DataType) => void;
  onPrint: (record: DataType) => void;
  onDelete: (record: DataType) => void;
}

export const OrderMobileCard: React.FC<OrderMobileCardProps> = ({
  item,
  onOpenDetail,
  onPrint,
  onDelete,
}) => {
  const handleCopyText = () => {
    const textToCopy = formatOrderRowToText(item);
    navigator.clipboard.writeText(textToCopy);
    message.success(`Đã sao chép toàn bộ dữ liệu dòng chứng từ [${item.id}] dạng text!`);
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'view') {
      onOpenDetail(item);
    } else if (key === 'copy') {
      handleCopyText();
    } else if (key === 'delete') {
      onDelete(item);
    } else if (key === 'download') {
      if (item.invoiceNo !== 'Chưa xuất') {
        window.open(`/api/vat/download?oid=${item.id}&sid=${item.storeId}&rid=${item.rid}&sig=mock_sig&a=${item.total}&ct=VND`, '_blank');
        message.success('Đang tải hóa đơn VAT PDF...');
      } else {
        message.warning('Đơn hàng chưa đăng ký xuất hóa đơn VAT.');
      }
    } else if (key === 'print') {
      onPrint(item);
    }
  };

  const menuItems: MenuProps['items'] = [
    { key: 'view', label: 'Xem chi tiết', icon: <EyeOutlined className="text-blue-600" /> },
    { key: 'copy', label: 'Copy dòng dữ liệu (Text)', icon: <CopyOutlined className="text-emerald-600" /> },
    { key: 'print', label: 'In hóa đơn', icon: <PrinterOutlined className="text-slate-600" /> },
    { key: 'download', label: 'Tải hóa đơn (PDF)', icon: <DownloadOutlined className="text-indigo-600" /> },
    { type: 'divider' },
    { key: 'delete', label: 'Xóa đơn', icon: <DeleteOutlined />, danger: true },
  ];

  const qrList = item.qrDetails && item.qrDetails.length > 0 
    ? item.qrDetails 
    : (item.qrTransactionId && item.qrTransactionId !== 'N/A' ? [item.qrTransactionId] : []);

  return (
    <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-3.5 sm:p-4 shadow-sm hover:shadow transition-all space-y-3">
      {/* Header: Order ID & Status Badges */}
      <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-100 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-bold text-blue-600 text-sm sm:text-base">{item.id}</span>
            <Tag color="blue" className="font-mono text-[10px] m-0">{item.storeId}</Tag>
            <StatusIndicator status={item.sapStatus} type="sap" />
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <ClockCircleOutlined />
            <span>{item.time}</span>
            <span className="mx-1">•</span>
            <Tag className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 m-0">{item.shiftName || 'Ca Sáng'}</Tag>
          </div>
        </div>
        <StatusIndicator status={item.status} type="order" />
      </div>

      {/* Customer & Employee Info */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
        <div>
          <span className="text-slate-400 text-[10px] block font-medium">Khách hàng:</span>
          <span className="font-semibold text-slate-800 truncate block">{item.customer}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <Tag className="text-[9px] px-1 py-0 border-blue-200 text-blue-700 bg-blue-50 font-mono m-0">{item.customerCode || 'KH000'}</Tag>
            <span className="text-[10px] text-slate-500">{item.phone}</span>
          </div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block font-medium">Nhân viên & Vụ việc:</span>
          <span className="font-medium text-slate-700 block truncate">{item.employee}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <Tag className="text-[9px] px-1 py-0 text-slate-600 bg-slate-200 border-slate-300 m-0 font-mono">{item.employeeCode || 'NV000'}</Tag>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1 rounded">{item.caseCode || 'PXHH'}</span>
          </div>
        </div>
      </div>

      {/* Invoice No & QR Transaction ID */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-sky-50/50 p-2.5 rounded-lg border border-sky-100/80">
        <div>
          <span className="text-slate-400 text-[10px] block">Số hóa đơn:</span>
          <span className="font-mono text-slate-700 font-semibold text-[11px]">{item.invoiceNo}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block font-medium">Mã QR thanh toán:</span>
          {(() => {
            const payment = parsePaymentDetails(item);
            if (!payment.hasInfo) return <span className="text-slate-400 text-[11px]">N/A</span>;
            return (
              <div className="space-y-1 mt-0.5 text-[10px] font-mono">
                {(payment.paymentMethod || payment.bankCode) && (
                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                    <QrcodeOutlined className="text-sky-600 shrink-0" />
                    <span className="truncate">{payment.paymentMethod}{payment.bankCode ? ` / ${payment.bankCode}` : ''}</span>
                  </div>
                )}
                {payment.transactionCode && (
                  <div className="text-sky-900 bg-sky-100/80 px-1.5 py-0.5 rounded flex items-center justify-between">
                    <span className="font-bold truncate">{payment.transactionCode}</span>
                  </div>
                )}
                {payment.transactionStatus && (
                  <Tag color={payment.transactionStatus === 'SUCCESS' ? 'green' : 'red'} className="text-[9px] px-1 py-0 m-0">
                    {payment.transactionStatus}
                  </Tag>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Totals & Discounts */}
      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
        <div>
          <span className="text-slate-400 text-[10px] block">Thực thu ({item.quantity || 1} SP):</span>
          <span className="text-blue-600 font-extrabold text-sm sm:text-base">
            {item.total.toLocaleString('vi-VN')} ₫
          </span>
        </div>
        {(item.discount > 0 || item.lineDiscount > 0) && (
          <div className="text-right">
            <span className="text-slate-400 text-[10px] block">
              Chiết khấu: {(item.lineDiscount || 0).toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-rose-500 font-semibold text-xs block">
              Giảm giá: -{item.discount.toLocaleString('vi-VN')} ₫
            </span>
          </div>
        )}
      </div>

      {/* Promotions note tag if present */}
      {item.discountsList && item.discountsList.length > 0 && (
        <div className="text-[10px] bg-rose-50 border border-rose-100 text-rose-700 p-1.5 rounded-lg space-y-0.5">
          <span className="font-semibold block">Chương trình khuyến mại / Voucher:</span>
          {item.discountsList.map((d, i) => (
            <div key={i} className="font-mono truncate">• {d}</div>
          ))}
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Button 
          type="primary" 
          size="small"
          icon={<EyeOutlined />}
          className="bg-blue-600 text-xs font-semibold flex-1 rounded-lg h-8"
          onClick={() => onOpenDetail(item)}
        >
          Chi tiết
        </Button>
        <Button 
          size="small"
          icon={<CopyOutlined />}
          className="text-xs font-medium border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg h-8"
          onClick={handleCopyText}
        >
          Copy text
        </Button>
        <Button 
          size="small"
          icon={<PrinterOutlined />}
          className="text-xs font-medium border-slate-200 hover:text-emerald-600 hover:border-emerald-300 rounded-lg h-8"
          onClick={() => onPrint(item)}
        >
          In
        </Button>
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']} placement="bottomRight">
          <Button size="small" shape="circle" icon={<MoreOutlined />} className="text-slate-500 h-8 w-8" />
        </Dropdown>
      </div>
    </div>
  );
};
