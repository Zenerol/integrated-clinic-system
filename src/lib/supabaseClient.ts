import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const defaultSupabaseUrl = 'https://kjjyyblgtmwronvudvxc.supabase.co';
const defaultSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqanl5YmxndG13cm9udnVkdnhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM4NDkzMSwiZXhwIjoyMTA0OTYwOTMxfQ.9TUBie0v5g58CIkZH0yiA0zcFu2l61xvIe-YIceftMk';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
