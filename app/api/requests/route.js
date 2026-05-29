import { getTelegramUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Mening barcha so'rovlarim: kelgan (incoming) va yuborilgan (outgoing)
export async function GET(request) {
  const auth = getTelegramUser(request);
  if (!auth.ok) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const sb = getSupabase();
  const uid = auth.user.id;

  const { data: reqs } = await sb
    .from('match_requests')
    .select('*')
    .or(`from_user.eq.${uid},to_user.eq.${uid}`)
    .order('created_at', { ascending: false });

  const list = reqs || [];

  // Qarama-qarshi tomon ma'lumotlarini olamiz
  const ids = [...new Set(list.flatMap((r) => [r.from_user, r.to_user]))];
  const { data: users } = ids.length
    ? await sb.from('users').select('id, first_name, username, give_skills, want_skills').in('id', ids)
    : { data: [] };
  const umap = Object.fromEntries((users || []).map((u) => [u.id, u]));

  const incoming = list
    .filter((r) => r.to_user === uid)
    .map((r) => ({ ...r, other: umap[r.from_user] || null, iAmFrom: false }));
  const outgoing = list
    .filter((r) => r.from_user === uid)
    .map((r) => ({ ...r, other: umap[r.to_user] || null, iAmFrom: true }));

  return Response.json({ incoming, outgoing });
}
