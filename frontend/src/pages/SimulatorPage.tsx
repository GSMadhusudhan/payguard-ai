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
import {
  useNavigate,
} from "react-router-dom";

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
    label: "Judge demo",
    icon: AlertTriangle,
    featured: true,
    details: [
      "5% historical UPI baseline",
      "30% ABC Bank UPI failure spike",
      "Other banks remain healthy",
      "Cards remain healthy",
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
      "Uses the real risk pipeline",
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

  const [runningScenario, setRunningScenario] =
    useState<string | null>(null);

  const [lastRun, setLastRun] =
    useState<SimulationRun | null>(null);

  const loadScenarios = useCallback(async () => {
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
  }, [navigate]);

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
          Loading simulator scenarios...
        </span>
      </div>
    );
  }

  return (
    <div className="simulator-stack">
      <section className="simulator-hero">
        <div className="simulator-hero-copy">
          <div className="simulator-kicker">
            <Sparkles size={14} />
            CONTROLLED RISK LAB
          </div>

          <h2>
            Trigger payment risk.
            <br />
            Watch PayGuard respond.
          </h2>

          <p>
            Generate deterministic payment traffic
            through the same ingestion, risk,
            incident and AI pipelines used by the
            application.
          </p>
        </div>

        <div className="simulator-flow">
          <div>
            <Database size={16} />
            <span>Generate</span>
          </div>

          <ArrowRight size={15} />

          <div>
            <Zap size={16} />
            <span>Detect</span>
          </div>

          <ArrowRight size={15} />

          <div>
            <Sparkles size={16} />
            <span>Investigate</span>
          </div>

          <ArrowRight size={15} />

          <div>
            <ShieldCheck size={16} />
            <span>Respond</span>
          </div>
        </div>
      </section>

      {error && (
        <div className="simulator-error">
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
        <div className="section-heading-row">
          <div>
            <span className="panel-eyebrow">
              Available scenarios
            </span>

            <h3>
              Choose a payment environment
            </h3>
          </div>

          <span className="scenario-count">
            {scenarios.length} scenarios
          </span>
        </div>

        <div className="scenario-grid">
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
                className={`scenario-card ${
                  meta.featured
                    ? "featured"
                    : ""
                }`}
              >
                {meta.featured && (
                  <div className="featured-ribbon">
                    RECOMMENDED DEMO
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

                  <span className="scenario-type">
                    {meta.label}
                  </span>
                </div>

                <h4>{scenario.name}</h4>

                <p>{scenario.description}</p>

                <div className="scenario-details">
                  {meta.details.map((detail) => (
                    <div key={detail}>
                      <CheckCircle2 size={12} />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="scenario-card-footer">
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
                        ? "primary-button scenario-run"
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
                        Run scenario
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
        <section className="simulation-result">
          <div className="result-success-icon">
            <CheckCircle2 size={23} />
          </div>

          <div className="result-main">
            <span className="panel-eyebrow">
              Simulation complete
            </span>

            <h3>
              {lastRun.scenario_id ===
              "bank_degradation"
                ? "PayGuard detected the ABC Bank degradation."
                : "Healthy traffic generated successfully."}
            </h3>

            <div className="result-metadata">
              <span>
                <strong>
                  {lastRun.transactions_generated}
                </strong>{" "}
                transactions
              </span>

              <i />

              <span>
                Status{" "}
                <strong>
                  {lastRun.status}
                </strong>
              </span>

              <i />

              <span className="result-id">
                {lastRun.simulation_id}
              </span>
            </div>
          </div>

          {lastRun.incident_id ? (
            <div className="result-impact">
              <div>
                <AlertTriangle size={14} />
                Incident created
              </div>

              <div>
                <CircleDollarSign size={14} />
                ₹4.28L exposure
              </div>

              <div>
                <Sparkles size={14} />
                AI investigation ready
              </div>
            </div>
          ) : (
            <div className="result-impact healthy">
              <div>
                <ShieldCheck size={14} />
                Healthy baseline generated
              </div>
            </div>
          )}

          <div className="result-actions">
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
                className="secondary-button"
                onClick={() =>
                  navigate("/incidents")
                }
              >
                View incident
              </button>
            )}

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                navigate("/")
              }
            >
              Open dashboard
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}

      <section className="simulator-safety">
        <ShieldCheck size={17} />

        <div>
          <strong>
            Safe demonstration environment
          </strong>

          <p>
            Simulator transactions use the real
            PayGuard processing pipeline, but
            mitigation execution remains SIMULATED.
            No live payment-routing configuration is
            changed.
          </p>
        </div>
      </section>
    </div>
  );
}
