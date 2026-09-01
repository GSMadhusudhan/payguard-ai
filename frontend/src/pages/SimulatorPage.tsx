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
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import { AnimatedMetric } from "../components/motion/AnimatedMetric";
import { LayerTag } from "../components/ui/LayerTag";

import {
  ApiError,
  apiRequest,
} from "../lib/api";

/* =========================================================
   TYPES
   ========================================================= */

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

/* =========================================================
   MOTION
   ========================================================= */

const motionEase = [
  0.22,
  1,
  0.36,
  1,
] as const;

/* =========================================================
   SCENARIO METADATA
   ========================================================= */

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

/* =========================================================
   PAGE
   ========================================================= */

export function SimulatorPage() {
  const navigate = useNavigate();

  const reduceMotion =
    useReducedMotion();

  const [
    scenarios,
    setScenarios,
  ] = useState<Scenario[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    runningScenario,
    setRunningScenario,
  ] = useState<string | null>(
    null,
  );

  const [
    lastRun,
    setLastRun,
  ] =
    useState<SimulationRun | null>(
      null,
    );

  /* =====================================================
     LOAD SCENARIOS
     ===================================================== */

  const loadScenarios =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await apiRequest<ScenarioEnvelope>(
              "/simulator/scenarios",
            );

          setScenarios(
            response.data,
          );
        } catch (err) {
          if (
            err instanceof ApiError &&
            err.status === 401
          ) {
            localStorage.removeItem(
              "payguard_access_token",
            );

            navigate(
              "/login",
              {
                replace: true,
              },
            );

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

  /* =====================================================
     RUN SCENARIO
     ===================================================== */

  async function runScenario(
    scenarioId: string,
  ) {
    setRunningScenario(
      scenarioId,
    );

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

      setLastRun(
        response.data,
      );
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

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <motion.div
        className="simulator-loading"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
      >
        <div className="loader-ring" />

        <span>
          Loading deterministic
          risk scenarios...
        </span>
      </motion.div>
    );
  }

  const isBankRun =
    lastRun?.scenario_id ===
    "bank_degradation";

  const pipelineRunning =
    runningScenario !== null;

  /* =====================================================
     UI
     ===================================================== */

  return (
    <div className="simulator-stack simulator-v3">
      {/* =================================================
          HERO
          ================================================= */}

      <motion.section
        className="simulator-hero simulator-hero-v3"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 14,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration:
            reduceMotion
              ? 0
              : 0.48,

          ease:
            motionEase,
        }}
      >
        {/* COPY */}

        <motion.div
          className="simulator-hero-copy"
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  x: -10,
                }
          }
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.42,
            ease: motionEase,
          }}
        >
          <motion.div
            className="simulator-kicker"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 5,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      rotate: [
                        0,
                        -5,
                        5,
                        0,
                      ],
                    }
              }
              transition={{
                duration: 4,
                repeat:
                  Infinity,
                ease:
                  "easeInOut",
              }}
            >
              <TestTube2
                size={14}
              />
            </motion.div>

            RISK SCENARIO LAB
          </motion.div>

          <motion.h2
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
              delay: 0.07,
              duration: 0.4,
              ease: motionEase,
            }}
          >
            Generate risk.
            <br />
            Observe the complete
            response.
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
            }}
          >
            Controlled scenarios
            flow through PayGuard&apos;s
            real ingestion, risk,
            incident and investigation
            pipeline.
          </motion.p>
        </motion.div>

        {/* ===============================================
            PIPELINE
            =============================================== */}

        <motion.div
          className="simulator-flow simulator-flow-v3"
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
            delay: 0.12,
            duration: 0.45,
            ease: motionEase,
          }}
        >
          <FlowStep
            icon={Database}
            label="Generate"
            layer="FACT"
            active={
              pipelineRunning
            }
            delay={0}
          />

          <FlowArrow
            active={
              pipelineRunning
            }
            delay={0}
          />

          <FlowStep
            icon={Zap}
            label="Detect"
            layer="RISK"
            active={
              pipelineRunning
            }
            delay={0.25}
          />

          <FlowArrow
            active={
              pipelineRunning
            }
            delay={0.25}
          />

          <FlowStep
            icon={Sparkles}
            label="Investigate"
            layer="AI"
            ai
            active={
              pipelineRunning
            }
            delay={0.5}
          />

          <FlowArrow
            active={
              pipelineRunning
            }
            delay={0.5}
          />

          <FlowStep
            icon={ShieldCheck}
            label="Respond"
            layer="HUMAN"
            active={
              pipelineRunning
            }
            delay={0.75}
          />
        </motion.div>
      </motion.section>

      {/* =================================================
          ERROR
          ================================================= */}

      <AnimatePresence>
        {error && (
          <motion.div
            className="simulator-error simulator-error-v3"
            initial={{
              opacity: 0,
              y: -7,
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
            <AlertTriangle
              size={16}
            />

            <span>
              {error}
            </span>

            <motion.button
              type="button"
              onClick={() =>
                void loadScenarios()
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
                      scale:
                        0.97,
                    }
              }
            >
              Retry
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================
          SCENARIOS
          ================================================= */}

      <motion.section
        className="scenario-section"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 14,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.15,
          duration: 0.45,
          ease: motionEase,
        }}
      >
        {/* ===============================================
            HEADING
            =============================================== */}

        <div className="section-heading-row scenario-heading-v3">
          <motion.div
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
          >
            <span className="panel-eyebrow">
              CONTROLLED
              ENVIRONMENTS
            </span>

            <h3>
              Choose a payment
              scenario
            </h3>

            <p>
              All generated traffic
              is isolated to the
              PayGuard demo
              environment.
            </p>
          </motion.div>

          <motion.div
            className="scenario-heading-meta-v3"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    x: 8,
                  }
            }
            animate={{
              opacity: 1,
              x: 0,
            }}
          >
            <LayerTag
              variant="deterministic"
              label="Deterministic scenarios"
            />

            <span className="scenario-count">
              <AnimatedMetric
                value={
                  scenarios.length
                }
                duration={0.6}
              />{" "}
              available
            </span>
          </motion.div>
        </div>

        {/* ===============================================
            SCENARIO CARDS
            =============================================== */}

        <div className="scenario-grid scenario-grid-v3">
          {scenarios.map(
            (
              scenario,
              index,
            ) => {
              const meta =
                scenarioMeta[
                  scenario.id
                ] || {
                  label:
                    "Scenario",
                  icon:
                    TestTube2,
                  details: [],
                };

              const Icon =
                meta.icon;

              const isRunning =
                runningScenario ===
                scenario.id;

              return (
                <motion.article
                  key={
                    scenario.id
                  }
                  className={`scenario-card scenario-card-v3 ${
                    meta.featured
                      ? "featured featured-v3"
                      : ""
                  }`}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 14,
                          scale:
                            0.99,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  transition={{
                    delay:
                      reduceMotion
                        ? 0
                        : 0.18 +
                          index *
                            0.08,

                    duration:
                      reduceMotion
                        ? 0
                        : 0.4,

                    ease:
                      motionEase,
                  }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -4,
                        }
                  }
                >
                  {/* FEATURED */}

                  {meta.featured && (
                    <motion.div
                      className="featured-ribbon featured-ribbon-v3"
                      initial={
                        reduceMotion
                          ? false
                          : {
                              opacity: 0,
                              x: -10,
                            }
                      }
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: 0.35,
                      }}
                    >
                      PRIMARY BUILDATHON
                      DEMO
                    </motion.div>
                  )}

                  {/* HEAD */}

                  <div className="scenario-card-head">
                    <motion.div
                      className={`scenario-icon ${
                        meta.featured
                          ? "danger"
                          : ""
                      }`}
                      animate={
                        isRunning &&
                        !reduceMotion
                          ? {
                              scale: [
                                1,
                                1.1,
                                1,
                              ],

                              rotate: [
                                0,
                                -3,
                                3,
                                0,
                              ],
                            }
                          : undefined
                      }
                      transition={{
                        duration:
                          1.4,

                        repeat:
                          Infinity,

                        ease:
                          "easeInOut",
                      }}
                    >
                      <Icon
                        size={20}
                      />
                    </motion.div>

                    <div className="scenario-type-stack-v3">
                      <span className="scenario-type">
                        {
                          meta.label
                        }
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

                  <h4>
                    {scenario.name}
                  </h4>

                  <p>
                    {
                      scenario.description
                    }
                  </p>

                  {/* =====================================
                      DEGRADATION VISUAL
                      ===================================== */}

                  {scenario.id ===
                    "bank_degradation" && (
                    <motion.div
                      className="degradation-visual-v3"
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
                        delay:
                          0.3,
                      }}
                    >
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

                      <motion.div
                        animate={
                          reduceMotion
                            ? undefined
                            : {
                                x: [
                                  0,
                                  4,
                                  0,
                                ],
                              }
                        }
                        transition={{
                          duration:
                            1.8,

                          repeat:
                            Infinity,

                          ease:
                            "easeInOut",
                        }}
                      >
                        <ArrowRight
                          size={
                            16
                          }
                        />
                      </motion.div>

                      <motion.div
                        className="degradation-current-v3"
                        animate={
                          isRunning &&
                          !reduceMotion
                            ? {
                                scale:
                                  [
                                    1,
                                    1.04,
                                    1,
                                  ],
                              }
                            : undefined
                        }
                        transition={{
                          duration:
                            1.5,

                          repeat:
                            Infinity,
                        }}
                      >
                        <span>
                          CURRENT
                        </span>

                        <strong>
                          30%
                        </strong>

                        <small>
                          ABC Bank
                          UPI
                        </small>
                      </motion.div>

                      <motion.div
                        className="degradation-multiplier-v3"
                        animate={
                          reduceMotion
                            ? undefined
                            : {
                                opacity:
                                  [
                                    0.75,
                                    1,
                                    0.75,
                                  ],
                              }
                        }
                        transition={{
                          duration:
                            2,

                          repeat:
                            Infinity,
                        }}
                      >
                        6× spike
                      </motion.div>
                    </motion.div>
                  )}

                  {/* =====================================
                      DETAILS
                      ===================================== */}

                  <motion.div
                    className="scenario-details scenario-details-v3"
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},

                      show: {
                        transition:
                          {
                            delayChildren:
                              reduceMotion
                                ? 0
                                : 0.25,

                            staggerChildren:
                              reduceMotion
                                ? 0
                                : 0.045,
                          },
                      },
                    }}
                  >
                    {meta.details.map(
                      (
                        detail,
                      ) => (
                        <motion.div
                          key={
                            detail
                          }
                          variants={{
                            hidden: {
                              opacity:
                                0,

                              x:
                                reduceMotion
                                  ? 0
                                  : -5,
                            },

                            show: {
                              opacity:
                                1,

                              x: 0,

                              transition:
                                {
                                  duration:
                                    0.25,
                                },
                            },
                          }}
                        >
                          <CheckCircle2
                            size={
                              12
                            }
                          />

                          <span>
                            {
                              detail
                            }
                          </span>
                        </motion.div>
                      ),
                    )}
                  </motion.div>

                  {/* =====================================
                      FOOTER
                      ===================================== */}

                  <div className="scenario-card-footer scenario-footer-v3">
                    <div className="scenario-config">
                      <WalletCards
                        size={13}
                      />

                      100
                      transactions

                      <i />

                      <Clock3
                        size={13}
                      />

                      60s logical
                      window
                    </div>

                    <motion.button
                      className={
                        meta.featured
                          ? "pg-primary-action scenario-run"
                          : "secondary-button scenario-run"
                      }
                      type="button"
                      disabled={
                        runningScenario !==
                        null
                      }
                      onClick={() =>
                        void runScenario(
                          scenario.id,
                        )
                      }
                      whileHover={
                        reduceMotion
                          ? undefined
                          : {
                              y:
                                -2,
                            }
                      }
                      whileTap={
                        reduceMotion
                          ? undefined
                          : {
                              scale:
                                0.98,
                            }
                      }
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw
                            size={
                              14
                            }
                            className="spin"
                          />

                          Running
                          pipeline...
                        </>
                      ) : (
                        <>
                          <Play
                            size={
                              14
                            }
                          />

                          {meta.featured
                            ? "Run bank degradation"
                            : "Run scenario"}
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.article>
              );
            },
          )}
        </div>
      </motion.section>

      {/* =================================================
          RUNNING PIPELINE MESSAGE
          ================================================= */}

      <AnimatePresence>
        {pipelineRunning && (
          <motion.div
            className="simulator-error simulator-error-v3"
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
            exit={{
              opacity: 0,
              y: -5,
            }}
          >
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      rotate:
                        360,
                    }
              }
              transition={{
                duration: 1.4,
                repeat:
                  Infinity,
                ease:
                  "linear",
              }}
            >
              <Zap size={16} />
            </motion.div>

            <span>
              PayGuard is processing
              the controlled scenario
              through the risk
              pipeline...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================
          SIMULATION RESULT
          ================================================= */}

      <AnimatePresence mode="wait">
        {lastRun && (
          <motion.section
            key={
              lastRun.simulation_id
            }
            className="simulation-result simulation-result-v3"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 18,
                    scale:
                      0.992,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration:
                reduceMotion
                  ? 0
                  : 0.5,

              ease:
                motionEase,
            }}
          >
            {/* ===========================================
                RESULT HEADER
                =========================================== */}

            <div className="simulation-result-header-v3">
              <motion.div
                className="result-success-icon"
                initial={
                  reduceMotion
                    ? false
                    : {
                        scale:
                          0.65,

                        opacity:
                          0,
                      }
                }
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  type:
                    "spring",

                  stiffness:
                    220,

                  damping:
                    17,
                }}
              >
                <CheckCircle2
                  size={23}
                />
              </motion.div>

              <motion.div
                className="result-main"
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        x: -7,
                      }
                }
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.08,
                }}
              >
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
                      {
                        lastRun.status
                      }
                    </strong>
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  x: 8,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.12,
                }}
              >
                <LayerTag
                  variant="deterministic"
                  label="Pipeline result"
                />
              </motion.div>
            </div>

            {/* ===========================================
                BANK DEGRADATION RESULT
                =========================================== */}

            {isBankRun ? (
              <>
                {/* METRICS */}

                <motion.div
                  className="simulation-metrics-v3"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},

                    show: {
                      transition:
                        {
                          delayChildren:
                            reduceMotion
                              ? 0
                              : 0.15,

                          staggerChildren:
                            reduceMotion
                              ? 0
                              : 0.08,
                        },
                    },
                  }}
                >
                  <ResultMetric
                    label="Transactions"
                    value={
                      <AnimatedMetric
                        value={
                          lastRun.transactions_generated
                        }
                        duration={
                          0.9
                        }
                      />
                    }
                    helper="generated"
                  />

                  <ResultMetric
                    label="Successful"
                    value={
                      <AnimatedMetric
                        value={
                          91
                        }
                        duration={
                          0.9
                        }
                      />
                    }
                    helper="91.0% success"
                  />

                  <ResultMetric
                    label="Failed"
                    value={
                      <AnimatedMetric
                        value={
                          9
                        }
                        duration={
                          0.85
                        }
                      />
                    }
                    helper="payment failures"
                    danger
                  />

                  <ResultMetric
                    label="Revenue at risk"
                    value={
                      <AnimatedMetric
                        value={
                          4.28
                        }
                        formatter={(
                          value,
                        ) =>
                          `₹${value.toFixed(
                            2,
                          )}L`
                        }
                        duration={
                          1.05
                        }
                      />
                    }
                    helper="backend calculated"
                    danger
                  />
                </motion.div>

                {/* DETECTION */}

                <motion.div
                  className="simulation-detection-v3"
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
                        : 0.3,

                    duration:
                      0.42,

                    ease:
                      motionEase,
                  }}
                >
                  <div className="simulation-detection-copy-v3">
                    <span className="panel-eyebrow">
                      DETECTION
                      RESULT
                    </span>

                    <h4>
                      ABC Bank UPI
                      failure rate
                      increased from
                      5% to 30%.
                    </h4>

                    <p>
                      6 of 20
                      affected ABC
                      Bank
                      transactions
                      failed,
                      producing a
                      correlated
                      critical
                      incident.
                    </p>
                  </div>

                  <motion.div
                    className="simulation-detection-state-v3"
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            boxShadow:
                              [
                                "0 0 0 rgba(240,85,74,0)",
                                "0 0 24px rgba(240,85,74,0.07)",
                                "0 0 0 rgba(240,85,74,0)",
                              ],
                          }
                    }
                    transition={{
                      duration:
                        2.4,

                      repeat:
                        Infinity,

                      ease:
                        "easeInOut",
                    }}
                  >
                    <motion.span
                      className="severity-badge critical"
                      animate={
                        reduceMotion
                          ? undefined
                          : {
                              scale:
                                [
                                  1,
                                  1.04,
                                  1,
                                ],
                            }
                      }
                      transition={{
                        duration:
                          1.8,

                        repeat:
                          Infinity,
                      }}
                    >
                      CRITICAL
                    </motion.span>

                    <strong>
                      5% → 30%
                    </strong>

                    <small>
                      ABC Bank UPI
                    </small>
                  </motion.div>
                </motion.div>

                {/* IMPACT */}

                <motion.div
                  className="result-impact result-impact-v3"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},

                    show: {
                      transition:
                        {
                          delayChildren:
                            reduceMotion
                              ? 0
                              : 0.4,

                          staggerChildren:
                            reduceMotion
                              ? 0
                              : 0.08,
                        },
                    },
                  }}
                >
                  <ImpactItem>
                    <AlertTriangle
                      size={14}
                    />

                    <span>
                      Critical incident
                      created
                    </span>
                  </ImpactItem>

                  <ImpactItem>
                    <CircleDollarSign
                      size={14}
                    />

                    <span>
                      ₹4.28L
                      deterministic
                      exposure
                    </span>
                  </ImpactItem>

                  <ImpactItem>
                    <Sparkles
                      size={14}
                    />

                    <span>
                      AI investigation
                      ready
                    </span>
                  </ImpactItem>
                </motion.div>
              </>
            ) : (
              /* =========================================
                 HEALTHY RESULT
                 ========================================= */

              <motion.div
                className="result-impact result-impact-v3 healthy"
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                <div>
                  <ShieldCheck
                    size={14}
                  />

                  <span>
                    Healthy baseline
                    generated
                  </span>
                </div>
              </motion.div>
            )}

            {/* ===========================================
                RESULT ACTIONS
                =========================================== */}

            <motion.div
              className="result-actions result-actions-v3"
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
                delay:
                  reduceMotion
                    ? 0
                    : 0.52,
              }}
            >
              <motion.button
                type="button"
                className="secondary-button"
                onClick={() =>
                  navigate("/")
                }
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        y: -2,
                      }
                }
                whileTap={
                  reduceMotion
                    ? undefined
                    : {
                        scale:
                          0.98,
                      }
                }
              >
                View dashboard
              </motion.button>

              <motion.button
                type="button"
                className="secondary-button"
                onClick={() =>
                  navigate(
                    "/transactions",
                  )
                }
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        y: -2,
                      }
                }
                whileTap={
                  reduceMotion
                    ? undefined
                    : {
                        scale:
                          0.98,
                      }
                }
              >
                View transactions
              </motion.button>

              {lastRun.incident_id && (
                <motion.button
                  type="button"
                  className="pg-primary-action"
                  onClick={() =>
                    navigate(
                      `/incidents/${lastRun.incident_id}`,
                    )
                  }
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -2,
                          x: 2,
                        }
                  }
                  whileTap={
                    reduceMotion
                      ? undefined
                      : {
                          scale:
                            0.98,
                        }
                  }
                >
                  View incident

                  <ArrowRight
                    size={14}
                  />
                </motion.button>
              )}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* =================================================
          SAFETY
          ================================================= */}

      <motion.section
        className="simulator-safety simulator-safety-v3"
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
          delay: 0.28,
          duration: 0.4,
          ease: motionEase,
        }}
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [
                    1,
                    1.05,
                    1,
                  ],
                }
          }
          transition={{
            duration: 3,
            repeat:
              Infinity,
            ease:
              "easeInOut",
          }}
        >
          <ShieldCheck
            size={17}
          />
        </motion.div>

        <div>
          <div className="simulator-safety-heading-v3">
            <strong>
              Safe demonstration
              environment
            </strong>

            <LayerTag
              variant="human"
              label="Simulated only"
            />
          </div>

          <p>
            Simulator transactions
            use the real PayGuard
            processing pipeline, but
            mitigation execution
            remains SIMULATED. No
            live payment-routing
            configuration is
            changed.
          </p>
        </div>
      </motion.section>
    </div>
  );
}

