import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import ClientForm from '../client-form';
import ClientTabs from './client-tabs';
import FamilyEditor from './family-editor';
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

  const { data: family } = await supabase
    .from('family_members')
    .select('id, full_name, birth_date, level, notes, can_swim, has_injury, injury_detail, wetsuit_size')
    .eq('client_id', id)
    .order('created_at', { ascending: true });

  const members = (family ?? []) as Member[];

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
          clases: 0,
          bonos: 0,
          camps: 0,
          pagos: 0,
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
        clases={<EmptyHistory label="Aún sin inscripciones a clases" />}
        bonos={<EmptyHistory label="Aún sin bonos comprados" />}
        camps={<EmptyHistory label="Aún sin reservas de surf camps" />}
        pagos={<EmptyHistory label="Aún sin pagos registrados" />}
      />
    </div>
  );
}

function EmptyHistory({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-line bg-paper p-8 text-center">
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
