import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CircleDollarSign,
  Clock3,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  ApiError,
  apiRequest,
} from "../lib/api";
import {
  formatMoneyFromPaise,
  timeAgo,
} from "../lib/format";
import type {
  TransactionDetail,
  TransactionDetailEnvelope,
  TransactionListEnvelope,
  TransactionListItem,
} from "../types/api";


const PAGE_SIZE = 25;


function statusClass(status: string) {
  return `transaction-status ${status.toLowerCase()}`;
}


function riskClass(level: string | null) {
  return `transaction-risk ${(level || "unknown").toLowerCase()}`;
}


function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


export function TransactionsPage() {
  const navigate = useNavigate();

  const [transactions, setTransactions] =
    useState<TransactionListItem[]>([]);

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] =
    useState(0);
  const [totalPages, setTotalPages] =
    useState(0);

  const [searchDraft, setSearchDraft] =
    useState("");
  const [search, setSearch] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("");
  const [riskLevel, setRiskLevel] =
    useState("");

  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const [selected, setSelected] =
    useState<TransactionDetail | null>(null);
  const [detailLoading, setDetailLoading] =
    useState(false);

  const loadTransactions = useCallback(
    async (manual = false) => {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(PAGE_SIZE),
          sort_by: "occurred_at",
          sort_order: "desc",
        });

        if (search) {
          params.set("search", search);
        }

        if (paymentMethod) {
          params.set(
            "payment_method",
            paymentMethod,
          );
        }

        if (statusFilter) {
          params.set(
            "status",
            statusFilter,
          );
        }

        if (riskLevel) {
          params.set(
            "risk_level",
            riskLevel,
          );
        }

        const response =
          await apiRequest<TransactionListEnvelope>(
            `/transactions?${params.toString()}`,
          );

        setTransactions(response.data);
        setTotalItems(
          response.pagination.total_items,
        );
        setTotalPages(
          response.pagination.total_pages,
        );
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
            : "Unable to load transactions.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      navigate,
      page,
      paymentMethod,
      riskLevel,
      search,
      statusFilter,
    ],
  );

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  function submitSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  }

  function updatePaymentMethod(
    value: string,
  ) {
    setPage(1);
    setPaymentMethod(value);
  }

  function updateStatus(value: string) {
    setPage(1);
    setStatusFilter(value);
  }

  function updateRisk(value: string) {
    setPage(1);
    setRiskLevel(value);
  }

  function clearFilters() {
    setPage(1);
    setSearchDraft("");
    setSearch("");
    setPaymentMethod("");
    setStatusFilter("");
    setRiskLevel("");
  }

  async function openTransaction(
    transactionId: string,
  ) {
    setSelected(null);
    setDetailLoading(true);

    try {
      const response =
        await apiRequest<TransactionDetailEnvelope>(
          `/transactions/${transactionId}`,
        );

      setSelected(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load transaction details.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  const filtersActive =
    Boolean(search) ||
    Boolean(paymentMethod) ||
    Boolean(statusFilter) ||
    Boolean(riskLevel);

  return (
    <div className="transactions-stack">
      <section className="transactions-summary">
        <div>
          <span className="panel-eyebrow">
            PAYMENT ACTIVITY
          </span>

          <h2>
            Transaction intelligence
          </h2>

          <p>
            Inspect payment outcomes and the
            deterministic transaction-level risk
            assigned by PayGuard.
          </p>
        </div>

        <div className="transactions-summary-stats">
          <div>
            <span>Total results</span>
            <strong>{totalItems}</strong>
          </div>

          <div>
            <span>Page</span>
            <strong>
              {page}
              <small>
                /{Math.max(totalPages, 1)}
              </small>
            </strong>
          </div>
        </div>
      </section>

      <section className="transactions-panel">
        <div className="transactions-toolbar">
          <form
            className="transaction-search"
            onSubmit={submitSearch}
          >
            <Search size={15} />

            <input
              value={searchDraft}
              onChange={(event) =>
                setSearchDraft(
                  event.target.value,
                )
              }
              placeholder="Search payment ID, customer or bank"
            />

            <button type="submit">
              Search
            </button>
          </form>

          <div className="transaction-filters">
            <div className="filter-label">
              <Filter size={13} />
              Filters
            </div>

            <select
              value={paymentMethod}
              onChange={(event) =>
                updatePaymentMethod(
                  event.target.value,
                )
              }
            >
              <option value="">
                All methods
              </option>
              <option value="UPI">UPI</option>
              <option value="CARD">
                Card
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                updateStatus(
                  event.target.value,
                )
              }
            >
              <option value="">
                All statuses
              </option>
              <option value="SUCCESS">
                Success
              </option>
              <option value="FAILED">
                Failed
              </option>
            </select>

            <select
              value={riskLevel}
              onChange={(event) =>
                updateRisk(
                  event.target.value,
                )
              }
            >
              <option value="">
                All risk levels
              </option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">
                Medium
              </option>
              <option value="HIGH">
                High
              </option>
              <option value="CRITICAL">
                Critical
              </option>
            </select>

            {filtersActive && (
              <button
                type="button"
                className="clear-filter-button"
                onClick={clearFilters}
              >
                <X size={13} />
                Clear
              </button>
            )}

            <button
              type="button"
              className="transaction-refresh"
              disabled={refreshing}
              onClick={() =>
                void loadTransactions(true)
              }
            >
              <RefreshCw
                size={14}
                className={
                  refreshing ? "spin" : ""
                }
              />
            </button>
          </div>
        </div>

        {error && (
          <div className="transaction-error">
            <ShieldAlert size={15} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="transaction-loading">
            <div className="loader-ring" />
            <span>
              Loading payment activity...
            </span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="transaction-empty">
            <WalletCards size={26} />

            <h3>
              No transactions found
            </h3>

            <p>
              Try changing the current filters.
            </p>

            {filtersActive && (
              <button
                type="button"
                className="secondary-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="transaction-table-wrap">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Payment</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Risk</th>
                    <th>Observed</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {transactions.map(
                    (transaction) => (
                      <tr
                        key={transaction.id}
                        onClick={() =>
                          void openTransaction(
                            transaction.id,
                          )
                        }
                      >
                        <td>
                          <div className="payment-cell">
                            <div className="payment-avatar">
                              <WalletCards
                                size={14}
                              />
                            </div>

                            <div>
                              <strong>
                                {
                                  transaction.external_payment_id
                                }
                              </strong>

                              <span>
                                {transaction.id.slice(
                                  0,
                                  8,
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="method-cell">
                            <strong>
                              {
                                transaction.payment_method
                              }
                            </strong>

                            <span>
                              {transaction.bank ||
                                "—"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <strong className="amount-cell">
                            {formatMoneyFromPaise(
                              transaction.amount,
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={statusClass(
                              transaction.status,
                            )}
                          >
                            <i />
                            {transaction.status}
                          </span>
                        </td>

                        <td>
                          <div className="risk-cell">
                            <span
                              className={riskClass(
                                transaction.risk_level,
                              )}
                            >
                              {transaction.risk_level ||
                                "UNKNOWN"}
                            </span>

                            <small>
                              Score{" "}
                              {transaction.risk_score ??
                                "—"}
                            </small>
                          </div>
                        </td>

                        <td>
                          <div className="time-cell">
                            <strong>
                              {timeAgo(
                                transaction.occurred_at,
                              )}
                            </strong>

                            <span>
                              {formatDateTime(
                                transaction.occurred_at,
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <ArrowRight
                            size={14}
                            className="row-arrow"
                          />
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="transaction-pagination">
              <span>
                Showing{" "}
                <strong>
                  {(page - 1) * PAGE_SIZE + 1}
                </strong>
                {"–"}
                <strong>
                  {Math.min(
                    page * PAGE_SIZE,
                    totalItems,
                  )}
                </strong>{" "}
                of{" "}
                <strong>{totalItems}</strong>
              </span>

              <div>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((value) =>
                      Math.max(1, value - 1),
                    )
                  }
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>

                <span>
                  Page {page} of{" "}
                  {Math.max(totalPages, 1)}
                </span>

                <button
                  type="button"
                  disabled={
                    totalPages === 0 ||
                    page >= totalPages
                  }
                  onClick={() =>
                    setPage((value) =>
                      value + 1,
                    )
                  }
                >
                  Next
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {(detailLoading || selected) && (
        <>
          <button
            type="button"
            className="transaction-drawer-overlay"
            aria-label="Close transaction details"
            onClick={() => {
              setSelected(null);
              setDetailLoading(false);
            }}
          />

          <aside className="transaction-drawer">
            <div className="drawer-header">
              <div>
                <span className="panel-eyebrow">
                  TRANSACTION DETAIL
                </span>

                <h3>
                  Payment inspection
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setDetailLoading(false);
                }}
              >
                <X size={17} />
              </button>
            </div>

            {detailLoading ? (
              <div className="drawer-loading">
                <div className="loader-ring" />
                Loading transaction...
              </div>
            ) : selected ? (
              <TransactionDrawerContent
                transaction={selected}
              />
            ) : null}
          </aside>
        </>
      )}
    </div>
  );
}


function TransactionDrawerContent({
  transaction,
}: {
  transaction: TransactionDetail;
}) {
  return (
    <div className="drawer-content">
      <div className="drawer-payment-header">
        <div className="drawer-payment-icon">
          <WalletCards size={19} />
        </div>

        <div>
          <span>
            Payment identifier
          </span>

          <strong>
            {transaction.external_payment_id}
          </strong>
        </div>
      </div>

      <div className="drawer-status-row">
        <span
          className={statusClass(
            transaction.status,
          )}
        >
          <i />
          {transaction.status}
        </span>

        <span
          className={riskClass(
            transaction.risk.level,
          )}
        >
          {transaction.risk.level ||
            "UNKNOWN"}
        </span>
      </div>

      <section className="drawer-section">
        <span className="drawer-section-label">
          PAYMENT
        </span>

        <div className="drawer-detail-grid">
          <DetailItem
            icon={CircleDollarSign}
            label="Amount"
            value={formatMoneyFromPaise(
              transaction.amount,
            )}
          />

          <DetailItem
            icon={WalletCards}
            label="Method"
            value={
              transaction.payment_method
            }
          />

          <DetailItem
            icon={Building2}
            label="Bank"
            value={
              transaction.bank || "—"
            }
          />

          <DetailItem
            icon={Clock3}
            label="Occurred"
            value={formatDateTime(
              transaction.occurred_at,
            )}
          />
        </div>
      </section>

      <section className="drawer-section">
        <span className="drawer-section-label">
          RISK EVALUATION
        </span>

        <div className="risk-evaluation-card">
          <div>
            <span>Risk score</span>
            <strong>
              {transaction.risk.score ?? "—"}
            </strong>
          </div>

          <div>
            <span>Risk level</span>
            <strong>
              {transaction.risk.level ||
                "UNKNOWN"}
            </strong>
          </div>

          <div>
            <span>Model</span>
            <strong>
              {transaction.risk.model_version ||
                "risk-v1"}
            </strong>
          </div>
        </div>
      </section>

      <section className="drawer-section">
        <span className="drawer-section-label">
          CONTEXT
        </span>

        <div className="drawer-context-list">
          <div>
            <UserRound size={14} />
            <span>
              Customer reference
            </span>
            <strong>
              {transaction.customer_reference ||
                "—"}
            </strong>
          </div>

          <div>
            <Building2 size={14} />
            <span>
              Provider
            </span>
            <strong>
              {
                transaction.payment_provider
              }
            </strong>
          </div>
        </div>
      </section>

      {transaction.status === "FAILED" && (
        <section className="drawer-section">
          <span className="drawer-section-label">
            FAILURE EVIDENCE
          </span>

          <div className="failure-evidence-card">
            <ShieldAlert size={17} />

            <div>
              <strong>
                {transaction.failure_code ||
                  "PAYMENT_FAILED"}
              </strong>

              <p>
                {transaction.failure_reason ||
                  "The payment failed during processing."}
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="drawer-integrity-note">
        <ShieldAlert size={14} />

        <span>
          Risk values shown here are produced by
          PayGuard's deterministic backend risk
          engine.
        </span>
      </div>
    </div>
  );
}


function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
}) {
  return (
    <div className="drawer-detail-item">
      <Icon size={14} />

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
