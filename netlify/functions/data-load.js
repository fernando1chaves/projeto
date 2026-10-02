'use strict';

const lib = require('./_auth-lib');
const { carregarBase } = require('./data-store');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return lib.json(405, {
      ok: false,
      erro: 'Método não permitido.'
    });
  }

  const sessao = lib.sessaoDoEvento(event, process.env);

  if (!sessao) {
    lib.logSeguranca('DATA_LOAD_SEM_SESSAO', {
      ip: lib.ipDoEvento(event)
    });

    return lib.json(401, {
      ok: false,
      erro: 'Sessão inexistente ou expirada.'
    });
  }

  try {
    const registro = await carregarBase();

    if (!registro) {
      return lib.json(200, {
        ok: true,
        existe: false,
        rows: []
      });
    }

    return lib.json(200, {
      ok: true,
      existe: true,
      rows: registro.rows,
      savedAt: registro.savedAt,
      updatedBy: registro.updatedBy,
      fileName: registro.fileName
    });

  } catch (erro) {
    console.error('DATA_LOAD_ERRO', erro);

    return lib.json(500, {
      ok: false,
      erro: 'Não foi possível carregar a base oficial.'
    });
  }
};