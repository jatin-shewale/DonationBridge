import { useEffect, useState } from "react";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import Select from "../../components/Select.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { friendlyError } from "../../api/client.js";
import { createRequirement, deleteRequirement, listMyRequirements, updateRequirement } from "../../api/ngos.js";

const EMPTY = { item_name: "", required_quantity: "", priority: "medium", description: "" };

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    listMyRequirements().then((data) => setRequirements(data.results ?? data)).catch((e) => setError(friendlyError(e)));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await createRequirement({ ...form, required_quantity: parseInt(form.required_quantity, 10) });
      setForm(EMPTY);
      load();
    } catch (err) {
      setFormError(friendlyError(err, "Could not add this requirement."));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(req) {
    await updateRequirement(req.id, { active: !req.active });
    load();
  }

  async function handleDelete(req) {
    if (!confirm(`Remove the requirement for ${req.item_name}?`)) return;
    await deleteRequirement(req.id);
    load();
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className="page-header"><div><span className="eyebrow">NGO</span><h1>Donation requirements</h1></div></div>

      <form className="card section-gap" onSubmit={handleCreate}>
        <h3>Add a requirement</h3>
        <div className="grid grid-3">
          <Input label="Item name" placeholder="e.g. books" required value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} />
          <Input label="Required quantity" type="number" min="1" required value={form.required_quantity} onChange={(e) => setForm({ ...form, required_quantity: e.target.value })} />
          <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
        {formError && <p className="field-error">{formError}</p>}
        <Button type="submit" variant="primary" disabled={saving}>{saving ? "Adding..." : "Add requirement"}</Button>
      </form>

      {!requirements ? (
        <LoadingSpinner label="Loading requirements..." />
      ) : requirements.length === 0 ? (
        <EmptyState title="No requirements yet" message="Add what your organization needs so donors and the matching system can find you." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {requirements.map((r) => (
            <div key={r.id} className="item-row" style={{ padding: "14px 20px" }}>
              <div>
                <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{r.item_name.replace(/_/g, " ")} · {r.required_quantity}</div>
                <div className="text-sm text-muted">Priority: {r.priority}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge status={r.active ? "approved" : "cancelled"}>{r.active ? "Active" : "Inactive"}</Badge>
                <Button variant="ghost" size="sm" onClick={() => toggleActive(r)}>{r.active ? "Deactivate" : "Activate"}</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(r)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
