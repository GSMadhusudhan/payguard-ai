export interface DashboardSummary {
  payment_health_score: number;
  transactions_today: number;
  successful_transactions_today: number;
  failed_transactions_today: number;
  success_rate: number;
  failure_rate: number;
  high_risk_transactions: number;
  critical_risk_transactions: number;
  open_incidents: number;
  critical_incidents: number;
  revenue_at_risk: number;
  currency: string;
  active_alerts: number;
}

export interface RiskDistributionItem {
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  count: number;
}

export interface PaymentMethodPerformance {
  payment_method: string;
  transaction_count: number;
  success_rate: number;
  failure_rate: number;
  risk_score: number;
}

export interface IncidentListItem {
  id: string;
  incident_number: string;
  title: string;
  incident_type: string;
  severity: string;
  status: string;
  risk_score: number | null;
  affected_transaction_count: number;
  failed_transaction_count: number;
  revenue_at_risk: number;
  currency: string;
  payment_method: string | null;
  bank: string | null;
  detected_at: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface DashboardEnvelope {
  data: DashboardSummary;
}

export interface RiskDistributionEnvelope {
  data: RiskDistributionItem[];
}

export interface PaymentMethodEnvelope {
  data: PaymentMethodPerformance[];
}

export interface IncidentListEnvelope {
  data: IncidentListItem[];
  pagination: Pagination;
}


export interface TransactionListItem {
  id: string;
  external_payment_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  bank: string | null;
  status: string;
  risk_score: number | null;
  risk_level: string | null;
  occurred_at: string;
}

export interface TransactionListEnvelope {
  data: TransactionListItem[];
  pagination: Pagination;
}

export interface TransactionDetail {
  id: string;
  merchant_id: string;
  external_payment_id: string;
  payment_provider: string;
  amount: number;
  currency: string;
  payment_method: string;
  bank: string | null;
  status: string;
  failure_code: string | null;
  failure_reason: string | null;
  customer_reference: string | null;
  occurred_at: string;
  risk: {
    score: number | null;
    level: string | null;
    model_version: string | null;
  };
}

export interface TransactionDetailEnvelope {
  data: TransactionDetail;
}


export interface IncidentDetail {
  id: string;
  incident_number: string;
  title: string;
  description: string | null;
  incident_type: string;
  severity: string;
  status: string;
  risk_score: number | null;
  confidence_score: number | null;
  affected_transaction_count: number;
  failed_transaction_count: number;
  affected_payment_value: number;
  revenue_at_risk: number;
  currency: string;
  primary_payment_method: string | null;
  primary_bank: string | null;
  baseline_failure_rate: number | null;
  current_failure_rate: number | null;
  detected_at: string;
  resolved_at: string | null;
}

export interface IncidentDetailEnvelope {
  data: IncidentDetail;
}

export interface InvestigationListItem {
  id: string;
  incident_id: string;
  status: string;
  summary: string | null;
  likely_root_cause: string | null;
  confidence_score: number | null;
  model_name: string | null;
  prompt_version: string | null;
  created_at: string;
}

export interface InvestigationListEnvelope {
  data: InvestigationListItem[];
}

export interface InvestigationDetail {
  id: string;
  incident_id: string;
  status: string;
  summary: string | null;
  likely_root_cause: string | null;
  confidence_score: number | null;
  evidence: unknown[];
  alternative_explanations: unknown[];
  uncertainties: unknown[];
  recommended_next_checks: unknown[];
  provider: string | null;
  model_name: string | null;
  prompt_version: string | null;
  created_at: string;
}

export interface InvestigationDetailEnvelope {
  data: InvestigationDetail;
}

export interface RecommendationItem {
  id: string;
  incident_id: string;
  investigation_id: string | null;
  recommendation_type: string;
  title: string;
  rationale: string | null;
  confidence_score: number | null;
  proposed_action: Record<string, unknown>;
  expected_impact: Record<string, unknown>;
  requires_approval: boolean;
  approval_status: string;
  status: string;
  execution_mode: string;
  execution_result: Record<string, unknown> | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface RecommendationListEnvelope {
  data: RecommendationItem[];
}

export interface RecommendationActionResponse {
  id: string;
  incident_id: string;
  status: string;
  approval_status: string;
  execution_mode?: string;
  execution_result?: Record<string, unknown> | null;
}


export interface CopilotEvidence {
  label: string;
  value: string;
}

export interface CopilotIncidentReference {
  id: string;
  incident_number: string;
}

export interface CopilotTransactionReference {
  id: string;
}

export interface CopilotResponse {
  conversation_id: string;
  message_id: string;
  intent: string;
  answer: string;
  referenced_incidents: CopilotIncidentReference[];
  referenced_transactions: CopilotTransactionReference[];
  evidence: CopilotEvidence[];
  generated_at: string;
}
