(function () {
  'use strict';

  const config = window.CORTRIP_CONFIG || {};
  const form = document.getElementById('formRegistro');
  const statusBox = document.getElementById('estadoServicio');
  const button = document.getElementById('submitButton');
  const message = document.getElementById('mensaje');
  const captchaContainer = document.getElementById('turnstileContainer');
  let captchaWidgetId = null;

  function setMessage(text, isError) {
    message.textContent = text;
    message.className = isError ? 'message error' : 'message success';
  }

  function setReady(isReady) {
    button.disabled = !isReady;
    button.textContent = isReady ? 'Enviar actualización voluntaria' : 'Registro en preparación';
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      field.disabled = !isReady;
    });
    if (!isReady) {
      statusBox.textContent = 'El formulario está en preparación y no enviará ni almacenará respuestas. No ingreses datos personales todavía.';
      statusBox.classList.add('notice');
      captchaContainer.hidden = true;
    }
  }

  function configureCaptcha() {
    if (!config.turnstileSiteKey) return;
    captchaContainer.hidden = false;
    window.onTurnstileLoaded = function () {
      captchaWidgetId = window.turnstile.render('#turnstileWidget', {
        sitekey: config.turnstileSiteKey,
        theme: 'light',
        action: 'registro'
      });
    };
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoaded';
    script.async = true;
    script.defer = true;
    script.onerror = function () {
      setMessage('No se pudo cargar la verificación de seguridad. Inténtalo más tarde.', true);
      setReady(false);
    };
    document.head.appendChild(script);
  }

  const ready = config.registrationEnabled === true &&
    typeof config.registrationEndpoint === 'string' &&
    config.registrationEndpoint.startsWith('https://') &&
    Boolean(config.turnstileSiteKey);

  setReady(ready);
  if (ready) {
    statusBox.textContent = 'El servicio está habilitado. Lee el aviso de privacidad completo antes de enviar tus datos.';
    configureCaptcha();
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!ready) {
      setMessage('El registro aún no está habilitado; no se ha enviado ni guardado información.', true);
      return;
    }
    if (!form.reportValidity()) return;

    const captchaToken = window.turnstile && captchaWidgetId !== null
      ? window.turnstile.getResponse(captchaWidgetId)
      : '';
    if (!captchaToken) {
      setMessage('Completa la verificación de seguridad antes de enviar.', true);
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    payload.captchaToken = captchaToken;
    button.disabled = true;
    button.textContent = 'Enviando…';
    message.textContent = '';

    try {
      const response = await fetch(config.registrationEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'cors',
        credentials: 'omit'
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'No se pudo recibir la solicitud.');
      form.reset();
      if (window.turnstile && captchaWidgetId !== null) window.turnstile.reset(captchaWidgetId);
      setMessage('Tu actualización fue recibida. Este comprobante no certifica la calidad de socio ni modifica el padrón oficial.', false);
    } catch (error) {
      setMessage(error.message || 'No se pudo enviar la información. Inténtalo más tarde.', true);
      if (window.turnstile && captchaWidgetId !== null) window.turnstile.reset(captchaWidgetId);
    } finally {
      button.disabled = false;
      button.textContent = 'Enviar actualización voluntaria';
    }
  });
})();
