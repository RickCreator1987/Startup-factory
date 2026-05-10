/**
 * Internationalization utilities
 * @package @solana-zk-kyc/sdk
 */

/**
 * Translation key type
 */
export type TranslationKey =
  | 'verification.start'
  | 'verification.pending'
  | 'verification.approved'
  | 'verification.rejected'
  | 'verification.expired'
  | 'error.invalid_wallet'
  | 'error.verification_failed'
  | 'error.network_error'
  | 'compliance.check'
  | 'compliance.approved'
  | 'compliance.rejected'
  | 'risk.low'
  | 'risk.medium'
  | 'risk.high'
  | 'risk.critical';

/**
 * Translations dictionary
 */
export const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    'verification.start': 'Start Verification',
    'verification.pending': 'Verification Pending',
    'verification.approved': 'Verification Approved',
    'verification.rejected': 'Verification Rejected',
    'verification.expired': 'Verification Expired',
    'error.invalid_wallet': 'Invalid wallet address',
    'error.verification_failed': 'Verification failed',
    'error.network_error': 'Network error occurred',
    'compliance.check': 'Check Compliance',
    'compliance.approved': 'Compliant',
    'compliance.rejected': 'Not Compliant',
    'risk.low': 'Low Risk',
    'risk.medium': 'Medium Risk',
    'risk.high': 'High Risk',
    'risk.critical': 'Critical Risk',
  },
  es: {
    'verification.start': 'Iniciar Verificacion',
    'verification.pending': 'Verificacion Pendiente',
    'verification.approved': 'Verificacion Aprobada',
    'verification.rejected': 'Verificacion Rechazada',
    'verification.expired': 'Verificacion Expirada',
    'error.invalid_wallet': 'Direccion de cartera invalida',
    'error.verification_failed': 'Verificacion fallida',
    'error.network_error': 'Error de red',
    'compliance.check': 'Verificar Cumplimiento',
    'compliance.approved': 'Cumple',
    'compliance.rejected': 'No Cumple',
    'risk.low': 'Riesgo Bajo',
    'risk.medium': 'Riesgo Medio',
    'risk.high': 'Riesgo Alto',
    'risk.critical': 'Riesgo Critico',
  },
  'zh-CN': {
    'verification.start': '开始验证',
    'verification.pending': '验证待处理',
    'verification.approved': '验证已批准',
    'verification.rejected': '验证被拒绝',
    'verification.expired': '验证已过期',
    'error.invalid_wallet': '钱包地址无效',
    'error.verification_failed': '验证失败',
    'error.network_error': '网络错误',
    'compliance.check': '检查合规',
    'compliance.approved': '合规',
    'compliance.rejected': '不合规',
    'risk.low': '低风险',
    'risk.medium': '中等风险',
    'risk.high': '高风险',
    'risk.critical': '严重风险',
  },
  ja: {
    'verification.start': '確認開始',
    'verification.pending': '確認保留中',
    'verification.approved': '確認承認',
    'verification.rejected': '確認却下',
    'verification.expired': '確認期限切れ',
    'error.invalid_wallet': '無効なウォレットアドレス',
    'error.verification_failed': '確認失敗',
    'error.network_error': 'ネットワークエラー',
    'compliance.check': 'コンプライアンス確認',
    'compliance.approved': 'コンプライアンス済み',
    'compliance.rejected': 'コンプライアンス未完了',
    'risk.low': '低リスク',
    'risk.medium': '中リスク',
    'risk.high': '高リスク',
    'risk.critical': '重大リスク',
  },
  ko: {
    'verification.start': '인증 시작',
    'verification.pending': '인증 보류중',
    'verification.approved': '인증 승인',
    'verification.rejected': '인증 거부',
    'verification.expired': '인증 만료',
    'error.invalid_wallet': '잘못된 지갑 주소',
    'error.verification_failed': '인증 실패',
    'error.network_error': '네트워크 오류',
    'compliance.check': '규정 준수 확인',
    'compliance.approved': '규정 준수',
    'compliance.rejected': '규정 미준수',
    'risk.low': '낮은 위험',
    'risk.medium': '보통 위험',
    'risk.high': '높은 위험',
    'risk.critical': '심각한 위험',
  },
  pt: {
    'verification.start': 'Iniciar Verificacao',
    'verification.pending': 'Verificacao Pendente',
    'verification.approved': 'Verificacao Aprovada',
    'verification.rejected': 'Verificacao Rejeitada',
    'verification.expired': 'Verificacao Expirada',
    'error.invalid_wallet': 'Endereco de carteira invalido',
    'error.verification_failed': 'Verificacao falhou',
    'error.network_error': 'Erro de rede',
    'compliance.check': 'Verificar Conformidade',
    'compliance.approved': 'Conforme',
    'compliance.rejected': 'Nao Conforme',
    'risk.low': 'Risco Baixo',
    'risk.medium': 'Risco Medio',
    'risk.high': 'Risco Alto',
    'risk.critical': 'Risco Critico',
  },
  fr: {
    'verification.start': 'Demarrer la verification',
    'verification.pending': 'Verification en attente',
    'verification.approved': 'Verification approuvee',
    'verification.rejected': 'Verification rejetee',
    'verification.expired': 'Verification expiree',
    'error.invalid_wallet': 'Adresse de portefeuille invalide',
    'error.verification_failed': 'Echec de la verification',
    'error.network_error': 'Erreur reseau',
    'compliance.check': 'Verifier la conformite',
    'compliance.approved': 'Conforme',
    'compliance.rejected': 'Non conforme',
    'risk.low': 'Risque faible',
    'risk.medium': 'Risque moyen',
    'risk.high': 'Risque eleve',
    'risk.critical': 'Risque critique',
  },
  de: {
    'verification.start': 'Verifizierung starten',
    'verification.pending': 'Verifizierung ausstehend',
    'verification.approved': 'Verifizierung genehmigt',
    'verification.rejected': 'Verifizierung abgelehnt',
    'verification.expired': 'Verifizierung abgelaufen',
    'error.invalid_wallet': 'Ungultige Wallet-Adresse',
    'error.verification_failed': 'Verifizierung fehlgeschlagen',
    'error.network_error': 'Netzwerkfehler',
    'compliance.check': 'Compliance uberprufen',
    'compliance.approved': 'Konform',
    'compliance.rejected': 'Nicht konform',
    'risk.low': 'Niedriges Risiko',
    'risk.medium': 'Mittleres Risiko',
    'risk.high': 'Hohes Risiko',
    'risk.critical': 'Kritisches Risiko',
  },
};

/**
 * Get translation
 */
export function getTranslation(
  key: TranslationKey,
  lang: string,
  params?: Record<string, string>
): string {
  const translation = translations[lang]?.[key] || translations.en[key] || key;

  if (params) {
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(new RegExp(`{${k}}`, 'g'), v),
      translation
    );
  }

  return translation;
}

/**
 * Get available languages
 */
export function getAvailableLanguages(): string[] {
  return Object.keys(translations);
}
