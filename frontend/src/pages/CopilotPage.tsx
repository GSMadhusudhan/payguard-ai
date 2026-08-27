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
  },
  {
    icon: CircleDollarSign,
    title: "Financial exposure",
    question: "How much revenue is at risk?",
  },
  {
    icon: Building2,
    title: "Bank analysis",
    question: "Which bank is causing the most failures?",
  },
  {
    icon: ShieldCheck,
    title: "Response guidance",
    question: "What should we do about the current payment incident?",
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
    <div className="copilot-layout">
      <section className="copilot-main">
        <div className="copilot-hero">
          <div className="copilot-brand-orb">
            <Bot size={24} />
          </div>

          <div>
            <div className="copilot-kicker">
              <Sparkles size={13} />
              GROUNDED PAYMENT INTELLIGENCE
            </div>

            <h2>
              Ask PayGuard about your
              <br />
              payment risk.
            </h2>

            <p>
              Copilot retrieves merchant-scoped
              PayGuard evidence before answering.
              It does not guess operational facts
              from general model knowledge.
            </p>
          </div>

          <div className="copilot-security">
            <ShieldCheck size={15} />

            <div>
              <strong>
                Evidence grounded
              </strong>

              <span>
                Read-only AI access
              </span>
            </div>
          </div>
        </div>

        <div className="copilot-chat">
          {messages.length === 0 ? (
            <div className="copilot-empty">
              <div className="copilot-empty-head">
                <div>
                  <span className="panel-eyebrow">
                    START AN INVESTIGATION
                  </span>

                  <h3>
                    What do you want to know?
                  </h3>

                  <p>
                    Try one of these questions using
                    the current PayGuard dataset.
                  </p>
                </div>
              </div>

              <div className="copilot-suggestions">
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
                        onClick={() =>
                          void askCopilot(
                            suggestion.question,
                          )
                        }
                      >
                        <div className="suggestion-icon">
                          <Icon size={16} />
                        </div>

                        <div>
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
            <div className="copilot-messages">
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
                <div className="copilot-assistant-message loading">
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
                      Retrieving PayGuard
                      evidence...
                    </small>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="copilot-error">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <form
          className="copilot-composer"
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
            disabled={
              !question.trim() ||
              loading
            }
          >
            <Send size={15} />
            Ask Copilot
          </button>
        </form>

        <div className="copilot-footer-note">
          <ShieldCheck size={12} />

          Copilot can explain and recommend.
          It cannot modify payment facts,
          risk scores or execute mitigation.
        </div>
      </section>

      <aside className="copilot-context-panel">
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

        <div className="context-status-card">
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

          <div className="copilot-safety-card">
            <ShieldCheck size={15} />

            <p>
              If relevant PayGuard data does not
              exist, Copilot returns an
              insufficient-data response instead
              of inventing an explanation.
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
      <div className="copilot-user-message">
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
    <div className="copilot-assistant-message">
      <div className="assistant-avatar">
        <Bot size={15} />
      </div>

      <div className="assistant-body">
        <div className="assistant-message-meta">
          <span>
            PayGuard Copilot
          </span>

          {message.intent && (
            <strong>
              {message.intent.replaceAll(
                "_",
                " ",
              )}
            </strong>
          )}
        </div>

        <div className="assistant-answer">
          {message.content}
        </div>

        {message.evidence &&
          message.evidence.length > 0 && (
            <div className="copilot-evidence-grid">
              {message.evidence.map(
                (item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                  >
                    <span>
                      {item.label}
                    </span>

                    <strong>
                      {item.value}
                    </strong>
                  </div>
                ),
              )}
            </div>
          )}

        {message.incidentId && (
          <button
            type="button"
            className="copilot-incident-reference"
            onClick={onOpenIncident}
          >
            <AlertTriangle size={13} />

            <div>
              <span>
                Referenced incident
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
    <div className="copilot-context-item">
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
