import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { BookCard } from '@/components/book/book-card';
import { AskBanner } from '@/components/landing/ask-banner';
import { JournalGrid } from '@/components/landing/journal-grid';
import { MoodboardCollage } from '@/components/landing/moodboard-collage';
import { PinnedPost } from '@/components/landing/pinned-post';
import { ProfileHero } from '@/components/landing/profile-hero';
import { ProfileMetaStrip } from '@/components/landing/profile-meta-strip';
import { ShelfFeed } from '@/components/landing/shelf-feed';
import { ShelfStats } from '@/components/landing/shelf-stats';
import { TopBar } from '@/components/landing/top-bar';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/features/auth/auth-card';
import { mockBooks } from '@/features/books/mock-books';
import { useBooks } from '@/features/books/use-books';
import { useAuth } from '@/lib/auth';
import { hasSupabaseEnv } from '@/lib/env';
import { supabase } from '@/lib/supabase';

function formatStatusLabel(statuses: string[]) {
  if (statuses.includes('reading')) {
    return 'Reading';
  }
  if (statuses.includes('wishlist')) {
    return 'Wishlist';
  }
  if (statuses.includes('owned')) {
    return 'Owned';
  }
  return 'Curating';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const booksQuery = useBooks();
  const previewBooks = user ? (booksQuery.data ?? []).slice(0, 4) : mockBooks;

  const derivedStats = useMemo(() => {
    const liveBooks = booksQuery.data ?? [];
    const sourceBooks = user ? liveBooks : mockBooks;
    const genreNames = sourceBooks.flatMap((book) =>
      book.genres.map((genre) => (typeof genre === 'string' ? genre : genre.name))
    );
    const statuses = sourceBooks.map((book) => ('readingStatus' in book ? book.readingStatus : book.status.toLowerCase()));

    return {
      bookCount: sourceBooks.length,
      genreCount: new Set(genreNames).size,
      moodboardCount: 3,
      statusLabel: formatStatusLabel(statuses),
    };
  }, [booksQuery.data, user]);

  const heroActions = (
    <>
      <Button label="Browse library" onPress={() => router.push('/library')} />
      <View className="flex-row flex-wrap gap-3">
        <View className="min-w-[180px] flex-1">
          <Button label="Add book" variant="secondary" onPress={() => router.push('/add-book')} />
        </View>
        <View className="min-w-[180px] flex-1">
          <Button label="Scan ISBN" variant="secondary" onPress={() => router.push('/scan')} />
        </View>
        {user ? (
          <View className="min-w-[180px] flex-1">
            <Button label="Sign out" variant="secondary" onPress={() => void supabase.auth.signOut()} />
          </View>
        ) : null}
      </View>
    </>
  );

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24, gap: 24 }}>
      <TopBar shelfName="myvirtualbookshelf" />
      <ProfileMetaStrip />

      <ProfileHero
        handle="myvirtualbookshelf"
        title="My Virtual Bookshelf"
        subtitle="A soft little corner for beautifully bound chaos, private shelf rituals, and suspiciously romantic metadata."
        bio="This is where the catalogue wants to feel like a profile, the profile wants to feel like a scrapbook, and every book gets to live in a space that is warmer than a spreadsheet and slightly more dramatic than necessary."
        actions={heroActions}
      />

      <PinnedPost />

      <AskBanner />

      <ShelfStats
        bookCount={derivedStats.bookCount}
        genreCount={derivedStats.genreCount}
        moodboardCount={derivedStats.moodboardCount}
        statusLabel={derivedStats.statusLabel}
      />

      {!hasSupabaseEnv ? (
        <View className="rounded-[28px] border border-red-300 bg-red-50 p-5">
          <Text className="text-base leading-7 text-red-900">Supabase env is missing. Add your project URL and publishable key in .env.</Text>
        </View>
      ) : null}

      {!user && !loading ? <AuthCard /> : null}

      <Section
        eyebrow="Visual shelf"
        title="Artwork-first, collage-forward, and delightfully bookish"
        description="The homepage should feel like a public shelf blog: part profile, part diary, part museum gift shop if the gift shop had opinions about gothic paperbacks."
      >
        <MoodboardCollage />
      </Section>

      <Section
        eyebrow="Feed fragments"
        title="Little social blocks make it feel more lived-in"
        description="This is the Tumblr-ish layer: pinned thoughts, shelf updates, ask box energy, and fragments that imply a real reader lives here instead of a dashboard with delusions of grandeur."
      >
        <View className="gap-4 md:flex-row">
          <View className="md:flex-[1.2]">
            <ShelfFeed />
          </View>
          <View className="md:flex-1">
            <JournalGrid />
          </View>
        </View>
      </Section>

      <Section
        eyebrow="Featured titles"
        title={user ? 'Books from your shelf' : 'A preview of the shelf language'}
        description={
          user
            ? booksQuery.isLoading
              ? 'Your real catalogue is loading now.'
              : 'These cards are now pulled from your account and styled to feel like display objects, not list rows.'
            : 'Until you sign in, the homepage uses curated sample books to show the intended tone of the shelf.'
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
