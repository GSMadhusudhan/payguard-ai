import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  CircleDollarSign,
  Clock3,
  Database,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import { LayerTag } from "../components/ui/LayerTag";

import {
  ApiError,
  apiRequest,
} from "../lib/api";

import type {
  CopilotEvidence,
  CopilotResponse,
} from "../types/api";

/* =========================================================
   TYPES
   ========================================================= */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  evidence?: CopilotEvidence[];
  incidentId?: string;
  incidentNumber?: string;
  generatedAt?: string;
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

const reveal = {
  hidden: {
    opacity: 0,
    y: 10,
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.38,
      ease: motionEase,
    },
  },
};

/* =========================================================
   SUGGESTIONS
   ========================================================= */

const suggestions = [
  {
    icon: AlertTriangle,
    title: "Investigate UPI failures",
    question:
      "Why are my UPI payments failing?",
    eyebrow: "Payment method",
  },

  {
    icon: CircleDollarSign,
    title: "Financial exposure",
    question:
      "How much revenue is at risk?",
    eyebrow: "Revenue",
  },

  {
    icon: Building2,
    title: "Bank analysis",
    question:
      "Which bank is causing the most failures?",
    eyebrow: "Provider",
  },

  {
    icon: ShieldCheck,
    title: "Response guidance",
    question:
      "What should we do about the current payment incident?",
    eyebrow: "Response",
  },
];

/* =========================================================
   PAGE
   ========================================================= */

