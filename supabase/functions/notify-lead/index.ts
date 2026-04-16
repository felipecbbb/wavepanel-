// Supabase Edge Function: notify-lead
// Se invoca por Database Webhook cuando se inserta una row en `public.leads`.
// Envía email a Felipe con los datos del nuevo lead vía Resend.
//
// Setup:
//   1. supabase secrets set RESEND_API_KEY=re_xxx NOTIFY_EMAIL=felipegestion03@gmail.com
//   2. supabase functions deploy notify-lead
//   3. En Dashboard → Database → Webhooks → crear webhook:
//        Table: leads
//        Events: INSERT
//        Type: Supabase Edge Functions
//        Function: notify-lead
//
// El webhook envía a esta función un JSON con shape: { type, table, record, schema, old_record }

interface LeadRecord {
  id: string;
  created_at: string;
  type: string;
  name: string;
  school: string | null;
  email: string;
  phone: string | null;
  plan_interest: string | null;
  message: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  user_agent: string | null;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: LeadRecord;
  old_record: LeadRecord | null;
}

const TYPE_LABEL: Record<string, string> = {
  contact: '📩 Contacto general',
  demo_request: '🎬 Demo en vivo',
  waitlist_basic: '⏳ Lista de espera Básico',
  waitlist_pro: '⭐ Lista de espera Pro',
  custom_quote: '🏆 Presupuesto Personalizado',
};

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (payload.type !== 'INSERT' || payload.table !== 'leads') {
    return new Response('Ignored', { status: 200 });
  }

  const lead = payload.record;
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const toEmail = Deno.env.get('NOTIFY_EMAIL') || 'felipegestion03@gmail.com';
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'wavepanel@resend.dev';

  if (!apiKey) {
    console.error('Missing RESEND_API_KEY');
    return new Response('Email service not configured', { status: 500 });
  }

  const subject = `[WavePanel] ${TYPE_LABEL[lead.type] || lead.type} · ${lead.name}`;

  const html = `
    <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#0f2f39;">
      <div style="background:#0f2f39;color:#fff;padding:24px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;font-size:22px;">Nuevo lead en WavePanel</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,.7);font-size:14px;">${TYPE_LABEL[lead.type] || lead.type}</p>
      </div>
      <div style="background:#fffdf7;padding:24px;border-radius:0 0 12px 12px;border:1px solid #d7d0c2;border-top:none;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;font-weight:700;width:130px;">Nombre</td><td>${escape(lead.name)}</td></tr>
          ${lead.school ? `<tr><td style="padding:8px 0;font-weight:700;">Escuela</td><td>${escape(lead.school)}</td></tr>` : ''}
          <tr><td style="padding:8px 0;font-weight:700;">Email</td><td><a href="mailto:${escape(lead.email)}" style="color:#0f2f39;">${escape(lead.email)}</a></td></tr>
          ${lead.phone ? `<tr><td style="padding:8px 0;font-weight:700;">Teléfono</td><td><a href="tel:${escape(lead.phone)}" style="color:#0f2f39;">${escape(lead.phone)}</a></td></tr>` : ''}
          ${lead.plan_interest ? `<tr><td style="padding:8px 0;font-weight:700;">Plan interés</td><td>${escape(lead.plan_interest)}</td></tr>` : ''}
          <tr><td style="padding:8px 0;font-weight:700;">Origen</td><td>${escape(lead.source)}${lead.utm_source ? ` · utm_source=${escape(lead.utm_source)}` : ''}</td></tr>
        </table>
        ${lead.message ? `
          <div style="margin-top:18px;padding:16px;background:#fff;border-radius:8px;border:1px solid #d7d0c2;">
            <div style="font-weight:700;font-size:13px;color:#64757d;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">Mensaje</div>
            <div style="white-space:pre-wrap;font-size:14px;line-height:1.6;">${escape(lead.message)}</div>
          </div>
        ` : ''}
        <div style="margin-top:24px;text-align:center;">
          <a href="https://supabase.com/dashboard/project/aloxbttkypvkcrethwex/editor" style="display:inline-block;background:#FFCC01;color:#0f2f39;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">Ver en Supabase →</a>
        </div>
      </div>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `WavePanel <${fromEmail}>`,
      to: [toEmail],
      reply_to: lead.email,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Resend error:', errText);
    return new Response(`Resend error: ${errText}`, { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

function escape(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
