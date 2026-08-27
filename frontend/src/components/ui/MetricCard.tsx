import type {
  LucideIcon,
} from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "default" | "danger" | "success";
}

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: MetricCardProps) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-card-head">
        <span>{label}</span>

        <div className="metric-icon">
          <Icon size={17} />
        </div>
      </div>

      <div className="metric-value">{value}</div>
      <div className="metric-helper">{helper}</div>
    </article>
  );
}
