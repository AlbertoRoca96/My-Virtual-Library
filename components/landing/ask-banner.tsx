import { Text, View } from 'react-native';

export function AskBanner() {
  return (
    <View className="items-center gap-4 rounded-[32px] border border-line bg-paper px-6 py-6">
      <Text className="text-xs uppercase tracking-[2.5px] text-mist">Shelf intention</Text>
      <Text className="text-center text-4xl text-ink" style={{ fontFamily: 'Georgia' }}>
        A room for the books and for the person arranging them.
      </Text>
      <Text className="max-w-2xl text-center text-base leading-8 text-mist">
        This page is not for performing taste to strangers. It is for collecting, annotating, arranging, and making a reading life feel visible in one quiet beautiful place.
      </Text>
    </View>
  );
}
