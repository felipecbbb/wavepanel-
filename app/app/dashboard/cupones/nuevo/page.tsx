import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import CouponForm from '../coupon-form';
import { createCouponAction } from '../actions';

export default async function NuevoCuponPage() {
  await resolveActiveSchool();
  const supabase = await createClient();
  const [{ data: activities }, { data: camps }] = await Promise.all([
    supabase.from('activities').select('id, name').order('name'),
    supabase.from('surf_camps').select('id, name').order('starts_on', { ascending: false }),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/dashboard/cupones" className="hover:text-navy">Cupones</Link>
        <span className="mx-2">/</span>
        <span className="text-navy">Nuevo</span>
      </nav>
      <p className="kicker mb-2">Crear cupón</p>
      <h1 className="font-display text-4xl text-navy mb-8">Nuevo cupón.</h1>
      <CouponForm
        action={createCouponAction}
        activities={(activities ?? []) as { id: string; name: string }[]}
        camps={(camps ?? []) as { id: string; name: string }[]}
        submitLabel="Crear cupón"
      />
    </div>
  );
}
