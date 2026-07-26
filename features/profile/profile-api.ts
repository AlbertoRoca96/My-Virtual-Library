import { supabase } from '@/lib/supabase';
import { Profile, ProfileInput } from '@/lib/database.types';

const PROFILE_SELECT = `
  id,
  username,
  display_name,
  bio,
  avatar_url,
  shelf_slug,
  is_public,
  theme_preference,
  shelf_title,
  shelf_subtitle,
  shelf_description,
  reading_mood,
  private_note,
  collection_focus,
  artwork_title,
  highlight_one,
  highlight_two,
  highlight_three,
  created_at,
  updated_at
`;

type SupabaseProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  shelf_slug: string | null;
  is_public: boolean;
  theme_preference: string;
  shelf_title: string | null;
  shelf_subtitle: string | null;
  shelf_description: string | null;
  reading_mood: string | null;
  private_note: string | null;
  collection_focus: string | null;
  artwork_title: string | null;
  highlight_one: string | null;
  highlight_two: string | null;
  highlight_three: string | null;
  created_at: string;
  updated_at: string;
};

function mapProfile(row: SupabaseProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    shelfSlug: row.shelf_slug,
    isPublic: row.is_public,
    themePreference: row.theme_preference,
    shelfTitle: row.shelf_title,
    shelfSubtitle: row.shelf_subtitle,
    shelfDescription: row.shelf_description,
    readingMood: row.reading_mood,
    privateNote: row.private_note,
    collectionFocus: row.collection_focus,
    artworkTitle: row.artwork_title,
    highlightOne: row.highlight_one,
    highlightTwo: row.highlight_two,
    highlightThree: row.highlight_three,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return null;

  const { data, error } = await supabase.from('profiles').select(PROFILE_SELECT).eq('id', user.id).single();
  if (error) throw error;

  return mapProfile(data as SupabaseProfileRow);
}

export async function upsertProfile(input: ProfileInput) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('You must be signed in to update your sanctuary.');

  const payload = {
    id: user.id,
    display_name: input.displayName?.trim() || null,
    bio: input.bio?.trim() || null,
    shelf_title: input.shelfTitle?.trim() || null,
    shelf_subtitle: input.shelfSubtitle?.trim() || null,
    shelf_description: input.shelfDescription?.trim() || null,
    reading_mood: input.readingMood?.trim() || null,
    private_note: input.privateNote?.trim() || null,
    collection_focus: input.collectionFocus?.trim() || null,
    artwork_title: input.artworkTitle?.trim() || null,
    highlight_one: input.highlightOne?.trim() || null,
    highlight_two: input.highlightTwo?.trim() || null,
    highlight_three: input.highlightThree?.trim() || null,
  };

  const { data, error } = await supabase.from('profiles').upsert(payload).select(PROFILE_SELECT).single();
  if (error) throw error;

  return mapProfile(data as SupabaseProfileRow);
}
