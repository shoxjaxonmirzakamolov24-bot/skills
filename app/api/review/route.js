import { getTelegramUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Almashinuvdan keyin hamkorni baholash (1-5 yulduz)
export async function POST(request) {
  const auth = getTelegramUser(request);
  if (!auth.ok) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { requestId, rating, comment } = await request.json();
  const sb = getSupabase();

  const { data: req } = await sb.from('match_requests').select('*').eq('id', requestId).maybeSingle();
  if (!req) return Response.json({ error: 'not found' }, { status: 404 });

  const uid = auth.user.id;
  if (req.from_user !== uid && req.to_user !== uid) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  const reviewee = req.from_user === uid ? req.to_user : req.from_user;

  // Bir so'rov uchun bir marta baho
  const { data: existing } = await sb
    .from('reviews')
    .select('id')
    .eq('request_id', requestId)
    .eq('reviewer_id', uid)
    .maybeSingle();
  if (existing) return Response.json({ ok: true, duplicate: true });

  const safeRating = Math.max(1, Math.min(5, Number(rating) || 5));
  const { error } = await sb.from('reviews').insert({
    request_id: requestId,
    reviewer_id: uid,
    reviewee_id: reviewee,
    rating: safeRating,
    comment: (comment || '').slice(0, 300),
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
