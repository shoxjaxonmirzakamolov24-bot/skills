import { getTelegramUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { scoreMatch } from '@/lib/matching';
import { getMatchInsight } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// AI tavsiya: nega ular mos keladi + birinchi xabar matni
export async function POST(request) {
  const auth = getTelegramUser(request);
  if (!auth.ok) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { otherId } = await request.json();
  const sb = getSupabase();

  const { data: me } = await sb.from('users').select('*').eq('id', auth.user.id).maybeSingle();
  const { data: other } = await sb.from('users').select('*').eq('id', otherId).maybeSingle();
  if (!me || !other) return Response.json({ error: 'not found' }, { status: 404 });

  const m = scoreMatch(me, other);
  const insight = await getMatchInsight(me, other, m);
  return Response.json(insight);
}
