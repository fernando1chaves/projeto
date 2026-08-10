/* Etapa 4 — GET /api/session. Valida a sessão existente (fluxo da Seção 12:
   refresh da página autenticada restaura o acesso sem novo login enquanto o
   token do cookie HttpOnly for válido e não expirado). */
'use strict';
const lib = require('./_auth-lib');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return lib.json(405, { erro: 'Método não permitido.' });
  const sessao = lib.sessaoDoEvento(event, process.env);
  if (!sessao) return lib.json(401, { erro: 'Sessão inexistente ou expirada.' }, lib.cookieLimpar());
  return lib.json(200, { email: sessao.email, role: sessao.role, exp: sessao.exp });
};
