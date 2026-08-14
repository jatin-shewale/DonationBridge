import { Link } from "react-router-dom";
import Badge from "./Badge.jsx";

export default function DonationCard({ donation }) {
  const itemSummary = donation.items?.map((i) => `${i.quantity} ${i.item_name.replace(/_/g, " ")}`).join(", ");
  return (
    <Link to={`/donor/donations/${donation.id}`} className="card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>{donation.title}</h3>
          <p className="text-sm text-muted" style={{ margin: 0 }}>{itemSummary || "No items yet"}</p>
        </div>
        <Badge status={donation.status} />
      </div>
    </Link>
  );
}
