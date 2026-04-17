import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatSpanishTime } from '@/lib/dates';
import { centsToEuros } from '@/lib/slug';
import ReserveForm from './reserve-form';

type Tenant = { id: string; slug: string; name: string; primary_color: string };

type ClassRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  activity_id: string;
  max_students: number;
  enrolled_count: number;
  level: string | null;
  published: boolean;
};

type Activity = { id: string; slug: string; name: string; color: string; duration_minutes: number };
type Pack = { sessions: number; price_cents: number };
type Bono = {
  id: string;
  total_credits: number;
  used_credits: number;
  expires_at: string | null;
};
type FamilyMember = { id: string; full_name: string };
type Client = { id: string; name: string };

export default async function ReservarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ class?: string }>;
}) {
  const { slug } = await params;
  const { class: classId } = await searchParams;
  if (!classId) notFound();

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('schools')
    .select('id, slug, name, primary_color')
    .eq('slug', slug)
    .maybeSingle<Tenant>();
  if (!tenant) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: client } = await supabase
    .from('clients')
    .select('id, name')
    .eq('school_id', tenant.id)
    .eq('auth_user_id', user.id)
    .maybeSingle<Client>();
  if (!client) notFound();

  const { data: cls } = await supabase
    .from('surf_classes')
    .select('id, starts_at, ends_at, activity_id, max_students, enrolled_count, level, published')
    .eq('id', classId)
    .eq('school_id', tenant.id)
    .maybeSingle<ClassRow>();
  if (!cls) notFound();

  const [{ data: activity }, { data: bonosData }, { data: familyData }, { data: packsData }] = await Promise.all([
    supabase
      .from('activities')
      .select('id, slug, name, color, duration_minutes')
      .eq('id', cls.activity_id)
      .maybeSingle<Activity>(),
    supabase
      .from('bonos')
      .select('id, total_credits, used_credits, expires_at')
      .eq('client_id', client.id)
      .eq('activity_id', cls.activity_id)
      .eq('status', 'active'),
    supabase
      .from('family_members')
      .select('id, full_name')
      .eq('client_id', client.id),
    supabase
      .from('activity_packs')
      .select('sessions, price_cents')
      .eq('activity_id', cls.activity_id)
      .order('sessions', { ascending: true })
      .limit(1),
  ]);

  const bonos = ((bonosData ?? []) as Bono[]).filter((b) => b.total_credits - b.used_credits > 0);
  const family = (familyData ?? []) as FamilyMember[];
  const minPack = ((packsData ?? []) as Pack[])[0] ?? null;

  const full = cls.enrolled_count >= cls.max_students;
  const inPast = new Date(cls.starts_at).getTime() <= Date.now();

  return (
    <div className="pt-[72px]">
      <div className="mx-auto w-[min(720px,92vw)] py-14">
        <nav className="text-xs text-muted mb-4">
          <Link href={`/${tenant.slug}/calendario`} className="hover:text-navy">Calendario</Link>
          <span className="mx-2">/</span>
          <span className="text-navy">Reservar</span>
        </nav>

        <p className="kicker mb-2" style={{ color: tenant.primary_color }}>
          Confirmar reserva
        </p>
        <h1 className="font-display text-5xl text-navy">{activity?.name ?? 'Clase'}</h1>
        <p className="mt-2 text-muted text-sm">
          {new Date(cls.starts_at).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          {' · '}
          {formatSpanishTime(cls.starts_at)}–{formatSpanishTime(cls.ends_at)}
          {cls.level && <> · {cls.level}</>}
        </p>

        <div className="mt-8">
          {!cls.published ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">
              Esta clase no está publicada.
            </div>
          ) : inPast ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">
              Esta clase ya ha empezado.
            </div>
          ) : full ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">
              La clase está completa.
            </div>
          ) : (
            <ReserveForm
              classId={cls.id}
              schoolSlug={tenant.slug}
              primaryColor={tenant.primary_color}
              bonos={bonos}
              family={family}
              minPackPriceCents={minPack?.price_cents ?? null}
              minPackSessions={minPack?.sessions ?? null}
            />
          )}
        </div>

        {bonos.length === 0 && activity && (
          <p className="mt-6 text-xs text-muted">
            ¿No tienes bono para esta actividad? <Link href={`/${tenant.slug}/actividades/${activity.slug}`} className="underline">Ver packs de {activity.name}</Link>
            {minPack && <> desde {centsToEuros(minPack.price_cents)}</>}.
          </p>
        )}
      </div>
    </div>
  );
}
