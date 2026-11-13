# Habilitar el registro voluntario de CORTRIP

## Estado actual

La página incluye el formulario en `index.html`, pero el envío está **deshabilitado** intencionalmente. `js/config.js` no contiene secretos y mantiene `registrationEnabled: false`; la web no guarda datos en `localStorage`, no muestra respuestas y no envía datos a ningún servicio mientras no se configure el backend.

Esta guía crea una API de recepción con Supabase Edge Functions y una tabla sin lectura pública. La integración usa Cloudflare Turnstile para reducir envíos automatizados. HTTPS protege el transporte, pero no sustituye controles de acceso, revisión del aviso, ni la administración segura de la cuenta.

## Antes de habilitarlo

1. La iniciativa debe definir quién es responsable de la recopilación y un correo/canal para solicitudes de acceso, corrección o eliminación.
2. Completar en el aviso de `index.html` la identidad/contacto del responsable, proveedor y país de alojamiento, periodo de conservación y procedimiento para ejercer derechos. Revisar la redacción y el tratamiento con asesoría apropiada a la normativa ecuatoriana; esta guía no constituye asesoría legal.
3. Crear una cuenta controlada por la iniciativa, activar autenticación multifactor y designar al menos dos custodios responsables. No usar una cuenta personal que pueda perderse.
4. Crear proyecto Supabase y sitio/widget de Cloudflare Turnstile. Confirmar región, términos, controles de acceso y condiciones de tratamiento de ambos proveedores antes de incorporar datos reales.
5. Aplicar `supabase/schema.sql` en el SQL Editor del proyecto.
6. Desplegar la función y configurar sus secretos. No incluir claves secretas en el repositorio, HTML o JavaScript.
7. Configurar el sitio de Turnstile para el dominio que servirá la web y proteger el endpoint para aceptar solo el dominio previsto.
8. Probar envío, rechazo de CAPTCHA y ausencia de lectura pública usando datos ficticios. Revisar que no existan datos en logs ni en respuestas de error.

## Despliegue de la Edge Function

Instalar la CLI de Supabase y vincular el proyecto siguiendo la documentación oficial. Desde la raíz del repositorio:

```sh
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase secrets set SUPABASE_URL="https://TU_PROJECT_REF.supabase.co" SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY" TURNSTILE_SECRET_KEY="TU_TURNSTILE_SECRET" ALLOWED_ORIGIN="https://TU_DOMINIO_PUBLICO"
supabase functions deploy registro
```

La `SUPABASE_SERVICE_ROLE_KEY` y `TURNSTILE_SECRET_KEY` son secretos: no los escribas en `js/config.js`, el repositorio, capturas, chats públicos ni en la página. Limita quién administra el proyecto y rota las claves si se exponen.

La URL de la función desplegada tendrá el formato `https://TU_PROJECT_REF.supabase.co/functions/v1/registro`. En `js/config.js`, completa únicamente los valores públicos `registrationEndpoint` y `turnstileSiteKey`, y cambia `registrationEnabled` a `true` solo tras finalizar las revisiones anteriores y probar en el dominio final.

## Datos y acceso

La tabla guarda los campos enviados y la hora de recepción. RLS está habilitado y no hay políticas de lectura para visitantes. El endpoint de la función es público para recibir solicitudes, por lo que Turnstile, límites del proveedor y vigilancia de uso son importantes. Las respuestas recibidas deben revisarse desde una cuenta administrativa protegida; nunca se debe publicar una exportación con datos personales.

La función no coteja cédulas contra el listado de 2012, no valida identidad ni determina afiliación. Esas tareas quedan para una revisión futura por personas autorizadas. Define y documenta un periodo de retención y elimina registros cuando corresponda.
