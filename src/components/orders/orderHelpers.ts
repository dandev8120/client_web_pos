import { 
  DataType, 
  OrderDetailFull, 
  BackendOrderItemJsonb, 
  BackendApiResponse,
  BackendFullDetailJson,
  OrderItem,
  BackendLineItem,
  PaymentSplit,
  BackendPaymentDetailItem
} from './orderTypes';

export function cleanSiteCode(rawSite?: any): string {
  if (!rawSite || rawSite === 'null' || rawSite === 'undefined') return '1134';
  const str = String(rawSite).trim();
  if (/^\d{3,6}$/.test(str)) return str;
  const match = str.match(/\d{3,6}/);
  if (match) return match[0];
  if (str.toUpperCase().startsWith('POS ')) return str.substring(4).trim() || '1134';
  return str || '1134';
}

function toDisplayText(value: unknown): string {
  if (value === undefined || value === null || value === 'null' || value === 'undefined') {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(toDisplayText).filter(Boolean).join('/');
  }

  if (typeof value === 'object') {
    return '';
  }

  return String(value).trim();
}

export class OrderMapper {
  /**
   * Trích xuất danh sách đơn hàng từ bất kỳ định dạng JSON trả về nào từ Backend:
   * 1. Response chuẩn: { success: true, data: [...] }
   * 2. Response đơn: { success: true, data: {...} }
   * 3. Trực tiếp mảng: [ {...}, {...} ]
   * 4. Trực tiếp object: { siteCode: ... }
   */
  static extractOrderItems(parsed: any): BackendOrderItemJsonb[] {
    if (!parsed) return [];

    if (typeof parsed === 'object' && parsed !== null && 'data' in parsed && parsed.data !== undefined) {
      if (Array.isArray(parsed.data)) {
        return parsed.data;
      } else if (parsed.data && typeof parsed.data === 'object') {
        return [parsed.data];
      }
    }

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (typeof parsed === 'object') {
      return [parsed];
    }

    return [];
  }

