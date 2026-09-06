-- 교육 허브 공개 화면에서 공개 학교의 공개 수업과 연결 주소를 읽을 수 있게 한다.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_boards' and policyname = 'public_read_published_hub_boards') then
    create policy public_read_published_hub_boards on public.class_boards
      for select to anon, authenticated
      using (
        hub_published = true
        and exists (
          select 1 from public.ssuk_schools s
          where s.id = class_boards.school_id and s.is_published = true
        )
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_hub_links' and policyname = 'public_read_published_hub_links') then
    create policy public_read_published_hub_links on public.class_hub_links
      for select to anon, authenticated
      using (
        exists (
          select 1
          from public.class_boards b
          join public.ssuk_schools s on s.id = b.school_id
          where b.id = class_hub_links.board_id
            and b.hub_published = true
            and s.is_published = true
        )
      );
  end if;
end
$$;
