export default function ErrorState({ message = "Something went wrong. Please try again." }) {
  return <div className="error-state">{message}</div>;
}
