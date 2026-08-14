export interface BackendPayment {
  paymentMethod?: string;
  PaymentMethod?: string;
  bankCode?: string;
  BankCode?: string;
  transactionCode?: string;
  TransactionCode?: string;
  transactionStatus?: string;
  TransactionStatus?: string;
}

export interface BackendCustomer {
  customerCode?: string;
  customerName?: string;
  phoneNumber?: string;
}

export interface BackendEmployee {
  employeeCode?: string;
  employeeName?: string;
}

export interface BackendOrderItemJsonb {
  siteCode?: string;
  receiptNumber?: string;
  invoiceNumber?: string;
  payment?: BackendPayment;
  customer?: BackendCustomer | string;
  employee?: BackendEmployee | string;
  quantity?: number;
  totalDiscount?: number;
  discountPercentage?: number;
  promotionNote?: string;
  totalAmount?: number;
  shiftName?: string;
  transactionType?: string;
  transactionDateTime?: string;
  statusSap?: boolean;
  status?: 'pending' | 'completed' | 'cancelled' | null;
  [key: string]: any;
}

// Full Backend JSONB Detail Interfaces
export interface BackendSellerInfo {
  sellerLegalName?: string | null;
  sellerTaxCode?: string | null;
  sellerAddressLine?: string | null;
  sellerWebsite?: string | null;
  storeName?: string | null;
  storeAddress?: string | null;
  invoiceSeries?: string | null;
}

export interface BackendReceiptInfo {
  businessType?: string | null;
  transactionName?: string | null;
  receiptNumber?: string | null;
  uuid?: string | null;
  invoiceNumber?: string | null;
  salesChannel?: string | null;
  receiptTime?: string | null;
}

export interface BackendCustomerDetail {
  customerCode?: string | null;
  phoneNumber?: string | null;
  customerName?: string | null;
  email?: string | null;
  district?: string | null;
  registrationDate?: string | null;
  membershipTier?: string | null;
}

export interface BackendInvoiceInfo {
  buyerName?: string | null;
  buyerLegalName?: string | null;
  buyerTaxCode?: string | null;
  buyerAddressLine?: string | null;
  buyerPhoneNumber?: string | null;
  buyerEmail?: string | null;
  buyerCode?: string | null;
}

export interface BackendLineItem {
  productCode?: string | null;
  barcode?: string | null;
  productName?: string | null;
  categoryCode?: string | null;
  categoryName?: string | null;
  unit?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  discountPercentage?: number | null;
  discountAmount?: number | null;
  vatAmount?: number | null;
  totalAmount?: number | null;
}

export interface BackendReceiptTotals {
  customerPaidAmount?: number | null;
  changeAmount?: number | null;
  cardAmount?: number | null;
  voucherAmount?: number | null;
  totalAmount?: number | null;
  totalAmountWithTaxInWords?: string | null;
  TotalItemAmount?: number | null;
  TotalDiscountAmount?: number | null;
  TotalVatAmount?: number | null;
  totalItemAmount?: number | null;
  totalDiscountAmount?: number | null;
  totalVatAmount?: number | null;
}

export interface BackendPromotions {
  promotionNote?: string | null;
}

export interface BackendPaymentDetailItem {
  paymentMethodCode?: string | null;
  paymentMethodName?: string | null;
  transactionCode?: string | null;
  amount?: number | null;
  bankCode?: string | null;
  status?: string | null;
}

export interface BackendEmployeeDetail {
  employeeCode?: string | null;
  employeeName?: string | null;
  receiptDate?: string | null;
  shiftName?: string | null;
}

export interface BackendActivityLog {
  receipt?: { createdAt?: string | null };
  payment?: { createdAt?: string | null; lastUpdatedAt?: string | null };
  invoice?: { entryDate?: string | null; createdAt?: string | null; lastUpdatedAt?: string | null };
  billPrinting?: { printedDate?: string | null };
  sapSync?: { status?: boolean | null; createdTime?: string | null };
}

export interface BackendFullDetailJson {
  sellerInfo?: BackendSellerInfo;
  receiptInfo?: BackendReceiptInfo;
  customer?: BackendCustomerDetail;
  invoiceInfo?: BackendInvoiceInfo;
  lineItems?: BackendLineItem[];
  receiptTotals?: BackendReceiptTotals;
  promotions?: BackendPromotions;
  payments?: BackendPaymentDetailItem[];
  employee?: BackendEmployeeDetail;
  activityLog?: BackendActivityLog;
}

export interface BackendApiResponse<T = BackendOrderItemJsonb> {
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  totalItems?: number;
  data: T[] | T;
  success?: boolean;
  code?: string | number | null;
  message?: string | null;
}

export interface ParsedPaymentInfo {
  paymentMethod?: string;
  bankCode?: string;
  transactionCode?: string;
  transactionStatus?: string;
}

