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
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
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

const pageConfig: Record<string, PageConfig> = {
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

  const isIncidentDetail =
    location.pathname.startsWith(
      "/incidents/",
    );

  const page: PageConfig =
    isIncidentDetail
      ? {
          breadcrumb: "Incidents > Investigation",

          title: "Incident Investigation",

          description:
            "Review deterministic evidence, AI interpretation and controlled response.",

          statuses: [
            {
              label: "Incident analysis",
              type: "critical",
            },
            {
              label: "AI assisted",
              type: "ai",
            },
          ],
        }
      : pageConfig[location.pathname] ||
        pageConfig["/"];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck
              size={20}
              strokeWidth={2.4}
            />
          </div>

          <div>
            <div className="brand-name">
              PayGuard
            </div>

            <div className="brand-subtitle">
              AI Risk Manager
            </div>
          </div>
        </div>

        <div className="merchant-card">
          <div className="merchant-icon">
            <CircleDollarSign size={17} />
          </div>

          <div className="merchant-copy">
            <span>Demo environment</span>
            <strong>
              Payment Operations
            </strong>
          </div>

          <ChevronRight size={16} />
        </div>

        <nav className="sidebar-nav">
          {navigation.map((group) => (
            <div
              className="nav-group"
              key={group.label}
            >
              <div className="nav-group-label">
                {group.label}
              </div>

              {group.items.map(
                (item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={
                        item.path === "/"
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
                      <Icon size={18} />

                      <span>
                        {item.label}
                      </span>
                    </NavLink>
                  );
                },
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="system-status">
          <div className="status-heading">
            <Activity size={15} />
            System status
          </div>

          <div className="status-line">
            <span className="status-dot" />
            <span>
              Risk engine operational
            </span>
          </div>

          <div className="status-line">
            <span className="status-dot" />
            <span>
              Monitoring live
            </span>
          </div>
        </div>

        <button
          className="logout-button"
          type="button"
          onClick={logout}
        >
          <LogOut size={17} />
          Sign out
        </button>
      </aside>

      <main className="main-panel">
        <PageHeader
          title={page.title}
          breadcrumb={page.breadcrumb}
          description={page.description}
          statuses={page.statuses}
        />

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
