import { createBrowserClient } from '@supabase/ssr'
import { supabaseUrl, supabaseAnonKey } from './config';

export function getSupabaseBrowserClient() {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
