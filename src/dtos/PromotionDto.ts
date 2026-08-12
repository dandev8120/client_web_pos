/**
 * Data Transfer Objects (DTO) and Mapper for Promotion Domain
 */

export interface VisualPresetDto {
  id: string;
  name: string;
  icon: string;
  background: string;
  border: string;
  color: string;
}

export interface ConsoleMenuDto {
  key: string;
  title: string;
  icon: string;
  background: string;
  border: string;
  color: string;
  description: string;
  type: 'action' | 'folder';
  actionView?: string;
  children?: ConsoleMenuDto[];
}

export interface PromotionRequestDto {
  code: string;
  title: string;
  type: string;
  discountValue: number;
  minBillAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface PromotionResponseDto {
  key: string;
  code: string;
  title: string;
  type: string;
  discountValue: number;
  minBillAmount: number;
  maxDiscountAmount: number;
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  endDate: string;
  description: string;
}

export class PromotionMapper {
  static toResponseDto(raw: any, index?: number): PromotionResponseDto {
    return {
      key: String(raw.key || `promo-${index || Date.now()}`),
      code: String(raw.code || `KM-${Math.floor(1000 + Math.random() * 9000)}`),
      title: String(raw.title || raw.name || 'Chương trình KM'),
      type: String(raw.type || 'BILL_PERCENT'),
      discountValue: Number(raw.discountValue ?? 10),
      minBillAmount: Number(raw.minBillAmount ?? 0),
      maxDiscountAmount: Number(raw.maxDiscountAmount ?? 0),
      status: raw.status || 'active',
      startDate: String(raw.startDate || '2026-01-01'),
      endDate: String(raw.endDate || '2026-12-31'),
      description: String(raw.description || '')
    };
  }

  static fromRequestDto(dto: PromotionRequestDto): PromotionResponseDto {
    return {
      key: `promo-${Date.now()}`,
      code: dto.code.toUpperCase(),
      title: dto.title,
      type: dto.type,
      discountValue: dto.discountValue,
      minBillAmount: dto.minBillAmount || 0,
      maxDiscountAmount: dto.maxDiscountAmount || 0,
      status: 'active',
      startDate: dto.startDate,
      endDate: dto.endDate,
      description: dto.description || ''
    };
  }
}
