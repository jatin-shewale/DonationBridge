import { useEffect, useState } from "react";
import Button from "../../components/Button.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import RequestCard from "../../components/RequestCard.jsx";
import { friendlyError } from "../../api/client.js";
import { acceptRequest, completeRequest, listRequests, rejectRequest } from "../../api/requests.js";

export default function NGORequestsPage() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  function load() {
    listRequests().then((data) => setRequests(data.results ?? data)).catch((e) => setError(friendlyError(e)));
  }

  useEffect(load, []);

  async function handleAction(action, id) {
    setActionError("");
    try {
      await action(id);
      load();
    } catch (err) {
      setActionError(friendlyError(err, "Could not update this request."));
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!requests) return <LoadingSpinner label="Loading requests..." />;

  return (
    <div>
      <div className="page-header"><div><span className="eyebrow">NGO</span><h1>Donation requests</h1></div></div>
      {actionError && <p className="field-error section-gap">{actionError}</p>}
      {requests.length === 0 ? (
        <EmptyState title="No requests yet" message="Donation requests from donors will show up here." />
      ) : (
        <div className="grid grid-2">
          {requests.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              actions={
                r.status === "pending" ? (
                  <>
                    <Button variant="primary" size="sm" onClick={() => handleAction(acceptRequest, r.id)}>Accept</Button>
                    <Button variant="danger" size="sm" onClick={() => handleAction(rejectRequest, r.id)}>Reject</Button>
                  </>
                ) : r.status === "accepted" ? (
                  <Button variant="primary" size="sm" onClick={() => handleAction(completeRequest, r.id)}>Mark handed over</Button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
