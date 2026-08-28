import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Building2,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Gauge,
  LoaderCircle,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { LayerTag } from "../components/ui/LayerTag";
import {
  ApiError,
  apiRequest,
} from "../lib/api";
import {
  formatMoneyFromPaise,
  formatPercent,
} from "../lib/format";
import type {
  IncidentDetail,
  IncidentDetailEnvelope,
  InvestigationDetail,
  InvestigationDetailEnvelope,
  InvestigationListEnvelope,
  RecommendationActionResponse,
  RecommendationItem,
  RecommendationListEnvelope,
} from "../types/api";

function evidenceText(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return Object.entries(
      value as Record<string, unknown>,
    )
      .map(
        ([key, item]) =>
          `${key.replaceAll("_", " ")}: ${String(
            item,
          )}`,
      )
      .join(" · ");
  }

  return String(value);
}

export function IncidentDetailPage() {
  const { incidentId } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] =
    useState<IncidentDetail | null>(null);

  const [investigation, setInvestigation] =
    useState<InvestigationDetail | null>(
      null,
    );

  const [recommendations, setRecommendations] =
    useState<RecommendationItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const loadIncident = useCallback(async () => {
    if (!incidentId) return;

    setLoading(true);
    setError(null);

    try {
      const [
        incidentResponse,
        investigationsResponse,
        recommendationsResponse,
      ] = await Promise.all([
        apiRequest<IncidentDetailEnvelope>(
          `/incidents/${incidentId}`,
        ),

        apiRequest<InvestigationListEnvelope>(
          `/incidents/${incidentId}/investigations`,
        ),

        apiRequest<RecommendationListEnvelope>(
          `/incidents/${incidentId}/recommendations`,
        ),
      ]);

      setIncident(incidentResponse.data);

      setRecommendations(
        recommendationsResponse.data,
      );

      const latestInvestigation =
        investigationsResponse.data[0];

      if (latestInvestigation) {
        const detail =
          await apiRequest<InvestigationDetailEnvelope>(
            `/investigations/${latestInvestigation.id}`,
          );

        setInvestigation(detail.data);
      } else {
        setInvestigation(null);
      }
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 401
      ) {
        localStorage.removeItem(
          "payguard_access_token",
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load incident.",
      );
    } finally {
      setLoading(false);
    }
  }, [incidentId, navigate]);

  useEffect(() => {
    void loadIncident();
  }, [loadIncident]);

  async function approveRecommendation(
    recommendationId: string,
  ) {
    setActionLoading(
      `approve:${recommendationId}`,
    );

    setError(null);

    try {
      await apiRequest<RecommendationActionResponse>(
        `/recommendations/${recommendationId}/approve`,
        {
          method: "POST",
        },
      );

      await loadIncident();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve recommendation.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function executeRecommendation(
    recommendationId: string,
  ) {
    setActionLoading(
      `execute:${recommendationId}`,
    );

    setError(null);

    try {
      await apiRequest<RecommendationActionResponse>(
        `/recommendations/${recommendationId}/execute`,
        {
          method: "POST",
        },
      );

      await loadIncident();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to execute recommendation.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="incident-detail-loading">
        <div className="loader-ring" />

        Loading incident intelligence...
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="error-panel">
        <ShieldAlert size={25} />

        <h3>Incident unavailable</h3>

        <p>{error}</p>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/incidents")
          }
        >
          <ArrowLeft size={14} />
          Back to incidents
        </button>
      </div>
    );
  }

  if (!incident) return null;

  const confidencePercent =
    investigation
      ? Math.round(
          (investigation.confidence_score ||
            0) * 100,
        )
      : 0;

  return (
    <div className="incident-detail-stack incident-detail-v3">
      <button
        type="button"
        className="incident-back-button"
        onClick={() =>
          navigate("/incidents")
        }
      >
        <ArrowLeft size={14} />
        All incidents
      </button>

      {error && (
        <div className="incident-action-error">
          <ShieldAlert size={14} />
          {error}
        </div>
      )}

      {/* ====================================================
          INCIDENT HERO
          ==================================================== */}

      <section className="incident-detail-hero incident-detail-hero-v3">
        <div className="incident-detail-hero-main">
          <div className="incident-detail-meta">
            <span
              className={`severity-badge ${incident.severity.toLowerCase()}`}
            >
              {incident.severity}
            </span>

            <span>
              {incident.incident_number}
            </span>

            <span className="incident-state-pill">
              {incident.status.replaceAll(
                "_",
                " ",
              )}
            </span>
          </div>

          <h2>{incident.title}</h2>

          <p>
            {incident.description ||
              "PayGuard detected a correlated payment-risk event."}
          </p>

          <div className="incident-hero-tags">
            <span>
              <WalletCards size={13} />

              {incident.primary_payment_method}
            </span>

            <span>
              <Building2 size={13} />

              {incident.primary_bank}
            </span>

            <span>
              <Clock3 size={13} />

              {new Date(
                incident.detected_at,
              ).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="incident-detail-signal incident-detail-signal-v3">
          <AlertTriangle size={27} />

          <div>
            <span>
              Operational impact
            </span>

            <strong>
              {incident.severity}
            </strong>

            <small>
              Financial exposure requires
              controlled response
            </small>
          </div>
        </div>
      </section>

      {/* ====================================================
          DETERMINISTIC INCIDENT METRICS
          ==================================================== */}

      <section className="incident-metrics-grid incident-metrics-grid-v3">
        <IncidentMetric
          label="Risk score"
          value={String(
            incident.risk_score ?? "—",
          )}
          helper="Incident-level risk"
          icon={Gauge}
          compactLayer
        />

        <IncidentMetric
          label="Affected"
          value={String(
            incident.affected_transaction_count,
          )}
          helper={`${incident.failed_transaction_count} failed`}
          icon={WalletCards}
          compactLayer
        />

        <IncidentMetric
          label="Current failure"
          value={
            incident.current_failure_rate !==
            null
              ? formatPercent(
                  incident.current_failure_rate,
                )
              : "—"
          }
          helper={
            incident.baseline_failure_rate !==
            null
              ? `${formatPercent(
                  incident.baseline_failure_rate,
                )} baseline`
              : "No baseline"
          }
          icon={AlertTriangle}
          compactLayer
        />

        <IncidentMetric
          label="Revenue at risk"
          value={formatMoneyFromPaise(
            incident.revenue_at_risk,
            true,
          )}
          helper="Deterministic exposure"
          icon={CircleDollarSign}
          danger
          layerLabel="Backend calculated"
        />
      </section>

      {/* ====================================================
          INVESTIGATION + CONTROLLED RESPONSE
          ==================================================== */}

      <section className="incident-intelligence-grid incident-intelligence-grid-v3">
        <div className="incident-investigation-column">
          {/* ================================================
              EVIDENCE FIRST
              ================================================ */}

          <article className="incident-evidence-panel-v3">
            <div className="incident-section-header incident-section-header-v3">
              <div className="incident-section-icon evidence">
                <ShieldCheck size={18} />
              </div>

              <div>
                <span className="panel-eyebrow">
                  GROUNDING EVIDENCE
                </span>

                <h3>
                  What PayGuard observed
                </h3>
              </div>

              <LayerTag
                variant="deterministic"
                label="Backend evidence"
              />
            </div>

            {!investigation ? (
              <div className="incident-empty-box">
                No investigation evidence is
                currently available.
              </div>
            ) : (
              <div className="evidence-list-v3">
                {(investigation.evidence || [])
                  .slice(0, 5)
                  .map((item, index) => (
                    <div
                      className="evidence-row-v3"
                      key={index}
                    >
                      <div className="evidence-check-v3">
                        <Check size={12} />
                      </div>

                      <span>
                        {evidenceText(item)}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            <div className="evidence-authority-note">
              <ShieldCheck size={13} />

              <span>
                These facts are supplied to the
                investigation layer before AI
                interpretation.
              </span>
            </div>
          </article>

          {/* ================================================
              AI INTERPRETATION
              ================================================ */}

          <article className="incident-ai-panel incident-ai-panel-v3">
            <div className="incident-section-header incident-section-header-v3">
              <div className="incident-section-icon ai">
                <Bot size={18} />
              </div>

              <div>
                <span className="panel-eyebrow">
                  AI INVESTIGATION
                </span>

                <h3>
                  Root-cause analysis
                </h3>
              </div>

              {investigation && (
                <LayerTag
                  variant="ai"
                  confidence={
                    confidencePercent
                  }
                />
              )}
            </div>

            {!investigation ? (
              <div className="incident-empty-box">
                No completed investigation is
                available.
              </div>
            ) : (
              <>
                <div className="ai-summary-card ai-summary-card-v3">
                  <Sparkles size={17} />

                  <div>
                    <span>
                      AI SUMMARY
                    </span>

                    <p>
                      {investigation.summary}
                    </p>
                  </div>
                </div>

                <div className="root-cause-block root-cause-block-v3">
                  <span>
                    LIKELY ROOT CAUSE
                  </span>

                  <strong>
                    {
                      investigation.likely_root_cause
                    }
                  </strong>
                </div>

                <div className="uncertainty-block uncertainty-block-v3">
                  <ShieldAlert size={15} />

                  <div>
                    <strong>
                      Uncertainty
                    </strong>

                    {(investigation.uncertainties ||
                      []).length > 0 ? (
                      <div className="uncertainty-list-v3">
                        {(
                          investigation.uncertainties ||
                          []
                        )
                          .slice(0, 3)
                          .map(
                            (
                              uncertainty,
                              index,
                            ) => (
                              <span
                                key={
                                  index
                                }
                              >
                                {evidenceText(
                                  uncertainty,
                                )}
                              </span>
                            ),
                          )}
                      </div>
                    ) : (
                      <span>
                        None flagged by the
                        current investigation.
                      </span>
                    )}
                  </div>
                </div>

                <details className="alternative-explanations-v3">
                  <summary>
                    Alternative explanations
                  </summary>

                  <p>
                    PayGuard does not fabricate
                    alternative hypotheses when
                    they are not supplied by the
                    investigation evidence.
                  </p>
                </details>

                <div className="ai-provenance">
                  <span>
                    Provider{" "}
                    <strong>
                      {investigation.provider ||
                        "PayGuard"}
                    </strong>
                  </span>

                  <i />

                  <span>
                    Model{" "}
                    <strong>
                      {investigation.model_name ||
                        "evidence-grounded"}
                    </strong>
                  </span>

                  <i />

                  <span>
                    Prompt{" "}
                    <strong>
                      {investigation.prompt_version ||
                        "investigation-v1"}
                    </strong>
                  </span>
                </div>
              </>
            )}
          </article>
        </div>

        {/* ==================================================
            RECOMMENDATION + HUMAN CONTROL
            ================================================== */}

        <article className="incident-response-panel incident-response-panel-v3">
          <div className="incident-section-header incident-section-header-v3">
            <div className="incident-section-icon response">
              <ShieldCheck size={18} />
            </div>

            <div>
              <span className="panel-eyebrow">
                CONTROLLED RESPONSE
              </span>

              <h3>
                Recommended action
              </h3>
            </div>

            <LayerTag
              variant="ai"
              label="AI recommendation"
            />
          </div>

          {recommendations.length === 0 ? (
            <div className="incident-empty-box">
              No recommendation available.
            </div>
          ) : (
            recommendations.map(
              (recommendation) => {
                const executed =
                  recommendation.status ===
                  "EXECUTED";

                const approved =
                  recommendation.approval_status ===
                    "APPROVED" ||
                  executed;

                return (
                  <div
                    className="recommendation-card recommendation-card-v3"
                    key={recommendation.id}
                  >
                    <div className="recommendation-status-line recommendation-status-line-v3">
                      <span
                        className={`approval-badge ${recommendation.approval_status.toLowerCase()}`}
                      >
                        {
                          recommendation.approval_status
                        }
                      </span>

                      <span className="execution-mode-v3">
                        {
                          recommendation.execution_mode
                        }
                      </span>
                    </div>

                    <RecommendationProgress
                      approved={approved}
                      executed={executed}
                    />

                    <div className="recommendation-copy-v3">
                      <span className="panel-eyebrow">
                        RECOMMENDATION
                      </span>

                      <h4>
                        {recommendation.title}
                      </h4>

                      <p>
                        {
                          recommendation.rationale
                        }
                      </p>
                    </div>

                    <div className="recommendation-action-box recommendation-action-box-v3">
                      <div className="recommendation-action-heading-v3">
                        <span>
                          PROPOSED ACTION
                        </span>

                        <LayerTag
                          variant="human"
                          label="Human approval required"
                        />
                      </div>

                      <strong>
                        {String(
                          recommendation
                            .proposed_action
                            .action ||
                            recommendation
                              .recommendation_type,
                        ).replaceAll(
                          "_",
                          " ",
                        )}
                      </strong>

                      <small>
                        This action cannot progress
                        without an explicit operator
                        decision.
                      </small>
                    </div>

                    {executed ? (
                      <div className="executed-result executed-result-v3">
                        <CheckCircle2
                          size={17}
                        />

                        <div>
                          <strong>
                            Simulated mitigation
                            completed
                          </strong>

                          <span>
                            No live payment routing
                            was changed.
                          </span>
                        </div>
                      </div>
                    ) : approved ? (
                      <button
                        type="button"
                        className="primary-button pg-primary-action recommendation-primary-action"
                        disabled={
                          actionLoading !== null
                        }
                        onClick={() =>
                          void executeRecommendation(
                            recommendation.id,
                          )
                        }
                      >
                        {actionLoading ===
                        `execute:${recommendation.id}` ? (
                          <>
                            <LoaderCircle
                              size={14}
                              className="spin"
                            />

                            Simulating...
                          </>
                        ) : (
                          <>
                            <Play size={14} />

                            Execute simulated
                            action
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="primary-button pg-primary-action recommendation-primary-action"
                        disabled={
                          actionLoading !== null
                        }
                        onClick={() =>
                          void approveRecommendation(
                            recommendation.id,
                          )
                        }
                      >
                        {actionLoading ===
                        `approve:${recommendation.id}` ? (
                          <>
                            <LoaderCircle
                              size={14}
                              className="spin"
                            />

                            Approving...
                          </>
                        ) : (
                          <>
                            <Check size={14} />

                            Approve
                            recommendation
                          </>
                        )}
                      </button>
                    )}

                    <div className="approval-safety-note approval-safety-note-v3">
                      <ShieldCheck size={13} />

                      AI cannot bypass this human
                      approval gate.
                    </div>
                  </div>
                );
              },
            )
          )}
        </article>
      </section>

      {/* ====================================================
          SYSTEM AUTHORITY BOUNDARY
          ==================================================== */}

      <section className="incident-integrity-banner incident-integrity-banner-v3">
        <ShieldCheck size={16} />

        <div>
          <strong>
            AI safety boundary
          </strong>

          <span>
            Risk scores and ₹
            {(
              incident.revenue_at_risk / 100
            ).toLocaleString("en-IN")}{" "}
            exposure are authoritative backend
            values. AI can explain and recommend,
            but cannot modify them or execute live
            financial actions.
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadIncident()
          }
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </section>
    </div>
  );
}

function RecommendationProgress({
  approved,
  executed,
}: {
  approved: boolean;
  executed: boolean;
}) {
  return (
    <div
      className="recommendation-progress"
      aria-label="Recommendation approval progress"
    >
      <div
        className={`recommendation-progress-step ${
          approved || executed
            ? "complete"
            : "current"
        }`}
      >
        <span>1</span>
        <strong>Pending</strong>
      </div>

      <i />

      <div
        className={`recommendation-progress-step ${
          executed
            ? "complete"
            : approved
              ? "current"
              : ""
        }`}
      >
        <span>2</span>
        <strong>Approved</strong>
      </div>

      <i />

      <div
        className={`recommendation-progress-step ${
          executed ? "complete" : ""
        }`}
      >
        <span>3</span>
        <strong>
          Simulated execution
        </strong>
      </div>
    </div>
  );
}

function IncidentMetric({
  label,
  value,
  helper,
  icon: Icon,
  danger = false,
  compactLayer = false,
  layerLabel,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof Gauge;
  danger?: boolean;
  compactLayer?: boolean;
  layerLabel?: string;
}) {
  return (
    <article
      className={`incident-metric-card incident-metric-card-v3 ${
        danger ? "danger" : ""
      }`}
    >
      <div className="incident-metric-layer-v3">
        <LayerTag
          variant="deterministic"
          compact={compactLayer}
          label={
            layerLabel ||
            "Deterministic value"
          }
        />
      </div>

      <div className="incident-metric-icon">
        <Icon size={16} />
      </div>

      <div>
        <span>{label}</span>

        <strong data-metric>
          {value}
        </strong>

        <small>{helper}</small>
      </div>
    </article>
  );
}
