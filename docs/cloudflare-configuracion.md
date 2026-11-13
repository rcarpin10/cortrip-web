# Preparación de almacenamiento CORTRIP con Cloudflare Pages y D1

## Estado actual

El código prepara la función `/api/registro`, la migración D1 y el formulario. La opción de envío continúa apagada en `js/config.js`. Todavía falta crear la cuenta/proyecto Cloudflare, base D1, widget Turnstile, publicar Pages y probar los bindings. No ingresar ni solicitar datos reales mientras el botón siga desactivado.

## Pasos operativos

1. Crear o utilizar una cuenta Cloudflare controlada por la iniciativa; activar MFA y añadir custodios. No depender de una sola cuenta personal.
2. Crear un proyecto D1 `cortrip-registro` desde Cloudflare Dashboard o ejecutar `npx wrangler d1 create cortrip-registro`; copiar el ID a `wrangler.toml`.
3. Crear el widget Turnstile para el hostname Pages final. La site key se publica en `js/config.js`; la secret key se almacena como secreto en Cloudflare, nunca en el repositorio.
4. Completar en `wrangler.toml` `ALLOWED_ORIGIN` y `ALLOWED_HOSTNAME` con el dominio HTTPS exacto. No usar placeholders.
5. En una terminal local con Wrangler, ejecutar `npx wrangler login` y aplicar la migración:

```sh
npx wrangler d1 migrations apply cortrip-registro --remote
```

6. Conectar `cortrip-web` a Cloudflare Pages. Configuración de compilación: framework `None`, directorio de salida `.` (raíz). Confirmar que detecta `functions/api/registro.ts` y el binding D1 con nombre `DB`.
7. Configurar las variables `ALLOWED_ORIGIN` y `ALLOWED_HOSTNAME` como variables de entorno de Pages para producción y preview, según corresponda. Configurar `TURNSTILE_SECRET_KEY` como secreto del proyecto:

```sh
npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name cortrip-web
```

8. Ajustar `js/config.js` con la site key pública Turnstile. Mantener `registrationEnabled: false`.
9. Probar primero localmente con D1 local y tokens de prueba, y después en un deployment preview con dominio y widget de prueba. Verificar inserción, validaciones, rechazo de CAPTCHA y que no existe endpoint de lectura pública. Eliminar registros ficticios.
10. Completar y publicar el aviso de privacidad con responsable, contacto, proveedor/ubicación, finalidad, conservación y canal de solicitudes. Definir accesos, exportación cifrada y respaldo de datos.
11. Solo tras revisión técnica/operativa, abrir un cambio para activar `registrationEnabled: true`.

## Seguridad y continuidad

El secreto Turnstile es una variable de entorno secreta, no `[vars]` ni código. El binding D1 solo se usa desde la función; no crear API de consulta pública. No registrar cuerpo, cédula, teléfono, correo ni observaciones en logs. Turnstile reduce abuso, pero no prueba identidad. Revisar límites y condiciones del plan gratuito y disponer de exportaciones de respaldo antes de recopilar respuestas. Las reglas de afiliación, padrón y voto corresponden a procesos y autoridades competentes.
