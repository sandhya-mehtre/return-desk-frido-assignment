import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex justify-between items-center">
        <Link
          href="/"
          className="font-semibold text-lg tracking-tight text-slate-900 hover:text-gray-900 transition-colors"
        >
          ReturnDesk
        </Link>
        <div className="flex gap-1 text-sm font-medium">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/customers"
            className="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Customers
          </Link>
          <Link
            href="/reports"
            className="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Reports
          </Link>
        </div>
      </div>
    </nav>
  );
}