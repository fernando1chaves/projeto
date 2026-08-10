/* ==========================================================================
   TORRE DE CONTROLE LOGÍSTICA · Etapa 4 — auth-client.js
   --------------------------------------------------------------------------
   Camada de APRESENTAÇÃO da autenticação. As decisões de segurança reais
   (validar senha, emitir/validar sessão, autorizar upload) acontecem nas
   Netlify Functions (/api/*) — este arquivo apenas conversa com elas e
   ajusta a interface. Nenhuma senha, hash ou segredo vive aqui (Seção 51).

   O token de sessão fica num cookie HttpOnly emitido pelo servidor: o
   JavaScript da página NÃO consegue lê-lo (nem este arquivo) — por isso
   nada é gravado em localStorage/sessionStorage (Seção 10).
   ========================================================================== */
(function () {
  'use strict';

  var API = '/api';

  /* ── RBAC (Seções 20 a 23) — matriz de permissões da CAMADA VISUAL ─────
     Esconder/mostrar componentes usa esta matriz; a imposição real de cada
     operação sensível é repetida no servidor (upload-grant), porque o
     controle visual sozinho é contornável pelo DevTools (Seção 15). */
  var PERMISSOES = {
    ADMINISTRADOR: ['VER_DASHBOARD', 'UPLOAD_PLANILHA', 'AREA_ADMIN'],
    OPERACIONAL:   ['VER_DASHBOARD']
  };

  var sessao = null;          // { email, role, exp } — dados NÃO sensíveis
  var timerExpiracao = null;
  var modoDev = false;        // exclusivo para localhost/file: (Seção 51)
  var inicializado = false;

  function canUser(perm) {
    if (!sessao) return false;
    var lista = PERMISSOES[sessao.role] || [];
    return lista.indexOf(perm) >= 0;
  }

  /* ── utilidades de UI ─────────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function definirErroLogin(msg) {
    var el = $('authErro');
    if (el) { el.textContent = msg || ''; el.hidden = !msg; }
  }
  function ocupado(flag) {
    var btn = $('authEntrar'); var spin = $('authSpin');
    if (btn) btn.disabled = !!flag;
    if (spin) spin.hidden = !flag;
  }

  function aplicarPermissoesVisuais() {
    var els = document.querySelectorAll('[data-perm]');
    for (var i = 0; i < els.length; i++) {
      els[i].hidden = !canUser(els[i].getAttribute('data-perm'));
    }
    document.body.setAttribute('data-role', sessao ? sessao.role : '');
  }

  function mostrarLogin(mensagem) {
    sessao = null;
    if (timerExpiracao) { clearTimeout(timerExpiracao); timerExpiracao = null; }
    document.body.setAttribute('data-auth', 'pendente');
    var gate = $('authGate'); if (gate) gate.hidden = false;
    var app = $('appRoot'); if (app) app.hidden = true;
    var user = $('tcUser'); if (user) user.hidden = true;
    definirErroLogin(mensagem || '');
    var email = $('authEmail'); if (email) email.focus();
  }

  function aplicarSessao(dados) {
    sessao = { email: dados.email, role: dados.role, exp: dados.exp };
    document.body.setAttribute('data-auth', 'ok');
    var gate = $('authGate'); if (gate) gate.hidden = true;
    var app = $('appRoot'); if (app) app.hidden = false;

    var user = $('tcUser');
    if (user) {
      user.hidden = false;
      var em = $('tcUserEmail'); if (em) em.textContent = sessao.email;
      var pf = $('tcUserRole');
      if (pf) {
        pf.textContent = sessao.role === 'ADMINISTRADOR' ? 'ADMINISTRADOR' : 'OPERACIONAL';
        pf.className = 'tc-user-role ' + (sessao.role === 'ADMINISTRADOR' ? 'role-admin' : 'role-oper');
      }
    }
    aplicarPermissoesVisuais();

    /* Expiração da sessão (Seção 18): o servidor rejeita o token vencido em
       qualquer chamada; este timer apenas ANTECIPA a experiência, levando o
       usuário de volta ao login no instante do vencimento. */
    if (Number.isFinite(sessao.exp)) {
      var restante = sessao.exp - Date.now();
      if (restante <= 0) { encerrarPorExpiracao(); return; }
      timerExpiracao = setTimeout(encerrarPorExpiracao, Math.min(restante, 2147000000));
    }

    /* Libera a inicialização do dashboard — o script.js só monta a aplicação
       (inclusive a restauração da base salva) depois deste evento. */
    document.dispatchEvent(new CustomEvent('tc-auth-ok', { detail: { email: sessao.email, role: sessao.role } }));
  }

  function encerrarPorExpiracao() {
    fetch(API + '/logout', { method: 'POST', credentials: 'include' }).catch(function () {});
    /* reload garante estado limpo: dados fora do DOM e histórico sem painel */
    location.reload();
  }

  /* ── chamadas à camada confiável ──────────────────────────────────── */
  function api(caminho, opcoes) {
    opcoes = opcoes || {};
    opcoes.credentials = 'include';
    opcoes.headers = Object.assign({ 'Content-Type': 'application/json' }, opcoes.headers || {});
    return fetch(API + caminho, opcoes);
  }

  function entrar(email, senha) {
    ocupado(true); definirErroLogin('');
    api('/login', { method: 'POST', body: JSON.stringify({ email: email, senha: senha }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
      .then(function (res) {
        ocupado(false);
        if (res.ok) { aplicarSessao(res.j); return; }
        /* Mensagem sempre genérica para credencial inválida (Seção 11);
           demais códigos usam o texto controlado do servidor (Seção 40). */
        definirErroLogin(res.j && res.j.erro ? res.j.erro : 'E-mail ou senha inválidos.');
      })
      .catch(function () {
        ocupado(false);
        definirErroLogin('Não foi possível conectar ao serviço de autenticação. Verifique a conexão e tente novamente.');
      });
  }

  function sair() {
    api('/logout', { method: 'POST' }).catch(function () {}).then(function () { location.reload(); });
  }

  /* Autorização REAL do upload (Seções 14 a 16): o processamento da planilha
     só começa depois de o servidor confirmar sessão + perfil ADMINISTRADOR.
     Reexibir o botão pelo DevTools não concede esta resposta. */
  function solicitarGrantUpload(meta) {
    if (modoDev) {
      return Promise.resolve(sessao && sessao.role === 'ADMINISTRADOR'
        ? { ok: true }
        : { ok: false, erro: 'Você não possui permissão para executar esta operação.' });
    }
    return api('/upload-grant', { method: 'POST', body: JSON.stringify(meta || {}) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.grant === true, erro: j.erro }; }); })
      .catch(function () { return { ok: false, erro: 'Serviço de autorização indisponível. Tente novamente.' }; });
  }

  /* ── MODO DESENVOLVIMENTO (Seção 51 — nunca é a solução final) ───────
     Ativável APENAS em file:// ou localhost, quando as functions não estão
     publicadas (ex.: abrir o index.html direto do disco). No domínio de
     produção este caminho é inalcançável: a decisão usa location.protocol/
     hostname — bloquear as requisições no DevTools não muda o hostname. */
  function ambienteLocal() {
    return location.protocol === 'file:' ||
           location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  }
  function oferecerModoDev() {
    var box = $('authDev');
    if (!box) return;
    box.hidden = false;
    box.addEventListener('click', function (ev) {
      var alvo = ev.target.closest('[data-dev-role]');
      if (!alvo) return;
      modoDev = true;
      aplicarSessao({ email: 'dev@local', role: alvo.getAttribute('data-dev-role'), exp: Date.now() + 8 * 3600 * 1000 });
      var aviso = $('tcDevBadge'); if (aviso) aviso.hidden = false;
    });
  }

  /* ── inicialização ───────────────────────────────────────────────── */
  function iniciar() {
    if (inicializado) return; inicializado = true;
    mostrarLogin('');
    api('/session', { method: 'GET' })
      .then(function (r) {
        if (r.ok) return r.json().then(aplicarSessao);       // refresh mantém a sessão (Seção 12)
        mostrarLogin('');                                     // 401 → login normal, sem detalhes
      })
      .catch(function () {
        /* Rede indisponível: em produção exibe erro e mantém o bloqueio;
           em ambiente local oferece o modo de desenvolvimento rotulado. */
        if (ambienteLocal()) { mostrarLogin(''); oferecerModoDev(); }
        else mostrarLogin('Serviço de autenticação indisponível no momento. Recarregue a página para tentar novamente.');
      });

    var form = $('authForm');
    if (form) form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = ($('authEmail') && $('authEmail').value || '').trim();
      var senha = ($('authSenha') && $('authSenha').value || '');
      if (!email || !senha) { definirErroLogin('Informe e-mail e senha.'); return; }
      entrar(email, senha);
    });

    var olho = $('authOlho');
    if (olho) olho.addEventListener('click', function () {
      var campo = $('authSenha');
      var mostrando = campo.type === 'text';
      campo.type = mostrando ? 'password' : 'text';
      olho.setAttribute('aria-pressed', String(!mostrando));
      olho.textContent = mostrando ? '👁' : '🙈';
      campo.focus();
    });

    var btnSair = $('tcSair');
    if (btnSair) btnSair.addEventListener('click', sair);
  }

  document.addEventListener('DOMContentLoaded', iniciar);

  /* API pública mínima — usada pelo script.js (upload) e pelos testes.
     Não expõe token, senha nem qualquer material sensível. */
  window.TCAuth = {
    canUser: canUser,
    getSessao: function () { return sessao ? { email: sessao.email, role: sessao.role, exp: sessao.exp } : null; },
    solicitarGrantUpload: solicitarGrantUpload,
    sair: sair
  };
})();
