import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardCard from "../../components/DashboardCard.jsx";
import DonationCard from "../../components/DonationCard.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import Button from "../../components/Button.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { getDonorDashboardStats } from "../../api/donations.js";
import { friendlyError } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DonorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDonorDashboardStats().then(setStats).catch((e) => setError(friendlyError(e)));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!stats) return <LoadingSpinner label="Loading dashboard..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">Donor dashboard</span>
          <h1>Welcome back, {user?.first_name || user?.username}</h1>
        </div>
        <Link to="/donor/donate"><Button variant="accent">Start a new donation</Button></Link>
      </div>

      <div className="grid grid-4 section-gap">
        <DashboardCard label="Total donations" value={stats.total_donations} />
        <DashboardCard label="Pending" value={stats.pending_donations} />
        <DashboardCard label="Completed" value={stats.completed_donations} />
        <DashboardCard label="Active requests" value={stats.active_requests} />
      </div>

      <h2>Recent donations</h2>
      {stats.recent_donations.length === 0 ? (
        <EmptyState title="No donations yet" message="Start by uploading a photo of items you'd like to donate." action={<Link to="/donor/donate"><Button variant="primary">Create your first donation</Button></Link>} />
      ) : (
        <div className="grid grid-2">
          {stats.recent_donations.map((d) => <DonationCard key={d.id} donation={d} />)}
        </div>
      )}
    </div>
  );
}
