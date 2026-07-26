import { supabase } from '@/lib/supabase';
import { Book, BookInput, Genre } from '@/lib/database.types';

const BOOK_SELECT = `
  id,
  title,
  author,
  publisher,
  isbn_10,
  isbn_13,
  description,
  cover_url,
  published_date,
  page_count,
  reading_status,
  created_at,
  updated_at,
  book_genres (
    genres (
      id,
      name
    )
  )
`;

type SupabaseBookRow = {
  id: string;
  title: string;
  author: string;
  publisher: string | null;
  isbn_10: string | null;
  isbn_13: string | null;
  description: string | null;
  cover_url: string | null;
  published_date: string | null;
  page_count: number | null;
  reading_status: Book['readingStatus'];
  created_at: string;
  updated_at: string;
  book_genres: { genres: Genre[] | null }[] | null;
};

function normalizeGenres(rawGenres: string[]) {
  return [...new Set(rawGenres.map((genre) => genre.trim()).filter(Boolean))].slice(0, 3);
}

function mapBook(row: SupabaseBookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    publisher: row.publisher,
    isbn10: row.isbn_10,
    isbn13: row.isbn_13,
    description: row.description,
    coverUrl: row.cover_url,
    publishedDate: row.published_date,
    pageCount: row.page_count,
    readingStatus: row.reading_status,
    genres: (row.book_genres ?? []).flatMap((entry) => entry.genres ?? []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensureGenres(genreNames: string[]) {
  const names = normalizeGenres(genreNames);

  if (names.length === 0) {
    return [] as Genre[];
  }

  const { error: upsertError } = await supabase.from('genres').upsert(names.map((name) => ({ name })), { onConflict: 'name' });
  if (upsertError) throw upsertError;

  const { data, error } = await supabase.from('genres').select('id, name').in('name', names);
  if (error) throw error;

  return (data ?? []) as Genre[];
}

export async function fetchBooks() {
  const { data, error } = await supabase.from('books').select(BOOK_SELECT).order('created_at', { ascending: false });
  if (error) throw error;

  return (data as SupabaseBookRow[]).map(mapBook);
}

export async function createBook(input: BookInput) {
  const genres = await ensureGenres(input.genres);
  const isbn = input.isbn?.trim() ?? '';
  const cleanedIsbn10 = isbn.length === 10 ? isbn : null;
  const cleanedIsbn13 = isbn.length === 13 ? isbn : null;

  const { data, error } = await supabase
    .from('books')
    .insert({
      title: input.title.trim(),
      author: input.author.trim(),
      publisher: input.publisher?.trim() || null,
      isbn_10: cleanedIsbn10,
      isbn_13: cleanedIsbn13,
      description: input.description?.trim() || null,
      published_date: input.publishedDate?.trim() || null,
      cover_url: input.coverUrl?.trim() || null,
      page_count: input.pageCount ?? null,
      reading_status: input.readingStatus ?? 'owned',
    })
    .select('id')
    .single();

  if (error) throw error;

  if (genres.length > 0) {
    const { error: linkError } = await supabase.from('book_genres').insert(genres.map((genre) => ({ book_id: data.id, genre_id: genre.id })));
    if (linkError) throw linkError;
  }

  const { data: fullBook, error: fullBookError } = await supabase.from('books').select(BOOK_SELECT).eq('id', data.id).single();
  if (fullBookError) throw fullBookError;

  return mapBook(fullBook as SupabaseBookRow);
}

export async function deleteBook(bookId: string) {
  const { error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) throw error;
}
