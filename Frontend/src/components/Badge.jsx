const STATUS_VARIANT = {
  completed: "success",
  accepted: "success",
  approved: "success",
  confirmed: "neutral",
  pending: "warn",
  requested: "warn",
  draft: "neutral",
  rejected: "danger",
  cancelled: "danger",
};

export default function Badge({ status, children }) {
  const variant = STATUS_VARIANT[status] || "neutral";
  return <span className={`badge badge-${variant}`}>{children || status}</span>;
}
