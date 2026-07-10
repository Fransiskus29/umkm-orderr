import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { umkm_nama, order_id, nama_pelanggan, total, items, catatan } = body;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ ok: false, error: "Telegram not configured" }, { status: 500 });
  }

  const itemList = (items ?? [])
    .map((it: { qty: number; nama: string; harga: number }) => `  ${it.qty}x ${it.nama} — Rp${it.harga.toLocaleString("id-ID")}`)
    .join("\n");

  const text = `🛒 *Pesanan Baru!*

🏪 *Toko:* ${umkm_nama}
📋 *Order:* #${order_id.slice(0, 8).toUpperCase()}
👤 *Pelanggan:* ${nama_pelanggan}
💰 *Total:* Rp${total.toLocaleString("id-ID")}

*Item:*
${itemList}${catatan ? `\n📝 *Catatan:* ${catatan}` : ""}

_Buka dashboard untuk lihat detail._`;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });

  const data = await res.json();
  return NextResponse.json({ ok: data.ok });
}