/* =========================================================
   FLOW STEP
   ========================================================= */

function FlowStep({
  icon: Icon,
  label,
  layer,
  ai = false,
  active = false,
  delay = 0,
}: {
  icon: typeof Database;
  label: string;
  layer: string;
  ai?: boolean;
  active?: boolean;
  delay?: number;
}) {
  const reduceMotion =
    useReducedMotion();

  return (
    <motion.div
      className={`simulator-flow-step-v3 ${
        ai ? "ai" : ""
      }`}
      animate={
        active &&
        !reduceMotion
          ? {
              y: [
                0,
                -3,
                0,
              ],

              scale: [
                1,
                1.025,
                1,
              ],
            }
          : undefined
      }
      transition={{
        duration: 1.5,
        repeat:
          active
            ? Infinity
            : 0,

        delay,

        ease:
          "easeInOut",
      }}
    >
      <motion.div
        animate={
          active &&
          !reduceMotion
            ? {
                opacity: [
                  0.65,
                  1,
                  0.65,
                ],
              }
            : undefined
        }
        transition={{
          duration: 1.3,
          repeat:
            active
              ? Infinity
              : 0,

          delay,
        }}
      >
        <Icon size={15} />
      </motion.div>

      <span>
        {label}
      </span>

      <small>
        {layer}
      </small>
    </motion.div>
  );
}

