import Badge from "./Badge.jsx";

export default function RequestCard({ request, actions }) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>{request.donation_title}</h3>
          <p className="text-sm text-muted" style={{ margin: 0 }}>{request.ngo_name}</p>
          {request.message && <p className="text-sm" style={{ marginTop: 8 }}>&ldquo;{request.message}&rdquo;</p>}
        </div>
        <Badge status={request.status} />
      </div>
      {actions && <div style={{ marginTop: 14, display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}
