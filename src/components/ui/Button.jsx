export default function Button({ children, variant = "primary", type = "button", className = "", ...props }) {
  const styles = {
    primary: "bg-violet-600 hover:bg-violet-500",
    secondary: "bg-white/10 hover:bg-white/20 border border-white/10",
  };
  return <button {...props} type={type}
    className={`rounded-xl px-4 py-3 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${styles[variant] || styles.primary} ${className}`}>
    {children}
  </button>;
}
