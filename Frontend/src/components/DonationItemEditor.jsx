import Button from "./Button.jsx";
import Input from "./Input.jsx";

export default function DonationItemEditor({ items, onChange, onAdd, onRemove }) {
  function updateQty(idx, delta) {
    const next = [...items];
    next[idx] = { ...next[idx], quantity: Math.max(1, next[idx].quantity + delta) };
    onChange(next);
  }

  return (
    <div className="card">
      <h3>Review items</h3>
      {items.length === 0 && <p className="text-sm">No items yet. Add items below, or analyze a photo above.</p>}
      {items.map((item, idx) => (
        <div key={idx} className="item-row">
          <div>
            <div style={{ textTransform: "capitalize", fontWeight: 600 }}>{item.item_name.replace(/_/g, " ")}</div>
            {item.confidence != null && (
              <div className="text-sm text-muted">Confidence {Math.round(item.confidence * 100)}% · {item.source}</div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="qty-control">
              <button type="button" onClick={() => updateQty(idx, -1)} aria-label="Decrease quantity">−</button>
              <span className="qty-value">{item.quantity}</span>
              <button type="button" onClick={() => updateQty(idx, 1)} aria-label="Increase quantity">+</button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onRemove(idx)}>Remove</Button>
          </div>
        </div>
      ))}
      <AddItemRow onAdd={onAdd} />
    </div>
  );
}

function AddItemRow({ onAdd }) {
  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.item_name.value.trim();
    const qty = parseInt(form.quantity.value, 10);
    if (!name || !qty || qty < 1) return;
    onAdd(name, qty);
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, alignItems: "flex-end", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
      <div style={{ flex: 1 }}>
        <Input name="item_name" label="Add item" placeholder="e.g. blankets" required />
      </div>
      <div style={{ width: 100 }}>
        <Input name="quantity" label="Qty" type="number" min="1" defaultValue="1" required />
      </div>
      <Button type="submit" variant="ghost">Add item</Button>
    </form>
  );
}
