import {
  AlertTriangle,
  ArrowRight,
  Building2,
  RefreshCw,
  ShieldAlert,
  WalletCards,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { AnimatedMetric } from "../components/motion/AnimatedMetric";
import {
  ApiError,
  apiRequest,
} from "../lib/api";
import {
  formatMoneyFromPaise,
  timeAgo,
} from "../lib/format";
import type {
  IncidentListEnvelope,
  IncidentListItem,
} from "../types/api";

const motionEase = [
  0.22,
  1,
  0.36,
  1,
] as const;

export function IncidentsPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [incidents, setIncidents] =
    useState<IncidentListItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =====================================================
     LOAD INCIDENTS
     ===================================================== */

  const loadIncidents = useCallback(
    async (manual = false) => {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response =
          await apiRequest<IncidentListEnvelope>(
            "/incidents?page=1&page_size=25&sort_order=desc",
          );

        setIncidents(response.data);
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
            : "Unable to load incidents.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    void loadIncidents();
  }, [loadIncidents]);

  return (
    <div className="incidents-stack">
      {/* =================================================
          HERO
          ================================================= */}

      <motion.section
        className="incidents-hero"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: -10,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: reduceMotion ? 0 : 0.48,
          ease: motionEase,
        }}
      >
        <div>
          <motion.span
            className="panel-eyebrow"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    x: -8,
                  }
            }
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.05,
              duration: 0.3,
            }}
          >
            ACTIVE RESPONSE
          </motion.span>

          <motion.h2
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
              delay: 0.08,
              duration: 0.4,
              ease: motionEase,
            }}
          >
            Incident operations
          </motion.h2>

          <motion.p
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
              delay: 0.13,
              duration: 0.35,
            }}
          >
            Correlated payment anomalies that
            require investigation, explanation and
            controlled response.
          </motion.p>
        </div>

        <motion.div
          className="incident-hero-count"
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  x: 12,
                }
          }
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.13,
            duration: 0.4,
            ease: motionEase,
          }}
        >
          <motion.div
            animate={
              incidents.length > 0 &&
              !reduceMotion
                ? {
                    scale: [1, 1.08, 1],
                  }
                : undefined
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <AlertTriangle size={18} />
          </motion.div>

          <div>
            <span>
              Open incidents
            </span>

            <AnimatedMetric
              value={incidents.length}
              duration={0.7}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* =================================================
          LIST PANEL
          ================================================= */}

      <motion.section
        className="incidents-list-panel"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 12,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.14,
          duration: reduceMotion ? 0 : 0.42,
          ease: motionEase,
        }}
      >
        <div className="incidents-list-header">
          <div>
            <span className="panel-eyebrow">
              DETECTED INCIDENTS
            </span>

            <h3>
              Risk events
            </h3>
          </div>

          <motion.button
            className="secondary-button"
            type="button"
            disabled={refreshing}
            onClick={() =>
              void loadIncidents(true)
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
              size={14}
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
        </div>

        {/* =================================================
            ERROR
            ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              className="incident-page-error"
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -5,
              }}
            >
              <ShieldAlert size={15} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            CONTENT
            ================================================= */}

        {loading ? (
          <div className="incident-page-loading">
            <div className="loader-ring" />

            Loading incidents...
          </div>
        ) : incidents.length === 0 ? (
          <motion.div
            className="incident-page-empty"
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
            <ShieldAlert size={25} />

            <h3>
              No active incidents
            </h3>

            <p>
              Run the bank degradation simulator to
              generate the demo incident.
            </p>
          </motion.div>
        ) : (
          /*
           * IMPORTANT:
           *
           * We are intentionally NOT using
           * parent "hidden/show" variants here.
           *
           * Every row gets its own explicit
           * initial + animate state.
           */
          <div className="incident-list">
            {incidents.map(
              (incident, index) => {
                const severity =
                  incident.severity.toLowerCase();

                const isCritical =
                  severity === "critical";

                const isHigh =
                  severity === "high";

                const elevated =
                  isCritical || isHigh;

                return (
                  <motion.button
                    type="button"
                    key={incident.id}
                    className={`incident-list-card ${
                      isCritical
                        ? "incident-list-card-critical"
                        : ""
                    }`}
                    onClick={() =>
                      navigate(
                        `/incidents/${incident.id}`,
                      )
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
                      delay: reduceMotion
                        ? 0
                        : Math.min(
                            0.08 + index * 0.06,
                            0.5,
                          ),

                      duration: reduceMotion
                        ? 0
                        : 0.38,

                      ease: motionEase,
                    }}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : {
                            y: -3,
                          }
                    }
                    whileTap={
                      reduceMotion
                        ? undefined
                        : {
                            scale: 0.997,
                          }
                    }
                  >
                    {/* ===================================
                        SEVERITY ICON
                        =================================== */}

                    <motion.div
                      className={`incident-list-icon ${severity}`}
                      animate={
                        elevated &&
                        !reduceMotion
                          ? {
                              scale: [
                                1,
                                isCritical
                                  ? 1.08
                                  : 1.04,
                                1,
                              ],
                            }
                          : undefined
                      }
                      transition={
                        elevated &&
                        !reduceMotion
                          ? {
                              duration:
                                isCritical
                                  ? 1.8
                                  : 2.5,

                              repeat: Infinity,

                              ease:
                                "easeInOut",
                            }
                          : undefined
                      }
                    >
                      <AlertTriangle size={19} />
                    </motion.div>

                    {/* ===================================
                        INCIDENT
                        =================================== */}

                    <div className="incident-list-main">
                      <div className="incident-list-meta">
                        <span
                          className={`severity-badge ${severity}`}
                        >
                          {incident.severity}
                        </span>

                        <span>
                          {incident.incident_number}
                        </span>

                        <span>
                          {timeAgo(
                            incident.detected_at,
                          )}
                        </span>
                      </div>

                      <h4>
                        {incident.title}
                      </h4>

                      <div className="incident-tags">
                        <span>
                          <WalletCards size={12} />

                          {incident.payment_method ||
                            "Payment"}
                        </span>

                        {incident.bank && (
                          <span>
                            <Building2 size={12} />

                            {incident.bank}
                          </span>
                        )}

                        <span>
                          <AnimatedMetric
                            value={
                              incident.affected_transaction_count
                            }
                            duration={0.65}
                          />{" "}
                          affected
                        </span>
                      </div>
                    </div>

                    {/* ===================================
                        FAILURE IMPACT
                        =================================== */}

                    <div className="incident-list-metric">
                      <span>
                        Failure impact
                      </span>

                      <strong>
                        <AnimatedMetric
                          value={
                            incident.failed_transaction_count
                          }
                          duration={0.65}
                        />

                        <span>/</span>

                        <AnimatedMetric
                          value={
                            incident.affected_transaction_count
                          }
                          duration={0.7}
                        />
                      </strong>
                    </div>

                    {/* ===================================
                        REVENUE
                        =================================== */}

                    <div className="incident-list-metric exposure">
                      <span>
                        Revenue at risk
                      </span>

                      <strong>
                        <AnimatedMetric
                          value={
                            incident.revenue_at_risk
                          }
                          formatter={(value) =>
                            formatMoneyFromPaise(
                              Math.round(value),
                              true,
                            )
                          }
                          duration={1}
                        />
                      </strong>
                    </div>

                    {/* ===================================
                        STATUS
                        =================================== */}

                    <div className="incident-list-status">
                      <span>
                        {incident.status.replaceAll(
                          "_",
                          " ",
                        )}
                      </span>

                      <motion.div
                        whileHover={
                          reduceMotion
                            ? undefined
                            : {
                                x: 4,
                              }
                        }
                      >
                        <ArrowRight size={15} />
                      </motion.div>
                    </div>
                  </motion.button>
                );
              },
            )}
          </div>
        )}
      </motion.section>
    </div>
  );
}