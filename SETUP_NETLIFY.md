# TORRE DE CONTROLE LOGÍSTICA — SETUP NETLIFY (Etapa 4)

Guia de publicação com a camada de autenticação ativa. **Sem estas variáveis de
ambiente o login não funciona** (a tela exibirá "Serviço de autenticação
indisponível" — proposital: o sistema nunca cai para um modo inseguro em
produção).

---

## 1. Estrutura publicada

```text
/                       index.html · script.js · style.css
                        auth-client.js · boot.js · boot-fallback.js
netlify.toml            headers de segurança + rota /api/*
netlify/functions/      _auth-lib.js · auth-login.js · auth-session.js
                        auth-logout.js · upload-grant.js
vendor/                 (opcional) cópias locais das bibliotecas
```

Deploy: arraste a pasta no painel do Netlify ou conecte o repositório Git.
Nenhum passo de build é necessário (`publish = "."`).

## 2. Variáveis de ambiente (Site settings → Environment variables)

Escopo recomendado: **Functions**. Criar exatamente estas três:

### `AUTH_SECRET`
Segredo que assina os tokens de sessão. Use um valor longo e aleatório —
**gere o seu próprio** (o exemplo abaixo serve para o primeiro deploy, mas o
ideal é substituí-lo por um valor que só você conheça):

```text
zl_Iy1g29VjQsLJUc7-seWFVUUWSVfc3swgPXsuyQ3_7W9CeM7l8Q2z5ac_LmnYt
```

Para gerar um novo: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

### `TC_USERS`
Cadastro de usuários (JSON em uma linha). Os hashes abaixo correspondem às
credenciais iniciais da especificação — **as senhas em si não aparecem em
lugar nenhum do código nem desta configuração**:

```json
[{"email":"fernando.chaves@ilclog.com.br","role":"ADMINISTRADOR","hash":"pbkdf2$210000$HkyrOArmztSkERUCmYptDA$F3WZ5qlL8mXGLZWEvaQ2x5xhRdLf5XAZJclo2cZYQ7E"},{"email":"operacional@ilclog.com.br","role":"OPERACIONAL","hash":"pbkdf2$210000$FEiv7OcOh0wcZwHdcayWOA$wjzkZ-Ev92_jAUOAbf4DbvUHWccornngIuqR-0DaZlk"}]
```

Credenciais iniciais correspondentes (troque-as após o primeiro acesso):
- `fernando.chaves@ilclog.com.br` / `chaves1234` → ADMINISTRADOR
- `operacional@ilclog.com.br` / `ilclog1234` → OPERACIONAL

### `SESSION_TTL_MIN` (opcional)
Validade da sessão em minutos. Padrão: `480` (8 horas).

## 3. Trocar senha / adicionar usuário

1. `node gerar-hash.js "NovaSenhaForte"` (local, na pasta do projeto);
2. copie a saída `pbkdf2$...` para o campo `hash` do usuário em `TC_USERS`;
3. salve a variável no painel — sem redeploy de código.

Novos perfis: incluir o nome em `ROLES_VALIDOS` (`_auth-lib.js`) e a lista de
permissões em `PERMISSOES` (`auth-client.js`) — a arquitetura RBAC já está
preparada para isso.

## 4. O que conferir após o deploy

- Acessar o site → tela de login aparece; o painel não é visível antes dela.
- Login ADMINISTRADOR → badge amarelo, botão UPLOAD e faixa ADMINISTRAÇÃO.
- Login OPERACIONAL → badge cinza, **sem** upload e **sem** faixa admin.
- DevTools → Application → Cookies: `tc_session` marcado HttpOnly/Secure.
- Logs de auditoria: painel Netlify → Functions → `upload-grant` / `auth-login`
  (linhas `[TC-SEG] ...` — nunca contêm senha ou token).

## 5. Limite arquitetural documentado (transparência)

A base de dados continua sendo processada e armazenada **no navegador**
(localStorage), como nas etapas anteriores — não existe banco compartilhado.
Consequências práticas:

- O upload do ADMINISTRADOR atualiza a base *daquele navegador*; outros
  usuários seguem vendo a base embutida ou o upload feito no navegador deles.
- Um usuário tecnicamente capaz de editar o próprio localStorage altera apenas
  **a própria visão local** — não há como afetar os dados de outra pessoa nem
  escalar privilégios (a autorização de upload e a sessão são validadas no
  servidor, fora do alcance do navegador).

Centralizar a base num backend (para que o upload do admin alimente todos os
usuários) é uma evolução natural de uma próxima etapa, se desejada.
