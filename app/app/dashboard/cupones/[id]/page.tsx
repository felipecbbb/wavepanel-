import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import CouponForm from '../coupon-form';
import { updateCouponAction, deleteCouponAction } from '../actions';
import DeleteButton from '@/components/delete-button';

type Coupon = {
  id: string;
  code: string;
  name: string | null;
  discount_type: string;
  discount_value: number;
  applies_to: string;
  activity_id: string | null;
  camp_id: string | null;
  min_amount_cents: number;
  max_uses: number | null;
  max_uses_per_user: number | null;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
};

export default async function EditarCuponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await resolveActiveSchool();
  const supabase = await createClient();

  const [{ data: coupon }, { data: activities }, { data: camps }] = await Promise.all([
    supabase
      .from('coupons')
      .select('id, code, name, discount_type, discount_value, applies_to, activity_id, camp_id, min_amount_cents, max_uses, max_uses_per_user, starts_at, expires_at, active')
      .eq('id', id)
      .maybeSingle<Coupon>(),
    supabase.from('activities').select('id, name').order('name'),
    supabase.from('surf_camps').select('id, name').order('starts_on', { ascending: false }),
  ]);

  if (!coupon) notFound();

  const boundUpdate = updateCouponAction.bind(null, coupon.id);
  const boundDelete = deleteCouponAction.bind(null, coupon.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/dashboard/cupones" className="hover:text-navy">Cupones</Link>
        <span className="mx-2">/</span>
        <span className="text-navy font-mono">{coupon.code}</span>
      </nav>

      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <p className="kicker mb-1">Editar cupón</p>
          <h1 className="font-display text-4xl text-navy font-mono">{coupon.code}</h1>
        </div>
        <DeleteButton
          action={boundDelete}
          confirmMessage={`¿Borrar cupón "${coupon.code}"?`}
          label="Borrar"
        />
      </div>

      <CouponForm
        action={boundUpdate}
        initial={coupon}
        activities={(activities ?? []) as { id: string; name: string }[]}
        camps={(camps ?? []) as { id: string; name: string }[]}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
