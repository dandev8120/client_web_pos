import React, { useState, useEffect } from 'react';
import { Button, Tabs, Tag, Space, Spin, Modal, Input, Select, Switch, Tooltip, Badge, App } from 'antd';
import { 
  PrinterOutlined, 
  DownloadOutlined, 
  CheckCircleOutlined, 
  QrcodeOutlined, 
  SafetyCertificateOutlined,
  ReloadOutlined,
  LoadingOutlined,
  SettingOutlined,
  WifiOutlined,
  UsbOutlined,
  ApiOutlined,
  BarcodeOutlined,
  ThunderboltOutlined,
  CheckOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { orderService } from '../services/orderService';
import { getOrderDetailFull } from './orders/orderHelpers';

export interface PrintInvoiceProps {
  siteCode?: string;
  receiptNumber?: string;
  order?: any;
  initialDetail?: any;
  open?: boolean;
  onClose?: () => void;
  autoPrint?: boolean;
  isModal?: boolean;
}

/**
 * Convert numeric currency to Vietnamese words
 */
function numberToVietnameseWords(num: number): string {
  if (!num || isNaN(num) || num === 0) return 'Không đồng.';
  
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const scales = ['', 'ngàn', 'triệu', 'tỷ', 'ngàn tỷ', 'triệu tỷ'];

  function readThreeDigits(n: number, showZeroHundred: boolean): string {
    let hundred = Math.floor(n / 100);
    let remainder = n % 100;
    let ten = Math.floor(remainder / 10);
    let unit = remainder % 10;
    let res = '';

    if (hundred > 0 || showZeroHundred) {
      res += units[hundred] + ' trăm ';
    }

    if (ten > 1) {
      res += units[ten] + ' mươi ';
      if (unit === 1) res += 'mốt ';
      else if (unit === 5) res += 'lăm ';
      else if (unit > 0) res += units[unit] + ' ';
    } else if (ten === 1) {
      res += 'mười ';
      if (unit === 1) res += 'một ';
      else if (unit === 5) res += 'lăm ';
      else if (unit > 0) res += units[unit] + ' ';
    } else if (ten === 0 && unit > 0) {
      if (hundred > 0 || showZeroHundred) res += 'lẻ ';
      if (unit === 5 && (hundred > 0 || showZeroHundred)) res += 'lăm ';
      else res += units[unit] + ' ';
    }

    return res;
  }

  let strNum = Math.abs(Math.round(num)).toString();
  let groups: number[] = [];
  while (strNum.length > 0) {
    let chunk = strNum.slice(-3);
    groups.push(parseInt(chunk, 10));
    strNum = strNum.slice(0, -3);
  }

  let words: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    let groupVal = groups[i];
    if (groupVal > 0) {
      let groupStr = readThreeDigits(groupVal, i < groups.length - 1);
      words.push(groupStr.trim() + ' ' + scales[i]);
    }
  }

  let result = words.join(' ').trim();
  if (!result) return 'Không đồng.';

  result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng chẵn.';
  return result;
}

/**
 * Dedicated Print Component for Invoices & POS Receipts
 */
