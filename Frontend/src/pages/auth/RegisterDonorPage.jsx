import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import { registerDonor } from "../../api/auth.js";
import { friendlyError } from "../../api/client.js";
import AuthLayout from "./AuthLayout.jsx";

const EMPTY = { username: "", email: "", password: "", first_name: "", last_name: "", phone: "", city: "" };

export default function RegisterDonorPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await registerDonor(form);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(friendlyError(err, "Could not register. Please check your details."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Register as a donor" subtitle="Donate physical items like books, clothes and toys to NGOs that need them.">
      <form onSubmit={handleSubmit}>
        <Input label="Username" required value={form.username} onChange={set("username")} />
        <Input label="Email" type="email" required value={form.email} onChange={set("email")} />
        <Input label="Password" type="password" required minLength={8} value={form.password} onChange={set("password")} />
        <Input label="First name" value={form.first_name} onChange={set("first_name")} />
        <Input label="Last name" value={form.last_name} onChange={set("last_name")} />
        <Input label="Phone" value={form.phone} onChange={set("phone")} />
        <Input label="City" value={form.city} onChange={set("city")} />
        {error && <p className="field-error" style={{ marginBottom: 12 }}>{error}</p>}
        <Button type="submit" variant="primary" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="text-sm" style={{ marginTop: 16, textAlign: "center" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
