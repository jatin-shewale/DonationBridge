import { useState } from "react";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import { updateMe } from "../../api/auth.js";
import { friendlyError } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || "", last_name: user?.last_name || "",
    phone: user?.phone || "", address: user?.address || "",
    city: user?.city || "", state: user?.state || "", pincode: user?.pincode || "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await updateMe(form);
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setSaved(true);
    } catch (err) {
      setError(friendlyError(err, "Could not save your profile."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header"><div><span className="eyebrow">Account</span><h1>My profile</h1></div></div>
      <form className="card" onSubmit={handleSave} style={{ maxWidth: 480 }}>
        <Input label="First name" value={form.first_name} onChange={set("first_name")} />
        <Input label="Last name" value={form.last_name} onChange={set("last_name")} />
        <Input label="Phone" value={form.phone} onChange={set("phone")} />
        <Input label="Address" value={form.address} onChange={set("address")} />
        <Input label="City" value={form.city} onChange={set("city")} />
        <Input label="State" value={form.state} onChange={set("state")} />
        <Input label="Pincode" value={form.pincode} onChange={set("pincode")} />
        {error && <p className="field-error">{error}</p>}
        {saved && <p className="text-sm" style={{ color: "var(--success)" }}>Profile saved.</p>}
        <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
      </form>
    </div>
  );
}