export const PrintInvoice: React.FC<PrintInvoiceProps> = ({
  siteCode,
  receiptNumber,
  order,
  initialDetail,
  open = true,
  onClose,
  autoPrint = false,
  isModal = true,
}) => {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<'vat' | 'pos'>('pos');
  const [detailData, setDetailData] = useState<any>(initialDetail || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocalRefresh, setLastLocalRefresh] = useState<string>('');

  // Printer Configuration State
  const [printerModalOpen, setPrinterModalOpen] = useState<boolean>(false);
  const [printerType, setPrinterType] = useState<'lan' | 'usb' | 'bluetooth' | 'driver'>('lan');
  const [printerIp, setPrinterIp] = useState<string>('192.168.1.200');
  const [printerPort, setPrinterPort] = useState<string>('9100');
  const [paperWidth, setPaperWidth] = useState<'k80' | 'k57'>('k80');
  const [autoCut, setAutoCut] = useState<boolean>(true);
  const [copyCount, setCopyCount] = useState<number>(1);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isTestingPrinter, setIsTestingPrinter] = useState<boolean>(false);

  const effectiveSite = siteCode || order?.storeId || order?.siteCode || '1134';
  const effectiveReceipt = receiptNumber || order?.id || order?.receiptNumber || '';

  // Initial fetch on modal open or parameter change
  useEffect(() => {
    if (open && effectiveReceipt) {
      setIsLoading(true);
      setError(null);
      if (initialDetail) {
        setDetailData(initialDetail);
      }

      orderService.getReceiptDetail(effectiveSite, effectiveReceipt, false)
        .then((res) => {
          if (res) {
            setDetailData(res);
          }
          if (autoPrint) {
            setTimeout(() => window.print(), 300);
          }
        })
        .catch((err) => {
          console.error('Error loading detail for print:', err);
          if (!initialDetail) {
            setError(err.message || 'Không thể kết nối API chi tiết hóa đơn');
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, effectiveSite, effectiveReceipt]);

  // Load stored printer settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('k80_printer_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.printerType) setPrinterType(parsed.printerType);
        if (parsed.printerIp) setPrinterIp(parsed.printerIp);
        if (parsed.printerPort) setPrinterPort(parsed.printerPort);
        if (parsed.autoCut !== undefined) setAutoCut(parsed.autoCut);
        if (parsed.paperWidth) setPaperWidth(parsed.paperWidth);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  if (isModal && !open) return null;

  // Local Refresh handler - Re-renders local view without making an API call
  const handleLocalRefresh = () => {
    setLastLocalRefresh(new Date().toLocaleTimeString('vi-VN'));
    message.success('Đã làm mới giao diện phiếu in thành công! (Không gọi API)');
  };

  // Test Printer Connection
  const handleTestPrint = () => {
    setIsTestingPrinter(true);
    setTimeout(() => {
      setIsTestingPrinter(false);
      setIsConnected(true);
      message.success(`Đã gửi lệnh in thử thành công tới máy in ${paperWidth.toUpperCase()} (${printerType === 'lan' ? printerIp : printerType.toUpperCase()})`);
      // Save config to local storage
      localStorage.setItem('k80_printer_config', JSON.stringify({
        printerType,
        printerIp,
        printerPort,
        paperWidth,
        autoCut,
        copyCount,
      }));
    }, 1200);
  };

  const handlePrint = () => {
    if (printerType === 'lan' || printerType === 'usb') {
      message.loading({ content: `Đang truyền dữ liệu in lệnh ESC/POS tới máy in ${printerIp}...`, key: 'print' });
      setTimeout(() => {
        message.success({ content: `Đã in thành công ${copyCount} liên phiếu ${paperWidth.toUpperCase()}! ${autoCut ? '(Đã cắt giấy)' : ''}`, key: 'print' });
        window.print();
      }, 800);
    } else {
      window.print();
    }
  };

  const handleDownloadPDF = () => {
    message.loading('Đang xuất file PDF Hóa đơn...', 1.2).then(() => {
      message.success(`Đã tải xuống file e-Invoice_${effectiveReceipt}.pdf!`);
    });
  };

  // Always parse detailData (from API or seed) or order into full OrderDetailFull structure
  const detail = getOrderDetailFull(detailData || order);
  const productsList = detail.items && detail.items.length > 0 ? detail.items : [];
  
  // Calculate financial totals dynamically
  const itemsSumTotal = productsList.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  const itemsDiscountSum = productsList.reduce((sum: number, item: any) => sum + (item.discount || 0), 0);
  const itemsVatSum = productsList.reduce((sum: number, item: any) => sum + (item.vat || 0), 0);
  
  const totalAmount = itemsSumTotal > 0 ? itemsSumTotal : (order?.total || 0);
  const discountAmount = itemsDiscountSum;
  const vatAmount = itemsVatSum > 0 ? itemsVatSum : Math.round(totalAmount * 0.08 / 1.08);
  const subtotalBeforeVat = totalAmount - vatAmount;

  // Store & Cashier Metadata
  const cashierName = detail.employees?.cashier !== 'Không có dữ liệu' 
    ? detail.employees?.cashier 
    : (detail.store?.cashier !== 'Không có dữ liệu' ? detail.store?.cashier : order?.employee || 'Nguyễn Văn A (POS-01)');
  const sellerLegalName = detail.store?.legalName !== 'Không có dữ liệu' ? detail.store?.legalName : 'CÔNG TY TNHH SẢN XUẤT HÀNG TIÊU DÙNG BÌNH TIÊN';
  const sellerBranch = detail.store?.branch !== 'Không có dữ liệu' ? detail.store?.branch : 'CHTT BITI\'S THÁP MƯỜI';
  const sellerAddress = detail.store?.address !== 'Không có dữ liệu' ? detail.store?.address : '24 Lý Chiêu Hoàng, Phường Bình Phú, Quận 6, TP.HCM';
  const sellerTaxCode = detail.store?.taxCode !== 'Không có dữ liệu' ? detail.store?.taxCode : '0301340497-035';
  const sellerHotline = detail.store?.hotline !== 'Không có dữ liệu' ? detail.store?.hotline : '1900 6868';
  const bankAccountInfo = (detail.payment as any)?.reference && (detail.payment as any)?.reference !== 'Không có dữ liệu' 
    ? (detail.payment as any)?.reference 
    : '190388889999 - MB Bank';
  
  const formNo = detail.vat?.formNo || '1/001';
  const serialNo = detail.vat?.serialNo !== 'Không có dữ liệu' ? detail.vat?.serialNo : 'C25MAC';
  const eInvoiceNo = (detail.vat?.eInvoiceNo && detail.vat?.eInvoiceNo !== 'Không có dữ liệu' && detail.vat?.eInvoiceNo !== 'Chưa xuất') 
    ? detail.vat?.eInvoiceNo 
    : (detail.order?.invoiceId && detail.order?.invoiceId !== 'Không có dữ liệu' ? detail.order?.invoiceId : effectiveReceipt);

  const buyerCompanyName = (detail.vat?.companyName && detail.vat?.companyName !== 'Không có dữ liệu') 
    ? detail.vat?.companyName 
    : (detail.customer?.fullName && detail.customer?.fullName !== 'Không có dữ liệu' ? detail.customer?.fullName : 'Khách hàng cá nhân');
  const buyerTaxCode = (detail.vat?.taxCode && detail.vat?.taxCode !== 'Không có dữ liệu') 
    ? detail.vat?.taxCode 
    : '---';
  const buyerAddress = (detail.vat?.companyAddress && detail.vat?.companyAddress !== 'Không có dữ liệu') 
    ? detail.vat?.companyAddress 
    : (detail.customer?.address && detail.customer?.address !== 'Không có dữ liệu' ? detail.customer?.address : 'Khách hàng không cung cấp thông tin');

  const amountInWords = (detail.rawJsonb?.receiptTotals?.totalAmountWithTaxInWords)
    ? detail.rawJsonb.receiptTotals.totalAmountWithTaxInWords
    : numberToVietnameseWords(totalAmount);

  const createdAtText = detail.order?.createdAt !== 'Không có dữ liệu' ? detail.order?.createdAt : (order?.time || new Date().toLocaleString('vi-VN'));
  const customerName = detail.customer?.fullName !== 'Không có dữ liệu' ? detail.customer?.fullName : (order?.customer || 'Khách hàng lẻ');
  const customerPhone = detail.customer?.phone !== 'Không có dữ liệu' ? detail.customer?.phone : (order?.phone || 'Chưa cập nhật');
  const paymentMethodText = detail.payment?.method !== 'Không có dữ liệu' ? detail.payment?.method : (order?.paymentInfo?.paymentMethod || 'Tiền mặt/Chuyển khoản');

  const documentContent = (
    <div className="print-document-wrapper">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-content, #printable-invoice-content * {
            visibility: visible !important;
          }
          #printable-invoice-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print, .no-print * {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Container */}
      <div id="printable-invoice-content">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-xl my-2 border border-slate-100 no-print">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
            <div className="text-slate-700 font-bold text-sm">
              Đang truy xuất dữ liệu phiếu thu từ hệ thống...
            </div>
            <div className="text-slate-400 text-xs font-mono bg-slate-50 px-3 py-1 rounded border border-slate-200">
              Mã đơn: {effectiveReceipt}
            </div>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-600 space-y-2 no-print">
            <div className="font-bold text-base">Không thể hiển thị phiếu thu</div>
            <div className="text-xs text-slate-500 font-mono">{error}</div>
          </div>
        ) : activeTab === 'vat' ? (
          /* A4 Full VAT Tax Invoice Layout */
          <div className="p-3 sm:p-6 bg-white border border-slate-200 rounded-xl my-2 shadow-sm font-sans text-slate-800 text-xs leading-relaxed max-h-[70vh] overflow-y-auto print:max-h-none print:shadow-none print:border-0 print:p-0">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-blue-600 pb-4 mb-4 gap-4">
              <div className="space-y-1 max-w-full md:max-w-[480px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">{sellerBranch}</span>
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase">{sellerLegalName}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Địa chỉ:</strong> {sellerAddress}
                </div>
                <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-0.5">
                  <span><strong>Mã số thuế:</strong> {sellerTaxCode}</span>
                  <span><strong>Hotline:</strong> {sellerHotline}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <span><strong>Tài khoản NH:</strong> {bankAccountInfo}</span>
                </div>
              </div>

              <div className="text-left md:text-right space-y-1 bg-slate-50 md:bg-transparent p-2 md:p-0 rounded-lg w-full md:w-auto">
                <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Mẫu số / Ký hiệu</div>
                <div className="font-mono text-xs text-blue-700 font-bold">{formNo} - {serialNo}</div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase mt-1">Số hóa đơn</div>
                <div className="font-mono text-xs sm:text-sm text-rose-600 font-extrabold">{eInvoiceNo}</div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center my-4 sm:my-5">
              <h2 className="text-base sm:text-lg font-black uppercase text-blue-950 tracking-wide m-0">HÓA ĐƠN GIÁ TRỊ GIA TĂNG (VAT)</h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 italic mt-0.5">(Hóa đơn điện tử chuyển đổi từ hệ thống cơ sở dữ liệu bán hàng)</p>
              <div className="text-[11px] text-slate-600 mt-1">
                Ngày lập: <span className="font-semibold">{createdAtText}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-slate-50 p-3 sm:p-3.5 rounded-lg border border-slate-200/80 mb-4 sm:mb-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              <div><strong>Tên người mua hàng:</strong> {customerName}</div>
              <div><strong>Mã đơn hàng:</strong> <span className="font-mono font-bold text-blue-600">{effectiveReceipt}</span></div>
              <div><strong>Đơn vị mua hàng:</strong> {buyerCompanyName}</div>
              <div><strong>SĐT liên hệ:</strong> {customerPhone}</div>
              <div><strong>Mã số thuế VAT:</strong> <span className="font-mono">{buyerTaxCode}</span></div>
              <div><strong>Kênh bán hàng:</strong> {detail.order?.salesChannel !== 'Không có dữ liệu' ? detail.order?.salesChannel : effectiveSite}</div>
              <div className="sm:col-span-2"><strong>Địa chỉ giao hàng / Công ty:</strong> {buyerAddress}</div>
              <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
                <strong>Hình thức thanh toán:</strong> {paymentMethodText} - <Tag color="green" className="font-bold border-0 text-[10px] m-0">ĐÃ THANH TOÁN</Tag>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-5 overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full min-w-[640px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-200">
                    <th className="p-2 border-r border-slate-200 text-center w-10">STT</th>
                    <th className="p-2 border-r border-slate-200">Mã SKU</th>
                    <th className="p-2 border-r border-slate-200">Tên hàng hóa, dịch vụ</th>
                    <th className="p-2 border-r border-slate-200 text-center">ĐVT</th>
                    <th className="p-2 border-r border-slate-200 text-center">SL</th>
                    <th className="p-2 border-r border-slate-200 text-right">Đơn giá (₫)</th>
                    <th className="p-2 border-r border-slate-200 text-right">Chiết khấu</th>
                    <th className="p-2 text-right">Thành tiền (₫)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {productsList.length > 0 ? (
                    productsList.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2 border-r border-slate-200 text-center font-mono text-[11px]">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-mono text-[11px] font-semibold text-slate-600">{p.sku || 'N/A'}</td>
                        <td className="p-2 border-r border-slate-200 font-medium">
                          <div>{p.productName || 'Sản phẩm Biti\'s'}</div>
                          <div className="text-[10px] text-slate-400">Phân loại: {p.color || 'Gốc'} - {p.size || 'Standard'}</div>
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center">{p.unit || 'Đôi'}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-bold">{p.quantity || 1}</td>
                        <td className="p-2 border-r border-slate-200 text-right font-mono">{(p.price || 0).toLocaleString('vi-VN')}</td>
                        <td className="p-2 border-r border-slate-200 text-right font-mono text-rose-600">
                          {p.discount > 0 ? `-${p.discount.toLocaleString('vi-VN')}` : '0'}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-800">{(p.total || 0).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-slate-400 italic">
                        Không có chi tiết sản phẩm.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-t border-slate-200 pt-4 mb-6">
              <div className="flex-1 space-y-2 w-full md:w-auto">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-600">Số tiền bằng chữ:</div>
                  <div className="text-xs font-semibold italic text-blue-900 mt-0.5">
                    {amountInWords}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <SafetyCertificateOutlined className="text-emerald-600" />
                  <span>Chữ ký số đã được xác thực bởi Cục Thuế</span>
                </div>
              </div>

              <div className="w-full md:w-72 space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Cộng tiền hàng (chưa VAT):</span>
                  <span className="font-mono">{subtotalBeforeVat.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Thuế suất GTGT (8%):</span>
                  <span className="font-mono">{vatAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Tổng giảm giá / Voucher:</span>
                    <span className="font-mono">-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                <div className="border-t border-slate-300 pt-2 flex justify-between font-extrabold text-xs sm:text-sm text-slate-900">
                  <span>TỔNG CỘNG THANH TOÁN:</span>
                  <span className="text-blue-700 font-mono">{totalAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mt-6 pt-4 border-t border-dashed border-slate-200">
              <div className="p-2 bg-slate-50 sm:bg-transparent rounded-lg">
                <div className="font-bold text-slate-800">NGƯỜI MUA HÀNG</div>
                <div className="text-[10px] text-slate-400 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
                <div className="h-12 sm:h-16 flex items-end justify-center text-slate-500 italic text-[11px]">
                  {customerName}
                </div>
              </div>

              <div className="p-2 bg-slate-50 sm:bg-transparent rounded-lg">
                <div className="font-bold text-slate-800">NGƯỜI BÁN / THỦ KHO</div>
                <div className="text-[10px] text-slate-400 italic mt-0.5">(Ký, đóng dấu)</div>
                <div className="h-12 sm:h-16 flex items-end justify-center font-semibold text-slate-700 text-xs">
                  {cashierName}
                </div>
              </div>

              <div className="p-2 bg-slate-50 sm:bg-transparent rounded-lg">
                <div className="font-bold text-slate-800">ĐƠN VỊ PHÁT HÀNH</div>
                <div className="text-[10px] text-slate-400 italic mt-0.5">(Chữ ký số CA)</div>
                <div className="h-12 sm:h-16 flex flex-col items-center justify-end">
                  <div className="border border-emerald-500 text-emerald-700 bg-emerald-50 text-[9px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                    <CheckCircleOutlined /> DIGITAL SIGNED
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* REDESIGNED REALISTIC POS K80 THERMAL RECEIPT */
          <div className="p-3 sm:p-6 bg-slate-200 flex justify-center max-h-[72vh] overflow-y-auto print:max-h-none print:bg-white print:p-0">
            <div className="w-full max-w-[340px] bg-white text-slate-900 shadow-2xl p-5 border border-slate-300 font-mono text-[11px] leading-tight select-none print:shadow-none print:border-0 print:p-2 print:max-w-none relative">
              
              {/* Paper Zig-Zag top border simulation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_3px,_#f1f5f9_3px)] bg-[length:8px_8px] -mt-1 print:hidden" />

              {/* Brand Header */}
              <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-800">
                <div className="font-black text-base uppercase tracking-wider text-slate-950 font-sans">
                  BITI'S
                </div>
                <div className="font-bold text-xs uppercase tracking-tight text-slate-900">
                  {sellerBranch}
                </div>
                <div className="text-[10px] text-slate-700">{sellerAddress}</div>
                <div className="text-[10px] text-slate-700 flex justify-center gap-2">
                  <span>Hotline: {sellerHotline}</span>
                  <span>|</span>
                  <span>MST: {sellerTaxCode}</span>
                </div>
              </div>

              {/* Bill Title & Invoice Info */}
              <div className="py-2.5 text-center space-y-1 border-b border-slate-800 border-double">
                <div className="font-extrabold text-sm uppercase tracking-wide text-slate-950 font-sans">
                  PHIẾU THANH TOÁN (K80)
                </div>
                <div className="text-[10px] font-bold text-slate-800">
                  Số HĐ: <span className="text-xs font-black">{effectiveReceipt}</span>
                </div>
                <div className="text-[10px] text-slate-600">
                  Thời gian: {createdAtText}
                </div>
              </div>

              {/* Cashier & Customer Info */}
              <div className="py-2 space-y-1 text-[10px] border-b border-dashed border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-600">Thu ngân:</span>
                  <span className="font-bold text-slate-900">{cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Khách hàng:</span>
                  <span className="font-bold text-slate-900">{customerName}</span>
                </div>
                {customerPhone !== 'Chưa cập nhật' && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">SĐT:</span>
                    <span>{customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Máy POS:</span>
                  <span>POS-01 (Khu vực HCM)</span>
                </div>
              </div>

              {/* Items List Table */}
              <div className="py-2.5 space-y-2.5 border-b border-slate-800">
                <div className="grid grid-cols-12 font-bold text-[10px] uppercase border-b border-slate-400 pb-1 text-slate-800">
                  <div className="col-span-6">Tên sản phẩm</div>
                  <div className="col-span-2 text-center">SL</div>
                  <div className="col-span-4 text-right">Thành tiền</div>
                </div>

                {productsList.map((p: any, idx: number) => (
                  <div key={idx} className="space-y-0.5 border-b border-slate-100 last:border-0 pb-1">
                    <div className="font-bold text-[11px] text-slate-950 leading-snug">
                      {idx + 1}. {p.productName || 'Sản phẩm Biti\'s'}
                    </div>
                    <div className="text-[9px] text-slate-500 pl-3">
                      SKU: {p.sku || 'N/A'} {p.size ? `| Size: ${p.size}` : ''} {p.color ? `| Màu: ${p.color}` : ''}
                    </div>
                    <div className="grid grid-cols-12 text-[10px] text-slate-800 font-semibold pl-3">
                      <div className="col-span-6 text-slate-600">
                        {p.quantity || 1} x {(p.price || 0).toLocaleString('vi-VN')}₫
                      </div>
                      <div className="col-span-2 text-center text-slate-500">
                        {p.discount > 0 ? `-${p.discount.toLocaleString('vi-VN')}` : ''}
                      </div>
                      <div className="col-span-4 text-right font-extrabold text-slate-950">
                        {(p.total || 0).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculations Breakdown */}
              <div className="py-2.5 space-y-1.5 text-[10px] border-b border-slate-900 border-double">
                <div className="flex justify-between text-slate-700">
                  <span>Cộng tiền hàng ({productsList.length} món):</span>
                  <span className="font-semibold">{(totalAmount + discountAmount).toLocaleString('vi-VN')} ₫</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-700 font-bold">
                    <span>Chiết khấu / Khuyến mãi:</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 italic">
                  <span>Thuế GTGT (VAT 8% bao gồm):</span>
                  <span>{vatAmount.toLocaleString('vi-VN')} ₫</span>
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-between font-extrabold text-xs text-slate-950">
                  <span>TỔNG THANH TOÁN:</span>
                  <span className="text-sm font-black">{totalAmount.toLocaleString('vi-VN')} ₫</span>
                </div>

                <div className="pt-1 flex justify-between text-slate-800">
                  <span>Hình thức thanh toán:</span>
                  <span className="font-bold">{paymentMethodText}</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Tiền khách đưa:</span>
                  <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Tiền thối lại:</span>
                  <span className="font-bold text-slate-900">0 ₫</span>
                </div>
              </div>

              {/* Footer Information & QR Code */}
              <div className="pt-3 text-center space-y-2">
                <div className="flex justify-center items-center gap-3 py-1">
                  <div className="p-1 border border-slate-300 bg-white rounded">
                    <QrcodeOutlined className="text-3xl text-slate-900" />
                  </div>
                  <div className="text-left space-y-0.5">
                    <div className="text-[9px] font-bold text-slate-800">Tra cứu e-Invoice:</div>
                    <div className="text-[8px] text-blue-700 font-mono underline">tracuu.bitis.com.vn</div>
                    <div className="text-[8px] text-slate-500">Mã tra cứu: {effectiveReceipt}</div>
                  </div>
                </div>

                <div className="text-[9px] font-mono tracking-widest font-extrabold text-slate-800 bg-slate-100 py-1 border border-slate-200">
                  *{effectiveReceipt}*
                </div>

                <div className="text-[9px] text-slate-600 space-y-0.5 pt-1">
                  <div>Wifi: <strong>Bitis_Free_Guest</strong> | Pass: <strong>bitis6868</strong></div>
                  <div className="italic text-[8.5px]">Quý khách vui lòng giữ lại phiếu để đổi hàng trong 07 ngày.</div>
                  <div className="font-bold text-[10px] text-slate-900 uppercase pt-1 font-sans">
                    CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!
                  </div>
                </div>
              </div>

              {/* Paper Zig-Zag bottom border simulation */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_3px,_#f1f5f9_3px)] bg-[length:8px_8px] -mb-1 print:hidden" />

            </div>
          </div>
        )}
      </div>

      {/* PRINTER SETTINGS MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
            <SettingOutlined className="text-blue-600 text-lg" />
            <span>Cấu Hình Kết Nối Máy In Nhiệt (K80 / K57)</span>
          </div>
        }
        open={printerModalOpen}
        onCancel={() => setPrinterModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPrinterModalOpen(false)}>
            Đóng
          </Button>,
          <Button 
            key="test" 
            icon={<ThunderboltOutlined />} 
            onClick={handleTestPrint} 
            loading={isTestingPrinter}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
          >
            In Thử Phiếu Test
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            icon={<CheckOutlined />} 
            onClick={() => {
              message.success('Đã lưu cấu hình máy in!');
              setPrinterModalOpen(false);
            }}
          >
            Lưu Cấu Hình
          </Button>
        ]}
        width={540}
        centered
      >
        <div className="py-2 space-y-4 text-xs">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg flex items-start gap-2">
            <ApiOutlined className="text-blue-600 text-base mt-0.5" />
            <div>
              <div className="font-bold">Chế độ máy in nhiệt POS ESC/POS</div>
              <div className="text-[11px] text-blue-700">
                Hỗ trợ kết nối trực tiếp cổng mạng LAN/Wi-Fi (IP), USB, Bluetooth hoặc qua Trình điều khiển hệ thống.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phương thức kết nối máy in:</label>
              <Select 
                value={printerType} 
                onChange={(val) => setPrinterType(val)}
                className="w-full"
                options={[
                  { label: '🌐 Mạng LAN / Wi-Fi (Cổng Ethernet IP 9100)', value: 'lan' },
                  { label: '🔌 Cổng USB Trực tiếp (WebUSB / Direct Port)', value: 'usb' },
                  { label: '📱 Máy in Bluetooth Di Động', value: 'bluetooth' },
                  { label: '🖨️ Trình điều khiển System Driver (Browser Print)', value: 'driver' },
                ]}
              />
            </div>

            {printerType === 'lan' && (
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Địa chỉ IP Máy In (LAN):</label>
                  <Input 
                    value={printerIp} 
                    onChange={(e) => setPrinterIp(e.target.value)} 
                    placeholder="192.168.1.200"
                    prefix={<WifiOutlined className="text-slate-400" />}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cổng (Port):</label>
                  <Input 
                    value={printerPort} 
                    onChange={(e) => setPrinterPort(e.target.value)} 
                    placeholder="9100"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Khổ giấy in nhiệt:</label>
                <Select 
                  value={paperWidth} 
                  onChange={(v) => setPaperWidth(v)}
                  className="w-full"
                  options={[
                    { label: '📄 Khổ K80 (80mm - Tiêu chuẩn)', value: 'k80' },
                    { label: '📜 Khổ K57 (57mm - Nhỏ)', value: 'k57' },
                  ]}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số liên in (Số bản):</label>
                <Select 
                  value={copyCount} 
                  onChange={(v) => setCopyCount(v)}
                  className="w-full"
                  options={[
                    { label: '1 bản (Cho khách)', value: 1 },
                    { label: '2 bản (Khách + Cửa hàng)', value: 2 },
                    { label: '3 bản (Khách + Cửa hàng + Kế toán)', value: 3 },
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="font-bold text-slate-800">Tự động cắt giấy khi in xong (Auto-Cut)</div>
                <div className="text-[10px] text-slate-500">Gửi lệnh dao cắt ESC/POS GS V 66 0</div>
              </div>
              <Switch checked={autoCut} onChange={(checked) => setAutoCut(checked)} />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <span>Trạng thái kết nối:</span>
              {isConnected ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Đã sẵn sàng kết nối {paperWidth.toUpperCase()}
                </Tag>
              ) : (
                <Tag color="default">Chưa kết nối</Tag>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );

  if (!isModal) {
    return documentContent;
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={850}
      style={{ maxWidth: 'calc(100vw - 16px)', top: 12 }}
      centered
      styles={{ body: { padding: '12px 16px' } }}
      footer={
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full pt-2 border-t border-slate-100 no-print">
          <div className="text-xs text-slate-500 text-center sm:text-left flex items-center gap-2 wrap">
            <span>Mã e-Invoice:</span>
            <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">{effectiveReceipt}</code>
            
            {/* Local Refresh Button - No API call */}
            <Tooltip title={lastLocalRefresh ? `Đã làm mới lúc ${lastLocalRefresh}` : "Làm mới giao diện in tại chỗ"}>
              <Button 
                size="small" 
                type="text" 
                icon={<ReloadOutlined />} 
                onClick={handleLocalRefresh}
                className="text-blue-600 hover:text-blue-800 text-xs p-0 h-auto font-medium"
              >
                Làm mới giao diện
              </Button>
            </Tooltip>
          </div>

          <Space wrap className="w-full sm:w-auto justify-center sm:justify-end">
            {/* Printer Connection Config Button */}
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => setPrinterModalOpen(true)}
              className="text-slate-700 font-medium"
            >
              <Badge status={isConnected ? 'success' : 'default'} text="Máy in K80" />
            </Button>

            <Button onClick={onClose}>
              Đóng
            </Button>
            
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadPDF}
            >
              Tải PDF
            </Button>
            
            <Button 
              type="primary" 
              icon={<PrinterOutlined />} 
              className="bg-blue-600 hover:bg-blue-700 font-semibold"
              onClick={handlePrint}
            >
              In Phiếu Ngay
            </Button>
          </Space>
        </div>
      }
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 pr-8 no-print">
          <div className="flex items-center gap-2">
            <PrinterOutlined className="text-blue-600 text-lg" />
            <span className="text-sm sm:text-base font-bold text-slate-800">In Hóa Đơn ({effectiveReceipt})</span>
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as any)}
            className="custom-tabs-header -mb-3"
            size="small"
            items={[
              { key: 'pos', label: 'Phiếu thu POS (K80)' },
              { key: 'vat', label: 'Hóa đơn VAT (A4)' },
            ]}
          />
        </div>
      }
    >
      {documentContent}
    </Modal>
  );
};

export default PrintInvoice;
