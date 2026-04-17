import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { ButtonLink } from '@/components/button';
import ClientesSearch from './clientes-search';

type Row = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tags: string[];
  created_at: string;
};

export default async function ClientesPage() {
  await resolveActiveSchool();
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, name, email, phone, tags, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="kicker mb-2">Clientes</p>
          <h1 className="font-display text-4xl text-navy">Tu fichero.</h1>
        </div>
        <ButtonLink href="/dashboard/clientes/nuevo" variant="dark">
          Nuevo cliente
        </ButtonLink>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
          {error.message}
        </p>
      )}

      {(!clients || clients.length === 0) && !error ? (
        <Empty />
      ) : (
        <ClientesSearch rows={(clients ?? []) as Row[]} />
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-md border border-dashed border-line bg-paper p-10 text-center">
      <h3 className="font-display text-2xl text-navy mb-2">Todavía no tienes clientes</h3>
      <p className="text-sm text-muted mb-6">Añade el primero manualmente o importa una lista.</p>
      <ButtonLink href="/dashboard/clientes/nuevo" variant="yellow">
        Añadir el primero
      </ButtonLink>
    </div>
  );
}
