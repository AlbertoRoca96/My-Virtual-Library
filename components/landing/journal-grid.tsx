import { Text, View } from 'react-native';

const entries = [
  {
    title: 'Pinned shelf philosophy',
    body: 'This is where I spend all my time cataloguing books instead of actually reducing the TBR. It is a lifestyle, not a bug.',
  },
  {
    title: 'Collection ritual',
    body: 'Scan the ISBN, tidy the metadata, assign a few genres, and then stare at the cover like it personally owes you inspiration.',
  },
  {
    title: 'Design direction',
    body: 'Warm parchment, dark ink, old-library softness, and enough visual drama to make a spreadsheet cry in the corner.',
  },
];

export function JournalGrid() {
  return (
    <View className="gap-4 md:flex-row">
      {entries.map((entry) => (
        <View key={entry.title} className="flex-1 rounded-[28px] border border-line bg-paper p-5">
          <Text className="text-xs uppercase tracking-[2px] text-mist">Shelf note</Text>
          <Text className="mt-3 text-2xl text-ink" style={{ fontFamily: 'Georgia' }}>
            {entry.title}
          </Text>
          <Text className="mt-3 text-base leading-7 text-mist">{entry.body}</Text>
        </View>
      ))}
    </View>
  );
}
