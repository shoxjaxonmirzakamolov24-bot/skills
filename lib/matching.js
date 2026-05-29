// ====================================================================
// MATCHING (mos juftlik topish) algoritmi.
//
// Asosiy g'oya: "double coincidence of wants" — ikki tomonlama moslik.
// Eng yaxshi juftlik: men XOHLAGAN narsani u BERADI,
// VA u XOHLAGAN narsani men BERAMAN.
//
// Bu yerda AI yo'q — bu sof mantiq. AI faqat tushuntirish/maslahat
// uchun ishlatiladi (lib/ai.js). Shunday qilib AI kaliti bo'lmasa ham
// matching ishlayveradi.
// ====================================================================

export function normalizeSkill(s) {
  return String(s || '').trim().toLowerCase();
}

// Ikki ko'nikma ro'yxati o'rtasidagi kesishmani topadi (qisman moslik bilan)
function overlap(listA, listB) {
  const a = (listA || []).map(normalizeSkill).filter(Boolean);
  const b = (listB || []).map(normalizeSkill).filter(Boolean);
  const matches = [];
  for (const x of a) {
    for (const y of b) {
      if (x === y || x.includes(y) || y.includes(x)) {
        matches.push(x);
        break;
      }
    }
  }
  return [...new Set(matches)];
}

// Bitta nomzodni baholaymiz (men = me, nomzod = other)
export function scoreMatch(me, other) {
  // U beradigan narsalardan men xohlaganlari
  const theyGiveIWant = overlap(other.give_skills, me.want_skills);
  // Men beradigan narsalardan ular xohlaganlari
  const iGiveTheyWant = overlap(me.give_skills, other.want_skills);

  const mutual = theyGiveIWant.length > 0 && iGiveTheyWant.length > 0;

  // Ball: ikki tomonlama moslik eng qimmat
  let score = theyGiveIWant.length + iGiveTheyWant.length;
  if (mutual) score += 5; // ikki tomonlama bonus

  return {
    score,
    mutual,
    theyGiveIWant,
    iGiveTheyWant,
  };
}

// Nomzodlar ro'yxatini ball bo'yicha saralaymiz
export function rankMatches(me, candidates) {
  return candidates
    .filter((c) => c.id !== me.id)
    .map((c) => ({ user: c, ...scoreMatch(me, c) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => {
      // Avval ikki tomonlama, keyin ball bo'yicha
      if (a.mutual !== b.mutual) return a.mutual ? -1 : 1;
      return b.score - a.score;
    });
}
