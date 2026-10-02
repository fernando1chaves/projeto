'use strict';

const STORE_NAME = 'torre-controle-dados';
const BASE_KEY = 'followup-base-atual';

let _getStore = null;

async function getDataStore() {
  if (!_getStore) {
    const mod = await import('@netlify/blobs');
    _getStore = mod.getStore;
  }

  const siteID =
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID ||
    '';

  const token =
    process.env.NETLIFY_BLOBS_TOKEN ||
    process.env.NETLIFY_AUTH_TOKEN ||
    '';

  if (!siteID || !token) {
    throw new Error(
      'Configuração do Netlify Blobs ausente: NETLIFY_SITE_ID ou NETLIFY_BLOBS_TOKEN não definido.'
    );
  }

  return _getStore({
    name: STORE_NAME,
    consistency: 'strong',
    siteID,
    token
  });
}

async function salvarBase(payload) {
  const store = await getDataStore();

  const registro = {
    version: 1,
    savedAt: Date.now(),
    fileName: String(payload && payload.fileName || ''),
    updatedBy: String(payload && payload.updatedBy || ''),
    rows: Array.isArray(payload && payload.rows) ? payload.rows : []
  };

  await store.setJSON(BASE_KEY, registro);

  return registro;
}

async function carregarBase() {
  const store = await getDataStore();

  const registro = await store.get(BASE_KEY, {
    type: 'json',
    consistency: 'strong'
  });

  if (!registro || !Array.isArray(registro.rows) || !registro.rows.length) {
    return null;
  }

  return registro;
}

module.exports = {
  STORE_NAME,
  BASE_KEY,
  salvarBase,
  carregarBase
};