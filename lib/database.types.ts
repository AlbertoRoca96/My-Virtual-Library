export type ReadingStatus = 'owned' | 'reading' | 'wishlist' | 'read';

export type Genre = {
  id: string;
  name: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  publisher: string | null;
  isbn10: string | null;
  isbn13: string | null;
  description: string | null;
  coverUrl: string | null;
  publishedDate: string | null;
  pageCount: number | null;
  readingStatus: ReadingStatus;
  genres: Genre[];
  createdAt: string;
  updatedAt: string;
};

export type BookInput = {
  title: string;
  author: string;
  publisher?: string;
  isbn?: string;
  description?: string;
  readingStatus?: ReadingStatus;
  genres: string[];
};
