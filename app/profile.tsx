import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, View } from 'react-native';
import { z } from 'zod';

import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/features/auth/auth-card';
import { useProfile, useUpsertProfile } from '@/features/profile/use-profile';
import { useAuth } from '@/lib/auth';

const profileSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().optional(),
  shelfTitle: z.string().optional(),
  shelfSubtitle: z.string().optional(),
  shelfDescription: z.string().optional(),
  readingMood: z.string().optional(),
  privateNote: z.string().optional(),
  collectionFocus: z.string().optional(),
  artworkTitle: z.string().optional(),
  highlightOne: z.string().optional(),
  highlightTwo: z.string().optional(),
  highlightThree: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileScreen() {
  const { user, loading } = useAuth();
  const profileQuery = useProfile();
  const upsertProfile = useUpsertProfile();
  const profile = profileQuery.data;
  const {
    control,
    handleSubmit,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      displayName: profile?.displayName ?? '',
      bio: profile?.bio ?? '',
      shelfTitle: profile?.shelfTitle ?? '',
      shelfSubtitle: profile?.shelfSubtitle ?? '',
      shelfDescription: profile?.shelfDescription ?? '',
      readingMood: profile?.readingMood ?? '',
      privateNote: profile?.privateNote ?? '',
      collectionFocus: profile?.collectionFocus ?? '',
      artworkTitle: profile?.artworkTitle ?? '',
      highlightOne: profile?.highlightOne ?? '',
      highlightTwo: profile?.highlightTwo ?? '',
      highlightThree: profile?.highlightThree ?? '',
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    upsertProfile.mutate(values, {
      onSuccess: () => Alert.alert('Sanctuary updated', 'Your shelf page now reflects your real settings.'),
      onError: (error: Error) => Alert.alert('Update failed', error.message),
    });
  };

  if (!user && !loading) {
    return (
      <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24 }}>
        <AuthCard />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24, gap: 24 }}>
      <View className="gap-3 rounded-[28px] border border-line bg-paper p-6">
        <Text className="text-3xl text-ink" style={{ fontFamily: 'Georgia' }}>
          Edit your sanctuary
        </Text>
        <Text className="text-base leading-7 text-mist">
          Fill in only what you actually want. Empty fields stay empty and the landing page will show honest quiet states instead of fake lore.
        </Text>
      </View>

      <View className="gap-4 rounded-[28px] border border-line bg-paper p-6">
        <Controller control={control} name="displayName" render={({ field }) => <TextField label="Display name" value={field.value ?? ''} onChangeText={field.onChange} placeholder="Your name" />} />
        <Controller control={control} name="shelfTitle" render={({ field }) => <TextField label="Shelf title" value={field.value ?? ''} onChangeText={field.onChange} placeholder="My Virtual Bookshelf" />} />
        <Controller control={control} name="shelfSubtitle" render={({ field }) => <TextField label="Shelf subtitle" value={field.value ?? ''} onChangeText={field.onChange} placeholder="A soft little corner for your books" />} />
        <Controller control={control} name="bio" render={({ field }) => <TextField label="Short bio" value={field.value ?? ''} onChangeText={field.onChange} placeholder="What this shelf is for" multiline />} />
        <Controller control={control} name="shelfDescription" render={({ field }) => <TextField label="Shelf description" value={field.value ?? ''} onChangeText={field.onChange} placeholder="Describe the room you want this shelf to feel like" multiline />} />
        <Controller control={control} name="privateNote" render={({ field }) => <TextField label="Pinned shelf note" value={field.value ?? ''} onChangeText={field.onChange} placeholder="A note to keep near the top of your shelf" multiline />} />
        <Controller control={control} name="collectionFocus" render={({ field }) => <TextField label="Collection focus" value={field.value ?? ''} onChangeText={field.onChange} placeholder="Illustrated classics, gothic fiction, etc." />} />
        <Controller control={control} name="readingMood" render={({ field }) => <TextField label="Reading mood" value={field.value ?? ''} onChangeText={field.onChange} placeholder="Quiet, restless, dreamy..." />} />
        <Controller control={control} name="artworkTitle" render={({ field }) => <TextField label="Artwork caption" value={field.value ?? ''} onChangeText={field.onChange} placeholder="Describe the visual anchor of your shelf" />} />
        <Controller control={control} name="highlightOne" render={({ field }) => <TextField label="Highlight chip 1" value={field.value ?? ''} onChangeText={field.onChange} placeholder="Personal catalogue sanctuary" />} />
        <Controller control={control} name="highlightTwo" render={({ field }) => <TextField label="Highlight chip 2" value={field.value ?? ''} onChangeText={field.onChange} placeholder="Quiet collecting" />} />
        <Controller control={control} name="highlightThree" render={({ field }) => <TextField label="Highlight chip 3" value={field.value ?? ''} onChangeText={field.onChange} placeholder="Dramatic TBR piles" />} />
        <Button label={upsertProfile.isPending ? 'Saving...' : 'Save sanctuary'} onPress={handleSubmit(onSubmit)} disabled={upsertProfile.isPending} />
      </View>
    </ScrollView>
  );
}
