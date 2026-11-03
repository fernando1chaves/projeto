/* Somente apresentação do login. Autenticação permanece em auth-client.js. */
(function () {
  'use strict';
  function iniciarVisualLogin() {
    var gate = document.getElementById('authGate');
    var controle = document.getElementById('authThemeToggle');
    var temaExistente = document.getElementById('themeToggle');
    if (!gate || !controle || !temaExistente) return;
    function sincronizarTema() {
      var escuro = document.documentElement.getAttribute('data-theme') === 'dark';
      controle.setAttribute('aria-checked', String(escuro));
    }
    controle.addEventListener('click', function () {
      temaExistente.click();
    });
    new MutationObserver(sincronizarTema).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme']
    });
    sincronizarTema();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarVisualLogin, { once: true });
  } else {
    iniciarVisualLogin();
  }
})();
