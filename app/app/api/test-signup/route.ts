import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Endpoint de test temporal para depurar el flujo de signup.
 * Devuelve JSON con cada paso. Eliminar cuando el flujo sea estable.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rand = Math.random().toString(36).slice(2, 8);
    const email = body.email ?? `test-${rand}@wavepanel.test`;
    const password = body.password ?? 'password123456';
    const schoolName = body.schoolName ?? `Escuela Test ${rand}`;
    const slug = body.slug ?? `test-${rand}`;

    const supabase = await createClient();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return NextResponse.json(
        { step: 'signup', ok: false, error: signUpError.message, code: signUpError.status },
        { status: 200 },
      );
    }

    const hasSession = !!signUpData.session;
    const userId = signUpData.user?.id;

    if (!hasSession) {
      return NextResponse.json({
        step: 'signup',
        ok: true,
        hasSession: false,
        userId,
        note: 'signUp devolvió sin session — probablemente Supabase sigue exigiendo confirmación de email',
      });
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc('create_school_with_owner', {
      p_slug: slug,
      p_name: schoolName,
    });

    if (rpcError) {
      return NextResponse.json({
        step: 'rpc',
        ok: false,
        userId,
        error: rpcError.message,
        code: rpcError.code,
        details: rpcError.details,
        hint: rpcError.hint,
      });
    }

    return NextResponse.json({
      step: 'done',
      ok: true,
      userId,
      school: rpcData,
    });
  } catch (e) {
    return NextResponse.json(
      { step: 'exception', ok: false, error: String(e) },
      { status: 500 },
    );
  }
}
