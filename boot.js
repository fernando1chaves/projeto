/* ==========================================================================
   TORRE DE CONTROLE LOGÍSTICA · Etapa 4 — boot.js
   --------------------------------------------------------------------------
   Conteúdo movido dos <script> embutidos do index.html (tema claro/escuro e
   fallbacks locais de CDN) para arquivos externos. Motivação de segurança
   (Seção 30): sem nenhum script inline na página, a Content-Security-Policy
   publicada no Netlify dispensa 'unsafe-inline' para scripts — um eventual
   script injetado por XSS simplesmente não executa. Comportamento funcional
   idêntico ao anterior; nenhuma lógica foi alterada.

   Encadeamento do fallback do SheetJS: como um script inserido por
   document.write só executa DEPOIS do script atual, a verificação final
   (cdnjs também falhou → cópia local ./vendor) vive em boot-fallback.js,
   carregado na sequência — mantendo todo o código em arquivos externos.
   ========================================================================== */
(function () {
  'use strict';

  /* ── Fallbacks de CDN (mesma cadeia da versão anterior) ─────────────── */
  if (!window.XLSX) document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"><\/script>');
  if (!window.Chart) document.write('<script src="vendor/chart.umd.min.js"><\/script>');
  if (!window.L) {
    document.write('<link rel="stylesheet" href="vendor/leaflet.min.css">');
    document.write('<script src="vendor/leaflet.min.js"><\/script>');
  }
  if (!window.XLSX) document.write('<script src="boot-fallback.js"><\/script>');

  /* ── Tema claro/escuro (inalterado — Alteração 03 da etapa anterior) ── */
  var saved = null;
  try { saved = localStorage.getItem('followupTheme'); } catch (e) {}
  var theme = (saved === 'dark') ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);

  function syncIcon() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var ico = btn.querySelector('.tc-ico') || btn;
    ico.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  }

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest && ev.target.closest('#themeToggle');
    if (!btn) return;
    var cur = document.documentElement.getAttribute('data-theme');
    var next = (cur === 'dark') ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('followupTheme', next); } catch (e) {}
    syncIcon();
  });
  document.addEventListener('DOMContentLoaded', syncIcon);
})();
