import crypto from 'crypto';

// ====================================================================
// Telegram Mini App XAVFSIZLIK tekshiruvi.
//
// Mini App ochilganda Telegram brauzerga "initData" degan imzolangan
// satr beradi. Biz har bir so'rovda shu satrni serverda tekshiramiz:
// u haqiqatan Telegram'dan kelganmi yoki kimdir soxta yubordimi?
// Tekshiruv bot tokeni yordamida (HMAC-SHA256) qilinadi.
// Hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
// ====================================================================

export function validateInitData(initData, botToken) {
  if (!botToken) return { ok: false, reason: 'no_token' };
  if (!initData) return { ok: false, reason: 'no_init_data' };

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, reason: 'no_hash' };

  // "hash" VA "signature"dan tashqari barcha maydonlarni alifbo tartibida joylaymiz.
  // MUHIM: Telegram yangi "signature" maydonini hash hisobiga KIRITMAYDI,
  // shuning uchun uni ham chetlatamiz (aks holda tekshiruv doim yiqiladi).
  params.delete('hash');
  params.delete('signature');
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');

  // secret_key = HMAC_SHA256(bot_token, "WebAppData")
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computedHash !== hash) return { ok: false, reason: 'bad_hash' };

  // Imzo to'g'ri — foydalanuvchi ma'lumotini ajratib olamiz
  let user = null;
  try {
    user = JSON.parse(params.get('user'));
  } catch (e) {
    return { ok: false, reason: 'bad_user' };
  }

  // auth_date juda eski bo'lsa (24 soatdan ortiq) rad etamiz
  const authDate = Number(params.get('auth_date') || 0);
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (authDate && ageSeconds > 60 * 60 * 24) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, user };
}

// Telegram bot orqali oddiy xabar yuborish (bildirishnomalar uchun)
export async function sendMessage(chatId, text, replyMarkup) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });
  } catch (e) {
    console.error('sendMessage error', e);
  }
}
