import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';

import { BookCard } from '@/components/book/book-card';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/features/auth/auth-card';
import { useBooks, useDeleteBook } from '@/features/books/use-books';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function LibraryScreen() {
  const { user, loading } = useAuth();
  const booksQuery = useBooks();
  const deleteBook = useDeleteBook();
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');

  const books = booksQuery.data ?? [];
  const genreOptions = useMemo(() => {
    const allGenres = books.flatMap((book) => book.genres.map((genre) => genre.name));
    return ['all', ...new Set(allGenres)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        query.length === 0 ||
        [book.title, book.author, book.publisher ?? ''].some((value) => value.toLowerCase().includes(query));
      const matchesGenre = genreFilter === 'all' || book.genres.some((genre) => genre.name === genreFilter);
      return matchesSearch && matchesGenre;
    });
  }, [books, genreFilter, search]);

  if (!user && !loading) {
    return (
      <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24 }}>
        <AuthCard />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24, gap: 24 }}>
      <Section
        eyebrow="Catalogue"
        title="Search and organize your shelf"
        description="This view now reads from Supabase. Search is client-side for v1 because we do not need to cosplay as Elasticsearch on day one."
      >
        <View className="gap-4 rounded-[28px] border border-line bg-paper p-5">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by title, author, or publisher"
            className="rounded-2xl border border-line bg-parchment px-4 py-3 text-base text-ink"
            placeholderTextColor="#7A726A"
          />
          <View className="flex-row flex-wrap gap-2">
            {genreOptions.map((genre) => (
              <Button
                key={genre}
                label={genre === 'all' ? 'All genres' : genre}
                variant={genreFilter === genre ? 'primary' : 'secondary'}
                onPress={() => setGenreFilter(genre)}
              />
            ))}
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-mist">{filteredBooks.length} books shown</Text>
            <Button label="Sign out" variant="secondary" onPress={() => void supabase.auth.signOut()} />
          </View>
        </View>
      </Section>

      {booksQuery.isLoading ? (
        <View className="items-center rounded-[28px] border border-line bg-paper p-8">
          <ActivityIndicator />
          <Text className="mt-3 text-base text-mist">Loading your shelf...</Text>
        </View>
      ) : null}

      {booksQuery.error ? (
        <View className="rounded-[28px] border border-red-300 bg-red-50 p-5">
          <Text className="text-base leading-7 text-red-900">{booksQuery.error.message}</Text>
        </View>
      ) : null}

      {!booksQuery.isLoading && filteredBooks.length === 0 ? (
        <View className="rounded-[28px] border border-line bg-paper p-6">
          <Text className="text-2xl text-ink" style={{ fontFamily: 'Georgia' }}>
            No books yet
          </Text>
          <Text className="mt-2 text-base leading-7 text-mist">
            Add your first book once the SQL is in place. If you already added one and still see this, RLS or migrations are probably still missing because computers love little rituals.
          </Text>
        </View>
      ) : null}

      <View className="flex-row flex-wrap justify-center gap-4">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            title={book.title}
            author={book.author}
            publisher={book.publisher}
            genres={book.genres}
            status={book.readingStatus}
            onDelete={() => deleteBook.mutate(book.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
