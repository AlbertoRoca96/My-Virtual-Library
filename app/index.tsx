import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { BookCard } from '@/components/book/book-card';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/features/auth/auth-card';
import { mockBooks } from '@/features/books/mock-books';
import { useBooks } from '@/features/books/use-books';
import { useAuth } from '@/lib/auth';
import { hasSupabaseEnv } from '@/lib/env';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const booksQuery = useBooks();
  const previewBooks = user ? (booksQuery.data ?? []).slice(0, 3) : mockBooks;

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24, gap: 32 }}>
      <View className="items-center gap-5 rounded-[32px] bg-paper px-6 py-10">
        <View className="h-28 w-28 items-center justify-center rounded-[28px] border border-line bg-parchment" />
        <View className="items-center gap-3">
          <Text className="text-center text-5xl text-ink" style={{ fontFamily: 'Georgia' }}>
            My Virtual Library
          </Text>
          <Text className="max-w-xl text-center text-base leading-7 text-mist">
            A cozy cross-platform catalogue for keeping track of your books, scanning ISBNs on your phone,
            and curating a bookshelf that feels more like you than a spreadsheet ever could.
          </Text>
        </View>
        <View className="w-full max-w-md gap-3">
          <Button label="Browse library" onPress={() => router.push('/library')} />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button label="Add book" variant="secondary" onPress={() => router.push('/add-book')} />
            </View>
            <View className="flex-1">
              <Button label="Scan ISBN" variant="secondary" onPress={() => router.push('/scan')} />
            </View>
          </View>
          {user ? <Button label="Sign out" variant="secondary" onPress={() => void supabase.auth.signOut()} /> : null}
        </View>
      </View>

      {!hasSupabaseEnv ? (
        <View className="rounded-[28px] border border-red-300 bg-red-50 p-5">
          <Text className="text-base leading-7 text-red-900">Supabase env is missing. Add your project URL and publishable key in .env.</Text>
        </View>
      ) : null}

      {!user && !loading ? <AuthCard /> : null}

      <Section
        eyebrow="Tech direction"
        title={user ? 'Your shelf is now live-backed' : 'Built for web and mobile from one codebase'}
        description={
          user
            ? 'Once the SQL is pasted into Supabase, your library view and add-book flow will use real auth and database calls.'
            : 'Expo + React Native Web + Supabase gives us a sane foundation instead of two separate apps that eventually start fighting in the parking lot.'
        }
      >
        <View className="gap-3 rounded-[28px] border border-line bg-paper p-5">
          <Text className="text-base leading-7 text-ink">- Cross-platform UI with Expo Router</Text>
          <Text className="text-base leading-7 text-ink">- Supabase auth wired for email/password and magic links</Text>
          <Text className="text-base leading-7 text-ink">- Real book create/list/delete hooks ready for RLS-backed tables</Text>
          <Text className="text-base leading-7 text-ink">- ISBN scan screen reserved for Open Library autofill next</Text>
          <Text className="text-base leading-7 text-ink">- Supabase env configured: {hasSupabaseEnv ? 'yes' : 'not yet'}</Text>
        </View>
      </Section>

      <Section
        eyebrow="Shelf preview"
        title={user ? 'Recent books from your account' : 'A softer, more literary vibe'}
        description={
          user
            ? booksQuery.isLoading
              ? 'Loading from Supabase now.'
              : 'The cards below come from the real books query when you are signed in.'
            : 'This starter UI leans warm, airy, and bookish so we are not launching into a blank white rectangle of sadness.'
        }
      >
        <View className="flex-row flex-wrap justify-center gap-4">
          {previewBooks.map((book) => (
            <BookCard
              key={book.id}
              title={book.title}
              author={book.author}
              publisher={book.publisher}
              genres={book.genres}
              status={'readingStatus' in book ? book.readingStatus : book.status}
              coverTone={'coverTone' in book ? book.coverTone : undefined}
            />
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}
