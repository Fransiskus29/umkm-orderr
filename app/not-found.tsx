import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sf-bg px-4">
      <div className="text-center">
        <p className="text-6xl">🔍</p>
        <h1 className="mt-4 text-xl font-extrabold text-sf-text">Halaman Tidak Ditemukan</h1>
        <p className="mt-1 text-sm text-sf-text-secondary">Sepertinya halaman ini sudah dipindahkan.</p>
        <Link href="/" className="mt-5 inline-block rounded-xl bg-sf-red px-6 py-2.5 text-sm font-bold text-white transition hover:bg-sf-red-dark">
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
