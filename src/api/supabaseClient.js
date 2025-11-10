console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

import { createClient } from '@supabase/supabase-js';

console.log("🟣 VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("🟢 VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);


export const supabase = createClient(supabaseUrl, supabaseKey);
