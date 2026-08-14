export default function Input({ label, error, id, ...props }) {
  return (
    <div className="input-group">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} className={`input${error ? " input-error" : ""}`} {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
