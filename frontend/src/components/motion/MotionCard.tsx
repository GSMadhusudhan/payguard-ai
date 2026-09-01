import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import type { ReactNode } from "react";

interface MotionCardProps
  extends Omit<
    HTMLMotionProps<"div">,
    "children"
  > {
  children: ReactNode;
  interactive?: boolean;
}

export function MotionCard({
  children,
  interactive = true,
  ...props
}: MotionCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      {...props}
      whileHover={
        interactive && !reduceMotion
          ? {
              y: -2,
              scale: 1.002,
            }
          : undefined
      }
      whileTap={
        interactive && !reduceMotion
          ? {
              scale: 0.998,
            }
          : undefined
      }
      transition={{
        duration: 0.18,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
