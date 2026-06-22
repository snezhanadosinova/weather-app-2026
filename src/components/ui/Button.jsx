export default function Button({ children, onClick, variant = "primary" }) {
  const base =
    "rounded-xl px-4 py-3 font-medium transition";

  const styles = {
    primary: "bg-blue-600 hover:bg-blue-500",
    secondary: "bg-white/10 hover:bg-white/20 border border-white/10",
  };

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}