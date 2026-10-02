/* Vínculo auxiliar entre fornecedor e PLANNER ILC. Não modifica pedidos. */
(function(root, factory){
  if(typeof module === 'object' && module.exports) module.exports = factory();
  else root.TCCarteira = factory();
})(typeof window === 'undefined' ? this : window, function(){
  'use strict';
  const SEM_PLANNER = '__SEM_PLANNER_ILC__';
  function texto(v){ return v == null ? '' : String(v).trim().replace(/\s+/g, ' '); }
  function normalizar(v){
    return texto(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
      .replace(/\s*([()])\s*/g, '$1');
  }
  function cabecalho(v){ return normalizar(v).replace(/[_-]/g, ' ').replace(/\s+/g, ' '); }
  function validar(rows){
    if(!Array.isArray(rows) || !rows.length || rows.length > 50000){
      throw new Error('A carteira deve conter entre 1 e 50.000 registros.');
    }
    const entries = new Map();
    const owners = new Map();
    rows.forEach((r, i) => {
      if(!r || typeof r !== 'object') throw new Error('Registro inválido na carteira.');
      const entry = { integrator: texto(r.integrator), fornecedor: texto(r.fornecedor), planner: normalizar(r.planner) };
      if(!(entry.integrator || entry.fornecedor) || !entry.planner){
        throw new Error('Fornecedor ou PLANNER ILC ausente no registro ' + (i + 1) + '.');
      }
      if(Object.values(entry).some(v => v.length > 300)) throw new Error('Texto acima de 300 caracteres na carteira.');
      const key = normalizar(entry.integrator || entry.fornecedor);
      if(owners.has(key) && owners.get(key) !== entry.planner){
        throw new Error('Mais de um PLANNER ILC para o fornecedor ' + (entry.integrator || entry.fornecedor) + '. Corrija a carteira.');
      }
      owners.set(key, entry.planner);
      entries.set(JSON.stringify([normalizar(entry.integrator), normalizar(entry.fornecedor), entry.planner]), entry);
    });
    return [...entries.values()];
  }
  function lerMatriz(matrix){
    const pos = matrix.findIndex((row, i) => i < 30 && row.some(v => cabecalho(v) === 'PLANNER ILC') &&
      row.some(v => ['NOME INTEGRATOR', 'FORNECEDOR'].includes(cabecalho(v))));
    if(pos < 0) throw new Error('Colunas obrigatórias: PLANNER ILC e NOME INTEGRATOR ou FORNECEDOR.');
    const headers = matrix[pos].map(cabecalho);
    const pi = headers.indexOf('PLANNER ILC'), ni = headers.indexOf('NOME INTEGRATOR'), fi = headers.indexOf('FORNECEDOR');
    const rows = matrix.slice(pos + 1).filter(r => r.some(v => texto(v))).map(r => ({
      integrator: ni < 0 ? '' : r[ni], fornecedor: fi < 0 ? '' : r[fi], planner: r[pi]
    }));
    return validar(rows);
  }
  function criarIndice(rows){
    const integrators = new Map(), aliases = new Map();
    rows.forEach(r => {
      if(r.integrator) integrators.set(normalizar(r.integrator), r.planner);
      const key = normalizar(r.fornecedor);
      if(key){
        if(!aliases.has(key)) aliases.set(key, new Set());
        aliases.get(key).add(r.planner);
      }
    });
    return {
      planner(fornecedor){
        const key = normalizar(fornecedor);
        if(integrators.has(key)) return integrators.get(key);
        const values = aliases.get(key);
        return values && values.size === 1 ? [...values][0] : SEM_PLANNER;
      }
    };
  }
  return { SEM_PLANNER, normalizar, validar, lerMatriz, criarIndice };
});
