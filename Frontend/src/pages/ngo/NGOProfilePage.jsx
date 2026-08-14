import { useEffect, useState } from "react";
import Button from "../../components/Button.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import Input from "../../components/Input.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { friendlyError } from "../../api/client.js";
import { getMyNGOProfile, updateMyNGOProfile } from "../../api/ngos.js";

export default function NGOProfilePage() {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyNGOProfile().then(setForm).catch((e) => setError(friendlyError(e)));
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const { organization_name, phone, website, address, city, state, pincode, description } = form;
      const updated = await updateMyNGOProfile({ organization_name, phone, website, address, city, state, pincode, description });
      setForm(updated);
      setSaved(true);
    } catch (err) {
      setError(friendlyError(err, "Could not save your profile."));
    } finally {
      setSaving(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!form) return <LoadingSpinner label="Loading profile..." />;

  return (
    <div>
      <div className="page-header"><div><span className="eyebrow">NGO</span><h1>Organization profile</h1></div></div>
      <form className="card" onSubmit={handleSave} style={{ maxWidth: 520 }}>
        <Input label="Organization name" value={form.organization_name} onChange={set("organization_name")} />
        <Input label="Phone" value={form.phone} onChange={set("phone")} />
        <Input label="Website" value={form.website} onChange={set("website")} />
        <Input label="Address" value={form.address} onChange={set("address")} />
        <Input label="City" value={form.city} onChange={set("city")} />
        <Input label="State" value={form.state} onChange={set("state")} />
        <Input label="Pincode" value={form.pincode} onChange={set("pincode")} />
        <div className="input-group">
          <label>Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={set("description")} />
        </div>
        {saved && <p className="text-sm" style={{ color: "var(--success)" }}>Profile saved.</p>}
        <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
      </form>
    </div>
  );
}
