import { useEffect, useState } from "react";
import DashboardCard from "../../components/DashboardCard.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { friendlyError } from "../../api/client.js";
import { getAdminSystemStats } from "../../api/donations.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminSystemStats().then(setStats).catch((e) => setError(friendlyError(e)));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!stats) return <LoadingSpinner label="Loading system stats..." />;

  return (
    <div>
      <div className="page-header"><div><span className="eyebrow">Admin</span><h1>System overview</h1></div></div>
      <div className="grid grid-4 section-gap">
        <DashboardCard label="Total donors" value={stats.total_donors} />
        <DashboardCard label="Total NGOs" value={stats.total_ngos} />
        <DashboardCard label="Pending NGO approvals" value={stats.pending_ngo_approvals} />
        <DashboardCard label="Total donations" value={stats.total_donations} />
        <DashboardCard label="Active donations" value={stats.active_donations} />
        <DashboardCard label="Pending requests" value={stats.pending_requests} />
        <DashboardCard label="Completed donations" value={stats.completed_donations} />
      </div>
    </div>
  );
}
