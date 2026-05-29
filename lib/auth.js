import { validateInitData } from '@/lib/telegram';

// ====================================================================
// Har bir API so'rovida foydalanuvchini aniqlash.
// Brauzer (Mini App) "X-Telegram-Init-Data" sarlavhasini yuboradi,
// biz uni serverda tekshiramiz.
//
// TEST REJIMI: agar ALLOW_DEV_AUTH=1 bo'lsa, Telegram'siz ham
// "X-Dev-User-Id" sarlavhasi orqali sinab ko'rish mumkin.
// (Faqat ishlab chiqishda; production'da OCHMA.)
// ====================================================================

export function getTelegramUser(request) {
  if (process.env.ALLOW_DEV_AUTH === '1') {
    const devId = request.headers.get('x-dev-user-id');
    if (devId) {
      return {
        ok: true,
        user: {
          id: Number(devId),
          first_name: 'Test' + devId,
          username: 'test_' + devId,
        },
      };
    }
  }

  const initData = request.headers.get('x-telegram-init-data') || '';
  return validateInitData(initData, process.env.TELEGRAM_BOT_TOKEN);
}
