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

type OpenLibrarySearchDoc = {
  title?: string;
  author_name?: string[];
  publisher?: string[];
  subject?: string[];
  first_publish_year?: number;
  isbn?: string[];
};

function buildDraftFromMetadata(input: {
  title?: string;
  authors?: string[];
  publishers?: string[];
  subjects?: string[];
  publishDate?: string;
  notes?: string;
  isbn?: string;
}): BookLookupDraft {
  const authors = (input.authors ?? []).filter(Boolean).join(', ');
  const publishers = (input.publishers ?? []).filter(Boolean).join(', ');
  const subjects = (input.subjects ?? []).filter(Boolean).slice(0, 3);
  const descriptionParts = [input.publishDate, input.notes].filter(Boolean);

  return {
    title: input.title ?? '',
    author: authors,
    publisher: publishers,
    isbn: sanitizeIsbn(input.isbn ?? ''),
    description: descriptionParts.join(' • '),
    genres: parseGenreString(subjects.join(', ')).join(', '),
    readingStatus: 'owned',
  };
}

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

  return buildDraftFromMetadata({
    title: book.title,
    authors: (book.authors ?? []).map((author) => author.name ?? '').filter(Boolean),
    publishers: (book.publishers ?? []).map((publisher) => publisher.name ?? '').filter(Boolean),
    subjects: (book.subjects ?? []).map((subject) => subject.name ?? '').filter(Boolean),
    publishDate: book.publish_date,
    notes: typeof book.notes === 'string' ? book.notes : book.notes?.value,
    isbn,
  });
}

export async function fetchBookDraftByClues(input: {
  title?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
}): Promise<BookLookupDraft | null> {
  const title = input.title?.trim() ?? '';
  const author = input.author?.trim() ?? '';
  const publisher = input.publisher?.trim() ?? '';
  const isbn = sanitizeIsbn(input.isbn ?? '');

  if (!title && !author && !publisher && !isbn) {
    return null;
  }

  const params = new URLSearchParams();
  params.set('limit', '5');
  if (title) params.set('title', title);
  if (author) params.set('author', author);
  if (publisher) params.set('publisher', publisher);
  if (isbn) params.set('isbn', isbn);

  const response = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Cover clue lookup failed.');
  }

  const payload = (await response.json()) as { docs?: OpenLibrarySearchDoc[] };
  const [book] = payload.docs ?? [];
  if (!book) {
    return null;
  }

  return buildDraftFromMetadata({
    title: book.title,
    authors: book.author_name,
    publishers: book.publisher?.slice(0, 2),
    subjects: book.subject,
    publishDate: book.first_publish_year ? String(book.first_publish_year) : undefined,
    isbn: isbn || book.isbn?.[0],
  });
}
