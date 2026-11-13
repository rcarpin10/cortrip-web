create table if not exists public.solicitudes_actualizacion (
  id uuid primary key default gen_random_uuid(),
  cedula text not null check (cedula ~ '^[0-9]{10}$'),
  nombre text not null check (char_length(nombre) between 2 and 160),
  telefono text not null check (char_length(telefono) between 5 and 40),
  correo text check (correo is null or char_length(correo) <= 254),
  ciudad text not null check (char_length(ciudad) between 1 and 100),
  pais text not null check (char_length(pais) between 1 and 100),
  situacion_declarada text not null check (situacion_declarada in (
    'Me considero socio/a y deseo actualizar mis datos',
    'Me incorporé después de 2012 y solicito que se revise mi registro',
    'Presenté una renuncia voluntaria',
    'Fui separado/a o expulsado/a y solicito que se revise mi situación',
    'No estoy seguro/a; solicito cotejo',
    'Otra situación; explicaré solo lo necesario en observaciones'
  )),
  categoria text check (categoria is null or categoria in ('Activo', 'Pasivo', 'Vitalicio', 'Otro / por verificar', 'Prefiero no indicar / no sé')),
  observaciones text check (observaciones is null or char_length(observaciones) <= 1000),
  consentimiento boolean not null check (consentimiento = true),
  aviso_version text not null default '2026-11-v1',
  recibido_en timestamptz not null default now()
);

alter table public.solicitudes_actualizacion enable row level security;
revoke all on table public.solicitudes_actualizacion from anon, authenticated;
grant usage on schema public to service_role;
grant insert on table public.solicitudes_actualizacion to service_role;
