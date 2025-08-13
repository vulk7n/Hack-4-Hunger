
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SupabaseClient } from '@supabase/supabase-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPublicUrl(supabase: SupabaseClient, bucket: string, path: string | null) {
    if (!path) return "https://placehold.co/600x400.png";
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}
