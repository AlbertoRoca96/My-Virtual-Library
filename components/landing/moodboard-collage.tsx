import { Text, View } from 'react-native';

const panels = [
  {
    title: 'Illustrated classics',
    note: 'Ornate bindings, secret gardens, and suspiciously perfect ribbon bookmarks.',
    tone: '#7E5C43',
    accent: '#D7B26D',
    size: 'large',
  },
  {
    title: 'Margin notes',
    note: 'Soft graphite, pressed flowers, and a page that looks a little bit haunted.',
    tone: '#A98A77',
    accent: '#EFE1D1',
    size: 'medium',
  },
  {
    title: 'Shelf corner',
    note: 'Tea, lamp glow, and one chaotic stack that absolutely counts as decor.',
    tone: '#8F6A52',
    accent: '#D6C1AB',
    size: 'medium',
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

export function MoodboardCollage() {
  return (
    <View className="gap-4 md:flex-row">
      {panels.map((panel) => (
        <View
          key={panel.title}
          className={`gap-4 rounded-[32px] border border-line p-4 ${panel.size === 'large' ? 'md:flex-[1.2]' : 'md:flex-1'}`}
          style={{ backgroundColor: panel.tone }}
        >
          <View className={`rounded-[28px] ${panel.size === 'large' ? 'h-72' : 'h-52'}`}>
            <PanelShape accent={panel.accent} title={panel.title} />
          </View>
          <View className="rounded-[24px] bg-[#F7F0E4]/90 p-4">
            <Text className="text-xs uppercase tracking-[2px] text-mist">Moodboard note</Text>
            <Text className="mt-2 text-base leading-7 text-ink">{panel.note}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
