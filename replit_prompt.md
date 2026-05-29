# Replit Prompt — Talaba mobil dasturi (3 ta funksiya)

## Loyiha nomi: StudyHub — Talabalar uchun aqlli platforma

---

## Umumiy texnik talablar

Build a **React Native** (Expo) mobile app called **StudyHub** with a clean bottom tab navigation containing 3 screens. Use **Supabase** for the database and auth. Use the **Anthropic Claude API** (`claude-sonnet-4-20250514`) for AI features. All UI text must be in **Uzbek language**. Design should be modern, dark-accented with a purple/indigo color scheme. Use `expo-router` for navigation.

---

## SCREEN 1 — Bilimlar Jangi (Knowledge Battle)

### What it does:
A real-time quiz battle game where students challenge each other and answer questions together.

### Step-by-step build instructions:

1. **Lobby screen**
   - Show a "Jang boshlash" (Start Battle) button
   - User enters a room code OR generates a new one (4-digit random code)
   - Show a waiting screen: "Raqibni kutmoqda..." with animated dots
   - Use Supabase Realtime channels to sync 2 players joining the same room code

2. **Question generation (AI-powered)**
   - When both players join, call Claude API with this system prompt:
     ```
     Siz o'zbek tilida talabalar uchun viktorina savollarini yaratasiz. 
     Faqat JSON formatida javob bering. Hech qanday qo'shimcha matn yozmang.
     Format: {"questions": [{"question": "savol matni", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "tushuntirish"}]}
     ```
   - User prompt: `O'zbek tili, matematika, tarix, biologiya aralash 10 ta savol yarat. Har savol uchun 4 ta variant, to'g'ri javob indeksi (0-3), va qisqa o'zbekcha tushuntirish`
   - Parse JSON response and store questions in Supabase for the room

3. **Battle screen**
   - Show question text + 4 option buttons
   - 30-second countdown timer per question (animated circular progress bar)
   - Both players answer simultaneously — answers sync via Supabase Realtime
   - After both answer (or timer ends): highlight correct answer in green, wrong in red
   - Show +10 points for correct, 0 for wrong, speed bonus: +5 if answered in under 10 seconds
   - Show both players' scores side by side after each question

4. **Results screen**
   - Show winner with trophy icon, final scores, "Qayta o'ynash" button
   - Save match result to Supabase `battles` table: (player1_id, player2_id, winner_id, score1, score2, date)

### Supabase tables needed:
```sql
rooms (id, code, player1_id, player2_id, status, questions_json, created_at)
battles (id, player1_id, player2_id, winner_id, score1, score2, created_at)
```

---

## SCREEN 2 — Skill Barter (Ko'nikma Almashuv)

### What it does:
An anonymous marketplace where students offer a skill they know and request a skill they need. No money — only knowledge exchange.

### Step-by-step build instructions:

1. **My offer card**
   - At the top: two text inputs styled as cards
     - "Men bilaman:" (I know) — e.g., "Python dasturlash"
     - "Menga kerak:" (I need) — e.g., "Ingliz tili B2"
   - "E'lon berish" (Post offer) button — saves to Supabase anonymously (no name shown, only user_id hashed)

2. **Feed screen**
   - Show all active offers as swipeable cards (like Tinder cards)
   - Each card shows: "Biladi: X" and "Kerak: Y" and a colored tag for category
   - Categories auto-detected: if offer text contains "dastur/kod/python/java" → tag = "Texnologiya"; "til/ingliz/nemis/arab" → tag = "Til"; else → "Boshqa"
   - "Mos keladi" button: if another user's "Kerak" matches your "Bilaman" keyword → highlight card with a green glow border

3. **Match & Chat**
   - When user taps "Bog'lanish" (Connect): send anonymous match request via Supabase
   - If the other user accepts → create a Supabase Realtime chat room between the two
   - Simple chat UI: message bubbles, send button
   - Both users stay anonymous until they mutually agree to reveal names (a "Ismni ochish" toggle button)

