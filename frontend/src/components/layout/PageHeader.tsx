import {
  Activity,
  Bot,
  ChevronRight,
  Database,
  FlaskConical,
  Radar,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

type HeaderStatusType =
  | "live"
  | "ai"
  | "backend"
  | "critical"
  | "demo";

export interface PageHeaderStatus {
  label: string;
  type: HeaderStatusType;
}

interface PageHeaderProps {
  title: string;
  description: string;
  breadcrumb?: string;
  statuses?: PageHeaderStatus[];
}

function HeaderStatus({
  status,
}: {
  status: PageHeaderStatus;
}) {
  const config = {
    live: {
      icon: Activity,
      className: "page-status--live",
    },

    ai: {
      icon: Sparkles,
      className: "page-status--ai",
    },

    backend: {
      icon: Database,
      className: "page-status--backend",
    },

    critical: {
      icon: ShieldAlert,
      className: "page-status--critical",
    },

    demo: {
      icon: FlaskConical,
      className: "page-status--demo",
    },
  }[status.type];

  const Icon = config.icon;

  return (
    <div
      className={`page-status ${config.className}`}
    >
      {status.type === "live" && (
        <span className="page-status-pulse" />
      )}

      {status.type !== "live" && (
        <Icon size={13} strokeWidth={2} />
      )}

      <span>{status.label}</span>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  statuses = [],
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        <div className="page-header-breadcrumb">
          <Radar size={13} />

          <span>PayGuard</span>

          <ChevronRight size={12} />

          <span className="page-header-breadcrumb-current">
            {breadcrumb || title}
          </span>
        </div>

        <div className="page-header-title-row">
          <h1>{title}</h1>

          {title === "AI Risk Copilot" && (
            <Bot
              className="page-header-title-icon"
              size={18}
            />
          )}
        </div>

        <p>{description}</p>
      </div>

      {statuses.length > 0 && (
        <div className="page-header-statuses">
          {statuses.slice(0, 2).map(
            (status) => (
              <HeaderStatus
                key={`${status.type}-${status.label}`}
                status={status}
              />
            ),
          )}
        </div>
      )}
    </header>
  );
}
