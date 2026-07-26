import { Pressable, Text, View } from 'react-native';

type BookCardProps = {
  title: string;
  author: string;
  publisher?: string | null;
  genres: Array<string | { name: string }>;
  status: string;
  coverTone?: string;
  onDelete?: () => void;
};

function getGenreName(genre: string | { name: string }) {
  return typeof genre === 'string' ? genre : genre.name;
}

export function BookCard({ author, coverTone = '#B8A06A', genres, onDelete, publisher, status, title }: BookCardProps) {
  return (
    <View className="w-full max-w-[240px] gap-4 rounded-[30px] border border-line bg-paper p-4 shadow-card">
      <View className="h-60 rounded-[24px] border border-[#7B6C5B]/15" style={{ backgroundColor: coverTone }} />
      <View className="gap-2">
        <Text className="text-xl text-ink" numberOfLines={2} style={{ fontFamily: 'Georgia' }}>
          {title}
        </Text>
        <Text className="text-base text-mist">{author}</Text>
        <Text className="text-xs uppercase tracking-[2px] text-accent">{status}</Text>
        {publisher ? <Text className="text-xs text-mist">{publisher}</Text> : null}
        <View className="flex-row flex-wrap gap-2">
          {genres.map((genre) => {
            const label = getGenreName(genre);
            return (
              <View key={label} className="rounded-full border border-line bg-parchment px-3 py-1">
                <Text className="text-xs text-ink">{label}</Text>
              </View>
            );
          })}
        </View>
        {onDelete ? (
          <Pressable onPress={onDelete}>
            <Text className="pt-2 text-sm font-semibold text-red-700">Remove from shelf</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
