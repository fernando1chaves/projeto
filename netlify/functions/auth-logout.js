/* Etapa 4 — POST /api/logout (Seção 19): invalida a sessão removendo o
   cookie HttpOnly. Sem o cookie, todas as rotas protegidas voltam a 401. */
'use strict';
const lib = require('./_auth-lib');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return lib.json(405, { erro: 'Método não permitido.' });
  const sessao = lib.sessaoDoEvento(event, process.env);
  lib.logSeguranca('LOGOUT', { email: sessao ? sessao.email : null, ip: lib.ipDoEvento(event) });
  return lib.json(200, { ok: true }, lib.cookieLimpar());
};