export function CopilotPage() {
  const navigate = useNavigate();

  const reduceMotion =
    useReducedMotion();

  const [
    question,
    setQuestion,
  ] = useState("");

  const [
    conversationId,
    setConversationId,
  ] = useState<string | null>(
    null,
  );

  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  /* =====================================================
     AUTO SCROLL
     ===================================================== */

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior: reduceMotion
          ? "auto"
          : "smooth",
      },
    );
  }, [
    messages,
    loading,
    reduceMotion,
  ]);

  /* =====================================================
     ASK COPILOT
     ===================================================== */

  async function askCopilot(
    userQuestion: string,
  ) {
    const trimmed =
      userQuestion.trim();

    if (
      !trimmed ||
      loading
    ) {
      return;
    }

    const userMessage: ChatMessage =
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };

    setMessages(
      (current) => [
        ...current,
        userMessage,
      ],
    );

    setQuestion("");
    setLoading(true);
    setError(null);

    try {
      const response =
        await apiRequest<CopilotResponse>(
          "/copilot/query",
          {
            method: "POST",

            body:
              JSON.stringify({
                conversation_id:
                  conversationId,

                question:
                  trimmed,
              }),
          },
        );

      setConversationId(
        response.conversation_id,
      );

      setMessages(
        (current) => [
          ...current,
          {
            id:
              response.message_id,

            role:
              "assistant",

            content:
              response.answer,

            intent:
              response.intent,

            evidence:
              response.evidence,

            incidentId:
              response
                .referenced_incidents[0]
                ?.id,

            incidentNumber:
              response
                .referenced_incidents[0]
                ?.incident_number,

            generatedAt:
              response.generated_at,
          },
        ],
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
          : "Copilot could not answer the question.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     SUBMIT
     ===================================================== */

  function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    void askCopilot(
      question,
    );
  }

  /* =====================================================
     UI
     ===================================================== */

  return (
    <div className="copilot-layout copilot-v3">
      {/* =================================================
          MAIN
          ================================================= */}

      <motion.section
        className="copilot-main copilot-main-v3"
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
          duration: reduceMotion
            ? 0
            : 0.45,

          ease: motionEase,
        }}
      >
        {/* ===============================================
            HERO
            =============================================== */}

        <motion.section
          className="copilot-hero copilot-hero-v3"
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
            duration:
              reduceMotion
                ? 0
                : 0.48,

            ease:
              motionEase,
          }}
        >
          {/* AI ORB */}

          <motion.div
            className="copilot-brand-orb"
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [
                      0,
                      -3,
                      0,
                    ],

                    boxShadow: [
                      "0 0 0 rgba(198,241,53,0)",
                      "0 0 26px rgba(198,241,53,0.10)",
                      "0 0 0 rgba(198,241,53,0)",
                    ],
                  }
            }
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease:
                "easeInOut",
            }}
          >
            <Bot size={23} />
          </motion.div>

          {/* COPY */}

          <motion.div
            className="copilot-hero-copy-v3"
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
                      : 0.07,
                },
              },
            }}
          >
            <motion.div
              className="copilot-kicker"
              variants={reveal}
            >
              <motion.div
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        rotate: [
                          0,
                          8,
                          -5,
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
                <Sparkles
                  size={12}
                />
              </motion.div>

              GROUNDED PAYMENT
              INTELLIGENCE
            </motion.div>

            <motion.h2
              variants={reveal}
            >
              Investigate payment
              risk using actual
              PayGuard evidence.
            </motion.h2>

            <motion.p
              variants={reveal}
            >
              Copilot retrieves
              merchant-scoped
              operational evidence
              before producing an
              interpretation. It
              cannot author official
              payment facts or
              execute mitigation.
            </motion.p>
          </motion.div>

          {/* LAYER */}

          <motion.div
            className="copilot-hero-layer-v3"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    x: 10,
                  }
            }
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.18,
              duration: 0.4,
              ease: motionEase,
            }}
          >
            <LayerTag
              variant="ai"
              label="Evidence grounded"
            />

            <span>
              Read-only AI access
            </span>
          </motion.div>
        </motion.section>

        {/* ===============================================
            CHAT
            =============================================== */}

        <motion.div
          className="copilot-chat copilot-chat-v3"
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
            delay: 0.14,
            duration: 0.45,
            ease: motionEase,
          }}
        >
          <AnimatePresence mode="wait">
            {messages.length ===
            0 ? (
              /* =========================================
                 EMPTY / SUGGESTIONS
                 ========================================= */

              <motion.div
                key="empty"
                className="copilot-empty copilot-empty-v3"
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
                transition={{
                  duration: 0.35,
                  ease: motionEase,
                }}
              >
                <motion.div
                  className="copilot-empty-head"
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 7,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                >
                  <div>
                    <span className="panel-eyebrow">
                      SUGGESTED
                      INVESTIGATIONS
                    </span>

                    <h3>
                      Start with a
                      payment-risk
                      question
                    </h3>

                    <p>
                      Each answer is
                      grounded in the
                      currently
                      available
                      PayGuard
                      dataset.
                    </p>
                  </div>
                </motion.div>

                {/* SUGGESTIONS */}

                <motion.div
                  className="copilot-suggestions copilot-suggestions-v3"
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
                            : 0.07,
                      },
                    },
                  }}
                >
                  {suggestions.map(
                    (
                      suggestion,
                    ) => {
                      const Icon =
                        suggestion.icon;

                      return (
                        <motion.button
                          type="button"
                          key={
                            suggestion.question
                          }
                          disabled={
                            loading
                          }
                          onClick={() =>
                            void askCopilot(
                              suggestion.question,
                            )
                          }
                          variants={{
                            hidden: {
                              opacity: 0,

                              y:
                                reduceMotion
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

                              transition:
                                {
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
                          whileTap={
                            reduceMotion
                              ? undefined
                              : {
                                  scale:
                                    0.99,
                                }
                          }
                        >
                          <motion.div
                            className="suggestion-icon"
                            whileHover={
                              reduceMotion
                                ? undefined
                                : {
                                    scale:
                                      1.07,

                                    rotate:
                                      -4,
                                  }
                            }
                          >
                            <Icon
                              size={
                                16
                              }
                            />
                          </motion.div>

                          <div className="suggestion-copy-v3">
                            <small>
                              {
                                suggestion.eyebrow
                              }
                            </small>

                            <strong>
                              {
                                suggestion.title
                              }
                            </strong>

                            <span>
                              {
                                suggestion.question
                              }
                            </span>
                          </div>

                          <motion.div
                            whileHover={
                              reduceMotion
                                ? undefined
                                : {
                                    x: 4,
                                  }
                            }
                          >
                            <ArrowRight
                              size={
                                14
                              }
                            />
                          </motion.div>
                        </motion.button>
                      );
                    },
                  )}
                </motion.div>
              </motion.div>
            ) : (
              /* =========================================
                 CONVERSATION
                 ========================================= */

              <motion.div
                key="messages"
                className="copilot-messages copilot-messages-v3"
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                      }
                }
                animate={{
                  opacity: 1,
                }}
              >
                <AnimatePresence
                  initial={false}
                >
                  {messages.map(
                    (
                      message,
                    ) => (
                      <ChatMessageCard
                        key={
                          message.id
                        }
                        message={
                          message
                        }
                        onOpenIncident={() => {
                          if (
                            message.incidentId
                          ) {
                            navigate(
                              `/incidents/${message.incidentId}`,
                            );
                          }
                        }}
                      />
                    ),
                  )}
                </AnimatePresence>

                {/* AI THINKING */}

                <AnimatePresence>
                  {loading && (
                    <motion.div
                      className="copilot-assistant-message copilot-assistant-v3 loading"
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
                      transition={{
                        duration: 0.3,
                        ease: motionEase,
                      }}
                    >
                      <motion.div
                        className="assistant-avatar"
                        animate={
                          reduceMotion
                            ? undefined
                            : {
                                scale: [
                                  1,
                                  1.08,
                                  1,
                                ],

                                boxShadow:
                                  [
                                    "0 0 0 rgba(198,241,53,0)",
                                    "0 0 18px rgba(198,241,53,0.12)",
                                    "0 0 0 rgba(198,241,53,0)",
                                  ],
                              }
                        }
                        transition={{
                          duration: 1.8,
                          repeat:
                            Infinity,
                          ease:
                            "easeInOut",
                        }}
                      >
                        <Bot
                          size={15}
                        />
                      </motion.div>

                      <div className="assistant-body">
                        <div className="copilot-thinking">
                          <motion.span
                            animate={
                              reduceMotion
                                ? undefined
                                : {
                                    y: [
                                      0,
                                      -4,
                                      0,
                                    ],
                                    opacity:
                                      [
                                        0.45,
                                        1,
                                        0.45,
                                      ],
                                  }
                            }
                            transition={{
                              duration:
                                0.9,
                              repeat:
                                Infinity,
                            }}
                          />

                          <motion.span
                            animate={
                              reduceMotion
                                ? undefined
                                : {
                                    y: [
                                      0,
                                      -4,
                                      0,
                                    ],
                                    opacity:
                                      [
                                        0.45,
                                        1,
                                        0.45,
                                      ],
                                  }
                            }
                            transition={{
                              duration:
                                0.9,
                              repeat:
                                Infinity,
                              delay:
                                0.15,
                            }}
                          />

                          <motion.span
                            animate={
                              reduceMotion
                                ? undefined
                                : {
                                    y: [
                                      0,
                                      -4,
                                      0,
                                    ],
                                    opacity:
                                      [
                                        0.45,
                                        1,
                                        0.45,
                                      ],
                                  }
                            }
                            transition={{
                              duration:
                                0.9,
                              repeat:
                                Infinity,
                              delay:
                                0.3,
                            }}
                          />
                        </div>

                        <small>
                          Retrieving
                          merchant-scoped
                          PayGuard
                          evidence...
                        </small>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  ref={
                    bottomRef
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ===============================================
            ERROR
            =============================================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              className="copilot-error copilot-error-v3"
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
              <AlertTriangle
                size={14}
              />

              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===============================================
            COMPOSER
            =============================================== */}

        <motion.form
          className="copilot-composer copilot-composer-v3"
          onSubmit={submit}
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
            delay: 0.2,
            duration: 0.4,
            ease: motionEase,
          }}
        >
          <motion.div
            className="composer-icon"
            animate={
              question.trim() &&
              !reduceMotion
                ? {
                    scale: [
                      1,
                      1.05,
                      1,
                    ],
                  }
                : undefined
            }
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <MessageSquareText
              size={16}
            />
          </motion.div>

          <textarea
            rows={1}
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value,
              )
            }
            placeholder="Ask about incidents, failures, banks or revenue at risk..."
            onKeyDown={(
              event,
            ) => {
              if (
                event.key ===
                  "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();

                if (
                  question.trim()
                ) {
                  void askCopilot(
                    question,
                  );
                }
              }
            }}
          />

          <motion.button
            type="submit"
            className="pg-primary-action"
            disabled={
              !question.trim() ||
              loading
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
                    scale: 0.97,
                  }
            }
          >
            <Send size={15} />

            Ask Copilot
          </motion.button>
        </motion.form>

        {/* ===============================================
            SAFETY FOOTER
            =============================================== */}

        <motion.div
          className="copilot-footer-note copilot-footer-note-v3"
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
          transition={{
            delay: 0.24,
          }}
        >
          <ShieldCheck
            size={12}
          />

          AI can explain and
          recommend. Payment facts,
          risk scores, financial
          exposure and execution
          authority remain outside
          Copilot.
        </motion.div>
      </motion.section>

      {/* =================================================
          CONTEXT PANEL
          ================================================= */}

      <motion.aside
        className="copilot-context-panel copilot-context-v3"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                x: 16,
              }
        }
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          delay: 0.12,
          duration: reduceMotion
            ? 0
            : 0.45,
          ease: motionEase,
        }}
      >
        <motion.div
          className="context-panel-header"
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
        >
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    rotate: [
                      0,
                      3,
                      -3,
                      0,
                    ],
                  }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          >
            <Database
              size={16}
            />
          </motion.div>

          <div>
            <span className="panel-eyebrow">
              DATA BOUNDARY
            </span>

            <h3>
              Grounding context
            </h3>
          </div>
        </motion.div>

        <LayerTag
          variant="deterministic"
          label="Backend evidence"
        />

        {/* ===============================================
            MERCHANT SCOPE
            =============================================== */}

        <motion.div
          className="context-status-card context-status-v3"
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 7,
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
          <motion.span
            className="context-live-dot"
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: [
                      1,
                      1.35,
                      1,
                    ],

                    opacity: [
                      1,
                      0.6,
                      1,
                    ],
                  }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div>
            <strong>
              Merchant scoped
            </strong>

            <span>
              Current workspace only
            </span>
          </div>
        </motion.div>

        {/* ===============================================
            COPILOT CAN READ
            =============================================== */}

        <motion.div
          className="context-section"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},

            show: {
              transition: {
                delayChildren:
                  reduceMotion
                    ? 0
                    : 0.22,

                staggerChildren:
                  reduceMotion
                    ? 0
                    : 0.065,
              },
            },
          }}
        >
          <motion.span
            className="context-section-label"
            variants={reveal}
          >
            COPILOT CAN READ
          </motion.span>

          <ContextItem
            icon={WalletCards}
            title="Payment activity"
            description="Transaction and failure evidence"
          />

          <ContextItem
            icon={AlertTriangle}
            title="Active incidents"
            description="Correlated operational risk"
          />

          <ContextItem
            icon={Sparkles}
            title="AI investigations"
            description="Root cause and uncertainty"
          />

          <ContextItem
            icon={CircleDollarSign}
            title="Revenue exposure"
            description="Deterministic backend values"
          />
        </motion.div>

        {/* ===============================================
            SAFETY
            =============================================== */}

        <motion.div
          className="context-section"
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
            delay: 0.4,
          }}
        >
          <span className="context-section-label">
            SAFETY
          </span>

          <motion.div
            className="copilot-safety-card copilot-safety-v3"
            whileHover={
              reduceMotion
                ? undefined
                : {
                    y: -2,
                  }
            }
          >
            <ShieldCheck
              size={15}
            />

            <p>
              If relevant PayGuard
              evidence does not
              exist, Copilot returns
              an insufficient-data
              response rather than
              inventing an
              operational fact.
            </p>
          </motion.div>
        </motion.div>

        {/* ===============================================
            CONVERSATION
            =============================================== */}

        <AnimatePresence>
          {conversationId && (
            <motion.div
              className="conversation-info"
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
              exit={{
                opacity: 0,
              }}
            >
              <span>
                Conversation
              </span>

              <strong>
                {conversationId.slice(
                  0,
                  8,
                )}
              </strong>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </div>
  );
}

