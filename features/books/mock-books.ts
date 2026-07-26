export type BookCardModel = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  genres: string[];
  coverTone: string;
  status: 'Owned' | 'Reading' | 'Wishlist';
};

export const mockBooks: BookCardModel[] = [
  {
    id: '1',
    title: 'The Secret Garden',
    author: 'Frances Hodgson Burnett',
    publisher: 'Frederick A. Stokes Company',
    genres: ['Classic', 'Children', 'Nature'],
    coverTone: '#B8A06A',
    status: 'Owned',
  },
  {
    id: '2',
    title: 'Rebecca',
    author: 'Daphne du Maurier',
    publisher: 'Victor Gollancz',
    genres: ['Gothic', 'Classic'],
    coverTone: '#6A4B44',
    status: 'Reading',
  },
  {
    id: '3',
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    publisher: 'Ecco Press',
    genres: ['Mythology', 'Romance', 'Historical'],
    coverTone: '#C58658',
    status: 'Wishlist',
  },
];
