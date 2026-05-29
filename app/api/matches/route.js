import { getTelegramUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { rankMatches } from '@/lib/matching';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Men uchun mos juftliklarni topadi (ball bo'yicha saralangan)
export async function GET(request) {
  const auth = getTelegramUser(request);
  if (!auth.ok) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const sb = getSupabase();

  const { data: me } = await sb.from('users').select('*').eq('id', auth.user.id).maybeSingle();
  if (!me) return Response.json({ matches: [] });

  const { data: others } = await sb.from('users').select('*').eq('is_active', true);

  const ranked = rankMatches(me, others || [])
    .slice(0, 20)
    .map((m) => ({
      id: m.user.id,
      first_name: m.user.first_name,
      username: m.user.username,
      level: m.user.level,
      bio: m.user.bio,
      give_skills: m.user.give_skills,
      want_skills: m.user.want_skills,
      mutual: m.mutual,
      theyGiveIWant: m.theyGiveIWant,
      iGiveTheyWant: m.iGiveTheyWant,
      score: m.score,
    }));

  return Response.json({ matches: ranked });
}
