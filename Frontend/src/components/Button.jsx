export default function Button({ variant = "primary", size = "md", children, ...props }) {
  const cls = `btn btn-${variant}${size === "sm" ? " btn-sm" : ""}`;
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
