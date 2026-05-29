# 📘 SkillSwap — To'liq O'rnatish Qo'llanmasi

> Bu qo'llanma **dasturchi bo'lmagan** odam uchun yozilgan.
> Hech qanday kod yozishing shart emas — faqat saytlarda tugma bosasan
> va ba'zi qiymatlarni nusxalab joylaysan. Hammasi **bepul** tariflarda ishlaydi.

SkillSwap — bu **Telegram Mini App**: odamlar pulsiz, bilim evaziga bilim almashadi.
(masalan: dizayn o'rgatasan → evaziga ingliz tili o'rganasan.)

---

## 🧩 Nima kerak bo'ladi (hammasi bepul)

4 ta hisob (account) ochasan. Hammasi bepul boshlanadi:

1. **GitHub** — kod shu yerda turadi → https://github.com
2. **Vercel** — ilovani internetga chiqaradi (hosting) → https://vercel.com
3. **Supabase** — ma'lumotlar bazasi → https://supabase.com
4. **Telegram** — bot va Mini App uchun (allaqachon bor)
5. **OpenAI** — AI uchun (ixtiyoriy, keyin qo'shsa ham bo'ladi) → https://platform.openai.com

⏱️ Hammasi taxminan **30–45 daqiqa** vaqt oladi.

---

## 1️⃣ QADAM — Telegram bot yaratish

1. Telegram'da **@BotFather** ni top va `/start` bos.
2. `/newbot` yoz. Bot nomi va username so'raydi (username `_bot` bilan tugashi kerak, masalan `skillswap_demo_bot`).
3. BotFather senga **TOKEN** beradi — masalan:
   `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   👉 Buni nusxalab, bir joyga saqlab qo'y. Bu **TELEGRAM_BOT_TOKEN**.
4. Bot **username**'ini ham yozib qo'y (masalan `skillswap_demo_bot`). Bu **TELEGRAM_BOT_USERNAME**.

> ⚠️ Tokenni hech kimga berma. U — botingning paroli.

---

## 2️⃣ QADAM — Ma'lumotlar bazasi (Supabase)

1. https://supabase.com → **Start your project** → GitHub bilan kir.
2. **New project** → nom ber, parol o'ylab top (saqlab qo'y), region tanla → **Create**.
3. 1-2 daqiqa kutilsin (baza tayyorlanadi).
4. Chap menyuda **SQL Editor** → **New query**.
5. Loyihadagi `supabase/schema.sql` faylini ochib, ichidagi HAMMA matnni nusxala va shu yerga joylab **Run** bos.
   ✅ "Success" chiqsa — jadvallar yaratildi.
6. Chap menyuda **Project Settings → API**:
   - **Project URL** ni nusxala → bu **NEXT_PUBLIC_SUPABASE_URL**
   - **service_role** kalitini nusxala (yashirin, "Reveal" bos) → bu **SUPABASE_SERVICE_ROLE_KEY**

> ⚠️ `service_role` kaliti — eng maxfiy narsa. Faqat shu yerda ishlatiladi.

---

## 3️⃣ QADAM — Kodni GitHub'ga joylash

**Variant A (eng oson — sayt orqali):**
1. https://github.com → ro'yxatdan o't / kir.
2. O'ng yuqorida **+ → New repository** → nom ber (masalan `skillswap`) → **Create**.
3. Yangi sahifada **uploading an existing file** havolasini bos.
4. Bu loyihaning HAMMA fayllarini (papkasi bilan) sudrab tashla (drag & drop) → **Commit changes**.

> Eslatma: `node_modules` papkasini yuklama (u kerak emas, Vercel o'zi o'rnatadi).

---

## 4️⃣ QADAM — Internetga chiqarish (Vercel)

1. https://vercel.com → **Sign up** → GitHub bilan kir.
2. **Add New → Project** → ro'yxatdan `skillswap` repozitoriyasini **Import** qil.
3. **Environment Variables** bo'limiga quyidagilarni birma-bir qo'sh
   (nom = qiymat ko'rinishida):

   | Nom | Qiymat |
   |-----|--------|
   | `TELEGRAM_BOT_TOKEN` | BotFather bergan token |
   | `TELEGRAM_BOT_USERNAME` | bot username (@ siz) |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role kaliti |
   | `NEXT_PUBLIC_APP_URL` | hozircha bo'sh qoldir (5-qadamdan keyin to'ldirasan) |
   | `OPENAI_API_KEY` | hozircha bo'sh (ixtiyoriy, 6-qadam) |

4. **Deploy** bos. 1-2 daqiqada tayyor bo'ladi.
5. Vercel senga manzil beradi, masalan: `https://skillswap-xxxx.vercel.app`
   👉 Buni nusxala.
