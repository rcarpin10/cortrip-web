window.CORTRIP_CONFIG = Object.freeze({
  // Mantener desactivado hasta desplegar y probar Pages + D1.
  registrationEnabled: false,
  // Endpoint relativo: el formulario y la función se sirven desde el mismo dominio.
  registrationEndpoint: '/api/registro',
  // Esta clave es pública; la clave secreta se configura solo en Cloudflare Pages.
  turnstileSiteKey: ''
});
