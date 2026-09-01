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
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
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
  TransactionDetail,
  TransactionDetailEnvelope,
  TransactionListEnvelope,
  TransactionListItem,
} from "../types/api";

const PAGE_SIZE = 25;

const motionEase = [
  0.22,
  1,
  0.36,
  1,
] as const;

function statusClass(status: string) {
  return `transaction-status ${status.toLowerCase()}`;
}

function riskClass(level: string | null) {
  return `transaction-risk ${(level || "unknown").toLowerCase()}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export function TransactionsPage() {
  const navigate = useNavigate();

  const reduceMotion =
    useReducedMotion();

  const [
    transactions,
    setTransactions,
  ] = useState<
    TransactionListItem[]
  >([]);

  const [page, setPage] =
    useState(1);

  const [
    totalItems,
    setTotalItems,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

  const [
    searchDraft,
    setSearchDraft,
  ] = useState("");

  const [search, setSearch] =
    useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    riskLevel,
    setRiskLevel,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [
    selected,
    setSelected,
  ] =
    useState<TransactionDetail | null>(
      null,
    );

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  /* =====================================================
     LOAD TRANSACTIONS
     ===================================================== */

  const loadTransactions =
    useCallback(
      async (
        manual = false,
      ) => {
        if (manual) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        try {
          const params =
            new URLSearchParams({
              page: String(page),
              page_size:
                String(PAGE_SIZE),
              sort_by:
                "occurred_at",
              sort_order: "desc",
            });

          if (search) {
            params.set(
              "search",
              search,
            );
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

          setTransactions(
            response.data,
          );

          setTotalItems(
            response.pagination
              .total_items,
          );

          setTotalPages(
            response.pagination
              .total_pages,
          );
        } catch (err) {
          if (
            err instanceof
              ApiError &&
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

  /* =====================================================
     FILTERS
     ===================================================== */

  function submitSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPage(1);

    setSearch(
      searchDraft.trim(),
    );
  }

  function updatePaymentMethod(
    value: string,
  ) {
    setPage(1);
    setPaymentMethod(value);
  }

  function updateStatus(
    value: string,
  ) {
    setPage(1);
    setStatusFilter(value);
  }

  function updateRisk(
    value: string,
  ) {
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

  /* =====================================================
     TRANSACTION DETAIL
     ===================================================== */

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

      setSelected(
        response.data,
      );
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

  function closeDrawer() {
    setSelected(null);
    setDetailLoading(false);
  }

  const filtersActive =
    Boolean(search) ||
    Boolean(paymentMethod) ||
    Boolean(statusFilter) ||
    Boolean(riskLevel);

  /* =====================================================
     MOTION
     ===================================================== */

  const panelVariants = {
    hidden: {
      opacity: 0,

      y: reduceMotion
        ? 0
        : 14,
    },

    show: {
      opacity: 1,
      y: 0,

      transition: {
        duration: reduceMotion
          ? 0
          : 0.45,

        ease: motionEase,
      },
    },
  };

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <div className="transactions-stack">
      {/* =================================================
          SUMMARY
          ================================================= */}

      <motion.section
        className="transactions-summary"
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
            }}
          >
            PAYMENT ACTIVITY
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
              delay: 0.1,
              duration: 0.4,
              ease: motionEase,
            }}
          >
            Transaction
            intelligence
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
              delay: 0.15,
            }}
          >
            Inspect payment outcomes
            and the deterministic
            transaction-level risk
            assigned by PayGuard.
          </motion.p>
        </div>

        <motion.div
          className="transactions-summary-stats"
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
            delay: 0.16,
            duration: 0.4,
            ease: motionEase,
          }}
        >
          <div>
            <span>
              Total results
            </span>

            <AnimatedMetric
              value={totalItems}
              duration={0.8}
            />
          </div>

          <div>
            <span>
              Page
            </span>

            <strong>
              {page}

              <small>
                /
                {Math.max(
                  totalPages,
                  1,
                )}
              </small>
            </strong>
          </div>
        </motion.div>
      </motion.section>

      {/* =================================================
          TRANSACTIONS PANEL
          ================================================= */}

      <motion.section
        className="transactions-panel"
        variants={panelVariants}
        initial="hidden"
        animate="show"
      >
        {/* ===============================================
            TOOLBAR
            =============================================== */}

        <motion.div
          className="transactions-toolbar"
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
            delay: 0.18,
            duration: 0.4,
            ease: motionEase,
          }}
        >
          {/* IMPORTANT:
              whileFocusWithin removed because
              Motion does not support that prop. */}

          <motion.form
            className="transaction-search"
            onSubmit={
              submitSearch
            }
          >
            <Search
              size={15}
            />

            <input
              value={
                searchDraft
              }
              onChange={(
                event,
              ) =>
                setSearchDraft(
                  event.target
                    .value,
                )
              }
              placeholder="Search payment ID, customer or bank"
            />

            <motion.button
              type="submit"
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
              Search
            </motion.button>
          </motion.form>

          <div className="transaction-filters">
            <div className="filter-label">
              <Filter
                size={13}
              />

              Filters
            </div>

            <select
              value={
                paymentMethod
              }
              onChange={(
                event,
              ) =>
                updatePaymentMethod(
                  event.target
                    .value,
                )
              }
            >
              <option value="">
                All methods
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="CARD">
                Card
              </option>
            </select>

            <select
              value={
                statusFilter
              }
              onChange={(
                event,
              ) =>
                updateStatus(
                  event.target
                    .value,
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
              value={
                riskLevel
              }
              onChange={(
                event,
              ) =>
                updateRisk(
                  event.target
                    .value,
                )
              }
            >
              <option value="">
                All risk levels
              </option>

              <option value="LOW">
                Low
              </option>

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

            <AnimatePresence>
              {filtersActive && (
                <motion.button
                  type="button"
                  className="clear-filter-button"
                  onClick={
                    clearFilters
                  }
                  initial={{
                    opacity: 0,
                    scale:
                      reduceMotion
                        ? 1
                        : 0.94,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale:
                      reduceMotion
                        ? 1
                        : 0.94,
                  }}
                >
                  <X
                    size={13}
                  />

                  Clear
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              className="transaction-refresh"
              disabled={
                refreshing
              }
              onClick={() =>
                void loadTransactions(
                  true,
                )
              }
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      rotate:
                        -8,
                      scale:
                        1.04,
                    }
              }
              whileTap={
                reduceMotion
                  ? undefined
                  : {
                      scale:
                        0.92,
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
            </motion.button>
          </div>
        </motion.div>

        {/* ===============================================
            ERROR
            =============================================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              className="transaction-error"
              initial={{
                opacity: 0,
                y: -6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -4,
              }}
            >
              <ShieldAlert
                size={15}
              />

              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===============================================
            CONTENT
            =============================================== */}

        {loading ? (
          <motion.div
            className="transaction-loading"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
          >
            <div className="loader-ring" />

            <span>
              Loading payment
              activity...
            </span>
          </motion.div>
        ) : transactions.length ===
          0 ? (
          <motion.div
            className="transaction-empty"
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
              duration: 0.4,
              ease: motionEase,
            }}
          >
            <WalletCards
              size={26}
            />

            <h3>
              No transactions
              found
            </h3>

            <p>
              Try changing the
              current filters.
            </p>

            {filtersActive && (
              <motion.button
                type="button"
                className="secondary-button"
                onClick={
                  clearFilters
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
                Clear filters
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            {/* ===========================================
                TABLE
                =========================================== */}

            <div className="transaction-table-wrap">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>
                      Payment
                    </th>

                    <th>
                      Method
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Risk
                    </th>

                    <th>
                      Observed
                    </th>

                    <th />
                  </tr>
                </thead>

                <motion.tbody
                  key={`${page}-${search}-${paymentMethod}-${statusFilter}-${riskLevel}`}
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},

                    show: {
                      transition: {
                        delayChildren:
                          reduceMotion
                            ? 0
                            : 0.04,

                        staggerChildren:
                          reduceMotion
                            ? 0
                            : 0.035,
                      },
                    },
                  }}
                >
                  {transactions.map(
                    (
                      transaction,
                      index,
                    ) => {
                      const level =
                        transaction.risk_level?.toLowerCase();

                      const elevatedRisk =
                        level ===
                          "high" ||
                        level ===
                          "critical";

                      return (
                        <motion.tr
                          key={
                            transaction.id
                          }
                          onClick={() =>
                            void openTransaction(
                              transaction.id,
                            )
                          }
                          variants={{
                            hidden: {
                              opacity: 0,

                              y:
                                reduceMotion
                                  ? 0
                                  : 8,
                            },

                            show: {
                              opacity: 1,
                              y: 0,

                              transition:
                                {
                                  duration:
                                    reduceMotion
                                      ? 0
                                      : 0.32,

                                  ease:
                                    motionEase,
                                },
                            },
                          }}
                          whileHover={
                            reduceMotion
                              ? undefined
                              : {
                                  scale:
                                    1.002,

                                  x: 2,
                                }
                          }
                          transition={{
                            duration:
                              0.16,
                          }}
                        >
                          {/* PAYMENT */}

                          <td>
                            <div className="payment-cell">
                              <motion.div
                                className="payment-avatar"
                                whileHover={
                                  reduceMotion
                                    ? undefined
                                    : {
                                        rotate:
                                          -5,

                                        scale:
                                          1.06,
                                      }
                                }
                              >
                                <WalletCards
                                  size={
                                    14
                                  }
                                />
                              </motion.div>

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

                          {/* METHOD */}

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

                          {/* AMOUNT */}

                          <td>
                            <strong className="amount-cell">
                              <AnimatedMetric
                                value={
                                  transaction.amount
                                }
                                formatter={(
                                  value,
                                ) =>
                                  formatMoneyFromPaise(
                                    Math.round(
                                      value,
                                    ),
                                  )
                                }
                                duration={
                                  0.5 +
                                  Math.min(
                                    index *
                                      0.01,
                                    0.2,
                                  )
                                }
                              />
                            </strong>
                          </td>

                          {/* STATUS */}

                          <td>
                            <motion.span
                              className={statusClass(
                                transaction.status,
                              )}
                              initial={
                                reduceMotion
                                  ? false
                                  : {
                                      opacity: 0,
                                      scale:
                                        0.94,
                                    }
                              }
                              animate={{
                                opacity: 1,
                                scale: 1,
                              }}
                            >
                              <i />

                              {
                                transaction.status
                              }
                            </motion.span>
                          </td>

                          {/* RISK */}

                          <td>
                            <div className="risk-cell">
                              <motion.span
                                className={riskClass(
                                  transaction.risk_level,
                                )}
                                animate={
                                  elevatedRisk &&
                                  !reduceMotion
                                    ? {
                                        opacity:
                                          [
                                            1,
                                            0.78,
                                            1,
                                          ],

                                        scale:
                                          [
                                            1,
                                            1.025,
                                            1,
                                          ],
                                      }
                                    : undefined
                                }
                                transition={
                                  elevatedRisk &&
                                  !reduceMotion
                                    ? {
                                        duration:
                                          level ===
                                          "critical"
                                            ? 1.9
                                            : 2.8,

                                        repeat:
                                          Infinity,

                                        ease:
                                          "easeInOut",
                                      }
                                    : undefined
                                }
                              >
                                {transaction.risk_level ||
                                  "UNKNOWN"}
                              </motion.span>

                              <small>
                                Score{" "}
                                {transaction.risk_score ??
                                  "—"}
                              </small>
                            </div>
                          </td>

                          {/* TIME */}

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
                            <motion.div
                              whileHover={
                                reduceMotion
                                  ? undefined
                                  : {
                                      x: 3,
                                    }
                              }
                            >
                              <ArrowRight
                                size={
                                  14
                                }
                                className="row-arrow"
                              />
                            </motion.div>
                          </td>
                        </motion.tr>
                      );
                    },
                  )}
                </motion.tbody>
              </table>
            </div>

            {/* ===========================================
                PAGINATION
                =========================================== */}

            <motion.div
              className="transaction-pagination"
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
                delay: 0.18,
              }}
            >
              <span>
                Showing{" "}

                <strong>
                  {(page - 1) *
                    PAGE_SIZE +
                    1}
                </strong>

                {"–"}

                <strong>
                  {Math.min(
                    page *
                      PAGE_SIZE,
                    totalItems,
                  )}
                </strong>{" "}

                of{" "}

                <strong>
                  {totalItems}
                </strong>
              </span>

              <div>
                <motion.button
                  type="button"
                  disabled={
                    page <= 1
                  }
                  onClick={() =>
                    setPage(
                      (value) =>
                        Math.max(
                          1,
                          value -
                            1,
                        ),
                    )
                  }
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          x: -2,
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
                  <ArrowLeft
                    size={14}
                  />

                  Previous
                </motion.button>

                <span>
                  Page {page} of{" "}
                  {Math.max(
                    totalPages,
                    1,
                  )}
                </span>

                <motion.button
                  type="button"
                  disabled={
                    totalPages ===
                      0 ||
                    page >=
                      totalPages
                  }
                  onClick={() =>
                    setPage(
                      (value) =>
                        value + 1,
                    )
                  }
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
                          scale:
                            0.97,
                        }
                  }
                >
                  Next

                  <ArrowRight
                    size={14}
                  />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </motion.section>

      {/* =================================================
          DETAIL DRAWER
          ================================================= */}

      <AnimatePresence>
        {(detailLoading ||
          selected) && (
          <>
            <motion.button
              type="button"
              className="transaction-drawer-overlay"
              aria-label="Close transaction details"
              onClick={
                closeDrawer
              }
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: reduceMotion
                  ? 0
                  : 0.2,
              }}
            />

            <motion.aside
              className="transaction-drawer"
              initial={
                reduceMotion
                  ? false
                  : {
                      x:
                        "100%",
                      opacity: 0.6,
                    }
              }
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={
                reduceMotion
                  ? undefined
                  : {
                      x:
                        "100%",
                      opacity: 0.6,
                    }
              }
              transition={{
                duration: reduceMotion
                  ? 0
                  : 0.38,

                ease:
                  motionEase,
              }}
            >
              <div className="drawer-header">
                <div>
                  <span className="panel-eyebrow">
                    TRANSACTION
                    DETAIL
                  </span>

                  <h3>
                    Payment
                    inspection
                  </h3>
                </div>

                <motion.button
                  type="button"
                  onClick={
                    closeDrawer
                  }
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          rotate:
                            8,
                          scale:
                            1.05,
                        }
                  }
                  whileTap={
                    reduceMotion
                      ? undefined
                      : {
                          scale:
                            0.94,
                        }
                  }
                >
                  <X
                    size={17}
                  />
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {detailLoading ? (
                  <motion.div
                    key="loading"
                    className="drawer-loading"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                  >
                    <div className="loader-ring" />

                    Loading
                    transaction...
                  </motion.div>
                ) : selected ? (
                  <motion.div
                    key={
                      selected.id
                    }
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
                      duration:
                        0.3,
                    }}
                  >
                    <TransactionDrawerContent
                      transaction={
                        selected
                      }
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =======================================================
   DRAWER CONTENT
   ======================================================= */

function TransactionDrawerContent({
  transaction,
}: {
  transaction: TransactionDetail;
}) {
  const reduceMotion =
    useReducedMotion();

  const drawerRiskLevel =
    transaction.risk.level?.toLowerCase();

  const elevatedRisk =
    drawerRiskLevel === "high" ||
    drawerRiskLevel === "critical";

  return (
    <motion.div
      className="drawer-content"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},

        show: {
          transition: {
            staggerChildren:
              reduceMotion
                ? 0
                : 0.055,
          },
        },
      }}
    >
      <motion.div
        className="drawer-payment-header"
        variants={
          drawerItemVariants
        }
      >
        <div className="drawer-payment-icon">
          <WalletCards
            size={19}
          />
        </div>

        <div>
          <span>
            Payment identifier
          </span>

          <strong>
            {
              transaction.external_payment_id
            }
          </strong>
        </div>
      </motion.div>

      <motion.div
        className="drawer-status-row"
        variants={
          drawerItemVariants
        }
      >
        <span
          className={statusClass(
            transaction.status,
          )}
        >
          <i />

          {transaction.status}
        </span>

        <motion.span
          className={riskClass(
            transaction.risk.level,
          )}
          animate={
            elevatedRisk &&
            !reduceMotion
              ? {
                  scale: [
                    1,
                    1.025,
                    1,
                  ],

                  opacity: [
                    1,
                    0.8,
                    1,
                  ],
                }
              : undefined
          }
          transition={
            elevatedRisk &&
            !reduceMotion
              ? {
                  duration:
                    drawerRiskLevel ===
                    "critical"
                      ? 1.8
                      : 2.8,

                  repeat:
                    Infinity,

                  ease:
                    "easeInOut",
                }
              : undefined
          }
        >
          {transaction.risk.level ||
            "UNKNOWN"}
        </motion.span>
      </motion.div>

      {/* ===============================================
          PAYMENT
          =============================================== */}

      <motion.section
        className="drawer-section"
        variants={
          drawerItemVariants
        }
      >
        <span className="drawer-section-label">
          PAYMENT
        </span>

        <div className="drawer-detail-grid">
          <DetailItem
            icon={
              CircleDollarSign
            }
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
              transaction.bank ||
              "—"
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
      </motion.section>

      {/* ===============================================
          RISK
          =============================================== */}

      <motion.section
        className="drawer-section"
        variants={
          drawerItemVariants
        }
      >
        <span className="drawer-section-label">
          RISK EVALUATION
        </span>

        <div className="risk-evaluation-card">
          <div>
            <span>
              Risk score
            </span>

            <strong>
              {transaction.risk.score ??
                "—"}
            </strong>
          </div>

          <div>
            <span>
              Risk level
            </span>

            <strong>
              {transaction.risk.level ||
                "UNKNOWN"}
            </strong>
          </div>

          <div>
            <span>
              Model
            </span>

            <strong>
              {transaction.risk.model_version ||
                "risk-v1"}
            </strong>
          </div>
        </div>
      </motion.section>

      {/* ===============================================
          CONTEXT
          =============================================== */}

      <motion.section
        className="drawer-section"
        variants={
          drawerItemVariants
        }
      >
        <span className="drawer-section-label">
          CONTEXT
        </span>

        <div className="drawer-context-list">
          <div>
            <UserRound
              size={14}
            />

            <span>
              Customer reference
            </span>

            <strong>
              {transaction.customer_reference ||
                "—"}
            </strong>
          </div>

          <div>
            <Building2
              size={14}
            />

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
      </motion.section>

      {/* ===============================================
          FAILURE EVIDENCE
          =============================================== */}

      {transaction.status ===
        "FAILED" && (
        <motion.section
          className="drawer-section"
          variants={
            drawerItemVariants
          }
        >
          <span className="drawer-section-label">
            FAILURE EVIDENCE
          </span>

          <motion.div
            className="failure-evidence-card"
            animate={
              reduceMotion
                ? undefined
                : {
                    boxShadow: [
                      "0 0 0 rgba(240,85,74,0)",
                      "0 0 24px rgba(240,85,74,0.07)",
                      "0 0 0 rgba(240,85,74,0)",
                    ],
                  }
            }
            transition={{
              duration: 2.8,
              repeat:
                Infinity,
              ease:
                "easeInOut",
            }}
          >
            <ShieldAlert
              size={17}
            />

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
          </motion.div>
        </motion.section>
      )}

      {/* ===============================================
          INTEGRITY NOTE
          =============================================== */}

      <motion.div
        className="drawer-integrity-note"
        variants={
          drawerItemVariants
        }
      >
        <ShieldAlert
          size={14}
        />

        <span>
          Risk values shown here
          are produced by
          PayGuard&apos;s
          deterministic backend
          risk engine.
        </span>
      </motion.div>
    </motion.div>
  );
}

const drawerItemVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.32,
      ease: motionEase,
    },
  },
};

/* =======================================================
   DETAIL ITEM
   ======================================================= */

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
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>
    </div>
  );
}