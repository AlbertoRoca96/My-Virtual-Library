import { Text, View } from 'react-native';

export function ScanPageHeader() {
  return (
    <View className="gap-3 rounded-[28px] border border-line bg-paper p-6">
      <Text className="text-3xl text-ink" style={{ fontFamily: 'Georgia' }}>
        Scan ISBN
      </Text>
      <Text className="text-base leading-7 text-mist">
        We ask for camera access first on every device. If scanning works, great. If the browser or phone behaves like a tiny goblin, manual ISBN lookup still lets you autofill and edit before saving.
      </Text>
    </View>
  );
}
