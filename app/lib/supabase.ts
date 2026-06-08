import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  level: number;
  points: number;
  avatar_initials: string;
};
