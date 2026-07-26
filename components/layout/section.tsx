import { ReactNode } from 'react';
import { Text, View } from 'react-native';

type SectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Section({ eyebrow, title, description, children }: SectionProps) {
  return (
    <View className="gap-4">
      <View className="gap-2">
        {eyebrow ? <Text className="text-xs uppercase tracking-[2px] text-mist">{eyebrow}</Text> : null}
        <Text className="text-3xl text-ink" style={{ fontFamily: 'Georgia' }}>
          {title}
        </Text>
        {description ? <Text className="text-base leading-6 text-mist">{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}
