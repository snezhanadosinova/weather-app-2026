export default function Loader({ loading, message, completedMessage = "" }) {
  return <p role="status" aria-atomic="true" className={loading ? "text-center text-slate-200" : "sr-only"}>
    {loading ? message : completedMessage}
  </p>;
}
