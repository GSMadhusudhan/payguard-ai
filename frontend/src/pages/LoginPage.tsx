import {
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { authenticated, login } = useAuth();

  const [merchantSlug, setMerchantSlug] =
    useState("demo-merchant");
  const [email, setEmail] = useState(
    "admin@payguard.example.com",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authenticated) {
      navigate("/", { replace: true });
    }
  }, [authenticated, navigate]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(
        merchantSlug,
        email,
        password,
      );

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-visual-inner">
          <div className="login-brand">
            <div className="brand-mark large">
              <ShieldCheck size={27} />
            </div>

            <div>
              <div className="brand-name large">
                PayGuard
              </div>
              <div className="brand-subtitle">
                Autonomous AI Risk Manager
              </div>
            </div>
          </div>

          <div className="login-hero-copy">
            <div className="eyebrow">
              <Sparkles size={15} />
              Payment intelligence
            </div>

            <h1>
              See payment risk
              <br />
              before it becomes
              <br />
              revenue loss.
            </h1>

            <p>
              Detect anomalies, investigate root
              causes and coordinate controlled
              mitigation from one risk command center.
            </p>
          </div>

          <div className="login-signal-card">
            <div>
              <span>Live signal</span>
              <strong>
                UPI payment health monitoring
              </strong>
            </div>

            <div className="signal-wave">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </section>

      <section className="login-form-side">
        <form
          className="login-card"
          onSubmit={handleSubmit}
        >
          <div className="login-lock">
            <LockKeyhole size={20} />
          </div>

          <h2>Welcome back</h2>

          <p className="login-subtitle">
            Sign in to access your payment-risk
            command center.
          </p>

          <label>
            Merchant workspace
            <input
              value={merchantSlug}
              onChange={(event) =>
                setMerchantSlug(
                  event.target.value,
                )
              }
              placeholder="demo-merchant"
              autoComplete="organization"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            className="primary-button login-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Signing in..."
              : "Enter PayGuard"}
            <ArrowRight size={17} />
          </button>

          <div className="login-security-note">
            <ShieldCheck size={14} />
            Authentication is handled by the
            PayGuard backend.
          </div>
        </form>
      </section>
    </main>
  );
}
