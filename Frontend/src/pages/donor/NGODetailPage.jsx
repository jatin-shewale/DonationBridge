import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import Modal from "../../components/Modal.jsx";
import { friendlyError } from "../../api/client.js";
import { getNGO } from "../../api/ngos.js";
import { listDonations } from "../../api/donations.js";
import { createRequest } from "../../api/requests.js";

export default function NGODetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(searchParams.get("donation") || "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    getNGO(id).then(setNgo).catch((e) => setError(friendlyError(e)));
  }, [id]);

  function openModal() {
    listDonations().then((data) => {
      const confirmed = (data.results ?? data).filter((d) => d.status === "confirmed");
      setDonations(confirmed);
    });
    setModalOpen(true);
  }

  async function handleSend() {
    if (!selectedDonation) {
      setSendError("Choose a confirmed donation to send.");
      return;
    }
    setSending(true);
    setSendError("");
    try {
      await createRequest({ donation: selectedDonation, ngo: ngo.id, message });
      navigate("/donor/requests");
    } catch (err) {
      setSendError(friendlyError(err, "Could not send the request."));
    } finally {
      setSending(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!ngo) return <LoadingSpinner label="Loading NGO..." />;

  return (
    <div>
      <div className="page-header">
        <div><span className="eyebrow">NGO</span><h1>{ngo.organization_name}</h1></div>
        <Button variant="accent" onClick={openModal}>Send donation request</Button>
      </div>
      <div className="card">
        <p>{ngo.description || "No description provided."}</p>
        <p className="text-sm text-muted">{[ngo.address, ngo.city, ngo.state, ngo.pincode].filter(Boolean).join(", ")}</p>
        {ngo.website && <p className="text-sm"><a href={ngo.website} target="_blank" rel="noreferrer">{ngo.website}</a></p>}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Send donation request"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSend} disabled={sending}>{sending ? "Sending..." : "Send request"}</Button>
          </>
        }
      >
        <div className="input-group">
          <label>Choose a confirmed donation</label>
          <select className="select" value={selectedDonation} onChange={(e) => setSelectedDonation(e.target.value)}>
            <option value="">Select...</option>
            {donations.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>Message (optional)</label>
          <textarea className="input" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        {donations.length === 0 && <p className="text-sm text-muted">You have no confirmed donations yet. Confirm a donation first.</p>}
        {sendError && <p className="field-error">{sendError}</p>}
      </Modal>
    </div>
  );
}
