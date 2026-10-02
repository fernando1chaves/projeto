'use strict';
const lib = require('./_auth-lib');
const { carregarCarteira } = require('./carteira-store');
exports.handler = async event => {
  if(event.httpMethod !== 'GET') return lib.json(405, { ok: false, erro: 'Método não permitido.' });
  if(!lib.sessaoDoEvento(event, process.env)) return lib.json(401, { ok: false, erro: 'Sessão inexistente ou expirada.' });
  try{
    const registro = await carregarCarteira();
    return lib.json(200, registro ? { ok: true, existe: true, rows: registro.rows, savedAt: registro.savedAt,
      fileName: registro.fileName, updatedBy: registro.updatedBy } : { ok: true, existe: false, rows: [] });
  }catch(e){
    console.error('CARTEIRA_LOAD_ERRO', e);
    return lib.json(500, { ok: false, erro: 'Não foi possível carregar a carteira compartilhada.' });
  }
};
