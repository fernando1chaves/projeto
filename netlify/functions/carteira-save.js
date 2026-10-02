'use strict';
const lib = require('./_auth-lib');
const { validar } = require('../../carteira');
const { salvarCarteira } = require('./carteira-store');
exports.handler = async event => {
  if(event.httpMethod !== 'POST') return lib.json(405, { ok: false, erro: 'Método não permitido.' });
  const sessao = lib.sessaoDoEvento(event, process.env);
  if(!sessao) return lib.json(401, { ok: false, erro: 'Sessão inexistente ou expirada.' });
  if(sessao.role !== 'ADMINISTRADOR') return lib.json(403, { ok: false, erro: 'Somente o Administrador pode atualizar a carteira.' });
  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch(e){ return lib.json(400, { ok: false, erro: 'JSON inválido.' }); }
  let rows;
  try { rows = validar(body && body.rows); }
  catch(e){ return lib.json(400, { ok: false, erro: e.message }); }
  try{
    const registro = await salvarCarteira({ rows, fileName: String(body.fileName || '').slice(0, 200), updatedBy: sessao.email });
    lib.logSeguranca('CARTEIRA_SAVE_SUCESSO', { email: sessao.email, registros: rows.length, ip: lib.ipDoEvento(event) });
    return lib.json(200, { ok: true, registros: rows.length, savedAt: registro.savedAt, fileName: registro.fileName, updatedBy: registro.updatedBy });
  }catch(e){
    console.error('CARTEIRA_SAVE_ERRO', e);
    return lib.json(500, { ok: false, erro: 'Não foi possível salvar a carteira compartilhada.' });
  }
};