  /**
   * Ánh xạ (Map) một đối tượng Backend Order JSONB sang DataType cho giao diện Bảng
   */
  static fromBackendJsonb(raw: BackendOrderItemJsonb | any, keyIndex?: string): DataType {
    if (!raw) {
      raw = {};
    }

    if (raw.id && raw.storeId && !raw.siteCode && !raw.receiptNumber && raw.customer && typeof raw.customer === 'string') {
      return {
        ...raw,
        storeId: cleanSiteCode(raw.storeId),
        key: raw.key || keyIndex || String(Math.random())
      };
    }

    const storeId = (raw.siteCode && raw.siteCode !== 'null') 
      ? cleanSiteCode(raw.siteCode) 
      : ((raw.storeId && raw.storeId !== 'null') 
        ? cleanSiteCode(raw.storeId) 
        : (raw.receiptInfo?.salesChannel ? cleanSiteCode(raw.receiptInfo.salesChannel) : '1134'));
      
    const id = (raw.receiptNumber && raw.receiptNumber !== 'null') 
      ? String(raw.receiptNumber) 
      : ((raw.receiptInfo?.receiptNumber && raw.receiptInfo.receiptNumber !== 'null')
        ? String(raw.receiptInfo.receiptNumber)
        : ((raw.id && raw.id !== 'null') ? String(raw.id) : `HD-${Math.floor(100000 + Math.random() * 900000)}`));

    // Handle invoiceNumber when null
    const invoiceNo = (raw.invoiceNumber && raw.invoiceNumber !== 'null') 
      ? String(raw.invoiceNumber) 
      : ((raw.receiptInfo?.invoiceNumber && raw.receiptInfo.invoiceNumber !== 'null')
        ? String(raw.receiptInfo.invoiceNumber)
        : ((raw.invoiceNo && raw.invoiceNo !== 'null') ? String(raw.invoiceNo) : 'Chưa xuất'));

    let paymentInfo: { paymentMethod?: string; bankCode?: string; transactionCode?: string; transactionStatus?: string } | undefined;
    let qrDetails: string[] = [];

    const pmRaw = raw.payment?.paymentMethod ?? raw.payment?.PaymentMethod ?? raw.paymentMethod ?? raw.PaymentMethod ?? raw.paymentType;
    const bcRaw = raw.payment?.bankCode ?? raw.payment?.BankCode ?? raw.bankCode ?? raw.BankCode;
    const tcRaw = raw.payment?.transactionCode ?? raw.payment?.TransactionCode ?? raw.transactionCode ?? raw.TransactionCode ?? raw.qrTransactionId;
    const stRaw = raw.payment?.transactionStatus ?? raw.payment?.TransactionStatus ?? raw.transactionStatus ?? raw.TransactionStatus ?? raw.paymentStatus ?? raw.PaymentStatus;

    const pm = toDisplayText(pmRaw);
    const bc = toDisplayText(bcRaw);
    const tc = toDisplayText(tcRaw);
    const st = toDisplayText(stRaw);

    if (pm || bc || tc || st) {
      paymentInfo = {
        paymentMethod: pm,
        bankCode: bc,
        transactionCode: tc,
        transactionStatus: st
      };

      if (pm) qrDetails.push(`PaymentMethod: ${pm}`);
      if (bc) qrDetails.push(`BankCode: ${bc}`);
      if (tc) qrDetails.push(`TransactionCode: ${tc}`);
      if (st) qrDetails.push(`TransactionStatus: ${st}`);
    } else if (Array.isArray(raw.qrDetails)) {
      qrDetails = raw.qrDetails.map(toDisplayText).filter(Boolean);
    } else if (raw.qrTransactionId && raw.qrTransactionId !== 'N/A') {
      qrDetails = [String(raw.qrTransactionId)];
    }

    // Customer can have customerName: null, phoneNumber: null
    const custObj = raw.customer && typeof raw.customer === 'object' ? raw.customer : {};
    const rawCustName = custObj.customerName ?? (typeof raw.customer === 'string' ? raw.customer : null);
    const customer = (rawCustName && rawCustName !== 'null') ? String(rawCustName) : 'Khách mua hàng';

    const rawCustCode = custObj.customerCode ?? raw.customerCode;
    const customerCode = (rawCustCode && rawCustCode !== 'null') ? String(rawCustCode) : '000000000000001101';

    const rawPhone = custObj.phoneNumber ?? custObj.phone ?? raw.phone;
    const phone = (rawPhone && rawPhone !== 'null') ? String(rawPhone) : 'Chưa cập nhật';

    // Employee can have employeeName: null, employeeCode: null
    const empObj = raw.employee && typeof raw.employee === 'object' ? raw.employee : {};
    const rawEmpName = empObj.employeeName ?? (typeof raw.employee === 'string' ? raw.employee : null);
    const employee = (rawEmpName && rawEmpName !== 'null') ? String(rawEmpName) : 'Nhân viên quầy';

    const rawEmpCode = empObj.employeeCode ?? raw.employeeCode;
    const employeeCode = (rawEmpCode && rawEmpCode !== 'null') ? String(rawEmpCode) : 'BT009458';

    let discountsList: string[] = [];
    const promoRawStr = raw.promotions?.promotionNote || raw.promotionNote;
    if (promoRawStr) {
      discountsList = String(promoRawStr).split(',').map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(raw.discountsList)) {
      discountsList = raw.discountsList.filter(Boolean);
    }

    const totalAmount = Number(raw.receiptTotals?.totalAmount ?? raw.totalAmount ?? raw.total ?? 0);

    // Calculate discount amount in VND correctly
    let pctVal = 0;
    if (raw.discountPercentage !== undefined && raw.discountPercentage !== null) {
      pctVal = Number(raw.discountPercentage) || 0;
    } else if (raw.DiscountPercentage !== undefined && raw.DiscountPercentage !== null) {
      pctVal = Number(raw.DiscountPercentage) || 0;
    }

    let discountVal = 0;
    if (raw.totalDiscount !== undefined && raw.totalDiscount !== null) {
      const td = Number(raw.totalDiscount) || 0;
      if (td > 0 && td <= 100 && pctVal === 0 && raw.lineDiscount === undefined && raw.discount === undefined) {
        pctVal = td;
        discountVal = Math.round((totalAmount * td) / 100);
      } else {
        discountVal = td;
      }
    } else if (raw.TotalDiscount !== undefined && raw.TotalDiscount !== null) {
      const td = Number(raw.TotalDiscount) || 0;
      if (td > 0 && td <= 100 && pctVal === 0 && raw.lineDiscount === undefined && raw.discount === undefined) {
        pctVal = td;
        discountVal = Math.round((totalAmount * td) / 100);
      } else {
        discountVal = td;
      }
    } else if (raw.lineDiscount !== undefined && raw.lineDiscount !== null) {
      discountVal = Number(raw.lineDiscount) || 0;
    } else if (raw.discount !== undefined && raw.discount !== null) {
      discountVal = Number(raw.discount) || 0;
    } else if (pctVal > 0) {
      discountVal = Math.round((totalAmount * pctVal) / 100);
    }

    const lineDiscount = discountVal;
    const discount = discountVal;
    const totalDiscount = discountVal;

    const promotionNote = raw.promotions?.promotionNote !== undefined && raw.promotions?.promotionNote !== null
      ? String(raw.promotions.promotionNote)
      : (raw.promotionNote !== undefined && raw.promotionNote !== null
        ? String(raw.promotionNote)
        : (raw.PromotionNote !== undefined && raw.PromotionNote !== null
          ? String(raw.PromotionNote)
          : (raw.promotion || (discountsList.length > 0 ? discountsList.join(', ') : ''))));

    const sapSyncObj = raw.activityLog?.sapSync || raw.activity_log?.sapSync;
    const sapStatus = sapSyncObj?.status !== undefined
      ? (sapSyncObj.status ? 1 : 0)
      : (raw.statusSap !== undefined && raw.statusSap !== null
        ? (raw.statusSap ? 1 : 0) 
        : (raw.sapStatus !== undefined ? (raw.sapStatus === true ? 1 : raw.sapStatus === false ? 0 : Number(raw.sapStatus)) : 0));

    const status = raw.status !== undefined ? raw.status : null; // null -> Auto Hoàn thành

    const calculatedQty = Array.isArray(raw.lineItems) && raw.lineItems.length > 0
      ? raw.lineItems.reduce((acc: number, item: any) => acc + Number(item.quantity || 1), 0)
      : 1;

    return {
      key: keyIndex || String(Math.random()),
      id,
      storeId,
      invoiceNo,
      caseCode: raw.receiptInfo?.businessType || raw.transactionType || raw.caseCode || 'PXHH',
      customer,
      customerCode,
      phone,
      employee,
      employeeCode,
      shiftName: raw.employee?.shiftName || raw.shiftName || 'CA SÁNG',
      total: totalAmount,
      quantity: raw.quantity !== undefined && raw.quantity !== null ? Number(raw.quantity) : calculatedQty,
      lineDiscount,
      totalDiscount,
      discount,
      discountsList,
      discountType: pctVal > 0 ? `${pctVal}%` : (discountsList.length > 0 ? 'Khuyến mại' : 'Không'),
      promotion: promotionNote || 'Không',
      promotionNote,
      time: raw.receiptInfo?.receiptTime
        ? String(raw.receiptInfo.receiptTime).replace('T', ' ')
        : (raw.transactionDateTime 
          ? String(raw.transactionDateTime).replace('T', ' ') 
          : (raw.time || new Date().toISOString().replace('T', ' ').substring(0, 19))),
      qrTransactionId: qrDetails[0] || raw.qrTransactionId || 'N/A',
      qrDetails,
      paymentInfo,
      sapStatus,
      status,
      rid: `REQ-${id.slice(-5)}`,
      vatType: 'Doanh nghiệp',
      rawJsonb: raw
    };
  }

