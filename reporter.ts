/**
 * Compliance Reporting Module
 * @package @solana-zk-kyc/sdk
 */

import type {
  ComplianceReport,
  ReportType,
  ReportParams,
  OFACResult,
  FinCENReport,
} from '../../types/compliance';
import type { AuditEvent } from '../../types/index';

/**
 * Compliance Reporter class
 */
export class ComplianceReporter {
  private auditLog: AuditEvent[] = [];
  private organizationInfo: OrganizationInfo;
  private encryptionKey?: Uint8Array;

  /**
   * Create compliance reporter
   * @param organizationInfo - Organization information
   * @param encryptionKey - Optional encryption key
   */
  constructor(organizationInfo: OrganizationInfo, encryptionKey?: Uint8Array) {
    this.organizationInfo = organizationInfo;
    this.encryptionKey = encryptionKey;
  }

  /**
   * Generate compliance report
   * @param params - Report parameters
   * @returns Compliance report
   */
  async generateReport(params: ReportParams): Promise<ComplianceReport> {
    const reportId = this.generateReportId();

    let reportData: import('../../types/compliance').ReportData;

    switch (params.type) {
      case 'FINCEN':
        reportData = await this.generateFinCENReport(params);
        break;
      case 'OFAC':
        reportData = await this.generateOFACReport(params);
        break;
      case 'AUDIT':
        reportData = await this.generateAuditReport(params);
        break;
      case 'AML':
        reportData = await this.generateAMLReport(params);
        break;
      case 'KYC_SUMMARY':
      default:
        reportData = await this.generateKYCSummaryReport(params);
    }

    return {
      reportId,
      type: params.type,
      generatedAt: Date.now(),
      period: params.period,
      data: reportData,
      metadata: {
        generatedBy: this.organizationInfo.name,
        sdkVersion: '1.0.0',
        formatVersion: '1.0',
      },
    };
  }

  /**
   * Generate KYC summary report
   */
  private async generateKYCSummaryReport(params: ReportParams): Promise<import('../../types/compliance').ReportData> {
    const events = this.getAuditEvents(params);

    const summary = {
      totalVerifications: events.filter(e => e.eventType === 'VERIFICATION_COMPLETE').length,
      approvedCount: events.filter(e => e.eventType === 'VERIFICATION_COMPLETE' && e.data.status === 'VERIFIED').length,
      rejectedCount: events.filter(e => e.data.status === 'REJECTED').length,
      pendingCount: events.filter(e => e.eventType === 'VERIFICATION_STARTED').length,
    };

    const entries = events.map(event => ({
      id: `${event.walletAddress}-${event.timestamp}`,
      timestamp: event.timestamp,
      type: event.eventType,
      data: event.data,
    }));

    return {
      summary,
      entries,
      statistics: summary as Record<string, number>,
    };
  }

  /**
   * Generate AML report
   */
  private async generateAMLReport(params: ReportParams): Promise<import('../../types/compliance').ReportData> {
    const events = this.getAuditEvents(params);

    const suspiciousEvents = events.filter(e => e.data.riskLevel === 'HIGH' || e.data.riskLevel === 'CRITICAL');

    const summary = {
      totalTransactions: events.filter(e => e.eventType === 'TRANSACTION').length,
      suspiciousActivityCount: suspiciousEvents.length,
      highRiskCount: events.filter(e => e.data.riskLevel === 'HIGH').length,
      criticalRiskCount: events.filter(e => e.data.riskLevel === 'CRITICAL').length,
      amlAlerts: suspiciousEvents.length,
    };

    return {
      summary,
      entries: suspiciousEvents.map(event => ({
        id: `${event.walletAddress}-${event.timestamp}`,
        timestamp: event.timestamp,
        type: event.eventType,
        data: {
          ...event.data,
          alertReason: this.determineAlertReason(event.data),
        },
      })),
      statistics: summary as Record<string, number>,
    };
  }

  /**
   * Generate audit report
   */
  private async generateAuditReport(params: ReportParams): Promise<import('../../types/compliance').ReportData> {
    const events = this.getAuditEvents(params);

    const summary = {
      totalEvents: events.length,
      uniqueWallets: new Set(events.map(e => e.walletAddress)).size,
      verificationEvents: events.filter(e => e.eventType.startsWith('VERIFICATION')).length,
      transactionEvents: events.filter(e => e.eventType.startsWith('TRANSACTION')).length,
      adminEvents: events.filter(e => e.eventType.startsWith('ADMIN')).length,
    };

    return {
      summary,
      entries: events.map(event => ({
        id: `${event.walletAddress}-${event.timestamp}-${event.eventType}`,
        timestamp: event.timestamp,
        type: event.eventType,
        data: event.data,
      })),
      statistics: summary as Record<string, number>,
    };
  }

  /**
   * Generate OFAC report
   */
  private async generateOFACReport(params: ReportParams): Promise<import('../../types/compliance').ReportData> {
    // This would generate OFAC-specific screening report
    const summary = {
      screeningsPerformed: 0,
      matchesFound: 0,
      matchesCleared: 0,
      pendingReview: 0,
    };

    return {
      summary,
      entries: [],
      statistics: summary,
    };
  }

