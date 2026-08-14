export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && <h3>{title}</h3>}
        <div>{children}</div>
        {footer && <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>{footer}</div>}
      </div>
    </div>
  );
}
