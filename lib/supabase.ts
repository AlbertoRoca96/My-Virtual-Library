import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { env, hasSupabaseEnv } from '@/lib/env';

const supabaseUrl = hasSupabaseEnv ? env.supabaseUrl : 'http://127.0.0.1';
const supabasePublishableKey = hasSupabaseEnv ? env.supabasePublishableKey : 'missing-supabase-env';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
