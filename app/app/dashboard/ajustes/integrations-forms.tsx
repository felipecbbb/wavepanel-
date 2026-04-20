'use client';

import { useActionState } from 'react';
import { Button } from '@/components/button';
import {
  updateStripeIntegrationAction,
  updateResendIntegrationAction,
  type IntegrationsFormState,
} from './actions';

const MASK = '••••••••';

type Integrations = {
  stripe_publishable_key: string | null;
  stripe_secret_key: string | null;
  stripe_webhook_secret: string | null;
  resend_api_key: string | null;
  email_from_address: string | null;
  email_from_name: string | null;
  email_reply_to: string | null;
};

export function StripeSettingsForm({
  initial,
  webhookUrl,
}: {
  initial: Integrations;
  webhookUrl: string;
}) {
  const [state, formAction, pending] = useActionState<IntegrationsFormState, FormData>(
    updateStripeIntegrationAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <h3 className="font-display text-2xl text-navy">Stripe</h3>
        <p className="mt-1 text-sm text-muted">
          El cobro va directo a tu cuenta Stripe — WavePanel no toca el dinero.
          Consigue las claves en <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer" className="underline">dashboard.stripe.com/apikeys</a>.
        </p>
      </div>

      <Field
        name="stripe_publishable_key"
        label="Publishable key (pk_…)"
        defaultValue={initial.stripe_publishable_key ? MASK : ''}
        placeholder="pk_live_… o pk_test_…"
        autoComplete="off"
      />
      <Field
        name="stripe_secret_key"
        label="Secret key (sk_…)"
        type="password"
        defaultValue={initial.stripe_secret_key ? MASK : ''}
        placeholder="sk_live_… o sk_test_…"
        autoComplete="off"
      />
      <Field
        name="stripe_webhook_secret"
        label="Webhook signing secret (whsec_…)"
        type="password"
        defaultValue={initial.stripe_webhook_secret ? MASK : ''}
        placeholder="whsec_…"
        autoComplete="off"
        hint={
          <>
            En Stripe → Developers → Webhooks → "+ Add endpoint", pega esta URL:{' '}
            <code className="bg-sand px-1.5 py-0.5 rounded-sm text-[0.72rem]">{webhookUrl}</code>.
            Escucha <code className="bg-sand px-1 rounded-sm">checkout.session.completed</code> y{' '}
            <code className="bg-sand px-1 rounded-sm">payment_intent.succeeded</code>.
          </>
        }
      />

      {state && !state.ok && (
        <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
      )}
      {state?.ok && (
        <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-800 border border-emerald-100">
          Guardado.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar Stripe'}
        </Button>
      </div>
    </form>
  );
}

export function ResendSettingsForm({ initial }: { initial: Integrations }) {
  const [state, formAction, pending] = useActionState<IntegrationsFormState, FormData>(
    updateResendIntegrationAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <h3 className="font-display text-2xl text-navy">Resend (emails transaccionales)</h3>
        <p className="mt-1 text-sm text-muted">
          Verifica tu dominio en <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="underline">resend.com/domains</a> para
          que los emails lleguen con tu marca y no como "via resend.dev".
        </p>
      </div>

      <Field
        name="resend_api_key"
        label="API key (re_…)"
        type="password"
        defaultValue={initial.resend_api_key ? MASK : ''}
        placeholder="re_…"
        autoComplete="off"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          name="email_from_address"
          label='Email "from" (remite)'
          type="email"
          defaultValue={initial.email_from_address ?? ''}
          placeholder="reservas@tudominio.com"
          hint="Debe estar en un dominio verificado en Resend."
        />
        <Field
          name="email_from_name"
          label='Nombre "from"'
          defaultValue={initial.email_from_name ?? ''}
          placeholder="Escuela Surf X"
        />
      </div>
      <Field
        name="email_reply_to"
        label="Reply-to (opcional)"
        type="email"
        defaultValue={initial.email_reply_to ?? ''}
        placeholder="hola@tudominio.com"
        hint="Si un cliente responde al email, va aquí. Si lo dejas vacío, responden al from."
      />

      {state && !state.ok && (
        <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
      )}
      {state?.ok && (
        <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-800 border border-emerald-100">
          Guardado.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar Resend'}
        </Button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = 'text',
  defaultValue = '',
  placeholder,
  hint,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="font-label text-[0.72rem] text-navy block mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy font-mono"
      />
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </label>
  );
}
