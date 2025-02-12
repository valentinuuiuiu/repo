import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://wcinyhzjjdjdygjxcqnz.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjaW55aHpqamRqZHlnanhjcW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk5MzE4MTYsImV4cCI6MjA0NTUwNzgxNn0.q1iISmFsHyHvNTWsUD6Yov49EPadDVKyBhXVHo_wfqs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
