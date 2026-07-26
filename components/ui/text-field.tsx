import { Text, TextInput, View } from 'react-native';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
}: TextFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold uppercase tracking-[1.5px] text-mist">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        className="rounded-2xl border border-line bg-parchment px-4 py-3 text-base text-ink"
        placeholderTextColor="#7A726A"
        style={multiline ? { minHeight: 112, textAlignVertical: 'top' } : undefined}
      />
      {error ? <Text className="text-sm text-red-700">{error}</Text> : null}
    </View>
  );
}
