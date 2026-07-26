import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { AuthCard } from '@/features/auth/auth-card';
import { useCreateBook } from '@/features/books/use-books';
import { useAuth } from '@/lib/auth';

const addBookSchema = z.object({
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

type AddBookFormValues = z.infer<typeof addBookSchema>;

export default function AddBookScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const createBook = useCreateBook();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddBookFormValues>({
    resolver: zodResolver(addBookSchema),
    defaultValues: {
      title: '',
      author: '',
      publisher: '',
      isbn: '',
      description: '',
      readingStatus: 'owned',
      genres: '',
    },
  });

  const onSubmit = (values: AddBookFormValues) => {
    createBook.mutate(
      {
        ...values,
        genres: values.genres.split(',').map((genre) => genre.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          Alert.alert('Book saved', 'Your book has been added to Supabase.');
          router.push('/library');
        },
        onError: (error: Error) => {
          Alert.alert('Save failed', error.message);
        },
      }
    );
  };

  if (!user && !loading) {
    return (
      <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24 }}>
        <AuthCard />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24, gap: 24 }}>
      <View className="gap-3 rounded-[28px] border border-line bg-paper p-6">
        <Text className="text-3xl text-ink" style={{ fontFamily: 'Georgia' }}>
          Add a new book
        </Text>
        <Text className="text-base leading-7 text-mist">
          This now submits to Supabase. Genres are comma-separated in the UI and trimmed down to a max of 3 because chaos needs boundaries.
        </Text>
      </View>

      <View className="gap-4 rounded-[28px] border border-line bg-paper p-6">
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField label="Title" value={field.value} onChangeText={field.onChange} placeholder="The Secret Garden" error={errors.title?.message} />
          )}
        />
        <Controller
          control={control}
          name="author"
          render={({ field }) => (
            <TextField label="Author" value={field.value} onChangeText={field.onChange} placeholder="Frances Hodgson Burnett" error={errors.author?.message} />
          )}
        />
        <Controller
          control={control}
          name="publisher"
          render={({ field }) => <TextField label="Publisher" value={field.value ?? ''} onChangeText={field.onChange} placeholder="Publisher name" />}
        />
        <Controller
          control={control}
          name="isbn"
          render={({ field }) => <TextField label="ISBN" value={field.value ?? ''} onChangeText={field.onChange} placeholder="10 or 13 digit ISBN" autoCapitalize="none" />}
        />
        <Controller
          control={control}
          name="genres"
          render={({ field }) => (
            <TextField
              label="Genres"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Classic, Nature, Children"
              error={errors.genres?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="readingStatus"
          render={({ field }) => (
            <View className="gap-2">
              <Text className="text-sm font-semibold uppercase tracking-[1.5px] text-mist">Reading status</Text>
              <View className="flex-row flex-wrap gap-2">
                {['owned', 'reading', 'wishlist', 'read'].map((status) => (
                  <Button
                    key={status}
                    label={status}
                    variant={field.value === status ? 'primary' : 'secondary'}
                    onPress={() => field.onChange(status)}
                  />
                ))}
              </View>
            </View>
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              label="Notes"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Anything you want to remember about this copy"
              multiline
            />
          )}
        />
        <Button label={createBook.isPending ? 'Saving...' : 'Save book'} onPress={handleSubmit(onSubmit)} disabled={createBook.isPending} />
      </View>
    </ScrollView>
  );
}
