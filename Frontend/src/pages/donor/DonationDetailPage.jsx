import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { friendlyError } from "../../api/client.js";
import { getDonation } from "../../api/donations.js";

export default function DonationDetailPage() {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDonation(id).then(setDonation).catch((e) => setError(friendlyError(e)));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!donation) return <LoadingSpinner label="Loading donation..." />;

  return (
    <div>
      <div className="page-header">
        <div><span className="eyebrow">Donation</span><h1>{donation.title}</h1></div>
        <Badge status={donation.status} />
      </div>

      {donation.image && (
        <img src={donation.image} alt={donation.title} style={{ maxWidth: "100%", maxHeight: 320, borderRadius: 10, marginBottom: 20 }} />
      )}

      <div className="card section-gap">
        <h3>Items</h3>
        {donation.items.map((item) => (
          <div key={item.id} className="item-row">
            <span style={{ textTransform: "capitalize" }}>{item.item_name.replace(/_/g, " ")}</span>
            <span className="mono">{item.quantity}</span>
          </div>
        ))}
      </div>

      {donation.status === "confirmed" && (
        <Link to={`/donor/ngos?donation=${donation.id}`}>
          <Button variant="accent">Find NGOs for this donation</Button>
        </Link>
      )}
    </div>
  );
}
