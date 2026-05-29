import { sendMessage } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ====================================================================
// Telegram BOT webhook.
// Telegram har bir yangilanishni (xabar, buyruq) shu manzilga yuboradi.
// Biz "/start" buyrug'iga Mini App'ni ochuvchi tugma bilan javob beramiz.
// ====================================================================
export async function POST(request) {
  let update;
  try {
    update = await request.json();
  } catch (e) {
    return Response.json({ ok: true });
  }

  const msg = update.message;
  if (msg && typeof msg.text === 'string' && msg.text.startsWith('/start')) {
    const url = process.env.NEXT_PUBLIC_APP_URL || '';
    await sendMessage(
      msg.chat.id,
      "👋 <b>SkillSwap</b>'ga xush kelibsiz!\n\nBu yerda ko'nikma almashasiz: pulsiz, faqat bilim evaziga bilim.\nMasalan: dizayn o'rgatasan — evaziga ingliz tili o'rganasan.\n\nBoshlash uchun tugmani bos 👇",
      { inline_keyboard: [[{ text: '🚀 SkillSwap’ni ochish', web_app: { url } }]] }
    );
  }

  return Response.json({ ok: true });
}

// Telegram ba'zan tekshirish uchun GET yuboradi
export async function GET() {
  return Response.json({ ok: true, service: 'skillswap-bot' });
}
