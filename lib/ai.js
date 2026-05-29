// ====================================================================
// AI INTEGRATSIYASI (OpenAI).
//
// Bu funksiya ikki foydalanuvchi NEGA bir-biriga mos kelishini
// tushuntiradi va birinchi xabar (ice-breaker) taklif qiladi.
//
// MUHIM: OPENAI_API_KEY bo'lmasa — app ishdan to'xtamaydi.
// Oddiy, tayyor matn qaytaradi. Kalit qo'shilsa — AI matn yozadi.
// Shunday qilib avval app'ni AI'siz ishga tushirib, keyin AI qo'shasan.
// ====================================================================

function fallbackInsight(me, other, m) {
  const give = (m.theyGiveIWant || []).join(', ') || 'ko\'nikma';
  const want = (m.iGiveTheyWant || []).join(', ') || 'ko\'nikma';
  return {
    reason: `${other.first_name} senga "${give}" bo'yicha yordam bera oladi, sen esa unga "${want}" bo'yicha. Bu adolatli almashinuv.`,
    icebreaker: `Salom ${other.first_name}! Men "${want}" bo'yicha yordam bera olaman. Evaziga "${give}" o'rganmoqchiman. Almashsakmi?`,
  };
}

export async function getMatchInsight(me, other, m) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackInsight(me, other, m);

  const prompt = `Sen ko'nikma almashinuv platformasidagi yordamchisan. Ikki odam mos keldi.
FOYDALANUVCHI: ${me.first_name}, beradi: ${(me.give_skills || []).join(', ')}, xohlaydi: ${(me.want_skills || []).join(', ')}.
NOMZOD: ${other.first_name}, beradi: ${(other.give_skills || []).join(', ')}, xohlaydi: ${(other.want_skills || []).join(', ')}.

Quyidagini O'ZBEK tilida, qisqa qaytar (JSON formatda):
{"reason": "1 jumla: nega ular mos keladi", "icebreaker": "1 qisqa do'stona birinchi xabar matni"}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) return fallbackInsight(me, other, m);

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    return {
      reason: parsed.reason || fallbackInsight(me, other, m).reason,
      icebreaker: parsed.icebreaker || fallbackInsight(me, other, m).icebreaker,
    };
  } catch (e) {
    console.error('AI insight error', e);
    return fallbackInsight(me, other, m);
  }
}
