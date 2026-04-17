import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import ClientForm from '../client-form';
import ClientTabs from './client-tabs';
import FamilyEditor from './family-editor';
import SellBonoForm from './sell-bono-form';
import RecordPaymentForm from './record-payment-form';
import {
  EnrollmentsList,
  BonosList,
  CampBookingsList,
  PaymentsList,
  type EnrollmentHistory,
  type BonoHistory,
  type CampBookingHistory,
  type PaymentHistory,
} from './history-lists';
import { updateClientAction, deleteClientAction } from '../actions';

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  tags: string[];
  birth_date: string | null;
  can_swim: boolean | null;
  has_injury: boolean;
  injury_detail: string | null;
  wetsuit_size: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
};

type Member = {
  id: string;
  full_name: string;
  birth_date: string | null;
  level: string | null;
  notes: string | null;
  can_swim: boolean | null;
  has_injury: boolean;
  injury_detail: string | null;
  wetsuit_size: string | null;
};

type Pack = { id: string; sessions: number; price_cents: number };
type ActivityLite = { id: string; name: string; color: string; pack_validity_days: number };

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await resolveActiveSchool();
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, email, phone, notes, tags, birth_date, can_swim, has_injury, injury_detail, wetsuit_size, address, city, postal_code, country, created_at')
    .eq('id', id)
    .maybeSingle<Client>();

  if (!client) notFound();

  // Parallel fetches para los tabs
  const [
    { data: familyData },
    { data: enrollmentsData },
    { data: bonosData },
    { data: campBookingsData },
    { data: paymentsData },
    { data: activitiesData },
    { data: packsData },
    { data: classesData },
    { data: campsData },
  ] = await Promise.all([
    supabase
      .from('family_members')
      .select('id, full_name, birth_date, level, notes, can_swim, has_injury, injury_detail, wetsuit_size')
      .eq('client_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('class_enrollments')
      .select('id, class_id, status, price_cents, bono_id, family_member_id, created_at')
      .eq('client_id', id)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('bonos')
      .select('id, activity_id, total_credits, used_credits, price_cents, status, expires_at, created_at')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('camp_bookings')
      .select('id, camp_id, participants_count, total_cents, paid_cents, status, created_at')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('payments')
      .select('id, amount_cents, method, concept, reference_type, paid_at')
      .eq('client_id', id)
      .order('paid_at', { ascending: false })
      .limit(200),
    supabase.from('activities').select('id, name, color, pack_validity_days').eq('active', true).order('name'),
    supabase.from('activity_packs').select('id, activity_id, sessions, price_cents').order('sessions'),
    supabase.from('surf_classes').select('id, starts_at, activity_id'),
    supabase.from('surf_camps').select('id, name, starts_on'),
  ]);

  const members = (familyData ?? []) as Member[];
  const activities = ((activitiesData ?? []) as ActivityLite[]);
  const packs = ((packsData ?? []) as (Pack & { activity_id: string })[]);
  const activityById = new Map(activities.map((a) => [a.id, a]));
  const classes = (classesData ?? []) as { id: string; starts_at: string; activity_id: string }[];
  const classById = new Map(classes.map((c) => [c.id, c]));
  const familyById = new Map(members.map((m) => [m.id, m]));
  const camps = (campsData ?? []) as { id: string; name: string; starts_on: string }[];
  const campById = new Map(camps.map((c) => [c.id, c]));

  const enrollmentHistory: EnrollmentHistory[] = ((enrollmentsData ?? []) as {
    id: string;
    class_id: string;
    status: string;
    price_cents: number;
    bono_id: string | null;
    family_member_id: string | null;
  }[]).map((e) => {
    const cls = classById.get(e.class_id);
    const act = cls ? activityById.get(cls.activity_id) : null;
    const fam = e.family_member_id ? familyById.get(e.family_member_id) : null;
    return {
      id: e.id,
      class_id: e.class_id,
      status: e.status,
      price_cents: e.price_cents,
      bono_id: e.bono_id,
      family_member_id: e.family_member_id,
      class_starts_at: cls?.starts_at ?? '',
      activity_name: act?.name ?? null,
      activity_color: act?.color ?? null,
      family_member_name: fam?.full_name ?? null,
    };
  });

  const bonoHistory: BonoHistory[] = ((bonosData ?? []) as {
    id: string;
    activity_id: string;
    total_credits: number;
    used_credits: number;
    price_cents: number;
    status: string;
    expires_at: string | null;
    created_at: string;
  }[]).map((b) => {
    const act = activityById.get(b.activity_id);
    return {
      ...b,
      activity_name: act?.name ?? null,
      activity_color: act?.color ?? null,
    };
  });

  const campBookingHistory: CampBookingHistory[] = ((campBookingsData ?? []) as {
    id: string;
    camp_id: string;
    participants_count: number;
    total_cents: number;
    paid_cents: number;
    status: string;
    created_at: string;
  }[]).map((c) => {
    const camp = campById.get(c.camp_id);
    return {
      ...c,
      camp_name: camp?.name ?? null,
      camp_starts_on: camp?.starts_on ?? null,
    };
  });

  const paymentHistory = (paymentsData ?? []) as PaymentHistory[];

  // Activities con sus packs agrupados, para el selector de venta
  const activitiesWithPacks = activities.map((a) => ({
    ...a,
    packs: packs.filter((p) => p.activity_id === a.id).map((p) => ({ id: p.id, sessions: p.sessions, price_cents: p.price_cents })),
  }));

  const boundUpdate = updateClientAction.bind(null, client.id);
  const boundDelete = deleteClientAction.bind(null, client.id);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <a href="/dashboard/clientes" className="hover:text-navy">Clientes</a>
        <span className="mx-2">/</span>
        <span className="text-navy">{client.name}</span>
      </nav>

      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <span className="h-12 w-12 rounded-pill bg-navy text-yellow flex items-center justify-center font-display text-2xl">
            {client.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="kicker">Ficha de cliente</p>
            <h1 className="font-display text-4xl text-navy">{client.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {client.email && <span>{client.email}</span>}
              {client.email && client.phone && <span> · </span>}
              {client.phone && <span>{client.phone}</span>}
            </p>
          </div>
        </div>
        <form action={boundDelete}>
          <button
            type="submit"
            className="rounded-sm border border-red-200 text-red-700 px-3 py-1.5 text-[0.76rem] font-label hover:bg-red-50 shrink-0"
            onClick={(e) => {
              if (!confirm(`¿Borrar a "${client.name}" y toda su familia/historial?`)) e.preventDefault();
            }}
          >
            Borrar cliente
          </button>
        </form>
      </div>

      <ClientTabs
        counts={{
          familia: members.length,
          clases: enrollmentHistory.length,
          bonos: bonoHistory.length,
          camps: campBookingHistory.length,
          pagos: paymentHistory.length,
        }}
        datos={
          <ClientForm
            action={boundUpdate}
            submitLabel="Guardar cambios"
            initial={{
              name: client.name,
              email: client.email,
              phone: client.phone,
              notes: client.notes,
              tags: client.tags,
              birth_date: client.birth_date,
              can_swim: client.can_swim,
              has_injury: client.has_injury,
              injury_detail: client.injury_detail,
              wetsuit_size: client.wetsuit_size,
              address: client.address,
              city: client.city,
              postal_code: client.postal_code,
              country: client.country,
            }}
          />
        }
        familia={<FamilyEditor clientId={client.id} members={members} />}
        clases={<EnrollmentsList rows={enrollmentHistory} />}
        bonos={
          <div className="space-y-4">
            <div className="flex justify-end">
              <SellBonoForm clientId={client.id} activities={activitiesWithPacks} />
            </div>
            <BonosList rows={bonoHistory} />
          </div>
        }
        camps={<CampBookingsList rows={campBookingHistory} />}
        pagos={
          <div className="space-y-4">
            <div className="flex justify-end">
              <RecordPaymentForm clientId={client.id} />
            </div>
            <PaymentsList rows={paymentHistory} />
          </div>
        }
      />
    </div>
  );
}
