import { ReactNode } from 'react';
import { Text, View } from 'react-native';

type ProfileHeroProps = {
  title: string;
  handle: string;
  subtitle: string;
  bio: string;
  actions: ReactNode;
};

const profileHighlights = [
  'Vintage illustration energy',
  'Private catalogue plus public shelf feeling',
  'Built for quiet collecting and dramatic TBR piles',
];

export function ProfileHero({ actions, bio, handle, subtitle, title }: ProfileHeroProps) {
  return (
    <View className="gap-6 rounded-[38px] border border-line bg-paper px-6 py-7 md:flex-row md:items-center md:justify-between">
      <View className="flex-1 gap-6 md:max-w-[42%]">
        <View className="gap-4">
          <View className="h-[320px] rounded-[34px] border border-[#C3B39C] bg-[#E5D5B3] p-4 shadow-card">
            <View className="flex-1 rounded-[28px] border border-[#6F665D] bg-[#F0E1B8] px-5 py-6">
              <View className="flex-1 items-center justify-center rounded-[22px] border border-[#6F665D] bg-[#F7EBCB]">
                <View className="h-48 w-40 rounded-[90px] border-[10px] border-[#5D554A] bg-[#E4C682] p-3">
                  <View className="flex-1 items-center justify-center rounded-[70px] border border-[#5D554A] bg-[#EFD9A0]">
                    <Text className="text-center text-sm uppercase tracking-[3px] text-[#5D554A]">Artwork</Text>
                    <Text className="mt-3 px-6 text-center text-2xl text-[#5D554A]" style={{ fontFamily: 'Georgia' }}>
                      Alice-in-the-library atmosphere
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="rounded-[26px] border border-line bg-parchment px-5 py-4">
            <Text className="text-xs uppercase tracking-[2px] text-mist">Shelf memo</Text>
            <Text className="mt-3 text-lg leading-8 text-ink" style={{ fontFamily: 'Georgia' }}>
              {subtitle}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-1 gap-6 md:max-w-[52%]">
        <View className="gap-3">
          <Text className="text-xs uppercase tracking-[2.5px] text-mist">{handle}</Text>
          <Text className="text-5xl leading-[62px] text-ink md:text-6xl md:leading-[78px]" style={{ fontFamily: 'Georgia' }}>
            {title}
          </Text>
          <Text className="max-w-2xl text-lg leading-8 text-mist">{bio}</Text>
        </View>

        <View className="flex-row flex-wrap gap-3">
          {profileHighlights.map((highlight) => (
            <View key={highlight} className="rounded-full border border-line bg-parchment px-4 py-2">
              <Text className="text-sm text-ink">{highlight}</Text>
            </View>
          ))}
        </View>

        <View className="rounded-[30px] border border-line bg-[#F8F3EA] p-5">
          <Text className="text-xs uppercase tracking-[2px] text-mist">About this shelf</Text>
          <Text className="mt-3 text-base leading-8 text-ink">
            A dreamy catalogue space for collecting editions, curating little moodboard moments, and pretending every stack of books is an intentional still life instead of a cry for help.
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            <View className="rounded-full border border-line bg-paper px-3 py-2">
              <Text className="text-xs text-ink">Book blogger energy</Text>
            </View>
            <View className="rounded-full border border-line bg-paper px-3 py-2">
              <Text className="text-xs text-ink">Pinned post main character</Text>
            </View>
            <View className="rounded-full border border-line bg-paper px-3 py-2">
              <Text className="text-xs text-ink">Ask box enabled</Text>
            </View>
          </View>
        </View>

        <View className="gap-3">{actions}</View>
      </View>
    </View>
  );
}
