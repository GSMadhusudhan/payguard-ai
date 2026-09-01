import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ease = [0.22, 1, 0.36, 1] as const;

export function SignupPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const {
    authenticated,
    register,
  } = useAuth();

  const [fullName, setFullName] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [merchantSlug, setMerchantSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  /* -----------------------------------------
     CINEMATIC VIDEO PARALLAX
     ----------------------------------------- */

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, {
    stiffness: 90,
    damping: 22,
    mass: 0.6,
  });

  const springY = useSpring(mouseY, {
    stiffness: 90,
    damping: 22,
    mass: 0.6,
  });

  const videoX = useTransform(
    springX,
    [-1, 1],
    [-7, 7],
  );

  const videoY = useTransform(
    springY,
    [-1, 1],
    [-5, 5],
  );

  function handleHeroMove(
    event: MouseEvent<HTMLElement>,
  ) {
    if (reduceMotion) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) /
      rect.width;

    const y =
      (event.clientY - rect.top) /
      rect.height;

    mouseX.set(x * 2 - 1);
    mouseY.set(y * 2 - 1);
  }

  function resetHero() {
    mouseX.set(0);
    mouseY.set(0);
  }

  /* -----------------------------------------
     FORM CARD 3D TILT
     ----------------------------------------- */

  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);

  const cardSpringX = useSpring(cardX, {
    stiffness: 180,
    damping: 26,
    mass: 0.5,
  });

  const cardSpringY = useSpring(cardY, {
    stiffness: 180,
    damping: 26,
    mass: 0.5,
  });

  const rotateX = useTransform(
    cardSpringY,
    [-1, 1],
    [1.6, -1.6],
  );

  const rotateY = useTransform(
    cardSpringX,
    [-1, 1],
    [-1.8, 1.8],
  );

  function handleCardMove(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (reduceMotion) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) /
      rect.width;

    const y =
      (event.clientY - rect.top) /
      rect.height;

    cardX.set(x * 2 - 1);
    cardY.set(y * 2 - 1);
  }

  function resetCard() {
    cardX.set(0);
    cardY.set(0);
  }

  useEffect(() => {
    if (authenticated) {
      navigate("/", {
        replace: true,
      });
    }
  }, [authenticated, navigate]);

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      match:
        password.length > 0 &&
        password === confirmPassword,
    }),
    [password, confirmPassword],
  );

  function updateMerchantName(
    value: string,
  ) {
    setMerchantName(value);

    setMerchantSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        fullName: fullName.trim(),
        merchantName: merchantName.trim(),
        merchantSlug:
          merchantSlug.trim().toLowerCase(),
        email: email.trim(),
        password,
      });

      navigate("/", {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your PayGuard workspace.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="signup-page">
      {/* ============================
          3D VIDEO HERO
          ============================ */}

      <motion.section
        className="signup-cinematic"
        onMouseMove={handleHeroMove}
        onMouseLeave={resetHero}
        initial={
          reduceMotion
            ? false
            : { opacity: 0 }
        }
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.65,
        }}
      >
        <motion.div
          className="signup-video-layer"
          style={
            reduceMotion
              ? undefined
              : {
                  x: videoX,
                  y: videoY,
                }
          }
          animate={
            reduceMotion
              ? { scale: 1 }
              : {
                  scale: [
                    1.02,
                    1.045,
                    1.02,
                  ],
                }
          }
          transition={{
            scale: {
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <video
            className="signup-video"
            src="/payguard-signup-3d.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </motion.div>

        <div className="signup-video-overlay" />
        <div className="signup-video-vignette" />

        <div className="signup-cinematic-content">
          <motion.div
            className="signup-brand"
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
              duration: 0.5,
              ease,
            }}
          >
            <motion.div
              className="signup-brand-mark"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      boxShadow: [
                        "0 0 18px rgba(198,241,53,0.08)",
                        "0 0 34px rgba(198,241,53,0.20)",
                        "0 0 18px rgba(198,241,53,0.08)",
                      ],
                    }
              }
              transition={{
                duration: 2.4,
                repeat: 1,
              }}
            >
              <ShieldCheck
                size={23}
                strokeWidth={2.3}
              />
            </motion.div>

            <div>
              <strong>PayGuard</strong>

              <span>
                Autonomous AI Risk Manager
              </span>
            </div>
          </motion.div>

          <div className="signup-hero-copy signup-hero-motion">
            <motion.div
              className="signup-eyebrow"
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
                ease,
              }}
            >
              <Sparkles size={13} />

              INTELLIGENT PAYMENT DEFENSE
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.28,
                duration: 0.62,
                ease,
              }}
            >
              Protect every
              <br />
              payment signal.
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
                ease,
              }}
            >
              Detect anomalies, investigate
              root causes and coordinate
              human-controlled response from
              one intelligent payment-risk
              workspace.
            </motion.p>
          </div>

          <motion.div
            className="signup-intelligence-strip"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  delayChildren: 0.5,
                  staggerChildren: 0.11,
                },
              },
            }}
          >
            <IntelligenceItem
              label="DETECT"
              text="Real-time risk"
            />

            <div className="signup-strip-line" />

            <IntelligenceItem
              label="EXPLAIN"
              text="Evidence-grounded AI"
            />

            <div className="signup-strip-line" />

            <IntelligenceItem
              label="CONTROL"
              text="Human approval"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* ============================
          CREATE WORKSPACE FORM
          ============================ */}

      <section className="signup-form-side">
        <div className="signup-card-perspective">
          <motion.div
            className="signup-form-wrap signup-form-wrap-motion"
            onMouseMove={handleCardMove}
            onMouseLeave={resetCard}
            style={
              reduceMotion
                ? undefined
                : {
                    rotateX,
                    rotateY,
                  }
            }
            initial={{
              opacity: 0,
              x: 26,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.58,
              delay: 0.08,
              ease,
            }}
          >
            <div className="signup-form-heading">
              <div className="signup-lock">
                <LockKeyhole
                  size={18}
                />
              </div>

              <div>
                <span>
                  SECURE WORKSPACE
                </span>

                <h2>
                  Create your account
                </h2>

                <p>
                  Start your PayGuard
                  payment-risk command
                  center.
                </p>
              </div>
            </div>

            <motion.form
              className="signup-form"
              onSubmit={handleSubmit}
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    delayChildren:
                      0.25,
                    staggerChildren:
                      0.06,
                  },
                },
              }}
            >
              <motion.div
                className="signup-fields-two"
                variants={formItemVariants}
              >
                <SignupField
                  label="Full name"
                  value={fullName}
                  placeholder="Your name"
                  autoComplete="name"
                  onChange={setFullName}
                />

                <SignupField
                  label="Workspace name"
                  value={merchantName}
                  placeholder="Acme Payments"
                  autoComplete="organization"
                  onChange={
                    updateMerchantName
                  }
                />
              </motion.div>

              <motion.div
                variants={formItemVariants}
              >
                <SignupField
                  label="Workspace slug"
                  value={merchantSlug}
                  placeholder="acme-payments"
                  autoComplete="off"
                  onChange={(value) =>
                    setMerchantSlug(
                      value
                        .toLowerCase()
                        .replace(
                          /[^a-z0-9-]/g,
                          "",
                        ),
                    )
                  }
                />
              </motion.div>

              <motion.div
                variants={formItemVariants}
              >
                <SignupField
                  label="Email"
                  type="email"
                  value={email}
                  placeholder="admin@company.com"
                  autoComplete="email"
                  onChange={setEmail}
                />
              </motion.div>

              <motion.div
                className="signup-fields-two"
                variants={formItemVariants}
              >
                <div className="signup-field">
                  <label>
                    Password
                  </label>

                  <div className="signup-password-wrap">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      required
                    />

                    <button
                      type="button"
                      className="signup-eye-button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current,
                        )
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>
                </div>

                <SignupField
                  label="Confirm password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  onChange={
                    setConfirmPassword
                  }
                />
              </motion.div>

              {(password ||
                confirmPassword) && (
                <motion.div
                  className="signup-password-rules"
                  variants={
                    formItemVariants
                  }
                >
                  <PasswordRule
                    valid={
                      passwordChecks.length
                    }
                    text="8+ characters"
                  />

                  <PasswordRule
                    valid={
                      passwordChecks.match
                    }
                    text="Passwords match"
                  />
                </motion.div>
              )}

              {error && (
                <motion.div
                  className="signup-error"
                  role="alert"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                    x: [
                      -3,
                      3,
                      -2,
                      2,
                      0,
                    ],
                  }}
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                className="signup-submit"
                disabled={
                  submitting ||
                  !fullName.trim() ||
                  !merchantName.trim() ||
                  !merchantSlug.trim() ||
                  !email.trim() ||
                  !password ||
                  !confirmPassword
                }
                variants={formItemVariants}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -2 }
                }
                whileTap={
                  reduceMotion
                    ? undefined
                    : {
                        scale: 0.985,
                      }
                }
              >
                {submitting
                  ? "Creating workspace..."
                  : "Create PayGuard workspace"}

                {!submitting && (
                  <ArrowRight
                    size={16}
                  />
                )}
              </motion.button>

              <motion.div
                className="signup-security"
                variants={formItemVariants}
              >
                <ShieldCheck size={13} />

                Your password is securely
                hashed by PayGuard.
              </motion.div>
            </motion.form>

            <div className="signup-login-link">
              Already have an account?

              <Link to="/login">
                Sign in
                <ArrowRight
                  size={12}
                />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

const formItemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.35,
      ease,
    },
  },
};

function SignupField({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="signup-field">
      <label>{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
    </div>
  );
}

function IntelligenceItem({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <motion.div
      className="signup-intelligence-item"
      variants={{
        hidden: {
          opacity: 0,
          y: 8,
        },

        show: {
          opacity: 1,
          y: 0,
        },
      }}
    >
      <span>{label}</span>
      <strong>{text}</strong>
    </motion.div>
  );
}

function PasswordRule({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={`signup-password-rule ${
        valid ? "valid" : ""
      }`}
    >
      <span>
        <Check size={9} />
      </span>

      {text}
    </div>
  );
}
