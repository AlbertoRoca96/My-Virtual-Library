import { Pressable, Text } from 'react-native';

type ButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
  disabled?: boolean;
};

export function Button({ label, variant = 'primary', onPress, disabled = false }: ButtonProps) {
  const base = 'items-center rounded-full px-5 py-3';
  const styles =
    variant === 'primary'
      ? 'bg-night border border-night'
      : 'bg-paper border border-line';
  const textStyles = variant === 'primary' ? 'text-parchment' : 'text-ink';

  return (
    <Pressable className={`${base} ${styles} ${disabled ? 'opacity-50' : ''}`} onPress={onPress} disabled={disabled}>
      <Text className={`text-base font-semibold ${textStyles}`}>{label}</Text>
    </Pressable>
  );
}
