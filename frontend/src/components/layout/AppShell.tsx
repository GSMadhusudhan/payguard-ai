import {
  Activity,
  Bot,
  ChevronRight,
  CircleDollarSign,
  Gauge,
  LogOut,
  ReceiptText,
  ShieldCheck,
  TestTube2,
  TriangleAlert,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  MotionProvider,
  SignalPulse,
} from "../motion";
import {
  PageHeader,
  type PageHeaderStatus,
} from "./PageHeader";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/",
        icon: Gauge,
      },
      {
        label: "Transactions",
        path: "/transactions",
        icon: ReceiptText,
      },
      {
        label: "Incidents",
        path: "/incidents",
        icon: TriangleAlert,
      },
    ],
  },

  {
    label: "Intelligence",
    items: [
      {
        label: "AI Copilot",
        path: "/copilot",
        icon: Bot,
      },
      {
        label: "Simulator",
        path: "/simulator",
        icon: TestTube2,
      },
    ],
  },
];

interface PageConfig {
  title: string;
  breadcrumb: string;
  description: string;
  statuses: PageHeaderStatus[];
}

const pageConfig: Record<
  string,
  PageConfig
> = {
  "/": {
    breadcrumb: "Risk Command Center",
    title: "Risk Command Center",
    description:
      "Live payment health, incidents and financial exposure.",
    statuses: [
      {
        label: "Live monitoring",
        type: "live",
      },
      {
        label: "Backend sourced",
        type: "backend",
      },
    ],
  },

  "/transactions": {
    breadcrumb: "Transactions",
    title: "Transactions",
    description:
      "Inspect merchant-scoped payment activity and deterministic risk evidence.",
    statuses: [
      {
        label: "Live monitoring",
        type: "live",
      },
      {
        label: "Backend sourced",
        type: "backend",
      },
    ],
  },

  "/incidents": {
    breadcrumb: "Incidents",
    title: "Incidents",
    description:
      "Correlated payment-risk incidents across all monitored channels.",
    statuses: [
      {
        label: "Live monitoring",
        type: "live",
      },
      {
        label: "AI assisted",
        type: "ai",
      },
    ],
  },

  "/copilot": {
    breadcrumb: "AI Copilot",
    title: "AI Risk Copilot",
    description:
      "Ask PayGuard about your payment risk using grounded merchant evidence.",
    statuses: [
      {
        label: "Evidence grounded",
        type: "ai",
      },
      {
        label: "Read-only AI access",
        type: "backend",
      },
    ],
  },

  "/simulator": {
    breadcrumb: "Simulator",
    title: "Risk Simulator",
    description:
      "Generate deterministic payment scenarios through the PayGuard pipeline.",
    statuses: [
      {
        label: "Demo environment",
        type: "demo",
      },
      {
        label: "Simulated only",
        type: "backend",
      },
    ],
  },
};

export function AppShell() {
  const { logout } = useAuth();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const isIncidentDetail =
    location.pathname.startsWith(
      "/incidents/",
    );

  const page: PageConfig =
    isIncidentDetail
      ? {
          breadcrumb:
            "Incidents > Investigation",

          title:
            "Incident Investigation",

          description:
            "Review deterministic evidence, AI interpretation and controlled response.",

          statuses: [
            {
              label:
                "Incident analysis",
              type: "critical",
            },
            {
              label:
                "AI assisted",
              type: "ai",
            },
          ],
        }
      : pageConfig[
          location.pathname
        ] || pageConfig["/"];

  return (
    <MotionProvider>
      <div className="app-shell">
        <motion.aside
          className="sidebar"
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  x: -12,
                }
          }
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration:
              reduceMotion
                ? 0
                : 0.38,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
        >
          <div className="brand">
            <motion.div
              className="brand-mark"
              initial={
                reduceMotion
                  ? false
                  : {
                      scale: 0.86,
                      rotate: -5,
                    }
              }
              animate={{
                scale: 1,
                rotate: 0,
              }}
              transition={{
                duration: 0.45,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
            >
              <ShieldCheck
                size={20}
                strokeWidth={2.4}
              />
            </motion.div>

            <div>
              <div className="brand-name">
                PayGuard
              </div>

              <div className="brand-subtitle">
                AI Risk Manager
              </div>
            </div>
          </div>

          <motion.div
            className="merchant-card"
            whileHover={
              reduceMotion
                ? undefined
                : {
                    x: 2,
                  }
            }
          >
            <div className="merchant-icon">
              <CircleDollarSign
                size={17}
              />
            </div>

            <div className="merchant-copy">
              <span>
                Demo environment
              </span>

              <strong>
                Payment Operations
              </strong>
            </div>

            <ChevronRight
              size={16}
            />
          </motion.div>

          <nav className="sidebar-nav">
            {navigation.map(
              (group) => (
                <div
                  className="nav-group"
                  key={group.label}
                >
                  <div className="nav-group-label">
                    {group.label}
                  </div>

                  {group.items.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      return (
                        <NavLink
                          key={
                            item.path
                          }
                          to={item.path}
                          end={
                            item.path ===
                            "/"
                          }
                          className={({
                            isActive,
                          }) =>
                            `nav-item ${
                              isActive
                                ? "active"
                                : ""
                            }`
                          }
                        >
                          {({
                            isActive,
                          }) => (
                            <>
                              {isActive && (
                                <motion.span
                                  className="nav-active-motion"
                                  layoutId="payguard-sidebar-active"
                                  transition={{
                                    type:
                                      "spring",
                                    stiffness:
                                      420,
                                    damping:
                                      34,
                                    mass:
                                      0.55,
                                  }}
                                />
                              )}

                              <Icon
                                size={
                                  18
                                }
                              />

                              <span className="nav-item-label">
                                {
                                  item.label
                                }
                              </span>
                            </>
                          )}
                        </NavLink>
                      );
                    },
                  )}
                </div>
              ),
            )}
          </nav>

          <div className="sidebar-spacer" />

          <div className="system-status">
            <div className="status-heading">
              <Activity size={15} />
              System status
            </div>

            <div className="status-line">
              <SignalPulse
                tone="healthy"
                label="Risk engine operational"
              />
            </div>

            <div className="status-line">
              <SignalPulse
                tone="ai"
                label="Monitoring live"
              />
            </div>
          </div>

          <motion.button
            className="logout-button"
            type="button"
            onClick={logout}
            whileHover={
              reduceMotion
                ? undefined
                : {
                    x: 2,
                  }
            }
            whileTap={
              reduceMotion
                ? undefined
                : {
                    scale: 0.98,
                  }
            }
          >
            <LogOut size={17} />
            Sign out
          </motion.button>
        </motion.aside>

        <main className="main-panel">
          <AnimatePresence
            mode="wait"
            initial={false}
          >
            <motion.div
              key={location.pathname}
              className="main-route-motion"
              initial={
                reduceMotion
                  ? {
                      opacity: 1,
                    }
                  : {
                      opacity: 0,
                      y: 9,
                      filter:
                        "blur(3px)",
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
                filter:
                  "blur(0px)",
              }}
              exit={
                reduceMotion
                  ? {
                      opacity: 1,
                    }
                  : {
                      opacity: 0,
                      y: -4,
                      filter:
                        "blur(2px)",
                    }
              }
              transition={{
                duration:
                  reduceMotion
                    ? 0
                    : 0.26,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
            >
              <PageHeader
                title={page.title}
                breadcrumb={
                  page.breadcrumb
                }
                description={
                  page.description
                }
                statuses={
                  page.statuses
                }
              />

              <section className="page-content">
                <Outlet />
              </section>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </MotionProvider>
  );
}
