import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button.jsx";
import DonationCard from "../../components/DonationCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { friendlyError } from "../../api/client.js";
import { listDonations } from "../../api/donations.js";

export default function DonationsListPage() {
  const [donations, setDonations] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listDonations().then((data) => setDonations(data.results ?? data)).catch((e) => setError(friendlyError(e)));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div><span className="eyebrow">Donations</span><h1>My donations</h1></div>
        <Link to="/donor/donate"><Button variant="accent">New donation</Button></Link>
      </div>
      {error && <ErrorState message={error} />}
      {!error && !donations && <LoadingSpinner label="Loading donations..." />}
      {donations && donations.length === 0 && (
        <EmptyState title="No donations yet" message="Start your first donation to see it here." />
      )}
      {donations && donations.length > 0 && (
        <div className="grid grid-2">
          {donations.map((d) => <DonationCard key={d.id} donation={d} />)}
        </div>
      )}
    </div>
  );
}
