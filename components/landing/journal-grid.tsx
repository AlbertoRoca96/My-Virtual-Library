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
    title: 'Room tone',
    body: 'Warm parchment, dark ink, old-bookshelf softness, and enough visual drama to make a spreadsheet cry in the corner.',
  },
];

export function JournalGrid() {
  return (
    <View className="gap-4 md:flex-row md:flex-wrap">
      {entries.map((entry, index) => (
        <View key={entry.title} className={`rounded-[28px] border border-line bg-paper p-5 ${index === 0 ? 'md:w-full' : 'md:flex-1'}`}>
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
