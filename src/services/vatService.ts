import seedVatJson from '../seed/seedVat.json';
import { VatFormConfigDto, VatInvoiceMapper, VatInvoiceResponseDto, VatInvoiceSubmitRequestDto } from '../dtos/VatDto';

const LOCAL_VAT_CONFIG_KEY = '@@SEED_VAT_CONFIG';
const LOCAL_VAT_INVOICES_KEY = '@@SEED_VAT_INVOICES';

export class VatService {
  private static instance: VatService;
  private vatFormConfig: VatFormConfigDto;
  private issuedInvoices: Map<string, any>;

  private constructor() {
    // Initialize config from seed JSON or memory
    this.vatFormConfig = VatInvoiceMapper.toFormConfigDto(seedVatJson.vatFormConfig);
    this.issuedInvoices = new Map<string, any>();

    // Seed sample issued invoices
    if (Array.isArray(seedVatJson.sampleInvoices)) {
      seedVatJson.sampleInvoices.forEach((inv: any) => {
        const key = `${inv.orderId}_${inv.storeId}_${inv.registerId}`;
        this.issuedInvoices.set(key, {
          formData: inv.formData,
          issuedAt: inv.issuedAt,
          amount: inv.amount
        });
      });
    }
  }

  public static getInstance(): VatService {
    if (!VatService.instance) {
      VatService.instance = new VatService();
    }
    return VatService.instance;
  }

  /**
   * Get current VAT Form Configuration
   */
  public getConfig(): VatFormConfigDto {
    return this.vatFormConfig;
  }

  /**
   * Update VAT Form Configuration
   */
  public updateConfig(newConfig: any): VatFormConfigDto {
    this.vatFormConfig = VatInvoiceMapper.toFormConfigDto({
      ...this.vatFormConfig,
      ...newConfig
    });
    return this.vatFormConfig;
  }

  /**
   * Check if invoice exists and return status or form configuration
   */
  public verifyInvoice(oid: string, sid: string, rid: string, sig: string, a?: string): VatInvoiceResponseDto {
    const key = `${oid}_${sid}_${rid}`;
    const amountStr = a || "0";

    if (this.issuedInvoices.has(key)) {
      const data = this.issuedInvoices.get(key);
      return VatInvoiceMapper.toIssuedResponseDto(oid, sid, rid, sig, amountStr, data);
    }

    return {
      valid: true,
      status: "pending",
      amount: amountStr,
      orderId: oid,
      formConfig: this.getConfig()
    };
  }

  /**
   * Submit VAT invoice information
   */
  public submitInvoice(dto: VatInvoiceSubmitRequestDto): VatInvoiceResponseDto {
    const key = `${dto.oid}_${dto.sid}_${dto.rid}`;
    const issuedRecord = {
      formData: dto.formData,
      issuedAt: new Date().toISOString(),
      amount: dto.a || "0",
      ct: dto.ct
    };

    this.issuedInvoices.set(key, issuedRecord);

    return VatInvoiceMapper.toIssuedResponseDto(
      dto.oid,
      dto.sid,
      dto.rid,
      dto.sig,
      dto.a || "0",
      issuedRecord
    );
  }

  /**
   * Get issued invoice data by key
   */
  public getIssuedInvoice(oid: string, sid: string, rid: string): any | null {
    const key = `${oid}_${sid}_${rid}`;
    return this.issuedInvoices.get(key) || null;
  }
}

export const vatService = VatService.getInstance();
