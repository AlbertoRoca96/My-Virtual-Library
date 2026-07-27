import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

type MetadataRescueCardProps = {
  visible: boolean;
  pending: boolean;
  onSearch: () => void;
};

export function MetadataRescueCard({ visible, pending, onSearch }: MetadataRescueCardProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="gap-3 rounded-[24px] border border-dashed border-accent bg-[#EADFCF] p-5">
      <Text className="text-lg text-ink" style={{ fontFamily: 'Georgia' }}>
        ISBN lookup struck out
      </Text>
      <Text className="text-base leading-7 text-mist">
        Some books are too obscure for a clean ISBN hit. Use the front cover for title/author and the back cover for publisher clues, type whatever you can into the form below, then let the app try a broader metadata rescue search instead of making you do all the typing yourself.
      </Text>
      <Button label={pending ? 'Searching cover clues...' : 'Search using cover clues'} variant="secondary" onPress={onSearch} disabled={pending} />
    </View>
  );
}
