import {
  animate,
  useReducedMotion,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

export function AnimatedMetric({
  value,
  formatter = (number) =>
    Math.round(number).toLocaleString(
      "en-IN",
    ),
  duration = 0.8,
  className = "",
}: {
  value: number;
  formatter?: (value: number) => string;
  duration?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  const previousValue =
    useRef<number>(0);

  const [displayValue, setDisplayValue] =
    useState(
      reduceMotion ? value : 0,
    );

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      previousValue.current = value;
      return;
    }

    const controls = animate(
      previousValue.current,
      value,
      {
        duration,
        ease: [0.22, 1, 0.36, 1],

        onUpdate: (latest) => {
          setDisplayValue(latest);
        },

        onComplete: () => {
          previousValue.current = value;
        },
      },
    );

    return () => controls.stop();
  }, [
    value,
    duration,
    reduceMotion,
  ]);

  return (
    <span
      className={className}
      data-metric
    >
      {formatter(displayValue)}
    </span>
  );
}
