import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Info,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
} from "motion/react";
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

import { AnimatedMetric } from "../components/motion/AnimatedMetric";
import { LayerTag } from "../components/ui/LayerTag";
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

const motionEase = [
  0.22,
  1,
  0.36,
  1,
] as const;

export function DashboardPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =====================================================
     LOAD DASHBOARD
     ===================================================== */

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
          riskDistribution:
            riskResponse.data,
          paymentMethods:
            paymentResponse.data,
          incidents:
            incidentResponse.data,
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

  /* =====================================================
     COMPUTED DATA
     ===================================================== */

  const riskTotal = useMemo(
    () =>
      data?.riskDistribution.reduce(
        (sum, item) =>
          sum + item.count,
        0,
      ) ?? 0,
    [data],
  );

  /* =====================================================
     MOTION VARIANTS
     ===================================================== */

  const metricVariants = {
    hidden: {
      opacity: 0,

      y: reduceMotion
        ? 0
        : 14,

      scale: reduceMotion
        ? 1
        : 0.985,
    },

    show: {
      opacity: 1,
      y: 0,
      scale: 1,

      transition: {
        duration: reduceMotion
          ? 0
          : 0.45,

        ease: motionEase,
      },
    },
  };

  const panelVariants = {
    hidden: {
      opacity: 0,

      y: reduceMotion
        ? 0
        : 16,
    },

    show: {
      opacity: 1,
      y: 0,

      transition: {
        duration: reduceMotion
          ? 0
          : 0.5,

        ease: motionEase,
      },
    },
  };

  /* =====================================================
     LOADING
     ===================================================== */

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

  /* =====================================================
     ERROR
     ===================================================== */

  if (error || !data) {
    return (
      <div className="error-panel">
        <ShieldAlert size={26} />

        <h3>
          Dashboard unavailable
        </h3>

        <p>
          {error ||
            "Unable to load data."}
        </p>

        <button
          className="secondary-button"
          onClick={() =>
            void loadDashboard()
          }
        >
          <RefreshCw size={16} />

          Retry
        </button>
      </div>
    );
  }

  const summary = data.summary;

  const activeIncident =
    data.incidents[0];

  const isCritical =
    activeIncident?.severity
      ?.toLowerCase() ===
    "critical";

  const hasTraffic =
    summary.transactions_today > 0;

  /* =====================================================
     DASHBOARD
     ===================================================== */

  return (
    <div className="dashboard-stack dashboard-v2">
      {/* =================================================
          LIVE PAYMENT INTELLIGENCE
          ================================================= */}

      <motion.div
        className="dashboard-toolbar dashboard-v2-toolbar"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: -8,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: reduceMotion
            ? 0
            : 0.45,

          ease: motionEase,
        }}
      >
        <div className="dashboard-v2-toolbar-copy">
          <div className="dashboard-v2-source-row">
            <span className="dashboard-date">
              LIVE PAYMENT INTELLIGENCE
            </span>

            <LayerTag
              variant="deterministic"
              label="Backend sourced"
              compact
            />
          </div>

          <span className="dashboard-context">
            Operational payment facts
            are sourced from
            PayGuard&apos;s deterministic
            backend.
          </span>
        </div>

        <motion.button
          type="button"
          className="secondary-button dashboard-v2-refresh"
          disabled={refreshing}
          onClick={() =>
            void loadDashboard(true)
          }
          whileHover={
            reduceMotion
              ? undefined
              : {
                  y: -1,
                }
          }
          whileTap={
            reduceMotion
              ? undefined
              : {
                  scale: 0.97,
                }
          }
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing"
            : "Refresh"}
        </motion.button>
      </motion.div>

      {/* =================================================
          KPI METRICS
          ================================================= */}

      <motion.section
        className="metrics-grid dashboard-v2-metrics"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},

          show: {
            transition: {
              delayChildren:
                reduceMotion
                  ? 0
                  : 0.08,

              staggerChildren:
                reduceMotion
                  ? 0
                  : 0.09,
            },
          },
        }}
      >
        {/* =================================================
            PAYMENT HEALTH
            ================================================= */}

        <motion.div
          className="dashboard-v2-metric-slot"
          variants={metricVariants}
          whileHover={
            reduceMotion
              ? undefined
              : {
                  y: -3,
                }
          }
        >
          <LayerTag
            variant="deterministic"
            label="Backend calculated"
            compact
          />

          <MetricCard
            label="Payment health"
            value={
              hasTraffic ? (
                <AnimatedMetric
                  value={
                    summary.payment_health_score
                  }
                  formatter={(value) =>
                    Math.round(
                      value,
                    ).toString()
                  }
                  duration={0.9}
                />
              ) : (
                <span data-metric>
                  —
                </span>
              )
            }
            helper={
              hasTraffic
                ? `${formatPercent(
                    summary.success_rate,
                  )} success rate`
                : "No traffic yet"
            }
            icon={ShieldCheck}
            tone={
              hasTraffic &&
              summary.payment_health_score >=
                90
                ? "success"
                : "default"
            }
          />
        </motion.div>

        {/* =================================================
            TRANSACTIONS TODAY
            ================================================= */}

        <motion.div
          className="dashboard-v2-metric-slot"
          variants={metricVariants}
          whileHover={
            reduceMotion
              ? undefined
              : {
                  y: -3,
                }
          }
        >
          <LayerTag
            variant="deterministic"
            label="Transaction fact"
            compact
          />

          <MetricCard
            label="Transactions today"
            value={
              <AnimatedMetric
                value={
                  summary.transactions_today
                }
                formatter={(value) =>
                  formatNumber(
                    Math.round(value),
                  )
                }
                duration={1}
              />
            }
            helper={`${formatNumber(
              summary.failed_transactions_today,
            )} failed payments`}
            icon={WalletCards}
          />
        </motion.div>

        {/* =================================================
            OPEN INCIDENTS
            ================================================= */}

        <motion.div
          className="dashboard-v2-metric-slot"
          variants={metricVariants}
          whileHover={
            reduceMotion
              ? undefined
              : {
                  y: -3,
                }
          }
        >
          <LayerTag
            variant="deterministic"
            label="Incident state"
            compact
          />

          <MetricCard
            label="Open incidents"
            value={
              <AnimatedMetric
                value={
                  summary.open_incidents
                }
                formatter={(value) =>
                  formatNumber(
                    Math.round(value),
                  )
                }
                duration={0.8}
              />
            }
            helper={`${summary.critical_incidents} critical`}
            icon={AlertTriangle}
            tone={
              summary.critical_incidents >
              0
                ? "danger"
                : "default"
            }
          />
        </motion.div>

        {/* =================================================
            REVENUE AT RISK
            ================================================= */}

        <motion.div
          className="dashboard-v2-metric-slot"
          variants={metricVariants}
          whileHover={
            reduceMotion
              ? undefined
              : {
                  y: -3,
                }
          }
        >
          <LayerTag
            variant="deterministic"
            label="Backend calculated"
            compact
          />

          <MetricCard
            label="Revenue at risk"
            value={
              <AnimatedMetric
                value={
                  summary.revenue_at_risk
                }
                formatter={(value) =>
                  formatMoneyFromPaise(
                    Math.round(value),
                    true,
                  )
                }
                duration={1.15}
              />
            }
            helper="Deterministic exposure"
            icon={
              CircleDollarSign
            }
            tone={
              summary.revenue_at_risk >
              0
                ? "danger"
                : "default"
            }
          />
        </motion.div>
      </motion.section>

      {/* =================================================
          RISK + PAYMENT METHODS
          ================================================= */}

      <motion.section
        className="dashboard-main-grid"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},

          show: {
            transition: {
              delayChildren:
                reduceMotion
                  ? 0
                  : 0.28,

              staggerChildren:
                reduceMotion
                  ? 0
                  : 0.12,
            },
          },
        }}
      >
        {/* =================================================
            RISK DISTRIBUTION
            ================================================= */}

        <motion.article
          className="panel risk-panel dashboard-v2-panel"
          variants={panelVariants}
        >
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">
                Risk posture
              </span>

              <h3>
                Transaction risk
                distribution
              </h3>
            </div>

            <div className="panel-header-actions-v2">
              <LayerTag
                variant="deterministic"
                label="Transaction level"
                compact
              />

              <div className="panel-badge">
                {formatNumber(
                  riskTotal,
                )}{" "}
                evaluated
              </div>
            </div>
          </div>

          <motion.div
            className="risk-distribution-note"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 8,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: reduceMotion
                ? 0
                : 0.38,

              duration: reduceMotion
                ? 0
                : 0.4,

              ease: motionEase,
            }}
          >
            <Info size={15} />

            <div>
              <strong>
                Per-transaction risk,
                not incident severity.
              </strong>

              <span>
                A correlated incident can
                become CRITICAL even when
                most individual transactions
                remain LOW or MEDIUM risk.
              </span>
            </div>
          </motion.div>

          <div className="risk-content">
            {/* =============================================
                RISK DONUT
                ============================================= */}

            <motion.div
              className="risk-chart"
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.94,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: reduceMotion
                  ? 0
                  : 0.42,

                duration: reduceMotion
                  ? 0
                  : 0.55,

                ease: motionEase,
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      data.riskDistribution
                    }
                    dataKey="count"
                    nameKey="risk_level"
                    innerRadius={66}
                    outerRadius={92}
                    paddingAngle={3}
                    isAnimationActive={
                      !reduceMotion
                    }
                    animationBegin={150}
                    animationDuration={900}
                    animationEasing="ease-out"
                  >
                    {data.riskDistribution.map(
                      (entry) => (
                        <Cell
                          key={
                            entry.risk_level
                          }
                          className={`risk-segment risk-${entry.risk_level.toLowerCase()}`}
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background:
                        "#131417",

                      border:
                        "1px solid #2a2d33",

                      borderRadius:
                        "12px",

                      fontSize:
                        "12px",

                      color:
                        "#f4f5f3",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="risk-chart-center">
                <AnimatedMetric
                  value={riskTotal}
                  formatter={(value) =>
                    formatNumber(
                      Math.round(value),
                    )
                  }
                  duration={0.95}
                />

                <span>
                  transactions
                </span>
              </div>
            </motion.div>

            {/* =============================================
                RISK LEGEND
                ============================================= */}

            <motion.div
              className="risk-legend"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},

                show: {
                  transition: {
                    delayChildren:
                      reduceMotion
                        ? 0
                        : 0.48,

                    staggerChildren:
                      reduceMotion
                        ? 0
                        : 0.07,
                  },
                },
              }}
            >
              {data.riskDistribution.map(
                (item) => (
                  <motion.div
                    className="risk-legend-row"
                    key={
                      item.risk_level
                    }
                    variants={{
                      hidden: {
                        opacity: 0,

                        x: reduceMotion
                          ? 0
                          : 8,
                      },

                      show: {
                        opacity: 1,
                        x: 0,

                        transition: {
                          duration:
                            reduceMotion
                              ? 0
                              : 0.32,

                          ease:
                            motionEase,
                        },
                      },
                    }}
                  >
                    <div className="risk-label">
                      <span
                        className={`risk-dot risk-${item.risk_level.toLowerCase()}`}
                      />

                      {
                        item.risk_level
                      }
                    </div>

                    <AnimatedMetric
                      value={item.count}
                      formatter={(value) =>
                        formatNumber(
                          Math.round(value),
                        )
                      }
                      duration={0.85}
                    />
                  </motion.div>
                ),
              )}
            </motion.div>
          </div>
        </motion.article>

        {/* =================================================
            PAYMENT METHODS
            ================================================= */}

        <motion.article
          className="panel payment-panel dashboard-v2-panel"
          variants={panelVariants}
        >
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">
                Payment rails
              </span>

              <h3>
                Method performance
              </h3>
            </div>

            <div className="panel-header-actions-v2">
              <LayerTag
                variant="deterministic"
                label="Observed traffic"
                compact
              />

              <TrendingUp
                size={18}
              />
            </div>
          </div>

          <div className="payment-method-list">
            {data.paymentMethods.length ===
            0 ? (
              <motion.div
                className="empty-state"
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 6,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: reduceMotion
                    ? 0
                    : 0.5,

                  duration: reduceMotion
                    ? 0
                    : 0.4,
                }}
              >
                No payment traffic yet.
              </motion.div>
            ) : (
              data.paymentMethods.map(
                (
                  method,
                  index,
                ) => (
                  <motion.div
                    className="payment-method-row"
                    key={
                      method.payment_method
                    }
                    initial={
                      reduceMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 10,
                          }
                    }
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        reduceMotion
                          ? 0
                          : 0.42 +
                            index *
                              0.07,

                      duration:
                        reduceMotion
                          ? 0
                          : 0.4,

                      ease:
                        motionEase,
                    }}
                  >
                    <div className="method-identity">
                      <div className="method-icon">
                        {method.payment_method
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {
                            method.payment_method
                          }
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
                        <span>
                          Success
                        </span>

                        <strong data-metric>
                          {formatPercent(
                            method.success_rate,
                          )}
                        </strong>
                      </div>

                      <div className="health-track">
                        <motion.span
                          initial={
                            reduceMotion
                              ? false
                              : {
                                  width:
                                    "0%",
                                }
                          }
                          animate={{
                            width: `${Math.min(
                              100,
                              method.success_rate *
                                100,
                            )}%`,
                          }}
                          transition={{
                            duration:
                              reduceMotion
                                ? 0
                                : 0.85,

                            delay:
                              reduceMotion
                                ? 0
                                : 0.5 +
                                  index *
                                    0.06,

                            ease:
                              motionEase,
                          }}
                        />
                      </div>

                      <small>
                        Avg. risk score{" "}
                        {
                          method.risk_score
                        }
                      </small>
                    </div>
                  </motion.div>
                ),
              )
            )}
          </div>
        </motion.article>
      </motion.section>

      {/* =================================================
          ACTIVE INCIDENT
          ================================================= */}

      <motion.section
        className="panel incident-panel dashboard-v2-panel dashboard-v2-incident-panel"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 16,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: reduceMotion
            ? 0
            : 0.42,

          duration: reduceMotion
            ? 0
            : 0.52,

          ease: motionEase,
        }}
      >
        <div className="panel-header">
          <div>
            <span className="panel-eyebrow">
              Active response
            </span>

            <h3>
              Highest priority
              incident
            </h3>
          </div>

          <div className="panel-header-actions-v2">
            {activeIncident && (
              <LayerTag
                variant="deterministic"
                label="Correlated incident"
                compact
              />
            )}

            <Link
              to="/incidents"
              className="text-link"
            >
              View all incidents

              <ArrowUpRight
                size={15}
              />
            </Link>
          </div>
        </div>

        {!activeIncident ? (
          <motion.div
            className="incident-clear"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 8,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <CheckCircle2
              size={25}
            />

            <div>
              <strong>
                No active incidents
              </strong>

              <span>
                Payment operations are
                currently within monitored
                thresholds.
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            whileHover={
              reduceMotion
                ? undefined
                : {
                    y: -2,
                  }
            }
            transition={{
              duration: 0.2,
            }}
          >
            <Link
              to="/incidents"
              className={`active-incident-card dashboard-v2-active-incident ${
                isCritical
                  ? "dashboard-critical-incident"
                  : ""
              }`}
            >
              <div className="incident-severity-bar" />

              {/* ===========================================
                  CRITICAL SIGNAL
                  =========================================== */}

              <motion.div
                className="incident-icon danger"
                animate={
                  isCritical &&
                  !reduceMotion
                    ? {
                        scale: [
                          1,
                          1.07,
                          1,
                        ],

                        opacity: [
                          1,
                          0.82,
                          1,
                        ],
                      }
                    : undefined
                }
                transition={
                  isCritical &&
                  !reduceMotion
                    ? {
                        duration: 2.2,

                        repeat:
                          Infinity,

                        ease:
                          "easeInOut",
                      }
                    : undefined
                }
              >
                <AlertTriangle
                  size={20}
                />
              </motion.div>

              <div className="incident-main">
                <div className="incident-meta">
                  <span
                    className={`severity-badge ${activeIncident.severity.toLowerCase()}`}
                  >
                    {
                      activeIncident.severity
                    }
                  </span>

                  <span>
                    {
                      activeIncident.incident_number
                    }
                  </span>

                  <span>
                    {timeAgo(
                      activeIncident.detected_at,
                    )}
                  </span>
                </div>

                <h4>
                  {
                    activeIncident.title
                  }
                </h4>

                <div className="incident-detail-row">
                  <span>
                    {activeIncident.payment_method ||
                      "Payment"}
                  </span>

                  {activeIncident.bank && (
                    <>
                      <i />

                      <span>
                        {
                          activeIncident.bank
                        }
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

              <div className="incident-exposure dashboard-v2-exposure">
                <span>
                  Revenue at risk
                </span>

                <AnimatedMetric
                  value={
                    activeIncident.revenue_at_risk
                  }
                  formatter={(value) =>
                    formatMoneyFromPaise(
                      Math.round(value),
                      true,
                    )
                  }
                  duration={1.15}
                />

                <LayerTag
                  variant="deterministic"
                  label="Backend calculated"
                  compact
                />
              </div>

              <ArrowUpRight
                className="incident-arrow"
                size={18}
              />
            </Link>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}