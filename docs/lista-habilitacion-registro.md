# Preparar y habilitar el registro de actualización CORTRIP

## Estado actual

El sitio contiene una convocatoria y un formulario de actualización. El envío permanece desactivado en `js/config.js`: no se recopilan respuestas reales desde esta web hasta configurar y probar la base central. El formulario no almacena datos en el navegador.

## Finalidad y límites

Las respuestas se organizarán para facilitar el cotejo con registros históricos y, cuando corresponda, ponerlas a disposición de una futura administración competente para revisión y gestión institucional. Las respuestas son declaraciones de los participantes; no verifican identidad, no determinan afiliación ni modifican un registro oficial. La participación en esta recopilación por sí sola no determina la calidad de socio ni derechos de voto. Cualquier decisión de ese tipo requiere las reglas y autoridad competentes.

## Infraestructura prevista

- Sitio estático por HTTPS.
- Supabase Edge Function como receptor HTTPS; la clave de servicio permanece solo como secreto del servidor.
- Tabla de solicitudes con RLS habilitado y sin lectura pública.
- Cloudflare Turnstile para reducir envíos automatizados.
- La iniciativa debe tener acceso administrativo seguro a la base para revisión y exportación controlada.

## Pasos de despliegue

1. Crear cuentas de servicio controladas por la iniciativa y activar MFA. Establecer quién puede acceder y un procedimiento de continuidad.
2. Crear proyecto Supabase. Comprobar región, condiciones de tratamiento, controles, respaldo y exportación disponibles en el plan elegido.
3. Crear widget de Cloudflare Turnstile con el hostname final.
4. Confirmar el dominio y HTTPS del sitio web.
5. Completar en `index.html` la identidad y contacto del responsable, ubicación/proveedor del almacenamiento, plazo de conservación y canal para solicitudes de derechos. Revisar el texto para que describa con exactitud quién administrará los datos y cómo se usarán.
6. Aplicar `supabase/schema.sql` en el SQL Editor.
7. Instalar la CLI de Supabase y configurar los secretos en el entorno de despliegue, nunca en el repositorio:

```sh
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase secrets set SUPABASE_URL="https://TU_PROJECT_REF.supabase.co" SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY" TURNSTILE_SECRET_KEY="TU_TURNSTILE_SECRET" ALLOWED_ORIGIN="https://TU_DOMINIO_PUBLICO" ALLOWED_HOSTNAME="TU_HOSTNAME_PUBLICO"
supabase functions deploy registro
```

8. En `js/config.js`, introducir solo la URL pública del endpoint y la site key pública de Turnstile. Cambiar `registrationEnabled` a `true` únicamente después de configurar el aviso y completar pruebas.
9. Probar con información ficticia el flujo de éxito y rechazo: validación, consentimiento, CAPTCHA, hostname y origen. Confirmar en el panel restringido que se insertó la respuesta y comprobar que visitantes no pueden consultar registros. Revisar que logs y mensajes no expongan datos personales.
10. Definir respaldo, exportación cifrada, revisión y entrega a futura administración, con registro de quién accede y cuándo se eliminan los datos.

## Seguridad y alcance

La URL de recepción es pública para que los socios puedan enviar respuestas. CORS/origen y CAPTCHA ayudan a reducir abuso, pero no autentican a la persona ni garantizan la exactitud de lo declarado. No alojar cédulas, respuestas o exportaciones en GitHub. Este sistema no implementa padrón oficial, acreditación de membresía ni votación electrónica.
