import { API_CONFIG } from '../api/config';
import { getAxiosErrorMessage, httpClient } from '../api/httpClient';
import { OrderRequestDto, OrderResponseDto, OrderMapper, OrderSearchPayloadRequest, OrderSearchPayloadDto } from '../dtos/OrderDto';
import { DataType } from '../components/orders/orderTypes';
import { OrderMapper as OrderHelperMapper, cleanSiteCode } from '../components/orders/orderHelpers';
import { cleanPayload } from '../utils/cleanPayload';
import seedOrderDetailsJson from '../seed/seedOrderDetails.json';
import { ApiResponseError, createApiErrorResponse, extractErrorMessage, toApiResponseError } from '../api/response';

export const API_BASE_URL = API_CONFIG.posHost;

export interface ReceiptSearchResponse {
  items: DataType[];
  total: number;
  rawResponse: any;
}

export class OrderService {
  /**
   * Flow 1: POST /api/receipts-center/summary-search
   */
  public async searchReceipts(payloadDto: OrderSearchPayloadDto): Promise<ReceiptSearchResponse> {
    const cleanedPayload = cleanPayload(payloadDto as Record<string, unknown>);
    const url = `/api/receipts-center/summary-search`;

    let json: any = null;
    try {
      const response = await httpClient.post(url, cleanedPayload);
      json = response.data;
    } catch (err) {
      const error = getAxiosErrorMessage(err, 'Lỗi phản hồi từ máy chủ API');
      const message = extractErrorMessage(error.data) ?? error.message;
      throw toApiResponseError({...error, message,});
      //throw new Error(getAxiosErrorMessage(err, 'Lỗi phản hồi từ máy chủ API').message);
    }

    if (json && (json.success === false || json.isSuccess === false)) {
      throw new Error(json.error || json.message || json.code || 'Tìm kiếm chứng từ thất bại từ máy chủ API');
    }

    let rawItems: any[] = [];
    let totalCount = 0;

    const extractTotal = (obj: any): number | null => {
      if (!obj || typeof obj !== 'object') return null;
      if (obj.totalItems !== undefined && obj.totalItems !== null) return Number(obj.totalItems);
      if (obj.totalCount !== undefined && obj.totalCount !== null) return Number(obj.totalCount);
      if (obj.total !== undefined && obj.total !== null) return Number(obj.total);
      if (obj.count !== undefined && obj.count !== null) return Number(obj.count);
      return null;
    };

    if (json) {
      if (Array.isArray(json)) {
        rawItems = json;
        totalCount = json.length;
      } else if (Array.isArray(json.data)) {
        rawItems = json.data;
        totalCount = extractTotal(json) ?? extractTotal(json.data) ?? json.data.length;
      } else if (json.data && Array.isArray(json.data.items)) {
        rawItems = json.data.items;
        totalCount = extractTotal(json.data) ?? extractTotal(json) ?? json.data.items.length;
      } else if (Array.isArray(json.items)) {
        rawItems = json.items;
        totalCount = extractTotal(json) ?? extractTotal(json.data) ?? json.items.length;
      } else if (json.data && typeof json.data === 'object') {
        rawItems = [json.data];
        totalCount = extractTotal(json) ?? extractTotal(json.data) ?? 1;
      } else if (typeof json === 'object') {
        rawItems = [json];
        totalCount = extractTotal(json) ?? 1;
      }
    }

    const items: DataType[] = rawItems.map((item, idx) => OrderHelperMapper.fromBackendJsonb(item, String(idx + 1)));

    return {
      items,
      total: Number(totalCount || items.length),
      rawResponse: json,
    };
  }

  private pendingDetailRequests = new Map<string, Promise<DataType>>();

  private isReceiptDetailShape(raw: any): boolean {
    return Boolean(
      raw &&
      typeof raw === 'object' &&
      !Array.isArray(raw) &&
      (raw.receiptInfo || raw.sellerInfo || raw.invoiceInfo || raw.lineItems || raw.receiptTotals || raw.payments)
    );
  }

  private matchesReceipt(raw: any, receipt: string): boolean {
    if (!raw || !receipt) return false;

    const receiptCandidates = [
      raw.receiptInfo?.receiptNumber,
      raw.receiptInfo?.uuid,
      raw.receiptNumber,
      raw.uuid,
      raw.id,
    ]
      .filter(Boolean)
      .map((value: any) => String(value).trim());

    return receiptCandidates.some(value => value === receipt || value.endsWith(`-${receipt}`));
  }

