import { BookFormValues } from '@/features/books/book-form-schema';
import { parseGenreString } from '@/features/books/book-form-schema';
import { sanitizeIsbn } from '@/features/books/isbn';

export type BookLookupDraft = Pick<BookFormValues, 'title' | 'author' | 'publisher' | 'isbn' | 'description' | 'genres' | 'readingStatus'>;

type OpenLibraryBook = {
  title?: string;
  authors?: { name?: string }[];
  publishers?: { name?: string }[];
  subjects?: { name?: string }[];
  publish_date?: string;
  notes?: string | { value?: string };
};

export async function fetchBookDraftByIsbn(rawIsbn: string): Promise<BookLookupDraft | null> {
  const isbn = sanitizeIsbn(rawIsbn);
  if (!isbn) {
    return null;
  }

  const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
  if (!response.ok) {
    throw new Error('Open Library lookup failed.');
  }

  const payload = (await response.json()) as Record<string, OpenLibraryBook>;
  const book = payload[`ISBN:${isbn}`];
  if (!book) {
    return null;
  }

  const authors = (book.authors ?? []).map((author) => author.name).filter(Boolean).join(', ');
  const publishers = (book.publishers ?? []).map((publisher) => publisher.name).filter(Boolean).join(', ');
  const subjects = (book.subjects ?? []).map((subject) => subject.name).filter(Boolean).slice(0, 3);
  const notes = typeof book.notes === 'string' ? book.notes : book.notes?.value;
  const descriptionParts = [book.publish_date, notes].filter(Boolean);

  return {
    title: book.title ?? '',
    author: authors,
    publisher: publishers,
    isbn,
    description: descriptionParts.join(' • '),
    genres: parseGenreString(subjects.join(', ')).join(', '),
    readingStatus: 'owned',
  };
}
