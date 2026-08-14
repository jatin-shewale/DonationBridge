export default function LoadingSpinner({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 24, color: "var(--slate)" }}>
      <span className="spinner" />
      {label && <span>{label}</span>}
    </div>
  );
}
