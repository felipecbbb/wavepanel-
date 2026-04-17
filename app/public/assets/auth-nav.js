// Inyecta un link "Entrar" en el nav de la landing. Como la landing y el SaaS
// conviven en el mismo dominio (monorepo Next.js sirviendo public/*.html), los
// enlaces son relativos.
(function () {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const ctaDemo = navLinks.querySelector('a.btn.yellow');
  if (!ctaDemo) return;

  if (navLinks.querySelector('[data-wp-login]')) return;

  const loginLink = document.createElement('a');
  loginLink.href = '/login';
  loginLink.textContent = 'Entrar';
  loginLink.dataset.wpLogin = '1';
  navLinks.insertBefore(loginLink, ctaDemo);
})();
