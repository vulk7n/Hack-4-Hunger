
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    if (!bucket || (bucket !== 'donations' && bucket !== 'avatars')) {
        return NextResponse.json({ error: 'Invalid bucket specified.' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const filePath = `${user.id}/${uuidv4()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ path: data.path });
  } catch (e: any) {
    console.error('Upload API Error:', e);
    return NextResponse.json({ error: e.message || 'An unknown error occurred.' }, { status: 500 });
  }
}
