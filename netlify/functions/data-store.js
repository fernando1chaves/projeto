'use strict';

const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'torre-controle-dados';
const BASE_KEY = 'followup-base-atual';

function getDataStore() {
  return getStore(STORE_NAME, { consistency: 'strong' });
}

async function salvarBase(payload) {
  const store = getDataStore();

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
  const store = getDataStore();

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
