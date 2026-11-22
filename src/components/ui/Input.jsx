export default function Input({ className = "", ...props }) {
  return <input {...props}
    className={`w-full min-w-0 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[1rem] text-white placeholder-gray-400 transition-colors focus:border-indigo-300/70 focus:bg-white/15 focus-visible:outline-2 focus-visible:outline-indigo-300 focus-visible:outline-offset-2 ${className}`} />;
}
