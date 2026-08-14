/**
 * POS CENTER - Biti's HTTP API Client
 */

import { API_CONFIG } from './config';
import { ApiResponse } from './response';
import { TOKEN_STORAGE_KEY } from '../services/authStorage';

export class ApiClient {
  private posHost: string;

  constructor(posHost: string = API_CONFIG.posHost) {
    this.posHost = posHost ? posHost.replace(/\/+$/, '') : '';
  }

  private getUrl(endpoint: string): string {
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return this.posHost ? `${this.posHost}${cleanPath}` : cleanPath;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-App': 'POS-CENTER-BITIS',
      'ngrok-skip-browser-warning': 'true',
    };

    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      let url = this.getUrl(endpoint);
      if (params) {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) query.append(k, String(v));
        });
        const queryString = query.toString();
        if (queryString) url += `?${queryString}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        return ApiResponse.error<T>(`HTTP Error: ${response.statusText}`, response.status);
      }

      const json = await response.json().catch(() => null);
      if (!json) {
        return ApiResponse.success<T>({} as T, 'Success');
      }
      return ApiResponse.success<T>(json.data !== undefined ? json.data : json, json.message || 'Success');
    } catch (err: any) {
      return ApiResponse.error<T>(err.message || 'Network Request Failed', 500);
    }
  }

  public async post<T, P = any>(endpoint: string, payload: P): Promise<ApiResponse<T>> {
    try {
      const url = this.getUrl(endpoint);
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        return ApiResponse.error<T>(`HTTP Error: ${response.statusText}`, response.status);
      }

      const json = await response.json();
      return ApiResponse.success<T>(json.data !== undefined ? json.data : json, json.message || 'Created successfully', 201);
    } catch (err: any) {
      return ApiResponse.error<T>(err.message || 'Network Request Failed', 500);
    }
  }

  public async put<T, P = any>(endpoint: string, payload: P): Promise<ApiResponse<T>> {
    try {
      const url = this.getUrl(endpoint);
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        return ApiResponse.error<T>(`HTTP Error: ${response.statusText}`, response.status);
      }

      const json = await response.json();
      return ApiResponse.success<T>(json.data !== undefined ? json.data : json, json.message || 'Updated successfully', 200);
    } catch (err: any) {
      return ApiResponse.error<T>(err.message || 'Network Request Failed', 500);
    }
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const url = this.getUrl(endpoint);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        return ApiResponse.error<T>(`HTTP Error: ${response.statusText}`, response.status);
      }

      const json = await response.json();
      return ApiResponse.success<T>(json.data !== undefined ? json.data : json, json.message || 'Deleted successfully', 200);
    } catch (err: any) {
      return ApiResponse.error<T>(err.message || 'Network Request Failed', 500);
    }
  }
}

export const apiClient = new ApiClient();
export const posApiClient = apiClient;
export const receiptsApiClient = apiClient;
