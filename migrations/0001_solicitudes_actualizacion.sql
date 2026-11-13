CREATE TABLE IF NOT EXISTS solicitudes_actualizacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cedula TEXT NOT NULL CHECK (length(cedula) = 10 AND cedula NOT GLOB '*[^0-9]*'),
  nombre TEXT NOT NULL CHECK (length(trim(nombre)) BETWEEN 2 AND 160),
  telefono TEXT NOT NULL CHECK (length(trim(telefono)) BETWEEN 5 AND 40),
  correo TEXT,
  ciudad TEXT NOT NULL,
  pais TEXT NOT NULL,
  situacion_declarada TEXT NOT NULL,
  categoria TEXT,
  observaciones TEXT,
  consentimiento INTEGER NOT NULL CHECK (consentimiento = 1),
  aviso_version TEXT NOT NULL,
  estado_revision TEXT NOT NULL DEFAULT 'pendiente_revision' CHECK (estado_revision IN ('pendiente_revision', 'en_revision', 'requiere_aclaracion', 'revisado')),
  recibido_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_recibido ON solicitudes_actualizacion(recibido_en DESC);
CREATE INDEX IF NOT EXISTS idx_solicitudes_cedula ON solicitudes_actualizacion(cedula);
