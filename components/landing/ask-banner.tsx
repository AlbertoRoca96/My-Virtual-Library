import { Text, View } from 'react-native';

type AskBannerProps = {
  title: string;
  description: string;
};

export function AskBanner({ description, title }: AskBannerProps) {
  return (
    <View className="items-center gap-4 rounded-[32px] border border-line bg-paper px-6 py-6">
      <Text className="text-xs uppercase tracking-[2.5px] text-mist">Shelf intention</Text>
      <Text className="text-center text-4xl text-ink" style={{ fontFamily: 'Georgia' }}>
        {title}
      </Text>
      <Text className="max-w-2xl text-center text-base leading-8 text-mist">{description}</Text>
    </View>
  );
}
