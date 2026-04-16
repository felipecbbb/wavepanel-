(() => {
  const cfg = window.WAVEPANEL_SUPABASE;
  if (!cfg) {
    console.error('[WavePanel] Falta supabase-config.js');
    return;
  }

  const ENDPOINT = `${cfg.url}/rest/v1/leads`;
  const BASE_HEADERS = {
    'apikey': cfg.anonKey,
    'Authorization': `Bearer ${cfg.anonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };

  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_campaign: params.get('utm_campaign') || null
    };
  }

  async function submitLead(payload) {
    const body = {
      ...payload,
      ...getUtmParams(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || null
    };

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: BASE_HEADERS,
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Supabase ${res.status}: ${txt}`);
    }

    return true;
  }

  function setStatus(form, type, text) {
    let s = form.querySelector('.form-status');
    if (!s) {
      s = document.createElement('div');
      s.className = 'form-status';
      s.style.cssText = 'margin-top:14px;padding:14px 18px;border-radius:10px;font-size:.9rem;font-family:"Space Grotesk",sans-serif;font-weight:600;text-align:center;';
      form.appendChild(s);
    }
    s.textContent = text;
    s.style.background = type === 'success' ? '#d4f5dd' : type === 'error' ? '#fee2e2' : '#fef3c7';
    s.style.color = type === 'success' ? '#166534' : type === 'error' ? '#991b1b' : '#92400e';
  }

  function bindForm(form) {
    if (form.dataset.wpBound === '1') return;
    form.dataset.wpBound = '1';
    form.removeAttribute('action');
    form.removeAttribute('method');
    form.removeAttribute('enctype');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Enviando…';
        }
        setStatus(form, 'info', 'Enviando…');

        const data = new FormData(form);
        const leadType = form.dataset.leadType || 'contact';

        await submitLead({
          type: leadType,
          name: (data.get('name') || data.get('nombre') || '').toString().trim(),
          school: (data.get('school') || data.get('escuela') || '').toString().trim() || null,
          email: (data.get('email') || '').toString().trim(),
          phone: (data.get('phone') || data.get('telefono') || '').toString().trim() || null,
          plan_interest: (data.get('plan') || '').toString().trim() || null,
          message: (data.get('message') || data.get('mensaje') || '').toString().trim() || null,
          source: form.dataset.leadSource || 'web'
        });

        setStatus(form, 'success', '¡Recibido! Te respondemos en menos de 24h.');
        form.reset();
        if (submitBtn) submitBtn.textContent = '✓ Enviado';
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        }, 4000);
      } catch (err) {
        console.error('[WavePanel] Error enviando lead:', err);
        setStatus(form, 'error', 'No pudimos enviar el formulario. Escríbenos a hola@wavepanel.com.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  document.querySelectorAll('form[data-wp-form]').forEach(bindForm);
  window.WavePanelLeads = { submitLead, bindForm };
})();
