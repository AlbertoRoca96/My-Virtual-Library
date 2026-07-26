import { Text, View } from 'react-native';

type MoodboardPanel = {
  title: string;
  note: string;
  tone: string;
  accent: string;
  rotation: string;
  height: string;
};

type MoodboardCollageProps = {
  panels: MoodboardPanel[];
};

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

function MoodboardCard(panel: MoodboardPanel) {
  return (
    <View className={`gap-4 rounded-[32px] border border-line p-4 shadow-card ${panel.rotation}`} style={{ backgroundColor: panel.tone }}>
      <View className={`rounded-[28px] ${panel.height}`}>
        <PanelShape accent={panel.accent} title={panel.title} />
      </View>
      <View className="rounded-[24px] bg-[#F7F0E4]/92 p-4">
        <Text className="text-xs uppercase tracking-[2px] text-mist">Shelf fragment</Text>
        <Text className="mt-2 text-base leading-7 text-ink">{panel.note}</Text>
      </View>
    </View>
  );
}

export function MoodboardCollage({ panels }: MoodboardCollageProps) {
  const safePanels = panels.slice(0, 4);

  return (
    <View className="gap-5 md:flex-row md:items-start">
      <View className="gap-5 md:flex-[1.15]">
        {safePanels[0] ? <MoodboardCard {...safePanels[0]} /> : null}
        {safePanels[3] ? (
          <View className="md:ml-10 md:max-w-[78%]">
            <MoodboardCard {...safePanels[3]} />
          </View>
        ) : null}
      </View>

      <View className="gap-5 md:flex-1 md:pt-10">
        {safePanels[1] ? (
          <View className="md:mr-8">
            <MoodboardCard {...safePanels[1]} />
          </View>
        ) : null}
        {safePanels[2] ? (
          <View className="md:ml-6">
            <MoodboardCard {...safePanels[2]} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
