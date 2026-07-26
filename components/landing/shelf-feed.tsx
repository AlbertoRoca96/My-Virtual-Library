import { Text, View } from 'react-native';

const feedEntries = [
  {
    title: 'Currently romanticizing',
    body: 'Illustrated children\'s classics, foxed paperbacks, and covers that look like they survived a thunderstorm in 1913.',
    tone: '#E7D8C4',
  },
  {
    title: 'Shelf status',
    body: 'Still rearranging by mood, then color, then by how loudly each spine whispers “pick me next.” Entirely scientific process.',
    tone: '#EFDCCF',
  },
  {
    title: 'Inbox energy',
    body: 'Anonymous asks welcome. Recommendations especially welcome. Judgment about duplicate copies will be ignored on principle.',
    tone: '#E4D6CA',
  },
];

export function ShelfFeed() {
  return (
    <View className="gap-4">
      {feedEntries.map((entry) => (
        <View key={entry.title} className="rounded-[28px] border border-line p-5" style={{ backgroundColor: entry.tone }}>
          <Text className="text-xs uppercase tracking-[2px] text-mist">Shelf feed</Text>
          <Text className="mt-3 text-2xl text-ink" style={{ fontFamily: 'Georgia' }}>
            {entry.title}
          </Text>
          <Text className="mt-3 text-base leading-8 text-ink">{entry.body}</Text>
        </View>
      ))}
    </View>
  );
}
