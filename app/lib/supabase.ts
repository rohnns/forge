import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage (default) but also set secure cookies
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      // Identify client requests
      "x-client-info": "forge-web",
    },
  },
});

export type Profile = {
  id: string;
  name: string;
  role: string;
  location: string;
  bio: string;
  stack: string[];
  availability: string[];
  disciplines: string[];
  github: string;
  devpost: string;
  photo_url?: string;
  level: number;
  points: number;
  avatar_initials: string;
};
