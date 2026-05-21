import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-caveat text-pink-400">404</h1>
        <p className="text-slate-500">Page not found</p>
        <Link
          href="/"
          className="inline-block text-sm text-pink-500 underline underline-offset-4 hover:text-pink-600 transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
