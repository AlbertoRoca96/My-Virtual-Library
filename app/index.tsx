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
import { useBooks } from '@/features/books/use-books';
import { useProfile } from '@/features/profile/use-profile';
import { useAuth } from '@/lib/auth';
import { Book } from '@/lib/database.types';
import { hasSupabaseEnv } from '@/lib/env';
import { supabase } from '@/lib/supabase';

const collagePalettes = [
  { tone: '#7E5C43', accent: '#D7B26D', rotation: '-rotate-1', height: 'h-80' },
  { tone: '#A98A77', accent: '#EFE1D1', rotation: 'rotate-1', height: 'h-56' },
  { tone: '#8F6A52', accent: '#D6C1AB', rotation: '-rotate-2', height: 'h-64' },
  { tone: '#C7A26E', accent: '#F3E7C8', rotation: 'rotate-2', height: 'h-48' },
];

function formatStatusLabel(statuses: string[]) {
  if (statuses.includes('reading')) return 'Reading';
  if (statuses.includes('wishlist')) return 'Wishlist';
  if (statuses.includes('owned')) return 'Owned';
  return 'Unset';
}

function titleCaseStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getTopGenres(books: Book[]) {
  const counts = new Map<string, number>();
  books.forEach((book) => {
    book.genres.forEach((genre) => {
      counts.set(genre.name, (counts.get(genre.name) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const booksQuery = useBooks();
  const profileQuery = useProfile();
  const books = user ? booksQuery.data ?? [] : [];
  const profile = profileQuery.data;

  const derived = useMemo(() => {
    const genreNames = books.flatMap((book) => book.genres.map((genre) => genre.name));
    const statuses = books.map((book) => book.readingStatus);
    const readingBooks = books.filter((book) => book.readingStatus === 'reading');
    const topGenres = getTopGenres(books);

    const metaItems = [
      { label: 'Books catalogued', value: String(books.length) },
      { label: 'Current stack', value: String(readingBooks.length) },
      { label: 'Top genres', value: String(new Set(genreNames).size) },
      { label: 'Reading mood', value: profile?.readingMood?.trim() || 'Unset' },
    ];

    const statItems = [
      { label: 'Books catalogued', value: String(books.length) },
      { label: 'Genres in orbit', value: String(new Set(genreNames).size) },
      { label: 'Currently reading', value: String(readingBooks.length) },
      { label: 'Current mode', value: formatStatusLabel(statuses) },
    ];

    const highlights = [profile?.highlightOne, profile?.highlightTwo, profile?.highlightThree].filter(
      (value): value is string => Boolean(value?.trim())
    );

    const chips = [profile?.collectionFocus, profile?.readingMood, ...topGenres].filter(
      (value): value is string => Boolean(value?.trim())
    );

    const feedEntries = [
      {
        type: 'Reading mood',
        title: 'Current mood',
        body: profile?.readingMood?.trim() || 'No reading mood set yet. Add one from Edit Sanctuary when you know what the room should feel like.',
        meta: books.length > 0 ? `${books.length} books catalogued so far` : 'No books catalogued yet',
        tone: '#E7D8C4',
      },
      {
        type: 'Collection focus',
        title: 'Collection focus',
        body:
          profile?.collectionFocus?.trim() ||
          'No collection focus set yet. This can become the through-line of the shelf once you decide what it is orbiting around.',
        meta: topGenres.length > 0 ? `Top genres: ${topGenres.join(', ')}` : 'No genres on the shelf yet',
        tone: '#EFDCCF',
      },
      {
        type: 'Private reminder',
        title: 'Sanctuary reminder',
        body:
          profile?.privateNote?.trim() ||
          'No pinned shelf note yet. Add one if you want the landing page to carry an honest personal note instead of a made-up one.',
        meta: readingBooks.length > 0 ? `${readingBooks.length} book(s) currently reading` : 'Nothing marked as currently reading',
        tone: '#E4D6CA',
      },
    ];

    const moodboardPanels = (books.length > 0 ? books.slice(0, 4) : [null, null, null, null]).map((book, index) => {
      const palette = collagePalettes[index];
      return {
        title: book?.title || 'Empty shelf space',
        note:
          book?.description?.trim() ||
          (book
            ? `${book.author}${book.publisher ? ` • ${book.publisher}` : ''}`
            : 'Add books to your catalogue and the collage will start reflecting real titles and notes from your shelf.'),
        ...palette,
      };
    });

    const pinnedTitle = profile?.privateNote?.trim() || 'No pinned shelf note yet';
    const pinnedBody =
      profile?.shelfDescription?.trim() ||
      profile?.bio?.trim() ||
      'Open Edit Sanctuary and add a shelf description or pinned note to replace this empty-state card with something actually yours.';
    const pinnedMeta = profile?.collectionFocus?.trim() || 'Set a collection focus in Edit Sanctuary';

    return {
      metaItems,
      statItems,
      highlights: highlights.length > 0 ? highlights : ['Personal catalogue sanctuary'],
      chips: chips.length > 0 ? chips : ['Private shelf in progress'],
      feedEntries,
      moodboardPanels,
      pinnedTitle,
      pinnedBody,
      pinnedMeta,
      topGenres,
    };
  }, [books, profile]);

  const previewBooks = books.slice(0, 4);

  const heroActions = (
    <>
      <Button label="Browse library" onPress={() => router.push('/library')} />
      <View className="flex-row flex-wrap gap-3">
        <View className="min-w-[180px] flex-1">
          <Button label="Edit sanctuary" variant="secondary" onPress={() => router.push('/profile')} />
        </View>
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
      <TopBar shelfName={profile?.shelfSlug || profile?.username || 'my shelf'} />
      <ProfileMetaStrip items={derived.metaItems} />

      <ProfileHero
        handle={profile?.username || 'private sanctuary'}
        title={profile?.shelfTitle || 'My Virtual Bookshelf'}
        subtitle={profile?.shelfSubtitle || 'Add a shelf subtitle in Edit Sanctuary to make this page sound like you.'}
        bio={
          profile?.bio ||
          'This shelf does not have a written description yet. Open Edit Sanctuary to add one and make the landing page reflect your real reading room.'
        }
        artworkTitle={profile?.artworkTitle || 'Add artwork caption'}
        highlights={derived.highlights}
        chips={derived.chips}
        actions={heroActions}
      />

      <PinnedPost
        title={derived.pinnedTitle}
        body={derived.pinnedBody}
        meta={derived.pinnedMeta}
        tags={derived.topGenres}
      />

      <AskBanner
        title={profile?.shelfTitle ? `${profile.shelfTitle} is still becoming itself.` : 'A room for the books and for the person arranging them.'}
        description={
          profile?.shelfDescription ||
          'Nothing on this landing page should pretend to know you yet. Add your own shelf description, note, and mood from Edit Sanctuary and this page will stop improvising empty-state honesty.'
        }
      />

      <ShelfStats items={derived.statItems} />

      {!hasSupabaseEnv ? (
        <View className="rounded-[28px] border border-red-300 bg-red-50 p-5">
          <Text className="text-base leading-7 text-red-900">Supabase env is missing. Add your project URL and publishable key in .env.</Text>
        </View>
      ) : null}

      {!user && !loading ? <AuthCard /> : null}

      <Section
        eyebrow="Visual shelf"
        title="Scrapbook collage, not a product grid"
        description="The collage now uses your real books when they exist. No fake lore, no invented collection history, just honest shelf fragments and empty states until the catalogue grows." 
      >
        <MoodboardCollage panels={derived.moodboardPanels} />
      </Section>

      <Section
        eyebrow="Private notes"
        title="The sanctuary should feel lived-in"
        description="These cards now reflect your real shelf note, reading mood, collection focus, and book counts. If something is missing, the page says so instead of inventing a personality on your behalf."
      >
        <View className="gap-5 md:flex-row md:items-start">
          <View className="md:flex-[1.15]">
            <ShelfFeed entries={derived.feedEntries} />
          </View>
          <View className="md:flex-1 md:pt-12">
            <JournalGrid />
          </View>
        </View>
      </Section>

      <Section
        eyebrow="Featured titles"
        title="Books from your shelf"
        description={
          booksQuery.isLoading
            ? 'Your real catalogue is loading now.'
            : previewBooks.length > 0
              ? 'These cards are pulled from your actual books, not sample placeholders.'
              : 'No books yet. Add your first title and the shelf will start filling in for real.'
        }
      >
        {previewBooks.length > 0 ? (
          <View className="flex-row flex-wrap justify-center gap-4">
            {previewBooks.map((book) => (
              <BookCard
                key={book.id}
                title={book.title}
                author={book.author}
                publisher={book.publisher}
                genres={book.genres}
                status={titleCaseStatus(book.readingStatus)}
                coverTone={undefined}
              />
            ))}
          </View>
        ) : (
          <View className="rounded-[28px] border border-line bg-paper p-6">
            <Text className="text-2xl text-ink" style={{ fontFamily: 'Georgia' }}>
              Your shelf is still empty.
            </Text>
            <Text className="mt-3 text-base leading-7 text-mist">
              Add a book, set a reading mood, and write a shelf note. Then this landing page can stop being politely empty and start being actually yours.
            </Text>
          </View>
        )}
      </Section>
    </ScrollView>
  );
}
