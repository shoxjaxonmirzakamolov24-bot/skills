import { getTelegramUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Profilni olish
export async function GET(request) {
  const auth = getTelegramUser(request);
  if (!auth.ok) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const sb = getSupabase();
  const { data, error } = await sb
    .from('users')
    .select('*')
    .eq('id', auth.user.id)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ profile: data || null });
}

// Profilni yaratish yoki yangilash
export async function POST(request) {
  const auth = getTelegramUser(request);
  if (!auth.ok) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json();
  const sb = getSupabase();

  const row = {
    id: auth.user.id,
    username: auth.user.username || null,
    first_name: auth.user.first_name || 'Foydalanuvchi',
    language: body.language || 'uz',
    level: body.level || 'beginner',
    bio: (body.bio || '').slice(0, 300),
    give_skills: (body.give_skills || []).map((s) => String(s).trim()).filter(Boolean).slice(0, 10),
    want_skills: (body.want_skills || []).map((s) => String(s).trim()).filter(Boolean).slice(0, 10),
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb.from('users').upsert(row).select().maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ profile: data });
}
