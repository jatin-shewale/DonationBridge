export default function Select({ label, id, children, ...props }) {
  return (
    <div className="input-group">
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} className="select" {...props}>
        {children}
      </select>
    </div>
  );
}
