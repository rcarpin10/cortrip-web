create table if not exists public.solicitudes_actualizacion (
  id uuid primary key default gen_random_uuid(),
  cedula text not null check (cedula ~ '^[0-9]{10}$'),
  nombre text not null check (char_length(nombre) between 2 and 160),
  telefono text not null check (char_length(telefono) between 5 and 40),
  correo text check (correo is null or char_length(correo) <= 254),
  ciudad text not null check (char_length(ciudad) between 1 and 100),
  pais text not null check (char_length(pais) between 1 and 100),
  categoria text check (categoria is null or categoria in ('Activo', 'Pasivo', 'Vitalicio', 'Otro / por verificar', 'Prefiero no indicar / no sé')),
  observaciones text check (observaciones is null or char_length(observaciones) <= 1000),
  consentimiento boolean not null check (consentimiento = true),
  aviso_version text not null default '2026-01',
  recibido_en timestamptz not null default now()
);

alter table public.solicitudes_actualizacion enable row level security;

-- No se conceden permisos de lectura ni escritura directa a visitantes autenticados o anónimos.
-- La Edge Function realiza la inserción con la clave de servicio solo en el entorno servidor.
revoke all on table public.solicitudes_actualizacion from anon, authenticated;
grant usage on schema public to service_role;
grant insert on table public.solicitudes_actualizacion to service_role;
