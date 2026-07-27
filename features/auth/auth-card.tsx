import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { getAuthRedirectUrl } from '@/lib/auth-redirect';
import { hasSupabaseEnv, missingSupabaseEnvMessage } from '@/lib/env';
import { supabase } from '@/lib/supabase';

const authSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Use at least 6 characters'),
});

type AuthFormValues = z.infer<typeof authSchema>;

export function AuthCard() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUp = useMutation({
    mutationFn: async ({ email, password }: AuthFormValues) => {
      if (!hasSupabaseEnv) {
        throw new Error(missingSupabaseEnvMessage);
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });
      if (error) throw error;
    },
    onSuccess: () => Alert.alert('Account created', 'Check your email for confirmation if Supabase email confirmation is enabled.'),
    onError: (error: Error) => Alert.alert('Sign up failed', error.message),
  });

  const signIn = useMutation({
    mutationFn: async ({ email, password }: AuthFormValues) => {
      if (!hasSupabaseEnv) {
        throw new Error(missingSupabaseEnvMessage);
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    onError: (error: Error) => Alert.alert('Sign in failed', error.message),
  });

  const magicLink = useMutation({
    mutationFn: async () => {
      if (!hasSupabaseEnv) {
        throw new Error(missingSupabaseEnvMessage);
      }

      const email = getValues('email');
      const emailResult = z.string().email().safeParse(email);
      if (!emailResult.success) {
        throw new Error('Enter a valid email before requesting a magic link.');
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });
      if (error) throw error;
    },
    onSuccess: () => Alert.alert('Magic link sent', 'Check your email for the sign-in link.'),
    onError: (error: Error) => Alert.alert('Magic link failed', error.message),
  });

  const busy = signIn.isPending || signUp.isPending || magicLink.isPending;

  return (
    <View className="w-full max-w-xl gap-4 rounded-[32px] border border-line bg-paper p-6">
      <View className="gap-2">
        <Text className="text-3xl text-ink" style={{ fontFamily: 'Georgia' }}>
          Sign in to your shelf
        </Text>
        <Text className="text-base leading-7 text-mist">
          Email/password and magic link are both wired. Because why choose one sensible path when we can support two without being disgusting about it?
        </Text>
      </View>

      {!hasSupabaseEnv ? (
        <View className="rounded-[24px] border border-red-300 bg-red-50 p-4">
          <Text className="text-sm leading-6 text-red-900">{missingSupabaseEnvMessage}</Text>
        </View>
      ) : null}

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            label="Password"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="At least 6 characters"
            autoCapitalize="none"
            error={errors.password?.message}
          />
        )}
      />

      <View className="gap-3">
        <Button label={signIn.isPending ? 'Signing in...' : 'Sign in'} onPress={handleSubmit((values) => signIn.mutate(values))} disabled={busy || !hasSupabaseEnv} />
        <Button label={signUp.isPending ? 'Creating account...' : 'Create account'} variant="secondary" onPress={handleSubmit((values) => signUp.mutate(values))} disabled={busy || !hasSupabaseEnv} />
        <Button label={magicLink.isPending ? 'Sending magic link...' : 'Send magic link'} variant="secondary" onPress={() => magicLink.mutate()} disabled={busy || !hasSupabaseEnv} />
      </View>
    </View>
  );
}