  /**
   * Parse chuỗi JSON backend (Response API hoặc JSONB Array) thành danh sách DataType
   */
  static parseAndMap(jsonString: string): DataType[] {
    const parsed = JSON.parse(jsonString);
    const rawItems = OrderMapper.extractOrderItems(parsed);
    return rawItems.map((item, index) => OrderMapper.fromBackendJsonb(item, `JSONB-${Date.now()}-${index}`));
  }
}

export function mapBackendOrderToDataType(raw: any, keyIndex?: string): DataType {
  return OrderMapper.fromBackendJsonb(raw, keyIndex);
}

export function mapReceiptSummaryToOrder(raw: any, keyIndex?: string): DataType {
  return OrderMapper.fromBackendJsonb(raw, keyIndex);
}

export function mapReceiptDetailToOrderDetail(raw: any, keyIndex?: string): DataType {
  return OrderMapper.fromBackendJsonb(raw, keyIndex);
}

export const sampleBackendApiResponse: BackendApiResponse = { success: true, data: [] } as any;
export const sampleBackendJsonbOrders: BackendOrderItemJsonb[] = [];
export const sampleBackendJsonbOrder = sampleBackendApiResponse;

export const initialDataSource: DataType[] = [];

/**
 * Parses discount codes string into separate display lines according to type (separated by comma)
 * and multiple codes of the same type (separated by hyphen).
 * Example: GotIt:0147146659-8661368202-2184040777-6828558469-2000031909,Loyalty:BIHX0BW0T995IQW7OC
 * Returns:
 *   GotIt:0147146659
 *   -8661368202
 *   -2184040777
 *   -6828558469
 *   -2000031909,
 *   Loyalty:BIHX0BW0T995IQW7OC
 */
