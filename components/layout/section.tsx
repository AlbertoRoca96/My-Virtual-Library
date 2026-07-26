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
    <View className="gap-5">
      <View className="gap-3">
        {eyebrow ? <Text className="text-xs uppercase tracking-[2px] text-mist">{eyebrow}</Text> : null}
        <Text className="text-4xl leading-[52px] text-ink" style={{ fontFamily: 'Georgia' }}>
          {title}
        </Text>
        {description ? <Text className="max-w-4xl text-base leading-7 text-mist">{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}
