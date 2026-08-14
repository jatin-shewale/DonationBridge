import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV = {
  donor: [
    { to: "/donor/dashboard", label: "Dashboard" },
    { to: "/donor/donate", label: "Donate" },
    { to: "/donor/donations", label: "My Donations" },
    { to: "/donor/ngos", label: "NGOs" },
    { to: "/donor/requests", label: "Requests" },
    { to: "/donor/notifications", label: "Notifications" },
    { to: "/donor/profile", label: "Profile" },
  ],
  ngo: [
    { to: "/ngo/dashboard", label: "Dashboard" },
    { to: "/ngo/requirements", label: "Requirements" },
    { to: "/ngo/requests", label: "Requests" },
    { to: "/ngo/notifications", label: "Notifications" },
    { to: "/ngo/profile", label: "Profile" },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/ngo-applications", label: "NGO Applications" },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const items = NAV[user?.role] || [];

  return (
    <div className="app-shell">
      <aside style={{
        width: 220, background: "var(--evergreen-dark)", color: "#fff",
        padding: "24px 16px", display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", marginBottom: 28, padding: "0 8px" }}>
          DonateBridge
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: "10px 12px",
                borderRadius: 8,
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: isActive ? 700 : 500,
                background: isActive ? "rgba(255,255,255,0.14)" : "transparent",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 14, marginTop: 14 }}>
          <div style={{ fontSize: "0.82rem", opacity: 0.85, marginBottom: 8 }}>
            {user?.first_name || user?.username} · <span style={{ textTransform: "capitalize" }}>{user?.role}</span>
          </div>
          <button
            onClick={logout}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: "0.82rem", width: "100%" }}
          >
            Log out
          </button>
        </div>
      </aside>
      <div className="app-main">
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
