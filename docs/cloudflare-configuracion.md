# Preparación de almacenamiento CORTRIP con Cloudflare Pages y D1

## Estado del código

La página incluye el formulario; `functions/api/registro.ts` recibe los envíos en la ruta del mismo dominio `/api/registro` y escribe en D1. `js/config.js` mantiene `registrationEnabled: false`, por lo que la recepción permanece apagada. No almacenar respuestas reales hasta terminar los pasos y pruebas.

## Crear el servicio

1. Crear/iniciar sesión en una cuenta Cloudflare controlada por la iniciativa y activar autenticación multifactor. Añadir solo custodios necesarios.
2. Crear un proyecto D1 llamado `cortrip-registro` (Cloudflare Dashboard → Workers & Pages → D1 SQL database) o desde terminal con Wrangler instalado:

```sh
npx wrangler login
npx wrangler d1 create cortrip-registro
```

3. Copiar el `database_id` devuelto a `wrangler.toml`, y completar `ALLOWED_ORIGIN` y `ALLOWED_HOSTNAME` con el dominio final HTTPS. No usar el dominio de ejemplo en producción.
4. Aplicar la migración local:

```sh
npx wrangler d1 migrations apply cortrip-registro --remote
```

5. Crear un widget Cloudflare Turnstile para el hostname final. La **site key** es pública y se configura en `js/config.js`; la **secret key** debe configurarse como secreto del proyecto Pages, nunca en el repositorio ni en `wrangler.toml`:

```sh
npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name cortrip-web
```

6. Publicar la carpeta del sitio mediante Cloudflare Pages, conectando el repositorio o usando Wrangler. Configurar el directorio de salida como `.` (raíz) y verificar que Pages reconoce la función `functions/api/registro.ts` y el enlace D1.
7. Solo después de que exista el dominio final, ajustar `ALLOWED_ORIGIN` / `ALLOWED_HOSTNAME`, endpoint `/api/registro` y site key pública de Turnstile.

## Pruebas obligatorias con datos ficticios

- En modo local, ejecutar `npx wrangler pages dev .` con los bindings D1 de desarrollo y probar el formulario con datos inventados.
- Confirmar respuestas válidas, rechazo de campos inválidos, falta de consentimiento y CAPTCHA incorrecto.
- Revisar en el panel D1 que se guarda una fila de prueba; comprobar que no existe endpoint público para consultar filas.
- Confirmar que no se registran cédulas, teléfonos ni cuerpos de solicitud en logs.
- Borrar la fila de prueba antes de abrir el formulario.

## Operación

La base almacena solicitudes declarativas para revisión posterior; no autentica a la persona ni determina afiliación o derechos de voto. Definir accesos administrativos, proceso de exportación cifrada, respaldos periódicos, conservación/eliminación y quién recibirá los datos en el futuro. Verificar los límites vigentes del plan gratuito y tener en cuenta que el servicio podría limitar solicitudes o cambiar sus condiciones. La recepción pública debe tener controles antiabuso activos.
