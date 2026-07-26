import { z } from 'zod';

export const bookFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  author: z.string().trim().min(1, 'Author is required'),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  readingStatus: z.enum(['owned', 'reading', 'wishlist', 'read']),
  genres: z.string().refine(
    (value) => value.split(',').map((genre) => genre.trim()).filter(Boolean).length <= 3,
    'Use up to 3 genres only'
  ),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;

export function parseGenreString(value: string) {
  return value
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean)
    .slice(0, 3);
}
