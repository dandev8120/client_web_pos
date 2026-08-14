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
  traceId?: string;
  sessionId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  ipAddress?: string;
  forwardedFor?: string;
  browserName?: string;
  browserVersion?: string;
  userAgent?: string;
  platform?: string;
  language?: string;
  timezone?: string;
  viewport?: string;
  screen?: string;
  routeTitle?: string;
  referrer?: string;
  locationHref?: string;
  locationOrigin?: string;
  geoLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  metadata?: Record<string, any>;
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
  traceId?: string;
  sessionId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  ipAddress?: string;
  forwardedFor?: string;
  browserName?: string;
  browserVersion?: string;
  userAgent?: string;
  platform?: string;
  language?: string;
  timezone?: string;
  viewport?: string;
  screen?: string;
  routeTitle?: string;
  referrer?: string;
  locationHref?: string;
  locationOrigin?: string;
  geoLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  metadata?: Record<string, any>;
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
      traceId: raw.traceId ? String(raw.traceId) : undefined,
      sessionId: raw.sessionId ? String(raw.sessionId) : undefined,
      userId: raw.userId ? String(raw.userId) : undefined,
      userName: raw.userName ? String(raw.userName) : undefined,
      userEmail: raw.userEmail ? String(raw.userEmail) : undefined,
      ipAddress: raw.ipAddress ? String(raw.ipAddress) : undefined,
      forwardedFor: raw.forwardedFor ? String(raw.forwardedFor) : undefined,
      browserName: raw.browserName ? String(raw.browserName) : undefined,
      browserVersion: raw.browserVersion ? String(raw.browserVersion) : undefined,
      userAgent: raw.userAgent ? String(raw.userAgent) : undefined,
      platform: raw.platform ? String(raw.platform) : undefined,
      language: raw.language ? String(raw.language) : undefined,
      timezone: raw.timezone ? String(raw.timezone) : undefined,
      viewport: raw.viewport ? String(raw.viewport) : undefined,
      screen: raw.screen ? String(raw.screen) : undefined,
      routeTitle: raw.routeTitle ? String(raw.routeTitle) : undefined,
      referrer: raw.referrer ? String(raw.referrer) : undefined,
      locationHref: raw.locationHref ? String(raw.locationHref) : undefined,
      locationOrigin: raw.locationOrigin ? String(raw.locationOrigin) : undefined,
      geoLocation: raw.geoLocation && typeof raw.geoLocation === 'object' ? raw.geoLocation : undefined,
      metadata: raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : undefined,
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
      traceId: dto.traceId,
      sessionId: dto.sessionId,
      userId: dto.userId,
      userName: dto.userName,
      userEmail: dto.userEmail,
      ipAddress: dto.ipAddress,
      forwardedFor: dto.forwardedFor,
      browserName: dto.browserName,
      browserVersion: dto.browserVersion,
      userAgent: dto.userAgent,
      platform: dto.platform,
      language: dto.language,
      timezone: dto.timezone,
      viewport: dto.viewport,
      screen: dto.screen,
      routeTitle: dto.routeTitle,
      referrer: dto.referrer,
      locationHref: dto.locationHref,
      locationOrigin: dto.locationOrigin,
      geoLocation: dto.geoLocation,
      metadata: dto.metadata,
    };
  }
}
