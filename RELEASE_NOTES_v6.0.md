# TORRE DE CONTROLE LOGÍSTICA — v6.0 (Etapa 4)
## Acesso, Autenticação, Perfis e Segurança

Data: 09/08/2026 · Base embutida: 435 pedidos (byte-idêntica à v5.2 — md5 da
linha 30 conferido: `037b47cd20bdc65fd0f21dcbd4027101`)

---

## 1. O que mudou

### Autenticação em camada confiável (Seções 7 a 12, 51)
- **Netlify Functions** (`netlify/functions/`): `auth-login`, `auth-session`,
  `auth-logout`, `upload-grant` + biblioteca `_auth-lib.js`. Nenhuma senha,
  hash ou segredo existe no HTML/JS publicado — as credenciais vivem nas
  variáveis de ambiente do Netlify como hashes **PBKDF2-SHA256 (210.000
  iterações, salt por usuário)**, verificadas exclusivamente no servidor com
  comparação em tempo constante.
- **Sessão**: token `payload.assinatura` (HMAC-SHA256 com `AUTH_SECRET`)
  entregue em cookie `tc_session` **HttpOnly + Secure + SameSite=Strict** —
  o JavaScript da página não consegue lê-lo nem alterá-lo. Alterar o perfil
  no payload (OPERACIONAL → ADMINISTRADOR) invalida a assinatura (Seção 16).
- **Expiração** configurável (`SESSION_TTL_MIN`, padrão 8h) validada no
  servidor a cada chamada; o cliente apenas antecipa a volta ao login.
- **Login inválido**: mensagem única "E-mail ou senha inválidos." com custo
  de resposta equivalente para e-mail inexistente e senha errada (Seção 11).
- **Rate limit** de login: 10 tentativas falhas/IP em 10 min → 429 (Seção 39).

### RBAC — perfis e permissões (Seções 3 a 6, 13)
- Matriz central `PERMISSOES` em `auth-client.js` + `canUser(permissão)`;
  componentes marcados com `data-perm` no HTML. Nenhum `if (email === ...)`
  espalhado; novos perfis = 1 entrada na matriz + 1 nome em `ROLES_VALIDOS`.
- ADMINISTRADOR: tudo. OPERACIONAL: consulta completa, filtros, KPIs,
  gráficos, tabelas, **Download Excel e Relatório de Cobranças preservados
  integralmente** (Seções 34/35) — sem Upload, sem área administrativa.

### Proteção real do upload (Seções 14 a 16)
- Antes de ler um byte da planilha, o cliente pede `POST /api/upload-grant`;
  o servidor valida sessão → identidade → perfil. OPERACIONAL recebe **403**
  com "Você não possui permissão para executar esta operação." — reexibir o
  botão pelo DevTools, editar o DOM ou chamar a operação diretamente não
  produz a concessão, porque o segredo de assinatura nunca sai do servidor.
- Validações adicionadas: tipo MIME (além da extensão) e limite de 20 MB;
  a validação estrutural de colunas obrigatórias e a regra "a base só é
  substituída após transformação bem-sucedida" foram preservadas (Seção 24).

### Tela de login (Seção 10)
- Overlay executivo no padrão visual do painel: e-mail, senha com
  mostrar/ocultar, indicador de carregamento, mensagem de erro, responsivo
  (validado em 6 larguras, 360→1920). Antes do login o dashboard **não é
  montado**: a inicialização completa (inclusive a restauração da base salva)
  só ocorre após o evento `tc-auth-ok`.
- Modo desenvolvimento claramente rotulado, disponível **apenas** em
  `file://`/localhost (decisão por hostname — inalcançável no domínio
  publicado), para abrir o painel localmente sem as functions.

### Identificação e logout (Seções 19/20)
- Topbar: e-mail + badge de perfil (ADMINISTRADOR amarelo ILC, OPERACIONAL
  cinza) + botão SAIR. Logout invalida o cookie no servidor (Max-Age=0) e
  recarrega a página — voltar pelo histórico não reabre o painel.

### Área administrativa (Seções 21/22/37)
- Faixa "🛡 ADMINISTRAÇÃO" exclusiva do ADMINISTRADOR: base ativa, quantidade
  de pedidos, **última atualização (data/hora) e por quem** (e-mail da sessão,
  gravado no cache do upload). Auditoria oficial nos logs da function
  `upload-grant` (`[TC-SEG] UPLOAD_AUTORIZADO {email, arquivo, tamanho, ip}`)
  — nunca senha nem token (Seções 36/38).

