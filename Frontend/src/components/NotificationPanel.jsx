export default function NotificationPanel({ notifications, onMarkRead }) {
  if (!notifications || notifications.length === 0) {
    return <div className="empty-state"><p>You're all caught up. No notifications yet.</p></div>;
  }
  return (
    <div className="card" style={{ padding: 0 }}>
      {notifications.map((n) => (
        <div
          key={n.id}
          className="item-row"
          style={{ padding: "14px 20px", background: n.is_read ? "transparent" : "#F2F7F5", cursor: n.is_read ? "default" : "pointer" }}
          onClick={() => !n.is_read && onMarkRead(n.id)}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{n.title}</div>
            <div className="text-sm text-muted">{n.message}</div>
          </div>
          {!n.is_read && <span className="badge badge-warn">New</span>}
        </div>
      ))}
    </div>
  );
}
