import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import NGOCard from "../../components/NGOCard.jsx";
import { friendlyError } from "../../api/client.js";
import { getDonationMatches, listNGOs } from "../../api/ngos.js";

export default function NGOsListPage() {
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get("donation");
  const [ngos, setNgos] = useState(null);
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listNGOs().then((data) => setNgos(data.results ?? data)).catch((e) => setError(friendlyError(e)));
    if (donationId) {
      getDonationMatches(donationId).then((data) => setMatches(data.matches)).catch(() => {});
    }
  }, [donationId]);

  if (error) return <ErrorState message={error} />;
  if (!ngos) return <LoadingSpinner label="Loading NGOs..." />;

  const matchMap = new Map((matches || []).map((m) => [m.ngo, m]));
  const sorted = matches
    ? [...ngos].sort((a, b) => (matchMap.get(b.id)?.match_score || 0) - (matchMap.get(a.id)?.match_score || 0))
    : ngos;

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">NGOs</span>
          <h1>{donationId ? "Recommended NGOs for your donation" : "Browse NGOs"}</h1>
        </div>
      </div>
      {sorted.length === 0 ? (
        <EmptyState title="No approved NGOs yet" message="Check back soon - new organizations join regularly." />
      ) : (
        <div className="grid grid-2">
          {sorted.map((ngo) => {
            const match = matchMap.get(ngo.id);
            return <NGOCard key={ngo.id} ngo={ngo} matchScore={match?.match_score} reason={match?.reason} />;
          })}
        </div>
      )}
    </div>
  );
}