/* =========================================================
   FLOW ARROW
   ========================================================= */

function FlowArrow({
  active,
  delay,
}: {
  active: boolean;
  delay: number;
}) {
  const reduceMotion =
    useReducedMotion();

  return (
    <motion.div
      animate={
        active &&
        !reduceMotion
          ? {
              x: [
                0,
                4,
                0,
              ],

              opacity: [
                0.45,
                1,
                0.45,
              ],
            }
          : undefined
      }
      transition={{
        duration: 1.3,
        repeat:
          active
            ? Infinity
            : 0,

        delay,

        ease:
          "easeInOut",
      }}
    >
      <ArrowRight
        size={14}
      />
    </motion.div>
  );
}

/* =========================================================
   RESULT METRIC
   ========================================================= */

function ResultMetric({
  label,
  value,
  helper,
  danger = false,
}: {
  label: string;
  value: ReactNode;
  helper: string;
  danger?: boolean;
}) {
  const reduceMotion =
    useReducedMotion();

  return (
    <motion.article
      className={`simulation-metric-card-v3 ${
        danger ? "danger" : ""
      }`}
      variants={{
        hidden: {
          opacity: 0,

          y: reduceMotion
            ? 0
            : 10,

          scale:
            reduceMotion
              ? 1
              : 0.99,
        },

        show: {
          opacity: 1,
          y: 0,
          scale: 1,

          transition: {
            duration:
              reduceMotion
                ? 0
                : 0.35,

            ease:
              motionEase,
          },
        },
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -3,
            }
      }
    >
      <span>
        {label}
      </span>

      <strong data-metric>
        {value}
      </strong>

      <small>
        {helper}
      </small>
    </motion.article>
  );
}

/* =========================================================
   IMPACT ITEM
   ========================================================= */

function ImpactItem({
  children,
}: {
  children: ReactNode;
}) {
  const reduceMotion =
    useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,

          x: reduceMotion
            ? 0
            : -6,
        },

        show: {
          opacity: 1,
          x: 0,

          transition: {
            duration:
              reduceMotion
                ? 0
                : 0.3,

            ease:
              motionEase,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}