/* =========================================================
   MESSAGE CARD
   ========================================================= */

function ChatMessageCard({
  message,
  onOpenIncident,
}: {
  message: ChatMessage;
  onOpenIncident: () => void;
}) {
  const reduceMotion =
    useReducedMotion();

  /* =====================================================
     USER
     ===================================================== */

  if (
    message.role === "user"
  ) {
    return (
      <motion.div
        className="copilot-user-message copilot-user-v3"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 8,
                x: 8,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          x: 0,
        }}
        exit={{
          opacity: 0,
        }}
        transition={{
          duration: 0.32,
          ease: motionEase,
        }}
      >
        <motion.div
          className="user-message-bubble"
          initial={
            reduceMotion
              ? false
              : {
                  scale: 0.985,
                }
          }
          animate={{
            scale: 1,
          }}
        >
          {message.content}
        </motion.div>

        <motion.div
          className="user-avatar"
          initial={
            reduceMotion
              ? false
              : {
                  scale: 0.8,
                  opacity: 0,
                }
          }
          animate={{
            scale: 1,
            opacity: 1,
          }}
        >
          <UserRound
            size={14}
          />
        </motion.div>
      </motion.div>
    );
  }

  /* =====================================================
     ASSISTANT
     ===================================================== */

  return (
    <motion.div
      className="copilot-assistant-message copilot-assistant-v3"
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
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.4,
        ease: motionEase,
      }}
    >
      {/* AVATAR */}

      <motion.div
        className="assistant-avatar"
        initial={
          reduceMotion
            ? false
            : {
                scale: 0.82,
                opacity: 0,
              }
        }
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          delay: 0.04,
        }}
      >
        <Bot size={15} />
      </motion.div>

      {/* BODY */}

      <motion.div
        className="assistant-body assistant-body-v3"
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
                  : 0.08,
            },
          },
        }}
      >
        {/* META */}

        <motion.div
          className="assistant-message-meta assistant-meta-v3"
          variants={reveal}
        >
          <div>
            <span>
              PAYGUARD COPILOT
            </span>

            {message.intent && (
              <strong className="copilot-intent-v3">
                {message.intent.replaceAll(
                  "_",
                  " ",
                )}
              </strong>
            )}
          </div>

          <LayerTag
            variant="ai"
            label="AI interpretation"
          />
        </motion.div>

        {/* ===============================================
            EVIDENCE FIRST
            =============================================== */}

        {message.evidence &&
          message.evidence.length >
            0 && (
            <motion.section
              className="copilot-evidence-section-v3"
              variants={reveal}
            >
              <div className="copilot-response-heading-v3">
                <div>
                  <Database
                    size={13}
                  />

                  <span>
                    GROUNDING
                    EVIDENCE
                  </span>
                </div>

                <LayerTag
                  variant="deterministic"
                  compact
                  label="Backend evidence"
                />
              </div>

              <motion.div
                className="copilot-evidence-grid copilot-evidence-grid-v3"
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
                          : 0.065,
                    },
                  },
                }}
              >
                {message.evidence.map(
                  (
                    item,
                    index,
                  ) => (
                    <motion.div
                      className="copilot-evidence-card-v3"
                      key={`${item.label}-${item.value}`}
                      variants={{
                        hidden: {
                          opacity: 0,

                          y:
                            reduceMotion
                              ? 0
                              : 7,

                          scale:
                            reduceMotion
                              ? 1
                              : 0.99,
                        },

                        show: {
                          opacity: 1,
                          y: 0,
                          scale: 1,

                          transition:
                            {
                              duration:
                                reduceMotion
                                  ? 0
                                  : 0.32,

                              delay:
                                reduceMotion
                                  ? 0
                                  : index *
                                    0.015,

                              ease:
                                motionEase,
                            },
                        },
                      }}
                      whileHover={
                        reduceMotion
                          ? undefined
                          : {
                              y: -2,
                            }
                      }
                    >
                      <span>
                        {
                          item.label
                        }
                      </span>

                      <strong data-metric>
                        {
                          item.value
                        }
                      </strong>
                    </motion.div>
                  ),
                )}
              </motion.div>
            </motion.section>
          )}

        {/* ===============================================
            AI INTERPRETATION
            =============================================== */}

        <motion.section
          className="copilot-answer-section-v3"
          variants={reveal}
        >
          <div className="copilot-response-heading-v3">
            <div>
              <motion.div
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        rotate: [
                          0,
                          7,
                          -4,
                          0,
                        ],
                      }
                }
                transition={{
                  duration: 4,
                  repeat:
                    Infinity,
                }}
              >
                <Sparkles
                  size={13}
                />
              </motion.div>

              <span>
                AI INTERPRETATION
              </span>
            </div>
          </div>

          <motion.div
            className="assistant-answer assistant-answer-v3"
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
                : 0.2,

              duration: 0.42,
              ease: motionEase,
            }}
          >
            {message.content}
          </motion.div>
        </motion.section>

        {/* ===============================================
            INCIDENT REFERENCE
            =============================================== */}

        {message.incidentId && (
          <motion.button
            type="button"
            className="copilot-incident-reference copilot-reference-v3"
            onClick={
              onOpenIncident
            }
            variants={reveal}
            whileHover={
              reduceMotion
                ? undefined
                : {
                    x: 3,
                  }
            }
            whileTap={
              reduceMotion
                ? undefined
                : {
                    scale: 0.99,
                  }
            }
          >
            <motion.div
              className="copilot-reference-icon-v3"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: [
                        1,
                        1.07,
                        1,
                      ],
                    }
              }
              transition={{
                duration: 2.4,
                repeat:
                  Infinity,
                ease:
                  "easeInOut",
              }}
            >
              <AlertTriangle
                size={13}
              />
            </motion.div>

            <div>
              <span>
                REFERENCED
                INCIDENT
              </span>

              <strong>
                {message.incidentNumber ||
                  message.incidentId.slice(
                    0,
                    8,
                  )}
              </strong>
            </div>

            <motion.div
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      x: 4,
                    }
              }
            >
              <ArrowRight
                size={13}
              />
            </motion.div>
          </motion.button>
        )}

        {/* ===============================================
            TIMESTAMP
            =============================================== */}

        {message.generatedAt && (
          <motion.div
            className="assistant-timestamp"
            variants={reveal}
          >
            <Clock3
              size={11}
            />

            Generated from
            PayGuard evidence at{" "}

            {new Date(
              message.generatedAt,
            ).toLocaleTimeString(
              "en-IN",
              {
                hour:
                  "2-digit",

                minute:
                  "2-digit",
              },
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   CONTEXT ITEM
   ========================================================= */

function ContextItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof WalletCards;
  title: string;
  description: string;
}) {
  const reduceMotion =
    useReducedMotion();

  return (
    <motion.div
      className="copilot-context-item copilot-context-item-v3"
      variants={reveal}
      whileHover={
        reduceMotion
          ? undefined
          : {
              x: 3,
            }
      }
    >
      <motion.div
        whileHover={
          reduceMotion
            ? undefined
            : {
                scale: 1.06,
              }
        }
      >
        <Icon size={14} />
      </motion.div>

      <section>
        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>
      </section>
    </motion.div>
  );
}