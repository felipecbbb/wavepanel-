/**
 * school.config.js — configuración por escuela
 *
 * Este archivo centraliza TODO lo brandable. El script `1-clone-and-rebrand.sh`
 * lo lee y aplica las sustituciones por todo el código.
 *
 * Copia este archivo a la raíz del repo del cliente como `school.config.js`,
 * rellena los valores y ejecuta el rebrand.
 */

export const schoolConfig = {
  // Identidad
  brand: {
    name: 'Somo Natural Surf',           // nombre comercial
    nameSlug: 'somo-natural-surf',       // versión URL-friendly
    nameShort: 'Somo Natural',           // para títulos cortos / mobile
    legalName: 'Somo Natural Surf S.L.', // razón social
    nif: 'B12345678',
    foundedYear: 2018,
    slogan: 'Surf en Cantabria, sin postureo.',
  },

  // Localización
  location: {
    city: 'Somo',
    province: 'Cantabria',
    country: 'España',
    address: 'Av. de la Playa, 12',
    postalCode: '39140',
    googleMapsUrl: 'https://maps.google.com/?q=...',
    coords: { lat: 43.4567, lng: -3.7654 },
  },

  // Contacto
  contact: {
    emailPrimary: 'hola@somonatural.com',
    emailReservas: 'reservas@somonatural.com',
    phone: '+34 600 123 456',
    whatsapp: '+34600123456',  // sin espacios para wa.me
    schedule: 'L-V 10:00-19:00 · S-D 10:00-14:00',
  },

  // Redes sociales (deja vacío '' si no tienen)
  social: {
    instagram: 'https://instagram.com/somonaturalsurf',
    facebook: '',
    tiktok: 'https://tiktok.com/@somonaturalsurf',
    youtube: '',
  },

  // Dominio / despliegue
  deploy: {
    primaryDomain: 'somonatural.com',
    panelSubdomain: 'panel.somonatural.com',
    vercelProject: 'somonatural-surf',
  },

  // Marca visual (CSS variables)
  brandColors: {
    bg:        '#fffdf7',  // fondo principal cálido
    sand:      '#f3ecdd',  // fondo alternativo
    primary:   '#1ABC9C',  // color marca principal (verde-mar para Somo)
    navy:      '#0f2f39',  // azul oscuro corporativo
    navySoft:  '#214a57',
    text:      '#2d3d45',
    muted:     '#64757d',
    line:      '#d7d0c2',
  },

  // Tipografías (Google Fonts ids)
  fonts: {
    display: 'Bebas Neue',
    body: 'Manrope',
    ui: 'Space Grotesk',
  },

  // Pasarelas de pago
  payments: {
    stripe: {
      enabled: true,
      publicKey: 'pk_live_xxxxx',
      // secret va en .env, NO en este archivo
    },
    paypal: { enabled: false, clientId: '' },
    redsys: { enabled: false, merchantCode: '', terminal: '' },
  },

  // Email transaccional
  email: {
    fromAddress: 'reservas@somonatural.com',
    fromName: 'Somo Natural Surf',
    replyTo: 'hola@somonatural.com',
    notifyAdmin: 'admin@somonatural.com',
  },

  // Legal
  legal: {
    privacyPolicyDate: '2026-04-15',
    cookiePolicyDate: '2026-04-15',
    dataProtectionOfficer: 'Iván Crespo',
  },

  // Equipo (se carga en Supabase también, pero aquí para referencia)
  instructors: [
    { name: 'Iván Crespo', specialties: ['surf', 'paddle'], photo: '/uploads/ivan.jpg' },
    { name: 'Marta Serra', specialties: ['surf', 'yoga'],   photo: '/uploads/marta.jpg' },
  ],

  // Funcionalidades activas (módulos del SaaS que el cliente ha contratado)
  modules: {
    core: true,
    tienda: false,         // si false, ocultamos secciones de tienda
    surfCamps: true,
    whatsapp: false,
  },
};

export default schoolConfig;
