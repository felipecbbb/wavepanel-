import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * Debug endpoint: devuelve qué ve el server para el usuario autenticado.
 * Temporal, borrar cuando el flujo esté estable.
 */
export async function GET() {
  const cookieStore = await cookies();
  const cookieNames = cookieStore.getAll().map((c) => c.name);

  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();

  const result: Record<string, unknown> = {
    cookieNames,
    user: userData?.user ? { id: userData.user.id, email: userData.user.email } : null,
    userError: userErr?.message ?? null,
  };

  if (userData?.user) {
    const { data: members, error: membersErr } = await supabase
      .from('school_members')
      .select('school_id, user_id, role');

    result.schoolMembersVisibleToPolicy = members;
    result.membersError = membersErr?.message ?? null;

    const { data: myIds, error: rpcErr } = await supabase.rpc('current_user_school_ids');
    result.currentUserSchoolIdsRpc = myIds;
    result.rpcError = rpcErr?.message ?? null;

    const { data: schools, error: schoolErr } = await supabase
      .from('schools')
      .select('id, slug, name');
    result.schoolsVisibleToPolicy = schools;
    result.schoolsError = schoolErr?.message ?? null;
  }

  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
