/**
 * POS CENTER - Biti's HTTP API Client
 */

import { API_CONFIG } from './config';
import { ApiResponse } from './response';
import { createHttpClient, getAxiosErrorMessage } from './httpClient';

export class ApiClient {
  private posHost: string;
  private http: ReturnType<typeof createHttpClient>;

  constructor(posHost: string = API_CONFIG.posHost) {
    this.posHost = posHost ? posHost.replace(/\/+$/, '') : '';
    this.http = createHttpClient({
      baseURL: this.posHost || undefined,
    });
  }

  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await this.http.get(endpoint, {
        params,
        paramsSerializer: (values) => {
          const query = new URLSearchParams();
          Object.entries(values || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) query.append(key, String(value));
          });
          return query.toString();
        },
      });
      const json = response.data;
      if (!json) {
        return ApiResponse.success<T>({} as T, 'Success');
      }
      return ApiResponse.success<T>(json.data !== undefined ? json.data : json, json.message);
    } catch (err: any) {
      return getAxiosErrorMessage<T>(err);
    }
  }

  public async post<T, P = any>(endpoint: string, payload: P): Promise<ApiResponse<T>> {
    try {
      const response = await this.http.post(endpoint, payload);
      const json = response.data;
      return ApiResponse.success<T>(json.data !== undefined ? json.data : json, json.message);
    } catch (err: any) {
      return getAxiosErrorMessage<T>(err);
    }
  }

  public async put<T, P = any>(endpoint: string, payload: P): Promise<ApiResponse<T>> {
    try {
      const response = await this.http.put(endpoint, payload);
      const json = response.data;
      return ApiResponse.success<T>(json.data !== undefined ? json.data : json, json.message);
    } catch (err: any) {
      return getAxiosErrorMessage<T>(err);
    }
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.http.delete(endpoint);
      const json = response.data;
      return ApiResponse.success<T>(json.data !== undefined ? json.data : json, json.message);
    } catch (err: any) {
      return getAxiosErrorMessage<T>(err);
    }
  }
}

export const apiClient = new ApiClient();
export const posApiClient = apiClient;
export const receiptsApiClient = apiClient;