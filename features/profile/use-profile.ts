import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchProfile, upsertProfile } from '@/features/profile/profile-api';
import { ProfileInput } from '@/lib/database.types';

const profileKey = ['profile'];

export function useProfile() {
  return useQuery({
    queryKey: profileKey,
    queryFn: fetchProfile,
  });
}

export function useUpsertProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileInput) => upsertProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKey });
    },
  });
}
