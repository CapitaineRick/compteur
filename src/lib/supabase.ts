import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qhtzgblkqsfaoabnixfj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodHpnYmxrcXNmYW9hYm5peGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjU2MTAsImV4cCI6MjA3NzI0MTYxMH0.zZ_KwsiwEr-ctjtfUAF2wnb3LGa2NTJhV2wtmr6SICs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AnecdoteCounter = {
  id: string;
  person_name: string;
  count: number;
  created_at: string;
  updated_at: string;
};