export interface DataType {
  key: string;
  id: string; // Số chứng từ
  storeId: string; // Mã cửa hàng
  invoiceNo: string; // Số hóa đơn
  caseCode: string; // Mã vụ việc
  customer: string; // Tên khách hàng
  customerCode: string; // Mã khách hàng
  phone: string; // Số điện thoại
  email?: string;
  employee: string; // Tên nhân viên
  employeeCode?: string; // Mã nhân viên
  shiftName?: string; // Tên ca
  total: number; // Thực thu
  cardPayment?: number; // Tiền thẻ
  quantity: number; // Lượng hàng
  lineDiscount?: number; // Chiết khấu
  totalDiscount?: number; // Chiết khấu (từ field totalDiscount)
  discount: number; // Tổng giảm giá
  discountsList?: string[]; // Nhiều mã giảm giá
  discountType?: string; // Loại chiết khấu
  promotion?: string; // Khuyến mãi
  promotionNote?: string; // Mã giảm giá (từ field promotionNote)
  time: string; // Giờ chứng từ
  qrTransactionId?: string; // Mã thanh toán QR
  qrDetails?: string[]; // Danh sách mã QR e.g. ["VNPay: 88492042", "ZaLoPay: 99402123"]
  paymentInfo?: ParsedPaymentInfo; // Chi tiết thông tin thanh toán đã parse
  sku?: string; // Mã hàng hóa
  barcode?: string; // Mã barcode
  sapStatus?: number | boolean | 'sync' | 'pending' | 'failed' | string; // 0/false (Chờ), 1/true (Đã đồng bộ)
  status?: 'pending' | 'completed' | 'cancelled' | null; // null -> Auto Hoàn thành
  rid?: string; // Mã yêu cầu cho VAT
  vatType?: 'Cá nhân' | 'Doanh nghiệp';
  enterpriseRelCode?: string; // Mã quan hệ doanh nghiệp
  rawJsonb?: any; // Dữ liệu JSONB gốc từ backend
}

export interface StoreInfo {
  name: string;
  code: string;
  branch: string;
  address: string;
  hotline: string;
  email: string;
  website: string;
  taxCode: string;
  invoiceCode: string; // Mã hóa đơn (C25MAC)
  legalName: string; // Tên pháp lý
  logo: string;
  cashier: string;
  seller: string;
}

export interface InvoiceOrderInfo {
  orderId: string;
  invoiceId: string;
  invoiceNo: string;
  createdAt: string;
  paidAt: string;
  status: string;
  orderType: string;
  salesChannel: string;
  creator: string;
  notes: string;
}

export interface CustomerInfo {
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  memberRank: string;
  taxCode: string;
}

export interface VatInfo {
  hasVat: string;
  companyName: string;
  taxCode: string;
  companyAddress: string;
  invoiceEmail: string;
  vatRate: string;
  vatAmount: string;
  formNo: string;
  serialNo: string;
  eInvoiceNo: string;
  fullName: string;
  phone: string;
  vatType: 'Cá nhân' | 'Doanh nghiệp';
  enterpriseRelCode?: string;
}

export interface DiscountInfo {
  discountCode: string;
  voucher: string;
  coupon: string;
  promoProgram: string;
  percentageDiscount: string;
  amountDiscount: string;
  memberDiscount: string;
  staffDiscount: string;
  gift: string;
}

export interface PaymentSplit {
  method: string;
  amount: number;
  reference: string;
}

export interface PaymentInfo {
  method: string;
  transactionId: string;
  amountPaid: string;
  customerCash: string;
  changeAmount: string;
  paymentStatus: string;
  paymentTime: string;
  splits?: PaymentSplit[];
}

export interface OrderItem {
  productName: string;
  sku: string;
  barcode: string;
  category: string;
  size: string;
  color: string;
  unit: string;
  quantity: number;
  price: number;
  discount: number;
  vat: number;
  total: number;
}

export interface TotalSummary {
  subtotal: string;
  productDiscountTotal: string;
  orderDiscountTotal: string;
  voucherTotal: string;
  discountTotal: string;
  shippingFee: string;
  surcharge: string;
  vatTotal: string;
  totalAmount: string;
  amountPaid: string;
  amountDue: string;
}

export interface DeliveryInfo {
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  carrier: string;
  trackingNo: string;
  shippingFee: string;
  deliveryStatus: string;
}

export interface EmployeeInfo {
  cashier: string;
  salesStaff: string;
  consultant: string;
  approver: string;
  shipper: string;
  workShift: string;
}

export interface OperationLog {
  time: string;
  action: string;
  user: string;
}

export interface SystemLogs {
  createdTime: string;
  paymentTime: string;
  qrCreatedTime: string;
  qrPaymentTime: string;
  eInvoiceSentTime: string;
  eInvoiceSuccessTime: string;
  sapSyncTime: string;
}

export interface HistoryInfo {
  createdAt: string;
  updatedAt: string;
  creator: string;
  updater: string;
  canceller: string;
  cancelReason: string;
  refundInfo: string;
  operationLogs: OperationLog[];
  systemLogs: SystemLogs;
}

export interface ReceiptVoucherInfo {
  voucherType: string;
  caseCode: string;
  documentNo: string;
  uuid: string;
  salesChannel: string;
  createdAt: string;
}

export interface OrderDetailFull {
  store: StoreInfo;
  order: InvoiceOrderInfo;
  customer: CustomerInfo;
  vat: VatInfo;
  discount: DiscountInfo;
  payment: PaymentInfo;
  items: OrderItem[];
  totals: TotalSummary;
  delivery: DeliveryInfo;
  employees: EmployeeInfo;
  history: HistoryInfo;
  receiptVoucher: ReceiptVoucherInfo;
  rawJsonb?: BackendFullDetailJson | any;
}

export interface OrderStats {
  totalOrders: number;
  totalWithInvoice: number;
  invoiceRate: number;
  totalQrOrders: number;
  qrRate: number;
  totalCashOrders: number;
  cashRate: number;
  totalAtmCkOrders: number;
  atmCkRate: number;
  totalVoucherOrders?: number;
  voucherRate?: number;
  totalAmount: number;
  avgOrderValue: number;
  totalQuantity: number;
  totalDiscounts: number;
  discountedOrdersCount: number;
  syncedCount: number;
  pendingSapCount: number;
  pendingSapRate: number;
  syncRate: number;
}
