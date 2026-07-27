import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra || {}) as {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
};

const supabasePublishableKey =
  extra.supabasePublishableKey ??
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  '';

export const env = {
  supabaseUrl: extra.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabasePublishableKey,
};

export const hasSupabaseEnv = Boolean(env.supabaseUrl && env.supabasePublishableKey);

export const missingSupabaseEnvMessage =
  'This build is missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Set them in EAS so the Android app can talk to your real Supabase project.';
