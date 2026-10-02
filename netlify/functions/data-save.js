'use strict';

const lib = require('./_auth-lib');
const { salvarBase } = require('./data-store');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return lib.json(405, {
      ok: false,
      erro: 'Método não permitido.'
    });
  }

  const sessao = lib.sessaoDoEvento(event, process.env);

  if (!sessao) {
    lib.logSeguranca('DATA_SAVE_SEM_SESSAO', {
      ip: lib.ipDoEvento(event)
    });

    return lib.json(401, {
      ok: false,
      erro: 'Sessão inexistente ou expirada.'
    });
  }

  if (sessao.role !== 'ADMINISTRADOR') {
    lib.logSeguranca('DATA_SAVE_NEGADO', {
      email: sessao.email,
      role: sessao.role,
      ip: lib.ipDoEvento(event)
    });

    return lib.json(403, {
      ok: false,
      erro: 'Somente o Administrador pode atualizar a base oficial.'
    });
  }

  let corpo;

  try {
    corpo = JSON.parse(event.body || '{}');
  } catch (erro) {
    return lib.json(400, {
      ok: false,
      erro: 'JSON inválido.'
    });
  }

  const rows = Array.isArray(corpo.rows) ? corpo.rows : [];

  if (!rows.length) {
    return lib.json(400, {
      ok: false,
      erro: 'Nenhum registro recebido para atualização.'
    });
  }

  try {
    const registro = await salvarBase({
      fileName: String(corpo.fileName || ''),
      updatedBy: sessao.email,
      rows
    });

    lib.logSeguranca('DATA_SAVE_SUCESSO', {
      email: sessao.email,
      role: sessao.role,
      registros: rows.length,
      arquivo: String(corpo.fileName || '').slice(0, 120),
      ip: lib.ipDoEvento(event)
    });

    return lib.json(200, {
      ok: true,
      mensagem: 'Base oficial atualizada com sucesso.',
      registros: rows.length,
      savedAt: registro.savedAt,
      updatedBy: registro.updatedBy,
      fileName: registro.fileName
    });

  } catch (erro) {
    console.error('DATA_SAVE_ERRO', erro);

    return lib.json(500, {
      ok: false,
      erro: 'Não foi possível salvar a base oficial.'
    });
  }
};