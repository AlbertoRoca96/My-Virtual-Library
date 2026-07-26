export type ReadingStatus = 'owned' | 'reading' | 'wishlist' | 'read';

export type Genre = {
  id: string;
  name: string;
};

export type Profile = {
  id: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  shelfSlug: string | null;
  isPublic: boolean;
  themePreference: string;
  shelfTitle: string | null;
  shelfSubtitle: string | null;
  shelfDescription: string | null;
  readingMood: string | null;
  privateNote: string | null;
  collectionFocus: string | null;
  artworkTitle: string | null;
  highlightOne: string | null;
  highlightTwo: string | null;
  highlightThree: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileInput = {
  displayName?: string;
  bio?: string;
  shelfTitle?: string;
  shelfSubtitle?: string;
  shelfDescription?: string;
  readingMood?: string;
  privateNote?: string;
  collectionFocus?: string;
  artworkTitle?: string;
  highlightOne?: string;
  highlightTwo?: string;
  highlightThree?: string;
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
