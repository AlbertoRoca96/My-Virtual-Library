import { Text, View } from 'react-native';

type ShelfStatsProps = {
  bookCount: number;
  genreCount: number;
  moodboardCount: number;
  statusLabel: string;
};

export function ShelfStats({ bookCount, genreCount, moodboardCount, statusLabel }: ShelfStatsProps) {
  const stats = [
    { label: 'Books catalogued', value: String(bookCount).padStart(2, '0') },
    { label: 'Genres in orbit', value: String(genreCount).padStart(2, '0') },
    { label: 'Moodboard tiles', value: String(moodboardCount).padStart(2, '0') },
    { label: 'Current mode', value: statusLabel },
  ];

  return (
    <View className="flex-row flex-wrap gap-4">
      {stats.map((stat) => (
        <View key={stat.label} className="min-w-[190px] flex-1 rounded-[28px] border border-line bg-paper px-5 py-4">
          <Text className="text-xs uppercase tracking-[2px] text-mist">{stat.label}</Text>
          <Text className="mt-3 text-3xl text-ink" style={{ fontFamily: 'Georgia' }}>
            {stat.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
