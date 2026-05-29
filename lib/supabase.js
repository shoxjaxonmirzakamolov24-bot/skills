import { createClient } from '@supabase/supabase-js';

// ====================================================================
// Supabase (ma'lumotlar bazasi) ulanishi.
// FAQAT serverda ishlatiladi — "service_role" kaliti maxfiy.
// ====================================================================

let _client = null;

export function getSupabase() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase sozlanmagan. NEXT_PUBLIC_SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY ni to\'ldiring.'
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _client;
}
