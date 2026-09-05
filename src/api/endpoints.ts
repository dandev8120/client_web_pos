/**
 * POS CENTER - Biti's API Endpoints Client Layer
 */

import { apiClient, receiptsApiClient } from './apiClient';
import { ApiResponse } from './response';

// DTO imports
import { OrderResponseDto, OrderRequestDto, OrderSearchPayloadDto } from '../dtos/OrderDto';
import { ProductResponseDto, ProductRequestDto } from '../dtos/ProductDto';
import { CustomerResponseDto, CustomerRequestDto } from '../dtos/CustomerDto';
import { PromotionResponseDto, PromotionRequestDto } from '../dtos/PromotionDto';
import { RoleResponseDto, RoleRequestDto, PermissionNodeDto, MeAuthorizationResponseDto, FunctionNodeDto } from '../dtos/AuthorizationDto';
import { AuditLogResponseDto, AuditLogRequestDto } from '../dtos/AuditLogDto';

export const orderEndpoints = {
  getOrders: (params?: Record<string, any>): Promise<ApiResponse<OrderResponseDto[]>> => {
    return apiClient.get<OrderResponseDto[]>('/api/v1/orders', params);
  },
  searchOrders: (payload: OrderSearchPayloadDto): Promise<ApiResponse<OrderResponseDto[]>> => {
    return receiptsApiClient.post<OrderResponseDto[], OrderSearchPayloadDto>('/api/receipts-center/summary-search', payload);
  },
  createOrder: (payload: OrderRequestDto): Promise<ApiResponse<OrderResponseDto>> => {
    return apiClient.post<OrderResponseDto, OrderRequestDto>('/api/v1/orders', payload);
  },
  cancelOrder: (receiptNumber: string, payload?: { reason?: string }): Promise<ApiResponse<boolean>> => {
    return apiClient.post<boolean, { reason?: string } | undefined>(`/api/v1/orders/${receiptNumber}/cancel`, payload);
  },
  syncSap: (receiptNumber: string): Promise<ApiResponse<boolean>> => {
    return apiClient.post<boolean, { receiptNumber: string }>('/api/v1/sap/sync', { receiptNumber });
  }
};

export const productEndpoints = {
  getProducts: (params?: Record<string, any>): Promise<ApiResponse<ProductResponseDto[]>> => {
    return apiClient.get<ProductResponseDto[]>('/api/v1/products', params);
  },
  createProduct: (payload: ProductRequestDto): Promise<ApiResponse<ProductResponseDto>> => {
    return apiClient.post<ProductResponseDto, ProductRequestDto>('/api/v1/products', payload);
  },
  updateProduct: (key: string, payload: Partial<ProductRequestDto>): Promise<ApiResponse<ProductResponseDto>> => {
    return apiClient.put<ProductResponseDto, Partial<ProductRequestDto>>(`/api/v1/products/${key}`, payload);
  },
  deleteProduct: (key: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`/api/v1/products/${key}`);
  },
  syncSapProduct: (key: string): Promise<ApiResponse<boolean>> => {
    return apiClient.post<boolean, { key: string }>('/api/v1/sap/sync/product', { key });
  }
};

export const customerEndpoints = {
  getCustomers: (params?: Record<string, any>): Promise<ApiResponse<CustomerResponseDto[]>> => {
    return apiClient.get<CustomerResponseDto[]>('/api/v1/customers', params);
  },
  createCustomer: (payload: CustomerRequestDto): Promise<ApiResponse<CustomerResponseDto>> => {
    return apiClient.post<CustomerResponseDto, CustomerRequestDto>('/api/v1/customers', payload);
  },
  updateCustomer: (key: string, payload: Partial<CustomerRequestDto>): Promise<ApiResponse<CustomerResponseDto>> => {
    return apiClient.put<CustomerResponseDto, Partial<CustomerRequestDto>>(`/api/v1/customers/${key}`, payload);
  },
  deleteCustomer: (key: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`/api/v1/customers/${key}`);
  }
};

