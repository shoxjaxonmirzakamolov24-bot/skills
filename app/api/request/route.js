import { getTelegramUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { sendMessage } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Almashinuv so'rovini yuborish
export async function POST(request) {
  const auth = getTelegramUser(request);
  if (!auth.ok) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { toUser, message } = await request.json();
  if (!toUser || Number(toUser) === auth.user.id) {
    return Response.json({ error: 'invalid target' }, { status: 400 });
  }

  const sb = getSupabase();

  // Takroriy so'rovni oldini olamiz
  const { data: existing } = await sb
    .from('match_requests')
    .select('id')
    .eq('from_user', auth.user.id)
    .eq('to_user', toUser)
    .in('status', ['pending', 'accepted'])
    .maybeSingle();
  if (existing) return Response.json({ ok: true, duplicate: true });

  const { data, error } = await sb
    .from('match_requests')
    .insert({ from_user: auth.user.id, to_user: toUser, message: (message || '').slice(0, 300), status: 'pending' })
    .select()
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Qabul qiluvchiga Telegram orqali bildirishnoma
  const { data: me } = await sb.from('users').select('first_name').eq('id', auth.user.id).maybeSingle();
  await sendMessage(
    toUser,
    `🔔 <b>${me?.first_name || 'Kimdir'}</b> senga ko'nikma almashinuvni taklif qildi!`,
    { inline_keyboard: [[{ text: '👀 Ko\'rish', web_app: { url: process.env.NEXT_PUBLIC_APP_URL || '' } }]] }
  );

  return Response.json({ ok: true, request: data });
}

// So'rovni qabul qilish yoki rad etish
export async function PATCH(request) {
  const auth = getTelegramUser(request);
  if (!auth.ok) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { requestId, action } = await request.json();
  const sb = getSupabase();

  const { data: req } = await sb.from('match_requests').select('*').eq('id', requestId).maybeSingle();
  if (!req) return Response.json({ error: 'not found' }, { status: 404 });
  if (req.to_user !== auth.user.id) return Response.json({ error: 'forbidden' }, { status: 403 });

  const status = action === 'accept' ? 'accepted' : 'declined';
  await sb.from('match_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', requestId);

  if (action === 'accept') {
    const { data: me } = await sb.from('users').select('first_name').eq('id', auth.user.id).maybeSingle();
    await sendMessage(
      req.from_user,
      `✅ <b>${me?.first_name || 'Foydalanuvchi'}</b> taklifingni qabul qildi! Endi kelishib oling.`,
      { inline_keyboard: [[{ text: '💬 Ochish', web_app: { url: process.env.NEXT_PUBLIC_APP_URL || '' } }]] }
    );
  }

  return Response.json({ ok: true, status });
}
