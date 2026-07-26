import { Text, View } from 'react-native';

type ShelfEntry = {
  type: string;
  title: string;
  body: string;
  meta: string;
  tone: string;
};

type ShelfFeedProps = {
  entries: ShelfEntry[];
};

function SanctuaryCard({ body, meta, title, tone, type }: ShelfEntry) {
  return (
    <View className="rounded-[28px] border border-line shadow-card" style={{ backgroundColor: tone }}>
      <View className="flex-row items-center gap-3 border-b border-[#B9AB9D] px-5 py-4">
        <View className="h-12 w-12 rounded-[16px] border border-[#8A7A6D] bg-[#D6BD87]" />
        <View className="flex-1">
          <Text className="text-lg text-ink" style={{ fontFamily: 'Georgia' }}>
            {title}
          </Text>
          <Text className="text-sm text-mist">{type}</Text>
        </View>
      </View>

      <View className="gap-3 px-5 py-5">
        <Text className="text-base leading-8 text-ink">{body}</Text>
      </View>

      <View className="flex-row items-center justify-between border-t border-[#B9AB9D] px-5 py-4">
        <Text className="text-sm text-mist">{meta}</Text>
        <View className="flex-row gap-3">
          <Text className="text-sm text-mist">note</Text>
          <Text className="text-sm text-mist">tuck away</Text>
          <Text className="text-sm text-mist">return later</Text>
        </View>
      </View>
    </View>
  );
}

export function ShelfFeed({ entries }: ShelfFeedProps) {
  return (
    <View className="gap-5">
      {entries.map((entry, index) => (
        <View key={`${entry.type}-${entry.title}-${index}`} className={index % 2 === 1 ? 'md:ml-8' : 'md:mr-8'}>
          <SanctuaryCard {...entry} />
        </View>
      ))}
    </View>
  );
}