  /**
   * Generate FinCEN report
   */
  private async generateFinCENReport(params: ReportParams): Promise<import('../../types/compliance').ReportData> {
    const events = this.getAuditEvents(params);

    const suspiciousEvents = events.filter(e => e.data.riskLevel === 'HIGH' || e.data.riskLevel === 'CRITICAL');

    const summary = {
      suspiciousActivityCount: suspiciousEvents.length,
      totalAmount: suspiciousEvents.reduce((sum, e) => sum + (Number(e.data.amount) || 0), 0),
      currency: 'USD',
    };

    return {
      summary,
      entries: suspiciousEvents.map(event => ({
        id: `${event.walletAddress}-${event.timestamp}`,
        timestamp: event.timestamp,
        type: 'SUSPICIOUS_ACTIVITY',
        data: event.data,
      })),
      statistics: summary as Record<string, number>,
    };
  }

  /**
   * Export report in FinCEN format
   */
  async exportFinCENFormat(report: ComplianceReport): Promise<FinCENReport> {
    return {
      reportType: 'SAR',
      filingInstitution: {
        name: this.organizationInfo.name,
        taxId: this.organizationInfo.taxId,
        contact: this.organizationInfo.contact,
      },
      suspiciousActivity: {
        dateRange: {
          start: report.period?.start.toISOString().split('T')[0] || '',
          end: report.period?.end.toISOString().split('T')[0] || '',
        },
        suspiciousCount: report.data.entries.length,
        totalAmount: Number(report.data.summary.totalAmount) || 0,
        currency: 'USD',
      },
      subject: {
        type: 'INDIVIDUAL',
        accountNumbers: report.data.entries.map(e => e.id),
      },
      activities: report.data.entries.map(entry => ({
        date: new Date(entry.timestamp).toISOString().split('T')[0],
        type: entry.type,
        amount: Number(entry.data.amount) || 0,
        currency: 'USD',
        description: entry.data.description as string || 'N/A',
      })),
    };
  }

  /**
   * Screen against OFAC list
   */
  async screenOFAC(identity: { name?: string; address?: string; walletAddress?: string }): Promise<OFACResult> {
    // In production, this would call OFAC API
    // For demo, return mock result

    const isMatch = Math.random() > 0.95; // 5% chance of match for demo

    return {
      isMatch,
      matchScore: isMatch ? 85 + Math.random() * 15 : 0,
      matchedEntities: isMatch ? [
        {
          id: 'OFAC-001',
          name: identity.name || 'Unknown',
          type: 'INDIVIDUAL',
          program: 'OFAC',
          list: 'SDN',
          score: 85 + Math.random() * 15,
        },
      ] : [],
      screenedAt: Date.now(),
    };
  }

  /**
   * Log audit event
   */
  logAuditEvent(event: Omit<AuditEvent, 'timestamp'>): void {
    this.auditLog.push({
      ...event,
      timestamp: Date.now(),
    });
  }

  /**
   * Get audit events
   */
  getAuditEvents(params: ReportParams): AuditEvent[] {
    let events = [...this.auditLog];

    // Filter by wallet if specified
    if (params.walletAddress) {
      events = events.filter(e => e.walletAddress === params.walletAddress);
    }

    // Filter by period if specified
    if (params.period) {
      events = events.filter(e =>
        e.timestamp >= params.period!.start.getTime() &&
        e.timestamp <= params.period!.end.getTime()
      );
    }

    return events.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get audit trail
   */
  getAuditTrail(walletAddress: string): AuditEvent[] {
    return this.auditLog
      .filter(e => e.walletAddress === walletAddress)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Determine alert reason
   */
  private determineAlertReason(data: Record<string, unknown>): string {
    if (data.riskLevel === 'CRITICAL') {
      return 'Critical risk level detected';
    }
    if (data.riskScore && Number(data.riskScore) > 80) {
      return 'High risk score threshold exceeded';
    }
    if (data.highRiskInteractions && Number(data.highRiskInteractions) > 10) {
      return 'Excessive high-risk address interactions';
    }
    return 'Risk threshold exceeded';
  }

  /**
   * Generate report ID
   */
  private generateReportId(): string {
    return `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Get organization info
   */
  getOrganizationInfo(): OrganizationInfo {
    return { ...this.organizationInfo };
  }
}

/**
 * Organization information for reporting
 */
export interface OrganizationInfo {
  /** Organization name */
  name: string;
  /** Tax ID */
  taxId: string;
  /** Contact information */
  contact: string;
  /** Address */
  address?: string;
  /** Registration number */
  registrationNumber?: string;
}

/**
 * Create compliance reporter
 */
export function createComplianceReporter(
  organizationInfo: OrganizationInfo,
  encryptionKey?: Uint8Array
): ComplianceReporter {
  return new ComplianceReporter(organizationInfo, encryptionKey);
}
