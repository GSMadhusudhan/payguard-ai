import {
  Activity,
  Bot,
  ChevronRight,
  CircleDollarSign,
  Gauge,
  LogOut,
  Radar,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TestTube2,
  TriangleAlert,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

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

const pageTitles: Record<
  string,
  { title: string; description: string }
> = {
  "/": {
    title: "Risk Command Center",
    description:
      "Live payment health, incidents and financial exposure.",
  },
  "/transactions": {
    title: "Transactions",
    description:
      "Inspect payment activity and transaction-level risk.",
  },
  "/incidents": {
    title: "Incidents",
    description:
      "Investigate operational payment-risk events.",
  },
  "/copilot": {
    title: "AI Risk Copilot",
    description:
      "Ask grounded questions about your PayGuard data.",
  },
  "/simulator": {
    title: "Scenario Simulator",
    description:
      "Run controlled payment-risk demonstrations.",
  },
};

export function AppShell() {
  const { logout } = useAuth();
  const location = useLocation();

  const page =
    location.pathname.startsWith("/incidents/")
      ? {
          title: "Incident Investigation",
          description:
            "Evidence, AI analysis and controlled mitigation.",
        }
      : pageTitles[location.pathname] ||
        pageTitles["/"];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={20} strokeWidth={2.4} />
          </div>

          <div>
            <div className="brand-name">PayGuard</div>
            <div className="brand-subtitle">AI Risk Manager</div>
          </div>
        </div>

        <div className="merchant-card">
          <div className="merchant-icon">
            <CircleDollarSign size={17} />
          </div>

          <div className="merchant-copy">
            <span>Demo environment</span>
            <strong>Payment Operations</strong>
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

              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
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
            <span>Risk engine operational</span>
          </div>

          <div className="status-line">
            <span className="status-dot" />
            <span>Monitoring live</span>
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
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              <Radar size={14} />
              PayGuard
              <ChevronRight size={13} />
              <span>{page.title}</span>
            </div>

            <h1>{page.title}</h1>
            <p>{page.description}</p>
          </div>

          <div className="topbar-actions">
            <div className="live-pill">
              <span className="pulse-dot" />
              Live monitoring
            </div>

            <div className="ai-pill">
              <Sparkles size={15} />
              AI assisted
            </div>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
