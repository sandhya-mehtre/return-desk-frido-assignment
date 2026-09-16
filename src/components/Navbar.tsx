import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg">
          ReturnDesk
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/dashboard" className="text-gray-600 hover:text-black">
            Dashboard
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-black">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}