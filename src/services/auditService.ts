import seedAuditLogsJson from '../seed/seedAuditLogs.json';
import { AuditLogRequestDto, AuditLogResponseDto, AuditLogMapper } from '../dtos/AuditLogDto';

const STORAGE_KEY = '@@WEB_POS_AUDIT_LOG';

export class AuditService {
  public getLogs(): AuditLogResponseDto[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(item => AuditLogMapper.toResponseDto(item));
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached audit logs', e);
    }

    const seedLogs = seedAuditLogsJson.map(item => AuditLogMapper.toResponseDto(item));
    this.saveLogs(seedLogs);
    return seedLogs;
  }

  public saveLogs(logs: AuditLogResponseDto[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }

  public logAction(dto: AuditLogRequestDto): AuditLogResponseDto {
    const logs = this.getLogs();
    const newLog = AuditLogMapper.fromRequestDto(dto);
    logs.unshift(newLog);

    if (logs.length > 1000) {
      logs.pop();
    }

    this.saveLogs(logs);
    return newLog;
  }

  public clearLogs(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

export const auditService = new AuditService();
