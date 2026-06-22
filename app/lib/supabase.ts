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
  role: string | null;
  location: string | null;
  bio: string | null;
  stack: string[];
  availability: string[];
  disciplines: string[];
  github: string | null;
  devpost: string | null;
  photo_url?: string | null;
  username?: string | null;
  public_profile_enabled?: boolean | null;
  level: number;
  points: number;
  avatar_initials: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status?: string | null;
  type?: string | null;
  github_url: string | null;
  demo_url?: string | null;
  url?: string | null;
  devpost_url?: string | null;
  photo_url?: string | null;
  hackathon_name?: string | null;
  placement?: string | null;
  year?: string | null;
  stack: string[];
  tier: number;
  verified: boolean;
  points_awarded: number;
  created_at: string;
};

export type UserHackathon = {
  id: string;
  user_id: string;
  name: string;
  event_name: string | null;
  description: string | null;
  url: string | null;
  stack: string[];
  placement: number | null;
  team_size: number | null;
  date: string | null;
  created_at: string;
};
