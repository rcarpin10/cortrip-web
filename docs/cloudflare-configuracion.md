# Configuración de Cloudflare para CORTRIP

## Objetivo

Dejar la web pública en Cloudflare Pages y el formulario en una función serverless con almacenamiento privado en D1. La intención es mantener la web visible y la base de datos separada, sin publicar información sensible ni secretos.

## Qué queda por hacer

1. Crear la base D1 desde Cloudflare.
2. Ejecutar el SQL de la tabla `solicitudes_actualizacion`.
3. Sustituir los valores de ejemplo en `wrangler.toml`.
4. Publicar la web mediante Cloudflare Pages.
5. Probar con datos ficticios.
6. Activar el formulario solo cuando todo esté validado.

## SQL recomendado para D1

```sql
CREATE TABLE IF NOT EXISTS solicitudes_actualizacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cedula TEXT NOT NULL,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo TEXT,
  ciudad TEXT NOT NULL,
  pais TEXT NOT NULL,
  situacion_declarada TEXT NOT NULL,
  categoria TEXT,
  observaciones TEXT,
  consentimiento INTEGER NOT NULL DEFAULT 1,
  aviso_version TEXT NOT NULL DEFAULT '2026-11-v1',
  recibido_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON solicitudes_actualizacion(recibido_en DESC);
```

## Variables a completar

- `ALLOWED_ORIGIN`: dominio exacto del sitio público.
- `ALLOWED_HOSTNAME`: hostname del sitio público para Turnstile.
- `TURNSTILE_SECRET_KEY`: clave privada del widget Turnstile.
- `database_id`: ID real de la base D1.

## Importante

- `TURNSTILE_SECRET_KEY` nunca va al frontend.
- La base D1 es privada; el sitio público no puede leerla.
- `registrationEnabled` en `js/config.js` debe mantenerse en `false` hasta hacer pruebas reales.