export function parseDiscountCodesToLines(rawStr: string): string[] {
  if (!rawStr || !rawStr.trim()) return [];

  const types = rawStr.split(',').map(s => s.trim()).filter(Boolean);
  const resultLines: string[] = [];

  types.forEach((typeStr, typeIndex) => {
    const isLastType = typeIndex === types.length - 1;
    const parts = typeStr.split('-');

    parts.forEach((part, partIndex) => {
      const isFirstPart = partIndex === 0;
      const isLastPartInType = partIndex === parts.length - 1;

      let lineText = isFirstPart ? part : `-${part}`;
      if (isLastPartInType && !isLastType) {
        lineText += ',';
      }
      resultLines.push(lineText);
    });
  });

  return resultLines;
}

/**
 * Trích xuất các trường thông tin thanh toán từ paymentInfo hoặc qrDetails
 */
export function parsePaymentDetails(record: DataType): {
  paymentMethod: string;
  bankCode: string;
  transactionCode: string;
  transactionStatus: string;
  hasInfo: boolean;
  rawList: string[];
} {
  let pm = toDisplayText(record.paymentInfo?.paymentMethod || (record as any).paymentMethod || record.rawJsonb?.paymentMethod || record.rawJsonb?.payment?.paymentMethod);
  let bc = toDisplayText(record.paymentInfo?.bankCode || (record as any).bankCode || record.rawJsonb?.bankCode || record.rawJsonb?.payment?.bankCode);
  let tc = toDisplayText(record.paymentInfo?.transactionCode || (record as any).transactionCode || record.rawJsonb?.transactionCode || record.rawJsonb?.payment?.transactionCode);
  let st = toDisplayText(record.paymentInfo?.transactionStatus || (record as any).transactionStatus || (record as any).paymentStatus || record.rawJsonb?.transactionStatus || record.rawJsonb?.payment?.transactionStatus);
  const rawList: string[] = [];

  if (record.qrDetails && record.qrDetails.length > 0) {
    for (const rawItem of record.qrDetails) {
      const item = toDisplayText(rawItem);
      if (!item) continue;

      if (item.startsWith('PaymentMethod: ')) {
        if (!pm) pm = item.replace('PaymentMethod: ', '').trim();
      } else if (item.startsWith('BankCode: ')) {
        if (!bc) bc = item.replace('BankCode: ', '').trim();
      } else if (item.startsWith('TransactionCode: ')) {
        if (!tc) tc = item.replace('TransactionCode: ', '').trim();
      } else if (item.startsWith('TransactionStatus: ')) {
        if (!st) st = item.replace('TransactionStatus: ', '').trim();
      } else {
        rawList.push(item);
      }
    }
  }

  const hasInfo = Boolean(pm || bc || tc || st || rawList.length > 0);
  return { paymentMethod: pm, bankCode: bc, transactionCode: tc, transactionStatus: st, hasInfo, rawList };
}

