/* ==========================================================================
   TORRE DE CONTROLE LOGÍSTICA · Etapa 4 — _auth-lib.js
   --------------------------------------------------------------------------
   Biblioteca compartilhada pelas Netlify Functions de autenticação.
   Executa EXCLUSIVAMENTE no servidor (camada confiável): nada deste arquivo
   é enviado ao navegador. Usa apenas o módulo nativo `crypto` do Node —
   nenhuma dependência externa, nenhum algoritmo criptográfico próprio
   (PBKDF2 e HMAC-SHA256 são primitivas consolidadas da plataforma).

   Variáveis de ambiente exigidas (configuradas no painel do Netlify —
   Seção 27 da especificação; nunca no código publicado):
     AUTH_SECRET      segredo de assinatura dos tokens de sessão
     TC_USERS         JSON: [{"email":"...","role":"...","hash":"pbkdf2$it$salt$hash"}]
     SESSION_TTL_MIN  (opcional) validade da sessão em minutos — padrão 480 (8h)
   ========================================================================== */
'use strict';
const crypto = require('crypto');

const COOKIE_NAME = 'tc_session';
const ROLES_VALIDOS = new Set(['ADMINISTRADOR', 'OPERACIONAL']);

/* ── Usuários (armazenados fora do código — Seções 7 e 9) ─────────────── */
function carregarUsuarios(env) {
  try {
    const lista = JSON.parse(env.TC_USERS || '[]');
    return lista.filter(u => u && u.email && u.hash && ROLES_VALIDOS.has(u.role))
                .map(u => ({ email: String(u.email).trim().toLowerCase(), role: u.role, hash: u.hash }));
  } catch (e) { return []; }
}

/* ── Verificação de senha: PBKDF2-SHA256 + salt por usuário (Seção 9) ─── */
function verificarSenha(senha, registro) {
  const partes = String(registro || '').split('$');
  if (partes.length !== 4 || partes[0] !== 'pbkdf2') return false;
  const iteracoes = parseInt(partes[1], 10);
  if (!Number.isInteger(iteracoes) || iteracoes < 100000) return false;
  const salt = partes[2];
  const esperado = Buffer.from(partes[3], 'base64url');
  const calculado = crypto.pbkdf2Sync(String(senha), salt, iteracoes, esperado.length, 'sha256');
  /* comparação em tempo constante — evita timing attack */
  return esperado.length === calculado.length && crypto.timingSafeEqual(esperado, calculado);
}

function gerarHash(senha, iteracoes) {
  const it = iteracoes || 210000;
  const salt = crypto.randomBytes(16).toString('base64url');
  const hash = crypto.pbkdf2Sync(String(senha), salt, it, 32, 'sha256').toString('base64url');
  return 'pbkdf2$' + it + '$' + salt + '$' + hash;
}

/* ── Token de sessão: payload.assinatura (HMAC-SHA256, base64url) ───────
   O navegador recebe o token apenas dentro de um cookie HttpOnly — o
   JavaScript da página não consegue lê-lo nem alterá-lo. O conteúdo é
   legível (não é segredo: e-mail/perfil/validade), mas QUALQUER alteração
   — inclusive OPERACIONAL → ADMINISTRADOR (Seção 16) — invalida a
   assinatura, e a verificação acontece aqui, fora do navegador. */
function assinarToken(payload, secret) {
  const corpo = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const ass = crypto.createHmac('sha256', secret).update(corpo).digest('base64url');
  return corpo + '.' + ass;
}

function verificarToken(token, secret) {
  if (!token || !secret) return null;
  const partes = String(token).split('.');
  if (partes.length !== 2) return null;
  const ass = crypto.createHmac('sha256', secret).update(partes[0]).digest('base64url');
  const a = Buffer.from(ass), b = Buffer.from(partes[1]);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try { payload = JSON.parse(Buffer.from(partes[0], 'base64url').toString('utf8')); }
  catch (e) { return null; }
  if (!payload || !payload.email || !ROLES_VALIDOS.has(payload.role)) return null;
  if (!Number.isFinite(payload.exp) || Date.now() >= payload.exp) return null;  // expiração (Seção 18)
  return payload;
}

/* ── Cookie HttpOnly + Secure + SameSite=Strict ─────────────────────────
   HttpOnly: inacessível ao JS da página (não vaza por XSS).
   Secure: só trafega por HTTPS (Seção 29).
   SameSite=Strict: não é enviado em requisições iniciadas por outros
   sites — proteção estrutural contra CSRF nas operações administrativas. */
function cookieSessao(token, maxAgeSeg) {
  return COOKIE_NAME + '=' + token + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + maxAgeSeg;
}
function cookieLimpar() {
  return COOKIE_NAME + '=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}
function lerCookie(headers) {
  const bruto = (headers && (headers.cookie || headers.Cookie)) || '';
  const m = bruto.split(/;\s*/).find(c => c.startsWith(COOKIE_NAME + '='));
  return m ? m.slice(COOKIE_NAME.length + 1) : null;
}

/* ── Sessão a partir do evento (usada por todas as rotas protegidas) ──── */
function sessaoDoEvento(event, env) {
  return verificarToken(lerCookie(event.headers || {}), env.AUTH_SECRET);
}

function ttlMin(env) {
  const v = parseInt(env.SESSION_TTL_MIN, 10);
  return Number.isInteger(v) && v >= 5 ? v : 480;   // padrão 8h
}

/* ── Rate limit de login (Seção 39) ─────────────────────────────────────
   Melhor esforço por instância da function (memória volátil): 10 tentativas
   falhas por IP em janela de 10 minutos. Reduz brute force automatizado sem
   depender do frontend; para proteção adicional em produção, os controles
   de borda do próprio Netlify complementam (documentado no SETUP). */
const _tentativas = new Map();
const RL_JANELA_MS = 10 * 60 * 1000;
const RL_MAX = 10;
function rateLimitOk(ip) {
  const agora = Date.now();
  const reg = _tentativas.get(ip);
  if (!reg || agora - reg.inicio > RL_JANELA_MS) { _tentativas.set(ip, { inicio: agora, n: 0 }); return true; }
  return reg.n < RL_MAX;
}
function registrarFalha(ip) {
  const reg = _tentativas.get(ip) || { inicio: Date.now(), n: 0 };
  reg.n++; _tentativas.set(ip, reg);
}
function limparFalhas(ip) { _tentativas.delete(ip); }
function ipDoEvento(event) {
  const h = event.headers || {};
  return h['x-nf-client-connection-ip'] || (h['x-forwarded-for'] || '').split(',')[0].trim() || 'desconhecido';
}

/* ── Respostas padronizadas (Seção 40 — sem detalhes internos) ─────────── */
function json(status, corpo, cookies) {
  const r = { statusCode: status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify(corpo) };
  if (cookies) r.multiValueHeaders = { 'Set-Cookie': [cookies] };
  return r;
}

/* ── Log de segurança (Seção 38) — nunca senha, hash ou token completo ── */
function logSeguranca(evento, dados) {
  console.log('[TC-SEG] ' + new Date().toISOString() + ' ' + evento + ' ' + JSON.stringify(dados || {}));
}

module.exports = {
  COOKIE_NAME, carregarUsuarios, verificarSenha, gerarHash,
  assinarToken, verificarToken, cookieSessao, cookieLimpar, lerCookie,
  sessaoDoEvento, ttlMin, rateLimitOk, registrarFalha, limparFalhas, ipDoEvento,
  json, logSeguranca
};
