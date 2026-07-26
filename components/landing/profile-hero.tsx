import { ReactNode } from 'react';
import { Text, View } from 'react-native';

type ProfileHeroProps = {
  title: string;
  handle: string;
  subtitle: string;
  bio: string;
  artworkTitle: string;
  highlights: string[];
  chips: string[];
  actions: ReactNode;
};

export function ProfileHero({ actions, artworkTitle, bio, chips, handle, highlights, subtitle, title }: ProfileHeroProps) {
  return (
    <View className="gap-5 rounded-[32px] border border-line bg-paper px-5 py-6 md:gap-6 md:rounded-[38px] md:px-6 md:py-7 md:flex-row md:items-center md:justify-between">
      <View className="flex-1 gap-5 md:gap-6 md:max-w-[42%]">
        <View className="gap-4">
          <View className="h-[240px] rounded-[28px] border border-[#C3B39C] bg-[#E5D5B3] p-3 shadow-card md:h-[320px] md:rounded-[34px] md:p-4">
            <View className="flex-1 rounded-[24px] border border-[#6F665D] bg-[#F0E1B8] px-4 py-5 md:rounded-[28px] md:px-5 md:py-6">
              <View className="flex-1 items-center justify-center rounded-[20px] border border-[#6F665D] bg-[#F7EBCB] md:rounded-[22px]">
                <View className="h-36 w-28 rounded-[70px] border-[8px] border-[#5D554A] bg-[#E4C682] p-3 md:h-48 md:w-40 md:rounded-[90px] md:border-[10px]">
                  <View className="flex-1 items-center justify-center rounded-[70px] border border-[#5D554A] bg-[#EFD9A0]">
                    <Text className="text-center text-sm uppercase tracking-[3px] text-[#5D554A]">Artwork</Text>
                    <Text className="mt-3 px-4 text-center text-xl text-[#5D554A] md:px-6 md:text-2xl" style={{ fontFamily: 'Georgia' }}>
                      {artworkTitle}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="rounded-[22px] border border-line bg-parchment px-4 py-4 md:rounded-[26px] md:px-5">
            <Text className="text-xs uppercase tracking-[2px] text-mist">Shelf memo</Text>
            <Text className="mt-3 text-lg leading-8 text-ink" style={{ fontFamily: 'Georgia' }}>
              {subtitle}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-1 gap-5 md:gap-6 md:max-w-[52%]">
        <View className="gap-3">
          <Text className="text-xs uppercase tracking-[2.5px] text-mist">{handle}</Text>
          <Text className="text-4xl leading-[50px] text-ink md:text-6xl md:leading-[78px]" style={{ fontFamily: 'Georgia' }}>
            {title}
          </Text>
          <Text className="max-w-2xl text-base leading-7 text-mist md:text-lg md:leading-8">{bio}</Text>
        </View>

        <View className="flex-row flex-wrap gap-3">
          {highlights.map((highlight) => (
            <View key={highlight} className="rounded-full border border-line bg-parchment px-4 py-2">
              <Text className="text-sm text-ink">{highlight}</Text>
            </View>
          ))}
        </View>

        <View className="rounded-[24px] border border-line bg-[#F8F3EA] p-4 md:rounded-[30px] md:p-5">
          <Text className="text-xs uppercase tracking-[2px] text-mist">About this shelf</Text>
          <Text className="mt-3 text-base leading-7 text-ink md:leading-8">{bio}</Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            {chips.map((chip) => (
              <View key={chip} className="rounded-full border border-line bg-paper px-3 py-2">
                <Text className="text-xs text-ink">{chip}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-3">{actions}</View>
      </View>
    </View>
  );
}