export function formatOrderRowToText(record: DataType): string {
  const qrText = record.qrDetails && record.qrDetails.length > 0 
    ? record.qrDetails.join('; ') 
    : (record.qrTransactionId && record.qrTransactionId !== 'N/A' ? record.qrTransactionId : 'N/A');

  const discountsText = record.discountsList && record.discountsList.length > 0
    ? record.discountsList.join(', ')
    : (record.discount > 0 ? `-${record.discount.toLocaleString('vi-VN')} ₫` : '0 ₫');

  const sapStatusText = (record.sapStatus === 1 || record.sapStatus === '1' || record.sapStatus === true) 
    ? 'Đã đồng bộ' 
    : 'Chờ';

  const orderStatusText = record.status === 'cancelled' 
    ? 'Đã hủy' 
    : (record.status === 'completed' || record.status === null || record.status === undefined ? 'Hoàn thành' : record.status);

  return [
    `Mã cửa hàng: ${record.storeId || ''}`,
    `Số chứng từ: ${record.id || ''}`,
    `Số hóa đơn: ${record.invoiceNo || ''}`,
    `Mã giao dịch Qr: ${qrText}`,
    `Khách hàng: ${record.customer || ''}${record.customerCode ? ` (Mã: ${record.customerCode})` : ''}${record.phone ? ` - SĐT: ${record.phone}` : ''}`,
    `Nhân viên: ${record.employee || ''}${record.employeeCode ? ` (Mã: ${record.employeeCode})` : ''}`,
    `Lượng hàng: ${record.quantity || 1}`,
    `Chiết khấu: ${(record.lineDiscount || 0).toLocaleString('vi-VN')} ₫`,
    `Mã giảm giá: ${discountsText}`,
    `Thực thu: ${(record.total || 0).toLocaleString('vi-VN')} ₫`,
    `Tên ca: ${record.shiftName || 'Ca Sáng'}`,
    `Tên vụ việc: ${record.caseCode || 'PXHH'}`,
    `Giờ chứng từ: ${record.time || ''}`,
    `Trạng thái SAP: ${sapStatusText}`,
    `Trạng thái đơn: ${orderStatusText}`
  ].join('\n');
}

export function generateVatLink(record: DataType): string {
  const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  const baseUrl = isProd ? window.location.origin : '';
  return `${baseUrl}/vat-portal?oid=${record.id}&sid=${encodeURIComponent(record.storeId)}&rid=${record.rid}&sig=mock_sig_hash&a=${record.total}&ct=VND`;
}

export function renderValue(val: any, fallback = 'Không có dữ liệu'): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return fallback;
    return trimmed;
  }
  return String(val);
}

