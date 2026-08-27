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

export class ApiResponseError<T = unknown> extends Error {
  public readonly response: ApiResponse<T>;
  public readonly code: number;
  public readonly data: T;

  constructor(response: ApiResponse<T>) {
    super(response.message);
    this.name = 'ApiResponseError';
    this.response = response;
    this.code = response.code;
    this.data = response.data;
  }
}

export function toApiResponseError<T = unknown>(
  response: ApiResponse<T>
): ApiResponseError<T> {
  return new ApiResponseError(response);
}

export function extractErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const messages = Object.values(data)
    .flatMap(value => Array.isArray(value) ? value : [value])
    .filter(value => typeof value === 'string' && value.trim());

  return messages.length > 0
    ? [...new Set(messages)].join('\n')
    : null;
}

export function createApiErrorResponse<T = unknown>(
  payload: any,
  fallbackMessage: string = 'Internal Error',
  fallbackCode: number = 500
): ApiResponse<T> {
  const rawCode = payload?.code ?? fallbackCode;
  const code = Number.isFinite(Number(rawCode)) ? Number(rawCode) : fallbackCode;
  const message = String(payload?.message || payload?.error || fallbackMessage);
  const data = payload?.data !== undefined
    ? payload.data
    : payload?.errors !== undefined
      ? payload.errors
      : payload;

  return new ApiResponse<T>(false, (data ?? null) as T, message, code);
}
