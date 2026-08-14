export default function DetectionResult({ result }) {
  if (!result) return null;
  const { detections, note, model } = result;
  const estimated = note?.toLowerCase().includes("low-confidence placeholder") || detections.some((d) => d.class_name === "unknown_item");
  const title = estimated ? "Estimated AI result" : "AI detection result";

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {estimated && (
          <span
            className="text-sm"
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(214, 158, 46, 0.16)",
              color: "#9A6700",
              fontWeight: 700,
            }}
          >
            Estimated
          </span>
        )}
      </div>
      {note && <p className="text-sm">{note}</p>}
      {detections.length === 0 ? (
        <p className="text-sm">No items were detected automatically. Add items manually below.</p>
      ) : (
        <div>
          {detections.map((d, i) => (
            <div key={i} className="item-row">
              <span style={{ textTransform: "capitalize" }}>
                {d.class_name.replace(/_/g, " ")}
                {d.class_name === "unknown_item" ? " (estimated)" : ""}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="confidence-bar-track">
                  <div className="confidence-bar-fill" style={{ width: `${Math.round(d.confidence * 100)}%` }} />
                </div>
                <span className="text-sm mono">{Math.round(d.confidence * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-sm" style={{ marginTop: 12 }}>
        Model: <span className="mono">{model}</span>
        {estimated && <span> · estimated fallback</span>}
      </p>
    </div>
  );
}
