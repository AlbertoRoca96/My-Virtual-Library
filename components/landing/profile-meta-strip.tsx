import { Text, View } from 'react-native';

const metaItems = [
  { label: 'Books catalogued', value: '124' },
  { label: 'Current stack', value: '06' },
  { label: 'Shelf notes', value: '18' },
  { label: 'Reading mood', value: 'Quiet' },
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
