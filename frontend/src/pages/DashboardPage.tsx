import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { MetricCard } from "../components/ui/MetricCard";
import {
  ApiError,
  apiRequest,
} from "../lib/api";
import {
  formatMoneyFromPaise,
  formatNumber,
  formatPercent,
  timeAgo,
} from "../lib/format";
import type {
  DashboardEnvelope,
  DashboardSummary,
  IncidentListEnvelope,
  IncidentListItem,
  PaymentMethodEnvelope,
  PaymentMethodPerformance,
  RiskDistributionEnvelope,
  RiskDistributionItem,
} from "../types/api";

interface DashboardData {
  summary: DashboardSummary;
  riskDistribution: RiskDistributionItem[];
  paymentMethods: PaymentMethodPerformance[];
  incidents: IncidentListItem[];
}

export function DashboardPage() {
  const navigate = useNavigate();

  const [data, setData] =
    useState<DashboardData | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const loadDashboard = useCallback(
    async (manual = false) => {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const [
          summaryResponse,
          riskResponse,
          paymentResponse,
          incidentResponse,
        ] = await Promise.all([
          apiRequest<DashboardEnvelope>(
            "/dashboard",
          ),
          apiRequest<RiskDistributionEnvelope>(
            "/dashboard/risk-distribution",
          ),
          apiRequest<PaymentMethodEnvelope>(
            "/dashboard/payment-methods",
          ),
          apiRequest<IncidentListEnvelope>(
            "/incidents?page=1&page_size=5&sort_order=desc",
          ),
        ]);

        setData({
          summary: summaryResponse.data,
          riskDistribution: riskResponse.data,
          paymentMethods: paymentResponse.data,
          incidents: incidentResponse.data,
        });
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
            : "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const riskTotal = useMemo(
    () =>
      data?.riskDistribution.reduce(
        (sum, item) => sum + item.count,
        0,
      ) ?? 0,
    [data],
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-ring" />
        <span>
          Loading payment intelligence...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="error-panel">
        <ShieldAlert size={26} />
        <h3>Dashboard unavailable</h3>
        <p>{error || "Unable to load data."}</p>

        <button
          className="secondary-button"
          onClick={() => void loadDashboard()}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const summary = data.summary;
  const activeIncident = data.incidents[0];

  return (
    <div className="dashboard-stack">
      <div className="dashboard-toolbar">
        <div>
          <span className="dashboard-date">
            LIVE PAYMENT INTELLIGENCE
          </span>

          <span className="dashboard-context">
            Risk data is sourced from the
            deterministic PayGuard backend.
          </span>
        </div>

        <button
          type="button"
          className="secondary-button"
          disabled={refreshing}
          onClick={() =>
            void loadDashboard(true)
          }
        >
          <RefreshCw
            size={15}
            className={
              refreshing ? "spin" : ""
            }
          />
          {refreshing
            ? "Refreshing"
            : "Refresh"}
        </button>
      </div>

      <section className="metrics-grid">
        <MetricCard
          label="Payment health"
          value={`${summary.payment_health_score}`}
          helper={`${formatPercent(
            summary.success_rate,
          )} success rate`}
          icon={ShieldCheck}
          tone={
            summary.payment_health_score >= 90
              ? "success"
              : "default"
          }
        />

        <MetricCard
          label="Transactions today"
          value={formatNumber(
            summary.transactions_today,
          )}
          helper={`${formatNumber(
            summary.failed_transactions_today,
          )} failed payments`}
          icon={WalletCards}
        />

        <MetricCard
          label="Open incidents"
          value={formatNumber(
            summary.open_incidents,
          )}
          helper={`${summary.critical_incidents} critical`}
          icon={AlertTriangle}
          tone={
            summary.critical_incidents > 0
              ? "danger"
              : "default"
          }
        />

        <MetricCard
          label="Revenue at risk"
          value={formatMoneyFromPaise(
            summary.revenue_at_risk,
            true,
          )}
          helper="Deterministic exposure"
          icon={CircleDollarSign}
          tone={
            summary.revenue_at_risk > 0
              ? "danger"
              : "default"
          }
        />
      </section>

      <section className="dashboard-main-grid">
        <article className="panel risk-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">
                Risk posture
              </span>
              <h3>Transaction risk distribution</h3>
            </div>

            <div className="panel-badge">
              {formatNumber(riskTotal)} evaluated
            </div>
          </div>

          <div className="risk-content">
            <div className="risk-chart">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={data.riskDistribution}
                    dataKey="count"
                    nameKey="risk_level"
                    innerRadius={66}
                    outerRadius={92}
                    paddingAngle={3}
                  >
                    {data.riskDistribution.map(
                      (entry) => (
                        <Cell
                          key={entry.risk_level}
                          className={`risk-segment risk-${entry.risk_level.toLowerCase()}`}
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: "#111216",
                      border:
                        "1px solid rgba(255,255,255,.09)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="risk-chart-center">
                <strong>
                  {formatNumber(riskTotal)}
                </strong>
                <span>transactions</span>
              </div>
            </div>

            <div className="risk-legend">
              {data.riskDistribution.map(
                (item) => (
                  <div
                    className="risk-legend-row"
                    key={item.risk_level}
                  >
                    <div className="risk-label">
                      <span
                        className={`risk-dot risk-${item.risk_level.toLowerCase()}`}
                      />
                      {item.risk_level}
                    </div>

                    <strong>
                      {formatNumber(item.count)}
                    </strong>
                  </div>
                ),
              )}
            </div>
          </div>
        </article>

        <article className="panel payment-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">
                Payment rails
              </span>
              <h3>Method performance</h3>
            </div>

            <TrendingUp size={18} />
          </div>

          <div className="payment-method-list">
            {data.paymentMethods.length === 0 ? (
              <div className="empty-state">
                No payment traffic yet.
              </div>
            ) : (
              data.paymentMethods.map((method) => (
                <div
                  className="payment-method-row"
                  key={method.payment_method}
                >
                  <div className="method-identity">
                    <div className="method-icon">
                      {method.payment_method
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {method.payment_method}
                      </strong>
                      <span>
                        {formatNumber(
                          method.transaction_count,
                        )}{" "}
                        transactions
                      </span>
                    </div>
                  </div>

                  <div className="method-health">
                    <div className="method-health-top">
                      <span>Success</span>
                      <strong>
                        {formatPercent(
                          method.success_rate,
                        )}
                      </strong>
                    </div>

                    <div className="health-track">
                      <span
                        style={{
                          width: `${Math.min(
                            100,
                            method.success_rate *
                              100,
                          )}%`,
                        }}
                      />
                    </div>

                    <small>
                      Risk score{" "}
                      {method.risk_score}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="panel incident-panel">
        <div className="panel-header">
          <div>
            <span className="panel-eyebrow">
              Active response
            </span>
            <h3>Highest priority incident</h3>
          </div>

          <Link
            to="/incidents"
            className="text-link"
          >
            View all incidents
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {!activeIncident ? (
          <div className="incident-clear">
            <CheckCircle2 size={25} />
            <div>
              <strong>
                No active incidents
              </strong>
              <span>
                Payment operations are currently
                within monitored thresholds.
              </span>
            </div>
          </div>
        ) : (
          <Link
            to="/incidents"
            className="active-incident-card"
          >
            <div className="incident-severity-bar" />

            <div className="incident-icon danger">
              <AlertTriangle size={20} />
            </div>

            <div className="incident-main">
              <div className="incident-meta">
                <span
                  className={`severity-badge ${activeIncident.severity.toLowerCase()}`}
                >
                  {activeIncident.severity}
                </span>

                <span>
                  {activeIncident.incident_number}
                </span>

                <span>
                  {timeAgo(
                    activeIncident.detected_at,
                  )}
                </span>
              </div>

              <h4>{activeIncident.title}</h4>

              <div className="incident-detail-row">
                <span>
                  {activeIncident.payment_method ||
                    "Payment"}
                </span>

                {activeIncident.bank && (
                  <>
                    <i />
                    <span>
                      {activeIncident.bank}
                    </span>
                  </>
                )}

                <i />

                <span>
                  {
                    activeIncident.affected_transaction_count
                  }{" "}
                  affected
                </span>
              </div>
            </div>

            <div className="incident-exposure">
              <span>Revenue at risk</span>
              <strong>
                {formatMoneyFromPaise(
                  activeIncident.revenue_at_risk,
                  true,
                )}
              </strong>
            </div>

            <ArrowUpRight
              className="incident-arrow"
              size={18}
            />
          </Link>
        )}
      </section>
    </div>
  );
}
