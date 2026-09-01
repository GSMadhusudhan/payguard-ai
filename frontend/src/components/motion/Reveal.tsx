import {
  motion,
  useReducedMotion,
} from "motion/react";
import type { ReactNode } from "react";

type Direction =
  | "up"
  | "down"
  | "left"
  | "right"
  | "none";

const offsets: Record<
  Direction,
  { x: number; y: number }
> = {
  up: { x: 0, y: 14 },
  down: { x: 0, y: -14 },
  left: { x: 14, y: 0 },
  right: { x: -14, y: 0 },
  none: { x: 0, y: 0 },
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  once?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const offset = offsets[direction];

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? { opacity: 1 }
          : {
              opacity: 0,
              x: offset.x,
              y: offset.y,
            }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{
        once,
        amount: 0.15,
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.42,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
