import { useEffect, useState } from "react";
import DashboardCard from "../../components/DashboardCard.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import RequestCard from "../../components/RequestCard.jsx";
import { friendlyError } from "../../api/client.js";
import { listRequests } from "../../api/requests.js";
import { listMyRequirements } from "../../api/ngos.js";

export default function NGODashboard() {
  const [requests, setRequests] = useState(null);
  const [requirements, setRequirements] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listRequests(), listMyRequirements()])
      .then(([reqData, reqmtData]) => {
        setRequests(reqData.results ?? reqData);
        setRequirements(reqmtData.results ?? reqmtData);
      })
      .catch((e) => setError(friendlyError(e)));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!requests || !requirements) return <LoadingSpinner label="Loading dashboard..." />;

  const pending = requests.filter((r) => r.status === "pending");
  const accepted = requests.filter((r) => r.status === "accepted");
  const completed = requests.filter((r) => r.status === "completed");
  const activeRequirements = requirements.filter((r) => r.active);

  return (
    <div>
      <div className="page-header"><div><span className="eyebrow">NGO dashboard</span><h1>Overview</h1></div></div>

      <div className="grid grid-4 section-gap">
        <DashboardCard label="Pending requests" value={pending.length} />
        <DashboardCard label="Accepted" value={accepted.length} />
        <DashboardCard label="Completed" value={completed.length} />
        <DashboardCard label="Active requirements" value={activeRequirements.length} />
      </div>

      <h2>Pending requests</h2>
      {pending.length === 0 ? (
        <p className="text-sm text-muted">No pending requests right now.</p>
      ) : (
        <div className="grid grid-2">
          {pending.map((r) => <RequestCard key={r.id} request={r} />)}
        </div>
      )}
    </div>
  );
}