### Proteção XSS — Alteração 26 (Seções 25/26/47)
- `esc()` aplicado a TODOS os valores da planilha inseridos via innerHTML:
  lista de aglutinadores, tabela de pedidos vinculados (aglutinador,
  fornecedor, município, transportadora, datas por defesa em profundidade),
  colunas restantes do Relatório de Cobranças e a mensagem de erro do upload
  (que pode conter cabeçalhos lidos do próprio arquivo).
- SheetJS lê apenas células (macros/fórmulas não são executadas).

### Headers de segurança e CSP (Seções 28 a 31)
- Todos os `<script>` embutidos do index.html foram extraídos para `boot.js`
  (tema + fallbacks de CDN, lógica idêntica) e `boot-fallback.js` (2ª etapa
  do fallback do SheetJS). Resultado: **CSP sem `unsafe-inline` para
  scripts** — script injetado por XSS não executa.
- `netlify.toml`: CSP completa (cdnjs/jsdelivr para scripts; tiles OSM;
  OSRM em connect-src; `frame-ancestors 'none'`), `X-Content-Type-Options:
  nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`,
  `Cache-Control: no-store` em `/api/*`, redirect `/api/* → functions`.
  `style-src` mantém `'unsafe-inline'` porque Leaflet/Chart.js aplicam
  atributos style dinâmicos (a Seção 30 veda quebrar bibliotecas atuais).

### Correção estrutural descoberta em teste
- Regra `[hidden]{display:none !important}` para os componentes da Etapa 4:
  sem ela, o `display:flex` de autor vencia a regra da folha do navegador e o
  overlay de login permanecia renderizado (invisível, mas capturando cliques)
  sobre o painel. Detectada pela suíte E2E (clique no SAIR não chegava ao
  botão) e corrigida na fonte.

## 2. O que NÃO mudou (Seção 43)
Nenhuma regra de negócio, cálculo, KPI, gráfico, tabela, filtro, exportação,
regra de JANELA, MONITORAMENTO DE COLETAS ou PERFORMANCE TRANSPORTADORAS.
Prova: as três suítes da Etapa 3 passam **sem alteração de nenhuma
asserção** contra a v6.0 (202/202). Base embutida byte-idêntica.

## 3. Testes — 291 asserções, 0 falhas
| Suíte | Escopo | Resultado |
|---|---|---|
| A — Functions (Node) | PBKDF2, tokens, adulteração de perfil, login 1-4, sessão 16-18, grant 7-10, logout, rate limit, config ausente | 27 ✔ |
| B — Cliente (JSDOM) | Gate, fluxos admin/oper, upload bloqueado com botão reexibido, mensagens, XSS com payloads reais, expiração | 29 ✔ |
| C — E2E (Chromium) | Fluxos completos das Seções 44/45, testes 5-15/17-19, DevTools, histórico pós-logout, responsividade 6 larguras | 33 ✔ |
| Regressão Etapa 3 | Regras/NF (83) + layout/responsividade (83) + upload/rota (36) | 202 ✔ |

Cobertura da Seção 46 (25 testes funcionais): 1-19 automatizados; 20-25
(upload de arquivo válido/inválido/estrutura/malformado/falha/atualização)
cobertos pela suíte 3 da Etapa 3, que segue verde na v6.0.

## 4. Publicação
Seguir `SETUP_NETLIFY.md`: criar `AUTH_SECRET`, `TC_USERS` (hashes das
credenciais iniciais já prontos no guia) e opcionalmente `SESSION_TTL_MIN`.
Sem essas variáveis o sistema permanece bloqueado no login — nunca cai em
modo inseguro em produção.

## 5. Limite arquitetural documentado
A base continua client-side (localStorage): o upload do ADMINISTRADOR
atualiza a base daquele navegador; adulteração local afeta somente a própria
visão (sessão e autorização são validadas no servidor). Centralizar a base
num backend é evolução natural de próxima etapa.

## 6. Decisões pendentes (herdadas + novas)
1. Fonte oficial de "Tipo de Pedido": `TIPO`/modal (atual) × `TIPO_ENTRADA`.
2. Substituir a base embutida pelo snapshot de 11/07 (NFs reais; zero
   sobreposição de pedidos entre as bases).
3. Pedido 373539/373767 (⚠ divergência col. 39×40) — manter aviso atual?
4. Trocar as senhas iniciais após o primeiro acesso (recomendado) e definir
   se `SESSION_TTL_MIN` de 480 min atende ao turno da operação.
