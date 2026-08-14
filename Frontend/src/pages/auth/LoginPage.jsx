import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import Select from "../../components/Select.jsx";
import { friendlyError } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import AuthLayout from "./AuthLayout.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "", role: "donor" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password, form.role);
      const redirect = location.state?.from?.pathname
        || { donor: "/donor/dashboard", ngo: "/ngo/dashboard", admin: "/admin/dashboard" }[user.role];
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(friendlyError(err, "Could not log in. Check your details and try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back.">
      <form onSubmit={handleSubmit}>
        <Select label="I am a" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="donor">Donor</option>
          <option value="ngo">NGO</option>
          <option value="admin">Admin</option>
        </Select>
        <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="field-error" style={{ marginBottom: 12 }}>{error}</p>}
        <Button type="submit" variant="primary" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <p className="text-sm" style={{ marginTop: 16, textAlign: "center" }}>
        New donor? <Link to="/register/donor">Register</Link> · NGO? <Link to="/register/ngo">Register your organization</Link>
      </p>
    </AuthLayout>
  );
}