export function getOrderDetailFull(order: DataType): OrderDetailFull {
  if (!order) {
    order = {} as DataType;
  }

  const raw: BackendFullDetailJson | any = order.rawJsonb || {};
  const v = (val: any, fallback = 'Không có dữ liệu') => renderValue(val, fallback);

  // Sub-objects in Backend JSON
  const sellerInfo = raw.sellerInfo || {};
  const receiptInfo = raw.receiptInfo || {};
  const customerInfo = raw.customer && typeof raw.customer === 'object' ? raw.customer : {};
  const invoiceInfo = raw.invoiceInfo || {};
  const receiptTotals = raw.receiptTotals || {};
  const promotionsInfo = raw.promotions || {};
  const employeeInfo = raw.employee && typeof raw.employee === 'object' ? raw.employee : {};
  const activityLog = raw.activityLog || {};

  // Store & Seller
  const site = v(sellerInfo.site);
  const storeName = v(sellerInfo.storeName ?? sellerInfo.sellerLegalName ?? order.storeId);
  const sellerLegalName = v(sellerInfo.sellerLegalName);
  const sellerTaxCode = v(sellerInfo.sellerTaxCode);
  const storeAddress = v(sellerInfo.storeAddress);
  const sellerAddressLine = v(sellerInfo.sellerAddressLine);
  const sellerWebsite = v(sellerInfo.sellerWebsite);
  const invoiceSeries = v(sellerInfo.invoiceSeries);

  // Receipt
  const receiptNumber = v(receiptInfo.receiptNumber ?? order.id);
  const invoiceNumber = v(receiptInfo.invoiceNumber ?? order.invoiceNo);
  const salesChannel = v(receiptInfo.salesChannel ?? order.storeId);
  const receiptTime = v(receiptInfo.receiptTime ?? order.time);
  const uuid = v(receiptInfo.uuid);
  const originalUuid = v(receiptInfo.originalUuid);
  const transactionName = v(receiptInfo.transactionName ?? order.caseCode ?? 'N/A');
  const businessType = v(receiptInfo.businessType ?? 'Bán Lẻ');

  // Customer
  const custCode = v(customerInfo.customerCode ?? order.customerCode);
  const custName = v(customerInfo.customerName ?? order.customer);
  const custPhone = v(customerInfo.phoneNumber ?? order.phone);
  const custEmail = v(customerInfo.email);
  const custDistrict = v(customerInfo.district);
  const registrationDate = v(customerInfo.registrationDate);
  const membershipTier = v(customerInfo.membershipTier ?? 'Membership');

  // Invoice / Buyer
  const buyerName = v(invoiceInfo.buyerName);
  const buyerLegalName = v(invoiceInfo.buyerLegalName);
  const buyerTaxCode = v(invoiceInfo.buyerTaxCode);
  const buyerAddress = v(invoiceInfo.buyerAddressLine);
  const buyerPhone = v(invoiceInfo.buyerPhoneNumber);
  const buyerEmail = v(invoiceInfo.buyerEmail);
  const buyerCode = v(invoiceInfo.buyerCode);

  // Line Items - Dynamic extraction from lineItems, items, products, or details
  let itemsList: OrderItem[] = [];
  const rawItems = Array.isArray(raw.lineItems) && raw.lineItems.length > 0 
    ? raw.lineItems 
    : (Array.isArray(raw.items) && raw.items.length > 0
      ? raw.items
      : (Array.isArray(raw.products) && raw.products.length > 0
        ? raw.products
        : (Array.isArray(raw.details) && raw.details.length > 0
          ? raw.details
          : [])));

  if (rawItems.length > 0) {
    itemsList = rawItems.map((item: any) => ({
      productName: v(item.productName || item.name || item.title || item.product || `Sản phẩm (${order.id})`),
      sku: v(item.productCode || item.sku || item.code),
      barcode: v(item.barcode || item.barcodeNo),
      category: v(item.categoryName ? `${v(item.categoryCode, '')} - ${item.categoryName}`.trim() : (item.categoryCode || item.category)),
      unit: v(item.unit || item.unitName, 'Đôi'),
      quantity: Number(item.quantity || item.qty || 1),
      price: Number(item.unitPrice || item.price || 0),
      discountPercentage: Number(item.discountPercentage || 0),
      discount: Number(item.discountAmount || item.discount || 0),
      vat: Number(item.vatAmount),
      total: Number(item.totalAmount || item.total || item.amount || 0),
    }));
  } else {
    itemsList = [
      {
        productName: `Sản phẩm đơn hàng (${order.id})`,
        sku: order.sku || 'N/A',
        barcode: order.barcode || 'N/A',
        category: 'Hàng hóa tiêu thụ',
        unit: 'Đôi',
        quantity: order.quantity || 1,
        price: order.total || 0,
        discountPercentage: order.discountPercentage || 0,
        discount: order.discount || 0,
        vat: order.total || 0,
        total: order.total || 0,
      }
    ];
  }

  // Totals
  const totalAmountVal = Number(receiptTotals.totalAmount ?? order.total ?? 0);
  const customerPaidAmountVal = Number(receiptTotals.customerPaidAmount) || totalAmountVal;
  const changeAmountVal = Number(receiptTotals.changeAmount ?? 0);
  const cardAmountVal = Number(receiptTotals.cardAmount ?? 0);
  const voucherAmountVal = Number(receiptTotals.voucherAmount ?? 0);
  const totalInWords = v(receiptTotals.totalAmountWithTaxInWords);

  // Payments
  let paymentSplits: PaymentSplit[] = [];
  let paymentMethodStr = 'Khác';
  let transactionIdStr = 'Không có dữ liệu';

  if (Array.isArray(raw.payments) && raw.payments.length > 0) {
    paymentSplits = raw.payments.map((p: BackendPaymentDetailItem) => {
      const pm = v(p.paymentMethodName || p.paymentMethodCode);
      const bc = v(p.bankCode, '');
      const tc = v(p.transactionCode, '');
      const ref = [bc, tc].filter(Boolean).join(' - ') || 'Không có dữ liệu';
      return {
        method: pm,
        amount: Number(p.amount || 0),
        reference: ref
      };
    });
    const firstP = raw.payments[0];
    paymentMethodStr = v(firstP.paymentMethodName || firstP.paymentMethodCode);
    transactionIdStr = v(firstP.transactionCode);
  } else if (order.paymentInfo) {
    paymentMethodStr = v(order.paymentInfo.paymentMethod);
    transactionIdStr = v(order.paymentInfo.transactionCode);
  }

  // Employees
  const empName = v(employeeInfo.employeeName ?? (typeof order.employee === 'string' ? order.employee : undefined));
  const empCode = v(employeeInfo.employeeCode ?? order.employeeCode);
  const shiftName = v(employeeInfo.shiftName ?? order.shiftName);
  const receiptDate = v(employeeInfo.receiptDate);

  // Activity Logs
  const receiptCreated = v(activityLog.receipt?.createdAt ?? order.time);
  const paymentCreated = v(activityLog.payment?.createdAt);
  const paymentLastUpdated = v(activityLog.payment?.lastUpdatedAt);
  const invoiceEntryDate = v(activityLog.invoice?.entryDate);
  const invoiceCreated = v(activityLog.invoice?.createdAt);
  const billPrinted = v(activityLog.billPrinting?.printedDate);
  const sapSyncTime = v(activityLog.sapSync?.createdTime);
  const sapSyncStatus = activityLog.sapSync?.status;

  return {
    rawJsonb: raw,
    store: {
      name: sellerLegalName !== 'Không có dữ liệu' ? sellerLegalName : storeName,
      code: salesChannel,
      site: site,
      branch: storeName,
      address: storeAddress,
      addressLine: sellerAddressLine,
      hotline: '1900 6868',
      email: 'chamsockhachhang@bitis.com.vn',
      website: sellerWebsite,
      taxCode: sellerTaxCode,
      invoiceCode: invoiceSeries,
      legalName: sellerLegalName,
      logo: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=100&h=100&fit=crop&crop=faces',
      cashier: `${empName} (${empCode})`,
      seller: `${empName} (${empCode})`,
    },
    order: {
      orderId: receiptNumber,
      invoiceId: invoiceNumber,
      invoiceNo: invoiceNumber,
      createdAt: receiptTime,
      paidAt: paymentCreated !== 'Không có dữ liệu' ? paymentCreated : receiptTime,
      status: order.status === 'completed' ? 'Đã hoàn thành' : order.status === 'cancelled' ? 'Đã hủy' : 'Hoàn tất',
      orderType: transactionName,
      salesChannel: salesChannel,
      creator: `${empName} (${empCode})`,
      notes: v(promotionsInfo.promotionNote, 'Không có ghi chú'),
    },
    customer: {
      customerId: custCode,
      fullName: custName,
      phone: custPhone,
      email: custEmail,
      address: custDistrict !== 'Không có dữ liệu' ? custDistrict : 'Không có dữ liệu',
      memberRank: membershipTier,
      taxCode: buyerTaxCode,
    },
    vat: {
      hasVat: invoiceNumber !== 'Không có dữ liệu' && invoiceNumber !== 'Chưa xuất' ? 'Có' : 'Chưa có',
      companyName: buyerLegalName,
      taxCode: buyerTaxCode,
      companyAddress: buyerAddress,
      invoiceEmail: buyerEmail,
      vatRate: '10%',
      vatAmount: `${itemsList.reduce((sum, item) => sum + item.vat, 0).toLocaleString('vi-VN')} ₫`,
      formNo: '1/001',
      serialNo: invoiceSeries,
      eInvoiceNo: invoiceNumber,
      fullName: buyerName,
      phone: buyerPhone,
      vatType: buyerTaxCode !== 'Không có dữ liệu' ? 'Doanh nghiệp' : 'Cá nhân',
      enterpriseRelCode: buyerCode !== 'Không có dữ liệu' ? buyerCode : undefined,
    },
    discount: {
      discountCode: v(promotionsInfo.promotionNote),
      voucher: voucherAmountVal > 0 ? `${voucherAmountVal.toLocaleString('vi-VN')} ₫` : 'Không có dữ liệu',
      coupon: 'Không có dữ liệu',
      promoProgram: v(promotionsInfo.promotionNote),
      percentageDiscount: '0%',
      amountDiscount: `${itemsList.reduce((sum, item) => sum + item.discount, 0).toLocaleString('vi-VN')} ₫`,
      memberDiscount: '0%',
      staffDiscount: '0%',
      gift: 'Không có dữ liệu',
    },
    payment: {
      method: paymentMethodStr,
      transactionId: transactionIdStr,
      amountPaid: `${customerPaidAmountVal.toLocaleString('vi-VN')} ₫`,
      customerCash: `${customerPaidAmountVal.toLocaleString('vi-VN')} ₫`,
      changeAmount: `${changeAmountVal.toLocaleString('vi-VN')} ₫`,
      paymentStatus: 'Thành công (SUCCESS)',
      paymentTime: paymentCreated !== 'Không có dữ liệu' ? paymentCreated : receiptTime,
      splits: paymentSplits.length > 0 ? paymentSplits : [
        { method: paymentMethodStr, amount: totalAmountVal, reference: transactionIdStr }
      ]
    },
    items: itemsList,
    totals: {
      subtotal: `${Number(receiptTotals.totalItemAmount || receiptTotals.TotalItemAmount || receiptTotals.subTotal || receiptTotals.subtotal || receiptTotals.totalAmount || totalAmountVal).toLocaleString('vi-VN')} ₫`,
      productDiscountTotal: `${Number(receiptTotals.totalDiscountAmount || receiptTotals.TotalDiscountAmount || receiptTotals.productDiscountTotal || receiptTotals.discountAmount || 0).toLocaleString('vi-VN')} ₫`,
      orderDiscountTotal: '0 ₫',
      voucherTotal: `${voucherAmountVal.toLocaleString('vi-VN')} ₫`,
      discountTotal: `${Number(receiptTotals.totalDiscountAmount || receiptTotals.TotalDiscountAmount || receiptTotals.totalDiscount || receiptTotals.discountTotal || receiptTotals.discountAmount || 0).toLocaleString('vi-VN')} ₫`,
      shippingFee: '0 ₫ (Bán Lẻ tại quầy)',
      surcharge: '0 ₫',
      vatTotal: `${Number(receiptTotals.totalVatAmount || receiptTotals.TotalVatAmount || receiptTotals.vatAmount || receiptTotals.vatTotal || 0).toLocaleString('vi-VN')} ₫`,
      totalAmount: `${totalAmountVal.toLocaleString('vi-VN')} ₫`,
      amountPaid: `${customerPaidAmountVal.toLocaleString('vi-VN')} ₫`,
      amountDue: '0 ₫',
      totalQuantity: receiptTotals.totalQuantity || receiptTotals.TotalQuantity,
    },
    delivery: {
      recipientName: buyerName !== 'Không có dữ liệu' ? buyerName : custName,
      recipientPhone: buyerPhone !== 'Không có dữ liệu' ? buyerPhone : custPhone,
      deliveryAddress: buyerAddress,
      carrier: 'Giao tại quầy',
      trackingNo: 'Không có dữ liệu',
      shippingFee: '0 ₫',
      deliveryStatus: 'Đã hoàn thành',
    },
    employees: {
      cashier: `${empName} (${empCode})`,
      salesStaff: `${empName} (${empCode})`,
      consultant: 'Không có dữ liệu',
      approver: 'Quản lý cửa hàng',
      shipper: 'Không có dữ liệu',
      workShift: shiftName,
    },
    history: {
      createdAt: receiptCreated,
      updatedAt: paymentLastUpdated !== 'Không có dữ liệu' ? paymentLastUpdated : receiptCreated,
      creator: `${empName} (${empCode})`,
      updater: `${empName} (${empCode})`,
      canceller: 'Không có dữ liệu',
      cancelReason: 'Không có dữ liệu',
      refundInfo: 'Không có dữ liệu',
      operationLogs: [
        { time: receiptCreated, action: 'Khởi tạo chứng từ bán lẻ POS', user: `${empName} (${empCode})` },
        ...(paymentCreated !== 'Không có dữ liệu' ? [{ time: paymentCreated, action: 'Xác nhận thanh toán thành công', user: 'Hệ thống Cổng Thanh Toán' }] : []),
        ...(invoiceCreated !== 'Không có dữ liệu' ? [{ time: invoiceCreated, action: 'Tạo hóa đơn điện tử VAT', user: 'Hệ thống VAT' }] : []),
        ...(billPrinted !== 'Không có dữ liệu' ? [{ time: billPrinted, action: 'In phiếu xuất bán lẻ', user: `${empName} (${empCode})` }] : []),
        ...(sapSyncTime !== 'Không có dữ liệu' ? [{ time: sapSyncTime, action: `Đồng bộ Middleware SAP ERP (${sapSyncStatus ? 'Thành công' : 'Chờ xử lý'})`, user: 'System Bot' }] : []),
      ],
      systemLogs: {
        createdTime: receiptCreated,
        paymentTime: paymentCreated,
        qrCreatedTime: paymentCreated,
        qrPaymentTime: paymentCreated,
        eInvoiceSentTime: invoiceCreated,
        eInvoiceSuccessTime: invoiceCreated,
        sapSyncTime: sapSyncTime,
      }
    },
    receiptVoucher: {
      voucherType: businessType,
      caseCode: transactionName,
      documentNo: receiptNumber,
      uuid: uuid,
      originalUuid: originalUuid,
      salesChannel: salesChannel,
      createdAt: receiptTime,
    }
  };
}
