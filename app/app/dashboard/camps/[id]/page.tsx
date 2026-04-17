import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { centsToEuros } from '@/lib/slug';
import CampForm from '../camp-form';
import NewBookingForm from './new-booking-form';
import { BookingStatusMenu, RecordPaymentButton } from './booking-actions';
import { updateCampAction, deleteCampAction } from '../actions';

type Camp = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  hero_image_url: string | null;
  starts_on: string;
  ends_on: string;
  max_spots: number;
  spots_taken: number;
  base_price_cents: number;
  deposit_cents: number;
  early_bird_price_cents: number | null;
  early_bird_until: string | null;
  status: string;
};

type Booking = {
  id: string;
  client_id: string;
  participants_count: number;
  total_cents: number;
  paid_cents: number;
  status: string;
  notes: string | null;
  created_at: string;
};

type Client = { id: string; name: string; email: string | null; phone: string | null };

export default async function EditarCampPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await resolveActiveSchool();
  const supabase = await createClient();

  const [{ data: camp }, { data: bookingsData }, { data: clientsData }] = await Promise.all([
    supabase
      .from('surf_camps')
      .select('id, slug, name, description, hero_image_url, starts_on, ends_on, max_spots, spots_taken, base_price_cents, deposit_cents, early_bird_price_cents, early_bird_until, status')
      .eq('id', id)
      .maybeSingle<Camp>(),
    supabase
      .from('camp_bookings')
      .select('id, client_id, participants_count, total_cents, paid_cents, status, notes, created_at')
      .eq('camp_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name, email, phone').order('name'),
  ]);

  if (!camp) notFound();

  const bookings = (bookingsData ?? []) as Booking[];
  const clients = (clientsData ?? []) as Client[];
  const clientById = new Map(clients.map((c) => [c.id, c]));

  const boundUpdate = updateCampAction.bind(null, camp.id);
  const boundDelete = deleteCampAction.bind(null, camp.id);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <a href="/dashboard/camps" className="hover:text-navy">Surf Camps</a>
        <span className="mx-2">/</span>
        <span className="text-navy">{camp.name}</span>
      </nav>

      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="kicker mb-1">Camp</p>
          <h1 className="font-display text-4xl text-navy">{camp.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {new Date(camp.starts_on).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} —{' '}
            {new Date(camp.ends_on).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} · {camp.spots_taken}/{camp.max_spots} plazas
          </p>
        </div>
        <form action={boundDelete}>
          <button
            type="submit"
            className="rounded-sm border border-red-200 text-red-700 px-3 py-1.5 text-[0.76rem] font-label hover:bg-red-50 shrink-0"
            onClick={(e) => {
              if (!confirm(`¿Borrar camp "${camp.name}" y todas sus reservas?`)) e.preventDefault();
            }}
          >
            Borrar camp
          </button>
        </form>
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-label text-[0.72rem] text-muted">Reservas ({bookings.length})</h2>
          <NewBookingForm
            campId={camp.id}
            basePriceCents={camp.early_bird_price_cents ?? camp.base_price_cents}
            depositCents={camp.deposit_cents}
            clients={clients}
          />
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-md border border-dashed border-line bg-paper p-8 text-center text-sm text-muted">
            Aún sin reservas. Crea una manualmente desde el botón de arriba.
          </div>
        ) : (
          <ul className="space-y-2">
            {bookings.map((b) => {
              const c = clientById.get(b.client_id);
              const pending_cents = b.total_cents - b.paid_cents;
              return (
                <li key={b.id} className="rounded-md border border-line bg-paper p-4 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-display text-lg text-navy">
                      {c ? (
                        <a href={`/dashboard/clientes/${c.id}`} className="hover:underline">{c.name}</a>
                      ) : 'Cliente desconocido'}
                      {b.participants_count > 1 && <span className="text-sm text-muted"> · {b.participants_count} personas</span>}
                    </p>
                    <p className="text-xs text-muted">
                      {centsToEuros(b.paid_cents)} pagado de {centsToEuros(b.total_cents)}
                      {pending_cents > 0 && <span className="text-red-600"> · pendiente {centsToEuros(pending_cents)}</span>}
                    </p>
                    {b.notes && <p className="mt-1 text-xs text-muted italic">{b.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <RecordPaymentButton bookingId={b.id} pending_cents={pending_cents} />
                    <BookingStatusMenu bookingId={b.id} status={b.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <h2 className="font-label text-[0.72rem] text-muted mb-3">Datos del camp</h2>
      <CampForm
        action={boundUpdate}
        submitLabel="Guardar cambios"
        initial={{
          name: camp.name,
          slug: camp.slug,
          description: camp.description,
          hero_image_url: camp.hero_image_url,
          starts_on: camp.starts_on,
          ends_on: camp.ends_on,
          max_spots: camp.max_spots,
          base_price_cents: camp.base_price_cents,
          deposit_cents: camp.deposit_cents,
          early_bird_price_cents: camp.early_bird_price_cents,
          early_bird_until: camp.early_bird_until,
          status: camp.status,
        }}
      />
    </div>
  );
}
