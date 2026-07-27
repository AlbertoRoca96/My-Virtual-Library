import type { ConfigContext, ExpoConfig } from '@expo/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export default ({ config }: ConfigContext): ExpoConfig => {
  const staticExpoConfig = (require('./app.json') as { expo: ExpoConfig }).expo;

  return {
    ...staticExpoConfig,
    ...config,
    extra: {
      ...staticExpoConfig.extra,
      ...config.extra,
      supabaseUrl,
      supabasePublishableKey,
    },
  };
};
