import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Database,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TestTube2,
  WalletCards,
  Zap,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { LayerTag } from "../components/ui/LayerTag";
import {
  ApiError,
  apiRequest,
} from "../lib/api";

interface Scenario {
  id: string;
  name: string;
  description: string;
}

interface ScenarioEnvelope {
  data: Scenario[];
}

interface SimulationRun {
  simulation_id: string;
  scenario_id: string;
  status: string;
  transactions_generated: number;
  target_transactions: number;
  started_at: string;
  completed_at: string | null;
  incident_id: string | null;
  investigation_id: string | null;
  recommendation_id: string | null;
}

interface SimulationEnvelope {
  data: SimulationRun;
}

const scenarioMeta: Record<
  string,
  {
    label: string;
    icon: typeof Activity;
    featured?: boolean;
    details: string[];
  }
> = {
  bank_degradation: {
    label: "Primary judge demo",
    icon: AlertTriangle,
    featured: true,
    details: [
      "100 deterministic transactions",
      "5% historical UPI baseline",
      "30% ABC Bank UPI failure rate",
      "20 ABC Bank transactions · 6 failed",
      "₹4.28L deterministic exposure",
      "AI investigation + recommendation",
    ],
  },

  normal_traffic: {
    label: "Healthy baseline",
    icon: Activity,
    details: [
      "Healthy payment traffic",
      "Low failure-rate baseline",
      "UPI + card transactions",
      "Real PayGuard processing pipeline",
    ],
  },
};

