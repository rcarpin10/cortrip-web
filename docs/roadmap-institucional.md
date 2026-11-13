# Continuidad del proyecto CORTRIP: registro, padrón, votación y web institucional

## Propósito

Avanzar por etapas para que el trabajo de actualización sea útil a la siguiente administración y pueda mantenerse. La primera etapa es recibir y organizar información de contacto y declaraciones. No equivale a certificar afiliación ni a aprobar un padrón.

## Etapa 1 — Actualización de información

- Web pública en Cloudflare Pages.
- Recepción mediante Pages Function en `/api/registro`.
- Base D1 enlazada como binding `DB`; sin ruta pública para consultar los registros.
- Revisión humana y acceso administrativo restringido.
- Exportación controlada y proceso de respaldo definido.
- `registrationEnabled` permanece `false` hasta completar aviso, dominio, CAPTCHA, pruebas y responsables.

## Etapa 2 — Cotejo y padrón administrativo

La futura administración deberá definir el procedimiento y las fuentes autorizadas de cotejo. Es recomendable mantener separado el registro recibido del padrón validado, conservando trazabilidad de quién revisó un caso, cuándo y con qué fundamento. Los datos no deben convertirse automáticamente en una determinación de derechos.

## Etapa 3 — Evaluación de votación electrónica

No reutilizar el formulario de actualización como votación ni tratar la cédula ingresada como autenticación suficiente. Antes de diseñar una elección se requiere:

1. Reglas electorales aprobadas: elegibilidad, fechas, candidaturas, quórum, impugnaciones y observadores.
2. Padrón y fecha de corte aprobados por autoridad competente, con mecanismo de corrección y apelación.
3. Verificación de identidad separada de la emisión del voto; evitar que administradores puedan vincular identidad y selección.
4. Un solo voto por elector, secreto, integridad verificable, evidencia de auditoría y continuidad ante fallas.
5. Revisión independiente de seguridad y accesibilidad, simulacros y plan de contingencia antes de una elección real.

La votación deberá ser un sistema independiente, posterior a la validación del padrón y a la aprobación del procedimiento; el registro actual no habilita ni resuelve derechos electorales.

## Etapa 4 — Página corporativa CORTRIP

La web institucional puede reutilizar la identidad visual y las páginas públicas del proyecto, pero debe publicar únicamente información institucional aprobada: historia, misión, autoridades vigentes, documentos públicos, noticias, contacto y transparencia. Nunca incluir cédulas, teléfonos privados, registros de socios, credenciales, actas no públicas ni exportaciones de D1.

## Continuidad, privacidad y transferencia

Designar custodios con MFA, limitar accesos, documentar cambios, definir responsable y contacto, región y proveedor, plazo de conservación, canal de solicitudes, política de exportación y borrado. Preparar una entrega formal a la siguiente administración con inventario del sistema, documentación y datos únicamente por canal cifrado y con autorización. No usar la cuenta personal de una sola persona como único punto de control.
