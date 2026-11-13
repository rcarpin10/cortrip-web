export async function onRequestPost({ request, env }) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  };
  const respond = (body, status) => new Response(JSON.stringify(body), { status, headers });
  const allowedOrigin = env.ALLOWED_ORIGIN;
  const allowedHostname = env.ALLOWED_HOSTNAME;

  if (!allowedOrigin || !allowedHostname || !env.TURNSTILE_SECRET_KEY || !env.DB) {
    return respond({ error: 'El servicio de registro aún no está configurado.' }, 503);
  }
  if (request.headers.get('Origin') !== allowedOrigin) return respond({ error: 'Origen no permitido.' }, 403);
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return respond({ error: 'Formato de solicitud no válido.' }, 415);
  }

  const contentLength = Number(request.headers.get('content-length') || '0');
  if (contentLength > 16384) return respond({ error: 'Solicitud demasiado grande.' }, 413);
  let raw;
  try {
    raw = await request.text();
  } catch {
    return respond({ error: 'Solicitud inválida.' }, 400);
  }
  if (raw.length > 16384) return respond({ error: 'Solicitud demasiado grande.' }, 413);

  let body;
  try {
    body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body');
  } catch {
    return respond({ error: 'Solicitud inválida.' }, 400);
  }

  const cleanString = (value, maxLength) => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
  };
  const token = cleanString(body.captchaToken, 4096);
  const cedula = cleanString(body.cedula, 10);
  const nombre = cleanString(body.nombre, 160);
  const telefono = cleanString(body.telefono, 40);
  const correo = body.correo === '' || body.correo == null ? null : cleanString(body.correo, 254);
  const ciudad = cleanString(body.ciudad, 100);
  const pais = cleanString(body.pais, 100);
  const situacion = cleanString(body.situacionDeclarada, 120);
  const categoria = body.categoria === '' ? null : cleanString(body.categoria, 60);
  const observaciones = body.observaciones === '' || body.observaciones == null
    ? null
    : cleanString(body.observaciones, 1000);
  const consentimiento = body.consentimiento === 'on' || body.consentimiento === true;
  const situaciones = new Set([
    'Me considero socio/a y deseo actualizar mis datos',
    'Me incorporé después de 2012 y solicito que se revise mi registro',
    'Presenté una renuncia voluntaria',
    'Fui separado/a o expulsado/a y solicito que se revise mi situación',
    'No estoy seguro/a; solicito cotejo',
    'Otra situación; explicaré solo lo necesario en observaciones'
  ]);
  const categorias = new Set(['Activo', 'Pasivo', 'Vitalicio', 'Otro / por verificar', 'Prefiero no indicar / no sé']);
  const correoValido = correo === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  if (!token || !consentimiento || !cedula || !/^[0-9]{10}$/.test(cedula) || !nombre || nombre.length < 2 ||
      !telefono || telefono.length < 5 || !ciudad || !pais || !situaciones.has(situacion) || !correoValido ||
      (body.correo && !correo) || (body.categoria && (!categoria || !categorias.has(categoria))) ||
      (body.observaciones && !observaciones)) {
    return respond({ error: 'Revisa los campos e intenta nuevamente.' }, 400);
  }

  try {
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || ''
      }),
      signal: AbortSignal.timeout(8000)
    });
    if (!verify.ok) return respond({ error: 'No se pudo validar la verificación de seguridad.' }, 400);
    const captcha = await verify.json();
    if (!captcha.success || captcha.hostname !== allowedHostname || captcha.action !== 'registro') {
      return respond({ error: 'No se pudo validar la verificación de seguridad.' }, 400);
    }

    const result = await env.DB.prepare(`
      INSERT INTO solicitudes_actualizacion (
        cedula, nombre, telefono, correo, ciudad, pais, situacion_declarada,
        categoria, observaciones, consentimiento, aviso_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, '2026-11-v1')
    `).bind(cedula, nombre, telefono, correo, ciudad, pais, situacion, categoria, observaciones).run();
    if (!result.success) return respond({ error: 'No se pudo guardar la solicitud. Inténtalo más tarde.' }, 500);
    return respond({ received: true }, 201);
  } catch {
    return respond({ error: 'El servicio no está disponible temporalmente.' }, 503);
  }
}

export async function onRequestOptions({ request, env }) {
  if (request.headers.get('Origin') !== env.ALLOWED_ORIGIN) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  } });
}

export async function onRequest({ request }) {
  return new Response(JSON.stringify({ error: 'Método no permitido.' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}
