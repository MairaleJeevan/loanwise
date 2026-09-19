import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold tracking-wider text-brand-700 uppercase">Page not found</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-slate-600">Your progress is saved. Head back home to continue where you left off.</p>
      <Link href="/" className="mt-8 inline-flex h-11 items-center rounded-xl bg-brand-700 px-5 font-medium text-white hover:bg-brand-800">
        Back to home
      </Link>
    </div>
  );
}
