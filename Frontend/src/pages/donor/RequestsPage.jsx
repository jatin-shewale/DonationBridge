import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import RequestCard from "../../components/RequestCard.jsx";
import { friendlyError } from "../../api/client.js";
import { listRequests } from "../../api/requests.js";

export default function RequestsPage() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listRequests().then((data) => setRequests(data.results ?? data)).catch((e) => setError(friendlyError(e)));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!requests) return <LoadingSpinner label="Loading requests..." />;

  return (
    <div>
      <div className="page-header"><div><span className="eyebrow">Requests</span><h1>My requests</h1></div></div>
      {requests.length === 0 ? (
        <EmptyState title="No requests yet" message="Send a donation request to an NGO to track its status here." />
      ) : (
        <div className="grid grid-2">
          {requests.map((r) => <RequestCard key={r.id} request={r} />)}
        </div>
      )}
    </div>
  );
}