export const promotionEndpoints = {
  getPromotions: (params?: Record<string, any>): Promise<ApiResponse<PromotionResponseDto[]>> => {
    return apiClient.get<PromotionResponseDto[]>('/api/v1/promotions', params);
  },
  createPromotion: (payload: PromotionRequestDto): Promise<ApiResponse<PromotionResponseDto>> => {
    return apiClient.post<PromotionResponseDto, PromotionRequestDto>('/api/v1/promotions', payload);
  },
  deletePromotion: (key: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`/api/v1/promotions/${key}`);
  }
};

export const accessControlEndpoints = {
  getMeAuthorization: (): Promise<ApiResponse<MeAuthorizationResponseDto>> => {
    return apiClient.get<MeAuthorizationResponseDto>('/api/v1/me/authorization');
  },
  getRoles: (): Promise<ApiResponse<RoleResponseDto[]>> => {
    return apiClient.get<RoleResponseDto[]>('/api/v1/authorization/roles');
  },
  getRoleByCode: (roleCode: string): Promise<ApiResponse<RoleResponseDto>> => {
    return apiClient.get<RoleResponseDto>(`/api/v1/authorization/roles/${roleCode}`);
  },
  getFunctionTree: (): Promise<ApiResponse<FunctionNodeDto[]>> => {
    return apiClient.get<FunctionNodeDto[]>('/api/v1/authorization/functions/tree');
  },
  getFunctionNodeByCode: (functionCode: string): Promise<ApiResponse<FunctionNodeDto>> => {
    return apiClient.get<FunctionNodeDto>(`/api/v1/authorization/functions/${functionCode}`);
  },
  getPermissionTree: (): Promise<ApiResponse<PermissionNodeDto[]>> => {
    return apiClient.get<PermissionNodeDto[]>('/api/v1/authorization/tree');
  },
  createRole: (payload: RoleRequestDto): Promise<ApiResponse<RoleResponseDto>> => {
    return apiClient.post<RoleResponseDto, RoleRequestDto>('/api/v1/authorization/roles', payload);
  },
  updateRole: (roleCode: string, payload: Partial<RoleRequestDto>): Promise<ApiResponse<RoleResponseDto>> => {
    return apiClient.put<RoleResponseDto, Partial<RoleRequestDto>>(`/api/v1/authorization/roles/${roleCode}`, payload);
  },
  deleteRole: (roleCode: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`/api/v1/authorization/roles/${roleCode}`);
  },
  createFunctionNode: (payload: Partial<FunctionNodeDto>): Promise<ApiResponse<FunctionNodeDto>> => {
    return apiClient.post<FunctionNodeDto, Partial<FunctionNodeDto>>('/api/v1/authorization/functions', payload);
  },
  updateFunctionNode: (functionCode: string, payload: Partial<FunctionNodeDto>): Promise<ApiResponse<FunctionNodeDto>> => {
    return apiClient.put<FunctionNodeDto, Partial<FunctionNodeDto>>(`/api/v1/authorization/functions/${functionCode}`, payload);
  },
  deleteFunctionNode: (functionCode: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`/api/v1/authorization/functions/${functionCode}`);
  },
  updateRolePermissions: (roleCode: string, payload: { allowedUrls: string[]; buttonPermissions: string[]; functionCodes?: string[] }): Promise<ApiResponse<RoleResponseDto>> => {
    return apiClient.put<RoleResponseDto, { allowedUrls: string[]; buttonPermissions: string[]; functionCodes?: string[] }>(`/api/v1/authorization/roles/${roleCode}`, payload);
  }
};

export const auditEndpoints = {
  getAuditLogs: (): Promise<ApiResponse<AuditLogResponseDto[]>> => {
    return apiClient.get<AuditLogResponseDto[]>('/api/v1/audit-logs');
  },
  createAuditLog: (payload: AuditLogRequestDto): Promise<ApiResponse<AuditLogResponseDto>> => {
    return apiClient.post<AuditLogResponseDto, AuditLogRequestDto>('/api/v1/audit-logs', payload);
  }
};
