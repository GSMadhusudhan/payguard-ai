import {
  Bot,
  Database,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

type LayerTagVariant =
  | "deterministic"
  | "ai"
  | "human";

interface LayerTagProps {
  variant: LayerTagVariant;
  confidence?: number;
  label?: string;
  compact?: boolean;
}

export function LayerTag({
  variant,
  confidence,
  label,
  compact = false,
}: LayerTagProps) {
  const config = {
    deterministic: {
      icon: Database,
      defaultLabel: "Deterministic",
    },
    ai: {
      icon: Bot,
      defaultLabel:
        confidence !== undefined
          ? `AI · ${confidence}%`
          : "AI interpretation",
    },
    human: {
      icon: UserRoundCheck,
      defaultLabel: "Human approval required",
    },
  }[variant];

  const Icon = config.icon;
  const accessibleLabel =
    label || config.defaultLabel;

  /*
   * Density rule:
   * compact = repeated layer occurrence → icon only
   * normal  = first/important occurrence → full badge
   */
  if (compact) {
    return (
      <span
        className={[
          "layer-indicator",
          `layer-indicator--${variant}`,
        ].join(" ")}
        title={accessibleLabel}
        aria-label={accessibleLabel}
      >
        <Icon size={11} strokeWidth={2.2} />
      </span>
    );
  }

  return (
    <span
      className={[
        "layer-tag",
        `layer-tag--${variant}`,
      ].join(" ")}
    >
      <Icon size={12} strokeWidth={2} />

      <span>{accessibleLabel}</span>

      {variant === "deterministic" && (
        <ShieldCheck
          className="layer-tag__verified"
          size={11}
          strokeWidth={2}
        />
      )}
    </span>
  );
}
