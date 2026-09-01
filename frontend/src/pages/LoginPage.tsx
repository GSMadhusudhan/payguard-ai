import {
  ArrowRight,
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
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ease = [0.22, 1, 0.36, 1] as const;

export function LoginPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const {
    authenticated,
    login,
  } = useAuth();

  const [merchantSlug, setMerchantSlug] =
    useState("demo-merchant");

  const [email, setEmail] =
    useState("admin@payguard.example.com");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  /* =========================================
     VIDEO PARALLAX
     ========================================= */

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
      (event.clientX - rect.left) / rect.width;

    const y =
      (event.clientY - rect.top) / rect.height;

    mouseX.set(x * 2 - 1);
    mouseY.set(y * 2 - 1);
  }

  function resetHero() {
    mouseX.set(0);
    mouseY.set(0);
  }

  /* =========================================
     LOGIN CARD TILT
     ========================================= */

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
    [1.5, -1.5],
  );

  const rotateY = useTransform(
    cardSpringX,
    [-1, 1],
    [-1.7, 1.7],
  );

  function handleCardMove(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (reduceMotion) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) / rect.width;

    const y =
      (event.clientY - rect.top) / rect.height;

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

      navigate("/", {
        replace: true,
      });
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
    <main className="login-motion-page">
      {/* ===============================
          CINEMATIC LEFT SIDE
          =============================== */}

      <motion.section
        className="login-motion-visual"
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
          className="login-motion-video-layer"
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
            className="login-motion-video"
            src="/payguard-signup-3d.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </motion.div>

        <div className="login-motion-overlay" />
        <div className="login-motion-vignette" />

        <div className="login-motion-content">
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

          <div className="login-motion-hero">
            <motion.div
              className="signup-eyebrow"
              initial={{
                opacity: 0,
                y: 10,
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
              PAYMENT INTELLIGENCE
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 22,
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
              See payment risk
              <br />
              before it becomes
              <br />
              revenue loss.
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 14,
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
              Detect anomalies, investigate root causes
              and coordinate human-controlled mitigation
              from one intelligent payment-risk command
              center.
            </motion.p>
          </div>

          <motion.div
            className="login-motion-strip"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  delayChildren: 0.52,
                  staggerChildren: 0.11,
                },
              },
            }}
          >
            <LoginSignal
              label="DETECT"
              text="Live payment risk"
            />

            <div className="login-motion-divider" />

            <LoginSignal
              label="INVESTIGATE"
              text="Evidence-grounded AI"
            />

            <div className="login-motion-divider" />

            <LoginSignal
              label="RESPOND"
              text="Human controlled"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* ===============================
          LOGIN FORM
          =============================== */}

      <section className="login-motion-form-side">
        <div className="login-motion-perspective">
          <motion.div
            className="login-card login-card-motion"
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
              x: 24,
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
            <motion.div
              className="login-lock"
              initial={{
                opacity: 0,
                scale: 0.85,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: 0.22,
              }}
            >
              <LockKeyhole size={20} />
            </motion.div>

            <motion.h2
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.26,
              }}
            >
              Welcome back
            </motion.h2>

            <motion.p
              className="login-subtitle"
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.31,
              }}
            >
              Sign in to access your payment-risk
              command center.
            </motion.p>

            <motion.form
              className="login-motion-form"
              onSubmit={handleSubmit}
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    delayChildren: 0.34,
                    staggerChildren: 0.065,
                  },
                },
              }}
            >
              <motion.label variants={formItemVariants}>
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
                  required
                />
              </motion.label>

              <motion.label variants={formItemVariants}>
                Email

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                />
              </motion.label>

              <motion.label variants={formItemVariants}>
                Password

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  minLength={8}
                  required
                />
              </motion.label>

              {error && (
                <motion.div
                  className="login-error"
                  role="alert"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                    x: [-3, 3, -2, 2, 0],
                  }}
                  transition={{
                    duration: 0.28,
                  }}
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                className="primary-button login-submit login-submit-motion"
                type="submit"
                disabled={
                  submitting ||
                  !merchantSlug.trim() ||
                  !email.trim() ||
                  !password
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
                <span>
                  {submitting
                    ? "Signing in..."
                    : "Enter PayGuard"}
                </span>

                {!submitting && (
                  <ArrowRight size={17} />
                )}
              </motion.button>

              <motion.div
                className="login-security-note"
                variants={formItemVariants}
              >
                <ShieldCheck size={14} />

                Authentication is handled by the
                PayGuard backend.
              </motion.div>

              <motion.div
                className="login-create-account"
                variants={formItemVariants}
              >
                <span>
                  New to PayGuard?
                </span>

                <Link to="/signup">
                  Create workspace
                  <ArrowRight size={12} />
                </Link>
              </motion.div>
            </motion.form>
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
      duration: 0.34,
      ease,
    },
  },
};

function LoginSignal({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <motion.div
      className="login-motion-signal"
      variants={{
        hidden: {
          opacity: 0,
          y: 8,
        },

        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease,
          },
        },
      }}
    >
      <span>{label}</span>
      <strong>{text}</strong>
    </motion.div>
  );
}
