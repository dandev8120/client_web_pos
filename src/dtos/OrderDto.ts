/**
 * Data Transfer Objects (DTO) and Mapper for Order Domain
 */

import { cleanPayload } from '../utils/cleanPayload';

export interface OrderSearchPayloadDto {
  pageIndex?: number;
  pageSize?: number;
  keyword?: string;
  maSites?: string[];
  soCTus?: string[];
  maKH?: string;
  fromDate?: string;
  toDate?: string;
  thucThuMin?: number;
  thucThuMax?: number;
  tienTheMin?: number;
  tienPhieuMin?: number;
  dienThoai?: string;
  maHH?: string;
  maBC?: string;
  chietKhauMin?: number;
  chietKhauMax?: number;
  loaiCK?: string;
  forceRefresh?: boolean;
  paymentKeyword?: string;
  invoiceKeyword?: string;
}

export class OrderSearchPayloadRequest implements OrderSearchPayloadDto {
  pageIndex?: number;
  pageSize?: number;
  keyword?: string;
  maSites?: string[];
  soCTus?: string[];
  maKH?: string;
  fromDate?: string;
  toDate?: string;
  thucThuMin?: number;
  thucThuMax?: number;
  tienTheMin?: number;
  tienPhieuMin?: number;
  dienThoai?: string;
  maHH?: string;
  maBC?: string;
  chietKhauMin?: number;
  chietKhauMax?: number;
  loaiCK?: string;
  forceRefresh?: boolean;
  paymentKeyword?: string;
  invoiceKeyword?: string;

  constructor(init?: Partial<OrderSearchPayloadDto>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  public toApiPayload(): OrderSearchPayloadDto {
    return cleanPayload(this as unknown as Record<string, unknown>) as OrderSearchPayloadDto;
  }
}

export interface OrderRequestDto {
  siteCode?: string;
  receiptNumber?: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  paymentMethod: string;
  items: Array<{
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface OrderLineItemDto {
  productCode: string;
  barcode: string;
  productName: string;
  categoryCode?: string;
  categoryName?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  vatAmount?: number;
  totalAmount: number;
}

export interface OrderPaymentDto {
  paymentMethodCode: string;
  paymentMethodName: string;
  transactionCode?: string;
  amount: number;
  bankCode?: string | null;
  status: string;
}

export interface OrderResponseDto {
  key: string;
  siteCode: string;
  receiptNumber: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  employeeName: string;
  totalAmount: number;
  quantity: number;
  paymentMethod: string;
  transactionDateTime: string;
  statusSap: boolean;
  status: string;
  lineItems: OrderLineItemDto[];
  payments: OrderPaymentDto[];
  rawBackendJson?: any;
}

export class OrderMapper {
  static extractRawOrders(backendPayload: any): any[] {
    if (!backendPayload) return [];
    if (backendPayload.data) {
      return Array.isArray(backendPayload.data) ? backendPayload.data : [backendPayload.data];
    }
    if (Array.isArray(backendPayload)) return backendPayload;
    return [backendPayload];
  }

  static toResponseDto(raw: any, index?: number): OrderResponseDto {
    const receiptNo = raw.receiptNumber || raw.id || `HD-${Math.floor(100000 + Math.random() * 900000)}`;
    const siteCode = raw.siteCode || raw.storeId || '1125';
    const invoiceNo = raw.invoiceNumber || raw.invoiceNo || 'Chưa xuất';

    const customerObj = raw.customer || {};
    const customerName = typeof customerObj === 'string' ? customerObj : (customerObj.customerName || raw.customerName || 'Khách vãng lai');
    const customerPhone = typeof customerObj === 'object' ? (customerObj.phoneNumber || raw.customerPhone || '') : '';

    const employeeObj = raw.employee || {};
    const employeeName = typeof employeeObj === 'object' ? (employeeObj.employeeName || 'Nguyễn Thị Bích Thoa') : String(employeeObj);

    const pm = raw.payment?.paymentMethod || raw.payments?.[0]?.paymentMethodName || raw.paymentMethod || 'CASH';

    return {
      key: raw.key || `ord-${receiptNo}-${index || Math.random()}`,
      siteCode,
      receiptNumber: receiptNo,
      invoiceNumber: invoiceNo,
      customerName,
      customerPhone,
      employeeName,
      totalAmount: Number(raw.totalAmount || raw.total || 0),
      quantity: Number(raw.quantity || raw.lineItems?.length || 1),
      paymentMethod: pm,
      transactionDateTime: raw.transactionDateTime || raw.receiptInfo?.receiptTime || new Date().toISOString(),
      statusSap: Boolean(raw.statusSap ?? raw.activityLog?.sapSync?.status),
      status: raw.status || 'COMPLETED',
      lineItems: Array.isArray(raw.lineItems) ? raw.lineItems : [],
      payments: Array.isArray(raw.payments) ? raw.payments : [],
      rawBackendJson: raw
    };
  }

  static fromRequestDto(dto: OrderRequestDto): OrderResponseDto {
    const receiptNo = dto.receiptNumber || `0008K7PX${Math.floor(1000000 + Math.random() * 9000000)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const lineItems: OrderLineItemDto[] = dto.items.map(item => ({
      productCode: item.productCode,
      barcode: `893456${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      productName: item.productName,
      unit: 'Đôi',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalAmount: item.quantity * item.unitPrice
    }));

    return {
      key: `ord-${receiptNo}`,
      siteCode: dto.siteCode || '1125',
      receiptNumber: receiptNo,
      invoiceNumber: `C26MAC${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: dto.customerName || 'Khách vãng lai',
      customerPhone: dto.customerPhone || '',
      employeeName: 'Nguyễn Thị Bích Thoa',
      totalAmount: dto.totalAmount,
      quantity: dto.items.reduce((acc, i) => acc + i.quantity, 0),
      paymentMethod: dto.paymentMethod,
      transactionDateTime: now,
      statusSap: false,
      status: 'COMPLETED',
      lineItems: lineItems,
      payments: [
        {
          paymentMethodCode: dto.paymentMethod,
          paymentMethodName: dto.paymentMethod,
          amount: dto.totalAmount,
          status: 'SUCCESS'
        }
      ]
    };
  }
}