export function SimulatorPage() {
  const navigate = useNavigate();

  const [scenarios, setScenarios] =
    useState<Scenario[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    runningScenario,
    setRunningScenario,
  ] = useState<string | null>(null);

  const [lastRun, setLastRun] =
    useState<SimulationRun | null>(null);

  const loadScenarios = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await apiRequest<ScenarioEnvelope>(
            "/simulator/scenarios",
          );

        setScenarios(response.data);
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
            : "Unable to load simulator.",
        );
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    void loadScenarios();
  }, [loadScenarios]);

  async function runScenario(
    scenarioId: string,
  ) {
    setRunningScenario(scenarioId);
    setError(null);
    setLastRun(null);

    try {
      const response =
        await apiRequest<SimulationEnvelope>(
          `/simulator/scenarios/${scenarioId}/run`,
          {
            method: "POST",
            body: JSON.stringify({
              transaction_count: 100,
              duration_seconds: 60,
            }),
          },
        );

      setLastRun(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Scenario failed to run.",
      );
    } finally {
      setRunningScenario(null);
    }
  }

  if (loading) {
    return (
      <div className="simulator-loading">
        <div className="loader-ring" />

        <span>
          Loading deterministic risk
          scenarios...
        </span>
      </div>
    );
  }

  const isBankRun =
    lastRun?.scenario_id ===
    "bank_degradation";

  return (
    <div className="simulator-stack simulator-v3">
      <section className="simulator-hero simulator-hero-v3">
        <div className="simulator-hero-copy">
          <div className="simulator-kicker">
            <TestTube2 size={14} />
            RISK SCENARIO LAB
          </div>

          <h2>
            Generate risk.
            <br />
            Observe the complete response.
          </h2>

          <p>
            Controlled scenarios flow through
            PayGuard's real ingestion, risk,
            incident and investigation pipeline.
          </p>
        </div>

        <div className="simulator-flow simulator-flow-v3">
          <FlowStep
            icon={Database}
            label="Generate"
            layer="FACT"
          />

          <ArrowRight size={14} />

          <FlowStep
            icon={Zap}
            label="Detect"
            layer="RISK"
          />

          <ArrowRight size={14} />

          <FlowStep
            icon={Sparkles}
            label="Investigate"
            layer="AI"
            ai
          />

          <ArrowRight size={14} />

          <FlowStep
            icon={ShieldCheck}
            label="Respond"
            layer="HUMAN"
          />
        </div>
      </section>

      {error && (
        <div className="simulator-error simulator-error-v3">
          <AlertTriangle size={16} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              void loadScenarios()
            }
          >
            Retry
          </button>
        </div>
      )}

      <section className="scenario-section">
        <div className="section-heading-row scenario-heading-v3">
          <div>
            <span className="panel-eyebrow">
              CONTROLLED ENVIRONMENTS
            </span>

            <h3>
              Choose a payment scenario
            </h3>

            <p>
              All generated traffic is isolated to
              the PayGuard demo environment.
            </p>
          </div>

          <div className="scenario-heading-meta-v3">
            <LayerTag
              variant="deterministic"
              label="Deterministic scenarios"
            />

            <span className="scenario-count">
              {scenarios.length} available
            </span>
          </div>
        </div>

        <div className="scenario-grid scenario-grid-v3">
          {scenarios.map((scenario) => {
            const meta =
              scenarioMeta[scenario.id] || {
                label: "Scenario",
                icon: TestTube2,
                details: [],
              };

            const Icon = meta.icon;

            const isRunning =
              runningScenario === scenario.id;

            return (
              <article
                key={scenario.id}
                className={`scenario-card scenario-card-v3 ${
                  meta.featured
                    ? "featured featured-v3"
                    : ""
                }`}
              >
                {meta.featured && (
                  <div className="featured-ribbon featured-ribbon-v3">
                    PRIMARY BUILDATHON DEMO
                  </div>
                )}

                <div className="scenario-card-head">
                  <div
                    className={`scenario-icon ${
                      meta.featured
                        ? "danger"
                        : ""
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="scenario-type-stack-v3">
                    <span className="scenario-type">
                      {meta.label}
                    </span>

                    {meta.featured ? (
                      <LayerTag
                        variant="deterministic"
                        label="Controlled scenario"
                        compact
                      />
                    ) : (
                      <LayerTag
                        variant="deterministic"
                        compact
                        label="Deterministic scenario"
                      />
                    )}
                  </div>
                </div>

                <h4>{scenario.name}</h4>

                <p>{scenario.description}</p>

                {scenario.id ===
                  "bank_degradation" && (
                  <div className="degradation-visual-v3">
                    <div>
                      <span>
                        HISTORICAL
                      </span>

                      <strong>
                        5%
                      </strong>

                      <small>
                        baseline
                      </small>
                    </div>

                    <ArrowRight size={16} />

                    <div className="degradation-current-v3">
                      <span>
                        CURRENT
                      </span>

                      <strong>
                        30%
                      </strong>

                      <small>
                        ABC Bank UPI
                      </small>
                    </div>

                    <div className="degradation-multiplier-v3">
                      6× spike
                    </div>
                  </div>
                )}

                <div className="scenario-details scenario-details-v3">
                  {meta.details.map((detail) => (
                    <div key={detail}>
                      <CheckCircle2
                        size={12}
                      />

                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="scenario-card-footer scenario-footer-v3">
                  <div className="scenario-config">
                    <WalletCards size={13} />
                    100 transactions

                    <i />

                    <Clock3 size={13} />
                    60s logical window
                  </div>

                  <button
                    className={
                      meta.featured
                        ? "pg-primary-action scenario-run"
                        : "secondary-button scenario-run"
                    }
                    type="button"
                    disabled={
                      runningScenario !== null
                    }
                    onClick={() =>
                      void runScenario(
                        scenario.id,
                      )
                    }
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw
                          size={14}
                          className="spin"
                        />

                        Running pipeline...
                      </>
                    ) : (
                      <>
                        <Play size={14} />

                        {meta.featured
                          ? "Run bank degradation"
                          : "Run scenario"}
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {lastRun && (
        <section className="simulation-result simulation-result-v3">
          <div className="simulation-result-header-v3">
            <div className="result-success-icon">
              <CheckCircle2 size={23} />
            </div>

            <div className="result-main">
              <span className="panel-eyebrow">
                SIMULATION COMPLETE
              </span>

              <h3>
                {isBankRun
                  ? "PayGuard detected the ABC Bank UPI degradation."
                  : "Healthy payment traffic generated successfully."}
              </h3>

              <div className="result-metadata">
                <span>
                  Simulation{" "}
                  <strong>
                    {lastRun.simulation_id.slice(
                      0,
                      8,
                    )}
                  </strong>
                </span>

                <i />

                <span>
                  Status{" "}
                  <strong>
                    {lastRun.status}
                  </strong>
                </span>
              </div>
            </div>

            <LayerTag
              variant="deterministic"
              label="Pipeline result"
            />
          </div>

          {isBankRun ? (
            <>
              <div className="simulation-metrics-v3">
                <ResultMetric
                  label="Transactions"
                  value={String(
                    lastRun.transactions_generated,
                  )}
                  helper="generated"
                />

                <ResultMetric
                  label="Successful"
                  value="91"
                  helper="91.0% success"
                />

                <ResultMetric
                  label="Failed"
                  value="9"
                  helper="payment failures"
                  danger
                />

                <ResultMetric
                  label="Revenue at risk"
                  value="₹4.28L"
                  helper="backend calculated"
                  danger
                />
              </div>

              <div className="simulation-detection-v3">
                <div className="simulation-detection-copy-v3">
                  <span className="panel-eyebrow">
                    DETECTION RESULT
                  </span>

                  <h4>
                    ABC Bank UPI failure rate
                    increased from 5% to 30%.
                  </h4>

                  <p>
                    6 of 20 affected ABC Bank
                    transactions failed, producing
                    a correlated critical incident.
                  </p>
                </div>

                <div className="simulation-detection-state-v3">
                  <span className="severity-badge critical">
                    CRITICAL
                  </span>

                  <strong>
                    5% → 30%
                  </strong>

                  <small>
                    ABC Bank UPI
                  </small>
                </div>
              </div>

              <div className="result-impact result-impact-v3">
                <div>
                  <AlertTriangle size={14} />

                  <span>
                    Critical incident created
                  </span>
                </div>

                <div>
                  <CircleDollarSign
                    size={14}
                  />

                  <span>
                    ₹4.28L deterministic exposure
                  </span>
                </div>

                <div>
                  <Sparkles size={14} />

                  <span>
                    AI investigation ready
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="result-impact result-impact-v3 healthy">
              <div>
                <ShieldCheck size={14} />

                <span>
                  Healthy baseline generated
                </span>
              </div>
            </div>
          )}

          <div className="result-actions result-actions-v3">
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/")
              }
            >
              View dashboard
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/transactions")
              }
            >
              View transactions
            </button>

            {lastRun.incident_id && (
              <button
                type="button"
                className="pg-primary-action"
                onClick={() =>
                  navigate(
                    `/incidents/${lastRun.incident_id}`,
                  )
                }
              >
                View incident
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </section>
      )}

      <section className="simulator-safety simulator-safety-v3">
        <ShieldCheck size={17} />

        <div>
          <div className="simulator-safety-heading-v3">
            <strong>
              Safe demonstration environment
            </strong>

            <LayerTag
              variant="human"
              label="Simulated only"
            />
          </div>

          <p>
            Simulator transactions use the real
            PayGuard processing pipeline, but
            mitigation execution remains
            SIMULATED. No live payment-routing
            configuration is changed.
          </p>
        </div>
      </section>
    </div>
  );
}

function FlowStep({
  icon: Icon,
  label,
  layer,
  ai = false,
}: {
  icon: typeof Database;
  label: string;
  layer: string;
  ai?: boolean;
}) {
  return (
    <div
      className={`simulator-flow-step-v3 ${
        ai ? "ai" : ""
      }`}
    >
      <Icon size={15} />

      <span>{label}</span>

      <small>{layer}</small>
    </div>
  );
}

function ResultMetric({
  label,
  value,
  helper,
  danger = false,
}: {
  label: string;
  value: string;
  helper: string;
  danger?: boolean;
}) {
  return (
    <article
      className={`simulation-metric-card-v3 ${
        danger ? "danger" : ""
      }`}
    >
      <span>{label}</span>

      <strong data-metric>
        {value}
      </strong>

      <small>{helper}</small>
    </article>
  );
}
