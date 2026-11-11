'use strict';
const STORE_NAME = 'torre-controle-carteira';
const CARTEIRA_KEY = 'carteira-fornecedor-atual';
async function getCarteiraStore(){
  const { getStore } = await import('@netlify/blobs');
  return getStore(STORE_NAME, { consistency: 'strong' });
}
async function salvarCarteira(payload){
  const store = await getCarteiraStore();
  const registro = { version: 1, savedAt: Date.now(), fileName: payload.fileName, updatedBy: payload.updatedBy, rows: payload.rows };
  await store.setJSON(CARTEIRA_KEY, registro);
  return registro;
}
async function carregarCarteira(){
  const store = await getCarteiraStore();
  const registro = await store.get(CARTEIRA_KEY, { type: 'json', consistency: 'strong' });
  return registro && Array.isArray(registro.rows) && registro.rows.length ? registro : null;
}
module.exports = { STORE_NAME, CARTEIRA_KEY, salvarCarteira, carregarCarteira };
