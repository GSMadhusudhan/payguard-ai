export function formatMoneyFromPaise(
  value: number,
  compact = false,
) {
  const rupees = value / 100;

  if (compact) {
    if (rupees >= 10000000) {
      return `₹${(rupees / 10000000).toFixed(2)}Cr`;
    }

    if (rupees >= 100000) {
      return `₹${(rupees / 100000).toFixed(2)}L`;
    }

    if (rupees >= 1000) {
      return `₹${(rupees / 1000).toFixed(1)}K`;
    }
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function timeAgo(iso: string) {
  const date = new Date(iso);
  const seconds = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 1000),
  );

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}
