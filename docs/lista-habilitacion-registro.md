# Preparar y habilitar el registro de actualización CORTRIP

## Estado

La página principal contiene el formulario de actualización voluntaria y muestra el alcance del proyecto. El envío sigue apagado en `js/config.js` hasta desplegar y probar el almacenamiento. No se guardan respuestas en el navegador ni en el repositorio.

## Qué persigue el formulario

Organizar datos de contacto y declaraciones de situación para facilitar el cotejo futuro con registros disponibles, incluida la referencia al listado de 2012, y ponerlos a disposición de una futura administración competente para su revisión. La respuesta no verifica identidad o afiliación y no modifica registros oficiales. La situación indicada es una declaración de la persona que responde, no una decisión institucional.

## Configuración de infraestructura

1. Crear una cuenta controlada por la iniciativa, habilitar MFA y definir custodios y continuidad de acceso.
2. Crear un proyecto Supabase y revisar región, términos, controles, disponibilidad de copias de seguridad y opciones de exportación del plan.
3. Crear un widget Cloudflare Turnstile para el hostname final.
4. Confirmar que el sitio público usa HTTPS y decidir el dominio exacto.
5. Completar en `index.html` el nombre/contacto del responsable, ubicación y proveedor, plazo de conservación y canal para solicitudes de derechos. Actualizar el aviso y `aviso_version` en el SQL según corresponda. Revisar el texto con asesoría apropiada a la normativa aplicable.
6. Ejecutar `supabase/schema.sql` en el SQL Editor del proyecto.
7. Instalar la CLI de Supabase y desde la raíz del repositorio ejecutar:

```sh
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase secrets set SUPABASE_URL="https://TU_PROJECT_REF.supabase.co" SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY" TURNSTILE_SECRET_KEY="TU_TURNSTILE_SECRET" ALLOWED_ORIGIN="https://TU_DOMINIO_PUBLICO" ALLOWED_HOSTNAME="TU_HOSTNAME_PUBLICO"
supabase functions deploy registro
```

No guardes `SUPABASE_SERVICE_ROLE_KEY` ni `TURNSTILE_SECRET_KEY` en este repositorio, HTML, JavaScript público o mensajes. Si se exponen, rótalas.

8. En `js/config.js`, configurar el endpoint público de la función (`https://TU_PROJECT_REF.supabase.co/functions/v1/registro`) y la site key pública de Turnstile. Cambiar `registrationEnabled` a `true` solo tras completar el aviso y probar el sistema.
9. Con datos ficticios, probar envío aceptado, consentimiento requerido, rechazo de datos inválidos, token/hostname incorrecto, almacenamiento en la tabla, ausencia de lectura pública y acceso administrativo protegido. Verificar logs para que no expongan datos personales.
10. Definir procedimiento de respaldo, exportación cifrada, revisión y entrega a futura administración, y calendario de eliminación. No subir exportaciones al repositorio ni publicarlas en grupos.

La API es pública para permitir la recepción desde el formulario. La verificación Turnstile, el origen y los límites del proveedor ayudan a reducir abuso, pero no garantizan la autenticidad del contenido ni sustituyen controles y revisión administrativa.
