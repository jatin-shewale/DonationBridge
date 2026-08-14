import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <h1>Page not found</h1>
      <p className="text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/login"><Button variant="primary">Back to login</Button></Link>
    </div>
  );
}
