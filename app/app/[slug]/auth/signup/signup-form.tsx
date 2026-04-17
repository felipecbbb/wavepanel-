'use client';

import { useActionState } from 'react';
import { signupStudentAction, type AuthState } from '../actions';

export default function SignupForm({
  schoolSlug,
  next,
  primaryColor,
}: {
  schoolSlug: string;
  next: string;
  primaryColor: string;
}) {
  const action = signupStudentAction.bind(null, schoolSlug, next);
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, null);

  if (state?.ok) {
    return (
      <div className="mt-10 rounded-md border border-sand bg-paper p-6">
        <p className="kicker mb-2">Casi listo</p>
        <h2 className="font-display text-2xl text-navy">Revisa tu email.</h2>
        <p className="mt-3 text-muted text-sm">
          Te hemos enviado un enlace para confirmar la cuenta. Abre ese email y ya podrás iniciar sesión aquí.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-10 space-y-4">
      <Field label="Nombre completo" name="name" required placeholder="Ana Pérez" />
      <Field label="Email" name="email" type="email" required placeholder="tu@email.com" />
      <Field label="Teléfono" name="phone" placeholder="+34 600 123 456" />
      <Field label="Contraseña" name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" />

      {state && !state.ok && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-pill px-6 py-3 font-label text-[0.76rem] text-navy disabled:opacity-50"
        style={{ background: primaryColor }}
      >
        {pending ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  );
}

function Field({
  label, name, type = 'text', required, placeholder, minLength,
}: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string; minLength?: number;
}) {
  return (
    <label className="block">
      <span className="font-label text-[0.72rem] text-navy block mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className="w-full rounded-sm border border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
      />
    </label>
  );
}
