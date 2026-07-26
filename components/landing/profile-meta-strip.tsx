import { Text, View } from 'react-native';

type MetaItem = {
  label: string;
  value: string;
};

type ProfileMetaStripProps = {
  items: MetaItem[];
};

export function ProfileMetaStrip({ items }: ProfileMetaStripProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {items.map((item) => (
        <View key={item.label} className="min-w-[150px] flex-1 rounded-[24px] border border-line bg-paper px-4 py-3">
          <Text className="text-xs uppercase tracking-[2px] text-mist">{item.label}</Text>
          <Text className="mt-2 text-2xl text-ink" style={{ fontFamily: 'Georgia' }}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
