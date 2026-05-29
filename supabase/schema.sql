-- ====================================================================
-- SkillSwap ma'lumotlar bazasi sxemasi (Supabase / PostgreSQL)
-- Buni Supabase'da "SQL Editor" ichiga nusxalab "Run" bosasan.
-- ====================================================================

-- 1) FOYDALANUVCHILAR
-- Har bir foydalanuvchi Telegram orqali kiradi, shuning uchun
-- asosiy kalit (id) = Telegram user id.
create table if not exists users (
  id            bigint primary key,            -- Telegram user id
  username      text,                          -- Telegram @username (bo'lishi shart emas)
  first_name    text,
  language      text default 'uz',
  level         text default 'beginner',       -- beginner | intermediate | advanced
  bio           text default '',
  give_skills   text[] default '{}',           -- "beraman" ko'nikmalari
  want_skills   text[] default '{}',           -- "olaman" ko'nikmalari
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2) MATCH (ALMASHINUV) SO'ROVLARI
create table if not exists match_requests (
  id             uuid primary key default gen_random_uuid(),
  from_user      bigint not null references users(id) on delete cascade,
  to_user        bigint not null references users(id) on delete cascade,
  message        text default '',
  status         text default 'pending',       -- pending | accepted | declined | completed
  from_confirmed boolean default false,         -- jo'natuvchi "tugadi" dedi
  to_confirmed   boolean default false,         -- qabul qiluvchi "tugadi" dedi
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index if not exists idx_requests_to_user on match_requests(to_user);
create index if not exists idx_requests_from_user on match_requests(from_user);

-- 3) BAHOLAR (REVIEW)
create table if not exists reviews (
  id           uuid primary key default gen_random_uuid(),
  request_id   uuid references match_requests(id) on delete cascade,
  reviewer_id  bigint not null references users(id) on delete cascade,
  reviewee_id  bigint not null references users(id) on delete cascade,
  rating       int not null check (rating between 1 and 5),
  comment      text default '',
  created_at   timestamptz default now()
);

create index if not exists idx_reviews_reviewee on reviews(reviewee_id);

-- ====================================================================
-- XAVFSIZLIK HAQIDA IZOH:
-- Bu ilova serverdan "service_role" kaliti bilan ulanadi va barcha
-- so'rovlar Telegram imzosi tekshirilgandan keyin amalga oshadi.
-- Shuning uchun jadvallarni to'g'ridan-to'g'ri brauzerdan ochmaymiz.
-- (Row Level Security murakkabligini MVP bosqichida qo'shmaymiz.)
-- ====================================================================
