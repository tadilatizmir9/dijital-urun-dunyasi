import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://wkqsvmvkobbybrrosvyv.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrcXN2bXZrb2JieWJycm9zdnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODEzMDIsImV4cCI6MjA4MDE1NzMwMn0.qPYRg7juLsAOyJBu3_2ZouBrf4B8IZYGsSeJWRdPmcE";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
