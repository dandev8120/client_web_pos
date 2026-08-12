/**
 * Data Transfer Objects (DTO), Entities, and Mappers for VAT Invoice Domain
 */

export interface VatFormFieldDto {
  key: string;
  label: string;
  type: string;
  required: boolean;
  enabled: boolean;
  placeholder: string;
  validation?: string;
  defaultValue?: string;
  options?: { value: string; text: string }[];
}

export interface VatTypeConfigDto {
  enabled: boolean;
  title: string;
  fields: VatFormFieldDto[];
}

export interface VatFormConfigDto {
  individual: VatTypeConfigDto;
  enterprise: VatTypeConfigDto;
}

export interface VatInvoiceSubmitRequestDto {
  oid: string;
  sid: string;
  rid: string;
  o?: string;
  sig: string;
  a?: string;
  ct?: string;
  formData: {
    invoiceType?: 'enterprise' | 'individual';
    companyName?: string;
    fullName?: string;
    taxCode?: string;
    personalTaxCode?: string;
    email?: string;
    address?: string;
    province?: string;
    [key: string]: any;
  };
}

export interface VatInvoiceResponseDto {
  valid: boolean;
  status: 'pending' | 'issued';
  amount: string;
  orderId: string;
  downloadUrl?: string;
  issuedAt?: string;
  companyName?: string;
  taxCode?: string;
  formConfig?: VatFormConfigDto;
  error?: string;
}

export class VatInvoiceMapper {
  /**
   * Sanitizes and transforms raw VAT Form Config into a validated DTO
   */
  static toFormConfigDto(raw: any): VatFormConfigDto {
    const sanitizeType = (rawType: any, fallbackTitle: string): VatTypeConfigDto => {
      return {
        enabled: rawType?.enabled ?? true,
        title: String(rawType?.title || fallbackTitle),
        fields: Array.isArray(rawType?.fields) 
          ? rawType.fields.map((f: any) => ({
              key: String(f.key || ''),
              label: String(f.label || ''),
              type: String(f.type || 'text'),
              required: Boolean(f.required),
              enabled: f.enabled ?? true,
              placeholder: String(f.placeholder || ''),
              validation: f.validation ? String(f.validation) : undefined,
              defaultValue: f.defaultValue ? String(f.defaultValue) : undefined,
              options: Array.isArray(f.options) ? f.options.map((o: any) => ({
                value: String(o.value || ''),
                text: String(o.text || '')
              })) : undefined
            }))
          : []
      };
    };

    return {
      individual: sanitizeType(raw?.individual, "Thông tin xuất hóa đơn VAT Cá nhân"),
      enterprise: sanitizeType(raw?.enterprise, "Thông tin xuất hóa đơn VAT Doanh nghiệp")
    };
  }

  /**
   * Formats issued VAT invoice data into a clean API response DTO
   */
  static toIssuedResponseDto(
    orderId: string, 
    storeId: string, 
    registerId: string, 
    sig: string, 
    amount: string, 
    issuedData: any
  ): VatInvoiceResponseDto {
    const formData = issuedData?.formData || {};
    const companyName = formData.companyName || formData.fullName || "Khách hàng mua lẻ";
    const taxCode = formData.taxCode || formData.personalTaxCode || "Chưa đăng ký";

    return {
      valid: true,
      status: "issued",
      downloadUrl: `/api/vat/download?oid=${encodeURIComponent(orderId)}&sid=${encodeURIComponent(storeId)}&rid=${encodeURIComponent(registerId)}&sig=${encodeURIComponent(sig)}&a=${encodeURIComponent(amount)}`,
      issuedAt: issuedData?.issuedAt || new Date().toISOString(),
      companyName,
      taxCode,
      amount: amount || "0",
      orderId
    };
  }
}
