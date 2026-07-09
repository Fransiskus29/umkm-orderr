import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-surface-high bg-white">
      <div className="mx-auto flex max-w-container items-center justify-between px-4 py-4 lg:px-6">
        <Link href="/" className="text-lg font-bold text-brand-500">
          PesanUMKM
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium md:gap-4">
          <Link href="/" className="hidden text-secondary hover:text-brand-500 sm:inline">
            Jelajahi UMKM
          </Link>
          <Link href="/login" className="text-secondary hover:text-brand-500">
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-brand-500 px-4 py-2 text-white shadow-card hover:bg-brand-600"
          >
            Daftarkan UMKM
          </Link>
        </nav>
      </div>
    </header>
  );
}
