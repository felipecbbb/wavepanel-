'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from './actions';
import { Button } from '@/components/button';

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <div className="mx-auto w-[min(460px,92vw)] py-20">
      <p className="kicker mb-3">Entrar</p>
      <h1 className="font-display text-5xl text-navy">
        Bienvenido <em className="not-italic text-yellow">de vuelta.</em>
      </h1>

      <form action={formAction} className="mt-10 space-y-5">
        <input type="hidden" name="next" value={next} />

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
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
            {state.error}
          </p>
        )}

        <Button type="submit" variant="dark" size="lg" full disabled={pending}>
          {pending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted">
        ¿No tienes cuenta?{' '}
        <a href="/signup" className="underline hover:text-navy">
          Crear una
        </a>
      </p>
    </div>
  );
}
