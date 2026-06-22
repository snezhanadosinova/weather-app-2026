export default function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-xl bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}