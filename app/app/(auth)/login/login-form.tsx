'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from './actions';

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-bold">Entrar a WavePanel</h1>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Contraseña</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        {state && !state.ok && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-black px-4 py-2.5 font-medium text-white disabled:opacity-50"
        >
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <a href="/signup" className="underline">
          Crear una
        </a>
      </p>
    </main>
  );
}
