import { Link } from "react-router-dom";

export default function NGOCard({ ngo, matchScore, reason }) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>{ngo.organization_name}</h3>
          <p className="text-sm text-muted" style={{ margin: 0 }}>{ngo.city}{ngo.city && ngo.state ? ", " : ""}{ngo.state}</p>
        </div>
        {matchScore != null && (
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontWeight: 700, color: "var(--evergreen)", fontSize: "1.1rem" }}>{matchScore}%</div>
            <div className="text-sm text-muted">match</div>
          </div>
        )}
      </div>
      {reason && <p className="text-sm" style={{ marginTop: 10 }}>{reason}</p>}
      <Link to={`/donor/ngos/${ngo.id}`} className="text-sm" style={{ fontWeight: 600 }}>View NGO &rarr;</Link>
    </div>
  );
}
