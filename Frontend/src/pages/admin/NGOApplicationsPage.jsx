import { useEffect, useState } from "react";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import Select from "../../components/Select.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { friendlyError } from "../../api/client.js";
import { approveNGO, listNGOApplications, rejectNGO } from "../../api/ngos.js";

export default function NGOApplicationsPage() {
  const [applications, setApplications] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  function load() {
    listNGOApplications(statusFilter || undefined)
      .then((data) => setApplications(data.results ?? data))
      .catch((e) => setError(friendlyError(e)));
  }

  useEffect(load, [statusFilter]);

  async function handleApprove(id) {
    setActionError("");
    try {
      await approveNGO(id);
      load();
    } catch (err) {
      setActionError(friendlyError(err, "Could not approve this NGO."));
    }
  }

  async function handleReject(id) {
    setActionError("");
    try {
      await rejectNGO(id);
      load();
    } catch (err) {
      setActionError(friendlyError(err, "Could not reject this NGO."));
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className="page-header">
        <div><span className="eyebrow">Admin</span><h1>NGO applications</h1></div>
        <div style={{ width: 180 }}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </Select>
        </div>
      </div>
      {actionError && <p className="field-error section-gap">{actionError}</p>}
      {!applications ? (
        <LoadingSpinner label="Loading applications..." />
      ) : applications.length === 0 ? (
        <EmptyState title="Nothing here" message="No NGO applications match this filter." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {applications.map((app) => (
            <div key={app.id} className="item-row" style={{ padding: "16px 20px" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{app.organization_name}</div>
                <div className="text-sm text-muted">{app.email} · Reg #{app.registration_number} · {[app.city, app.state].filter(Boolean).join(", ")}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Badge status={app.approval_status} />
                {app.approval_status === "pending" && (
                  <>
                    <Button variant="primary" size="sm" onClick={() => handleApprove(app.id)}>Approve</Button>
                    <Button variant="danger" size="sm" onClick={() => handleReject(app.id)}>Reject</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
