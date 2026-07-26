import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createBook, deleteBook, fetchBooks } from '@/features/books/books-api';
import { BookInput } from '@/lib/database.types';

const booksKey = ['books'];

export function useBooks() {
  return useQuery({
    queryKey: booksKey,
    queryFn: fetchBooks,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BookInput) => createBook(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: booksKey });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => deleteBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: booksKey });
    },
  });
}
