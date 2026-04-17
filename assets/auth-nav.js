// Inyecta un link "Entrar" en el nav de las páginas de la landing apuntando al
// signup del SaaS Next.js. Si el dominio es localhost (dev), usa localhost:3001.
(function () {
  const appBase =
    window.location.hostname === 'localhost' || window.location.hostname.endsWith('.local')
      ? 'http://localhost:3001'
      : 'https://app.wavepanel.app';

  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const ctaDemo = navLinks.querySelector('a.btn.yellow');
  if (!ctaDemo) return;

  // Evita duplicar si el script se carga dos veces.
  if (navLinks.querySelector('[data-wp-login]')) return;

  const loginLink = document.createElement('a');
  loginLink.href = `${appBase}/login`;
  loginLink.textContent = 'Entrar';
  loginLink.dataset.wpLogin = '1';
  navLinks.insertBefore(loginLink, ctaDemo);
})();
