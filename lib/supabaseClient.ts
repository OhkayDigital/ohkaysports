import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL. The dashboard will render placeholder states until you add credentials."
  );
}

if (!supabaseAnonKey) {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Mutations will be disabled until you configure Supabase credentials."
  );
}

export const supabaseBrowserClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : undefined;
