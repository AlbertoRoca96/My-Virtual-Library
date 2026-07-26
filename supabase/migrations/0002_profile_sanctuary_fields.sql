alter table public.profiles
  add column if not exists shelf_title text,
  add column if not exists shelf_subtitle text,
  add column if not exists shelf_description text,
  add column if not exists reading_mood text,
  add column if not exists private_note text,
  add column if not exists collection_focus text,
  add column if not exists artwork_title text,
  add column if not exists highlight_one text,
  add column if not exists highlight_two text,
  add column if not exists highlight_three text;
