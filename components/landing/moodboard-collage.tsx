import { Text, View } from 'react-native';

const panels = [
  {
    title: 'Illustrated classics',
    note: 'Ornate bindings, secret gardens, and suspiciously perfect ribbon bookmarks.',
    tone: '#7E5C43',
    accent: '#D7B26D',
    rotation: '-rotate-1',
    height: 'h-80',
  },
  {
    title: 'Margin notes',
    note: 'Soft graphite, pressed flowers, and a page that looks a little bit haunted.',
    tone: '#A98A77',
    accent: '#EFE1D1',
    rotation: 'rotate-1',
    height: 'h-56',
  },
  {
    title: 'Shelf corner',
    note: 'Tea, lamp glow, and one chaotic stack that absolutely counts as decor.',
    tone: '#8F6A52',
    accent: '#D6C1AB',
    rotation: '-rotate-2',
    height: 'h-64',
  },
  {
    title: 'Reblogged art detail',
    note: 'Mirror frames, faded gilt, and the exact shade of antique paper that makes you irrationally emotional.',
    tone: '#C7A26E',
    accent: '#F3E7C8',
    rotation: 'rotate-2',
    height: 'h-48',
  },
];

function PanelShape({ accent, title }: { accent: string; title: string }) {
  return (
    <View className="flex-1 items-center justify-center rounded-[24px] border border-[#5B5248]/30" style={{ backgroundColor: accent }}>
      <View className="h-16 w-16 rounded-full border border-[#5B5248]/50 bg-transparent" />
      <Text className="mt-4 px-6 text-center text-lg text-[#4E453D]" style={{ fontFamily: 'Georgia' }}>
        {title}
      </Text>
    </View>
  );
}

function MoodboardCard({
  accent,
  height,
  note,
  rotation,
  title,
  tone,
}: {
  accent: string;
  height: string;
  note: string;
  rotation: string;
  title: string;
  tone: string;
}) {
  return (
    <View className={`gap-4 rounded-[32px] border border-line p-4 shadow-card ${rotation}`} style={{ backgroundColor: tone }}>
      <View className={`rounded-[28px] ${height}`}>
        <PanelShape accent={accent} title={title} />
      </View>
      <View className="rounded-[24px] bg-[#F7F0E4]/92 p-4">
        <Text className="text-xs uppercase tracking-[2px] text-mist">Reblogged detail</Text>
        <Text className="mt-2 text-base leading-7 text-ink">{note}</Text>
      </View>
    </View>
  );
}

export function MoodboardCollage() {
  return (
    <View className="gap-5 md:flex-row md:items-start">
      <View className="gap-5 md:flex-[1.15]">
        <MoodboardCard {...panels[0]} />
        <View className="md:ml-10 md:max-w-[78%]">
          <MoodboardCard {...panels[3]} />
        </View>
      </View>

      <View className="gap-5 md:flex-1 md:pt-10">
        <View className="md:mr-8">
          <MoodboardCard {...panels[1]} />
        </View>
        <View className="md:ml-6">
          <MoodboardCard {...panels[2]} />
        </View>
      </View>
    </View>
  );
}
