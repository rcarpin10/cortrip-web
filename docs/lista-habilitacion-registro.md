# Lista de habilitación del registro CORTRIP

El formulario y la infraestructura de recepción están preparados en el repositorio, pero el envío está deliberadamente apagado hasta que se configure el servicio y se pruebe de extremo a extremo. No se debe activar con datos reales antes de completar estos pasos.

## Qué hace la implementación

- El navegador presenta el formulario dentro de la web y envía una solicitud HTTPS a una Supabase Edge Function.
- La función valida formato y consentimiento, comprueba el token de Cloudflare Turnstile y solo después inserta la respuesta en la tabla privada.
- La tabla tiene RLS activado y no concede lectura a visitantes. La clave `service_role` solo se configura como secreto de la función.
- La página no guarda respuestas en `localStorage` ni muestra listados de socios.
- Esta arquitectura no confirma identidad, no coteja el listado antiguo y no determina afiliación.

## Configuración requerida

1. Crear una cuenta controlada por la iniciativa y activar autenticación multifactor. Designar custodios y un proceso de continuidad de acceso.
2. Crear un proyecto de Supabase; comprobar su región, condiciones de servicio, respaldo, exportación y controles disponibles en el plan elegido.
3. Crear un widget de Cloudflare Turnstile para el dominio final; configurar el hostname exacto.
4. Confirmar el dominio y HTTPS del sitio web. No asumir que una URL de vista previa es el dominio final.
5. Completar en `index.html` el contacto real del responsable, la ubicación/proveedor de alojamiento, el periodo de conservación y el canal de solicitudes de acceso, rectificación o eliminación. Reemplazar `aviso_version` del SQL cuando cambie el aviso. Revisa esos textos con asesoría apropiada a la normativa ecuatoriana.
6. Aplicar `supabase/schema.sql` en el SQL Editor del proyecto.
7. Instalar la CLI de Supabase y ejecutar, desde la raíz del repo:

```sh
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase secrets set SUPABASE_URL="https://TU_PROJECT_REF.supabase.co" SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY" TURNSTILE_SECRET_KEY="TU_TURNSTILE_SECRET" ALLOWED_ORIGIN="https://TU_DOMINIO_PUBLICO" ALLOWED_HOSTNAME="TU_HOSTNAME_PUBLICO"
supabase functions deploy registro
```

Nunca guardes `SUPABASE_SERVICE_ROLE_KEY` ni `TURNSTILE_SECRET_KEY` en el repositorio, en `js/config.js`, en el HTML, en capturas o en mensajes públicos. Si una clave se expone, rótala inmediatamente.

8. En `js/config.js`, cuando ya esté desplegado, configura solo los valores públicos: `registrationEndpoint` (`https://TU_PROJECT_REF.supabase.co/functions/v1/registro`) y `turnstileSiteKey`. Cambia `registrationEnabled` a `true` solo una vez que el aviso esté completo y las pruebas hayan pasado.
9. Probar con datos ficticios en el dominio final: aceptación del formulario y consentimiento, rechazo de datos inválidos, rechazo de token CAPTCHA, origen/hostname incorrecto, persistencia en la tabla y ausencia de acceso público de lectura. Inspecciona errores y logs para confirmar que no se registran cédulas ni teléfonos.
10. Antes de difundirlo, verifica quiénes pueden acceder al panel de Supabase, cómo se descargan/entregan los registros a la futura administración y cuándo se eliminan. Guarda exportaciones cifradas y transfiere el acceso de forma controlada.

`Origin` y CAPTCHA son controles de abuso, no un sustituto de autorización ni una garantía absoluta contra envíos maliciosos. La URL de la función será pública por diseño; mantén el CAPTCHA y los límites de uso del proveedor activos, y revisa el servicio periódicamente.