  private extractReceiptDetailPayload(json: any, receipt: string): any | null {
    if (!json) return null;

    const payload = json.data !== undefined && json.data !== null ? json.data : json;
    const candidates = Array.isArray(payload) ? payload : [payload];
    const detailCandidates = candidates.filter(candidate => this.isReceiptDetailShape(candidate));

    if (detailCandidates.length === 0) return null;

    return detailCandidates.find(candidate => this.matchesReceipt(candidate, receipt)) || detailCandidates[0];
  }

  /**
   * Flow 2: GET /api/receipts-center/detail/{soCTu}/{maSite}?forceRefresh={forceRefresh}
   */
  public async getReceiptDetail(site: string, receipt: string, forceRefresh: boolean = false): Promise<DataType> {
    const safeDecode = (val: string): string => {
      if (!val) return '';
      try {
        return decodeURIComponent(val).trim();
      } catch {
        return val.trim();
      }
    };

    const decodedSite = safeDecode(site);
    const decodedReceipt = safeDecode(receipt);
    const normalizedSite = cleanSiteCode(decodedSite);
    const normalizedReceipt = decodedReceipt;

    const cacheKey = `${normalizedSite}::${normalizedReceipt}::${Boolean(forceRefresh)}`;
    if (this.pendingDetailRequests.has(cacheKey)) {
      return this.pendingDetailRequests.get(cacheKey)!;
    }

    const promise = (async () => {
      const cleanSite = encodeURIComponent(normalizedSite);
      const cleanReceipt = encodeURIComponent(normalizedReceipt);
      const query = `forceRefresh=${Boolean(forceRefresh)}`;

      const primaryUrl = `/api/receipts-center/detail/${cleanSite}/${cleanReceipt}?${query}`;

      let json: any = null;
      let httpError: string | null = null;

      try {
        const response = await httpClient.get(primaryUrl);
        json = response.data;
      } catch (err: any) {
        const errorResponse = getAxiosErrorMessage(err, 'Lỗi kết nối');
        httpError = errorResponse.message;
        json = err.response?.data || null;
      }

      if (json && (json.success === false || json.isSuccess === false)) {
        httpError = json.message || json.error || json.code || httpError || 'API detail returned unsuccessful response';
      }

      const rawDetail = this.extractReceiptDetailPayload(json, normalizedReceipt);
      if (rawDetail) {
        return OrderHelperMapper.fromBackendJsonb(rawDetail, `detail-${cleanReceipt}`);
      }

      // Development/reference fallback keeps the same nested schema as /api/receipts-center/detail.
      const rawSeedDetails: any[] = Array.isArray(seedOrderDetailsJson?.data) ? seedOrderDetailsJson.data : [];
      const seedMatch = rawSeedDetails.find((item: any) => {
        const rNo = item.receiptInfo?.receiptNumber || item.receiptNumber;
        const rUuid = item.receiptInfo?.uuid || item.uuid;
        return (rNo && rNo === normalizedReceipt) || (rUuid && rUuid === normalizedReceipt);
      });

      if (seedMatch) {
        return OrderHelperMapper.fromBackendJsonb(seedMatch, `detail-${cleanReceipt}`);
      }

      const errReason = json?.message || json?.error || json?.code || httpError || `Không tìm thấy Biên Nhận ${normalizedReceipt}`;
      throw new Error(String(errReason));
    })();

    const trackedPromise = promise.finally(() => {
      this.pendingDetailRequests.delete(cacheKey);
    });

    this.pendingDetailRequests.set(cacheKey, trackedPromise);
    return trackedPromise;
  }

  /**
   * Search method compatible with OrderSearchPayloadRequest
   */
  public async searchOrdersPost(payloadReq: OrderSearchPayloadRequest): Promise<{
    items: DataType[];
    total: number;
    allFilteredCount: number;
    payload: OrderSearchPayloadDto;
  }> {
    const payload = payloadReq.toApiPayload ? payloadReq.toApiPayload() : (payloadReq as OrderSearchPayloadDto);
    const result = await this.searchReceipts(payload);
    return {
      items: result.items,
      total: result.total,
      allFilteredCount: result.total,
      payload,
    };
  }

  public getOrders(): OrderResponseDto[] {
    return [];
  }

  public saveOrders(orders: OrderResponseDto[]): void {}

  public getOrderByReceiptNo(receiptNo: string): OrderResponseDto | undefined {
    return undefined;
  }

  public createOrder(requestDto: OrderRequestDto): OrderResponseDto {
    return OrderMapper.fromRequestDto(requestDto);
  }

  public deleteOrder(receiptNo: string): boolean {
    return true;
  }

  public resetToSeed(): OrderResponseDto[] {
    return [];
  }
}

export const orderService = new OrderService();