6. **Settings → Environment Variables** ga qaytib, `NEXT_PUBLIC_APP_URL` ga shu manzilni qo'y → saqla.
7. **Deployments → ... → Redeploy** bos (yangilanish kuchga kirishi uchun).

---

## 5️⃣ QADAM — Botni Mini App'ga ulash

Ikki narsa qilamiz: **(a) tugmani ulaymiz**, **(b) bildirishnomalar uchun webhook'ni ulaymiz**.

### (a) Mini App tugmasi
1. **@BotFather** → `/mybots` → botingni tanla → **Bot Settings → Menu Button → Configure menu button**.
2. URL so'raydi → Vercel manzilingni yoz (`https://skillswap-xxxx.vercel.app`).
3. Tugma nomini yoz (masalan: `Ochish`).

Endi botda pastda "Ochish" tugmasi chiqadi va Mini App ochiladi. 🎉

### (b) Webhook (bildirishnomalar ishlashi uchun)
Brauzerda quyidagi manzilni och (qiymatlarni almashtir):

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://skillswap-xxxx.vercel.app/api/bot
```

- `<TOKEN>` o'rniga bot tokeningni qo'y.
- manzil oxiri `/api/bot` bo'lishi shart.

`{"ok":true,...}` chiqsa — tayyor. Endi `/start` yozsang, bot tugma bilan javob beradi.

---

## 6️⃣ QADAM — AI'ni yoqish (ixtiyoriy, keyin ham bo'ladi)

AI **shart emas** — usiz ham ilova ishlaydi (oddiy, tayyor tavsiya matnlari bilan).
AI qo'shsang — moslik sababini va birinchi xabarni aqlli yozadi.

1. https://platform.openai.com → kir → **API Keys → Create new secret key**.
2. Kalitni nusxala (`sk-...`).
3. Vercel → **Settings → Environment Variables** → `OPENAI_API_KEY` ga qo'y → saqla → **Redeploy**.

> 💡 OpenAI ozgina pullik (har bir tavsiya ~0.01 sentdan kam, `gpt-4o-mini` modeli).
> Hisobingda kichik limit qo'yib qo'ysang — xavfsiz bo'ladi.

---

## ✅ TEKSHIRISH

1. Telegram'da botingni och → `/start` → **Ochish** tugmasini bos.
2. Profil to'ldir: "beraman" va "olaman" ko'nikmalarini yoz.
3. Sinash uchun **ikkinchi Telegram akkaunt** (yoki do'sting) bilan ham kir va boshqa profil yarat — masalan biri "dizayn beraman, ingliz tili olaman", ikkinchisi teskari.
4. "Mosliklar" bo'limida bir-biringizni ko'rasiz → **So'rov yuborish** → ikkinchisida "So'rovlar"da qabul qil → **Telegram'da yozish** → kelishib oling → **Tugadi** → baholang.

---

## 🤖 AI QANDAY ISHLAYDI (tushuntirish)

- Mosliklarni **AI topmaydi** — uni oddiy mantiq topadi (`lib/matching.js`):
  "men xohlagan narsani u beradimi, va u xohlagan narsani men beramanmi?"
- AI faqat **tushuntiradi va xabar yozadi** (`lib/ai.js`).
- AI chaqiruvi: ilova OpenAI'ga foydalanuvchilar haqida qisqa ma'lumot yuboradi,
  OpenAI esa "nega mos kelishadi" + "birinchi xabar" matnini qaytaradi.
- AI'ni boshqa modelga almashtirish: `lib/ai.js` ichida `model: 'gpt-4o-mini'` ni o'zgartirasan.

---

## ❓ Muammolar

| Muammo | Yechim |
|--------|--------|
| Mini App ochilmayapti | `NEXT_PUBLIC_APP_URL` to'g'rimi? Redeploy qilganmisan? |
| "unauthorized" xato | Ilovani **Telegram ichidan** ochyapsanmi? Brauzerdan to'g'ridan ochilmaydi. |
| Bildirishnoma kelmayapti | Webhook o'rnatildimi (5b qadam)? `getWebhookInfo` bilan tekshir. |
| Baza xatosi | `schema.sql` ni Supabase'da Run qildingmi? Kalitlar to'g'rimi? |
| Moslik chiqmayapti | Kamida 2 xil profil kerak (biri beradi, biri xohlaydi). |

---

## 🗺️ Keyingi qadamlar (reja bo'yicha)

Bu — **MVP**. Eng muhim vazifa: 50 odamni kiritib, **"completion rate"** (almashinuv oxirigacha yetkazilishi) ni o'lchash.
Agar ≥50% bo'lsa — kredit tizimi va monetizatsiyaga o'tamiz. Aks holda — modelni qayta ko'ramiz.

Omad! 🚀
