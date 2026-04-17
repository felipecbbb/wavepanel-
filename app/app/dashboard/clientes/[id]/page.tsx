import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import ClientForm from '../client-form';
import { updateClientAction, deleteClientAction } from '../actions';

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
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
    .select('id, name, email, phone, notes, tags, created_at')
    .eq('id', id)
    .maybeSingle<Client>();

  if (!client) notFound();

  const boundUpdate = updateClientAction.bind(null, client.id);
  const boundDelete = deleteClientAction.bind(null, client.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <a href="/dashboard/clientes" className="hover:text-navy">Clientes</a>
        <span className="mx-2">/</span>
        <span className="text-navy">{client.name}</span>
      </nav>

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="kicker mb-2">Editar cliente</p>
          <h1 className="font-display text-4xl text-navy">{client.name}</h1>
          <p className="mt-1 text-sm text-muted">
            Alta: {new Date(client.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <form action={boundDelete}>
          <button
            type="submit"
            className="rounded-sm border border-red-200 text-red-700 px-3 py-1.5 text-[0.76rem] font-label hover:bg-red-50"
          >
            Borrar cliente
          </button>
        </form>
      </div>

      <ClientForm
        action={boundUpdate}
        submitLabel="Guardar cambios"
        initial={{
          name: client.name,
          email: client.email,
          phone: client.phone,
          notes: client.notes,
          tags: client.tags,
        }}
      />
    </div>
  );
}
