import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { AuthCard } from '@/features/auth/auth-card';
import { useAuth } from '@/lib/auth';

export default function ScanScreen() {
  const { user, loading } = useAuth();

  if (!user && !loading) {
    return (
      <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24 }}>
        <AuthCard />
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 gap-6 bg-parchment px-6 py-8">
      <View className="gap-3 rounded-[28px] border border-line bg-paper p-6">
        <Text className="text-3xl text-ink" style={{ fontFamily: 'Georgia' }}>
          Scan ISBN
        </Text>
        <Text className="text-base leading-7 text-mist">
          Version 1 flow is planned as: open camera, scan a barcode, fetch metadata from Open Library, then let you edit the result before saving.
        </Text>
      </View>

      <View className="min-h-[320px] items-center justify-center rounded-[32px] border border-dashed border-accent bg-[#EADFCF] p-6">
        <Text className="text-center text-lg text-ink">Camera scanner placeholder</Text>
        <Text className="mt-2 max-w-sm text-center text-sm leading-6 text-mist">
          We do not need a Supabase edge function for the first ISBN lookup pass. The app can call Open Library directly and only save the edited result back to Supabase.
        </Text>
      </View>

      <Button label="Next up: wire camera + Open Library lookup" disabled />
    </View>
  );
}
