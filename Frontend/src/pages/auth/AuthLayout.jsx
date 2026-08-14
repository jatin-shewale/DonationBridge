export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.6rem", color: "var(--evergreen)" }}>
            DonateBridge
          </div>
          <p className="text-sm text-muted" style={{ marginTop: 4 }}>Give physical things a path to the people who need them.</p>
        </div>
        <div className="card">
          <h2>{title}</h2>
          {subtitle && <p className="text-sm">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
