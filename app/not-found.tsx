import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF6ED] px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#1C1410]/5 text-5xl font-bold text-[#1C1410]/20">
          404
        </div>
        <h1 className="text-2xl font-bold text-[#1C1410]">Halaman Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-[#1C1410]/50">
          Sepertinya halaman yang kamu cari sudah dipindahkan atau tidak tersedia.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#C1440E] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#a83a0c] hover:shadow-md"
        >
          &larr; Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
