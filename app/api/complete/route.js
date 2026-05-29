import { getTelegramUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { sendMessage } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// "Almashinuv tugadi" tasdig'i. Ikkala tomon ham tasdiqlasa — completed.
// Bu bizning ENG MUHIM metrikamiz: completion rate.
export async function POST(request) {
  const auth = getTelegramUser(request);
  if (!auth.ok) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { requestId } = await request.json();
  const sb = getSupabase();

  const { data: req } = await sb.from('match_requests').select('*').eq('id', requestId).maybeSingle();
  if (!req) return Response.json({ error: 'not found' }, { status: 404 });

  const uid = auth.user.id;
  if (req.from_user !== uid && req.to_user !== uid) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  const patch = { updated_at: new Date().toISOString() };
  if (req.from_user === uid) patch.from_confirmed = true;
  if (req.to_user === uid) patch.to_confirmed = true;

  const bothConfirmed =
    (req.from_confirmed || patch.from_confirmed) && (req.to_confirmed || patch.to_confirmed);
  if (bothConfirmed) patch.status = 'completed';

  await sb.from('match_requests').update(patch).eq('id', requestId);

  // Boshqa tomonni xabardor qilamiz
  const other = req.from_user === uid ? req.to_user : req.from_user;
  if (!bothConfirmed) {
    await sendMessage(other, '🤝 Hamkoring almashinuvni "tugadi" deb belgiladi. Sen ham tasdiqlasang — yakunlanadi.');
  }

  return Response.json({ ok: true, completed: !!bothConfirmed });
}
