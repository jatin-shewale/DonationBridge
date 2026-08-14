import Button from "./Button.jsx";
import Modal from "./Modal.jsx";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", danger = false }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
