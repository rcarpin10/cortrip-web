# Preparación de almacenamiento CORTRIP con Cloudflare Pages y D1

## Estado y alcance

El código prepara la función `/api/registro`, la migración D1 y el formulario. El envío permanece desactivado. Aún hay que crear y configurar una cuenta/proyecto Cloudflare, base D1, widget Turnstile y dominio Pages, y hacer pruebas. No ingresar ni solicitar datos reales mientras el botón siga desactivado.

## Pasos operativos

1. Crear o utilizar una cuenta Cloudflare administrada por la iniciativa; activar MFA y añadir custodios. Evitar que una cuenta personal sea el único medio de acceso.
2. Crear la base D1 `cortrip-registro` desde el panel o con Wrangler:

```sh
npx wrangler login
npx wrangler d1 create cortrip-registro
```

3. Copiar el `database_id` generado a `wrangler.toml`. Al crear el proyecto Pages, definir el hostname final HTTPS y completar `ALLOWED_ORIGIN` y `ALLOWED_HOSTNAME` con los valores exactos.
4. Crear un widget Turnstile para ese hostname. La site key va en `js/config.js`; la secret key se almacena como secreto en Pages, nunca en el repositorio ni en `[vars]`.
5. Aplicar la migración desde la raíz del proyecto:

```sh
npx wrangler d1 migrations apply cortrip-registro --remote
```

6. Conectar `cortrip-web` a Cloudflare Pages (framework `None`, directorio de salida `.`). Confirmar que Pages reconoce `functions/api/registro.ts` y el binding D1 con nombre `DB`.
7. Configurar `ALLOWED_ORIGIN` y `ALLOWED_HOSTNAME` como variables de entorno de Pages para el entorno correspondiente. Crear el secreto:

```sh
npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name cortrip-web
```

8. Completar la site key pública en `js/config.js`, dejando `registrationEnabled: false`.
9. Probar localmente con D1 local y tokens de prueba, y luego en un deployment preview con widget de prueba. Verificar inserciones, rechazo de campos inválidos y CAPTCHA, y que no exista endpoint de lectura pública. Borrar las filas ficticias.
10. Completar el aviso de privacidad con responsable, contacto, proveedor/ubicación, finalidad, conservación y canal para solicitudes. Definir accesos, exportación cifrada y respaldo periódico.
11. Tras la revisión operativa y técnica, activar el formulario mediante un cambio separado. No comprometer datos reales durante pruebas.

## Prioridades institucionales posteriores

- **Cotejo y padrón:** la información recibida son declaraciones para revisión. La administración competente debe establecer fuentes, criterios, fecha de corte, trazabilidad, corrección y apelación antes de elaborar o aprobar un padrón. No inferir automáticamente afiliación o derechos de voto.
- **Votación electrónica:** diseñarla como sistema separado, solo después de reglas aprobadas y padrón validado. Requerirá proceso para elegibilidad, secreto del voto, integridad verificable, auditoría independiente, accesibilidad y contingencias. El formulario actual no autentica electores ni es un sistema de votación.
- **Web corporativa CORTRIP:** podrá reutilizar la identidad visual y materiales públicos aprobados: historia, misión, autoridades vigentes, documentos públicos, noticias, contacto y transparencia. No publicar datos de socios, cédulas, teléfonos privados, credenciales, exportaciones ni documentos internos.

## Seguridad y continuidad

No crear APIs de lectura pública ni registrar cuerpos de solicitud, cédulas, teléfonos, correos u observaciones en logs. Turnstile reduce abuso, pero no acredita identidad. Verificar límites y condiciones del plan gratuito; establecer custodios, MFA, respaldos/exportación cifrada, conservación y borrado. Preparar una entrega formal a la futura administración usando un canal autorizado y cifrado.
