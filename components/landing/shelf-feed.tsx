import { Text, View } from 'react-native';

const feedEntries = [
  {
    type: 'Text post',
    author: 'myvirtualbookshelf',
    title: 'Currently romanticizing',
    body: 'Illustrated children\'s classics, foxed paperbacks, and covers that look like they survived a thunderstorm in 1913.',
    meta: '2,148 notes • posted 2 hours ago',
    tone: '#E7D8C4',
  },
  {
    type: 'Shelf update',
    author: 'myvirtualbookshelf',
    title: 'Shelf status',
    body: 'Still rearranging by mood, then color, then by how loudly each spine whispers “pick me next.” Entirely scientific process.',
    meta: 'Pinned in spirit • 611 notes',
    tone: '#EFDCCF',
  },
  {
    type: 'Ask response',
    author: 'myvirtualbookshelf',
    title: 'Inbox energy',
    body: 'Anonymous asks welcome. Recommendations especially welcome. Judgment about duplicate copies will be ignored on principle.',
    meta: 'Replying to 3 asks • 480 notes',
    tone: '#E4D6CA',
  },
];

function FauxPostCard({
  author,
  body,
  meta,
  title,
  tone,
  type,
}: {
  author: string;
  body: string;
  meta: string;
  title: string;
  tone: string;
  type: string;
}) {
  return (
    <View className="rounded-[28px] border border-line shadow-card" style={{ backgroundColor: tone }}>
      <View className="flex-row items-center gap-3 border-b border-[#B9AB9D] px-5 py-4">
        <View className="h-12 w-12 rounded-[16px] border border-[#8A7A6D] bg-[#D6BD87]" />
        <View className="flex-1">
          <Text className="text-lg text-ink" style={{ fontFamily: 'Georgia' }}>
            {author}
          </Text>
          <Text className="text-sm text-mist">{type}</Text>
        </View>
      </View>

      <View className="gap-3 px-5 py-5">
        <Text className="text-3xl leading-[42px] text-ink" style={{ fontFamily: 'Georgia' }}>
          {title}
        </Text>
        <Text className="text-base leading-8 text-ink">{body}</Text>
      </View>

      <View className="flex-row items-center justify-between border-t border-[#B9AB9D] px-5 py-4">
        <Text className="text-sm text-mist">{meta}</Text>
        <View className="flex-row gap-3">
          <Text className="text-sm text-mist">reblog</Text>
          <Text className="text-sm text-mist">heart</Text>
          <Text className="text-sm text-mist">share</Text>
        </View>
      </View>
    </View>
  );
}

export function ShelfFeed() {
  return (
    <View className="gap-5">
      {feedEntries.map((entry, index) => (
        <View key={entry.title} className={index % 2 === 1 ? 'md:ml-8' : 'md:mr-8'}>
          <FauxPostCard {...entry} />
        </View>
      ))}
    </View>
  );
}
