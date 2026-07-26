import { Text, View } from 'react-native';

type ShelfStatsProps = {
  items: Array<{
    label: string;
    value: string;
  }>;
};

export function ShelfStats({ items }: ShelfStatsProps) {
  return (
    <View className="flex-row flex-wrap gap-4">
      {items.map((item) => (
        <View key={item.label} className="min-w-[190px] flex-1 rounded-[28px] border border-line bg-paper px-5 py-4">
          <Text className="text-xs uppercase tracking-[2px] text-mist">{item.label}</Text>
          <Text className="mt-3 text-3xl text-ink" style={{ fontFamily: 'Georgia' }}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
