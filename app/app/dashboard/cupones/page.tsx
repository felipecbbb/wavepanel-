import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { ButtonLink } from '@/components/button';
import { centsToEuros } from '@/lib/slug';

type Coupon = {
  id: string;
  code: string;
  name: string | null;
  discount_type: string;
  discount_value: number;
  applies_to: string;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
};

const APPLIES_LABEL: Record<string, string> = {
  all: 'Todo',
  class: 'Clases',
  camp: 'Camps',
  bono: 'Bonos',
  product: 'Productos',
  rental: 'Alquileres',
};

export default async function CuponesPage() {
  await resolveActiveSchool();
  const supabase = await createClient();

  const { data } = await supabase
    .from('coupons')
    .select('id, code, name, discount_type, discount_value, applies_to, max_uses, used_count, expires_at, active')
    .order('created_at', { ascending: false });

  const coupons = (data ?? []) as Coupon[];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="kicker mb-2">Cupones</p>
          <h1 className="font-display text-4xl text-navy">Descuentos.</h1>
          <p className="mt-2 text-muted text-sm max-w-xl">
            Códigos promocionales que tus clientes pueden aplicar al comprar un bono o reservar un camp desde la web.
          </p>
        </div>
        <ButtonLink href="/dashboard/cupones/nuevo" variant="dark">Nuevo cupón</ButtonLink>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-paper p-10 text-center">
          <h3 className="font-display text-2xl text-navy mb-2">Aún no hay cupones</h3>
          <p className="text-sm text-muted mb-6">Crea el primero para ofrecer descuentos a tus clientes.</p>
          <ButtonLink href="/dashboard/cupones/nuevo" variant="yellow">Crear el primero</ButtonLink>
        </div>
      ) : (
        <div className="rounded-md border border-line bg-paper overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand/50">
              <tr className="text-left">
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Código</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Descuento</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Aplica a</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Usos</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Vigencia</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Estado</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => (
                <tr key={c.id} className={i !== 0 ? 'border-t border-line' : ''}>
                  <td className="px-4 py-3">
                    <a href={`/dashboard/cupones/${c.id}`} className="font-mono font-bold text-navy hover:underline">
                      {c.code}
                    </a>
                    {c.name && <div className="text-xs text-muted">{c.name}</div>}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {c.discount_type === 'percentage' ? `${c.discount_value}%` : centsToEuros(c.discount_value)}
                  </td>
                  <td className="px-4 py-3 text-xs">{APPLIES_LABEL[c.applies_to] ?? c.applies_to}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('es-ES') : 'Sin fecha'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-label text-[0.6rem] px-2 py-0.5 rounded-sm ${c.active ? 'bg-emerald-50 text-emerald-800' : 'bg-sand text-muted'}`}>
                      {c.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
