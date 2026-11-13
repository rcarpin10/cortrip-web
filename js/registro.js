(function () {
  'use strict';
  const config = window.CORTRIP_CONFIG || {};
  const form = document.getElementById('formRegistro');
  if (!form) return;

  const statusBox = document.getElementById('estadoServicio');
  const button = document.getElementById('submitButton');
  const message = document.getElementById('mensaje');
  const captchaContainer = document.getElementById('turnstileContainer');
  let captchaWidgetId = null;
  let captchaLoaded = false;
  let captchaFailed = false;

  function setMessage(text, isError) {
    message.textContent = text;
    message.className = isError ? 'message error' : 'message success';
  }
  function setReady(isReady) {
    button.disabled = !isReady;
    button.textContent = isReady ? 'Enviar actualización' : 'Registro en preparación';
    form.querySelectorAll('input, select, textarea').forEach((field) => { field.disabled = !isReady; });
    if (!isReady) {
      statusBox.textContent = 'El formulario está en preparación y no enviará ni almacenará respuestas. No ingreses datos personales todavía.';
      statusBox.classList.add('notice');
      captchaContainer.hidden = true;
    }
  }
  function configureCaptcha() {
    captchaContainer.hidden = false;
    window.onTurnstileLoaded = function () {
      captchaWidgetId = window.turnstile.render('#turnstileWidget', {
        sitekey: config.turnstileSiteKey,
        theme: 'light',
        action: 'registro',
        callback: function () { captchaLoaded = true; captchaFailed = false; },
        'expired-callback': function () { captchaLoaded = false; },
        'error-callback': function () { captchaLoaded = false; }
      });
    };
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoaded';
    script.async = true;
    script.defer = true;
    script.onerror = function () {
      captchaFailed = true;
      setMessage('No se pudo cargar la verificación de seguridad. Inténtalo más tarde.', true);
      setReady(false);
    };
    document.head.appendChild(script);
  }

  const ready = config.registrationEnabled === true &&
    config.registrationEndpoint === '/api/registro' && Boolean(config.turnstileSiteKey);
  setReady(ready);
  if (ready) {
    statusBox.textContent = 'El servicio está habilitado. Lee el aviso completo antes de enviar tus datos.';
    configureCaptcha();
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!ready || captchaFailed) {
      setMessage('El registro no está disponible; no se ha enviado ni guardado información.', true);
      return;
    }
    if (!form.reportValidity()) return;
    const captchaToken = window.turnstile && captchaWidgetId !== null
      ? window.turnstile.getResponse(captchaWidgetId)
      : '';
    if (!captchaLoaded || !captchaToken) {
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
        credentials: 'same-origin'
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'No se pudo recibir la solicitud.');
      form.reset();
      captchaLoaded = false;
      if (window.turnstile && captchaWidgetId !== null) window.turnstile.reset(captchaWidgetId);
      setMessage('Tu actualización fue recibida. Este comprobante no certifica identidad o calidad de socio ni modifica el registro oficial.', false);
    } catch (error) {
      setMessage(error.message || 'No se pudo enviar la información. Inténtalo más tarde.', true);
      captchaLoaded = false;
      if (window.turnstile && captchaWidgetId !== null) window.turnstile.reset(captchaWidgetId);
    } finally {
      if (!captchaFailed) {
        button.disabled = false;
        button.textContent = 'Enviar actualización';
      }
    }
  });
})();
