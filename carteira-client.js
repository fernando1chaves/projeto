/* A carteira tem API e cache próprios. RAW e /api/data-save nunca são usados. */
const CARTEIRA_CACHE_KEY = 'carteiraFornecedorCache_v1';
let carteiraAtiva = null;
let carteiraIndice = TCCarteira.criarIndice([]);
let carteiraCarregando = false;
let carteiraEnviando = false;
let carteiraRevisao = 0;

function plannerDoFornecedor(r){ return carteiraIndice.planner(r.fornecedor); }
function opcoesPlanner(){
  const values = [...new Set(RAW.map(plannerDoFornecedor))].sort();
  return values.map(v => ({ value: v, label: v === TCCarteira.SEM_PLANNER ? 'Sem PLANNER ILC' : v }));
}
function opcoesPlanta(){
  return [...new Set(RAW.map(r => r.planta).filter(Boolean))].sort().map(v => ({ value: v, label: v }));
}
function mostrarStatusCarteira(msg, ok){
  const el = document.getElementById('carteiraStatus');
  el.textContent = msg;
  el.className = 'tb-status ' + (ok ? 'ok' : 'err');
}
function aplicarCarteira(cache, atualizar){
  const rows = cache ? TCCarteira.validar(cache.rows) : [];
  carteiraIndice = TCCarteira.criarIndice(rows);
  carteiraAtiva = cache ? { ...cache, rows } : null;
  carteiraRevisao++;
  const button = document.getElementById('carteiraUploadBtn');
  button.title = cache ? 'Atualizar CARTEIRA FORNECEDOR · ' + cache.fileName + ' · ' + fmtDataHoraBR(cache.savedAt) : 'Upload da CARTEIRA FORNECEDOR (PLANNER ILC)';
  if(atualizar){
    populateGlobalMultiSelects();
    populateCobMultiSelects();
    globalFiltersChanged();
  }
}
function salvarCacheCarteira(cache){
  try { if(cache) localStorage.setItem(CARTEIRA_CACHE_KEY, JSON.stringify(cache)); else localStorage.removeItem(CARTEIRA_CACHE_KEY); }
  catch(e){ /* A carteira compartilhada continua válida sem contingência local. */ }
}
async function requisicaoCarteira(url, options){
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timeout); }
}
async function consultarCarteira(){
  const response = await requisicaoCarteira('/api/carteira-load', { credentials: 'same-origin', cache: 'no-store' });
  const data = await response.json();
  if(!response.ok || !data.ok) throw new Error(data.erro || 'Carteira indisponível.');
  return data.existe ? { rows: data.rows, savedAt: data.savedAt, fileName: data.fileName, updatedBy: data.updatedBy } : null;
}
async function carregarCarteiraInicial(){
  const revisao = carteiraRevisao;
  try{
    const cache = await consultarCarteira();
    if(carteiraEnviando || carteiraRevisao !== revisao) return;
    aplicarCarteira(cache, true);
    salvarCacheCarteira(cache);
  }catch(e){
    if(carteiraEnviando || carteiraRevisao !== revisao) return;
    try{
      const cache = JSON.parse(localStorage.getItem(CARTEIRA_CACHE_KEY) || 'null');
      if(cache){
        aplicarCarteira(cache, true);
        mostrarStatusCarteira('Carteira local de contingência carregada; a consulta compartilhada está indisponível.', false);
      }
    }catch(cacheError){ /* Cache inválido: coletas continuam disponíveis. */ }
  }
}
function setupCarteiraUpload(){
  const input = document.getElementById('carteiraInput');
  const button = document.getElementById('carteiraUploadBtn');
  button.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if(!file || carteiraEnviando) return;
    carteiraEnviando = true;
    button.disabled = true;
    try{
      if(!/\.(xlsx|xls)$/i.test(file.name) || !UPLOAD_MIMES_OK.has(file.type || '')) throw new Error('Envie uma planilha .xlsx ou .xls.');
      if(file.size > UPLOAD_MAX_BYTES) throw new Error('A carteira ultrapassa o limite de 20 MB.');
      if(!window.TCAuth) throw new Error('Serviço de autorização indisponível.');
      const grant = await window.TCAuth.solicitarGrantUpload({ arquivo: file.name, tamanho: file.size, tipo: 'CARTEIRA FORNECEDOR' });
      if(!grant.ok) throw new Error(grant.erro || 'Você não possui permissão para atualizar a carteira.');
      mostrarStatusCarteira('Processando CARTEIRA FORNECEDOR…', true);
      const workbook = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: 'array', cellDates: false });
      const sheets = workbook.SheetNames.slice().sort((a, b) => Number(/carteira|planner/i.test(b)) - Number(/carteira|planner/i.test(a)));
      let rows = null;
      for(const name of sheets){
        const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: '', raw: true });
        const hasHeaders = matrix.slice(0, 30).some(r => r.some(v => TCCarteira.normalizar(v).replace(/[_-]/g, ' ') === 'PLANNER ILC'));
        if(hasHeaders){ rows = TCCarteira.lerMatriz(matrix); break; }
      }
      if(!rows) throw new Error('Não foi encontrada uma aba com PLANNER ILC e fornecedor.');
      const response = await requisicaoCarteira('/api/carteira-save', { method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: file.name, rows }) });
      const result = await response.json();
      if(!response.ok || !result.ok) throw new Error(result.erro || 'Não foi possível salvar a carteira compartilhada.');
      const cache = { rows, fileName: result.fileName || file.name, savedAt: result.savedAt, updatedBy: result.updatedBy };
      aplicarCarteira(cache, true);
      salvarCacheCarteira(cache);
      const semPlanner = RAW.filter(r => plannerDoFornecedor(r) === TCCarteira.SEM_PLANNER).length;
      mostrarStatusCarteira('Carteira atualizada: ' + rows.length + ' vínculos e ' + new Set(rows.map(r => r.planner)).size +
        ' planners. ' + semPlanner + ' pedidos sem vínculo com PLANNER ILC. Disponível para todos os usuários.', true);
    }catch(e){
      mostrarStatusCarteira('Falha ao importar a carteira: ' + e.message + ' A carteira anterior foi mantida.', false);
    }finally{
      input.value = '';
      button.disabled = false;
      carteiraEnviando = false;
    }
  });
}
function iniciarSincronizacaoCarteira(){
  async function sincronizar(){
    if(carteiraCarregando || carteiraEnviando || document.hidden) return;
    carteiraCarregando = true;
    const revisao = carteiraRevisao;
    try{
      const cache = await consultarCarteira();
      if(carteiraEnviando || carteiraRevisao !== revisao) return;
      if((cache && cache.savedAt) !== (carteiraAtiva && carteiraAtiva.savedAt)){
        aplicarCarteira(cache, true);
        salvarCacheCarteira(cache);
      }
    }catch(e){ /* A última carteira válida e a base de coletas permanecem intactas. */ }
    finally { carteiraCarregando = false; }
  }
  setInterval(sincronizar, 60000);
  window.addEventListener('focus', sincronizar);
}
