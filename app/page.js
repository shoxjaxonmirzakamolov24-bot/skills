'use client';

import { useEffect, useState, useCallback } from 'react';

// Telegram'dan kelgan imzo (initData) — har bir so'rovda yuboriladi
function getInitData() {
  if (typeof window === 'undefined') return '';
  return window.Telegram?.WebApp?.initData || '';
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': getInitData(),
      ...(opts.headers || {}),
    },
  });
  return res.json();
}

function parseSkills(text) {
  return text.split(',').map((s) => s.trim()).filter(Boolean);
}

function initial(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

function levelLabel(l) {
  return { beginner: 'Boshlang\'ich', intermediate: 'O\'rta', advanced: 'Yuqori' }[l] || '';
}

// Brend sarlavha (gradient banner)
function Brand({ subtitle }) {
  return (
    <header className="brand">
      <div className="brand-logo">🔄</div>
      <div>
        <div className="brand-name">SkillSwap</div>
        <div className="brand-sub">{subtitle || 'Bilim evaziga bilim — pulsiz'}</div>
      </div>
    </header>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [hasTelegram, setHasTelegram] = useState(true);
  const [tab, setTab] = useState('matches');

  const loadProfile = useCallback(async () => {
    const data = await api('/api/profile');
    setProfile(data.profile || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const w = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    if (w) {
      w.ready();
      w.expand();
      try { w.setHeaderColor?.('secondary_bg_color'); } catch (e) {}
    }
    // Telegram tashqarisida ham ishlaydi (dev rejimi yoqilgan bo'lsa)
    if (!getInitData()) setHasTelegram(false);
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="app">
        <div className="center"><div className="spinner" /></div>
      </div>
    );
  }

  // Profil yo'q bo'lsa — onboarding (ro'yxatdan o'tish)
  if (!profile) {
    return (
      <div className="app">
        <ProfileForm
          initial={null}
          onSaved={(p) => { setProfile(p); setTab('matches'); }}
          hasTelegram={hasTelegram}
        />
      </div>
    );
  }

  return (
    <div className="app">
      {tab === 'matches' && <MatchesView profile={profile} />}
      {tab === 'requests' && <RequestsView profile={profile} />}
      {tab === 'profile' && (
        <ProfileForm initial={profile} onSaved={setProfile} hasTelegram={hasTelegram} isEdit />
      )}

      <nav className="tabs">
        <button className={`tab ${tab === 'matches' ? 'active' : ''}`} onClick={() => setTab('matches')}>
          <span className="ic">🔍</span>Mosliklar
        </button>
        <button className={`tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
          <span className="ic">🤝</span>So'rovlar
        </button>
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          <span className="ic">👤</span>Profil
        </button>
      </nav>
    </div>
  );
}

// ====================== PROFIL FORMASI ======================
function ProfileForm({ initial, onSaved, hasTelegram, isEdit }) {
  const [give, setGive] = useState((initial?.give_skills || []).join(', '));
  const [want, setWant] = useState((initial?.want_skills || []).join(', '));
  const [level, setLevel] = useState(initial?.level || 'beginner');
  const [bio, setBio] = useState(initial?.bio || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function save() {
    const giveArr = parseSkills(give);
    const wantArr = parseSkills(want);
    if (!giveArr.length || !wantArr.length) {
      setErr('Iltimos, kamida bitta "beraman" va bitta "olaman" ko\'nikma kirit.');
      return;
    }
    setErr('');
    setSaving(true);
    const data = await api('/api/profile', {
      method: 'POST',
      body: JSON.stringify({ give_skills: giveArr, want_skills: wantArr, level, bio }),
    });
    setSaving(false);
    if (data.profile) onSaved(data.profile);
    else setErr((data.error || 'Xatolik') + (data.reason ? ' — sabab: ' + data.reason : ''));
  }

  return (
    <div>
      <Brand subtitle={isEdit ? 'Profilingni boshqar' : 'Xush kelibsiz!'} />
      <h1>{isEdit ? '👤 Profilim' : '✨ Keling, tanishamiz'}</h1>
      <p className="muted">
        {isEdit
          ? 'Ma\'lumotlaringni yangilashing mumkin.'
          : 'Boshlash uchun nimani bera olishing va nimani olishni xohlashingni yoz.'}
      </p>

      {!hasTelegram && (
        <div className="note warn">
          ⚠️ Ilova Telegram tashqarisida ochildi. To'liq ishlashi uchun uni <b>bot orqali</b> (/start → tugma) oching.
        </div>
      )}

      <label>✅ Men bera olaman (vergul bilan ajrat)</label>
      <input
        type="text"
        value={give}
        onChange={(e) => setGive(e.target.value)}
        placeholder="masalan: logo dizayn, Figma, video montaj"
      />

      <label>🎯 Men olishni xohlayman</label>
      <input
        type="text"
        value={want}
        onChange={(e) => setWant(e.target.value)}
        placeholder="masalan: ingliz tili, Python, copywriting"
      />

      <label>📊 Darajam</label>
      <select value={level} onChange={(e) => setLevel(e.target.value)}>
        <option value="beginner">Boshlang'ich</option>
        <option value="intermediate">O'rta</option>
        <option value="advanced">Yuqori</option>
      </select>

      <label>📝 O'zim haqimda (ixtiyoriy)</label>
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Qisqacha tanishtir..." />

      {err && <p style={{ color: '#dc2626', fontSize: 13 }}>{err}</p>}

      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : 'Davom etish →'}
        </button>
      </div>
    </div>
  );
}

// ====================== MOSLIKLAR ======================
function MatchesView({ profile }) {
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    api('/api/matches').then((d) => setMatches(d.matches || []));
  }, []);

  if (matches === null) return <div className="center"><div className="spinner" /></div>;

  return (
    <div>
      <Brand subtitle="Sizga mos almashinuvlar" />
      <h1>🔍 Mos odamlar</h1>
      <p className="muted">Ikki tomonlama moslik — eng yaxshi almashinuv.</p>
      {matches.length === 0 && (
        <div className="empty">
          <span className="emoji">🌱</span>
          <p><b>Hozircha moslik yo'q</b></p>
          <p className="muted">
            Bu odatda platformada odam kamligidan. Do'stlaringni taklif qil yoki keyinroq qayta tekshir.
          </p>
        </div>
      )}
      {matches.map((m) => (
        <MatchCard key={m.id} m={m} />
      ))}
    </div>
  );
}

function MatchCard({ m }) {
  const [insight, setInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function getAi() {
    setLoadingAi(true);
    const d = await api('/api/insight', { method: 'POST', body: JSON.stringify({ otherId: m.id }) });
    setInsight(d);
    setLoadingAi(false);
  }

  async function sendRequest() {
    setSending(true);
    await api('/api/request', {
      method: 'POST',
      body: JSON.stringify({ toUser: m.id, message: insight?.icebreaker || '' }),
    });
    setSending(false);
    setSent(true);
  }

  return (
    <div className={`card ${m.mutual ? 'mutual' : ''}`}>
      <div className="row between">
        <div className="row">
          <div className="avatar">{initial(m.first_name)}</div>
          <div>
            <strong>{m.first_name}</strong>
            <div className="muted" style={{ fontSize: 12 }}>{levelLabel(m.level)}</div>
          </div>
        </div>
        {m.mutual ? <span className="badge grad">🔁 Ikki tomonlama</span> : <span className="badge gray">Bir tomonlama</span>}
      </div>
      {m.bio && <p className="muted" style={{ margin: '8px 0 0' }}>{m.bio}</p>}

      {m.theyGiveIWant?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <span className="muted">Senga beradi: </span>
          {m.theyGiveIWant.map((s, i) => <span className="chip give" key={i}>{s}</span>)}
        </div>
      )}
      {m.iGiveTheyWant?.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <span className="muted">Sen berasan: </span>
          {m.iGiveTheyWant.map((s, i) => <span className="chip want" key={i}>{s}</span>)}
        </div>
      )}

      {insight && (
        <div className="note" style={{ marginTop: 10 }}>
          <div>🤖 <b>AI:</b> {insight.reason}</div>
          <div style={{ marginTop: 6 }} className="muted">✍️ Taklif: “{insight.icebreaker}”</div>
        </div>
      )}

      <div className="row wrap" style={{ marginTop: 10, gap: 8 }}>
        {!insight && (
          <button className="btn ghost sm" onClick={getAi} disabled={loadingAi}>
            {loadingAi ? '...' : '🤖 AI tavsiya'}
          </button>
        )}
        <button className="btn sm" onClick={sendRequest} disabled={sending || sent}>
          {sent ? '✅ Yuborildi' : sending ? '...' : '🤝 So\'rov yuborish'}
        </button>
      </div>
    </div>
  );
}

// ====================== SO'ROVLAR ======================
function RequestsView({ profile }) {
  const [data, setData] = useState(null);

  const load = useCallback(() => {
    api('/api/requests').then(setData);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (data === null) return <div className="center"><div className="spinner" /></div>;

  const incoming = data.incoming || [];
  const outgoing = data.outgoing || [];

  return (
    <div>
      <Brand subtitle="Almashinuv so'rovlari" />
      <h1>🤝 So'rovlar</h1>

      <h2>📥 Senga kelganlar</h2>
      {incoming.length === 0 && <p className="muted">Hozircha yo'q.</p>}
      {incoming.map((r) => <RequestCard key={r.id} r={r} mine={false} reload={load} />)}

      <h2>📤 Sen yuborganlar</h2>
      {outgoing.length === 0 && <p className="muted">Hozircha yo'q.</p>}
      {outgoing.map((r) => <RequestCard key={r.id} r={r} mine reload={load} />)}
    </div>
  );
}

function statusLabel(s) {
  return { pending: '⏳ Kutilmoqda', accepted: '✅ Qabul qilindi', declined: '❌ Rad etildi', completed: '🎉 Yakunlandi' }[s] || s;
}

function RequestCard({ r, mine, reload }) {
  const [busy, setBusy] = useState(false);
  const other = r.other;

  async function respond(action) {
    setBusy(true);
    await api('/api/request', { method: 'PATCH', body: JSON.stringify({ requestId: r.id, action }) });
    setBusy(false);
    reload();
  }

  async function markComplete() {
    setBusy(true);
    await api('/api/complete', { method: 'POST', body: JSON.stringify({ requestId: r.id }) });
    setBusy(false);
    reload();
  }

  const tgLink = other?.username ? `https://t.me/${other.username}` : null;
  const iConfirmed = mine ? r.from_confirmed : r.to_confirmed;

  return (
    <div className="card">
      <div className="row between">
        <div className="row">
          <div className="avatar">{initial(other?.first_name)}</div>
          <strong>{other?.first_name || 'Foydalanuvchi'}</strong>
        </div>
        <span className="badge blue">{statusLabel(r.status)}</span>
      </div>
      {r.message && <p className="muted" style={{ margin: '6px 0' }}>“{r.message}”</p>}

      {/* Kelgan so'rov — qabul/rad */}
      {!mine && r.status === 'pending' && (
        <div className="row" style={{ gap: 8, marginTop: 10 }}>
          <button className="btn sm" onClick={() => respond('accept')} disabled={busy}>✅ Qabul</button>
          <button className="btn ghost sm" onClick={() => respond('decline')} disabled={busy}>❌ Rad</button>
        </div>
      )}

      {/* Qabul qilingan — Telegram chat + tugatish */}
      {r.status === 'accepted' && (
        <div style={{ marginTop: 10 }}>
          {tgLink ? (
            <a className="btn secondary sm" href={tgLink} target="_blank" rel="noreferrer">💬 Telegram'da yozish</a>
          ) : (
            <p className="muted">Hamkorda @username yo'q — uni Telegram orqali topishing kerak.</p>
          )}
          <div style={{ marginTop: 8 }}>
            <button className="btn ghost sm" onClick={markComplete} disabled={busy || iConfirmed}>
              {iConfirmed ? '⏳ Hamkor tasdig\'i kutilmoqda' : '✔️ Almashinuv tugadi'}
            </button>
          </div>
        </div>
      )}

      {/* Yakunlangan — baholash */}
      {r.status === 'completed' && <ReviewBlock requestId={r.id} reload={reload} />}
    </div>
  );
}

function ReviewBlock({ requestId, reload }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!rating) return;
    setBusy(true);
    await api('/api/review', { method: 'POST', body: JSON.stringify({ requestId, rating, comment }) });
    setBusy(false);
    setDone(true);
  }

  if (done) return <p className="muted" style={{ marginTop: 8 }}>🙏 Bahoyingiz uchun rahmat!</p>;

  return (
    <div style={{ marginTop: 10 }}>
      <div className="divider" />
      <p className="muted">Hamkoringni bahola:</p>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} onClick={() => setRating(n)}>{n <= rating ? '⭐' : '☆'}</span>
        ))}
      </div>
      <textarea
        style={{ marginTop: 8 }}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Izoh (ixtiyoriy)"
      />
      <button className="btn sm" style={{ marginTop: 8 }} onClick={submit} disabled={busy || !rating}>
        Bahoni yuborish
      </button>
    </div>
  );
}
