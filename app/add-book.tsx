import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { AuthCard } from '@/features/auth/auth-card';
import { BookFormFields } from '@/features/books/book-form-fields';
import { BookFormValues, bookFormSchema, parseGenreString } from '@/features/books/book-form-schema';
import { useCreateBook } from '@/features/books/use-books';
import { useAuth } from '@/lib/auth';

export default function AddBookScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const createBook = useCreateBook();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
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

  const onSubmit = (values: BookFormValues) => {
    createBook.mutate(
      {
        ...values,
        genres: parseGenreString(values.genres),
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
          Add a book by hand, or use the scan screen if you want the ISBN to do some of the work for once.
        </Text>
      </View>

      <View className="gap-4 rounded-[28px] border border-line bg-paper p-6">
        <BookFormFields control={control} errors={errors} />
        <Button label={createBook.isPending ? 'Saving...' : 'Save book'} onPress={handleSubmit(onSubmit)} disabled={createBook.isPending} />
      </View>
    </ScrollView>
  );
}