4. **My matches tab**
   - List of active matches with last message preview
   - Badge showing unread message count

### Supabase tables needed:
```sql
skill_offers (id, user_id_hash, i_know, i_need, category, is_active, created_at)
matches (id, user1_hash, user2_hash, status, created_at)
messages (id, match_id, sender_hash, text, created_at)
```

---

## SCREEN 3 — AI Vizual Tushuntiruvchi (Visual Explainer)

### What it does:
Student types any topic in Uzbek. The AI generates a simple, visual, step-by-step explanation of how that topic works — as a beautifully rendered SVG diagram with Uzbek labels — displayed directly in the app.

### Step-by-step build instructions:

1. **Input screen**
   - Large centered text input: "Mavzuni kiriting..." (Enter a topic)
   - Placeholder examples rotating every 3 seconds: "Qonning yaratilishi", "Fotosintez jarayoni", "Elektr toki", "Neyronlar ishlashi"
   - Big "Tushuntir" (Explain) button with loading animation

2. **AI call — SVG generation**
   - On button press, call Claude API with this exact system prompt:
     ```
     Siz o'zbek tilida o'quvchilar uchun ilmiy jarayonlarni vizual SVG diagramma sifatida yaratuvchi mutaxasssissiz.
     Foydalanuvchi mavzu yozadi. Siz FAQAT to'liq SVG kodi qaytarasiz. Hech qanday boshqa matn, tushuntirish yoki kod bloki belgisi (```) yozmang. Faqat <svg ...> tegli kod.
     
     SVG talablari:
     - viewBox="0 0 800 600" o'lchami
     - Oq yoki och kulrang fon
     - Har bir qadam to'rtburchak yoki doira shaklida, ichida o'zbekcha qisqa matn (max 4 so'z)
     - Qadamlar orasida strelkalar (marker-end="url(#arrow)")
     - Har bir blok uchun turli rang (pastel: #E8F4FD, #FEF9E7, #EAFAF1, #FDEDEC va hokazo)
     - Pastda 2-3 qatorli o'zbekcha qisqa tushuntirish matni
     - Umumiy vizual sodda, chiroyli va o'quvchiga tushunarli bo'lsin
     - Faqat SVG elementi, boshqa hech narsa
     ```
   - User prompt: `Mavzu: [user input]. Ushbu jarayonning mexanizmini 4-6 qadamda sodda SVG diagramma sifatida o'zbekcha yarat.`

3. **Display screen**
   - Use `react-native-svg` + `SvgXml` component to render the returned SVG string directly
   - Show topic title at top, SVG diagram below, then a "Saqlash" (Save) button
   - "Saqlash" → save SVG string + topic to Supabase `visuals` table for the user
   - Show loading skeleton while AI is generating

4. **History tab**
   - Grid of previously generated diagrams (small thumbnails using SvgXml)
   - Tap to open full screen

### Supabase tables needed:
```sql
visuals (id, user_id, topic, svg_content, created_at)
```

---

## Global setup instructions for Replit

```
1. Create new Replit project: "React Native (Expo)" template
2. Install packages:
   npx expo install expo-router react-native-svg @supabase/supabase-js
   npm install @anthropic-ai/sdk
3. Environment variables (Replit Secrets):
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   ANTHROPIC_API_KEY=your_key
4. File structure:
   /app
     /(tabs)
       /bilimlar-jangi.tsx   ← Screen 1
       /skill-barter.tsx     ← Screen 2
       /vizual.tsx           ← Screen 3
   /lib
     /supabase.ts
     /claude.ts
```

## Design system (apply everywhere)
- Background: `#0F0F1A` (dark navy)
- Primary accent: `#7C3AED` (purple)
- Secondary accent: `#06B6D4` (cyan)
- Cards: `#1A1A2E` with `1px solid #2D2D4A` border
- Font: use `expo-google-fonts` with `Nunito` for Uzbek text readability
- All buttons: rounded `border-radius: 12px`, purple gradient background
- Animations: use `react-native-reanimated` for smooth transitions
