/**
 * Data Transfer Objects (DTO) and Mapper for Customer Domain
 */

export interface CustomerRequestDto {
  id?: string;
  name: string;
  email: string;
  phone: string;
  plan?: string;
  status?: string;
}

export interface CustomerResponseDto {
  key: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  lastLogin: string;
  color: string;
}

export class CustomerMapper {
  static toResponseDto(raw: any, index?: number): CustomerResponseDto {
    const colors = ['#1677ff', '#722ed1', '#eb2f96', '#fa8c16', '#52c41a', '#f5222d', '#13c2c2'];
    return {
      key: String(raw.key || `cust-${index || Math.random()}`),
      id: String(raw.id || `CUST-00${index || Math.floor(Math.random() * 100)}`),
      name: String(raw.name || 'N/A'),
      email: String(raw.email || ''),
      phone: String(raw.phone || ''),
      plan: String(raw.plan || 'Basic'),
      status: String(raw.status || 'active'),
      lastLogin: String(raw.lastLogin || 'Vừa xong'),
      color: raw.color || colors[(index || 0) % colors.length]
    };
  }

  static fromRequestDto(dto: CustomerRequestDto): CustomerResponseDto {
    const id = dto.id || `CUST-00${Math.floor(10 + Math.random() * 90)}`;
    return {
      key: `cust-${Date.now()}`,
      id: id,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      plan: dto.plan || 'Basic',
      status: dto.status || 'active',
      lastLogin: 'Mới tạo',
      color: '#1677ff'
    };
  }
}
