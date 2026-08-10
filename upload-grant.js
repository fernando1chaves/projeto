/* Etapa 4 — POST /api/upload-grant (Seções 14, 15 e 16).
   Autorização REAL do upload, fora do navegador: valida sessão → identidade →
   perfil, e só ADMINISTRADOR recebe a concessão. Reexibir o botão pelo
   DevTools, alterar localStorage ou chamar a função de upload manualmente
   não passa por aqui sem um cookie assinado com perfil ADMINISTRADOR —
   e o segredo de assinatura nunca sai do servidor. Auditoria na Seção 36. */
'use strict';
const lib = require('./_auth-lib');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return lib.json(405, { erro: 'Método não permitido.' });

  const sessao = lib.sessaoDoEvento(event, process.env);
  if (!sessao) {
    lib.logSeguranca('UPLOAD_SEM_SESSAO', { ip: lib.ipDoEvento(event) });
    return lib.json(401, { erro: 'Sessão inexistente ou expirada.' });
  }
  if (sessao.role !== 'ADMINISTRADOR') {
    lib.logSeguranca('UPLOAD_NEGADO', { email: sessao.email, role: sessao.role, ip: lib.ipDoEvento(event) });
    return lib.json(403, { erro: 'Você não possui permissão para executar esta operação.' });   // Seção 40
  }

  let corpo; try { corpo = JSON.parse(event.body || '{}'); } catch (e) { corpo = {}; }
  /* Auditoria (Seção 36) — nos logs da function; nunca senha nem token. */
  lib.logSeguranca('UPLOAD_AUTORIZADO', {
    email: sessao.email,
    arquivo: String(corpo.arquivo || '').slice(0, 120),
    tamanhoBytes: Number(corpo.tamanho) || null,
    ip: lib.ipDoEvento(event)
  });
  return lib.json(200, { grant: true, email: sessao.email });
};
