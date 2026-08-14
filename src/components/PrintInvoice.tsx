import React, { useEffect, useMemo, useState } from 'react';
import { App, Badge, Button, Input, Modal, Select, Space, Spin, Switch, Tabs, Tag, Tooltip } from 'antd';
import metadata from '../../metadata.json';
import {
  CheckCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  WifiOutlined,
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

type PrinterType = 'lan' | 'driver';
type PaperWidth = 'k80' | 'k57';

const NO_DATA = 'Không có dữ liệu';
const PRINTER_CONFIG_KEY = 'k80_printer_config';

function isFullDetail(value: any) {
  return Boolean(value?.store && value?.order && Array.isArray(value?.items));
}

function textValue(value: any, fallback = '—') {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  if (!text || text === NO_DATA || text === 'null' || text === 'undefined') return fallback;
  return text;
}

function money(value: any) {
  const num = Number(value || 0);
  return `${num.toLocaleString('vi-VN')} đ`;
}

function parseMoney(value: any) {
  if (typeof value === 'number') return value;
  return Number(String(value || '').replace(/[^\d.-]/g, '')) || 0;
}

function formatDateTime(value: any) {
  const text = textValue(value, '');
  if (!text) return '—';
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text.replace('T', ' ');
  return date.toLocaleString('vi-VN', { hour12: false });
}

function numberToVietnameseWords(num: number): string {
  if (!num || Number.isNaN(num)) return 'Không đồng.';

  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const scales = ['', 'ngàn', 'triệu', 'tỷ', 'ngàn tỷ', 'triệu tỷ'];

  const readThreeDigits = (value: number, showZeroHundred: boolean) => {
    const hundred = Math.floor(value / 100);
    const remainder = value % 100;
    const ten = Math.floor(remainder / 10);
    const unit = remainder % 10;
    let result = '';

    if (hundred > 0 || showZeroHundred) result += `${units[hundred]} trăm `;
    if (ten > 1) {
      result += `${units[ten]} mươi `;
      if (unit === 1) result += 'mốt ';
      else if (unit === 5) result += 'lăm ';
      else if (unit > 0) result += `${units[unit]} `;
    } else if (ten === 1) {
      result += 'mười ';
      if (unit === 5) result += 'lăm ';
      else if (unit > 0) result += `${units[unit]} `;
    } else if (unit > 0) {
      if (hundred > 0 || showZeroHundred) result += 'lẻ ';
      result += `${unit === 5 && (hundred > 0 || showZeroHundred) ? 'lăm' : units[unit]} `;
    }

    return result.trim();
  };

  let digits = Math.abs(Math.round(num)).toString();
  const groups: number[] = [];
  while (digits.length > 0) {
    groups.push(Number(digits.slice(-3)));
    digits = digits.slice(0, -3);
  }

  const words: string[] = [];
  for (let index = groups.length - 1; index >= 0; index -= 1) {
    const group = groups[index];
    if (group > 0) {
      words.push(`${readThreeDigits(group, index < groups.length - 1)} ${scales[index]}`.trim());
    }
  }

  const result = words.join(' ').replace(/\s+/g, ' ').trim();
  return result ? `${result.charAt(0).toUpperCase()}${result.slice(1)} đồng chẵn.` : 'Không đồng.';
}

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
  const [activeTab, setActiveTab] = useState<'pos' | 'vat'>('pos');
  const [loadedOrder, setLoadedOrder] = useState<any>(order || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshAt, setLastRefreshAt] = useState('');

  const [printerModalOpen, setPrinterModalOpen] = useState(false);
  const [printerType, setPrinterType] = useState<PrinterType>('lan');
  const [printerIp, setPrinterIp] = useState('192.168.6.201');
  const [printerPort, setPrinterPort] = useState('9100');
  const [paperWidth, setPaperWidth] = useState<PaperWidth>('k80');
  const [autoCut, setAutoCut] = useState(true);
  const [copyCount, setCopyCount] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [isTestingPrinter, setIsTestingPrinter] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const effectiveSite = textValue(siteCode || order?.storeId || order?.siteCode || order?.rawJsonb?.receiptInfo?.salesChannel, '1134').replace(/^POS\s+/i, '');
  const effectiveReceipt = textValue(receiptNumber || order?.id || order?.receiptNumber || order?.rawJsonb?.receiptInfo?.receiptNumber, '');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PRINTER_CONFIG_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed.printerType) setPrinterType(parsed.printerType);
      if (parsed.printerIp) setPrinterIp(parsed.printerIp);
      if (parsed.printerPort) setPrinterPort(parsed.printerPort);
      if (parsed.paperWidth) setPaperWidth(parsed.paperWidth);
      if (parsed.autoCut !== undefined) setAutoCut(Boolean(parsed.autoCut));
      if (parsed.copyCount) setCopyCount(Number(parsed.copyCount) || 1);
    } catch {
      // Ignore invalid local printer settings.
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    if (order) {
      setLoadedOrder(order);
    } else if (initialDetail) {
      setLoadedOrder(initialDetail);
    }

    if (!effectiveReceipt) return;

    let mounted = true;
    setIsLoading(true);
    setError(null);

    orderService.getReceiptDetail(effectiveSite, effectiveReceipt, false)
      .then(result => {
        if (!mounted) return;
        setLoadedOrder(result);
        if (autoPrint) window.setTimeout(() => window.print(), 300);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err?.message || 'Không thể tải dữ liệu chi tiết chứng từ để in.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, effectiveSite, effectiveReceipt, autoPrint]);

  const detail = useMemo(() => {
    if (isFullDetail(loadedOrder)) return loadedOrder;
    if (isFullDetail(initialDetail) && !loadedOrder) return initialDetail;
    return getOrderDetailFull(loadedOrder || order || initialDetail || {});
  }, [loadedOrder, order, initialDetail]);

  const raw = detail.rawJsonb || {};
  const rawTotals = raw.receiptTotals || {};
  const items = Array.isArray(detail.items) ? detail.items : [];
  const subtotal = Number(rawTotals.totalItemAmount || rawTotals.TotalItemAmount || rawTotals.subTotal || rawTotals.subtotal || rawTotals.totalAmount || parseMoney(detail.totals?.subtotal) || 0);
  const discountTotal = Number(rawTotals.totalDiscountAmount || rawTotals.TotalDiscountAmount || rawTotals.totalDiscount || rawTotals.discountTotal || rawTotals.discountAmount || parseMoney(detail.totals?.discountTotal) || 0);
  const vatTotal = Number(rawTotals.totalVatAmount || rawTotals.TotalVatAmount || rawTotals.vatAmount || rawTotals.vatTotal || parseMoney(detail.totals?.vatTotal) || 0);
  const totalAmount = Number(rawTotals.totalAmount ?? parseMoney(detail.totals?.totalAmount) ?? subtotal - discountTotal) || 0;
  const paidAmount = Number(rawTotals.customerPaidAmount ?? parseMoney(detail.payment?.amountPaid) ?? totalAmount) || 0;
  const changeAmount = Number(rawTotals.changeAmount ?? parseMoney(detail.payment?.changeAmount) ?? 0) || 0;
  const amountInWords = textValue(rawTotals.totalAmountWithTaxInWords, numberToVietnameseWords(totalAmount));

  const seller = {
    legalName: textValue(raw.sellerInfo?.sellerLegalName || detail.store?.legalName || detail.store?.name),
    storeName: textValue(raw.sellerInfo?.storeName || detail.store?.branch),
    address: textValue(raw.sellerInfo?.storeAddress || raw.sellerInfo?.sellerAddressLine || detail.store?.address),
    taxCode: textValue(raw.sellerInfo?.sellerTaxCode || detail.store?.taxCode),
    website: textValue(raw.sellerInfo?.sellerWebsite || detail.store?.website),
    invoiceSeries: textValue(raw.sellerInfo?.invoiceSeries || detail.store?.invoiceCode),
  };

  const receipt = {
    number: textValue(raw.receiptInfo?.receiptNumber || detail.order?.orderId || effectiveReceipt),
    uuid: textValue(raw.receiptInfo?.uuid || detail.receiptVoucher?.uuid),
    invoiceNumber: textValue(raw.receiptInfo?.invoiceNumber || detail.order?.invoiceNo),
    transactionName: textValue(raw.receiptInfo?.transactionName || detail.order?.orderType),
    businessType: textValue(raw.receiptInfo?.businessType || detail.receiptVoucher?.voucherType),
    salesChannel: textValue(raw.receiptInfo?.salesChannel || detail.order?.salesChannel || effectiveSite),
    time: formatDateTime(raw.receiptInfo?.receiptTime || detail.order?.createdAt),
  };

  const customer = {
    code: textValue(raw.customer?.customerCode || detail.customer?.customerId),
    name: textValue(raw.customer?.customerName || detail.customer?.fullName),
    phone: textValue(raw.customer?.phoneNumber || detail.customer?.phone),
    email: textValue(raw.customer?.email || detail.customer?.email),
    tier: textValue(raw.customer?.membershipTier || detail.customer?.memberRank),
  };

  const buyer = {
    name: textValue(raw.invoiceInfo?.buyerName || detail.vat?.fullName),
    legalName: textValue(raw.invoiceInfo?.buyerLegalName || detail.vat?.companyName),
    taxCode: textValue(raw.invoiceInfo?.buyerTaxCode || detail.vat?.taxCode),
    address: textValue(raw.invoiceInfo?.buyerAddressLine || detail.vat?.companyAddress),
    email: textValue(raw.invoiceInfo?.buyerEmail || detail.vat?.invoiceEmail),
    phone: textValue(raw.invoiceInfo?.buyerPhoneNumber || detail.vat?.phone),
  };

  const employee = {
    code: textValue(raw.employee?.employeeCode),
    name: textValue(raw.employee?.employeeName || detail.employees?.cashier),
    shift: textValue(raw.employee?.shiftName || detail.employees?.workShift),
  };

  const payments = Array.isArray(raw.payments) && raw.payments.length > 0
    ? raw.payments
    : (Array.isArray(detail.payment?.splits) ? detail.payment.splits : []);
  const paymentName = textValue(payments[0]?.paymentMethodName || payments[0]?.paymentMethodCode || payments[0]?.method || detail.payment?.method);

  const savePrinterConfig = () => {
    localStorage.setItem(PRINTER_CONFIG_KEY, JSON.stringify({
      printerType,
      printerIp,
      printerPort,
      paperWidth,
      autoCut,
      copyCount,
    }));
  };

  const buildPrinterText = (test = false) => {
    const itemLines = items.map((item: any, index: number) => [
      `${index + 1}. ${textValue(item.productName, 'San pham')}`,
      `   ${Number(item.quantity || 0)} x ${Number(item.price || 0).toLocaleString('vi-VN')} = ${Number(item.total || 0).toLocaleString('vi-VN')}`,
    ].join('\n'));

    return [
      seller.storeName,
      seller.address,
      `MST: ${seller.taxCode}`,
      '--------------------------------',
      test ? 'PHIEU TEST MAY IN' : 'PHIEU THANH TOAN',
      `So CT: ${receipt.number}`,
      `Thoi gian: ${receipt.time}`,
      `Thu ngan: ${employee.name}`,
      '--------------------------------',
      ...itemLines,
      '--------------------------------',
      `Tong thanh toan: ${totalAmount.toLocaleString('vi-VN')}`,
      `Thanh toan: ${paymentName}`,
      `Khach dua: ${paidAmount.toLocaleString('vi-VN')}`,
      `Tra lai: ${changeAmount.toLocaleString('vi-VN')}`,
      '--------------------------------',
      'Cam on Quy khach',
    ].filter(Boolean).join('\n');
  };

  const callPrinterApi = async (url: string, test = false) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: printerIp,
        port: Number(printerPort || 9100),
        paperWidth,
        autoCut,
        copies: test ? 1 : copyCount,
        receiptNumber: receipt.number,
        content: buildPrinterText(test),
      }),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok || json?.success === false) {
      throw new Error(json?.message || `Không thể kết nối máy in ${printerIp}:${printerPort}`);
    }
    return json;
  };

  const handleTestPrint = async () => {
    if (printerType !== 'lan') {
      window.print();
      return;
    }

    setIsTestingPrinter(true);
    try {
      await callPrinterApi('/api/printer/test', true);
      setIsConnected(true);
      savePrinterConfig();
      message.success(`Đã gửi phiếu test tới máy in ${printerIp}:${printerPort}`);
    } catch (err: any) {
      setIsConnected(false);
      message.error(err.message || 'Không thể in test.');
    } finally {
      setIsTestingPrinter(false);
    }
  };

  const handlePrint = async () => {
    if (activeTab === 'vat' || printerType === 'driver') {
      window.print();
      return;
    }

    setIsPrinting(true);
    message.loading({ content: `Đang gửi lệnh in tới ${printerIp}:${printerPort}...`, key: 'print' });
    try {
      await callPrinterApi('/api/printer/print');
      setIsConnected(true);
      savePrinterConfig();
      message.success({ content: `Đã gửi ${copyCount} phiếu ${paperWidth.toUpperCase()} tới máy in.`, key: 'print' });
    } catch (err: any) {
      setIsConnected(false);
      message.error({ content: err.message || 'Không thể gửi lệnh in.', key: 'print' });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = () => {
    message.info('Trình duyệt sẽ mở hộp thoại in. Chọn "Save as PDF" để lưu hóa đơn.');
    window.print();
  };

  const handleLocalRefresh = () => {
    setLastRefreshAt(new Date().toLocaleTimeString('vi-VN'));
    message.success('Đã làm mới giao diện phiếu in.');
  };

  const printStyles = (
    <style>{`
      @media print {
        body * { visibility: hidden !important; }
        #printable-invoice-content, #printable-invoice-content * { visibility: visible !important; }
        #printable-invoice-content {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #fff !important;
          color: #000 !important;
          box-shadow: none !important;
          border: 0 !important;
        }
        .no-print, .no-print * { display: none !important; }
        .print-a4 {
          width: 190mm !important;
          min-height: 277mm !important;
          margin: 0 auto !important;
          padding: 8mm !important;
          box-shadow: none !important;
          border: 0 !important;
        }
        .print-k80 {
          width: 76mm !important;
          max-width: 76mm !important;
          margin: 0 auto !important;
          padding: 2mm !important;
          box-shadow: none !important;
          border: 0 !important;
          font-size: 10px !important;
        }
      }
    `}</style>
  );

  const receiptDate = new Date(textValue(raw.receiptInfo?.receiptTime || detail.order?.createdAt));
  const printDay = !Number.isNaN(receiptDate.getTime()) ? String(receiptDate.getDate()).padStart(2, '0') : '...';
  const printMonth = !Number.isNaN(receiptDate.getTime()) ? String(receiptDate.getMonth() + 1).padStart(2, '0') : '...';
  const printYear = !Number.isNaN(receiptDate.getTime()) ? String(receiptDate.getFullYear()) : '...';

  const a4Invoice = (
    <section className="print-a4 mx-auto max-w-[794px] bg-white text-black shadow-sm border border-black rounded-sm p-4 text-[12px] leading-relaxed relative" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      
      {/* Header */}
      <div className="relative pb-2 flex justify-between items-start">
        {/* Logo Left */}
        <div className="w-1/4 text-left">
           {metadata?.logoUrlVAT && <img src={metadata.logoUrlVAT} alt="Logo" className="max-w-[120px] max-h-[80px] object-contain" />}
        </div>
        
        {/* Center Title */}
        <div className="flex-1 text-center">
          <h1 className="m-0 text-[18px] font-bold uppercase">Hóa đơn giá trị gia tăng</h1>
          <div className="italic">(VAT INVOICE)</div>
          <div className="mt-1 font-bold">Bản thể hiện của hóa đơn điện tử</div>
          <div className="italic">(Electronic invoice display)</div>
          <div className="mt-2">
            Ngày <span className="italic">(date)</span> {printDay} tháng <span className="italic">(month)</span> {printMonth} năm <span className="italic">(year)</span> {printYear}
          </div>
        </div>
        
        {/* Right Info */}
        <div className="w-1/4 text-right">
          <div className="flex justify-end gap-2">
            <span>Ký hiệu <span className="italic">(Serial)</span>:</span>
            <span className="font-bold">{seller.invoiceSeries}</span>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <span>Số <span className="italic">(Invoice No)</span>:</span>
            <span className="font-bold">{receipt.invoiceNumber}</span>
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="border-t border-black pt-1 pb-1">
        <div><span className="font-bold">Đơn vị bán hàng <span className="italic">(Seller)</span>:</span> {seller.legalName}</div>
        <div><span className="font-bold">Mã số thuế <span className="italic">(Tax code)</span>:</span> <span className="font-bold">{seller.taxCode}</span></div>
        <div><span className="font-bold">Địa chỉ <span className="italic">(Address)</span>:</span> {seller.address}</div>
        <div><span className="font-bold">Tên cửa hàng <span className="italic">(Store's name)</span>:</span> {seller.storeName}</div>
        <div><span className="font-bold">Địa chỉ cửa hàng <span className="italic">(Store's adress)</span>:</span> {textValue(raw.sellerInfo?.storeAddress, seller.address)}</div>
      </div>

      {/* Buyer Info */}
      <div className="border-t border-black pt-1 pb-1">
        <div><span className="font-bold">Họ tên người mua hàng <span className="italic">(Buyer)</span>:</span> {buyer.name}</div>
        <div><span className="font-bold">Tên đơn vị <span className="italic">(Company's name)</span>:</span> {buyer.legalName}</div>
        <div><span className="font-bold">Địa chỉ <span className="italic">(Address)</span>:</span> {buyer.address}</div>
        <div><span className="font-bold">Mã số thuế <span className="italic">(Tax code)</span>:</span> {buyer.taxCode}</div>
        <div className="flex justify-between w-[80%]">
          <div><span className="font-bold">Phương thức thanh toán <span className="italic">(Payment method)</span>:</span> {paymentName}</div>
          <div><span className="font-bold">Số tài khoản <span className="italic">(Bank account)</span>:</span> </div>
        </div>
        <div><span className="font-bold">Ghi chú <span className="italic">(Note)</span>:</span> </div>
        
        {/* Extra data section (kept as requested) */}
        <div className="grid grid-cols-2 mt-1 text-[11px]">
            <div><span className="font-bold">SĐT:</span> {buyer.phone !== '—' ? buyer.phone : customer.phone}</div>
            <div><span className="font-bold">Email:</span> {buyer.email !== '—' ? buyer.email : customer.email}</div>
            <div><span className="font-bold">Mã KH:</span> {customer.code}</div>
            <div><span className="font-bold">Kênh bán:</span> {receipt.salesChannel}</div>
            <div><span className="font-bold">Mã đơn hàng:</span> {receipt.uuid}</div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-left border border-black mt-1">
        <thead>
          <tr>
            <th className="border border-black p-1 text-center font-bold">STT<br/><span className="italic font-normal">(No.)</span></th>
            <th className="border border-black p-1 text-center font-bold">Mã hàng<br/><span className="italic font-normal">(Item code)</span></th>
            <th className="border border-black p-1 text-center font-bold w-1/3">Tên hàng hóa, dịch vụ<br/><span className="italic font-normal">(Description)</span></th>
            <th className="border border-black p-1 text-center font-bold">Đơn<br/>vị tính<br/><span className="italic font-normal">(Unit)</span></th>
            <th className="border border-black p-1 text-center font-bold">Số lượng<br/><span className="italic font-normal">(Quantity)</span></th>
            <th className="border border-black p-1 text-center font-bold">Đơn giá<br/><span className="italic font-normal">(Unit price)</span></th>
            <th className="border border-black p-1 text-center font-bold">Thành tiền<br/><span className="italic font-normal">(Amount)</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, index: number) => (
            <tr key={`${item.sku}-${index}`}>
              <td className="border border-black p-1 text-center">{index + 1}</td>
              <td className="border border-black p-1 text-center font-mono">{textValue(item.sku)}</td>
              <td className="border border-black p-1">{textValue(item.productName)}</td>
              <td className="border border-black p-1 text-center">{textValue(item.unit)}</td>
              <td className="border border-black p-1 text-right">{Number(item.quantity || 0)}</td>
              <td className="border border-black p-1 text-right">{money(item.price)}</td>
              <td className="border border-black p-1 text-right">{money(item.total)}</td>
            </tr>
          ))}

        </tbody>
        <tfoot>
            <tr>
              <td colSpan={6} className="border border-black p-1 text-right font-bold">Cộng tiền hàng <span className="italic font-normal">(Total Item Amount):</span></td>
              <td className="border border-black p-1 text-right">{money(subtotal)}</td>
            </tr>
            {discountTotal > 0 && (
              <tr>
                <td colSpan={6} className="border border-black p-1 text-right font-bold">Tổng tiền chiết khấu <span className="italic font-normal">(Total Discount Amount):</span></td>
                <td className="border border-black p-1 text-right">{money(discountTotal)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={2} className="border border-black p-1 text-center font-bold">Thuế suất GTGT<br/><span className="italic font-normal">(VAT rate):</span></td>
              <td colSpan={4} className="border border-black p-1 text-right font-bold">Tổng thuế GTGT <span className="italic font-normal">(Total VAT Amount):</span></td>
              <td className="border border-black p-1 text-right">{money(vatTotal)}</td>
            </tr>
            <tr>
              <td colSpan={6} className="border border-black p-1 text-right font-bold">Tổng cộng tiền thanh toán <span className="italic font-normal">(Total amount):</span></td>
              <td className="border border-black p-1 text-right font-bold">{money(totalAmount)}</td>
            </tr>
        </tfoot>
      </table>

      {/* Amount in words */}
      <div className="pt-2 pb-2 border-b border-black">
        <div><span className="font-bold">Số tiền viết bằng chữ <span className="italic font-normal">(Amount in words):</span></span> {amountInWords}</div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-3 text-center mt-2 pb-24">
        <div>
          <div className="font-bold">Khách</div>
          <div className="italic text-[11px]">(Ký, ghi rõ họ tên)</div>
          <div className="mt-12 font-bold">{buyer.name}</div>
        </div>
        <div>
          <div className="font-bold">Thu ngân</div>
          <div className="italic text-[11px]">(Ký, ghi rõ họ tên)</div>
          <div className="mt-12 font-bold">{employee.name}</div>
        </div>
        <div>
          <div className="font-bold">Quản lý ca</div>
          <div className="italic text-[11px]">(Ký, ghi rõ họ tên)</div>
          <div className="mt-12"></div>
        </div>
      </div>
    </section>
  );

  const k80Receipt = (
    <section className="print-k80 mx-auto w-full max-w-[340px] bg-white text-slate-950 shadow-lg border border-slate-300 p-4 font-mono text-[11px] leading-tight">
      <header className="text-center border-b border-dashed border-slate-900 pb-2">
        <div className="font-black text-[16px] font-sans">BITI'S</div>
        <div className="mt-1 font-bold uppercase">{seller.storeName}</div>
        <div className="mt-1 text-[10px]">{seller.address}</div>
        <div className="mt-1 text-[10px]">MST: {seller.taxCode}</div>
      </header>

      <section className="border-b border-dashed border-slate-900 py-2 text-center">
        <div className="font-black uppercase font-sans text-[14px]">Phiếu thanh toán</div>
        <div>Số CT: <strong>{receipt.number}</strong></div>
        <div>{receipt.time}</div>
      </section>

      <section className="border-b border-dashed border-slate-900 py-2 text-[10px]">
        <div className="flex justify-between gap-2"><span>Thu ngân</span><strong className="text-right">{employee.name}</strong></div>
        <div className="flex justify-between gap-2"><span>Ca</span><strong>{employee.shift}</strong></div>
        <div className="flex justify-between gap-2"><span>Khách hàng</span><strong className="text-right">{customer.name}</strong></div>
        <div className="flex justify-between gap-2"><span>Điện thoại</span><strong>{customer.phone}</strong></div>
      </section>

      <section className="border-b border-slate-900 py-2">
        <div className="grid grid-cols-12 border-b border-slate-400 pb-1 text-[10px] font-bold uppercase">
          <div className="col-span-7">Hàng hóa</div>
          <div className="col-span-2 text-center">SL</div>
          <div className="col-span-3 text-right">Tiền</div>
        </div>
        <div className="space-y-2 pt-2">
          {items.map((item: any, index: number) => (
            <div key={`${item.sku}-k80-${index}`}>
              <div className="font-bold">{index + 1}. {textValue(item.productName)}</div>
              <div className="text-[9px] text-slate-600">SKU: {textValue(item.sku)} · {textValue(item.barcode)}</div>
              <div className="grid grid-cols-12">
                <div className="col-span-7">{money(item.price)}</div>
                <div className="col-span-2 text-center">{Number(item.quantity || 0)}</div>
                <div className="col-span-3 text-right font-bold">{money(item.total)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-double border-slate-900 py-2 space-y-1">
        <div className="flex justify-between"><span>Cộng tiền hàng</span><strong>{money(subtotal)}</strong></div>
        {discountTotal > 0 && <div className="flex justify-between"><span>Tổng tiền chiết khấu</span><strong>{money(discountTotal)}</strong></div>}
        <div className="flex justify-between"><span>Tổng thuế GTGT (VAT)</span><strong>{money(vatTotal)}</strong></div>
        <div className="flex justify-between text-[13px] font-black border-t border-slate-900 pt-1"><span>Tổng cộng</span><span>{money(totalAmount)}</span></div>
        <div className="flex justify-between"><span>Thanh toán</span><strong>{paymentName}</strong></div>
        <div className="flex justify-between"><span>Khách đưa</span><strong>{money(paidAmount)}</strong></div>
        <div className="flex justify-between"><span>Trả lại</span><strong>{money(changeAmount)}</strong></div>
      </section>

      <footer className="pt-3 text-center text-[10px]">
        <div className="font-mono tracking-widest border border-slate-300 py-1">*{receipt.number}*</div>
        <div className="mt-2">UUID: {receipt.uuid}</div>
        <div className="mt-1">Cảm ơn Quý khách và hẹn gặp lại.</div>
      </footer>
    </section>
  );

  const documentContent = (
    <div className="print-document-wrapper">
      {printStyles}
      <div id="printable-invoice-content" className={activeTab === 'vat' ? 'bg-white p-3' : 'bg-slate-200 p-4 print:bg-white print:p-0'}>
        {isLoading ? (
          <div className="no-print flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
            <div className="font-bold text-slate-700">Đang tải dữ liệu chi tiết chứng từ...</div>
            <code className="rounded bg-slate-100 px-2 py-1 text-xs">{effectiveReceipt}</code>
          </div>
        ) : error ? (
          <div className="no-print flex min-h-[260px] flex-col items-center justify-center gap-2 text-center text-rose-600">
            <ExclamationCircleOutlined className="text-2xl" />
            <div className="font-bold">Không thể tải phiếu in</div>
            <div className="text-xs text-slate-500">{error}</div>
          </div>
        ) : activeTab === 'vat' ? a4Invoice : k80Receipt}
      </div>

      <Modal
        title={<div className="flex items-center gap-2 font-bold"><SettingOutlined className="text-blue-600" /> Cấu hình máy in nhiệt</div>}
        open={printerModalOpen}
        onCancel={() => setPrinterModalOpen(false)}
        width={560}
        centered
        footer={[
          <Button key="close" onClick={() => setPrinterModalOpen(false)}>Đóng</Button>,
          <Button key="test" icon={<ThunderboltOutlined />} loading={isTestingPrinter} onClick={handleTestPrint}>
            In thử
          </Button>,
          <Button key="save" type="primary" onClick={() => { savePrinterConfig(); setPrinterModalOpen(false); message.success('Đã lưu cấu hình máy in.'); }}>
            Lưu cấu hình
          </Button>,
        ]}
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800">
            Máy in LAN/Wi-Fi cần mở cổng RAW TCP, thường là <strong>9100</strong>. Trình duyệt không thể tự kết nối TCP nên app sẽ gửi qua server Node nội bộ.
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-700">Phương thức in</label>
            <Select
              className="w-full"
              value={printerType}
              onChange={setPrinterType}
              options={[
                { label: 'Máy in LAN / Wi-Fi qua IP', value: 'lan' },
                { label: 'Trình điều khiển hệ thống / Browser print', value: 'driver' },
              ]}
            />
          </div>

          {printerType === 'lan' && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="mb-1 block font-bold text-slate-700">Địa chỉ IP</label>
                <Input value={printerIp} onChange={event => setPrinterIp(event.target.value)} prefix={<WifiOutlined className="text-slate-400" />} />
              </div>
              <div>
                <label className="mb-1 block font-bold text-slate-700">Port</label>
                <Input value={printerPort} onChange={event => setPrinterPort(event.target.value)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-slate-700">Khổ giấy</label>
              <Select
                className="w-full"
                value={paperWidth}
                onChange={setPaperWidth}
                options={[
                  { label: 'K80 - 80mm', value: 'k80' },
                  { label: 'K57 - 57mm', value: 'k57' },
                ]}
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700">Số liên</label>
              <Select
                className="w-full"
                value={copyCount}
                onChange={setCopyCount}
                options={[
                  { label: '1 bản', value: 1 },
                  { label: '2 bản', value: 2 },
                  { label: '3 bản', value: 3 },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div>
              <div className="font-bold text-slate-800">Tự động cắt giấy</div>
              <div className="text-[10px] text-slate-500">Gửi lệnh ESC/POS GS V B 0 sau khi in.</div>
            </div>
            <Switch checked={autoCut} onChange={setAutoCut} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">Trạng thái</span>
            {isConnected ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>Đã test thành công</Tag>
            ) : (
              <Tag>Chưa kiểm tra</Tag>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );

  if (!isModal) return documentContent;
  if (!open) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={activeTab === 'vat' ? 920 : 620}
      style={{ maxWidth: 'calc(100vw - 16px)', top: 12 }}
      centered
      styles={{ body: { padding: 12 } }}
      title={
        <div className="no-print flex flex-col gap-2 border-b border-slate-100 pb-3 pr-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <PrinterOutlined className="text-blue-600" />
            <span>In chứng từ {receipt.number}</span>
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={key => setActiveTab(key as 'pos' | 'vat')}
            size="small"
            className="-mb-3"
            items={[
              { key: 'pos', label: 'K80' },
              { key: 'vat', label: 'A4' },
            ]}
          />
        </div>
      }
      footer={
        <div className="no-print flex w-full flex-col gap-3 border-t border-slate-100 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Mã chứng từ:</span>
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">{effectiveReceipt}</code>
            <Tooltip title={lastRefreshAt ? `Làm mới lúc ${lastRefreshAt}` : 'Làm mới giao diện'}>
              <Button size="small" type="text" icon={<ReloadOutlined />} onClick={handleLocalRefresh}>Refresh</Button>
            </Tooltip>
          </div>

          <Space wrap className="justify-center sm:justify-end">
            <Button icon={<SettingOutlined />} onClick={() => setPrinterModalOpen(true)}>
              <Badge status={isConnected ? 'success' : 'default'} text={printerType === 'lan' ? `${printerIp}:${printerPort}` : 'Browser print'} />
            </Button>
            <Button onClick={onClose}>Đóng</Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadPDF}>PDF</Button>
            <Button type="primary" icon={<PrinterOutlined />} loading={isPrinting} onClick={handlePrint}>
              In ngay
            </Button>
          </Space>
        </div>
      }
    >
      {documentContent}
    </Modal>
  );
};

export default PrintInvoice;
