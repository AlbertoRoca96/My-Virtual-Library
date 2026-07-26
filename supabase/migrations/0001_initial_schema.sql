create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  shelf_slug text unique,
  is_public boolean not null default false,
  theme_preference text not null default 'vintage-cream',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text not null,
  publisher text,
  isbn_10 text,
  isbn_13 text,
  description text,
  cover_url text,
  published_date text,
  page_count integer,
  reading_status text not null default 'owned' check (reading_status in ('owned', 'reading', 'wishlist', 'read')),
  is_public boolean not null default false,
  source text,
  source_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.book_genres (
  book_id uuid not null references public.books(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (book_id, genre_id)
);

create index if not exists books_user_id_idx on public.books(user_id);
create index if not exists books_title_idx on public.books(title);
create index if not exists books_author_idx on public.books(author);
create index if not exists books_publisher_idx on public.books(publisher);
create index if not exists books_reading_status_idx on public.books(reading_status);
create index if not exists genres_name_idx on public.genres(name);
create index if not exists book_genres_genre_id_idx on public.book_genres(genre_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.enforce_max_three_genres()
returns trigger
language plpgsql
as $$
declare
  genre_count integer;
begin
  select count(*)
  into genre_count
  from public.book_genres
  where book_id = new.book_id;

  if genre_count >= 3 then
    raise exception 'A book can have at most 3 genres';
  end if;

  return new;
end;
$$;

create or replace trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace trigger books_set_updated_at
before update on public.books
for each row
execute function public.set_updated_at();

create or replace trigger trg_enforce_max_three_genres
before insert on public.book_genres
for each row
execute function public.enforce_max_three_genres();

create or replace trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.genres enable row level security;
alter table public.book_genres enable row level security;

create policy "profiles_select_own_or_public"
on public.profiles
for select
using (auth.uid() = id or is_public = true);

create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "books_select_own_or_public"
on public.books
for select
using (auth.uid() = user_id or is_public = true);

create policy "books_insert_own"
on public.books
for insert
with check (auth.uid() = user_id);

create policy "books_update_own"
on public.books
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "books_delete_own"
on public.books
for delete
using (auth.uid() = user_id);

create policy "genres_select_authenticated"
on public.genres
for select
to authenticated
using (true);

create policy "genres_insert_authenticated"
on public.genres
for insert
to authenticated
with check (true);

create policy "book_genres_select_visible_books"
on public.book_genres
for select
using (
  exists (
    select 1
    from public.books b
    where b.id = book_genres.book_id
      and (b.user_id = auth.uid() or b.is_public = true)
  )
);

create policy "book_genres_insert_own"
on public.book_genres
for insert
with check (
  exists (
    select 1
    from public.books b
    where b.id = book_genres.book_id
      and b.user_id = auth.uid()
  )
);

create policy "book_genres_delete_own"
on public.book_genres
for delete
using (
  exists (
    select 1
    from public.books b
    where b.id = book_genres.book_id
      and b.user_id = auth.uid()
  )
);
