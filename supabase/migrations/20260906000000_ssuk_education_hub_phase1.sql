-- 쑥쌤 교육 운영 허브 1단계
-- 학교 선택 -> 수업 선택 -> 패들렛/자료/결과물 연결 기반

begin;

create extension if not exists pgcrypto;

create table if not exists public.ssuk_schools (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  school_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  description text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.class_boards
  add column if not exists school_id uuid references public.ssuk_schools(id) on delete set null;

alter table public.class_boards
  add column if not exists hub_published boolean not null default false;

create table if not exists public.class_hub_links (
  board_id uuid primary key references public.class_boards(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  report_url text,
  shorts_url text,
  notion_url text,
  updated_at timestamptz not null default now(),
  constraint class_hub_links_report_url_check check (report_url is null or report_url ~ '^https://'),
  constraint class_hub_links_shorts_url_check check (shorts_url is null or shorts_url ~ '^https://'),
  constraint class_hub_links_notion_url_check check (notion_url is null or notion_url ~ '^https://')
);

create index if not exists ssuk_schools_owner_idx on public.ssuk_schools(owner_id);
create index if not exists class_boards_school_idx on public.class_boards(school_id);

alter table public.ssuk_schools enable row level security;
alter table public.class_hub_links enable row level security;

-- 공개 화면은 공개된 학교만 읽고, 선생님은 본인 학교와 링크만 관리한다.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'ssuk_schools' and policyname = 'public_read_published_schools') then
    create policy public_read_published_schools on public.ssuk_schools
      for select to anon, authenticated using (is_published = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'ssuk_schools' and policyname = 'owner_manage_schools') then
    create policy owner_manage_schools on public.ssuk_schools
      for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_hub_links' and policyname = 'owner_manage_hub_links') then
    create policy owner_manage_hub_links on public.class_hub_links
      for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
  end if;
end
$$;
commit;