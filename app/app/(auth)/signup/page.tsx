'use client';

import { useActionState } from 'react';
import { signupAction, type SignupState } from './actions';

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState | null, FormData>(
    signupAction,
    null,
  );

  if (state?.ok) {
    if (state.needsEmailConfirm) {
      return (
        <main className="mx-auto max-w-md p-8">
          <h1 className="mb-4 text-2xl font-bold">Revisa tu email</h1>
          <p className="text-sm text-gray-700">
            Te hemos enviado un enlace para confirmar la cuenta. Cuando lo abras, terminaremos de crear{' '}
            <strong>{state.slug}.wavepanel.app</strong>.
          </p>
        </main>
      );
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000';
    const href =
      rootDomain === 'localhost:3000'
        ? `/dashboard?tenant=${state.slug}`
        : `https://${state.slug}.${rootDomain}/dashboard`;

    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
    return null;
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-2 text-2xl font-bold">Crea tu cuenta WavePanel</h1>
      <p className="mb-6 text-sm text-gray-600">14 días gratis. Sin tarjeta.</p>

      <form action={formAction} className="space-y-4">
        <Field name="schoolName" label="Nombre de la escuela" placeholder="Escuela de Surf Somo" required />
        <Field
          name="slug"
          label="Subdominio (opcional)"
          placeholder="somo"
          hint="Tu URL será subdominio.wavepanel.app. Si lo dejas vacío lo generamos del nombre."
        />
        <Field name="email" label="Email" type="email" placeholder="tu@email.com" required />
        <Field name="password" label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" required minLength={8} />

        {state && !state.ok && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-black px-4 py-2.5 font-medium text-white disabled:opacity-50"
        >
          {pending ? 'Creando…' : 'Empezar 14 días gratis'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="underline">
          Inicia sesión
        </a>
      </p>
    </main>
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
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}
