const toggle = document.getElementById('menuToggle');
const links = document.getElementById('navLinks');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
}

document.querySelectorAll('.nav-links a[href^="#"], .nav-links a[href$=".html"]').forEach(a => {
  a.addEventListener('click', () => links && links.classList.remove('open'));
});
