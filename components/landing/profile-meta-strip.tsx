import { Text, View } from 'react-native';

const metaItems = [
  { label: 'Followers', value: '2.4k' },
  { label: 'Following', value: '318' },
  { label: 'Pinned posts', value: '07' },
  { label: 'Ask box', value: 'Open' },
];

export function ProfileMetaStrip() {
  return (
    <View className="flex-row flex-wrap gap-3">
      {metaItems.map((item) => (
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
