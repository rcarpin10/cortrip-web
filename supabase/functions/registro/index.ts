import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? 'null',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  return clean.length > 0 && clean.length <= maxLength ? clean : null;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Método no permitido.' }, 405);

  const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN');
  if (!allowedOrigin || request.headers.get('origin') !== allowedOrigin) {
    return jsonResponse({ error: 'Origen no permitido.' }, 403);
  }

  const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!turnstileSecret || !supabaseUrl || !serviceKey) {
    return jsonResponse({ error: 'Servicio temporalmente no disponible.' }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Solicitud inválida.' }, 400);
  }

  const token = cleanString(body.captchaToken, 4096);
  const cedula = cleanString(body.cedula, 10);
  const nombre = cleanString(body.nombre, 160);
  const telefono = cleanString(body.telefono, 40);
  const correo = body.correo === '' || body.correo == null ? null : cleanString(body.correo, 254);
  const ciudad = cleanString(body.ciudad, 100);
  const pais = cleanString(body.pais, 100);
  const categoria = body.categoria === '' ? null : cleanString(body.categoria, 50);
  const observaciones = body.observaciones === '' || body.observaciones == null
    ? null
    : cleanString(body.observaciones, 1000);

  if (!token || !cedula || !/^[0-9]{10}$/.test(cedula) || !nombre || !telefono || !ciudad || !pais ||
      (body.correo && !correo) || (body.categoria && !categoria) || (body.observaciones && !observaciones)) {
    return jsonResponse({ error: 'Revisa los campos e intenta nuevamente.' }, 400);
  }

  const captchaBody = new URLSearchParams({
    secret: turnstileSecret,
    response: token,
  });
  const remoteIp = request.headers.get('cf-connecting-ip');
  if (remoteIp) captchaBody.set('remoteip', remoteIp);

  try {
    const captchaResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: captchaBody,
    });
    const captchaResult = await captchaResponse.json();
    if (!captchaResult.success) return jsonResponse({ error: 'No se pudo validar la verificación de seguridad.' }, 400);

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from('solicitudes_actualizacion').insert({
      cedula,
      nombre,
      telefono,
      correo,
      ciudad,
      pais,
      categoria,
      observaciones,
      consentimiento: true,
    });
    if (error) {
      // No retornar detalles de base de datos que puedan exponer información.
      console.error('Submission storage failed', error.code);
      return jsonResponse({ error: 'No se pudo recibir la solicitud. Inténtalo más tarde.' }, 500);
    }
    return jsonResponse({ received: true }, 201);
  } catch {
    return jsonResponse({ error: 'Servicio temporalmente no disponible.' }, 503);
  }
});
