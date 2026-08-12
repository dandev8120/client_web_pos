/**
 * Data Transfer Objects (DTO) and Mapper for Audit Log Domain
 */

export interface AuditLogRequestDto {
  action: string;
  element?: string;
  path?: string;
  text?: string;
  value?: string;
  method?: string;
  url?: string;
  status?: number;
  durationMs?: number;
  requestBody?: any;
  responseBody?: any;
}

export interface AuditLogResponseDto {
  timestamp: string;
  action: string;
  element: string;
  path: string;
  text?: string;
  value?: string;
  method?: string;
  url?: string;
  status?: number;
  durationMs?: number;
  requestBody?: any;
  responseBody?: any;
}

export class AuditLogMapper {
  static toResponseDto(raw: any): AuditLogResponseDto {
    return {
      timestamp: raw.timestamp || new Date().toISOString(),
      action: String(raw.action || 'ACTION'),
      element: String(raw.element || 'Element'),
      path: String(raw.path || '/'),
      text: raw.text ? String(raw.text) : undefined,
      value: raw.value ? String(raw.value) : undefined,
      method: raw.method ? String(raw.method) : undefined,
      url: raw.url ? String(raw.url) : undefined,
      status: typeof raw.status === 'number' ? raw.status : undefined,
      durationMs: typeof raw.durationMs === 'number' ? raw.durationMs : undefined,
      requestBody: raw.requestBody !== undefined ? raw.requestBody : undefined,
      responseBody: raw.responseBody !== undefined ? raw.responseBody : undefined,
    };
  }

  static fromRequestDto(dto: AuditLogRequestDto): AuditLogResponseDto {
    return {
      timestamp: new Date().toISOString(),
      action: dto.action,
      element: dto.element || 'Element',
      path: dto.path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      text: dto.text,
      value: dto.value,
      method: dto.method,
      url: dto.url,
      status: dto.status,
      durationMs: dto.durationMs,
      requestBody: dto.requestBody,
      responseBody: dto.responseBody,
    };
  }
}
