CREATE TABLE IF NOT EXISTS solicitudes_actualizacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cedula TEXT NOT NULL CHECK (length(cedula) = 10 AND cedula NOT GLOB '*[^0-9]*'),
  nombre TEXT NOT NULL CHECK (length(trim(nombre)) BETWEEN 2 AND 160),
  telefono TEXT NOT NULL CHECK (length(trim(telefono)) BETWEEN 5 AND 40),
  correo TEXT CHECK (correo IS NULL OR length(correo) <= 254),
  ciudad TEXT NOT NULL CHECK (length(trim(ciudad)) BETWEEN 1 AND 100),
  pais TEXT NOT NULL CHECK (length(trim(pais)) BETWEEN 1 AND 100),
  situacion_declarada TEXT NOT NULL CHECK (situacion_declarada IN (
    'Me considero socio/a y deseo actualizar mis datos',
    'Me incorporé después de 2012 y solicito que se revise mi registro',
    'Presenté una renuncia voluntaria',
    'Fui separado/a o expulsado/a y solicito que se revise mi situación',
    'No estoy seguro/a; solicito cotejo',
    'Otra situación; explicaré solo lo necesario en observaciones'
  )),
  categoria TEXT CHECK (categoria IS NULL OR categoria IN ('Activo', 'Pasivo', 'Vitalicio', 'Otro / por verificar', 'Prefiero no indicar / no sé')),
  observaciones TEXT CHECK (observaciones IS NULL OR length(observaciones) <= 1000),
  consentimiento INTEGER NOT NULL CHECK (consentimiento = 1),
  aviso_version TEXT NOT NULL,
  estado_revision TEXT NOT NULL DEFAULT 'pendiente_revision' CHECK (estado_revision IN ('pendiente_revision', 'en_revision', 'requiere_aclaracion', 'revisado')),
  recibido_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_recibido ON solicitudes_actualizacion(recibido_en DESC);
CREATE INDEX IF NOT EXISTS idx_solicitudes_cedula ON solicitudes_actualizacion(cedula);
