/* ============================================================================
   TORRE DE CONTROLE LOGÍSTICA · Etapa 4 — gerar-hash.js
   ----------------------------------------------------------------------------
   Utilitário LOCAL (nunca publicado como página) para gerar o hash PBKDF2 de
   uma senha, no formato aceito pela variável de ambiente TC_USERS.

   Uso:  node gerar-hash.js "minhaSenhaForte"
   Saída: pbkdf2$210000$<salt>$<hash>

   Troca de senha = gerar novo hash aqui e substituir o campo "hash" do
   usuário em TC_USERS no painel do Netlify. Nenhum deploy de código é
   necessário; a senha em texto claro nunca é armazenada em lugar algum.
   ============================================================================ */
'use strict';
const { gerarHash } = require('./netlify/functions/_auth-lib');
const senha = process.argv[2];
if (!senha) { console.error('Uso: node gerar-hash.js "senha"'); process.exit(1); }
console.log(gerarHash(senha));
