import { Text, View } from 'react-native';

const tags = ['classics', 'annotated copies', 'gothic moods', 'bookshelf tour'];

export function PinnedPost() {
  return (
    <View className="gap-4 rounded-[34px] border border-[#3D3733] bg-[#2A2522] p-5 text-white shadow-card">
      <View className="flex-row flex-wrap items-center justify-between gap-3 border-b border-[#4A423C] pb-4">
        <View className="flex-row items-center gap-3">
          <View className="h-14 w-14 rounded-[18px] border border-[#6A5E55] bg-[#DCC38D]" />
          <View>
            <Text className="text-lg text-white" style={{ fontFamily: 'Georgia' }}>
              myvirtualbookshelf reblogged
            </Text>
            <Text className="text-sm text-[#C9BBB0]">Pinned post • reading diary • shelf manifesto • 17 Feb 2022</Text>
          </View>
        </View>
        <View className="rounded-full border border-[#5A5049] px-3 py-2">
          <Text className="text-xs uppercase tracking-[2px] text-[#E6D9C8]">Pinned</Text>
        </View>
      </View>

      <View className="gap-5 md:flex-row">
        <View className="md:flex-[1.1]">
          <View className="h-80 rounded-[28px] border border-[#5A5049] bg-[#C9A368] p-3">
            <View className="flex-1 rounded-[22px] border border-[#5A5049] bg-[#E6D0A1]" />
          </View>
        </View>

        <View className="gap-4 md:flex-1">
          <View className="gap-3">
            <Text className="text-3xl leading-[42px] text-white" style={{ fontFamily: 'Georgia' }}>
              This is where I spend all my time reblogging pictures of books instead of actually reducing the TBR.
            </Text>
            <Text className="text-base leading-8 text-[#D7CABB]">
              The shelf should feel intimate, a little over-curated, and slightly theatrical. It should look like the kind of place where a person has opinions about endpapers and owns too many editions of the same novel for entirely emotional reasons.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <View key={tag} className="rounded-full border border-[#5A5049] bg-[#352F2B] px-3 py-2">
                <Text className="text-xs text-[#E8D9C7]">#{tag}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row items-center justify-between border-t border-[#4A423C] pt-4">
            <Text className="text-sm text-[#C9BBB0]">2,903 notes • reblogged from bibliophile-at-heart</Text>
            <View className="flex-row gap-3">
              <Text className="text-sm text-[#E6D9C8]">reblog</Text>
              <Text className="text-sm text-[#E6D9C8]">heart</Text>
              <Text className="text-sm text-[#E6D9C8]">more</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
