/**
 * POS CENTER - Standardized API Response Class
 */

export interface PaginationMeta {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export class ApiResponse<T> {
  public success: boolean;
  public data: T;
  public message: string;
  public code: number;
  public timestamp: string;
  public pagination?: PaginationMeta;

  constructor(
    success: boolean,
    data: T,
    message: string = '',
    code: number = 200,
    pagination?: PaginationMeta
  ) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.code = code;
    this.timestamp = new Date().toISOString();
    this.pagination = pagination;
  }

  static success<T>(data: T, message: string = 'Success', code: number = 200, pagination?: PaginationMeta): ApiResponse<T> {
    return new ApiResponse<T>(true, data, message, code, pagination);
  }

  static error<T>(message: string = 'Internal Error', code: number = 500, fallbackData?: T): ApiResponse<T> {
    return new ApiResponse<T>(false, (fallbackData ?? null) as unknown as T, message, code);
  }
}
