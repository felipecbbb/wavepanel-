'use client';

import { useActionState } from 'react';
import { signupAction, type SignupState } from './actions';
import { Button } from '@/components/button';

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState | null, FormData>(
    signupAction,
    null,
  );

  if (state?.ok) {
    if (state.needsEmailConfirm) {
      return (
        <div className="mx-auto w-[min(560px,92vw)] py-20">
          <p className="kicker mb-3">Casi listo</p>
          <h1 className="font-display text-4xl text-navy">Revisa tu email.</h1>
          <p className="mt-4 text-muted">
            Te hemos enviado un enlace para confirmar la cuenta. Cuando lo abras,
            terminaremos de crear <strong className="text-navy">{state.slug}.wavepanel.app</strong>.
          </p>
        </div>
      );
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3001';
    const pathOnVercelOrLocal = /(localhost|vercel\.app)$/i.test(rootDomain);
    const href = pathOnVercelOrLocal
      ? `/dashboard?tenant=${state.slug}`
      : `https://${state.slug}.${rootDomain}/dashboard`;

    if (typeof window !== 'undefined') window.location.href = href;
    return null;
  }

  return (
    <div className="mx-auto w-[min(560px,92vw)] py-20">
      <p className="kicker mb-3">Crear cuenta</p>
      <h1 className="font-display text-5xl text-navy">
        Empieza con <em className="not-italic text-yellow">14 días</em> gratis.
      </h1>
      <p className="mt-3 text-muted">Sin tarjeta. Cancela cuando quieras.</p>

      <form action={formAction} className="mt-10 space-y-5">
        <Field name="schoolName" label="Nombre de la escuela" placeholder="Escuela de Surf Somo" required />
        <Field
          name="slug"
          label="Subdominio (opcional)"
          placeholder="somo"
          hint="Tu URL será subdominio.wavepanel.app. Si lo dejas vacío lo generamos del nombre."
        />
        <Field name="email" label="Email" type="email" placeholder="tu@email.com" required />
        <Field
          name="password"
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          required
          minLength={8}
        />

        {state && !state.ok && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
            {state.error}
          </p>
        )}

        <Button type="submit" variant="yellow" size="lg" full disabled={pending}>
          {pending ? 'Creando…' : 'Empezar 14 días gratis'}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="underline hover:text-navy">
          Inicia sesión
        </a>
      </p>
    </div>
  );
}

function Field({
  name,
  label,
  type = 'text',
  placeholder,
  hint,
  required,
  minLength,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="font-label text-[0.72rem] text-navy block mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full rounded-sm border border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
      />
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
