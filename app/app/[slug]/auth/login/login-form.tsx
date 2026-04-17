'use client';

import { useActionState } from 'react';
import { loginStudentAction, type AuthState } from '../actions';

export default function LoginForm({
  schoolSlug,
  next,
  primaryColor,
}: {
  schoolSlug: string;
  next: string;
  primaryColor: string;
}) {
  const action = loginStudentAction.bind(null, schoolSlug, next);
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, null);

  return (
    <form action={formAction} className="mt-10 space-y-4">
      <label className="block">
        <span className="font-label text-[0.72rem] text-navy block mb-1.5">Email</span>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-sm border border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
        />
      </label>
      <label className="block">
        <span className="font-label text-[0.72rem] text-navy block mb-1.5">Contraseña</span>
        <input
          name="password"
          type="password"
          required
          className="w-full rounded-sm border border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
        />
      </label>

      {state && !state.ok && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-pill px-6 py-3 font-label text-[0.76rem] text-navy disabled:opacity-50"
        style={{ background: primaryColor }}
      >
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
