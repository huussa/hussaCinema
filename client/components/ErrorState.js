export default function ErrorState({ message = "Something went wrong." }) {
  return <div className="rounded-2xl border border-red-900/30 bg-red-950/10 p-6 text-sm text-red-300">{message}</div>;
}
