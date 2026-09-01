import {
  motion,
  useReducedMotion,
} from "motion/react";
import {
  Children,
  type ReactNode,
} from "react";

export function StaggerContainer({
  children,
  className = "",
  delay = 0,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: reduceMotion
            ? {}
            : {
                delayChildren: delay,
                staggerChildren: stagger,
              },
        },
      }}
    >
      {Children.map(
        children,
        (child: ReactNode) => (
          <motion.div
            variants={{
              hidden: reduceMotion
                ? { opacity: 1 }
                : {
                    opacity: 0,
                    y: 12,
                  },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: reduceMotion
                    ? 0
                    : 0.36,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                },
              },
            }}
          >
            {child}
          </motion.div>
        ),
      )}
    </motion.div>
  );
}
