import { useEffect, useState } from "react";
import ErrorState from "../../components/ErrorState.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import NotificationPanel from "../../components/NotificationPanel.jsx";
import { friendlyError } from "../../api/client.js";
import { listNotifications, markNotificationRead } from "../../api/notifications.js";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listNotifications().then((data) => setNotifications(data.results ?? data)).catch((e) => setError(friendlyError(e)));
  }, []);

  async function handleMarkRead(id) {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }

  if (error) return <ErrorState message={error} />;
  if (!notifications) return <LoadingSpinner label="Loading notifications..." />;

  return (
    <div>
      <div className="page-header"><div><span className="eyebrow">Notifications</span><h1>Notifications</h1></div></div>
      <NotificationPanel notifications={notifications} onMarkRead={handleMarkRead} />
    </div>
  );
}
