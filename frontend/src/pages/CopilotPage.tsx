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

const suggestions = [
  {
    icon: AlertTriangle,
    title: "Investigate UPI failures",
    question: "Why are my UPI payments failing?",
    eyebrow: "Payment method",
  },
  {
    icon: CircleDollarSign,
    title: "Financial exposure",
    question: "How much revenue is at risk?",
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

export function CopilotPage() {
  const navigate = useNavigate();

  const [question, setQuestion] =
    useState("");

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const bottomRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function askCopilot(
    userQuestion: string,
  ) {
    const trimmed = userQuestion.trim();

    if (!trimmed || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setQuestion("");
    setLoading(true);
    setError(null);

    try {
      const response =
        await apiRequest<CopilotResponse>(
          "/copilot/query",
          {
            method: "POST",
            body: JSON.stringify({
              conversation_id:
                conversationId,
              question: trimmed,
            }),
          },
        );

      setConversationId(
        response.conversation_id,
      );

      setMessages((current) => [
        ...current,
        {
          id: response.message_id,
          role: "assistant",
          content: response.answer,
          intent: response.intent,
          evidence: response.evidence,
          incidentId:
            response.referenced_incidents[0]
              ?.id,
          incidentNumber:
            response.referenced_incidents[0]
              ?.incident_number,
          generatedAt:
            response.generated_at,
        },
      ]);
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
          : "Copilot could not answer the question.",
      );
    } finally {
      setLoading(false);
    }
  }

  function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    void askCopilot(question);
  }

  return (
    <div className="copilot-layout copilot-v3">
      <section className="copilot-main copilot-main-v3">
        <section className="copilot-hero copilot-hero-v3">
          <div className="copilot-brand-orb">
            <Bot size={23} />
          </div>

          <div className="copilot-hero-copy-v3">
            <div className="copilot-kicker">
              <Sparkles size={12} />
              GROUNDED PAYMENT INTELLIGENCE
            </div>

            <h2>
              Investigate payment risk
              using actual PayGuard evidence.
            </h2>

            <p>
              Copilot retrieves merchant-scoped
              operational evidence before producing
              an interpretation. It cannot author
              official payment facts or execute
              mitigation.
            </p>
          </div>

          <div className="copilot-hero-layer-v3">
            <LayerTag
              variant="ai"
              label="Evidence grounded"
            />

            <span>
              Read-only AI access
            </span>
          </div>
        </section>

        <div className="copilot-chat copilot-chat-v3">
          {messages.length === 0 ? (
            <div className="copilot-empty copilot-empty-v3">
              <div className="copilot-empty-head">
                <div>
                  <span className="panel-eyebrow">
                    SUGGESTED INVESTIGATIONS
                  </span>

                  <h3>
                    Start with a payment-risk
                    question
                  </h3>

                  <p>
                    Each answer is grounded in the
                    currently available PayGuard
                    dataset.
                  </p>
                </div>
              </div>

              <div className="copilot-suggestions copilot-suggestions-v3">
                {suggestions.map(
                  (suggestion) => {
                    const Icon =
                      suggestion.icon;

                    return (
                      <button
                        type="button"
                        key={
                          suggestion.question
                        }
                        disabled={loading}
                        onClick={() =>
                          void askCopilot(
                            suggestion.question,
                          )
                        }
                      >
                        <div className="suggestion-icon">
                          <Icon size={16} />
                        </div>

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

                        <ArrowRight
                          size={14}
                        />
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          ) : (
            <div className="copilot-messages copilot-messages-v3">
              {messages.map((message) => (
                <ChatMessageCard
                  key={message.id}
                  message={message}
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
              ))}

              {loading && (
                <div className="copilot-assistant-message copilot-assistant-v3 loading">
                  <div className="assistant-avatar">
                    <Bot size={15} />
                  </div>

                  <div className="assistant-body">
                    <div className="copilot-thinking">
                      <span />
                      <span />
                      <span />
                    </div>

                    <small>
                      Retrieving merchant-scoped
                      PayGuard evidence...
                    </small>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="copilot-error copilot-error-v3">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <form
          className="copilot-composer copilot-composer-v3"
          onSubmit={submit}
        >
          <div className="composer-icon">
            <MessageSquareText size={16} />
          </div>

          <textarea
            rows={1}
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value,
              )
            }
            placeholder="Ask about incidents, failures, banks or revenue at risk..."
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();

                if (question.trim()) {
                  void askCopilot(
                    question,
                  );
                }
              }
            }}
          />

          <button
            type="submit"
            className="pg-primary-action"
            disabled={
              !question.trim() ||
              loading
            }
          >
            <Send size={15} />
            Ask Copilot
          </button>
        </form>

        <div className="copilot-footer-note copilot-footer-note-v3">
          <ShieldCheck size={12} />

          AI can explain and recommend. Payment
          facts, risk scores, financial exposure
          and execution authority remain outside
          Copilot.
        </div>
      </section>

      <aside className="copilot-context-panel copilot-context-v3">
        <div className="context-panel-header">
          <Database size={16} />

          <div>
            <span className="panel-eyebrow">
              DATA BOUNDARY
            </span>

            <h3>
              Grounding context
            </h3>
          </div>
        </div>

        <LayerTag
          variant="deterministic"
          label="Backend evidence"
        />

        <div className="context-status-card context-status-v3">
          <span className="context-live-dot" />

          <div>
            <strong>
              Merchant scoped
            </strong>

            <span>
              Current workspace only
            </span>
          </div>
        </div>

        <div className="context-section">
          <span className="context-section-label">
            COPILOT CAN READ
          </span>

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
        </div>

        <div className="context-section">
          <span className="context-section-label">
            SAFETY
          </span>

          <div className="copilot-safety-card copilot-safety-v3">
            <ShieldCheck size={15} />

            <p>
              If relevant PayGuard evidence does
              not exist, Copilot returns an
              insufficient-data response rather
              than inventing an operational fact.
            </p>
          </div>
        </div>

        {conversationId && (
          <div className="conversation-info">
            <span>
              Conversation
            </span>

            <strong>
              {conversationId.slice(
                0,
                8,
              )}
            </strong>
          </div>
        )}
      </aside>
    </div>
  );
}

function ChatMessageCard({
  message,
  onOpenIncident,
}: {
  message: ChatMessage;
  onOpenIncident: () => void;
}) {
  if (message.role === "user") {
    return (
      <div className="copilot-user-message copilot-user-v3">
        <div className="user-message-bubble">
          {message.content}
        </div>

        <div className="user-avatar">
          <UserRound size={14} />
        </div>
      </div>
    );
  }

  return (
    <div className="copilot-assistant-message copilot-assistant-v3">
      <div className="assistant-avatar">
        <Bot size={15} />
      </div>

      <div className="assistant-body assistant-body-v3">
        <div className="assistant-message-meta assistant-meta-v3">
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
        </div>

        {message.evidence &&
          message.evidence.length > 0 && (
            <section className="copilot-evidence-section-v3">
              <div className="copilot-response-heading-v3">
                <div>
                  <Database size={13} />

                  <span>
                    GROUNDING EVIDENCE
                  </span>
                </div>

                <LayerTag
                  variant="deterministic"
                  compact
                  label="Backend evidence"
                />
              </div>

              <div className="copilot-evidence-grid copilot-evidence-grid-v3">
                {message.evidence.map(
                  (item) => (
                    <div
                      className="copilot-evidence-card-v3"
                      key={`${item.label}-${item.value}`}
                    >
                      <span>
                        {item.label}
                      </span>

                      <strong data-metric>
                        {item.value}
                      </strong>
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

        <section className="copilot-answer-section-v3">
          <div className="copilot-response-heading-v3">
            <div>
              <Sparkles size={13} />

              <span>
                AI INTERPRETATION
              </span>
            </div>
          </div>

          <div className="assistant-answer assistant-answer-v3">
            {message.content}
          </div>
        </section>

        {message.incidentId && (
          <button
            type="button"
            className="copilot-incident-reference copilot-reference-v3"
            onClick={onOpenIncident}
          >
            <div className="copilot-reference-icon-v3">
              <AlertTriangle size={13} />
            </div>

            <div>
              <span>
                REFERENCED INCIDENT
              </span>

              <strong>
                {message.incidentNumber ||
                  message.incidentId.slice(
                    0,
                    8,
                  )}
              </strong>
            </div>

            <ArrowRight size={13} />
          </button>
        )}

        {message.generatedAt && (
          <div className="assistant-timestamp">
            <Clock3 size={11} />

            Generated from PayGuard evidence at{" "}
            {new Date(
              message.generatedAt,
            ).toLocaleTimeString(
              "en-IN",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ContextItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof WalletCards;
  title: string;
  description: string;
}) {
  return (
    <div className="copilot-context-item copilot-context-item-v3">
      <div>
        <Icon size={14} />
      </div>

      <section>
        <strong>{title}</strong>
        <span>{description}</span>
      </section>
    </div>
  );
}
