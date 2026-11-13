export async function onRequestPost({ request, env, next }) {
  const origin = request.headers.get('origin');
  const allowedOrigin = env.ALLOWED_ORIGIN || '';
  const allowedHostname = env.ALLOWED_HOSTNAME || '';

  if (!allowedOrigin || !allowedHostname) {
    return new Response(JSON.stringify({ error: 'Servicio temporalmente no disponible.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (origin !== allowedOrigin) {
    return new Response(JSON.stringify({ error: 'Origen no permitido.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Formato de solicitud no válido.' }), {
      status: 415,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Solicitud inválida.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cleanString = (value, maxLength) => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
  };

  const token = cleanString(body?.captchaToken, 4096);
  const cedula = cleanString(body?.cedula, 10);
  const nombre = cleanString(body?.nombre, 160);
  const telefono = cleanString(body?.telefono, 40);
  const correo = body?.correo === '' || body?.correo == null ? null : cleanString(body?.correo, 254);
  const ciudad = cleanString(body?.ciudad, 100);
  const pais = cleanString(body?.pais, 100);
  const situacionDeclarada = cleanString(body?.situacionDeclarada, 120);
  const categoria = body?.categoria === '' ? null : cleanString(body?.categoria, 60);
  const observaciones = body?.observaciones === '' || body?.observaciones == null ? null : cleanString(body?.observaciones, 1000);
  const consentimiento = body?.consentimiento === 'on' || body?.consentimiento === true;

  const situaciones = new Set([
    'Me considero socio/a y deseo actualizar mis datos',
    'Me incorporé después de 2012 y solicito que se revise mi registro',
    'Presenté una renuncia voluntaria',
    'Fui separado/a o expulsado/a y solicito que se revise mi situación',
    'No estoy seguro/a; solicito cotejo',
    'Otra situación; explicaré solo lo necesario en observaciones',
  ]);

  const categorias = new Set(['Activo', 'Pasivo', 'Vitalicio', 'Otro / por verificar', 'Prefiero no indicar / no sé']);
  const correoValido = correo === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  if (
    !token || !consentimiento || !cedula || !/^[0-9]{10}$/.test(cedula) || !nombre || nombre.length < 2 ||
    !telefono || telefono.length < 5 || !ciudad || !pais || !situaciones.has(situacionDeclarada) ||
    !correoValido || (body?.categoria && (!categoria || !categorias.has(categoria)))
  ) {
    return new Response(JSON.stringify({ error: 'Revisa los campos e intenta nuevamente.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const captchaResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: request.headers.get('cf-connecting-ip') || '',
    }).toString(),
  });

  const captchaData = await captchaResult.json();
  if (!captchaData.success || captchaData.hostname !== allowedHostname || captchaData.action !== 'registro') {
    return new Response(JSON.stringify({ error: 'No se pudo validar la verificación de seguridad.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const insert = await env.DB.prepare(`
    INSERT INTO solicitudes_actualizacion (
      cedula, nombre, telefono, correo, ciudad, pais, situacion_declarada,
      categoria, observaciones, consentimiento, aviso_version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    cedula,
    nombre,
    telefono,
    correo,
    ciudad,
    pais,
    situacionDeclarada,
    categoria,
    observaciones,
    1,
    '2026-11-v1'
  ).run();

  if (insert.error) {
    return new Response(JSON.stringify({ error: 'No se pudo recibir la solicitud. Inténtalo más tarde.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, origin',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function onRequest({ request }) {
  return new Response(JSON.stringify({ error: 'Método no permitido.' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
