/* Etapa 4 — POST /api/login. Autentica na camada confiável (Seções 8 e 51):
   o navegador envia e-mail e senha por HTTPS e recebe apenas o resultado e o
   cookie de sessão HttpOnly. Nenhuma senha ou hash retorna ao cliente. */
'use strict';
const lib = require('./_auth-lib');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return lib.json(405, { erro: 'Método não permitido.' });

  const ip = lib.ipDoEvento(event);
  if (!lib.rateLimitOk(ip)) {                                  // Seção 39
    lib.logSeguranca('LOGIN_RATE_LIMIT', { ip });
    return lib.json(429, { erro: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' });
  }

  let corpo;
  try { corpo = JSON.parse(event.body || '{}'); } catch (e) { corpo = {}; }
  const email = String(corpo.email || '').trim().toLowerCase();
  const senha = String(corpo.senha || '');

  const usuarios = lib.carregarUsuarios(process.env);
  if (!process.env.AUTH_SECRET || !usuarios.length) {
  lib.logSeguranca('LOGIN_CONFIG_AUSENTE', {
    authSecretPresente: Boolean(process.env.AUTH_SECRET),
    tcUsersPresente: Boolean(process.env.TC_USERS),
    tcUsersTamanho: String(process.env.TC_USERS || '').length,
    usuariosValidos: usuarios.length
  });

  return lib.json(500, {
    erro: 'Serviço de autenticação indisponível.'
  });
}
  

  const usuario = usuarios.find(u => u.email === email);
  const senhaOk = usuario ? lib.verificarSenha(senha, usuario.hash) : false;
  /* Mesmo sem usuário, executa uma verificação de custo equivalente para não
     revelar por tempo de resposta se o e-mail existe (Seção 11). */
  if (!usuario) lib.verificarSenha(senha, 'pbkdf2$210000$c2FsdGZha2Vmc2FsdA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

  if (!usuario || !senhaOk) {
    lib.registrarFalha(ip);
    lib.logSeguranca('LOGIN_INVALIDO', { ip });                 // sem e-mail no log de falha
    return lib.json(401, { erro: 'E-mail ou senha inválidos.' });   // mensagem genérica (Seção 11)
  }

  lib.limparFalhas(ip);
  const agora = Date.now();
  const exp = agora + lib.ttlMin(process.env) * 60 * 1000;      // expiração (Seção 18)
  const token = lib.assinarToken({ sub: usuario.email, email: usuario.email, role: usuario.role, iat: agora, exp }, process.env.AUTH_SECRET);

  lib.logSeguranca('LOGIN_OK', { email: usuario.email, role: usuario.role, ip });
  return lib.json(200, { email: usuario.email, role: usuario.role, exp }, lib.cookieSessao(token, Math.floor((exp - agora) / 1000)));
};
