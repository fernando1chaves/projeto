/* Etapa 4 — 2ª etapa do fallback do SheetJS (ver boot.js): executa depois da
   tentativa via cdnjs; se ela também falhou, carrega a cópia local. */
if (!window.XLSX) document.write('<script src="vendor/xlsx-js-style.bundle.js"><\/script>');
