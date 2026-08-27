import {
  AlertTriangle,
  ArrowRight,
  Building2,
  RefreshCw,
  ShieldAlert,
  WalletCards,
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
import {
  formatMoneyFromPaise,
  timeAgo,
} from "../lib/format";
import type {
  IncidentListEnvelope,
  IncidentListItem,
} from "../types/api";


export function IncidentsPage() {
  const navigate = useNavigate();

  const [incidents, setIncidents] =
    useState<IncidentListItem[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const loadIncidents = useCallback(
    async (manual = false) => {
      manual
        ? setRefreshing(true)
        : setLoading(true);

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
      <section className="incidents-hero">
        <div>
          <span className="panel-eyebrow">
            ACTIVE RESPONSE
          </span>

          <h2>
            Incident operations
          </h2>

          <p>
            Correlated payment anomalies that
            require investigation, explanation and
            controlled response.
          </p>
        </div>

        <div className="incident-hero-count">
          <AlertTriangle size={18} />

          <div>
            <span>Open incidents</span>
            <strong>{incidents.length}</strong>
          </div>
        </div>
      </section>

      <section className="incidents-list-panel">
        <div className="incidents-list-header">
          <div>
            <span className="panel-eyebrow">
              DETECTED INCIDENTS
            </span>
            <h3>Risk events</h3>
          </div>

          <button
            className="secondary-button"
            type="button"
            disabled={refreshing}
            onClick={() =>
              void loadIncidents(true)
            }
          >
            <RefreshCw
              size={14}
              className={
                refreshing ? "spin" : ""
              }
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="incident-page-error">
            <ShieldAlert size={15} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="incident-page-loading">
            <div className="loader-ring" />
            Loading incidents...
          </div>
        ) : incidents.length === 0 ? (
          <div className="incident-page-empty">
            <ShieldAlert size={25} />

            <h3>No active incidents</h3>

            <p>
              Run the bank degradation simulator to
              generate the demo incident.
            </p>
          </div>
        ) : (
          <div className="incident-list">
            {incidents.map((incident) => (
              <button
                type="button"
                key={incident.id}
                className="incident-list-card"
                onClick={() =>
                  navigate(
                    `/incidents/${incident.id}`,
                  )
                }
              >
                <div
                  className={`incident-list-icon ${incident.severity.toLowerCase()}`}
                >
                  <AlertTriangle size={19} />
                </div>

                <div className="incident-list-main">
                  <div className="incident-list-meta">
                    <span
                      className={`severity-badge ${incident.severity.toLowerCase()}`}
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

                  <h4>{incident.title}</h4>

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
                      {
                        incident.affected_transaction_count
                      }{" "}
                      affected
                    </span>
                  </div>
                </div>

                <div className="incident-list-metric">
                  <span>Failure impact</span>
                  <strong>
                    {
                      incident.failed_transaction_count
                    }
                    /
                    {
                      incident.affected_transaction_count
                    }
                  </strong>
                </div>

                <div className="incident-list-metric exposure">
                  <span>Revenue at risk</span>
                  <strong>
                    {formatMoneyFromPaise(
                      incident.revenue_at_risk,
                      true,
                    )}
                  </strong>
                </div>

                <div className="incident-list-status">
                  <span>
                    {incident.status.replaceAll(
                      "_",
                      " ",
                    )}
                  </span>
                  <ArrowRight size={15} />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
