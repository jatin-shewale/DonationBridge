export default function DashboardCard({ label, value }) {
  return (
    <div className="dashboard-card">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}
