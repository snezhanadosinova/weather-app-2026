export default function ErrorBox({ message, ...props }) {
  return <div {...props} role="alert" aria-atomic="true"
    className={message ? "bg-red-950 border border-red-300 text-red-100 p-3 rounded-xl text-sm" : "sr-only"}>
    {message || ""}
  </div>;
}
