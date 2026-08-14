import { useRef, useState } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 10;

export default function FileUploader({ onFileSelected, previewUrl, onRemove }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function validateAndEmit(file) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Unsupported format. Please use JPG, PNG or WEBP.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_MB}MB.`);
      return;
    }
    setError("");
    onFileSelected(file);
  }

  if (previewUrl) {
    return (
      <div className="uploader">
        <img src={previewUrl} alt="Donation preview" className="preview" />
        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onRemove}>Remove &amp; replace image</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`uploader${dragging ? " dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          validateAndEmit(e.dataTransfer.files?.[0]);
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: "var(--ink)" }}>Drag &amp; drop a photo of your donation</p>
        <p className="text-sm" style={{ margin: "6px 0 16px" }}>Supported: JPG, PNG, WEBP · up to {MAX_MB}MB</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
          Choose image
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          style={{ display: "none" }}
          onChange={(e) => validateAndEmit(e.target.files?.[0])}
        />
      </div>
      {error && <p className="field-error" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}
