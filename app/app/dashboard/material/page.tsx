import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { centsToEuros } from '@/lib/slug';
import { toLocalIsoDate } from '@/lib/dates';
import EquipmentForm from './equipment-form';
import EquipmentRow from './equipment-row';
import RentalForm from './rental-form';
import { RentalStatusMenu, StatusPill } from './rental-actions';

type Equipment = {
  id: string;
  name: string;
  category: string;
  size: string | null;
  stock: number;
  price_per_day_cents: number;
  notes: string | null;
  active: boolean;
};

type Rental = {
  id: string;
  client_id: string | null;
  client_name_snapshot: string | null;
  equipment_id: string;
  starts_on: string;
  ends_on: string;
  quantity: number;
  total_cents: number;
  paid_cents: number;
  status: string;
  notes: string | null;
};

type ClientRow = { id: string; name: string };

export default async function MaterialPage() {
  await resolveActiveSchool();
  const supabase = await createClient();
  const today = toLocalIsoDate(new Date());

  const [{ data: equipmentData }, { data: rentalsData }, { data: clientsData }] = await Promise.all([
    supabase
      .from('rental_equipment')
      .select('id, name, category, size, stock, price_per_day_cents, notes, active')
      .order('category', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('rentals')
      .select('id, client_id, client_name_snapshot, equipment_id, starts_on, ends_on, quantity, total_cents, paid_cents, status, notes')
      .gte('ends_on', today)
      .neq('status', 'cancelled')
      .order('starts_on', { ascending: true })
      .limit(100),
    supabase.from('clients').select('id, name').order('name'),
  ]);

  const equipment = (equipmentData ?? []) as Equipment[];
  const rentals = (rentalsData ?? []) as Rental[];
  const clients = (clientsData ?? []) as ClientRow[];

  const clientById = new Map(clients.map((c) => [c.id, c]));
  const equipmentById = new Map(equipment.map((e) => [e.id, e]));

  const activeEquipmentForRental = equipment
    .filter((e) => e.active)
    .map((e) => ({ id: e.id, name: e.name, size: e.size, price_per_day_cents: e.price_per_day_cents, stock: e.stock }));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker mb-2">Alquiler</p>
          <h1 className="font-display text-4xl text-navy">Material.</h1>
          <p className="mt-2 text-muted text-sm max-w-xl">
            Inventario y alquileres activos. Tablas, neoprenos y demás.
          </p>
        </div>
        <RentalForm equipment={activeEquipmentForRental} clients={clients} />
      </header>

      <section className="mb-12 rounded-md border border-line bg-paper overflow-hidden">
        <header className="p-4 border-b border-line flex items-center justify-between gap-4">
          <h2 className="font-label text-[0.72rem] text-muted">Inventario</h2>
          <span className="text-xs text-muted">{equipment.length} items · {equipment.reduce((s, e) => s + e.stock, 0)} unidades totales</span>
        </header>
        {equipment.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted italic">
            Aún no hay material. Añade el primero abajo.
          </div>
        ) : (
          <ul>
            {equipment.map((e) => <EquipmentRow key={e.id} {...e} />)}
          </ul>
        )}
        <div className="p-4 bg-sand/30 border-t border-line">
          <h3 className="font-label text-[0.66rem] text-muted mb-3">Añadir material</h3>
          <EquipmentForm />
        </div>
      </section>

      <section className="rounded-md border border-line bg-paper overflow-hidden">
        <header className="p-4 border-b border-line flex items-center justify-between gap-4">
          <h2 className="font-label text-[0.72rem] text-muted">Alquileres activos y futuros</h2>
          <span className="text-xs text-muted">{rentals.length} en curso</span>
        </header>
        {rentals.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted italic">
            No hay alquileres activos. Crea el primero con "Nuevo alquiler".
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rentals.map((r) => {
              const eq = equipmentById.get(r.equipment_id);
              const clientName = r.client_id ? clientById.get(r.client_id)?.name : r.client_name_snapshot;
              const pending = r.total_cents - r.paid_cents;
              return (
                <li key={r.id} className="p-4 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[220px]">
                    <p className="font-display text-lg text-navy">
                      {clientName ?? 'Cliente'}
                      {r.quantity > 1 && <span className="text-sm text-muted"> · ×{r.quantity}</span>}
                    </p>
                    <p className="text-xs text-muted">
                      {eq ? `${eq.name}${eq.size ? ` (${eq.size})` : ''}` : 'Material eliminado'} ·{' '}
                      {new Date(r.starts_on).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}{' '}→{' '}
                      {new Date(r.ends_on).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-xs">
                      <span className="text-navy font-semibold">{centsToEuros(r.total_cents)}</span>
                      <span className="text-muted"> total · {centsToEuros(r.paid_cents)} pagado</span>
                      {pending > 0 && <span className="text-red-600 ml-1">· pendiente {centsToEuros(pending)}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill status={r.status} />
                    <RentalStatusMenu rentalId={r.id} status={r.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
