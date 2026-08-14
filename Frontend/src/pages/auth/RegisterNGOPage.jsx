import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import { registerNGO } from "../../api/auth.js";
import { friendlyError } from "../../api/client.js";
import AuthLayout from "./AuthLayout.jsx";

const EMPTY = {
  username: "", email: "", password: "", organization_name: "", registration_number: "",
  phone: "", website: "", address: "", city: "", state: "", pincode: "", description: "",
};

export default function RegisterNGOPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await registerNGO(form);
      setSubmitted(true);
    } catch (err) {
      setError(friendlyError(err, "Could not submit your application. Please check your details."));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <AuthLayout title="Application submitted">
        <p>Thanks - your NGO application is pending admin review. You'll be able to log in once it's approved.</p>
        <Button variant="primary" onClick={() => navigate("/login")} style={{ width: "100%" }}>Go to login</Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Register your NGO" subtitle="Your account will be reviewed by an admin before you can log in.">
      <form onSubmit={handleSubmit}>
        <Input label="Organization name" required value={form.organization_name} onChange={set("organization_name")} />
        <Input label="Registration number" required value={form.registration_number} onChange={set("registration_number")} />
        <Input label="Contact username" required value={form.username} onChange={set("username")} />
        <Input label="Email" type="email" required value={form.email} onChange={set("email")} />
        <Input label="Password" type="password" required minLength={8} value={form.password} onChange={set("password")} />
        <Input label="Phone" value={form.phone} onChange={set("phone")} />
        <Input label="Website" value={form.website} onChange={set("website")} />
        <Input label="Address" value={form.address} onChange={set("address")} />
        <Input label="City" value={form.city} onChange={set("city")} />
        <Input label="State" value={form.state} onChange={set("state")} />
        <Input label="Pincode" value={form.pincode} onChange={set("pincode")} />
        {error && <p className="field-error" style={{ marginBottom: 12 }}>{error}</p>}
        <Button type="submit" variant="primary" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Submitting..." : "Submit application"}
        </Button>
      </form>
      <p className="text-sm" style={{ marginTop: 16, textAlign: "center" }}>
        Already approved? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
