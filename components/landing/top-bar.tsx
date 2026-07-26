import { Text, View } from 'react-native';

const actions = [
  { mark: 'Q', label: 'Search' },
  { mark: 'M', label: 'Mood' },
  { mark: 'N', label: 'Notes' },
  { mark: 'G', label: 'Settings' },
];

type TopBarProps = {
  shelfName: string;
};

export function TopBar({ shelfName }: TopBarProps) {
  return (
    <View className="flex-row flex-wrap items-center justify-between gap-4 rounded-[30px] border border-line bg-[#F7F2E9] px-5 py-4">
      <View className="gap-1">
        <Text className="text-xs uppercase tracking-[2.5px] text-mist">Private reading room</Text>
        <Text className="text-2xl text-ink" style={{ fontFamily: 'Georgia' }}>
          {shelfName}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {actions.map((action) => (
          <View key={action.label} className="items-center gap-1">
            <View className="h-11 w-11 items-center justify-center rounded-full border border-line bg-paper">
              <Text className="text-sm font-semibold text-ink">{action.mark}</Text>
            </View>
            <Text className="text-xs text-mist">{action.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
