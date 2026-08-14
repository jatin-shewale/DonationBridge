import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import DetectionResult from "../../components/DetectionResult.jsx";
import DonationItemEditor from "../../components/DonationItemEditor.jsx";
import FileUploader from "../../components/FileUploader.jsx";
import Input from "../../components/Input.jsx";
import { analyzeImage } from "../../api/ai.js";
import { friendlyError } from "../../api/client.js";
import { addDonationItem, confirmDonation, createDonation } from "../../api/donations.js";

const STEPS = ["Upload", "Analyze", "Review", "Confirm"];

export default function DonatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detection, setDetection] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleFileSelected(f) {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setDetection(null);
  }

  async function handleAnalyze() {
    setError("");
    setAnalyzing(true);
    try {
      const result = await analyzeImage(file);
      setDetection(result);
      const detectedItems = Object.entries(result.counts).map(([item_name, quantity]) => {
        const match = result.detections.find((d) => d.class_name === item_name);
        return { item_name, quantity, confidence: match?.confidence ?? null, source: "ai" };
      });
      setItems((prev) => [...prev, ...detectedItems]);
      setStep(2);
    } catch (err) {
      setError(friendlyError(err, "AI detection failed. You can still add items manually."));
      setStep(2);
    } finally {
      setAnalyzing(false);
    }
  }

  function addManualItem(name, qty) {
    setItems((prev) => [...prev, { item_name: name, quantity: qty, confidence: null, source: "manual" }]);
  }

  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleConfirm() {
    if (!title.trim()) {
      setError("Please give your donation a title.");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one item before confirming.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const donation = await createDonation({ title, image: file });
      for (const item of items) {
        await addDonationItem(donation.id, {
          item_name: item.item_name,
          quantity: item.quantity,
          confidence: item.confidence,
        });
      }
      await confirmDonation(donation.id);
      navigate(`/donor/donations/${donation.id}`);
    } catch (err) {
      setError(friendlyError(err, "Could not save your donation. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">New donation</span>
          <h1>Create donation</h1>
        </div>
      </div>

      <div className="text-sm text-muted section-gap">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </div>

      {step === 0 && (
        <div className="card">
          <Input label="Donation title" placeholder="e.g. Winter clothes for kids" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Upload donation image</label>
          <FileUploader onFileSelected={handleFileSelected} previewUrl={previewUrl} onRemove={() => { setFile(null); setPreviewUrl(null); }} />
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={() => { setDetection(null); setStep(2); }}>Skip - add items manually</Button>
            <Button variant="primary" disabled={!file || !title.trim()} onClick={() => setStep(1)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <img src={previewUrl} alt="Donation" style={{ maxWidth: "100%", maxHeight: 320, borderRadius: 8, marginBottom: 16 }} />
          <p className="text-sm">The AI will scan this photo and suggest items and quantities. You can review and correct everything before confirming.</p>
          <Button variant="accent" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? "Analyzing..." : "Analyze image"}
          </Button>
        </div>
      )}

      {step >= 2 && (
        <>
          {detection && <DetectionResult result={detection} />}
          <DonationItemEditor items={items} onChange={setItems} onAdd={addManualItem} onRemove={removeItem} />
          {error && <p className="field-error" style={{ marginTop: 12 }}>{error}</p>}
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={() => setStep(0)}>Start over</Button>
            <Button variant="primary" onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Confirming..." : "Confirm donation"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
