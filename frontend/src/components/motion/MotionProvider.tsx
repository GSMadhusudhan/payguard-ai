import {
  MotionConfig,
  type Transition,
} from "motion/react";
import type { ReactNode } from "react";

const payGuardTransition: Transition = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1],
};

export function MotionProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MotionConfig
      transition={payGuardTransition}
      reducedMotion="user"
    >
      {children}
    </MotionConfig>
  );
}
