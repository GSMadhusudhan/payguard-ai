import {
  motion,
  useReducedMotion,
} from "motion/react";

type SignalTone =
  | "critical"
  | "healthy"
  | "ai"
  | "warning";

export function SignalPulse({
  tone = "ai",
  label,
}: {
  tone?: SignalTone;
  label?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <span
      className={`pg-signal pg-signal--${tone}`}
    >
      <span className="pg-signal-core" />

      {!reduceMotion && (
        <motion.span
          className="pg-signal-ring"
          initial={{
            opacity: 0.45,
            scale: 0.7,
          }}
          animate={{
            opacity: [0.45, 0],
            scale: [0.7, 2.1],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}

      {label && (
        <span className="pg-signal-label">
          {label}
        </span>
      )}
    </span>
  );
}
