console.log('followup-dashboard script.js v6.0 (Etapa 4 — autenticacao com sessao validada em camada confiavel (Netlify Functions), RBAC com perfis ADMINISTRADOR/OPERACIONAL, upload autorizado no servidor, protecao XSS nos dados da planilha e inicializacao condicionada ao login) carregado');
/* ============================================================================
   FOLLOW-UP DE COLETAS POR AGLUTINADOR — script.js
   ----------------------------------------------------------------------------
   Estrutura deste arquivo:
     01. Base de dados embutida (RAW) — substituível via "Upload planilha"
     02. Coordenadas de municípios (MUNI_COORDS)
     03. Constantes, utilitários de data/hora e REGRA CENTRAL de classificação
     04. Lista lateral de aglutinadores
     05. Utilitários de formatação
     06. Filtros rápidos e pipeline de filtragem (filteredData)
     07. KPIs e filtro de transportadora
     08. Busca de aglutinador (autocomplete)
     09. Busca por número do pedido (toolbar)
     10. Tema claro/escuro (persistido em localStorage)
     11. Upload da planilha followup_ped_ge (SheetJS)
     12. Exportação para Excel (respeita todos os filtros ativos)
     13. Tab 1 — Árvore de decomposição, tabela de detalhe e mapa
     14. Tab 2 — Cobranças Status (filtros, KPIs, gráficos, ranking, tabela, relatório)
     15. Orquestração (refreshAll) e bootstrap
   ----------------------------------------------------------------------------
   Dependências (carregadas no index.html): Chart.js 4, Leaflet 1.9, SheetJS.
   ========================================================================== */


/* ==========================================================================
   01. BASE DE DADOS EMBUTIDA (RAW)
   ========================================================================== */

let RAW = [{"pedido": 375009, "aglutinador": "FTL-01;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SCHULZ (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "NW", "transportador": "MIRASSOL (TUBARAO)", "modal": "FTL", "janela": "13/07 22:00", "janela_iso": "2026-07-13T22:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": 12.07, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "24-50804-PV", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -26.263, "lng": -48.8753}, {"pedido": 375008, "aglutinador": "FTL-02;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SCHULZ (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "BZ", "transportador": "MIRASSOL (TUBARAO)", "modal": "FTL", "janela": "14/07 22:00", "janela_iso": "2026-07-14T22:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374797, "aglutinador": "FTL-05;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "CCS (LIMEIRA)", "municipio": "LIMEIRA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374967, "aglutinador": "FTL-05;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "CCS (LIMEIRA)", "municipio": "LIMEIRA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 10:00", "janela_iso": "2026-07-14T10:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374793, "aglutinador": "FTL-06;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "IOCHPE MAX (CRUZEIRO)", "municipio": "CRUZEIRO/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": 0.0, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-308969-PV", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.5902, "lng": -44.9572}, {"pedido": 374782, "aglutinador": "FTL-071;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "BERCOSUL (CAMPO L. PAULISTA)", "municipio": "CAMPO LIMPO PAULISTA/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "13/07 13:30", "janela_iso": "2026-07-13T13:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:04", "chegada_iso": "2026-07-13T13:04:26", "saida_origem": "13/07 15:40", "saida_iso": "2026-07-13T15:40:52", "atraso_chegada_min": -26, "permanencia_min": 156, "atraso_saida_min": 131, "status": "Iniciado", "tempo_h": 8.07, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-308956-PV", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.9628, "lng": -47.1204}, {"pedido": 374795, "aglutinador": "FTL-074;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "FALLGATTER (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "FTL", "janela": "13/07 21:00", "janela_iso": "2026-07-13T21:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374801, "aglutinador": "FTL-07;SEG;13072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "ZF AUTOMOTIVE (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "13/07 16:30", "janela_iso": "2026-07-13T16:30:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": 0.0, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-308972-PV", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.0086, "lng": -47.1203}, {"pedido": 374802, "aglutinador": "FTL-07;SEG;13072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "SCHAEFFLER BRASIL (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "13/07 15:30", "janela_iso": "2026-07-13T15:30:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": 0.0, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-308966-PV", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.0086, "lng": -47.1203}, {"pedido": 375016, "aglutinador": "FTL-100;SEG;13072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "RODAROS (VACARIA)", "municipio": "VACARIA/RS", "planta": "CQ", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "FTL", "janela": "13/07 23:00", "janela_iso": "2026-07-13T23:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 5.0, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "VAC-002555", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.288, "lng": -51.9629}, {"pedido": 374803, "aglutinador": "FTL-12;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "DONALDSON BRASIL ( ITATIBA )", "municipio": "ITATIBA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 12:54", "chegada_iso": "2026-07-13T12:54:48", "saida_origem": "13/07 13:50", "saida_iso": "2026-07-13T13:50:58", "atraso_chegada_min": -65, "permanencia_min": 56, "atraso_saida_min": -9, "status": "Iniciado", "tempo_h": 7.87, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "38-75964-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.8578, "lng": -47.1812}, {"pedido": 374968, "aglutinador": "FTL-12;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "DONALDSON BRASIL ( ITATIBA )", "municipio": "ITATIBA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375005, "aglutinador": "FTL-17;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "HUBNER FUNDICAO (PONTA GROSSA)", "municipio": "PONTA GROSSA/PR", "planta": "BM", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "FTL", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:20", "chegada_iso": "2026-07-13T11:20:22", "saida_origem": "13/07 17:20", "saida_iso": "2026-07-13T17:20:22", "atraso_chegada_min": -280, "permanencia_min": 360, "atraso_saida_min": 80, "status": "Iniciado", "tempo_h": 3.4, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "30-5787-5", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.5858, "lng": -49.1744}, {"pedido": 374859, "aglutinador": "FTL-19;SEG;13072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "IOCHPE MAX (CRUZEIRO)", "municipio": "CRUZEIRO/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 12:43", "chegada_iso": "2026-07-13T12:43:25", "saida_origem": "13/07 20:08", "saida_iso": "2026-07-13T20:08:37", "atraso_chegada_min": -17, "permanencia_min": 445, "atraso_saida_min": 429, "status": "Finalizado", "tempo_h": 67.12, "ans": "Fora do ANS", "qtde_nf": 5, "tem_nf": true, "ge": "38-75937-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1010657, "lng": -46.969326}, {"pedido": 374962, "aglutinador": "FTL-21;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ITM LANDRONI (ATIBAIA)", "municipio": "ATIBAIA/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375244, "aglutinador": "FTL-24;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PARKER (SJ CAMPOS)", "municipio": "SAO JOSE DOS CAMPOS/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374832, "aglutinador": "FTL-25;TER;14072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "PEDERTRACTOR (PEDERNEIRAS)", "municipio": "PEDERNEIRAS/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375001, "aglutinador": "FTL-26;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "RESIPLASTIC (MONTENEGRO)", "municipio": "MONTENEGRO/RS", "planta": "CQ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "FTL", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:10", "chegada_iso": "2026-07-13T15:10:36", "saida_origem": "13/07 15:46", "saida_iso": "2026-07-13T15:46:32", "atraso_chegada_min": 311, "permanencia_min": 36, "atraso_saida_min": 347, "status": "Iniciado", "tempo_h": 4.53, "ans": "Fora do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "35-3267-5", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.3997, "lng": -52.6875}, {"pedido": 375041, "aglutinador": "FTL-27;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ROTOPLASTYC (CARAZINHO)", "municipio": "CARAZINHO/RS", "planta": "CQ", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:47", "chegada_iso": "2026-07-13T14:47:01", "saida_origem": "13/07 14:56", "saida_iso": "2026-07-13T14:56:00", "atraso_chegada_min": 887, "permanencia_min": 9, "atraso_saida_min": 896, "status": "Finalizado", "tempo_h": 71.88, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "CRZ-030756", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.282058, "lng": -52.76515}, {"pedido": 375006, "aglutinador": "FTL-34;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SCHULZ (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "BM", "transportador": "JSL (BARRA VELHA)", "modal": "FTL", "janela": "13/07 19:00", "janela_iso": "2026-07-13T19:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375011, "aglutinador": "FTL-34;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SCHULZ (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "BM", "transportador": "JSL (BARRA VELHA)", "modal": "FTL", "janela": "14/07 19:00", "janela_iso": "2026-07-14T19:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374939, "aglutinador": "FTL-36;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SEARS (SAO ROQUE)", "municipio": "SAO ROQUE/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 08:00", "janela_iso": "2026-07-14T08:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303563", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374927, "aglutinador": "FTL-38;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ETHOS IND (BOITUVA)", "municipio": "BOITUVA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 22:00", "janela_iso": "2026-07-13T22:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374794, "aglutinador": "FTL-39;SEG;13072026", "veiculo_aglutinado": "RODOTREM SIDER", "fornecedor": "FALLGATTER (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "BZ", "transportador": "JSL (TRIUNFO)", "modal": "FTL", "janela": "13/07 20:00", "janela_iso": "2026-07-13T20:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374953, "aglutinador": "FTL-39;TER;14072026", "veiculo_aglutinado": "RODOTREM SIDER", "fornecedor": "FALLGATTER (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "BZ", "transportador": "TW (MONTENEGRO-RS)", "modal": "FTL", "janela": "14/07 20:00", "janela_iso": "2026-07-14T20:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.88, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "POA-607021", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.99889, "lng": -51.06669}, {"pedido": 374868, "aglutinador": "FTL-40;TER;14072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "IOCHPE MAX (CRUZEIRO)", "municipio": "CRUZEIRO/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374787, "aglutinador": "FTL-41;SEG;13072026", "veiculo_aglutinado": "RODOTREM LIGHT", "fornecedor": "QUICKE (GUARANESIA)", "municipio": "GUARANESIA/MG", "planta": "BZ", "transportador": "JSL (BETIM)", "modal": "FTL", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374957, "aglutinador": "FTL-41;TER;14072026", "veiculo_aglutinado": "RODOTREM LIGHT", "fornecedor": "QUICKE (GUARANESIA)", "municipio": "GUARANESIA/MG", "planta": "BZ", "transportador": "JSL (BETIM)", "modal": "FTL", "janela": "14/07 15:00", "janela_iso": "2026-07-14T15:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374777, "aglutinador": "FTL-42;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "RESIPLASTIC (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:54", "chegada_iso": "2026-07-13T13:54:00", "saida_origem": "13/07 16:20", "saida_iso": "2026-07-13T16:20:00", "atraso_chegada_min": -6, "permanencia_min": 146, "atraso_saida_min": 140, "status": "Iniciado", "tempo_h": 3.9, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26302615", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.14, "lng": -47.2558333}, {"pedido": 374788, "aglutinador": "FTL-42;SEG;13072026-1", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "RESIPLASTIC (MAUA)", "municipio": "MAUA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:50", "chegada_iso": "2026-07-13T14:50:00", "saida_origem": "13/07 15:50", "saida_iso": "2026-07-13T15:50:00", "atraso_chegada_min": 290, "permanencia_min": 60, "atraso_saida_min": 350, "status": "Iniciado", "tempo_h": 6.27, "ans": "Fora do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "JSL-VG26302072", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.13916, "lng": -47.25638}, {"pedido": 374790, "aglutinador": "FTL-43;SEG;13072026", "veiculo_aglutinado": "CARRETA ABERTA", "fornecedor": "ARCELORMITTAL (HORTOLANDIA)", "municipio": "HORTOLANDIA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 08:00", "janela_iso": "2026-07-13T08:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374960, "aglutinador": "FTL-43;TER;14072026", "veiculo_aglutinado": "CARRETA ABERTA", "fornecedor": "ARCELORMITTAL (HORTOLANDIA)", "municipio": "HORTOLANDIA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 08:00", "janela_iso": "2026-07-14T08:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374800, "aglutinador": "FTL-44;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PEDERTRACTOR (PEDERNEIRAS)", "municipio": "PEDERNEIRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:50", "chegada_iso": "2026-07-13T15:50:00", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 170, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 7.52, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26302694", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.5801229, "lng": -47.3675076}, {"pedido": 374817, "aglutinador": "FTL-44;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PEDERTRACTOR (PEDERNEIRAS)", "municipio": "PEDERNEIRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375007, "aglutinador": "FTL-45;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SIDERAL (CONCEICAO DO PARA)", "municipio": "CONCEICAO DO PARA/MG", "planta": "BZ", "transportador": "JSL (BETIM)", "modal": "FTL", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374966, "aglutinador": "FTL-46;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "HIDROVER (FLORES DA CUNHA)", "municipio": "FLORES DA CUNHA/RS", "planta": "BZ", "transportador": "JSL (TRIUNFO)", "modal": "FTL", "janela": "14/07 14:30", "janela_iso": "2026-07-14T14:30:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374963, "aglutinador": "FTL-47;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "MAGIUS (SJ PINHAIS)", "municipio": "SAO JOSE DOS PINHAIS/PR", "planta": "BZ", "transportador": "JSL (CURITIBA)", "modal": "FTL", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374783, "aglutinador": "FTL-49;SEG;13072026", "veiculo_aglutinado": "CARRETA VANDERLEIA", "fornecedor": "FUNDIMISA (SANTO ANGELO)", "municipio": "SANTO ANGELO/RS", "planta": "BM", "transportador": "JSL (TRIUNFO)", "modal": "FTL", "janela": "13/07 08:00", "janela_iso": "2026-07-13T08:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303265", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375002, "aglutinador": "FTL-51;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "JOINTECH (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "BM", "transportador": "JSL (BARRA VELHA)", "modal": "FTL", "janela": "13/07 11:00", "janela_iso": "2026-07-13T11:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375015, "aglutinador": "FTL-51;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "JOINTECH (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "BM", "transportador": "JSL (BARRA VELHA)", "modal": "FTL", "janela": "14/07 21:00", "janela_iso": "2026-07-14T21:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374774, "aglutinador": "FTL-55;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PAINCO (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 22:00", "janela_iso": "2026-07-13T22:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374951, "aglutinador": "FTL-55;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PAINCO (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 22:00", "janela_iso": "2026-07-14T22:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374784, "aglutinador": "FTL-59;SEG;13072026", "veiculo_aglutinado": "CARRETA VANDERLEIA", "fornecedor": "METAL ONE (CAPIVARI)", "municipio": "CAPIVARI/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 20:00", "janela_iso": "2026-07-13T20:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 0.0, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303537", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.55049, "lng": -46.63329}, {"pedido": 374778, "aglutinador": "FTL-61;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ZF AUTOMOTIVE (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": 5.7, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-308957-PV", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.111666, "lng": -47.276666}, {"pedido": 374798, "aglutinador": "FTL-65;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ALPINO (JUNDIAI)", "municipio": "JUNDIAI/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "13/07 19:00", "janela_iso": "2026-07-13T19:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": 0.95, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-308970-PV", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.168611, "lng": -46.941944}, {"pedido": 374781, "aglutinador": "FTL-74;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "METHAL COMPANY (CURITIBA)", "municipio": "FAZENDA RIO GRANDE/PR", "planta": "BZ", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "FTL", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": 110.12, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "30-65253-PV", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.544073, "lng": -49.147723}, {"pedido": 374792, "aglutinador": "FTL-80;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "BRUNING (PANAMBI)", "municipio": "PANAMBI/RS", "planta": "BZ", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "FTL", "janela": "13/07 21:00", "janela_iso": "2026-07-13T21:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "PBI-014168", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375017, "aglutinador": "FTL-81;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "CENTRO DO BRASIL (HORIZONTINA)", "municipio": "HORIZONTINA/RS", "planta": "CQ", "transportador": "TW (HORIZONTINA)", "modal": "FTL", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:14", "chegada_iso": "2026-07-13T14:14:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 254, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 8, "tem_nf": true, "ge": "HOR-023524", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375270, "aglutinador": "FTL-81;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "CENTRO DO BRASIL (HORIZONTINA)", "municipio": "HORIZONTINA/RS", "planta": "CQ", "transportador": "TW (HORIZONTINA)", "modal": "FTL", "janela": "14/07 10:00", "janela_iso": "2026-07-14T10:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374789, "aglutinador": "FTL-83;SEG;13072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "CHAPEMEC (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "CQ", "transportador": "TW (HORIZONTINA)", "modal": "FTL", "janela": "13/07 15:45", "janela_iso": "2026-07-13T15:45:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:01", "chegada_iso": "2026-07-13T14:01:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -104, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 8.33, "ans": "Fora do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "STA-043830", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.05379, "lng": -52.8718}, {"pedido": 374791, "aglutinador": "FTL-84;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "KOHLER (HORIZONTINA)", "municipio": "HORIZONTINA/RS", "planta": "CQ", "transportador": "TW (HORIZONTINA)", "modal": "FTL", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:24", "chegada_iso": "2026-07-13T15:24:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -36, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 9, "tem_nf": true, "ge": "HOR-023514", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374799, "aglutinador": "FTL-85;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "NELSON DO BRASIL (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "BM", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "FTL", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:11", "chegada_iso": "2026-07-13T13:11:01", "saida_origem": "13/07 16:44", "saida_iso": "2026-07-13T16:44:00", "atraso_chegada_min": -169, "permanencia_min": 213, "atraso_saida_min": 44, "status": "Finalizado", "tempo_h": 74.95, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "STA-043829", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.282058, "lng": -52.76515}, {"pedido": 374964, "aglutinador": "FTL-85;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ALFAGOMMA (GUARANESIA)", "municipio": "GUARANESIA/MG", "planta": "BZ", "transportador": "JSL (BETIM)", "modal": "FTL", "janela": "14/07 21:00", "janela_iso": "2026-07-14T21:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375003, "aglutinador": "FTL-87;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "RESIPLASTIC (MONTENEGRO)", "municipio": "MONTENEGRO/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "FTL", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:42", "chegada_iso": "2026-07-13T16:42:43", "saida_origem": "13/07 16:42", "saida_iso": "2026-07-13T16:42:00", "atraso_chegada_min": 1003, "permanencia_min": -1, "atraso_saida_min": 1002, "status": "Finalizado", "tempo_h": 1.12, "ans": "Fora do ANS", "qtde_nf": 12, "tem_nf": true, "ge": "NHO-141974", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.6816904, "lng": -51.4680471}, {"pedido": 375266, "aglutinador": "FTL-87;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "RESIPLASTIC (MONTENEGRO)", "municipio": "MONTENEGRO/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "FTL", "janela": "14/07 00:00", "janela_iso": "2026-07-14T00:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 4.0, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "NHO-142115", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.71379, "lng": -51.49199}, {"pedido": 374780, "aglutinador": "FTL-93;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "UNIMAK (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:12", "chegada_iso": "2026-07-13T16:12:00", "saida_origem": "13/07 16:49", "saida_iso": "2026-07-13T16:49:00", "atraso_chegada_min": 192, "permanencia_min": 37, "atraso_saida_min": 229, "status": "Iniciado", "tempo_h": 3.15, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303315", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1119444, "lng": -47.2766667}, {"pedido": 374866, "aglutinador": "FTL-93;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "UNIMAK (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374772, "aglutinador": "FTL-94;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ITM LANDRONI (ATIBAIA)", "municipio": "ATIBAIA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.32, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303530", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.0536111, "lng": -46.6766667}, {"pedido": 374961, "aglutinador": "FTL-94;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ITM LANDRONI (ATIBAIA)", "municipio": "ATIBAIA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375125, "aglutinador": "FX-02;SEG;13072026", "veiculo_aglutinado": "VAN", "fornecedor": "GATES (JACAREI-ST MARIA)", "municipio": "JACAREI/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 18:00", "janela_iso": "2026-07-13T18:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 19:20", "chegada_iso": "2026-07-13T19:20:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 80, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 8.82, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CCO-013053", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.28699, "lng": -45.95559}, {"pedido": 375064, "aglutinador": "FX-04;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "GRAMMER (ATIBAIA)", "municipio": "ATIBAIA/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:22", "chegada_iso": "2026-07-13T15:22:01", "saida_origem": "13/07 18:46", "saida_iso": "2026-07-13T18:46:00", "atraso_chegada_min": 82, "permanencia_min": 204, "atraso_saida_min": 286, "status": "Finalizado", "tempo_h": 71.12, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "OSC-654039", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.28699, "lng": -45.95559}, {"pedido": 374786, "aglutinador": "FX-07;SEG;13072026", "veiculo_aglutinado": "RODOTREM SIDER", "fornecedor": "IOCHPE MAX (CRUZEIRO)", "municipio": "CRUZEIRO/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "FTL", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 7.23, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CCO-013047", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.113, "lng": -47.2763}, {"pedido": 374860, "aglutinador": "FX-07;TER;14072026", "veiculo_aglutinado": "RODOTREM SIDER", "fornecedor": "IOCHPE MAX (CRUZEIRO)", "municipio": "CRUZEIRO/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "FTL", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375318, "aglutinador": "FX-09;TER;14072026", "veiculo_aglutinado": "VAN", "fornecedor": "MAHLE (ARUJA)", "municipio": "ARUJA/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "14/07 19:00", "janela_iso": "2026-07-14T19:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.82, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "OSC-654344", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.4844, "lng": -46.7858}, {"pedido": 375086, "aglutinador": "FX-10;SEG;13072026", "veiculo_aglutinado": "3/4", "fornecedor": "MODINE (GUARULHOS)", "municipio": "GUARULHOS/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:00", "chegada_iso": "2026-07-13T10:00:01", "saida_origem": "13/07 13:19", "saida_iso": "2026-07-13T13:19:00", "atraso_chegada_min": 0, "permanencia_min": 199, "atraso_saida_min": 199, "status": "Finalizado", "tempo_h": 5.97, "ans": "Dentro do ANS", "qtde_nf": 10, "tem_nf": true, "ge": "OSC-654038", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.484157, "lng": -46.785228}, {"pedido": 374936, "aglutinador": "FX-12;SEG;13072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "SEARS (SAO ROQUE)", "municipio": "SAO ROQUE/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:21", "chegada_iso": "2026-07-13T14:21:01", "saida_origem": "13/07 15:00", "saida_iso": "2026-07-13T15:00:00", "atraso_chegada_min": 21, "permanencia_min": 39, "atraso_saida_min": 60, "status": "Finalizado", "tempo_h": 3.97, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "CCO-013050", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.484157, "lng": -46.785228}, {"pedido": 374873, "aglutinador": "FX-14;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ZF AUTOMOTIVE (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN FF", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:22", "chegada_iso": "2026-07-13T16:22:01", "saida_origem": "13/07 18:58", "saida_iso": "2026-07-13T18:58:00", "atraso_chegada_min": 202, "permanencia_min": 156, "atraso_saida_min": 358, "status": "Iniciado", "tempo_h": 7.23, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "OSC-654046", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.5078, "lng": -46.7404}, {"pedido": 375066, "aglutinador": "FX-15;SEG;13072026", "veiculo_aglutinado": "3/4", "fornecedor": "CERCENA (ERECHIM)", "municipio": "ERECHIM/RS", "planta": "BM", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:33", "chegada_iso": "2026-07-13T15:33:01", "saida_origem": "13/07 14:51", "saida_iso": "2026-07-13T14:51:00", "atraso_chegada_min": -27, "permanencia_min": -42, "atraso_saida_min": -69, "status": "Finalizado", "tempo_h": 7.08, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "ERE-039956", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.282058, "lng": -52.76515}, {"pedido": 375062, "aglutinador": "FX-17;SEG;13072026", "veiculo_aglutinado": "VAN", "fornecedor": "ELBE (PASSO DO SOBRADO)", "municipio": "PASSO DO SOBRADO/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:56", "chegada_iso": "2026-07-13T15:56:01", "saida_origem": "13/07 15:58", "saida_iso": "2026-07-13T15:58:00", "atraso_chegada_min": 176, "permanencia_min": 2, "atraso_saida_min": 178, "status": "Finalizado", "tempo_h": 73.2, "ans": "Fora do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "STC-011781", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.862818, "lng": -51.432409}, {"pedido": 375027, "aglutinador": "FX-18;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "GENERAL COAT (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 17:00", "janela_iso": "2026-07-13T17:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:17", "chegada_iso": "2026-07-13T14:17:01", "saida_origem": "13/07 15:30", "saida_iso": "2026-07-13T15:30:00", "atraso_chegada_min": -163, "permanencia_min": 73, "atraso_saida_min": -90, "status": "Finalizado", "tempo_h": 70.98, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532351", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.11525, "lng": -51.173635}, {"pedido": 375305, "aglutinador": "FX-18;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "GENERAL COAT (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "14/07 17:00", "janela_iso": "2026-07-14T17:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.12, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532500", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.7558, "lng": -51.4581}, {"pedido": 375319, "aglutinador": "FX-19;TER;14072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "MAXFORJA (CANOAS)", "municipio": "CANOAS/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 11:00", "janela_iso": "2026-07-14T11:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 2.43, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "POA-607286", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -30.0949, "lng": -51.02778}, {"pedido": 374776, "aglutinador": "FX-22;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "POLIRIM (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "FTL", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:28", "chegada_iso": "2026-07-13T14:28:01", "saida_origem": "13/07 16:24", "saida_iso": "2026-07-13T16:24:00", "atraso_chegada_min": -32, "permanencia_min": 116, "atraso_saida_min": 84, "status": "Finalizado", "tempo_h": 75.53, "ans": "Dentro do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "CSL-532116", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.7157, "lng": -51.4892}, {"pedido": 374861, "aglutinador": "FX-23;TER;14072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SCHUMACHER (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "CQ", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN FF", "janela": "14/07 10:00", "janela_iso": "2026-07-14T10:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.7, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "POA-607288", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.862, "lng": -51.4333}, {"pedido": 375123, "aglutinador": "FX-25;SEG;13072026", "veiculo_aglutinado": "3/4", "fornecedor": "GATES (JACAREI-ST MARIA)", "municipio": "JACAREI/SP", "planta": "CQ", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 18:00", "janela_iso": "2026-07-13T18:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 19:19", "chegada_iso": "2026-07-13T19:19:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 79, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 8.82, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CCO-013054", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.28699, "lng": -45.95559}, {"pedido": 375060, "aglutinador": "FX-28;SEG;13072026", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "CERCENA (ERECHIM)", "municipio": "ERECHIM/RS", "planta": "CQ", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN FF", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:16", "chegada_iso": "2026-07-13T13:16:01", "saida_origem": "13/07 14:50", "saida_iso": "2026-07-13T14:50:00", "atraso_chegada_min": 796, "permanencia_min": 94, "atraso_saida_min": 890, "status": "Finalizado", "tempo_h": 7.97, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "ERE-039957", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.282058, "lng": -52.76515}, {"pedido": 375137, "aglutinador": "FX-29;SEG;13072026", "veiculo_aglutinado": "TOCO", "fornecedor": "CERCENA (ERECHIM)", "municipio": "ERECHIM/RS", "planta": "PDC", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:33", "chegada_iso": "2026-07-13T15:33:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -27, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 10.35, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "ERE-039955", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.288, "lng": -51.96289}, {"pedido": 375153, "aglutinador": "FX-31;SEG;13072026", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "ELBE (PASSO DO SOBRADO)", "municipio": "PASSO DO SOBRADO/RS", "planta": "PDC", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:59", "chegada_iso": "2026-07-13T15:59:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 179, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.47, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "STC-011780", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.86199, "lng": -51.4333}, {"pedido": 375320, "aglutinador": "FX-31;TER;14072026", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "MAXFORJA (CANOAS)", "municipio": "CANOAS/RS", "planta": "CQ", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 11:00", "janela_iso": "2026-07-14T11:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 2.43, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "POA-607285", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -30.0949, "lng": -51.02778}, {"pedido": 374775, "aglutinador": "FX-33;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "FALLGATTER (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "CQ", "transportador": "TW (MONTENEGRO-RS)", "modal": "FTL", "janela": "13/07 17:00", "janela_iso": "2026-07-13T17:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:35", "chegada_iso": "2026-07-13T17:35:00", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 35, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 6.82, "ans": "Fora do ANS", "qtde_nf": 30, "tem_nf": true, "ge": "POA-606880", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -30.0949095, "lng": -51.0277822}, {"pedido": 375032, "aglutinador": "FX-34;SEG;13072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "HASSMANN (IMIGRANTE)", "municipio": "IMIGRANTE/RS", "planta": "CQ", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:59", "chegada_iso": "2026-07-13T15:59:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -1, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.47, "ans": "Fora do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "LAJ-024273", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.86199, "lng": -51.4333}, {"pedido": 375381, "aglutinador": "FX-35;TER;14072026", "veiculo_aglutinado": "3/4", "fornecedor": "HASSMANN (IMIGRANTE)", "municipio": "IMIGRANTE/RS", "planta": "PDC", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.35, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "LAJ-024278", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.71569, "lng": -51.48919}, {"pedido": 375327, "aglutinador": "FX-36;TER;14072026", "veiculo_aglutinado": "VAN", "fornecedor": "METALMOTO (SAO LEOPOLDO)", "municipio": "SAO LEOPOLDO/RS", "planta": "CQ", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 15:30", "janela_iso": "2026-07-14T15:30:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 4.0, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "NHO-142139", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.71379, "lng": -51.49199}, {"pedido": 375059, "aglutinador": "FX-37;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ACRILYS LAM (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "CQ", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:04", "chegada_iso": "2026-07-13T15:04:01", "saida_origem": "13/07 17:20", "saida_iso": "2026-07-13T17:20:00", "atraso_chegada_min": 64, "permanencia_min": 136, "atraso_saida_min": 200, "status": "Finalizado", "tempo_h": 70.98, "ans": "Dentro do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "CSL-532342", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.11524, "lng": -51.17363}, {"pedido": 375239, "aglutinador": "FX-37;TER;14072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "ACRILYS LAM (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "CQ", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN FF", "janela": "14/07 00:00", "janela_iso": "2026-07-14T00:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.23, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532413", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.6856, "lng": -51.4725}, {"pedido": 375377, "aglutinador": "FX-38;TER;14072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "ACRILYS LAM (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.23, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532493", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.6856, "lng": -51.47249}, {"pedido": 375130, "aglutinador": "FX-41;SEG;13072026", "veiculo_aglutinado": "TOCO", "fornecedor": "ACRILYS LAM (S FRANC PAULA)", "municipio": "SAO FRANCISCO DE PAULA/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:27", "chegada_iso": "2026-07-13T13:27:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -33, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.23, "ans": "Fora do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "NHO-142030", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.58459, "lng": -51.35979}, {"pedido": 375029, "aglutinador": "FX-42;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ACRILYS LAM (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:04", "chegada_iso": "2026-07-13T15:04:01", "saida_origem": "13/07 17:18", "saida_iso": "2026-07-13T17:18:00", "atraso_chegada_min": 64, "permanencia_min": 134, "atraso_saida_min": 198, "status": "Finalizado", "tempo_h": 70.98, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "CSL-532350", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.11525, "lng": -51.173635}, {"pedido": 375128, "aglutinador": "FX-49;SEG;13072026", "veiculo_aglutinado": "3/4", "fornecedor": "AUTOTRAVI (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:12", "chegada_iso": "2026-07-13T17:12:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 432, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.88, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532354", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.862, "lng": -51.4334}, {"pedido": 375065, "aglutinador": "FX-49;SEG;13072026-1", "veiculo_aglutinado": "3/4", "fornecedor": "BOLLHOFF (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "CQ", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:12", "chegada_iso": "2026-07-13T13:12:00", "saida_origem": "13/07 13:22", "saida_iso": "2026-07-13T13:22:00", "atraso_chegada_min": -168, "permanencia_min": 10, "atraso_saida_min": -158, "status": "Finalizado", "tempo_h": 6.82, "ans": "Fora do ANS", "qtde_nf": 26, "tem_nf": true, "ge": "POA-607119", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.86281, "lng": -51.4324}, {"pedido": 375323, "aglutinador": "FX-50;TER;14072026", "veiculo_aglutinado": "VAN", "fornecedor": "BOLLHOFF (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.7, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "POA-607284", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.862, "lng": -51.4333}, {"pedido": 375050, "aglutinador": "FX-55;SEG;13072026", "veiculo_aglutinado": "TOCO", "fornecedor": "CASTERTECH FUNDICAO (CAXIAS)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 08:00", "janela_iso": "2026-07-13T08:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 12:41", "chegada_iso": "2026-07-13T12:41:01", "saida_origem": "13/07 15:46", "saida_iso": "2026-07-13T15:46:00", "atraso_chegada_min": 281, "permanencia_min": 185, "atraso_saida_min": 466, "status": "Finalizado", "tempo_h": 70.88, "ans": "Dentro do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "CSL-532345", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.1749, "lng": -51.16819}, {"pedido": 375096, "aglutinador": "FX-56;SEG;13072026", "veiculo_aglutinado": "TOCO", "fornecedor": "CASTERTECH USINAGEM (CAXIAS)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN FF", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:35", "chegada_iso": "2026-07-13T15:35:01", "saida_origem": "13/07 16:27", "saida_iso": "2026-07-13T16:27:00", "atraso_chegada_min": 935, "permanencia_min": 52, "atraso_saida_min": 987, "status": "Finalizado", "tempo_h": 72.62, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "CSL-532337", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.11524, "lng": -51.17363}, {"pedido": 375140, "aglutinador": "FX-57;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "CASTERTECH USINAGEM (CAXIAS)", "municipio": "CAXIAS DO SUL/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:36", "chegada_iso": "2026-07-13T15:36:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 36, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.7, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "CSL-532331", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.86199, "lng": -51.43339}, {"pedido": 375150, "aglutinador": "FX-61;SEG;13072026", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "CHAPEMEC (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "PDC", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:30", "chegada_iso": "2026-07-13T13:30:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -90, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.23, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "STA-043853", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -27.7817, "lng": -54.26019}, {"pedido": 375193, "aglutinador": "FX-66;QUI;16072026", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "CREPESUL (SAO LEOPOLDO)", "municipio": "SAO LEOPOLDO/RS", "planta": "CQ", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN FF", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 4.12, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "NHO-142058", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.71379, "lng": -51.49199}, {"pedido": 375141, "aglutinador": "FX-68;SEG;13072026", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "CREPESUL (SAO LEOPOLDO)", "municipio": "SAO LEOPOLDO/RS", "planta": "PDC", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:54", "chegada_iso": "2026-07-13T11:54:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -126, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.47, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "NHO-142029", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.80969, "lng": -51.5054}, {"pedido": 375101, "aglutinador": "FX-69;SEG;13072026", "veiculo_aglutinado": "VAN", "fornecedor": "CREPESUL (SAO LEOPOLDO)", "municipio": "SAO LEOPOLDO/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:54", "chegada_iso": "2026-07-13T11:54:01", "saida_origem": "13/07 15:08", "saida_iso": "2026-07-13T15:08:00", "atraso_chegada_min": -126, "permanencia_min": 194, "atraso_saida_min": 68, "status": "Finalizado", "tempo_h": 71.33, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "NHO-142031", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.86281, "lng": -51.4324}, {"pedido": 374998, "aglutinador": "FX-88;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "MODINE (GUARULHOS)", "municipio": "GUARULHOS/SP", "planta": "CQ", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 15:30", "janela_iso": "2026-07-13T15:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:00", "chegada_iso": "2026-07-13T10:00:01", "saida_origem": "13/07 13:21", "saida_iso": "2026-07-13T13:21:00", "atraso_chegada_min": -330, "permanencia_min": 201, "atraso_saida_min": -129, "status": "Finalizado", "tempo_h": 5.97, "ans": "Dentro do ANS", "qtde_nf": 20, "tem_nf": true, "ge": "OSC-654033", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.48415, "lng": -46.78522}, {"pedido": 375057, "aglutinador": "FX-89;SEG;13072026", "veiculo_aglutinado": "TOCO", "fornecedor": "ACRILYS LAM (S FRANC PAULA)", "municipio": "SAO FRANCISCO DE PAULA/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:27", "chegada_iso": "2026-07-13T13:27:01", "saida_origem": "13/07 14:05", "saida_iso": "2026-07-13T14:05:00", "atraso_chegada_min": -33, "permanencia_min": 38, "atraso_saida_min": 5, "status": "Finalizado", "tempo_h": 70.98, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "NHO-142033", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.11525, "lng": -51.173635}, {"pedido": 375325, "aglutinador": "FX-90;TER;14072026", "veiculo_aglutinado": "TOCO", "fornecedor": "METALMOTO (SAO LEOPOLDO)", "municipio": "SAO LEOPOLDO/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 15:30", "janela_iso": "2026-07-14T15:30:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 4.12, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "NHO-142140", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.7138, "lng": -51.492}, {"pedido": 375376, "aglutinador": "FX-90;TER;14072026", "veiculo_aglutinado": "TOCO", "fornecedor": "MAXFORJA (CANOAS)", "municipio": "CANOAS/RS", "planta": "PDC", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 11:00", "janela_iso": "2026-07-14T11:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 2.43, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "NHO-142133", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -30.0949, "lng": -51.02778}, {"pedido": 375367, "aglutinador": "FX-99;TER;14072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "METALMOTO (SAO LEOPOLDO)", "municipio": "SAO LEOPOLDO/RS", "planta": "PDC", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 15:30", "janela_iso": "2026-07-14T15:30:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 4.0, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "NHO-142135", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.71379, "lng": -51.49199}, {"pedido": 375004, "aglutinador": "MG-01;SEG;13072026", "veiculo_aglutinado": "RODOTREM SIDER", "fornecedor": "SIDERAL (CONCEICAO DO PARA)", "municipio": "CONCEICAO DO PARA/MG", "planta": "BM", "transportador": "MIRASSOL (UBERABA)", "modal": "FTL", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:45", "chegada_iso": "2026-07-13T16:45:45", "saida_origem": "13/07 16:46", "saida_iso": "2026-07-13T16:46:12", "atraso_chegada_min": 226, "permanencia_min": 0, "atraso_saida_min": 226, "status": "Iniciado", "tempo_h": 3.4, "ans": "Fora do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "19-10299-5", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -19.721, "lng": -44.858}, {"pedido": 375010, "aglutinador": "MG-01;TER;14072026", "veiculo_aglutinado": "RODOTREM SIDER", "fornecedor": "SIDERAL (CONCEICAO DO PARA)", "municipio": "CONCEICAO DO PARA/MG", "planta": "BM", "transportador": "MIRASSOL (UBERABA)", "modal": "FTL", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375106, "aglutinador": "MK-04;SEG;13072026", "veiculo_aglutinado": "CARRETA ABERTA", "fornecedor": "ARCELORMITTAL (HORTOLANDIA)", "municipio": "HORTOLANDIA/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 08:41", "chegada_iso": "2026-07-13T08:41:26", "saida_origem": "13/07 14:44", "saida_iso": "2026-07-13T14:44:48", "atraso_chegada_min": 101, "permanencia_min": 363, "atraso_saida_min": 465, "status": "Finalizado", "tempo_h": 6.88, "ans": "Dentro do ANS", "qtde_nf": 13, "tem_nf": true, "ge": "38-75929-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1006567, "lng": -46.9688233}, {"pedido": 375131, "aglutinador": "MK-45;SEG;13072026", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "BELLOTA (INDAIAL)", "municipio": "INDAIAL/SC", "planta": "PDC", "transportador": "MIRASSOL (TUBARAO)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:20", "chegada_iso": "2026-07-13T15:20:01", "saida_origem": "13/07 15:45", "saida_iso": "2026-07-13T15:45:42", "atraso_chegada_min": 80, "permanencia_min": 26, "atraso_saida_min": 106, "status": "Finalizado", "tempo_h": 51.98, "ans": "Fora do ANS", "qtde_nf": 8, "tem_nf": true, "ge": "24-12601-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.5752609, "lng": -49.1783244}, {"pedido": 375042, "aglutinador": "MK-52;SEG;13072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "CANDEIA (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "CQ", "transportador": "TW (HORIZONTINA)", "modal": "MILKRUN", "janela": "13/07 07:30", "janela_iso": "2026-07-13T07:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:34", "chegada_iso": "2026-07-13T14:34:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 424, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 4.23, "ans": "Fora do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "STA-043860", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.05379, "lng": -52.8718}, {"pedido": 375148, "aglutinador": "MK-66;SEG;13072026", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "DEMORE (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:41", "chegada_iso": "2026-07-13T11:41:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 701, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.23, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "CSL-532328", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.6856, "lng": -51.47249}, {"pedido": 374617, "aglutinador": "MK-90;QUI;09072026", "veiculo_aglutinado": "TOCO", "fornecedor": "CRONNOS (JUNDIAI)", "municipio": "JUNDIAI/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:04", "chegada_iso": "2026-07-13T13:04:55", "saida_origem": "13/07 14:34", "saida_iso": "2026-07-13T14:34:35", "atraso_chegada_min": 5, "permanencia_min": 90, "atraso_saida_min": 95, "status": "Finalizado", "tempo_h": 2.25, "ans": "Fora do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "38-75927-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1052789, "lng": -46.9713078}, {"pedido": 374618, "aglutinador": "MK-90;QUI;09072026", "veiculo_aglutinado": "TOCO", "fornecedor": "CRONNOS (JUNDIAI)", "municipio": "JUNDIAI/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:04", "chegada_iso": "2026-07-13T13:04:55", "saida_origem": "13/07 14:34", "saida_iso": "2026-07-13T14:34:35", "atraso_chegada_min": 5, "permanencia_min": 90, "atraso_saida_min": 95, "status": "Finalizado", "tempo_h": 2.25, "ans": "Fora do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "38-75927-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1052789, "lng": -46.9713078}, {"pedido": 375154, "aglutinador": "MK-91;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "GATES (JACAREI-ST MARIA)", "municipio": "JACAREI/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 20:00", "janela_iso": "2026-07-13T20:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:40", "chegada_iso": "2026-07-13T17:40:45", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -139, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.33, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-75932-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.197222, "lng": -46.183888}, {"pedido": 375361, "aglutinador": "MKR-14-07-2026-1-1", "veiculo_aglutinado": "VAN", "fornecedor": "PARKER SEALS (SAO PAULO)", "municipio": "SAO PAULO/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375338, "aglutinador": "MKR-14-07-2026-1-10", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ETHOS IND (BOITUVA)", "municipio": "BOITUVA/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375374, "aglutinador": "MKR-14-07-2026-1-10", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ETHOS IND (BOITUVA)", "municipio": "BOITUVA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375371, "aglutinador": "MKR-14-07-2026-1-2", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "ITM LANDRONI (ATIBAIA)", "municipio": "ATIBAIA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 17:00", "janela_iso": "2026-07-14T17:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374871, "aglutinador": "MKR-14-07-2026-1-3", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "FIXOVED (S BERNARDO CAMPO)", "municipio": "SAO BERNARDO DO CAMPO/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 17:00", "janela_iso": "2026-07-14T17:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375275, "aglutinador": "MKR-14-07-2026-1-3", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "FIXOVED (S BERNARDO CAMPO)", "municipio": "SAO BERNARDO DO CAMPO/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 17:00", "janela_iso": "2026-07-14T17:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375332, "aglutinador": "MKR-14-07-2026-1-3", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "WURTH (SAO BERNARDO DO CAMPO)", "municipio": "SAO BERNARDO DO CAMPO/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 11:00", "janela_iso": "2026-07-14T11:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375347, "aglutinador": "MKR-14-07-2026-1-3", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "RESIL COMERCIAL (DIADEMA)", "municipio": "DIADEMA/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375359, "aglutinador": "MKR-14-07-2026-1-3-1", "veiculo_aglutinado": "3/4", "fornecedor": "FAROIS VINCO (SAO PAULO)", "municipio": "SAO PAULO/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 10:00", "janela_iso": "2026-07-14T10:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375350, "aglutinador": "MKR-14-07-2026-1-4", "veiculo_aglutinado": "3/4", "fornecedor": "HYDRAFORCE (TABOAO DA SERRA)", "municipio": "TABOAO DA SERRA/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 17:00", "janela_iso": "2026-07-14T17:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375352, "aglutinador": "MKR-14-07-2026-1-4", "veiculo_aglutinado": "3/4", "fornecedor": "HYDRAFORCE (TABOAO DA SERRA)", "municipio": "TABOAO DA SERRA/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 17:00", "janela_iso": "2026-07-14T17:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374867, "aglutinador": "MKR-14-07-2026-1-5", "veiculo_aglutinado": "3/4", "fornecedor": "SCHAEFFLER BRASIL (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 11:00", "janela_iso": "2026-07-14T11:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375329, "aglutinador": "MKR-14-07-2026-1-5", "veiculo_aglutinado": "3/4", "fornecedor": "MENTOR (SALTO)", "municipio": "SALTO/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375330, "aglutinador": "MKR-14-07-2026-1-5", "veiculo_aglutinado": "3/4", "fornecedor": "MENTOR (SALTO)", "municipio": "SALTO/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374865, "aglutinador": "MKR-14-07-2026-1-5-1", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "UNIMIL (PIRACICABA-A.BENEDICTO)", "municipio": "PIRACICABA/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 22:00", "janela_iso": "2026-07-14T22:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375370, "aglutinador": "MKR-14-07-2026-1-5-1", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "REQUIPH HIDR (PIRACICABA)", "municipio": "PIRACICABA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 19:00", "janela_iso": "2026-07-14T19:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375273, "aglutinador": "MKR-14-07-2026-1-7", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "WIPRO (PIRACICABA)", "municipio": "PIRACICABA/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 15:00", "janela_iso": "2026-07-14T15:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375337, "aglutinador": "MKR-14-07-2026-1-7", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "SDS (IRACEMAPOLIS)", "municipio": "IRACEMAPOLIS/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 10:00", "janela_iso": "2026-07-14T10:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375328, "aglutinador": "MKR-14-07-2026-1-8", "veiculo_aglutinado": "TOCO", "fornecedor": "ZF AUTOMOTIVE (SUMARE)", "municipio": "SUMARE/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 17:00", "janela_iso": "2026-07-14T17:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375360, "aglutinador": "MKR-14-07-2026-1-8", "veiculo_aglutinado": "TOCO", "fornecedor": "ZF AUTOMOTIVE (SUMARE)", "municipio": "SUMARE/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 17:00", "janela_iso": "2026-07-14T17:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375363, "aglutinador": "MKR-14-07-2026-1-8", "veiculo_aglutinado": "TOCO", "fornecedor": "OPTIBELT (HORTOLANDIA)", "municipio": "HORTOLANDIA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375364, "aglutinador": "MKR-14-07-2026-1-8", "veiculo_aglutinado": "TOCO", "fornecedor": "BOSCH (ITATIBA)", "municipio": "SUMARE/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 11:00", "janela_iso": "2026-07-14T11:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375375, "aglutinador": "MKR-14-07-2026-1-8-1", "veiculo_aglutinado": "TOCO", "fornecedor": "BERCOSUL (CAMPO L. PAULISTA)", "municipio": "CAMPO LIMPO PAULISTA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 10:00", "janela_iso": "2026-07-14T10:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375331, "aglutinador": "MKR-14-07-2026-1-9", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "CALDLASER (ITU)", "municipio": "ITU/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 11:00", "janela_iso": "2026-07-14T11:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375334, "aglutinador": "MKR-14-07-2026-1-9", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "CALDLASER (ITU)", "municipio": "ITU/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 11:00", "janela_iso": "2026-07-14T11:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374854, "aglutinador": "MR-07;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SCHAEFFLER BRASIL (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 12:00", "janela_iso": "2026-07-13T12:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:10", "chegada_iso": "2026-07-13T16:10:12", "saida_origem": "13/07 16:56", "saida_iso": "2026-07-13T16:56:29", "atraso_chegada_min": 250, "permanencia_min": 46, "atraso_saida_min": 296, "status": "Iniciado", "tempo_h": 8.32, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "38-75936-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.415751, "lng": -47.344749}, {"pedido": 375072, "aglutinador": "MR-07;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "HENNINGS (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 18:35", "chegada_iso": "2026-07-13T18:35:46", "saida_origem": "13/07 18:47", "saida_iso": "2026-07-13T18:47:49", "atraso_chegada_min": 216, "permanencia_min": 12, "atraso_saida_min": 228, "status": "Iniciado", "tempo_h": 8.32, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "38-75936-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.415751, "lng": -47.344749}, {"pedido": 375080, "aglutinador": "MR-07;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "MANGOTEX (ITU)", "municipio": "ITU/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:08", "chegada_iso": "2026-07-13T13:08:47", "saida_origem": "13/07 15:03", "saida_iso": "2026-07-13T15:03:12", "atraso_chegada_min": 249, "permanencia_min": 114, "atraso_saida_min": 363, "status": "Iniciado", "tempo_h": 8.32, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "38-75936-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.415751, "lng": -47.344749}, {"pedido": 375089, "aglutinador": "MR-07;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "HENNINGS (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 18:35", "chegada_iso": "2026-07-13T18:35:46", "saida_origem": "13/07 18:47", "saida_iso": "2026-07-13T18:47:49", "atraso_chegada_min": 216, "permanencia_min": 12, "atraso_saida_min": 228, "status": "Iniciado", "tempo_h": 8.32, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "38-75936-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.415751, "lng": -47.344749}, {"pedido": 375133, "aglutinador": "MR-07;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "HENNINGS (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 18:35", "chegada_iso": "2026-07-13T18:35:46", "saida_origem": "13/07 18:47", "saida_iso": "2026-07-13T18:47:49", "atraso_chegada_min": 216, "permanencia_min": 12, "atraso_saida_min": 228, "status": "Iniciado", "tempo_h": 8.32, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "38-75936-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.415751, "lng": -47.344749}, {"pedido": 375069, "aglutinador": "MR-11;SEG;13072026", "veiculo_aglutinado": "3/4", "fornecedor": "TUP TECNOLOGIA (COTIA)", "municipio": "COTIA/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "11/07 16:24", "chegada_iso": "2026-07-11T16:24:46", "saida_origem": "13/07 13:36", "saida_iso": "2026-07-13T13:36:49", "atraso_chegada_min": -2735, "permanencia_min": 2712, "atraso_saida_min": -23, "status": "Finalizado", "tempo_h": 65.07, "ans": "Fora do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "38-75941-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1052283, "lng": -46.9713217}, {"pedido": 375145, "aglutinador": "MR-11;SEG;13072026", "veiculo_aglutinado": "3/4", "fornecedor": "HYDRAFORCE (TABOAO DA SERRA)", "municipio": "TABOAO DA SERRA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 17:00", "janela_iso": "2026-07-13T17:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:11", "chegada_iso": "2026-07-13T17:11:17", "saida_origem": "13/07 17:13", "saida_iso": "2026-07-13T17:13:21", "atraso_chegada_min": 11, "permanencia_min": 2, "atraso_saida_min": 13, "status": "Finalizado", "tempo_h": 65.07, "ans": "Fora do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "38-75941-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1052283, "lng": -46.9713217}, {"pedido": 375092, "aglutinador": "MR-11;SEG;13072026-1", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "SOUTHCO (COTIA)", "municipio": "COTIA/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 15:30", "janela_iso": "2026-07-13T15:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:20", "chegada_iso": "2026-07-13T15:20:52", "saida_origem": "13/07 16:40", "saida_iso": "2026-07-13T16:40:35", "atraso_chegada_min": -9, "permanencia_min": 80, "atraso_saida_min": 71, "status": "Finalizado", "tempo_h": 19.67, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "38-75943-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1045384, "lng": -46.9717691}, {"pedido": 375417, "aglutinador": "MR-11;SEG;13072026-1", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "SOUTHCO (COTIA)", "municipio": "COTIA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:20", "chegada_iso": "2026-07-13T15:20:52", "saida_origem": "13/07 16:40", "saida_iso": "2026-07-13T16:40:35", "atraso_chegada_min": 21, "permanencia_min": 80, "atraso_saida_min": 101, "status": "Finalizado", "tempo_h": 19.67, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "38-75943-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1045384, "lng": -46.9717691}, {"pedido": 375097, "aglutinador": "MR-14;SEG;13072026", "veiculo_aglutinado": "TOCO", "fornecedor": "LTM (BOTUCATU)", "municipio": "BOTUCATU/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN FF", "janela": "13/07 13:30", "janela_iso": "2026-07-13T13:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:39", "chegada_iso": "2026-07-13T13:39:22", "saida_origem": "13/07 20:09", "saida_iso": "2026-07-13T20:09:13", "atraso_chegada_min": 9, "permanencia_min": 390, "atraso_saida_min": 399, "status": "Finalizado", "tempo_h": 67.47, "ans": "Fora do ANS", "qtde_nf": 20, "tem_nf": true, "ge": "38-75940-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.100779213503305, "lng": -46.96897431504544}, {"pedido": 375102, "aglutinador": "MR-14;SEG;13072026", "veiculo_aglutinado": "TOCO", "fornecedor": "LTM (BOTUCATU)", "municipio": "BOTUCATU/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 13:30", "janela_iso": "2026-07-13T13:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:39", "chegada_iso": "2026-07-13T13:39:22", "saida_origem": "13/07 20:09", "saida_iso": "2026-07-13T20:09:13", "atraso_chegada_min": 9, "permanencia_min": 390, "atraso_saida_min": 399, "status": "Finalizado", "tempo_h": 67.47, "ans": "Fora do ANS", "qtde_nf": 20, "tem_nf": true, "ge": "38-75940-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.100779213503305, "lng": -46.96897431504544}, {"pedido": 374982, "aglutinador": "MR-16;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "METALURGICA AFONSO (SAO PAULO)", "municipio": "SAO PAULO/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 18:00", "janela_iso": "2026-07-13T18:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374720, "aglutinador": "MR-21;QUI;09072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "WIPRO (PIRACICABA)", "municipio": "PIRACICABA/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN FF", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374596, "aglutinador": "MR-35;QUI;09072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "INBRASP (BOTUCATU)", "municipio": "BOTUCATU/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:22", "chegada_iso": "2026-07-13T17:22:13", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 202, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 5.08, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-75938-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.8814, "lng": -48.4793}, {"pedido": 375070, "aglutinador": "MR-67;SEG;13072026", "veiculo_aglutinado": "VAN", "fornecedor": "OMT (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "13/07 11:00", "janela_iso": "2026-07-13T11:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": "13/07 13:44", "saida_iso": "2026-07-13T13:44:43", "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": 165, "status": "Finalizado", "tempo_h": 5.47, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "35-2157-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.815618950184692, "lng": -51.39472318882748}, {"pedido": 375084, "aglutinador": "MR-67;SEG;13072026", "veiculo_aglutinado": "VAN", "fornecedor": "OMT (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "13/07 11:00", "janela_iso": "2026-07-13T11:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": "13/07 13:44", "saida_iso": "2026-07-13T13:44:43", "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": 165, "status": "Finalizado", "tempo_h": 5.47, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "35-2157-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.815618950184692, "lng": -51.39472318882748}, {"pedido": 375068, "aglutinador": "MR-99;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "FUNDIMIG (CARMO DA MATA-16)", "municipio": "CARMO DA MATA/MG", "planta": "BZ", "transportador": "MIRASSOL (UBERABA)", "modal": "MILKRUN FF", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 6.43, "ans": "Fora do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "19-3889-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.0400134, "lng": -45.6878747}, {"pedido": 375074, "aglutinador": "MR-99;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "FUNDIMIG (CARMO DA MATA-35)", "municipio": "CARMO DA MATA/MG", "planta": "BZ", "transportador": "MIRASSOL (UBERABA)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:43", "chegada_iso": "2026-07-13T15:43:14", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 163, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 6.43, "ans": "Fora do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "19-3889-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.0400134, "lng": -45.6878747}, {"pedido": 375090, "aglutinador": "MR-99;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "FUNDIMIG (CARMO DA MATA-35)", "municipio": "CARMO DA MATA/MG", "planta": "NW", "transportador": "MIRASSOL (UBERABA)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:43", "chegada_iso": "2026-07-13T15:43:14", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 163, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 6.43, "ans": "Fora do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "19-3889-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.0400134, "lng": -45.6878747}, {"pedido": 375134, "aglutinador": "MR-99;SEG;13072026", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "FUNDIMIG (CARMO DA MATA-35)", "municipio": "CARMO DA MATA/MG", "planta": "PDC", "transportador": "MIRASSOL (UBERABA)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:43", "chegada_iso": "2026-07-13T15:43:14", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 163, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 6.43, "ans": "Fora do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "19-3889-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.0400134, "lng": -45.6878747}, {"pedido": 374703, "aglutinador": "PED374703", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "SEG AUTO (ITUPEVA)", "municipio": "ITUPEVA/SP", "planta": "PDC", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 08:00", "janela_iso": "2026-07-13T08:00:00", "janela_data": "2026-07-13", "chegada_origem": "08/07 16:18", "chegada_iso": "2026-07-08T16:18:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -6702, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "MATRIZ-25947", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374707, "aglutinador": "PED374707", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SCHULZ (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "BZ", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 03:10", "chegada_iso": "2026-07-13T03:10:16", "saida_origem": "13/07 09:02", "saida_iso": "2026-07-13T09:02:50", "atraso_chegada_min": -350, "permanencia_min": 353, "atraso_saida_min": 3, "status": "Iniciado", "tempo_h": 11.42, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "38-33075-5", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.5751, "lng": -49.1786}, {"pedido": 374708, "aglutinador": "PED374708", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PEDERTRACTOR (PEDERNEIRAS)", "municipio": "PEDERNEIRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.62, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303556", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1391666, "lng": -47.2563889}, {"pedido": 374710, "aglutinador": "PED374710", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "CCS (LIMEIRA)", "municipio": "LIMEIRA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 07:00", "chegada_iso": "2026-07-13T07:00:00", "saida_origem": "13/07 14:46", "saida_iso": "2026-07-13T14:46:00", "atraso_chegada_min": -120, "permanencia_min": 466, "atraso_saida_min": 346, "status": "Iniciado", "tempo_h": 7.0, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26302730", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -19.8669445, "lng": -44.0477777}, {"pedido": 374712, "aglutinador": "PED374712", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "METAL ONE (CAPIVARI)", "municipio": "CAPIVARI/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 0.0, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303548", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.55049, "lng": -46.63329}, {"pedido": 374713, "aglutinador": "PED374713", "veiculo_aglutinado": "3/4", "fornecedor": "JOHN DEERE C&F P1 (INDAIATUBA)", "municipio": "INDAIATUBA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "13/07 15:30", "janela_iso": "2026-07-13T15:30:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": 2.83, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-33079-5", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1029, "lng": -46.9713}, {"pedido": 374714, "aglutinador": "PED374714", "veiculo_aglutinado": "TRUCK VAN", "fornecedor": "UNIMAK (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 06:50", "chegada_iso": "2026-07-13T06:50:00", "saida_origem": "13/07 09:03", "saida_iso": "2026-07-13T09:03:00", "atraso_chegada_min": -130, "permanencia_min": 133, "atraso_saida_min": 3, "status": "Finalizado", "tempo_h": 2.47, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "JSL-VG26302035", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.7895018, "lng": -47.5817306}, {"pedido": 374715, "aglutinador": "PED374715", "veiculo_aglutinado": "RODOTREM LIGHT", "fornecedor": "FALLGATTER (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374716, "aglutinador": "PED374716", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "MAGIUS (SJ PINHAIS)", "municipio": "SAO JOSE DOS PINHAIS/PR", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303683", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374717, "aglutinador": "PED374717", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SEARS (SAO ROQUE)", "municipio": "SAO ROQUE/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303572", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374718, "aglutinador": "PED374718", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PAINCO (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 2.97, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303406", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.845, "lng": -47.5955555}, {"pedido": 374719, "aglutinador": "PED374719", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "TROMINK (PANAMBI)", "municipio": "PANAMBI/RS", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 2.45, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303444", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -24.9277, "lng": -48.2704}, {"pedido": 374815, "aglutinador": "PED374815", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PEDERTRACTOR (PEDERNEIRAS)", "municipio": "PEDERNEIRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL EXTRA", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:59", "chegada_iso": "2026-07-13T15:59:00", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 179, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 7.53, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26302682", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.177464, "lng": -48.3159104}, {"pedido": 374816, "aglutinador": "PED374816", "veiculo_aglutinado": "CARRETA ABERTA", "fornecedor": "PEDERTRACTOR (PEDERNEIRAS)", "municipio": "PEDERNEIRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL EXTRA", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 09:00", "chegada_iso": "2026-07-13T09:00:00", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -60, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26302085", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374818, "aglutinador": "PED374818", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PEDERTRACTOR (PEDERNEIRAS)", "municipio": "PEDERNEIRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL EXTRA", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374821, "aglutinador": "PED374821", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "CCS (LIMEIRA)", "municipio": "LIMEIRA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 23:00", "janela_iso": "2026-07-13T23:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 7.0, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26302713", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -19.86694, "lng": -44.04777}, {"pedido": 374837, "aglutinador": "PED374837", "veiculo_aglutinado": "TRUCK VAN", "fornecedor": "UNIMAK (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:43", "chegada_iso": "2026-07-13T10:43:00", "saida_origem": "13/07 11:47", "saida_iso": "2026-07-13T11:47:00", "atraso_chegada_min": 43, "permanencia_min": 64, "atraso_saida_min": 107, "status": "Finalizado", "tempo_h": 7.5, "ans": "Dentro do ANS", "qtde_nf": 10, "tem_nf": true, "ge": "JSL-VG26302073", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.8250486, "lng": -47.5762053}, {"pedido": 374838, "aglutinador": "PED374838", "veiculo_aglutinado": "TRUCK VAN", "fornecedor": "UNIMAK (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:18", "chegada_iso": "2026-07-13T16:18:00", "saida_origem": "13/07 16:50", "saida_iso": "2026-07-13T16:50:00", "atraso_chegada_min": 78, "permanencia_min": 32, "atraso_saida_min": 110, "status": "Iniciado", "tempo_h": 3.62, "ans": "Dentro do ANS", "qtde_nf": 8, "tem_nf": true, "ge": "JSL-VG26303318", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.11194, "lng": -47.27666}, {"pedido": 374842, "aglutinador": "PED374842", "veiculo_aglutinado": "VAN", "fornecedor": "MODINE (GUARULHOS)", "municipio": "GUARULHOS/SP", "planta": "PDC", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 08:00", "janela_iso": "2026-07-13T08:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 09:30", "chegada_iso": "2026-07-13T09:30:01", "saida_origem": "13/07 10:06", "saida_iso": "2026-07-13T10:06:01", "atraso_chegada_min": 90, "permanencia_min": 36, "atraso_saida_min": 126, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "MATRIZ-18001", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374843, "aglutinador": "PED374843", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "BRUNING (PANAMBI)", "municipio": "PANAMBI/RS", "planta": "PDC", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 08:00", "janela_iso": "2026-07-13T08:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 07:13", "chegada_iso": "2026-07-13T07:13:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -47, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "MATRIZ-25972", "tem_ge": true, "status_nc": "FRETE MORTO", "motivo_nc": "COLETA VAZIA - NÃO HAVIA MATERIAL PARA O DESTINATÁRIO", "nao_conforme": true, "lat": null, "lng": null}, {"pedido": 374924, "aglutinador": "PED374924", "veiculo_aglutinado": "CARRETA VANDERLEIA", "fornecedor": "FUNDIMISA (SANTO ANGELO)", "municipio": "SANTO ANGELO/RS", "planta": "BM", "transportador": "JSL (TRIUNFO)", "modal": "FTL", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374941, "aglutinador": "PED374941", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SEARS (SAO ROQUE)", "municipio": "SAO ROQUE/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374971, "aglutinador": "PED374971", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "RESIPLASTIC (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL EXTRA", "janela": "14/07 08:00", "janela_iso": "2026-07-14T08:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303482", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374977, "aglutinador": "PED374977", "veiculo_aglutinado": "CARRETA ABERTA", "fornecedor": "CCS (LIMEIRA)", "municipio": "LIMEIRA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374978, "aglutinador": "PED374978", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "CCS (LIMEIRA)", "municipio": "LIMEIRA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 23:00", "janela_iso": "2026-07-14T23:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374979, "aglutinador": "PED374979", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "HIDROVER (FLORES DA CUNHA)", "municipio": "FLORES DA CUNHA/RS", "planta": "BZ", "transportador": "JSL (TRIUNFO)", "modal": "FTL", "janela": "14/07 08:00", "janela_iso": "2026-07-14T08:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374984, "aglutinador": "PED374984", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "MAGIUS (SJ PINHAIS)", "municipio": "SAO JOSE DOS PINHAIS/PR", "planta": "BZ", "transportador": "JSL (CURITIBA)", "modal": "FTL", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374986, "aglutinador": "PED374986", "veiculo_aglutinado": "RODOTREM LIGHT", "fornecedor": "QUICKE (GUARANESIA)", "municipio": "GUARANESIA/MG", "planta": "BZ", "transportador": "JSL (BETIM)", "modal": "FTL", "janela": "14/07 23:45", "janela_iso": "2026-07-14T23:45:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374987, "aglutinador": "PED374987", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "BERCOSUL (CAMPO L. PAULISTA)", "municipio": "CAMPO LIMPO PAULISTA/SP", "planta": "BZ", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 08:00", "janela_iso": "2026-07-13T08:00:00", "janela_data": "2026-07-13", "chegada_origem": "25/06 08:02", "chegada_iso": "2026-06-25T08:02:01", "saida_origem": "25/06 08:03", "saida_iso": "2026-06-25T08:03:01", "atraso_chegada_min": -25918, "permanencia_min": 1, "atraso_saida_min": -25917, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "MATRIZ-18011", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374988, "aglutinador": "PED374988", "veiculo_aglutinado": "VAN", "fornecedor": "BERCOSUL (CAMPO L. PAULISTA)", "municipio": "CAMPO LIMPO PAULISTA/SP", "planta": "BZ", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "14/07 07:00", "janela_iso": "2026-07-14T07:00:00", "janela_data": "2026-07-14", "chegada_origem": "26/06 13:01", "chegada_iso": "2026-06-26T13:01:01", "saida_origem": "26/06 13:03", "saida_iso": "2026-06-26T13:03:01", "atraso_chegada_min": -25559, "permanencia_min": 2, "atraso_saida_min": -25557, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "MATRIZ-18012", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375012, "aglutinador": "PED375012", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "JOINTECH (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "BM", "transportador": "JSL (BARRA VELHA)", "modal": "FTL", "janela": "13/07 21:00", "janela_iso": "2026-07-13T21:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375013, "aglutinador": "PED375013", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "DANA SAC (GRAVATAI)", "municipio": "GRAVATAI/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "FTL", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:35", "chegada_iso": "2026-07-13T14:35:01", "saida_origem": "13/07 16:07", "saida_iso": "2026-07-13T16:07:00", "atraso_chegada_min": 95, "permanencia_min": 92, "atraso_saida_min": 187, "status": "Finalizado", "tempo_h": 71.97, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "POA-607049", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.86281, "lng": -51.4324}, {"pedido": 375018, "aglutinador": "PED375018", "veiculo_aglutinado": "CARRETA ABERTA", "fornecedor": "GOLIN (GUARULHOS)", "municipio": "GUARULHOS/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL EXTRA", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-308983-PV", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375019, "aglutinador": "PED375019", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "CENTRO DO BRASIL (HORIZONTINA)", "municipio": "HORIZONTINA/RS", "planta": "CQ", "transportador": "TW (HORIZONTINA)", "modal": "FTL", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:15", "chegada_iso": "2026-07-13T15:15:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 315, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "HOR-023525", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375020, "aglutinador": "PED375020", "veiculo_aglutinado": "VAN", "fornecedor": "MENTOR (SALTO)", "municipio": "SALTO/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN EXTRA", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375157, "aglutinador": "PED375157", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "RODAROS (VACARIA)", "municipio": "VACARIA/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN FF", "janela": "13/07 21:00", "janela_iso": "2026-07-13T21:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "35-2159-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375158, "aglutinador": "PED375158", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "RODAROS (VACARIA)", "municipio": "VACARIA/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN FF", "janela": "13/07 21:00", "janela_iso": "2026-07-13T21:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 0.0, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "35-2161-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.8851884, "lng": -51.1411977}, {"pedido": 375160, "aglutinador": "PED375160", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "ALFAGOMMA (GUARANESIA)", "municipio": "GUARANESIA/MG", "planta": "NW", "transportador": "MIRASSOL (UBERABA)", "modal": "MILKRUN EXTRA", "janela": "13/07 21:00", "janela_iso": "2026-07-13T21:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375161, "aglutinador": "PED375161", "veiculo_aglutinado": "TRUCK VAN", "fornecedor": "UNIMAK (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 10:00", "janela_iso": "2026-07-14T10:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375162, "aglutinador": "PED375162", "veiculo_aglutinado": "TRUCK VAN", "fornecedor": "UNIMAK (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 15:00", "janela_iso": "2026-07-14T15:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375165, "aglutinador": "PED375165", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "BRUNING (PANAMBI)", "municipio": "PANAMBI/RS", "planta": "CQ", "transportador": "MODULAR (PANAMBI)", "modal": "FTL", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375170, "aglutinador": "PED375170", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "NELSON DO BRASIL (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "CQ", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 07:30", "janela_iso": "2026-07-13T07:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:00", "chegada_iso": "2026-07-13T10:00:01", "saida_origem": "13/07 16:13", "saida_iso": "2026-07-13T16:13:01", "atraso_chegada_min": 150, "permanencia_min": 373, "atraso_saida_min": 523, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "MATRIZ-26006", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375172, "aglutinador": "PED375172", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "INDUTAR (IBIRUBA)", "municipio": "IBIRUBA/RS", "planta": "BM", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 14:30", "janela_iso": "2026-07-13T14:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:57", "chegada_iso": "2026-07-13T17:57:01", "saida_origem": "13/07 17:58", "saida_iso": "2026-07-13T17:58:00", "atraso_chegada_min": 207, "permanencia_min": 1, "atraso_saida_min": 208, "status": "Finalizado", "tempo_h": 2.62, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "IBI-004141", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.282058, "lng": -52.76515}, {"pedido": 375173, "aglutinador": "PED375173", "veiculo_aglutinado": "3/4", "fornecedor": "TRAVI PLASTICOS (CAXIAS DO SUL-CID NOVA)", "municipio": "CAXIAS DO SUL/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:58", "chegada_iso": "2026-07-13T11:58:49", "saida_origem": "13/07 14:05", "saida_iso": "2026-07-13T14:05:38", "atraso_chegada_min": -121, "permanencia_min": 127, "atraso_saida_min": 6, "status": "Finalizado", "tempo_h": 7.28, "ans": "Dentro do ANS", "qtde_nf": 5, "tem_nf": true, "ge": "35-2156-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.8155478, "lng": -51.3946711}, {"pedido": 375174, "aglutinador": "PED375174", "veiculo_aglutinado": "3/4", "fornecedor": "TRAVI PLASTICOS (CAXIAS DO SUL-CID NOVA)", "municipio": "CAXIAS DO SUL/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532376", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375175, "aglutinador": "PED375175", "veiculo_aglutinado": "3/4", "fornecedor": "TRAVI PLASTICOS (CAXIAS DO SUL-CID NOVA)", "municipio": "CAXIAS DO SUL/RS", "planta": "CQ", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.47, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532377", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.23989, "lng": -51.33359}, {"pedido": 375178, "aglutinador": "PED375178", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ZF AUTOMOTIVE (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:18", "chegada_iso": "2026-07-13T17:18:26", "saida_origem": "13/07 10:24", "saida_iso": "2026-07-13T10:24:35", "atraso_chegada_min": 498, "permanencia_min": -414, "atraso_saida_min": 85, "status": "Iniciado", "tempo_h": 7.52, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-75961-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.111666, "lng": -47.276666}, {"pedido": 375181, "aglutinador": "PED375181", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "REQUIPH HIDR (PIRACICABA)", "municipio": "PIRACICABA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303302", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375182, "aglutinador": "PED375182", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ETHOS IND (BOITUVA)", "municipio": "BOITUVA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303301", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375183, "aglutinador": "PED375183", "veiculo_aglutinado": "CARRETA ABERTA", "fornecedor": "CCS (LIMEIRA)", "municipio": "LIMEIRA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375185, "aglutinador": "PED375185", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "METHAL COMPANY (CURITIBA)", "municipio": "FAZENDA RIO GRANDE/PR", "planta": "BZ", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 03:43", "chegada_iso": "2026-07-13T03:43:29", "saida_origem": "13/07 09:03", "saida_iso": "2026-07-13T09:03:57", "atraso_chegada_min": -377, "permanencia_min": 320, "atraso_saida_min": -56, "status": "Iniciado", "tempo_h": 9.17, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-33076-5", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.575, "lng": -49.1786}, {"pedido": 375186, "aglutinador": "PED375186", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "GRANEI (GUARULHOS)", "municipio": "GUARULHOS/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 22:00", "janela_iso": "2026-07-13T22:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:55", "chegada_iso": "2026-07-13T15:55:36", "saida_origem": "13/07 16:02", "saida_iso": "2026-07-13T16:02:32", "atraso_chegada_min": -364, "permanencia_min": 7, "atraso_saida_min": -357, "status": "Finalizado", "tempo_h": 1.78, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "38-75960-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.103823, "lng": -46.9714017}, {"pedido": 375188, "aglutinador": "PED375188", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "** DIVERSOS", "municipio": "EXTERIOR/EX", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "COLETA MILKRUN EMBALAGENS (FABRICA)", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 18:57", "chegada_iso": "2026-07-13T18:57:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 717, "permanencia_min": null, "atraso_saida_min": null, "status": "Finalizado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CCM-030568", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375189, "aglutinador": "PED375189", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "JOINTECH (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "BM", "transportador": "JSL (TRIUNFO)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 0.0, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303500", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.7966666, "lng": -50.2316667}, {"pedido": 375190, "aglutinador": "PED375190", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "** DIVERSOS", "municipio": "EXTERIOR/EX", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "COLETA MILKRUN EMBALAGENS (FABRICA)", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:38", "chegada_iso": "2026-07-13T13:38:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 398, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "CCM-030575", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375191, "aglutinador": "PED375191", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "** DIVERSOS", "municipio": "EXTERIOR/EX", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "COLETA MILKRUN EMBALAGENS (FABRICA)", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:50", "chegada_iso": "2026-07-13T15:50:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 530, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "CCM-030569", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375192, "aglutinador": "PED375192", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "** DIVERSOS", "municipio": "EXTERIOR/EX", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "COLETA MILKRUN EMBALAGENS (FABRICA)", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:18", "chegada_iso": "2026-07-13T16:18:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 558, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 8, "tem_nf": true, "ge": "CCM-030570", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375194, "aglutinador": "PED375194", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "** DIVERSOS", "municipio": "EXTERIOR/EX", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "COLETA MILKRUN EMBALAGENS (FABRICA)", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 18:58", "chegada_iso": "2026-07-13T18:58:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 718, "permanencia_min": null, "atraso_saida_min": null, "status": "Finalizado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CCM-030571", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375195, "aglutinador": "PED375195", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "** DIVERSOS", "municipio": "EXTERIOR/EX", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "COLETA MILKRUN EMBALAGENS (FABRICA)", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 19:00", "chegada_iso": "2026-07-13T19:00:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 720, "permanencia_min": null, "atraso_saida_min": null, "status": "Finalizado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CCM-030572", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375196, "aglutinador": "PED375196", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "** DIVERSOS", "municipio": "EXTERIOR/EX", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "COLETA MILKRUN EMBALAGENS (FABRICA)", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:10", "chegada_iso": "2026-07-13T15:10:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 490, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "CCM-030573", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375197, "aglutinador": "PED375197", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "RESIPLASTIC (MONTENEGRO)", "municipio": "MONTENEGRO/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:53", "chegada_iso": "2026-07-13T11:53:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 293, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "CCM-030574", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375226, "aglutinador": "PED375226", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "OGNIBENE (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:12", "chegada_iso": "2026-07-13T16:12:01", "saida_origem": "13/07 17:49", "saida_iso": "2026-07-13T17:49:00", "atraso_chegada_min": 972, "permanencia_min": 97, "atraso_saida_min": 1069, "status": "Iniciado", "tempo_h": 11.0, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "CSL-532400", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.8621, "lng": -51.4333}, {"pedido": 375230, "aglutinador": "PED375230", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "ETHOS IND (BOITUVA)", "municipio": "BOITUVA/SP", "planta": "BZ", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 08:30", "janela_iso": "2026-07-13T08:30:00", "janela_data": "2026-07-13", "chegada_origem": "10/07 09:02", "chegada_iso": "2026-07-10T09:02:01", "saida_origem": "10/07 09:04", "saida_iso": "2026-07-10T09:04:01", "atraso_chegada_min": -4288, "permanencia_min": 2, "atraso_saida_min": -4286, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "MATRIZ-18028", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375231, "aglutinador": "PED375231", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "BUZIN (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BZ", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 10:30", "janela_iso": "2026-07-13T10:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:00", "chegada_iso": "2026-07-13T11:00:01", "saida_origem": "13/07 11:53", "saida_iso": "2026-07-13T11:53:01", "atraso_chegada_min": 30, "permanencia_min": 53, "atraso_saida_min": 83, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "MATRIZ-26018", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375232, "aglutinador": "PED375232", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "PARKER (DIADEMA)", "municipio": "DIADEMA/SP", "planta": "BZ", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 11:30", "janela_iso": "2026-07-13T11:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:00", "chegada_iso": "2026-07-13T14:00:01", "saida_origem": "13/07 14:23", "saida_iso": "2026-07-13T14:23:01", "atraso_chegada_min": 150, "permanencia_min": 23, "atraso_saida_min": 173, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "MATRIZ-18029", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375233, "aglutinador": "PED375233", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "LTM (BOTUCATU)", "municipio": "BOTUCATU/SP", "planta": "PDC", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:28", "chegada_iso": "2026-07-13T14:28:01", "saida_origem": "13/07 14:31", "saida_iso": "2026-07-13T14:31:01", "atraso_chegada_min": 88, "permanencia_min": 3, "atraso_saida_min": 91, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "MATRIZ-18030", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375235, "aglutinador": "PED375235", "veiculo_aglutinado": "CARRETA ABERTA", "fornecedor": "ABA LOG (PIEDADE)", "municipio": "PIEDADE/SP", "planta": "BZ", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "14/07 08:00", "janela_iso": "2026-07-14T08:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "MATRIZ-18031", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375236, "aglutinador": "PED375236", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "VEXILOM (CURITIBA)", "municipio": "CURITIBA/PR", "planta": "BZ", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 17:00", "janela_iso": "2026-07-13T17:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:00", "chegada_iso": "2026-07-13T16:00:01", "saida_origem": "13/07 16:35", "saida_iso": "2026-07-13T16:35:01", "atraso_chegada_min": -60, "permanencia_min": 35, "atraso_saida_min": -25, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "MATRIZ-26019", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375237, "aglutinador": "PED375237", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "PARKER (DIADEMA)", "municipio": "DIADEMA/SP", "planta": "NW", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 14:30", "janela_iso": "2026-07-13T14:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:10", "chegada_iso": "2026-07-13T13:10:01", "saida_origem": "13/07 14:05", "saida_iso": "2026-07-13T14:05:01", "atraso_chegada_min": -80, "permanencia_min": 55, "atraso_saida_min": -25, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "MATRIZ-26020", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375238, "aglutinador": "PED375238", "veiculo_aglutinado": "3/4", "fornecedor": "METHAL COMPANY (CURITIBA)", "municipio": "FAZENDA RIO GRANDE/PR", "planta": "NW", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 08:30", "janela_iso": "2026-07-13T08:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:44", "chegada_iso": "2026-07-13T10:44:01", "saida_origem": "13/07 12:42", "saida_iso": "2026-07-13T12:42:01", "atraso_chegada_min": 134, "permanencia_min": 118, "atraso_saida_min": 252, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "MATRIZ-18032", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375242, "aglutinador": "PED375242", "veiculo_aglutinado": "RODOTREM LIGHT", "fornecedor": "QUICKE (GUARANESIA)", "municipio": "GUARANESIA/MG", "planta": "BZ", "transportador": "JSL (BETIM)", "modal": "FTL EXTRA", "janela": "13/07 23:00", "janela_iso": "2026-07-13T23:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 7.43, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26302703", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -21.7193779, "lng": -47.0805796}, {"pedido": 375243, "aglutinador": "PED375243", "veiculo_aglutinado": "3/4 ABERTO", "fornecedor": "FRONIOUS (SAO BERNARDO DO CAMP", "municipio": "SAO BERNARDO DO CAMPO/SP", "planta": "NW", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 12:30", "janela_iso": "2026-07-13T12:30:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": "13/07 14:35", "saida_iso": "2026-07-13T14:35:01", "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": 125, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "MATRIZ-18034", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375248, "aglutinador": "PED375248", "veiculo_aglutinado": "3/4", "fornecedor": "ALLIS ROLLER HCC (CURITIBA)", "municipio": "CURITIBA/PR", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN EXTRA", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375249, "aglutinador": "PED375249", "veiculo_aglutinado": "AÉREO", "fornecedor": "SABO (MOGI-MIRIM)", "municipio": "MOGI MIRIM/SP", "planta": "BM", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:00", "chegada_iso": "2026-07-13T13:00:01", "saida_origem": "13/07 14:43", "saida_iso": "2026-07-13T14:43:01", "atraso_chegada_min": 0, "permanencia_min": 103, "atraso_saida_min": 103, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "MATRIZ-18033", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375250, "aglutinador": "PED375250", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "RODAROS (VACARIA)", "municipio": "VACARIA/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "14/07 18:00", "janela_iso": "2026-07-14T18:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375251, "aglutinador": "PED375251", "veiculo_aglutinado": "AÉREO", "fornecedor": "JOHN DEERE SAPDC (CAMPINAS)", "municipio": "CAMPINAS/SP", "planta": "BM", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:10", "chegada_iso": "2026-07-13T13:10:01", "saida_origem": "13/07 14:30", "saida_iso": "2026-07-13T14:30:01", "atraso_chegada_min": 10, "permanencia_min": 80, "atraso_saida_min": 90, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "MATRIZ-26021", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375262, "aglutinador": "PED375262", "veiculo_aglutinado": "RODOTREM SIDER", "fornecedor": "** DIVERSOS", "municipio": "EXTERIOR/EX", "planta": "NW", "transportador": "MIRASSOL (CATALAO)", "modal": "COLETA MILKRUN EMBALAGENS (FABRICA)", "janela": "14/07 07:00", "janela_iso": "2026-07-14T07:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375263, "aglutinador": "PED375263", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "CCS (LIMEIRA)", "municipio": "LIMEIRA/SP", "planta": "NW", "transportador": "MIRASSOL (CATALAO)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 07:00", "janela_iso": "2026-07-14T07:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375264, "aglutinador": "PED375264", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "** DIVERSOS", "municipio": "EXTERIOR/EX", "planta": "NW", "transportador": "MIRASSOL (CATALAO)", "modal": "COLETA MILKRUN EMBALAGENS (FABRICA)", "janela": "14/07 07:00", "janela_iso": "2026-07-14T07:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375265, "aglutinador": "PED375265", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "IOCHPE MAX (CRUZEIRO)", "municipio": "CRUZEIRO/SP", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CCM-030576", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375271, "aglutinador": "PED375271", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "IOCHPE MAX (CRUZEIRO)", "municipio": "CRUZEIRO/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "FTL EXTRA", "janela": "14/07 21:00", "janela_iso": "2026-07-14T21:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.23, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CCO-013058", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.4842, "lng": -46.7857}, {"pedido": 375291, "aglutinador": "PED375291", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "SKF (GARUVA)", "municipio": "GARUVA/SC", "planta": "PDC", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 14:30", "janela_iso": "2026-07-13T14:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:30", "chegada_iso": "2026-07-13T14:30:01", "saida_origem": "13/07 17:32", "saida_iso": "2026-07-13T17:32:01", "atraso_chegada_min": 0, "permanencia_min": 182, "atraso_saida_min": 182, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "MATRIZ-18035", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375292, "aglutinador": "PED375292", "veiculo_aglutinado": "VAN", "fornecedor": "PEDERTRACTOR (PEDERNEIRAS)", "municipio": "PEDERNEIRAS/SP", "planta": "PDC", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:10", "chegada_iso": "2026-07-13T17:10:01", "saida_origem": "13/07 18:30", "saida_iso": "2026-07-13T18:30:01", "atraso_chegada_min": 130, "permanencia_min": 80, "atraso_saida_min": 210, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "MATRIZ-26024", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375294, "aglutinador": "PED375294", "veiculo_aglutinado": "VAN", "fornecedor": "JOHN DEERE SAPDC (CAMPINAS)", "municipio": "CAMPINAS/SP", "planta": "BM", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 15:30", "janela_iso": "2026-07-13T15:30:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "MATRIZ-18036", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375295, "aglutinador": "PED375295", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "GATES (JACAREI-ST MARIA)", "municipio": "JACAREI/SP", "planta": "NW", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 16:30", "janela_iso": "2026-07-13T16:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:50", "chegada_iso": "2026-07-13T15:50:01", "saida_origem": "13/07 17:00", "saida_iso": "2026-07-13T17:00:01", "atraso_chegada_min": -40, "permanencia_min": 70, "atraso_saida_min": 30, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "MATRIZ-26025", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375296, "aglutinador": "PED375296", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "DEMORE (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "CQ", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 11:00", "janela_iso": "2026-07-13T11:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:43", "chegada_iso": "2026-07-13T14:43:01", "saida_origem": "13/07 14:57", "saida_iso": "2026-07-13T14:57:01", "atraso_chegada_min": 223, "permanencia_min": 14, "atraso_saida_min": 237, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "MATRIZ-26026", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375297, "aglutinador": "PED375297", "veiculo_aglutinado": "VAN", "fornecedor": "PPG (SUMARE)", "municipio": "SUMARE/SP", "planta": "NW", "transportador": "MIRASSOL (GUARULHOS)", "modal": "MILKRUN", "janela": "14/07 08:00", "janela_iso": "2026-07-14T08:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375298, "aglutinador": "PED375298", "veiculo_aglutinado": "3/4", "fornecedor": "HENNINGS (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "CQ", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:00", "chegada_iso": "2026-07-13T14:00:01", "saida_origem": "13/07 18:31", "saida_iso": "2026-07-13T18:31:01", "atraso_chegada_min": 0, "permanencia_min": 271, "atraso_saida_min": 271, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "MATRIZ-18037", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375299, "aglutinador": "PED375299", "veiculo_aglutinado": "3/4", "fornecedor": "ELETRONOR (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "CQ", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "14/07 08:00", "janela_iso": "2026-07-14T08:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.7, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532475", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.23989, "lng": -51.33359}, {"pedido": 375301, "aglutinador": "PED375301", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "TECNOMOLA (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "PDC", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:10", "chegada_iso": "2026-07-13T15:10:01", "saida_origem": "13/07 15:22", "saida_iso": "2026-07-13T15:22:01", "atraso_chegada_min": 130, "permanencia_min": 12, "atraso_saida_min": 142, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "MATRIZ-26027", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375302, "aglutinador": "PED375302", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "ELETRONOR (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "14/07 08:00", "janela_iso": "2026-07-14T08:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375385, "aglutinador": "PED375385", "veiculo_aglutinado": "3/4", "fornecedor": "UNIMIL (PIRACICABA-A.BENEDICTO)", "municipio": "PIRACICABA/SP", "planta": "NW", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 10:30", "janela_iso": "2026-07-13T10:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:10", "chegada_iso": "2026-07-13T14:10:01", "saida_origem": "13/07 15:48", "saida_iso": "2026-07-13T15:48:01", "atraso_chegada_min": 220, "permanencia_min": 98, "atraso_saida_min": 318, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "MATRIZ-18039", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375386, "aglutinador": "PED375386", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "AGOMAQ (BENTO GONCALVES)", "municipio": "BENTO GONCALVES/RS", "planta": "BZ", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "14/07 07:00", "janela_iso": "2026-07-14T07:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "MATRIZ-18040", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375387, "aglutinador": "PED375387", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "METAL ONE (CAPIVARI)", "municipio": "CAPIVARI/SP", "planta": "BZ", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 15:20", "janela_iso": "2026-07-13T15:20:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": "13/07 16:13", "saida_iso": "2026-07-13T16:13:01", "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": 53, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "MATRIZ-18041", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375389, "aglutinador": "PED375389", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "GENERAL COAT (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:08", "chegada_iso": "2026-07-13T15:08:01", "saida_origem": "13/07 15:15", "saida_iso": "2026-07-13T15:15:01", "atraso_chegada_min": 128, "permanencia_min": 7, "atraso_saida_min": 135, "status": "Finalizado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "MATRIZ-26029", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375391, "aglutinador": "PED375391", "veiculo_aglutinado": "TOCO", "fornecedor": "JOHN DEERE SAPDC (CAMPINAS)", "municipio": "CAMPINAS/SP", "planta": "NW", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "MATRIZ-18042", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375392, "aglutinador": "PED375392", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "APTIV (PARAISOPOLIS)", "municipio": "PARAISOPOLIS/MG", "planta": "NW", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 23:00", "janela_iso": "2026-07-13T23:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "MATRIZ-26031", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375393, "aglutinador": "PED375393", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "HOHL (GOIANIA)", "municipio": "GOIANIA/GO", "planta": "NW", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:40", "chegada_iso": "2026-07-13T16:40:01", "saida_origem": "13/07 16:50", "saida_iso": "2026-07-13T16:50:01", "atraso_chegada_min": 160, "permanencia_min": 10, "atraso_saida_min": 170, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "MATRIZ-26032", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375394, "aglutinador": "PED375394", "veiculo_aglutinado": "AÉREO", "fornecedor": "PK CABLES (CAMPO ALEGRE)", "municipio": "CAMPO ALEGRE/SC", "planta": "NW", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:03", "chegada_iso": "2026-07-13T15:03:01", "saida_origem": "13/07 17:15", "saida_iso": "2026-07-13T17:15:01", "atraso_chegada_min": 3, "permanencia_min": 132, "atraso_saida_min": 135, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "MATRIZ-18043", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375395, "aglutinador": "PED375395", "veiculo_aglutinado": "VAN", "fornecedor": "DANFOSS (GUARATINGUETA)", "municipio": "GUARATINGUETA/SP", "planta": "BZ", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:00", "chegada_iso": "2026-07-13T17:00:01", "saida_origem": "13/07 18:00", "saida_iso": "2026-07-13T18:00:01", "atraso_chegada_min": 60, "permanencia_min": 60, "atraso_saida_min": 120, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "MATRIZ-26033", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375396, "aglutinador": "PED375396", "veiculo_aglutinado": "3/4", "fornecedor": "BRIDGESTONE (SANTO ANDRE)", "municipio": "SANTO ANDRE/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375397, "aglutinador": "PED375397", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "MIRASSOL (LOUVEIRA)", "municipio": "LOUVEIRA/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "COLETA MILKRUN EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375398, "aglutinador": "PED375398", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "MIRASSOL (MONTENEGRO)", "municipio": "MONTENEGRO/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "COLETA MILKRUN EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375399, "aglutinador": "PED375399", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "METHAL COMPANY (CURITIBA)", "municipio": "FAZENDA RIO GRANDE/PR", "planta": "BZ", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375400, "aglutinador": "PED375400", "veiculo_aglutinado": "RODOTREM LIGHT", "fornecedor": "QUICKE (GUARANESIA)", "municipio": "GUARANESIA/MG", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375401, "aglutinador": "PED375401", "veiculo_aglutinado": "TRUCK VAN", "fornecedor": "UNIMAK (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375402, "aglutinador": "PED375402", "veiculo_aglutinado": "VAN", "fornecedor": "TECNAUT (BOTUCATU)", "municipio": "BOTUCATU/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "14/07 07:00", "janela_iso": "2026-07-14T07:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.23, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "BAU-001198", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.48389, "lng": -46.78529}, {"pedido": 375403, "aglutinador": "PED375403", "veiculo_aglutinado": "TRUCK VAN", "fornecedor": "UNIMAK (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 2.57, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "JSL-VG26303470", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1119444, "lng": -47.2766667}, {"pedido": 375404, "aglutinador": "PED375404", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "UNIMAK (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375405, "aglutinador": "PED375405", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ITM LANDRONI (ATIBAIA)", "municipio": "ATIBAIA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375406, "aglutinador": "PED375406", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PAINCO (RIO DAS PEDRAS)", "municipio": "RIO DAS PEDRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375407, "aglutinador": "PED375407", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "RESIPLASTIC (MAUA)", "municipio": "MAUA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375408, "aglutinador": "PED375408", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "RESIPLASTIC (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375409, "aglutinador": "PED375409", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PEDERTRACTOR (PEDERNEIRAS)", "municipio": "PEDERNEIRAS/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375410, "aglutinador": "PED375410", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ALFAGOMMA (GUARANESIA)", "municipio": "GUARANESIA/MG", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375411, "aglutinador": "PED375411", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SIDERAL (CONCEICAO DO PARA)", "municipio": "CONCEICAO DO PARA/MG", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "COLETA FTL EMBALAGENS (FABRICA)", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375412, "aglutinador": "PED375412", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "JOHN DEERE C&F P1 (INDAIATUBA)", "municipio": "INDAIATUBA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "14/07 15:30", "janela_iso": "2026-07-14T15:30:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375413, "aglutinador": "PED375413", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "WOODTEC (GUARULHOS)", "municipio": "GUARULHOS/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375414, "aglutinador": "PED375414", "veiculo_aglutinado": "TOCO", "fornecedor": "CRONNOS (JUNDIAI)", "municipio": "JUNDIAI/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN EXTRA", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:04", "chegada_iso": "2026-07-13T13:04:55", "saida_origem": "13/07 14:34", "saida_iso": "2026-07-13T14:34:35", "atraso_chegada_min": 5, "permanencia_min": 90, "atraso_saida_min": 95, "status": "Finalizado", "tempo_h": 2.25, "ans": "Fora do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "38-75927-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1052789, "lng": -46.9713078}, {"pedido": 375416, "aglutinador": "PED375416", "veiculo_aglutinado": "3/4", "fornecedor": "FALLGATTER (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "NW", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 17:00", "janela_iso": "2026-07-13T17:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 19:30", "chegada_iso": "2026-07-13T19:30:01", "saida_origem": "13/07 20:10", "saida_iso": "2026-07-13T20:10:01", "atraso_chegada_min": 150, "permanencia_min": 40, "atraso_saida_min": 190, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "MATRIZ-26034", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375418, "aglutinador": "PED375418", "veiculo_aglutinado": "VAN", "fornecedor": "NELSON (ARAUCARIA)", "municipio": "ARAUCARIA/PR", "planta": "BZ", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375419, "aglutinador": "PED375419", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "FOTOGRAVURA ZEYANA (CAXIAS)", "municipio": "CAXIAS DO SUL/RS", "planta": "PDC", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "14/07 10:00", "janela_iso": "2026-07-14T10:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "MATRIZ-26035", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375420, "aglutinador": "PED375420", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "WURTH (SAO BERNARDO DO CAMPO)", "municipio": "SAO BERNARDO DO CAMPO/SP", "planta": "BZ", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "14/07 07:30", "janela_iso": "2026-07-14T07:30:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "MATRIZ-26036", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375421, "aglutinador": "PED375421", "veiculo_aglutinado": "VAN", "fornecedor": "LTM (BOTUCATU)", "municipio": "BOTUCATU/SP", "planta": "NW", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 17:30", "janela_iso": "2026-07-13T17:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 18:00", "chegada_iso": "2026-07-13T18:00:01", "saida_origem": "13/07 19:19", "saida_iso": "2026-07-13T19:19:01", "atraso_chegada_min": 30, "permanencia_min": 79, "atraso_saida_min": 109, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "MATRIZ-18045", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375422, "aglutinador": "PED375422", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "DATATECK (GUAIBA)", "municipio": "GUAIBA/RS", "planta": "NW", "transportador": "VF (IVOTI)", "modal": "EXPRESSO", "janela": "13/07 17:00", "janela_iso": "2026-07-13T17:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "MATRIZ-26037", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375423, "aglutinador": "PED375423", "veiculo_aglutinado": "AÉREO", "fornecedor": "JOHN DEERE SAPDC (CAMPINAS)", "municipio": "CAMPINAS/SP", "planta": "BM", "transportador": "ARMANI (CAMPINAS)", "modal": "EXPRESSO", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "MATRIZ-18046", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375163, "aglutinador": "SPO;QUA;15072026;81;32745;635", "veiculo_aglutinado": "TOCO", "fornecedor": "ELYTE (ENTRE IJUIS)", "municipio": "ENTRE-IJUIS/RS", "planta": "CQ", "transportador": "TW (HORIZONTINA)", "modal": "MILKRUN", "janela": "13/07 11:00", "janela_iso": "2026-07-13T11:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:31", "chegada_iso": "2026-07-13T11:31:01", "saida_origem": "13/07 14:53", "saida_iso": "2026-07-13T14:53:00", "atraso_chegada_min": 31, "permanencia_min": 202, "atraso_saida_min": 233, "status": "Iniciado", "tempo_h": 11.23, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "STO-006053", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.2757, "lng": -54.2429}, {"pedido": 374836, "aglutinador": "SPO;SEG;13072026;10;1", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PEDERTRACTOR (PEDERNEIRAS)", "municipio": "PEDERNEIRAS/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:05", "chegada_iso": "2026-07-13T15:05:49", "saida_origem": "13/07 16:00", "saida_iso": "2026-07-13T16:00:53", "atraso_chegada_min": 126, "permanencia_min": 55, "atraso_saida_min": 181, "status": "Iniciado", "tempo_h": 67.17, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "38-75942-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.680833, "lng": -47.310833}, {"pedido": 375091, "aglutinador": "SPO;SEG;13072026;11150;1", "veiculo_aglutinado": "CARRETA ABERTA", "fornecedor": "STEEL WAREHOUSE (PAULINIA)", "municipio": "PAULINIA/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN FF", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375152, "aglutinador": "SPO;SEG;13072026;115;3", "veiculo_aglutinado": "3/4", "fornecedor": "METISA (TIMBO)", "municipio": "TIMBO/SC", "planta": "PDC", "transportador": "MIRASSOL (TUBARAO)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:31", "chegada_iso": "2026-07-13T14:31:37", "saida_origem": "13/07 15:20", "saida_iso": "2026-07-13T15:20:01", "atraso_chegada_min": 92, "permanencia_min": 48, "atraso_saida_min": 140, "status": "Finalizado", "tempo_h": 51.98, "ans": "Fora do ANS", "qtde_nf": 8, "tem_nf": true, "ge": "24-12601-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.5752609, "lng": -49.1783244}, {"pedido": 375094, "aglutinador": "SPO;SEG;13072026;1319;1", "veiculo_aglutinado": "VAN", "fornecedor": "TE CONNECTIVITY (ITATIBA - SP)", "municipio": "ITATIBA/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 08:00", "janela_iso": "2026-07-13T08:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:55", "chegada_iso": "2026-07-13T10:55:11", "saida_origem": "13/07 11:03", "saida_iso": "2026-07-13T11:03:11", "atraso_chegada_min": 175, "permanencia_min": 8, "atraso_saida_min": 183, "status": "Finalizado", "tempo_h": 0.82, "ans": "Dentro do ANS", "qtde_nf": 5, "tem_nf": true, "ge": "38-75933-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1036644, "lng": -46.9713638}, {"pedido": 375129, "aglutinador": "SPO;SEG;13072026;1319;1", "veiculo_aglutinado": "VAN", "fornecedor": "TE CONNECTIVITY (ITATIBA - SP)", "municipio": "ITATIBA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 08:00", "janela_iso": "2026-07-13T08:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:55", "chegada_iso": "2026-07-13T10:55:11", "saida_origem": "13/07 11:03", "saida_iso": "2026-07-13T11:03:11", "atraso_chegada_min": 175, "permanencia_min": 8, "atraso_saida_min": 183, "status": "Finalizado", "tempo_h": 0.82, "ans": "Dentro do ANS", "qtde_nf": 5, "tem_nf": true, "ge": "38-75933-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.1036644, "lng": -46.9713638}, {"pedido": 375139, "aglutinador": "SPO;SEG;13072026;144;107;478", "veiculo_aglutinado": "VAN", "fornecedor": "URANO (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "PDC", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "13/07 11:00", "janela_iso": "2026-07-13T11:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:48", "chegada_iso": "2026-07-13T13:48:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 168, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 6.82, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "POA-607109", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -30.0949, "lng": -51.02778}, {"pedido": 375138, "aglutinador": "SPO;SEG;13072026;144;108;472", "veiculo_aglutinado": "TOCO", "fornecedor": "DYNAMICS (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:12", "chegada_iso": "2026-07-13T13:12:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 792, "permanencia_min": null, "atraso_saida_min": null, "status": "Finalizado", "tempo_h": 68.0, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "CSL-532332", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.1168, "lng": -51.13479}, {"pedido": 375132, "aglutinador": "SPO;SEG;13072026;144;20380;472", "veiculo_aglutinado": "3/4", "fornecedor": "OMT (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 11:00", "janela_iso": "2026-07-13T11:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 12:29", "chegada_iso": "2026-07-13T12:29:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 89, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 76.12, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "CSL-532334", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -26.91009, "lng": -48.94819}, {"pedido": 375147, "aglutinador": "SPO;SEG;13072026;144;20;473", "veiculo_aglutinado": "VAN", "fornecedor": "NELSON DO BRASIL (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "PDC", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:16", "chegada_iso": "2026-07-13T14:16:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -104, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 6.7, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "STA-043854", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -27.7817, "lng": -54.26019}, {"pedido": 375146, "aglutinador": "SPO;SEG;13072026;144;24;472", "veiculo_aglutinado": "3/4", "fornecedor": "TRAVI PLASTICOS (CAXIAS DO SUL-R BRANCO)", "municipio": "CAXIAS DO SUL/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.58, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532329", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.11349, "lng": -51.1734}, {"pedido": 375144, "aglutinador": "SPO;SEG;13072026;144;39;472", "veiculo_aglutinado": "TOCO", "fornecedor": "FOTOGRAVURA ZEYANA (CAXIAS)", "municipio": "CAXIAS DO SUL/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 12:50", "chegada_iso": "2026-07-13T12:50:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 770, "permanencia_min": null, "atraso_saida_min": null, "status": "Finalizado", "tempo_h": 67.88, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532330", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.1168, "lng": -51.13479}, {"pedido": 374858, "aglutinador": "SPO;SEG;13072026;144;479;478", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SCHUMACHER (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "PDC", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:06", "chegada_iso": "2026-07-13T14:06:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 246, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 6.82, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "POA-607116", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -30.0949, "lng": -51.02778}, {"pedido": 375142, "aglutinador": "SPO;SEG;13072026;144;52;473", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "FRATELLI (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "PDC", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 07:30", "janela_iso": "2026-07-13T07:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:20", "chegada_iso": "2026-07-13T14:20:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 410, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.23, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "STA-043855", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -27.7817, "lng": -54.26019}, {"pedido": 375135, "aglutinador": "SPO;SEG;13072026;144;928;472", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ESPUMATEC COMP  (CAXIAS SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:21", "chegada_iso": "2026-07-13T11:21:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 81, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.23, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "CSL-532333", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.8621, "lng": -51.4333}, {"pedido": 375155, "aglutinador": "SPO;SEG;13072026;144;9;473", "veiculo_aglutinado": "TOCO", "fornecedor": "JAMA (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "PDC", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:03", "chegada_iso": "2026-07-13T13:03:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -117, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.23, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "STA-043852", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -27.7817, "lng": -54.26019}, {"pedido": 374581, "aglutinador": "SPO;SEG;13072026;157;1", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "AUKZZO (ITAQUAQUECETUBA)", "municipio": "ITAQUAQUECETUBA/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 18:00", "janela_iso": "2026-07-13T18:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 18:52", "chegada_iso": "2026-07-13T18:52:11", "saida_origem": "13/07 19:48", "saida_iso": "2026-07-13T19:48:16", "atraso_chegada_min": 52, "permanencia_min": 56, "atraso_saida_min": 108, "status": "Iniciado", "tempo_h": 69.18, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "38-75945-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.4220788, "lng": -46.3824708}, {"pedido": 375100, "aglutinador": "SPO;SEG;13072026;157;1", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "GRANEI (GUARULHOS)", "municipio": "GUARULHOS/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 23:00", "janela_iso": "2026-07-13T23:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 69.18, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "38-75945-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.4220788, "lng": -46.3824708}, {"pedido": 375109, "aglutinador": "SPO;SEG;13072026;157;1", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "MODINE (GUARULHOS)", "municipio": "GUARULHOS/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN FF", "janela": "13/07 20:30", "janela_iso": "2026-07-13T20:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 20:44", "chegada_iso": "2026-07-13T20:44:46", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 15, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 69.18, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "38-75945-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.4220788, "lng": -46.3824708}, {"pedido": 375127, "aglutinador": "SPO;SEG;13072026;15;1", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "PLAXTEX (MOGI DAS CRUZES)", "municipio": "MOGI DAS CRUZES/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 10:30", "janela_iso": "2026-07-13T10:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 08:16", "chegada_iso": "2026-07-13T08:16:56", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -133, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 65.75, "ans": "Fora do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "38-75935-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.0963, "lng": -46.9681}, {"pedido": 375026, "aglutinador": "SPO;SEG;13072026;2649;1", "veiculo_aglutinado": "TOCO", "fornecedor": "MAHLE (MOGI-GUACU)", "municipio": "ARUJA/SP", "planta": "BZ", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN FF", "janela": "13/07 21:00", "janela_iso": "2026-07-13T21:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 20:47", "chegada_iso": "2026-07-13T20:47:23", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -13, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 6.43, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-75928-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.3994544, "lng": -46.3069337}, {"pedido": 375093, "aglutinador": "SPO;SEG;13072026;2744;3", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "TIMKEN (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "NW", "transportador": "MIRASSOL (TUBARAO)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:44", "chegada_iso": "2026-07-13T10:44:42", "saida_origem": "13/07 11:44", "saida_iso": "2026-07-13T11:44:12", "atraso_chegada_min": -135, "permanencia_min": 60, "atraso_saida_min": -76, "status": "Finalizado", "tempo_h": 51.98, "ans": "Fora do ANS", "qtde_nf": 8, "tem_nf": true, "ge": "24-12601-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.5752609, "lng": -49.1783244}, {"pedido": 375136, "aglutinador": "SPO;SEG;13072026;282;3", "veiculo_aglutinado": "VAN", "fornecedor": "MOLAS BRUSQUE (BRUSQUE)", "municipio": "BRUSQUE/SC", "planta": "PDC", "transportador": "MIRASSOL (TUBARAO)", "modal": "MILKRUN", "janela": "13/07 08:00", "janela_iso": "2026-07-13T08:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:57", "chegada_iso": "2026-07-13T10:57:24", "saida_origem": "13/07 11:07", "saida_iso": "2026-07-13T11:07:32", "atraso_chegada_min": 177, "permanencia_min": 10, "atraso_saida_min": 188, "status": "Iniciado", "tempo_h": 12.07, "ans": "Fora do ANS", "qtde_nf": 12, "tem_nf": true, "ge": "24-12602-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.827404, "lng": -49.126755}, {"pedido": 374852, "aglutinador": "SPO;SEG;13072026;288;1062", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "SINUELO (CURITIBA)", "municipio": "CURITIBA/PR", "planta": "BZ", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:15", "chegada_iso": "2026-07-13T10:15:42", "saida_origem": "13/07 10:31", "saida_iso": "2026-07-13T10:31:11", "atraso_chegada_min": -164, "permanencia_min": 15, "atraso_saida_min": -149, "status": "Finalizado", "tempo_h": 1.78, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "30-10438-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.4323277, "lng": -49.345255}, {"pedido": 375118, "aglutinador": "SPO;SEG;13072026;30;2", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ALFAGOMMA (GUARANESIA)", "municipio": "GUARANESIA/MG", "planta": "CQ", "transportador": "MIRASSOL (UBERABA)", "modal": "MILKRUN", "janela": "13/07 22:00", "janela_iso": "2026-07-13T22:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 18:04", "chegada_iso": "2026-07-13T18:04:49", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -235, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 5.28, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "19-3888-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -21.294067, "lng": -46.792281}, {"pedido": 375120, "aglutinador": "SPO;SEG;13072026;30;2", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ALFAGOMMA (GUARANESIA)", "municipio": "GUARANESIA/MG", "planta": "BM", "transportador": "MIRASSOL (UBERABA)", "modal": "MILKRUN", "janela": "13/07 22:00", "janela_iso": "2026-07-13T22:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 18:04", "chegada_iso": "2026-07-13T18:04:49", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -235, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 5.28, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "19-3888-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -21.294067, "lng": -46.792281}, {"pedido": 375119, "aglutinador": "SPO;SEG;13072026;31;1062", "veiculo_aglutinado": "TOCO", "fornecedor": "MAGIUS (SJ PINHAIS)", "municipio": "SAO JOSE DOS PINHAIS/PR", "planta": "NW", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "MILKRUN", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 19:03", "chegada_iso": "2026-07-13T19:03:51", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 184, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 61.03, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "30-10439-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.5749, "lng": -49.1784}, {"pedido": 375082, "aglutinador": "SPO;SEG;13072026;32859;1", "veiculo_aglutinado": "3/4", "fornecedor": "PLASOLUTION (M CRUZES)", "municipio": "MOGI DAS CRUZES/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 13:00", "janela_iso": "2026-07-13T13:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:32", "chegada_iso": "2026-07-13T10:32:18", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -148, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 67.62, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "38-75939-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.100532, "lng": -46.969017}, {"pedido": 374796, "aglutinador": "SPO;SEG;13072026;34;12682", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "REQUIPH HIDR (PIRACICABA)", "municipio": "PIRACICABA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "13/07 20:00", "janela_iso": "2026-07-13T20:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375079, "aglutinador": "SPO;SEG;13072026;52263;1", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "DANFOSS (GUARATINGUETA)", "municipio": "GUARATINGUETA/SP", "planta": "NW", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 18:00", "janela_iso": "2026-07-13T18:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375149, "aglutinador": "SPO;SEG;13072026;52263;1", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "DANFOSS (GUARATINGUETA)", "municipio": "GUARATINGUETA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "MILKRUN", "janela": "13/07 18:00", "janela_iso": "2026-07-13T18:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375077, "aglutinador": "SPO;SEG;13072026;54979;3", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "CASTERTECH (SCHROEDER)", "municipio": "SCHROEDER/SC", "planta": "NW", "transportador": "MIRASSOL (TUBARAO)", "modal": "MILKRUN", "janela": "13/07 20:00", "janela_iso": "2026-07-13T20:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:20", "chegada_iso": "2026-07-13T14:20:46", "saida_origem": "13/07 14:58", "saida_iso": "2026-07-13T14:58:25", "atraso_chegada_min": -339, "permanencia_min": 38, "atraso_saida_min": -302, "status": "Iniciado", "tempo_h": 12.07, "ans": "Fora do ANS", "qtde_nf": 12, "tem_nf": true, "ge": "24-12602-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.827404, "lng": -49.126755}, {"pedido": 375151, "aglutinador": "SPO;SEG;13072026;54979;3", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "CASTERTECH (SCHROEDER)", "municipio": "SCHROEDER/SC", "planta": "PDC", "transportador": "MIRASSOL (TUBARAO)", "modal": "MILKRUN", "janela": "13/07 20:00", "janela_iso": "2026-07-13T20:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:20", "chegada_iso": "2026-07-13T14:20:46", "saida_origem": "13/07 14:58", "saida_iso": "2026-07-13T14:58:25", "atraso_chegada_min": -339, "permanencia_min": 38, "atraso_saida_min": -302, "status": "Iniciado", "tempo_h": 12.07, "ans": "Fora do ANS", "qtde_nf": 12, "tem_nf": true, "ge": "24-12602-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.827404, "lng": -49.126755}, {"pedido": 374785, "aglutinador": "SPO;SEG;13072026;54;1592", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "BRUNING (PANAMBI)", "municipio": "PANAMBI/RS", "planta": "CQ", "transportador": "MODULAR (CANOAS)", "modal": "FTL", "janela": "13/07 18:00", "janela_iso": "2026-07-13T18:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375040, "aglutinador": "SPO;SEG;13072026;81;1053;409", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "PARKER (DIADEMA)", "municipio": "DIADEMA/SP", "planta": "CQ", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 13:30", "janela_iso": "2026-07-13T13:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:44", "chegada_iso": "2026-07-13T14:44:01", "saida_origem": "13/07 14:44", "saida_iso": "2026-07-13T14:44:00", "atraso_chegada_min": 74, "permanencia_min": 0, "atraso_saida_min": 74, "status": "Finalizado", "tempo_h": 67.57, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "OSC-654044", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.484157, "lng": -46.785228}, {"pedido": 375028, "aglutinador": "SPO;SEG;13072026;81;105;473", "veiculo_aglutinado": "VAN", "fornecedor": "ARLINDO (SELBACH)", "municipio": "SELBACH/RS", "planta": "CQ", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:14", "chegada_iso": "2026-07-13T10:14:01", "saida_origem": "13/07 10:32", "saida_iso": "2026-07-13T10:32:00", "atraso_chegada_min": 74, "permanencia_min": 18, "atraso_saida_min": 92, "status": "Finalizado", "tempo_h": 71.97, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "TAP-003806", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.282058, "lng": -52.76515}, {"pedido": 375061, "aglutinador": "SPO;SEG;13072026;81;115;614", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "METISA (TIMBO)", "municipio": "TIMBO/SC", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375058, "aglutinador": "SPO;SEG;13072026;81;133;472", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "FORBAL (FLORES DA CUNHA)", "municipio": "FLORES DA CUNHA/RS", "planta": "CQ", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 09:00", "janela_iso": "2026-07-13T09:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:36", "chegada_iso": "2026-07-13T14:36:01", "saida_origem": "13/07 14:36", "saida_iso": "2026-07-13T14:36:00", "atraso_chegada_min": 336, "permanencia_min": 0, "atraso_saida_min": 336, "status": "Iniciado", "tempo_h": 77.33, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "CSL-532343", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.2399, "lng": -51.3336}, {"pedido": 375036, "aglutinador": "SPO;SEG;13072026;81;13499;409", "veiculo_aglutinado": "3/4", "fornecedor": "HENNINGS (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "CQ", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:48", "chegada_iso": "2026-07-13T15:48:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 48, "permanencia_min": null, "atraso_saida_min": null, "status": "Finalizado", "tempo_h": 3.98, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "OSC-654045", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.484157, "lng": -46.785228}, {"pedido": 375035, "aglutinador": "SPO;SEG;13072026;81;13582;409", "veiculo_aglutinado": "VAN", "fornecedor": "HYDAC (INDAIATUBA)", "municipio": "INDAIATUBA/SP", "planta": "CQ", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:24", "chegada_iso": "2026-07-13T14:24:01", "saida_origem": "13/07 15:06", "saida_iso": "2026-07-13T15:06:00", "atraso_chegada_min": 24, "permanencia_min": 42, "atraso_saida_min": 66, "status": "Iniciado", "tempo_h": 73.23, "ans": "Dentro do ANS", "qtde_nf": 7, "tem_nf": true, "ge": "CMP-187572", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.9839, "lng": -47.1118}, {"pedido": 375056, "aglutinador": "SPO;SEG;13072026;81;149;614", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "JOINTECH (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:49", "chegada_iso": "2026-07-13T10:49:01", "saida_origem": "13/07 10:49", "saida_iso": "2026-07-13T10:49:00", "atraso_chegada_min": 649, "permanencia_min": 0, "atraso_saida_min": 649, "status": "Iniciado", "tempo_h": 12.23, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "JOI-043922", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -26.9332, "lng": -48.701}, {"pedido": 375055, "aglutinador": "SPO;SEG;13072026;81;156;614", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "BELLOTA (INDAIAL)", "municipio": "INDAIAL/SC", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:40", "chegada_iso": "2026-07-13T14:40:01", "saida_origem": "13/07 15:33", "saida_iso": "2026-07-13T15:33:00", "atraso_chegada_min": 880, "permanencia_min": 53, "atraso_saida_min": 933, "status": "Finalizado", "tempo_h": 13.1, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "BLU-183792", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -26.8722, "lng": -49.100359}, {"pedido": 375034, "aglutinador": "SPO;SEG;13072026;81;20380;472", "veiculo_aglutinado": "VAN", "fornecedor": "OMT (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "CQ", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 11:00", "janela_iso": "2026-07-13T11:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 12:16", "chegada_iso": "2026-07-13T12:16:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 76, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 77.33, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "CSL-532347", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.2399, "lng": -51.3336}, {"pedido": 374857, "aglutinador": "SPO;SEG;13072026;81;21;409", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "GOLIN (GUARULHOS)", "municipio": "GUARULHOS/SP", "planta": "CQ", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN FF", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:16", "chegada_iso": "2026-07-13T16:16:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 376, "permanencia_min": null, "atraso_saida_min": null, "status": "Finalizado", "tempo_h": 8.82, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "OSC-654053", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.287, "lng": -45.9556}, {"pedido": 375052, "aglutinador": "SPO;SEG;13072026;81;250;409", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "WIPRO (PIRACICABA)", "municipio": "PIRACICABA/SP", "planta": "CQ", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 18:43", "chegada_iso": "2026-07-13T18:43:01", "saida_origem": "13/07 19:39", "saida_iso": "2026-07-13T19:39:00", "atraso_chegada_min": 1123, "permanencia_min": 56, "atraso_saida_min": 1179, "status": "Iniciado", "tempo_h": 73.23, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "CMP-187571", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.9839, "lng": -47.1118}, {"pedido": 375122, "aglutinador": "SPO;SEG;13072026;81;26;635", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "MONRIZZO (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "CQ", "transportador": "TW (HORIZONTINA)", "modal": "MILKRUN", "janela": "13/07 07:30", "janela_iso": "2026-07-13T07:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 08:01", "chegada_iso": "2026-07-13T08:01:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 31, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 8.33, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "STA-043857", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.05379, "lng": -52.8718}, {"pedido": 375037, "aglutinador": "SPO;SEG;13072026;81;2744;614", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "TIMKEN (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:57", "chegada_iso": "2026-07-13T14:57:01", "saida_origem": "13/07 15:35", "saida_iso": "2026-07-13T15:35:00", "atraso_chegada_min": 897, "permanencia_min": 38, "atraso_saida_min": 935, "status": "Iniciado", "tempo_h": 12.23, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "JOI-043925", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -26.4274, "lng": -48.8271}, {"pedido": 375051, "aglutinador": "SPO;SEG;13072026;81;282;614", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "MOLAS BRUSQUE (BRUSQUE)", "municipio": "BRUSQUE/SC", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 09:32", "chegada_iso": "2026-07-13T09:32:01", "saida_origem": "13/07 15:22", "saida_iso": "2026-07-13T15:22:00", "atraso_chegada_min": 572, "permanencia_min": 350, "atraso_saida_min": 922, "status": "Iniciado", "tempo_h": 12.23, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "BRQ-005067", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -26.9332, "lng": -48.701}, {"pedido": 374851, "aglutinador": "SPO;SEG;13072026;81;288;614", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "SINUELO (CURITIBA)", "municipio": "CURITIBA/PR", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375115, "aglutinador": "SPO;SEG;13072026;81;34;409", "veiculo_aglutinado": "VAN", "fornecedor": "REQUIPH HIDR (PIRACICABA)", "municipio": "PIRACICABA/SP", "planta": "CQ", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 18:00", "janela_iso": "2026-07-13T18:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:48", "chegada_iso": "2026-07-13T17:48:01", "saida_origem": "13/07 18:43", "saida_iso": "2026-07-13T18:43:00", "atraso_chegada_min": -12, "permanencia_min": 55, "atraso_saida_min": 43, "status": "Iniciado", "tempo_h": 73.23, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "CMP-187569", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.9839, "lng": -47.1118}, {"pedido": 375114, "aglutinador": "SPO;SEG;13072026;81;35;614", "veiculo_aglutinado": "VAN", "fornecedor": "NELSON (ARAUCARIA)", "municipio": "ARAUCARIA/PR", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 12.23, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CTA-236913", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.5849, "lng": -49.3164}, {"pedido": 375098, "aglutinador": "SPO;SEG;13072026;81;52;635", "veiculo_aglutinado": "3/4", "fornecedor": "FRATELLI (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "CQ", "transportador": "TW (HORIZONTINA)", "modal": "MILKRUN", "janela": "13/07 07:30", "janela_iso": "2026-07-13T07:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:23", "chegada_iso": "2026-07-13T10:23:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 173, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 8.33, "ans": "Fora do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "STA-043859", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.05379, "lng": -52.8718}, {"pedido": 375087, "aglutinador": "SPO;SEG;13072026;81;56;472", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "OGNIBENE (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "CQ", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:50", "chegada_iso": "2026-07-13T17:50:01", "saida_origem": "13/07 17:50", "saida_iso": "2026-07-13T17:50:00", "atraso_chegada_min": 1070, "permanencia_min": 0, "atraso_saida_min": 1070, "status": "Iniciado", "tempo_h": 75.88, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "CSL-532338", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.1135, "lng": -51.1734}, {"pedido": 375085, "aglutinador": "SPO;SEG;13072026;81;65;614", "veiculo_aglutinado": "VAN", "fornecedor": "USICAST (SAO JOSE)", "municipio": "SAO JOSE/SC", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 19:52", "chegada_iso": "2026-07-13T19:52:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 1192, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 12.23, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "FLP-009395", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -27.5982, "lng": -48.6763}, {"pedido": 375083, "aglutinador": "SPO;SEG;13072026;81;66;472", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "HIDROVER (FLORES DA CUNHA)", "municipio": "FLORES DA CUNHA/RS", "planta": "CQ", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:24", "chegada_iso": "2026-07-13T16:24:01", "saida_origem": "13/07 16:27", "saida_iso": "2026-07-13T16:27:00", "atraso_chegada_min": 384, "permanencia_min": 3, "atraso_saida_min": 387, "status": "Iniciado", "tempo_h": 77.33, "ans": "Fora do ANS", "qtde_nf": 11, "tem_nf": true, "ge": "CSL-532339", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.2399, "lng": -51.3336}, {"pedido": 375075, "aglutinador": "SPO;SEG;13072026;81;68;472", "veiculo_aglutinado": "VAN", "fornecedor": "CASTERTECH USINAGEM (CAXIAS)", "municipio": "CAXIAS DO SUL/RS", "planta": "CQ", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 15:35", "chegada_iso": "2026-07-13T15:35:01", "saida_origem": "13/07 16:29", "saida_iso": "2026-07-13T16:29:00", "atraso_chegada_min": 35, "permanencia_min": 54, "atraso_saida_min": 89, "status": "Finalizado", "tempo_h": 72.62, "ans": "Dentro do ANS", "qtde_nf": 8, "tem_nf": true, "ge": "CSL-532341", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.11525, "lng": -51.173635}, {"pedido": 375073, "aglutinador": "SPO;SEG;13072026;81;82;473", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "INDUTAR (IBIRUBA)", "municipio": "IBIRUBA/RS", "planta": "CQ", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 10:49", "chegada_iso": "2026-07-13T10:49:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -311, "permanencia_min": null, "atraso_saida_min": null, "status": "Finalizado", "tempo_h": 71.97, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "IBI-004140", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.28205, "lng": -52.76514}, {"pedido": 374779, "aglutinador": "SPO;SEG;13072026;81;86;635", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "FUNDIMISA (SANTO ANGELO)", "municipio": "SANTO ANGELO/RS", "planta": "CQ", "transportador": "TW (HORIZONTINA)", "modal": "FTL", "janela": "13/07 08:00", "janela_iso": "2026-07-13T08:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375071, "aglutinador": "SPO;SEG;13072026;81;87;478", "veiculo_aglutinado": "3/4", "fornecedor": "PRINTSTORE (PORTO ALEGRE)", "municipio": "PORTO ALEGRE/RS", "planta": "CQ", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN FF", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:49", "chegada_iso": "2026-07-13T14:49:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 889, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.58, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "POA-607112", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.80969, "lng": -51.5054}, {"pedido": 375044, "aglutinador": "SPO;SEG;13072026;81;898;409", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "OPTIBELT (HORTOLANDIA)", "municipio": "HORTOLANDIA/SP", "planta": "CQ", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:49", "chegada_iso": "2026-07-13T11:49:01", "saida_origem": "13/07 12:03", "saida_iso": "2026-07-13T12:03:00", "atraso_chegada_min": 709, "permanencia_min": 14, "atraso_saida_min": 723, "status": "Iniciado", "tempo_h": 73.23, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "CCO-013055", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -22.9839, "lng": -47.1118}, {"pedido": 375030, "aglutinador": "SPO;SEG;13072026;81;95;472", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "MAQUINAS SAZI (FARROUPILHA)", "municipio": "FARROUPILHA/RS", "planta": "CQ", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:57", "chegada_iso": "2026-07-13T11:57:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -183, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 75.88, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532349", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.9989, "lng": -51.0667}, {"pedido": 375126, "aglutinador": "SPO;SEG;13072026;81;9;635", "veiculo_aglutinado": "TOCO", "fornecedor": "JAMA (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "CQ", "transportador": "TW (HORIZONTINA)", "modal": "MILKRUN", "janela": "13/07 07:25", "janela_iso": "2026-07-13T07:25:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 08:53", "chegada_iso": "2026-07-13T08:53:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 88, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 8.33, "ans": "Fora do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "STA-043856", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.05379, "lng": -52.8718}, {"pedido": 375099, "aglutinador": "SPO;SEG;13072026;83;122;37718", "veiculo_aglutinado": "VAN", "fornecedor": "CERCENA (ERECHIM)", "municipio": "ERECHIM/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.35, "ans": "Fora do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "35-2158-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -27.858086, "lng": -54.493516}, {"pedido": 375108, "aglutinador": "SPO;SEG;13072026;83;60;37718", "veiculo_aglutinado": "VAN", "fornecedor": "CREPESUL (SAO LEOPOLDO)", "municipio": "SAO LEOPOLDO/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:53", "chegada_iso": "2026-07-13T17:53:26", "saida_origem": "13/07 17:55", "saida_iso": "2026-07-13T17:55:06", "atraso_chegada_min": 233, "permanencia_min": 2, "atraso_saida_min": 235, "status": "Iniciado", "tempo_h": 3.3, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "35-2160-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.81574, "lng": -51.394576}, {"pedido": 375105, "aglutinador": "SPO;SEG;13072026;83;78;37718", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "INCOFLEX (CANOAS)", "municipio": "CANOAS/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN FF", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:55", "chegada_iso": "2026-07-13T16:55:24", "saida_origem": "13/07 17:08", "saida_iso": "2026-07-13T17:08:49", "atraso_chegada_min": 175, "permanencia_min": 13, "atraso_saida_min": 189, "status": "Iniciado", "tempo_h": 3.3, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "35-2160-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.81574, "lng": -51.394576}, {"pedido": 375078, "aglutinador": "SPO;SEG;13072026;83;928;37718", "veiculo_aglutinado": "VAN", "fornecedor": "ESPUMATEC COMP  (CAXIAS SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:27", "chegada_iso": "2026-07-13T11:27:35", "saida_origem": "13/07 14:04", "saida_iso": "2026-07-13T14:04:45", "atraso_chegada_min": 88, "permanencia_min": 157, "atraso_saida_min": 245, "status": "Finalizado", "tempo_h": 5.47, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "35-2157-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.815618950184692, "lng": -51.39472318882748}, {"pedido": 375049, "aglutinador": "SPO;SEG;13072026;84;1046;473", "veiculo_aglutinado": "3/4", "fornecedor": "ROTOPLASTYC (CARAZINHO)", "municipio": "CARAZINHO/RS", "planta": "BM", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:57", "chegada_iso": "2026-07-13T14:57:01", "saida_origem": "13/07 14:58", "saida_iso": "2026-07-13T14:58:00", "atraso_chegada_min": 897, "permanencia_min": 1, "atraso_saida_min": 898, "status": "Finalizado", "tempo_h": 71.87, "ans": "Dentro do ANS", "qtde_nf": 5, "tem_nf": true, "ge": "CRZ-030755", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.282058, "lng": -52.76515}, {"pedido": 375048, "aglutinador": "SPO;SEG;13072026;84;1053;409", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "PARKER (DIADEMA)", "municipio": "DIADEMA/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 13:30", "janela_iso": "2026-07-13T13:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:18", "chegada_iso": "2026-07-13T14:18:01", "saida_origem": "13/07 14:44", "saida_iso": "2026-07-13T14:44:00", "atraso_chegada_min": 48, "permanencia_min": 26, "atraso_saida_min": 74, "status": "Finalizado", "tempo_h": 67.75, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "OSC-654042", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.484157, "lng": -46.785228}, {"pedido": 375067, "aglutinador": "SPO;SEG;13072026;84;107;478", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "URANO (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "13/07 11:00", "janela_iso": "2026-07-13T11:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:48", "chegada_iso": "2026-07-13T13:48:01", "saida_origem": "13/07 13:55", "saida_iso": "2026-07-13T13:55:00", "atraso_chegada_min": 168, "permanencia_min": 7, "atraso_saida_min": 175, "status": "Finalizado", "tempo_h": 5.32, "ans": "Fora do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "POA-607113", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.862818, "lng": -51.432409}, {"pedido": 374773, "aglutinador": "SPO;SEG;13072026;84;111;473", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "TROMINK (PANAMBI)", "municipio": "PANAMBI/RS", "planta": "BM", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "FTL", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:51", "chegada_iso": "2026-07-13T16:51:01", "saida_origem": "13/07 16:51", "saida_iso": "2026-07-13T16:51:00", "atraso_chegada_min": 1011, "permanencia_min": 0, "atraso_saida_min": 1011, "status": "Iniciado", "tempo_h": 11.23, "ans": "Dentro do ANS", "qtde_nf": 28, "tem_nf": true, "ge": "PBI-014169", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.1747, "lng": -52.2035}, {"pedido": 375047, "aglutinador": "SPO;SEG;13072026;84;1327;614", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "TUPY (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "BM", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:40", "chegada_iso": "2026-07-13T16:40:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 400, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 12.23, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "JOI-043923", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -26.42739, "lng": -48.8271}, {"pedido": 375043, "aglutinador": "SPO;SEG;13072026;84;13499;409", "veiculo_aglutinado": "3/4", "fornecedor": "HENNINGS (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 19:27", "chegada_iso": "2026-07-13T19:27:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 1167, "permanencia_min": null, "atraso_saida_min": null, "status": "Finalizado", "tempo_h": 6.25, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "OSC-654043", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.4847, "lng": -46.7856}, {"pedido": 375039, "aglutinador": "SPO;SEG;13072026;84;20380;472", "veiculo_aglutinado": "VAN", "fornecedor": "OMT (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 11:00", "janela_iso": "2026-07-13T11:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 12:24", "chegada_iso": "2026-07-13T12:24:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 84, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 77.33, "ans": "Fora do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "CSL-532346", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -26.9101, "lng": -48.9482}, {"pedido": 374856, "aglutinador": "SPO;SEG;13072026;84;21;409", "veiculo_aglutinado": "VAN", "fornecedor": "GOLIN (GUARULHOS)", "municipio": "GUARULHOS/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:16", "chegada_iso": "2026-07-13T16:16:01", "saida_origem": "13/07 18:20", "saida_iso": "2026-07-13T18:20:00", "atraso_chegada_min": 376, "permanencia_min": 124, "atraso_saida_min": 500, "status": "Iniciado", "tempo_h": 8.82, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "OSC-654055", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.287, "lng": -45.9556}, {"pedido": 375046, "aglutinador": "SPO;SEG;13072026;84;2744;614", "veiculo_aglutinado": "VAN", "fornecedor": "TIMKEN (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "BM", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:57", "chegada_iso": "2026-07-13T14:57:01", "saida_origem": "13/07 15:36", "saida_iso": "2026-07-13T15:36:00", "atraso_chegada_min": 897, "permanencia_min": 39, "atraso_saida_min": 936, "status": "Iniciado", "tempo_h": 12.23, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "JOI-043924", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -26.4274, "lng": -48.8271}, {"pedido": 375116, "aglutinador": "SPO;SEG;13072026;84;35;614", "veiculo_aglutinado": "3/4", "fornecedor": "NELSON (ARAUCARIA)", "municipio": "ARAUCARIA/PR", "planta": "BM", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 12.23, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CTA-236912", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.5849, "lng": -49.3164}, {"pedido": 375045, "aglutinador": "SPO;SEG;13072026;84;4646;614", "veiculo_aglutinado": "VAN", "fornecedor": "PHD (COLOMBO)", "municipio": "COLOMBO/PR", "planta": "BM", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN FF", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 12.23, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "PIN-014382", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -25.5849, "lng": -49.3164}, {"pedido": 374855, "aglutinador": "SPO;SEG;13072026;84;48;473", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "KOHLER (HORIZONTINA)", "municipio": "HORIZONTINA/RS", "planta": "BM", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:38", "chegada_iso": "2026-07-13T16:38:01", "saida_origem": "13/07 17:28", "saida_iso": "2026-07-13T17:28:00", "atraso_chegada_min": 38, "permanencia_min": 50, "atraso_saida_min": 88, "status": "Iniciado", "tempo_h": 10.35, "ans": "Dentro do ANS", "qtde_nf": 5, "tem_nf": true, "ge": "HOR-023527", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.0538, "lng": -52.8718}, {"pedido": 375107, "aglutinador": "SPO;SEG;13072026;84;52;473", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "FRATELLI (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "BM", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "13/07 07:30", "janela_iso": "2026-07-13T07:30:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:58", "chegada_iso": "2026-07-13T13:58:01", "saida_origem": "13/07 14:20", "saida_iso": "2026-07-13T14:20:00", "atraso_chegada_min": 388, "permanencia_min": 22, "atraso_saida_min": 410, "status": "Iniciado", "tempo_h": 75.23, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "STA-043858", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -27.7817, "lng": -54.2602}, {"pedido": 375038, "aglutinador": "SPO;SEG;13072026;84;54979;614", "veiculo_aglutinado": "VAN", "fornecedor": "CASTERTECH (SCHROEDER)", "municipio": "SCHROEDER/SC", "planta": "BM", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 16:00", "chegada_iso": "2026-07-13T16:00:01", "saida_origem": "13/07 16:01", "saida_iso": "2026-07-13T16:01:00", "atraso_chegada_min": 960, "permanencia_min": 1, "atraso_saida_min": 961, "status": "Iniciado", "tempo_h": 12.23, "ans": "Dentro do ANS", "qtde_nf": 4, "tem_nf": true, "ge": "CCJ-000040", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -26.9332, "lng": -48.701}, {"pedido": 375054, "aglutinador": "SPO;SEG;13072026;84;571;409", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "MANGOTEX (ITU)", "municipio": "ITU/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:46", "chegada_iso": "2026-07-13T13:46:01", "saida_origem": "13/07 15:44", "saida_iso": "2026-07-13T15:44:00", "atraso_chegada_min": 826, "permanencia_min": 118, "atraso_saida_min": 944, "status": "Iniciado", "tempo_h": 7.23, "ans": "Dentro do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "CMP-187570", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.5269, "lng": -46.7508}, {"pedido": 375103, "aglutinador": "SPO;SEG;13072026;84;57;472", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "EATON LTDA  (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 22:00", "janela_iso": "2026-07-13T22:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:56", "chegada_iso": "2026-07-13T13:56:01", "saida_origem": "13/07 16:25", "saida_iso": "2026-07-13T16:25:00", "atraso_chegada_min": -484, "permanencia_min": 149, "atraso_saida_min": -335, "status": "Finalizado", "tempo_h": 70.98, "ans": "Dentro do ANS", "qtde_nf": 7, "tem_nf": true, "ge": "CSL-532336", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.11525, "lng": -51.173635}, {"pedido": 374999, "aglutinador": "SPO;SEG;13072026;84;60725;478", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "DANA SAC (GRAVATAI)", "municipio": "GRAVATAI/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "FTL", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:33", "chegada_iso": "2026-07-13T14:33:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": 273, "permanencia_min": null, "atraso_saida_min": null, "status": "Finalizado", "tempo_h": 71.97, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "POA-607048", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.862818, "lng": -51.432409}, {"pedido": 375088, "aglutinador": "SPO;SEG;13072026;84;87;478", "veiculo_aglutinado": "3/4", "fornecedor": "PRINTSTORE (PORTO ALEGRE)", "municipio": "PORTO ALEGRE/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "13/07 00:00", "janela_iso": "2026-07-13T00:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 14:51", "chegada_iso": "2026-07-13T14:51:01", "saida_origem": "13/07 15:07", "saida_iso": "2026-07-13T15:07:00", "atraso_chegada_min": 891, "permanencia_min": 16, "atraso_saida_min": 907, "status": "Finalizado", "tempo_h": 71.33, "ans": "Dentro do ANS", "qtde_nf": 1, "tem_nf": true, "ge": "POA-607110", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.86281, "lng": -51.4324}, {"pedido": 375081, "aglutinador": "SPO;SEG;13072026;84;91;472", "veiculo_aglutinado": "VAN", "fornecedor": "VOESTALPINE (FR CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 13:52", "chegada_iso": "2026-07-13T13:52:01", "saida_origem": "13/07 15:17", "saida_iso": "2026-07-13T15:17:00", "atraso_chegada_min": -68, "permanencia_min": 85, "atraso_saida_min": 17, "status": "Iniciado", "tempo_h": 87.53, "ans": "Fora do ANS", "qtde_nf": 15, "tem_nf": true, "ge": "CSL-532340", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.8521, "lng": -51.4113}, {"pedido": 375053, "aglutinador": "SPO;SEG;13072026;84;928;472", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ESPUMATEC COMP  (CAXIAS SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:21", "chegada_iso": "2026-07-13T11:21:01", "saida_origem": "13/07 16:14", "saida_iso": "2026-07-13T16:14:00", "atraso_chegada_min": 81, "permanencia_min": 293, "atraso_saida_min": 374, "status": "Finalizado", "tempo_h": 69.53, "ans": "Dentro do ANS", "qtde_nf": 8, "tem_nf": true, "ge": "CSL-532344", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.178, "lng": -51.2436}, {"pedido": 375031, "aglutinador": "SPO;SEG;13072026;84;95;472", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "MAQUINAS SAZI (FARROUPILHA)", "municipio": "FARROUPILHA/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "13/07 15:00", "janela_iso": "2026-07-13T15:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:58", "chegada_iso": "2026-07-13T11:58:01", "saida_origem": null, "saida_iso": null, "atraso_chegada_min": -182, "permanencia_min": null, "atraso_saida_min": null, "status": "Finalizado", "tempo_h": 70.65, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532348", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.20189, "lng": -51.28979}, {"pedido": 375104, "aglutinador": "SPO;SEG;13072026;8;122;37718", "veiculo_aglutinado": "VAN", "fornecedor": "CERCENA (ERECHIM)", "municipio": "ERECHIM/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "13/07 16:00", "janela_iso": "2026-07-13T16:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.35, "ans": "Fora do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "35-2158-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -27.858086, "lng": -54.493516}, {"pedido": 375025, "aglutinador": "SPO;SEG;13072026;8;16121;37718", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "RODAROS (VACARIA)", "municipio": "VACARIA/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN FF", "janela": "13/07 23:00", "janela_iso": "2026-07-13T23:00:00", "janela_data": "2026-07-13", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375124, "aglutinador": "SPO;SEG;13072026;8;24;37718", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "TRAVI PLASTICOS (CAXIAS DO SUL-R BRANCO)", "municipio": "CAXIAS DO SUL/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:28", "chegada_iso": "2026-07-13T11:28:30", "saida_origem": "13/07 11:58", "saida_iso": "2026-07-13T11:58:49", "atraso_chegada_min": 88, "permanencia_min": 30, "atraso_saida_min": 119, "status": "Finalizado", "tempo_h": 7.28, "ans": "Dentro do ANS", "qtde_nf": 5, "tem_nf": true, "ge": "35-2156-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.8155478, "lng": -51.3946711}, {"pedido": 375112, "aglutinador": "SPO;SEG;13072026;8;49;37718", "veiculo_aglutinado": "VAN", "fornecedor": "CHAPEMEC (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:34", "chegada_iso": "2026-07-13T17:34:00", "saida_origem": "13/07 17:38", "saida_iso": "2026-07-13T17:38:03", "atraso_chegada_min": 214, "permanencia_min": 4, "atraso_saida_min": 218, "status": "Iniciado", "tempo_h": 3.35, "ans": "Fora do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "35-2158-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -27.858086, "lng": -54.493516}, {"pedido": 375111, "aglutinador": "SPO;SEG;13072026;8;52;37718", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "FRATELLI (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "13/07 07:00", "janela_iso": "2026-07-13T07:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:38", "chegada_iso": "2026-07-13T17:38:22", "saida_origem": "13/07 17:40", "saida_iso": "2026-07-13T17:40:19", "atraso_chegada_min": 638, "permanencia_min": 2, "atraso_saida_min": 640, "status": "Iniciado", "tempo_h": 3.35, "ans": "Fora do ANS", "qtde_nf": 6, "tem_nf": true, "ge": "35-2158-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -27.858086, "lng": -54.493516}, {"pedido": 375110, "aglutinador": "SPO;SEG;13072026;8;60;37718", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "CREPESUL (SAO LEOPOLDO)", "municipio": "SAO LEOPOLDO/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "13/07 14:00", "janela_iso": "2026-07-13T14:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 17:53", "chegada_iso": "2026-07-13T17:53:26", "saida_origem": "13/07 17:55", "saida_iso": "2026-07-13T17:55:06", "atraso_chegada_min": 233, "permanencia_min": 2, "atraso_saida_min": 235, "status": "Iniciado", "tempo_h": 3.3, "ans": "Fora do ANS", "qtde_nf": 2, "tem_nf": true, "ge": "35-2160-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.81574, "lng": -51.394576}, {"pedido": 375095, "aglutinador": "SPO;SEG;13072026;8;928;37718", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "ESPUMATEC COMP  (CAXIAS SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "13/07 10:00", "janela_iso": "2026-07-13T10:00:00", "janela_data": "2026-07-13", "chegada_origem": "13/07 11:27", "chegada_iso": "2026-07-13T11:27:35", "saida_origem": "13/07 14:04", "saida_iso": "2026-07-13T14:04:45", "atraso_chegada_min": 88, "permanencia_min": 157, "atraso_saida_min": 245, "status": "Finalizado", "tempo_h": 5.47, "ans": "Dentro do ANS", "qtde_nf": 3, "tem_nf": true, "ge": "35-2157-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.815618950184692, "lng": -51.39472318882748}, {"pedido": 375366, "aglutinador": "SPO;TER;14072026;101;2", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "SIDERAL (CONCEICAO DO PARA)", "municipio": "CONCEICAO DO PARA/MG", "planta": "PDC", "transportador": "MIRASSOL (UBERABA)", "modal": "MILKRUN", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374959, "aglutinador": "SPO;TER;14072026;111;12741", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "TROMINK (PANAMBI)", "municipio": "PANAMBI/RS", "planta": "BZ", "transportador": "JSL (TRIUNFO)", "modal": "FTL", "janela": "14/07 15:00", "janela_iso": "2026-07-14T15:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375362, "aglutinador": "SPO;TER;14072026;11277;1062", "veiculo_aglutinado": "3/4", "fornecedor": "HCC (CURITIBA)", "municipio": "CURITIBA/PR", "planta": "PDC", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "MILKRUN", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374869, "aglutinador": "SPO;TER;14072026;144;112;472", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "FNA (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "14/07 13:30", "janela_iso": "2026-07-14T13:30:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.7, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532501", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.23989, "lng": -51.33359}, {"pedido": 375365, "aglutinador": "SPO;TER;14072026;144;117;478", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "INPEL (SAPUCAIA DO SUL)", "municipio": "SAPUCAIA DO SUL/RS", "planta": "PDC", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.12, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "NHO-142136", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.80969, "lng": -51.5054}, {"pedido": 375383, "aglutinador": "SPO;TER;14072026;144;20749;473", "veiculo_aglutinado": "VAN", "fornecedor": "MAQUINAS SAZI (TRES DE MAIO)", "municipio": "TRES DE MAIO/RS", "planta": "PDC", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "14/07 00:00", "janela_iso": "2026-07-14T00:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.47, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "HOR-023531", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -27.7817, "lng": -54.26019}, {"pedido": 375372, "aglutinador": "SPO;TER;14072026;144;4998;478", "veiculo_aglutinado": "3/4", "fornecedor": "WALTERSCHEID (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "PDC", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.47, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "POA-607281", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.86199, "lng": -51.4333}, {"pedido": 375384, "aglutinador": "SPO;TER;14072026;144;57;472", "veiculo_aglutinado": "3/4", "fornecedor": "EATON LTDA  (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.12, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532491", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.58459, "lng": -51.35979}, {"pedido": 375379, "aglutinador": "SPO;TER;14072026;144;61;478", "veiculo_aglutinado": "VAN", "fornecedor": "TECNOMOLA (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "PDC", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.7, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "POA-607280", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.86199, "lng": -51.4333}, {"pedido": 375378, "aglutinador": "SPO;TER;14072026;144;66;472", "veiculo_aglutinado": "VAN", "fornecedor": "HIDROVER (FLORES DA CUNHA)", "municipio": "FLORES DA CUNHA/RS", "planta": "PDC", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "14/07 10:00", "janela_iso": "2026-07-14T10:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.35, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532492", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.23989, "lng": -51.33359}, {"pedido": 375368, "aglutinador": "SPO;TER;14072026;144;78;478", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "INCOFLEX (CANOAS)", "municipio": "CANOAS/RS", "planta": "PDC", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.12, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "NHO-142134", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.80969, "lng": -51.5054}, {"pedido": 375341, "aglutinador": "SPO;TER;14072026;149;3", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "JOINTECH (JOINVILLE)", "municipio": "JOINVILLE/SC", "planta": "BZ", "transportador": "MIRASSOL (TUBARAO)", "modal": "MILKRUN", "janela": "14/07 12:00", "janela_iso": "2026-07-14T12:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374955, "aglutinador": "SPO;TER;14072026;17040;12682", "veiculo_aglutinado": "CARRETA ABERTA", "fornecedor": "DURA (RIO GRANDE DA SERRA)", "municipio": "RIO GRANDE DA SERRA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375354, "aglutinador": "SPO;TER;14072026;19;1062", "veiculo_aglutinado": "TOCO", "fornecedor": "KABEL (ALMIRANTE TAMANDARE)", "municipio": "ALMIRANTE TAMANDARE/PR", "planta": "BZ", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "MILKRUN", "janela": "14/07 18:00", "janela_iso": "2026-07-14T18:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375382, "aglutinador": "SPO;TER;14072026;19;1062", "veiculo_aglutinado": "TOCO", "fornecedor": "KABEL (ALMIRANTE TAMANDARE)", "municipio": "ALMIRANTE TAMANDARE/PR", "planta": "PDC", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "MILKRUN", "janela": "14/07 18:00", "janela_iso": "2026-07-14T18:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375303, "aglutinador": "SPO;TER;14072026;35;1062", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "NELSON (ARAUCARIA)", "municipio": "ARAUCARIA/PR", "planta": "NW", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "MILKRUN FF", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375348, "aglutinador": "SPO;TER;14072026;35;1062", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "NELSON (ARAUCARIA)", "municipio": "ARAUCARIA/PR", "planta": "BZ", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "MILKRUN", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375380, "aglutinador": "SPO;TER;14072026;35;1062", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "NELSON (ARAUCARIA)", "municipio": "ARAUCARIA/PR", "planta": "PDC", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "MILKRUN", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375369, "aglutinador": "SPO;TER;14072026;53;1062", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "QUANTUM (ALMIRANTE TAMANDARE)", "municipio": "ALMIRANTE TAMANDARE/PR", "planta": "PDC", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "MILKRUN", "janela": "14/07 19:00", "janela_iso": "2026-07-14T19:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374956, "aglutinador": "SPO;TER;14072026;54;10928", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "BRUNING (PANAMBI)", "municipio": "PANAMBI/RS", "planta": "CQ", "transportador": "MODULAR (PANAMBI)", "modal": "FTL", "janela": "14/07 18:00", "janela_iso": "2026-07-14T18:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374958, "aglutinador": "SPO;TER;14072026;54;1592", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "BRUNING (PANAMBI)", "municipio": "PANAMBI/RS", "planta": "BM", "transportador": "MODULAR (CANOAS)", "modal": "FTL", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374870, "aglutinador": "SPO;TER;14072026;55;1", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "VENTUROSO (S JOAQUIM DA BARRA)", "municipio": "SAO JOAQUIM DA BARRA/SP", "planta": "PDC", "transportador": "MIRASSOL (LOUVEIRA)", "modal": "FTL", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374954, "aglutinador": "SPO;TER;14072026;57228;12682", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "RESIPLASTIC (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "BZ", "transportador": "JSL (INDAIATUBA)", "modal": "FTL", "janela": "14/07 11:00", "janela_iso": "2026-07-14T11:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375326, "aglutinador": "SPO;TER;14072026;59754;2418", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "TOWER PARTS (SJP)", "municipio": "SAO JOSE DOS PINHAIS/PR", "planta": "NW", "transportador": "MIRASSOL (SJ PINHAIS)", "modal": "MILKRUN FF", "janela": "14/07 10:00", "janela_iso": "2026-07-14T10:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375272, "aglutinador": "SPO;TER;14072026;645;780", "veiculo_aglutinado": "VAN", "fornecedor": "MOURA BATERIAS (ITAPETININGA)", "municipio": "ITAPETININGA/SP", "planta": "BZ", "transportador": "MIRASSOL (GUARULHOS)", "modal": "MILKRUN", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375274, "aglutinador": "SPO;TER;14072026;81;16;409", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "FIXOVED (S BERNARDO CAMPO)", "municipio": "SAO BERNARDO DO CAMPO/SP", "planta": "CQ", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.12, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "OSC-654349", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.4838, "lng": -46.7852}, {"pedido": 375355, "aglutinador": "SPO;TER;14072026;81;19;614", "veiculo_aglutinado": "VAN", "fornecedor": "KABEL (ALMIRANTE TAMANDARE)", "municipio": "ALMIRANTE TAMANDARE/PR", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "14/07 00:00", "janela_iso": "2026-07-14T00:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375353, "aglutinador": "SPO;TER;14072026;81;20;635", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "NELSON DO BRASIL (SANTA ROSA)", "municipio": "SANTA ROSA/RS", "planta": "CQ", "transportador": "TW (HORIZONTINA)", "modal": "MILKRUN", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375349, "aglutinador": "SPO;TER;14072026;81;24;472", "veiculo_aglutinado": "VAN", "fornecedor": "TRAVI PLASTICOS (CAXIAS DO SUL-R BRANCO)", "municipio": "CAXIAS DO SUL/RS", "planta": "CQ", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "14/07 00:00", "janela_iso": "2026-07-14T00:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.47, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532494", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.23989, "lng": -51.33359}, {"pedido": 375343, "aglutinador": "SPO;TER;14072026;81;37;614", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "BORRAX (SCHROEDER)", "municipio": "SCHROEDER/SC", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "14/07 00:00", "janela_iso": "2026-07-14T00:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375339, "aglutinador": "SPO;TER;14072026;81;53;614", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "QUANTUM (ALMIRANTE TAMANDARE)", "municipio": "ALMIRANTE TAMANDARE/PR", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "14/07 00:00", "janela_iso": "2026-07-14T00:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375308, "aglutinador": "SPO;TER;14072026;81;65;614", "veiculo_aglutinado": "VAN", "fornecedor": "USICAST (SAO JOSE)", "municipio": "SAO JOSE/SC", "planta": "CQ", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN FF", "janela": "14/07 00:00", "janela_iso": "2026-07-14T00:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375333, "aglutinador": "SPO;TER;14072026;81;79;478", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "REXNORD (SAO LEOPOLDO)", "municipio": "SAO LEOPOLDO/RS", "planta": "CQ", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 00:00", "janela_iso": "2026-07-14T00:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 4.0, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "NHO-142138", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.71379, "lng": -51.49199}, {"pedido": 375310, "aglutinador": "SPO;TER;14072026;83;124;37718", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "ACRILYS LAM (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": 1.1, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "35-2163-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.616944, "lng": -51.349166}, {"pedido": 375313, "aglutinador": "SPO;TER;14072026;83;27;37718", "veiculo_aglutinado": "TOCO", "fornecedor": "HASSMANN (IMIGRANTE)", "municipio": "IMIGRANTE/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375307, "aglutinador": "SPO;TER;14072026;83;440;37718", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ACRILYS LAM (S FRANC PAULA)", "municipio": "SAO FRANCISCO DE PAULA/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 374952, "aglutinador": "SPO;TER;14072026;83;54;473", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "BRUNING (PANAMBI)", "municipio": "PANAMBI/RS", "planta": "BZ", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "FTL", "janela": "14/07 21:00", "janela_iso": "2026-07-14T21:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375358, "aglutinador": "SPO;TER;14072026;83;61;37718", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "TECNOMOLA (CACHOEIRINHA)", "municipio": "CACHOEIRINHA/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375312, "aglutinador": "SPO;TER;14072026;83;78;37718", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "INCOFLEX (CANOAS)", "municipio": "CANOAS/RS", "planta": "BZ", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375324, "aglutinador": "SPO;TER;14072026;84;102;409", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "SCHAEFFLER BRASIL (SOROCABA)", "municipio": "SOROCABA/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "14/07 10:30", "janela_iso": "2026-07-14T10:30:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.23, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "OSC-654340", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.4839, "lng": -46.7853}, {"pedido": 374950, "aglutinador": "SPO;TER;14072026;84;111;473", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "TROMINK (PANAMBI)", "municipio": "PANAMBI/RS", "planta": "BM", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "FTL", "janela": "14/07 15:00", "janela_iso": "2026-07-14T15:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.7, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "PBI-014175", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.288, "lng": -51.96289}, {"pedido": 375321, "aglutinador": "SPO;TER;14072026;84;117;478", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "INPEL (SAPUCAIA DO SUL)", "municipio": "SAPUCAIA DO SUL/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 09:00", "janela_iso": "2026-07-14T09:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.12, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "NHO-142141", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.8097, "lng": -51.5054}, {"pedido": 375317, "aglutinador": "SPO;TER;14072026;84;1362;409", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "MTA (ARUJA)", "municipio": "ARUJA/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "14/07 10:00", "janela_iso": "2026-07-14T10:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.82, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "OSC-654345", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.4844, "lng": -46.7858}, {"pedido": 375276, "aglutinador": "SPO;TER;14072026;84;16;409", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "FIXOVED (S BERNARDO CAMPO)", "municipio": "SAO BERNARDO DO CAMPO/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.12, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "OSC-654348", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.4838, "lng": -46.7852}, {"pedido": 375314, "aglutinador": "SPO;TER;14072026;84;19447;409", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "EVK DO BRASIL (DIADEMA)", "municipio": "DIADEMA/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "14/07 14:30", "janela_iso": "2026-07-14T14:30:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375357, "aglutinador": "SPO;TER;14072026;84;19;614", "veiculo_aglutinado": "VAN", "fornecedor": "KABEL (ALMIRANTE TAMANDARE)", "municipio": "ALMIRANTE TAMANDARE/PR", "planta": "BM", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN", "janela": "14/07 00:00", "janela_iso": "2026-07-14T00:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375316, "aglutinador": "SPO;TER;14072026;84;2649;409", "veiculo_aglutinado": "VAN", "fornecedor": "MAHLE (MOGI-GUACU)", "municipio": "ARUJA/SP", "planta": "BM", "transportador": "TW (OSASCO-SP)", "modal": "MILKRUN", "janela": "14/07 17:00", "janela_iso": "2026-07-14T17:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.82, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CMP-187627", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -23.4844, "lng": -46.7858}, {"pedido": 375346, "aglutinador": "SPO;TER;14072026;84;39;472", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "FOTOGRAVURA ZEYANA (CAXIAS)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "14/07 00:00", "janela_iso": "2026-07-14T00:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.58, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532495", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.2399, "lng": -51.3336}, {"pedido": 375344, "aglutinador": "SPO;TER;14072026;84;44;478", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "METAL NUNES (S LEOPOLDO)", "municipio": "SAO LEOPOLDO/RS", "planta": "BM", "transportador": "TW (MONTENEGRO-RS)", "modal": "MILKRUN", "janela": "14/07 13:30", "janela_iso": "2026-07-14T13:30:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 4.12, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "NHO-142137", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.71379, "lng": -51.49199}, {"pedido": 375304, "aglutinador": "SPO;TER;14072026;84;54979;614", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "CASTERTECH (SCHROEDER)", "municipio": "SCHROEDER/SC", "planta": "BM", "transportador": "TW (BLUMENAU-SC)", "modal": "MILKRUN FF", "janela": "14/07 00:00", "janela_iso": "2026-07-14T00:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375340, "aglutinador": "SPO;TER;14072026;84;57;472", "veiculo_aglutinado": "VAN", "fornecedor": "EATON LTDA  (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "14/07 22:00", "janela_iso": "2026-07-14T22:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 1.12, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532496", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.5846, "lng": -51.3598}, {"pedido": 375336, "aglutinador": "SPO;TER;14072026;84;82;473", "veiculo_aglutinado": "3/4", "fornecedor": "INDUTAR (IBIRUBA)", "municipio": "IBIRUBA/RS", "planta": "BM", "transportador": "TW (CARAZINHO-RS S.JOAO)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.7, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "IBI-004142", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -28.2716, "lng": -52.7787}, {"pedido": 375306, "aglutinador": "SPO;TER;14072026;84;95;472", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "MAQUINAS SAZI (FARROUPILHA)", "municipio": "FARROUPILHA/RS", "planta": "BM", "transportador": "TW (CAXIAS DO SUL)", "modal": "MILKRUN", "janela": "14/07 15:00", "janela_iso": "2026-07-14T15:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Iniciado", "tempo_h": 3.58, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "CSL-532499", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.8621, "lng": -51.4333}, {"pedido": 375311, "aglutinador": "SPO;TER;14072026;8;108;37718", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "DYNAMICS (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "14/07 15:00", "janela_iso": "2026-07-14T15:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": 1.1, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "35-2163-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.616944, "lng": -51.349166}, {"pedido": 375309, "aglutinador": "SPO;TER;14072026;8;124;37718", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "ACRILYS LAM (CAXIAS DO SUL)", "municipio": "CAXIAS DO SUL/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "14/07 14:00", "janela_iso": "2026-07-14T14:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": 1.1, "ans": "Fora do ANS", "qtde_nf": 0, "tem_nf": false, "ge": "35-2163-M", "tem_ge": true, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": -29.616944, "lng": -51.349166}, {"pedido": 375351, "aglutinador": "SPO;TER;14072026;8;27;37718", "veiculo_aglutinado": "TRUCK SIDER", "fornecedor": "HASSMANN (IMIGRANTE)", "municipio": "IMIGRANTE/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375335, "aglutinador": "SPO;TER;14072026;8;440;37718", "veiculo_aglutinado": "CARRETA SIDER", "fornecedor": "ACRILYS LAM (S FRANC PAULA)", "municipio": "SAO FRANCISCO DE PAULA/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "14/07 13:00", "janela_iso": "2026-07-14T13:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}, {"pedido": 375342, "aglutinador": "SPO;TER;14072026;8;78;37718", "veiculo_aglutinado": "UTILITARIO", "fornecedor": "INCOFLEX (CANOAS)", "municipio": "CANOAS/RS", "planta": "NW", "transportador": "MIRASSOL (MONTENEGRO)", "modal": "MILKRUN", "janela": "14/07 16:00", "janela_iso": "2026-07-14T16:00:00", "janela_data": "2026-07-14", "chegada_origem": null, "chegada_iso": null, "saida_origem": null, "saida_iso": null, "atraso_chegada_min": null, "permanencia_min": null, "atraso_saida_min": null, "status": "Não iniciado", "tempo_h": null, "ans": "Dentro do ANS", "qtde_nf": 0, "tem_nf": false, "ge": null, "tem_ge": false, "status_nc": null, "motivo_nc": null, "nao_conforme": false, "lat": null, "lng": null}];

/* ==========================================================================
   02. COORDENADAS DE MUNICÍPIOS
   ========================================================================== */

const MUNI_COORDS = {"ALMIRANTE TAMANDARE/PR": [-25.3244, -49.3106], "ARAUCARIA/PR": [-25.5925, -49.4103], "ARUJA/SP": [-23.3956, -46.3211], "ATIBAIA/SP": [-23.1171, -46.5497], "BETIM/MG": [-19.9678, -44.1983], "BLUMENAU/SC": [-26.9194, -49.0661], "BOITUVA/SP": [-23.2864, -47.6708], "BOTUCATU/SP": [-22.8859, -48.445], "BRUSQUE/SC": [-27.0975, -48.9106], "CACHOEIRA DO SUL/RS": [-30.0392, -52.8939], "CACHOEIRINHA/RS": [-29.9511, -51.0942], "CAMPINAS/SP": [-22.9099, -47.0626], "CAMPO LIMPO PAULISTA/SP": [-23.2064, -46.7825], "CANOAS/RS": [-29.9177, -51.1836], "CAPIVARI/SP": [-22.995, -47.5081], "CARAZINHO/RS": [-28.2836, -52.7864], "CARMO DA MATA/MG": [-20.2278, -44.9328], "CAXIAS DO SUL/RS": [-29.1678, -51.1794], "CONCEICAO DO PARA/MG": [-20.0489, -45.0894], "COTIA/SP": [-23.6039, -46.9187], "CRUZEIRO/SP": [-22.5733, -44.9647], "CURITIBA/PR": [-25.4284, -49.2733], "DIADEMA/SP": [-23.6864, -46.6228], "ERECHIM/RS": [-27.6344, -52.2739], "ESTANCIA VELHA/RS": [-29.6486, -51.1739], "EXTERIOR/EX": null, "FARROUPILHA/RS": [-29.2236, -51.3467], "FAZENDA RIO GRANDE/PR": [-25.6656, -49.3072], "FLORES DA CUNHA/RS": [-29.0286, -51.1836], "GUAIBA/RS": [-30.1136, -51.3258], "GUARANESIA/MG": [-21.3919, -46.8189], "GUARATINGUETA/SP": [-22.8167, -45.1917], "GUARULHOS/SP": [-23.4543, -46.5337], "HORIZONTINA/RS": [-27.6297, -54.3103], "HORTOLANDIA/SP": [-22.8592, -47.22], "IBIRUBA/RS": [-28.6303, -53.0917], "IMIGRANTE/RS": [-29.4744, -51.7761], "INDAIAL/SC": [-26.8983, -49.2306], "INDAIATUBA/SP": [-23.09, -47.2181], "IRACEMAPOLIS/SP": [-22.5828, -47.5192], "ITATIBA/SP": [-23.0064, -46.8386], "ITU/SP": [-23.2642, -47.2992], "ITUPEVA/SP": [-23.1531, -47.0578], "JACAREI/SP": [-23.3053, -45.9658], "JAGUARIUNA/SP": [-22.6836, -46.9836], "JOINVILLE/SC": [-26.3045, -48.8487], "JUNDIAI/SP": [-23.1857, -46.8978], "LIMEIRA/SP": [-22.5647, -47.4017], "LORENA/SP": [-22.7328, -45.1206], "LOUVEIRA/SP": [-23.0925, -46.9436], "MAUA/SP": [-23.6675, -46.4614], "MOGI DAS CRUZES/SP": [-23.5228, -46.1883], "MONTENEGRO/RS": [-29.6836, -51.4653], "NAVEGANTES/SC": [-26.8994, -48.6547], "PANAMBI/RS": [-28.2911, -53.5017], "PARAISOPOLIS/MG": [-22.5561, -45.7867], "PASSO DO SOBRADO/RS": [-29.6472, -52.3625], "PEDERNEIRAS/SP": [-22.3428, -48.7789], "PINHAIS/PR": [-25.4442, -49.1908], "PIRACICABA/SP": [-22.7253, -47.6492], "POMERODE/SC": [-26.7392, -49.1758], "PORTO ALEGRE/RS": [-30.0346, -51.2177], "RIO DAS PEDRAS/SP": [-22.8258, -47.6875], "RIO GRANDE DA SERRA/SP": [-23.7439, -46.4133], "SALTO/SP": [-23.2003, -47.2867], "SANTA MARIA/RS": [-29.6842, -53.8069], "SANTA ROSA/RS": [-27.8719, -54.4808], "SANTO ANGELO/RS": [-28.2989, -54.2631], "SAO BERNARDO DO CAMPO/SP": [-23.6939, -46.565], "SAO FRANCISCO DE PAULA/RS": [-29.4489, -50.5847], "SAO JOAQUIM DA BARRA/SP": [-20.5836, -47.8508], "SAO JOSE DOS CAMPOS/SP": [-23.1791, -45.8872], "SAO JOSE DOS PINHAIS/PR": [-25.5347, -49.2058], "SAO JOSE/SC": [-27.5936, -48.6403], "SAO LEOPOLDO/RS": [-29.7604, -51.1478], "SAO PAULO/SP": [-23.5505, -46.6333], "SAO ROQUE/SP": [-23.5297, -47.1358], "SAPUCAIA DO SUL/RS": [-29.8347, -51.1497], "SCHROEDER/SC": [-26.4142, -49.0728], "SOROCABA/SP": [-23.5015, -47.4526], "SUMARE/SP": [-22.8219, -47.2669], "SUZANO/SP": [-23.5425, -46.3108], "TABOAO DA SERRA/SP": [-23.6028, -46.7522], "TIMBO/SC": [-26.8228, -49.2717], "VACARIA/RS": [-28.5122, -50.9339]};

/* ==========================================================================
   03. CONSTANTES, ESTADO GLOBAL E MÓDULOS DA APLICAÇÃO
   ========================================================================== */

const COLORS = { 'Não iniciado':'#9aa5a6', 'Iniciado':'#e0a13c', 'Finalizado':'#0f6e68' };

/* Alteração 2 (Etapa 3) — identidade visual do mapa de fornecedores.
   Paleta vibrante e intuitiva (semáforo): vermelho = não iniciado (crítico),
   âmbar = iniciado, verde = finalizado. Aplica-se SOMENTE à tela do mapa;
   as demais telas preservam a paleta corporativa original (COLORS). */
const MAP_COLORS = { 'Não iniciado':'#EF4444', 'Iniciado':'#F59E0B', 'Finalizado':'#10B981' };
const STATUS_ORDER = ['Não iniciado','Iniciado','Finalizado'];

/* ==========================================================================
   03-A. UTILITÁRIOS CENTRALIZADOS DE DATA/HORA (Etapa 3)
   --------------------------------------------------------------------------
   Todas as comparações de janela/chegada usam o mesmo referencial:
   componentes de data-hora "de parede" no fuso America/Sao_Paulo (Brasília),
   convertidos para milissegundos num quadro naive (Date.UTC dos componentes).
   Isso mantém os cálculos corretos mesmo que o dispositivo esteja em outro
   fuso horário e trata corretamente a virada de dia (ex.: janela 23:50 e
   chegada 00:10 do dia seguinte).
   ========================================================================== */

const TZ_BRASILIA = 'America/Sao_Paulo';
const JANELA_TOLERANCIA_MIN = 30; // Alteração 7 — ±30 minutos em torno da janela

/* Converte um ISO "de parede" (com ou sem sufixo Z/offset) para ms no quadro
   naive. Os componentes são lidos diretamente da string, sem interpretação de
   fuso pelo navegador — evita divergências entre dispositivos. */
function isoParaMs(iso){
  if(!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(iso));
  if(!m) return null;
  return Date.UTC(+m[1], +m[2]-1, +m[3], +m[4], +m[5], +(m[6]||0));
}

/* "Agora" em Brasília, no mesmo quadro naive de isoParaMs — obtido via Intl,
   portanto imune ao fuso horário configurado no dispositivo. */
function agoraBrasiliaMs(){
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ_BRASILIA, hour12: false,
    year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit',
  }).formatToParts(new Date());
  const g = t => +parts.find(p => p.type === t).value;
  return Date.UTC(g('year'), g('month')-1, g('day'), g('hour') === 24 ? 0 : g('hour'), g('minute'), g('second'));
}

/* ---- Cache do "agora" e memoização do status por registro ----
   O status é recalculado no máximo 1x por ciclo de atualização (performance). */
let _agoraMs = agoraBrasiliaMs();
let _statusStamp = 0;
function recalcularAgora(){
  _agoraMs = agoraBrasiliaMs();
  _statusStamp++;
}

/* ==========================================================================
   03-B. REGRA CENTRAL DE CLASSIFICAÇÃO DOS PEDIDOS
   --------------------------------------------------------------------------
   Etapa 3 · Alteração 3 — classificarPedido() é a ÚNICA fonte de verdade sobre
   o estado de um pedido. Cards, gráficos, tabela, ranking, filtros, Relatório
   de Cobranças e Download Excel consomem esta função: nenhum componente possui
   regra própria de cálculo.

   Universo de cálculo (Alteração 4): a função classifica UM pedido; o conjunto
   sempre chega já filtrado pelo pipeline global (filteredData/cobFilteredData).

   Classificação operacional EXCLUSIVA (Alteração 20) — um pedido pertence a
   exatamente um destes estados:

     código        condição                                                 card
     ------------  -------------------------------------------------------  ----------------------
     'dentro'      sem chegada  e  Agora Brasília <= janela + 30min          Dentro da Janela
     'atraso'      sem chegada  e  Agora Brasília >  janela + 30min          Pedidos em Atraso
     'iniciado'    chegada preenchida e saída vazia                          (operação em andamento)
     'fin_prazo'   chegada e saída preenchidas, janela−30 <= chegada <= +30  FIN. DENTRO DO PRAZO
     'fin_atraso'  chegada e saída preenchidas, chegada > janela + 30min     FIN. COM ATRASO
     'fin_antes'   chegada e saída preenchidas, chegada < janela − 30min     Finalizado Antecipado
     null          sem janela válida                                        Sem janela

   Alteração 19 — a chegada antecipada além da tolerância NÃO é tratada como
   atraso: ela permanece na classificação já existente no projeto para esse
   caso ("Antes da Janela"), agora nomeada "Finalizado Antecipado" quando a
   operação está encerrada. Nenhum card novo foi criado para ela.

   Indicadores complementares (podem se sobrepor entre si e a qualquer estado
   operacional): semGE, hasNF, semNF, isNonCompliant, isNotStarted, isStarted.

   ALTERAÇÃO 05 — DUAS DIMENSÕES INDEPENDENTES. `categoria` (atraso, dentro,
   fin_prazo, fin_atraso) é a dimensão de PRAZO e continua decidida apenas
   pelos campos operacionais e temporais. `isStarted`/`isNotStarted` são a
   dimensão de STATUS OPERACIONAL e passam a exigir, além do status textual
   normalizado, a AUSÊNCIA de CHEGADA ORIGEM válida. As duas dimensões não
   são mutuamente exclusivas: o mesmo pedido pode ser Iniciado + Em Atraso,
   Iniciado + Dentro da Janela, Não Iniciado + Em Atraso ou Não Iniciado +
   Dentro da Janela. Nenhuma delas bloqueia a outra.

   Flags auxiliares preservadas das etapas anteriores:
     chegouNoPrazo     — houve chegada dentro da tolerância (gráfico Performance)
     atrasoOperacional — desvio (chegada, ou Agora se não houve chegada) > +30min
                         (faixa de tempo médio/maior atraso e Ranking)
   ========================================================================== */

/* ---- Alteração 11 — regra única de GE ----
   A base entrega o booleano `tem_ge` (derivado de `ge` em transformSheetRows).
   As demais formas encontradas em bases de origem também são aceitas, para que
   uma futura mudança de layout não gere divergência entre componentes. */
const GE_TEXTO_SEM = new Set(['', '-', '--', '0', 'NAO', 'NÃO', 'N', 'FALSE', 'F', 'NULL', 'UNDEFINED', 'NENHUMA', 'SEM GE']);

function hasGE(r){
  if(!r) return false;
  if(typeof r.tem_ge === 'boolean') return r.tem_ge;
  const v = r.tem_ge != null ? r.tem_ge : r.ge;
  if(v == null) return false;
  if(typeof v === 'number') return isFinite(v) && v > 0;
  return !GE_TEXTO_SEM.has(String(v).trim().toUpperCase());
}
function hasNoGE(r){ return !hasGE(r); }

/* ---- Alteração 14 — regra única de Não Conformidade ----
   Campo esperado: STATUS NÃO CONFORME. A base entrega `nao_conforme`
   (booleano) e `status_nc` (texto livre, ex.: "FRETE MORTO"). O texto é
   normalizado (maiúsculas, sem acentos) antes da comparação. */
function normTextoNc(v){
  return v == null ? '' : String(v).trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
const NC_TEXTO_NAO = new Set(['', '-', '--', '0', 'NAO', 'N', 'FALSE', 'F', 'NULL', 'UNDEFINED', 'CONFORME', 'NENHUMA', 'SEM OCORRENCIA']);

function isNonCompliant(r){
  if(!r) return false;
  if(typeof r.nao_conforme === 'boolean') return r.nao_conforme;
  if(typeof r.nao_conforme === 'number') return r.nao_conforme > 0;
  const v = r.nao_conforme != null ? r.nao_conforme : r.status_nc;
  return !NC_TEXTO_NAO.has(normTextoNc(v));
}
/* Sem informação de conformidade (exibido como "Não informado"). */
function ncIndefinido(r){
  return !r || (r.nao_conforme == null && !normTextoNc(r.status_nc));
}

/* ==========================================================================
   ETAPA 3 · ALTERAÇÃO 05 — STATUS OPERACIONAL (INICIADO / NÃO INICIADO)
   --------------------------------------------------------------------------
   Seção 8 — NORMALIZAÇÃO ÚNICA do status textual. Trata maiúsculas e
   minúsculas, espaços extras, acentuação, separadores, nulos e as variações
   aceitas pela base. Nenhum componente visual compara strings de status:
   todos passam por esta função.
     'Iniciado' | 'INICIADO' | ' iniciado '           → 'INICIADO'
     'Não Iniciado' | 'NAO INICIADO' | ' não iniciado' → 'NAO_INICIADO'
     'Finalizado' | 'FINALIZADO'                       → 'FINALIZADO'
     null | undefined | '' | placeholder | desconhecido → ''
   O status ORIGINAL armazenado na base NUNCA é alterado (seções 2 e 3): a
   normalização existe apenas para comparação.
   ========================================================================== */
const STATUS_TEXTO_VAZIO = new Set(['', '-', '--', 'NULL', 'UNDEFINED', 'N A', 'NA', 'ND']);

function normStatusOperacional(v){
  if(v == null) return '';
  const s = String(v).trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-.\/]+/g, ' ').replace(/\s+/g, ' ').trim();
  if(STATUS_TEXTO_VAZIO.has(s)) return '';
  if(/^FINALIZAD[OA]$/.test(s))     return 'FINALIZADO';
  if(/^NAO INICIAD[OA]$/.test(s))   return 'NAO_INICIADO';
  if(/^INICIAD[OA]$/.test(s))       return 'INICIADO';
  return '';   // status nulo, inválido ou fora do domínio conhecido
}

/* Seção 9 — VALIDAÇÃO ÚNICA DE CHEGADA ORIGEM. Reutiliza isoParaMs(), a
   mesma regra já adotada por classificarPedido() para as comparações de
   prazo: null, undefined, string vazia, apenas espaços, placeholders,
   datas inválidas e formatos incompatíveis devolvem null. Uma string não
   vazia que não represente uma data válida NÃO conta como chegada. */
function chegadaOrigemMs(r){ return r ? isoParaMs(r.chegada_iso) : null; }
function hasChegadaOrigem(r){ return chegadaOrigemMs(r) != null; }

/* Seções 2 e 3 — os dois indicadores de STATUS OPERACIONAL. O pedido só é
   contabilizado quando o status normalizado corresponde E não existe
   CHEGADA ORIGEM válida: a movimentação operacional prevalece sobre o
   texto. Registrada a chegada, o pedido sai destes KPIs e segue sendo
   avaliado normalmente pelas regras de prazo (seção 7). */
function isStatusIniciado(r){
  return normStatusOperacional(r && r.status) === 'INICIADO' && !hasChegadaOrigem(r);
}
function isStatusNaoIniciado(r){
  return normStatusOperacional(r && r.status) === 'NAO_INICIADO' && !hasChegadaOrigem(r);
}

/* ---- Alteração 22 — nomenclatura única dos estados operacionais ----
   `curto` é o texto usado nos cards e chips; `label` é a descrição completa
   usada em tooltips, tabela, Relatório de Cobranças e Download Excel. */
const PEDIDO_STATUS_DEFS = {
  atraso:     { curto: 'Pedidos em Atraso',    label: 'Pedido em Atraso',           cor: '#d1573f', ico: '🔴', badge: 'bad'  },
  dentro:     { curto: 'Dentro da Janela',     label: 'Dentro da Janela',           cor: '#4e7fd1', ico: '🔵', badge: 'info' },
  iniciado:   { curto: 'Iniciado',             label: 'Iniciado',                   cor: '#e0a13c', ico: '🟠', badge: 'warn' },
  fin_prazo:  { curto: 'FIN. DENTRO DO PRAZO', label: 'Finalizado Dentro do Prazo', cor: '#2f8f5b', ico: '🟢', badge: 'ok'   },
  fin_atraso: { curto: 'FIN. COM ATRASO',      label: 'Finalizado com Atraso',      cor: '#b04a5a', ico: '🔴', badge: 'bad'  },
  fin_antes:  { curto: 'Finalizado Antecipado',label: 'Finalizado Antecipado',      cor: '#7a5fb5', ico: '🟣', badge: 'warn' },
  sem:        { curto: 'Sem janela',           label: 'Sem janela',                 cor: '#9aa5a6', ico: '⚪', badge: 'na'   },
};
/* Ordem canônica usada no donut "Status geral" e na ordenação da tabela. */
const PEDIDO_STATUS_ORDEM = ['atraso', 'dentro', 'iniciado', 'fin_prazo', 'fin_atraso', 'fin_antes'];

/* Alterações 7, 8, 9, 10, 17, 18, 19 e 20 — classificação completa do pedido.
   Todas as comparações usam data-hora COMPLETAS no fuso America/São Paulo
   (isoParaMs/_agoraMs), tratando corretamente virada de dia, mês e ano. */
function classificarPedido(r){
  const janMs  = isoParaMs(r.janela_iso);
  const chegMs = chegadaOrigemMs(r);   // Alteração 05 · seção 9 — regra única
  const saidMs = isoParaMs(r.saida_iso);
  const hasArrival   = chegMs != null;
  const hasDeparture = saidMs != null;

  const c = {
    hasWindow: janMs != null,
    hasArrival, hasDeparture,
    semChegada: !hasArrival,
    desvioMin: null,
    // estados operacionais exclusivos
    isWithinWindow: false, isLate: false, isInProgress: false,
    isFinishedOnTime: false, isFinishedLate: false, isFinishedEarly: false,
    // auxiliares (compatibilidade com Performance, Ranking e faixa de atraso)
    chegouNoPrazo: false, atrasoOperacional: false,
    // indicadores complementares
    hasGE: hasGE(r), semGE: hasNoGE(r),
    hasNF: hasInvoice(r), semNF: hasNoInvoice(r),
    isNonCompliant: isNonCompliant(r),
    /* ALTERAÇÃO 05 — status operacional: status textual normalizado E sem
       CHEGADA ORIGEM válida. Dimensão independente do prazo (seção 4). */
    isNotStarted: isStatusNaoIniciado(r),
    isStarted:    isStatusIniciado(r),
    code: null,
    label: PEDIDO_STATUS_DEFS.sem.label,
    /* ETAPA 3 · ALTERAÇÃO 04 — categoria operacional EXAUSTIVA.
       Todo pedido pertence a exatamente UMA de quatro categorias:
       'atraso' | 'dentro' | 'fin_prazo' | 'fin_atraso'. A soma das quatro é
       SEMPRE o Total de Pedidos — sem omissão, sem dupla contagem. O status
       textual (Não iniciado/Iniciado/Finalizado) NÃO participa da decisão;
       apenas os campos operacionais e temporais (seção 2 da especificação). */
    categoria: null,
  };

  /* Seção 5 — critério de finalização: Chegada Origem E Saída Origem
     preenchidas (mesma definição já usada por fin_prazo/fin_atraso). */
  const finalizado = hasArrival && hasDeparture;

  if(janMs == null){
    /* Seção 8 — fallback explícito para JANELA vazia/inválida (não há prazo
       a violar, logo o pedido não pode ser tratado como atrasado):
         finalizado → FIN. DENTRO DO PRAZO;  em aberto → Dentro da Janela.
       O pedido NÃO é excluído da contagem (sem filtros silenciosos). Os
       estados detalhados (code) permanecem nulos, preservando o rótulo
       "Sem janela" na tabela. Na base atual não há registros sem janela;
       a regra protege uploads futuros. */
    c.categoria = finalizado ? 'fin_prazo' : 'dentro';
    return c;   // sem janela válida: nenhum estado operacional detalhado
  }

  const tol    = JANELA_TOLERANCIA_MIN * 60000;
  const inicio = janMs - tol;   // Alteração 7 — limite inicial (janela − 30min)
  const fim    = janMs + tol;   // Alteração 7 — limite final  (janela + 30min)

  /* Alteração 8 — sem Chegada Origem, a referência é o horário atual de
     Brasília; com chegada, a própria chegada. */
  const ref = hasArrival ? chegMs : _agoraMs;
  c.desvioMin        = Math.round((ref - janMs) / 60000);
  c.atrasoOperacional = ref > fim;
  c.chegouNoPrazo     = hasArrival && chegMs >= inicio && chegMs <= fim;

  if(!hasArrival){
    if(_agoraMs > fim){ c.code = 'atraso'; c.isLate = true; }           // Alteração 9
    else              { c.code = 'dentro'; c.isWithinWindow = true; }   // Alteração 10
  } else if(!hasDeparture){
    c.code = 'iniciado'; c.isInProgress = true;                         // Alteração 16
  } else if(chegMs > fim){
    c.code = 'fin_atraso'; c.isFinishedLate = true;                     // Alteração 18
  } else if(chegMs < inicio){
    c.code = 'fin_antes'; c.isFinishedEarly = true;                     // Alteração 19
  } else {
    c.code = 'fin_prazo'; c.isFinishedOnTime = true;                    // Alteração 17
  }
  c.label = PEDIDO_STATUS_DEFS[c.code].label;

  /* ALTERAÇÃO 04 · Seção 5 — ORDEM OBRIGATÓRIA DE DECISÃO (determinística):
     Etapa 1 — finalizado (Chegada + Saída)?
         chegada ≤ janela + 30 min → FIN. DENTRO DO PRAZO
         chegada >  janela + 30 min → FIN. COM ATRASO
       Conclusão antecipada (chegada antes de janela − 30 min) NÃO é atraso:
       o prazo é o limite FINAL da janela; quem concluiu antes dele concluiu
       dentro do prazo. O detalhe "Finalizado Antecipado" segue disponível em
       code/label para a tabela, como informação complementar.
     Etapa 2 — não finalizado (independe do status textual):
         referência = Chegada Origem, ou o horário atual de Brasília se ainda
         não houve chegada (Alteração 8 — mesma referência já adotada);
         referência ≤ janela + 30 min → Dentro da Janela
         referência >  janela + 30 min → Pedidos em Atraso */
  if(finalizado){
    c.categoria = (chegMs > fim) ? 'fin_atraso' : 'fin_prazo';
  } else {
    c.categoria = (ref > fim) ? 'atraso' : 'dentro';
  }
  return c;
}

/* Acesso memoizado — 1 cálculo por registro por ciclo de atualização.
   Mantido o nome statusJanela() das etapas anteriores para não quebrar os
   componentes já existentes; o retorno agora é o objeto completo. */
function statusJanela(r){
  if(r._sjStamp !== _statusStamp){
    r._sj = classificarPedido(r);
    r._sjStamp = _statusStamp;
  }
  return r._sj;
}

/* Etiqueta curta + badge do estado operacional (usada na tabela detalhada). */
function statusDef(r){
  return PEDIDO_STATUS_DEFS[statusJanela(r).code || 'sem'];
}

/* Alteração 9 — formata o desvio da janela: "HH:mm (ANTES|APÓS|NO HORÁRIO)";
   períodos acima de 24h usam o formato "1d 02:15 (APÓS)". */
function fmtDesvio(min){
  if(min == null) return '—';
  const rounded = Math.round(min);
  const pad = n => String(n).padStart(2,'0');
  if(rounded === 0) return '00:00 (NO HORÁRIO)';
  const abs = Math.abs(rounded);
  const d = Math.floor(abs / 1440), hh = Math.floor((abs % 1440) / 60), mm = abs % 60;
  const corpo = (d > 0 ? d + 'd ' : '') + pad(hh) + ':' + pad(mm);
  return corpo + ' ' + (rounded < 0 ? '(ANTES)' : '(APÓS)');
}

/* Célula HTML do desvio, com tooltip quando calculado com o horário atual. */
function desvioCellHtml(r){
  const sj = statusJanela(r);
  if(sj.desvioMin == null) return '<span class="desvio-zero">—</span>';
  const cls = Math.round(sj.desvioMin) === 0 ? 'desvio-zero' : (sj.desvioMin < 0 ? 'desvio-antes' : 'desvio-apos');
  const aoVivo = sj.semChegada
    ? ' desvio-agora" title="Chegada ainda não registrada — cálculo baseado no horário atual de Brasília'
    : '';
  return '<span class="' + cls + aoVivo + '">' + fmtDesvio(sj.desvioMin) + (sj.semChegada ? ' ⏱' : '') + '</span>';
}

/* Alteração 6.2 — célula "Status Não Conforme" (texto + ícone, não só cor).
   Etapa 3 · Alteração 14 — a decisão vem da regra central isNonCompliant(). */
function ncCellHtml(r){
  if(ncIndefinido(r)) return '<span class="cob-badge na nc-cell">Não informado</span>';
  if(isNonCompliant(r)) return '<span class="cob-badge bad nc-cell" title="' + esc((r.status_nc || '') + (r.motivo_nc ? ' — ' + r.motivo_nc : '')) + '">⚠ Sim — Não Conforme</span>';
  return '<span class="cob-badge ok nc-cell">Não — Conforme</span>';
}
function ncTexto(r){
  if(ncIndefinido(r)) return 'Não informado';
  return isNonCompliant(r) ? 'Sim' : 'Não';
}

let currentAgl = null;

/* ---- Estado global de filtros (Torre de Controle) ----
   Todos os filtros abaixo são cumulativos e alimentam filteredData(), que por
   sua vez abastece KPIs, gráficos, tabelas, rankings, árvore e mapa. */
/* Etapa 3 · Alteração 01 — `fornecedor` entra no MESMO objeto de estado dos
   demais filtros globais; nenhum pipeline paralelo foi criado. Por viver em
   filteredData(), o filtro é automaticamente cumulativo com aglutinador,
   pedido, transportadora, data, modal e cards de indicador, e propaga para
   evolução, mapa, tabela, KPIs e para o módulo PERFORMANCE TRANSPORTADORAS
   (que consome filteredData() através de cobFilteredData()). */
const gFilters = { pedido: '', aglutinador: '', fornecedor: '', kpi: null };
let gmsTransp = null, gmsData = null, gmsModal = null; // multi-selects da aba 1

// resumo de cada aglutinador — recalculado conforme o filtro de transportadora ativo
function computeAglSummary(){
  const map = new Map();
  filteredData().forEach(r=>{
    if(!map.has(r.aglutinador)) map.set(r.aglutinador, {agl:r.aglutinador, count:0, statuses:{}});
    const s = map.get(r.aglutinador);
    s.count++;
    s.statuses[r.status] = (s.statuses[r.status]||0)+1;
  });
  return [...map.values()].map(s=>{
    const domStatus = s.statuses['Não iniciado'] ? 'Não iniciado' : (s.statuses['Iniciado'] ? 'Iniciado' : 'Finalizado');
    return {agl:s.agl, count:s.count, domStatus};
  }).sort((a,b)=> a.agl.localeCompare(b.agl));
}


function renderAglList(){
  /* Alteração 1.1 — o campo duplicado "Buscar aglutinador" foi removido;
     a pesquisa por aglutinador é feita pelo filtro principal "Aglutinador". */
  const summary = computeAglSummary();
  const filtered = summary;
  document.getElementById('aglListCount').textContent = filtered.length + ' aglutinadores';
  const container = document.getElementById('aglList');
  if(!filtered.length){
    container.innerHTML = '<div class="t1-item-empty">Nenhum aglutinador encontrado com os filtros atuais.</div>';
    return;
  }
  /* Etapa 4 · Alteração 26 — o código do aglutinador vem da planilha
     (conteúdo não confiável): TODA inserção via innerHTML passa por esc(),
     inclusive o atributo data-agl. O clique continua lendo getAttribute(),
     que devolve o valor já decodificado — comportamento inalterado. */
  container.innerHTML = filtered.map(s=>`
    <div class="t1-item ${s.agl===currentAgl?'active':''}" data-agl="${esc(s.agl).replace(/"/g,'&quot;')}">
      <span class="t1-item-dot" style="background:${COLORS[s.domStatus]};"></span>
      <div class="t1-item-body">
        <div class="t1-item-code">${esc(s.agl)}</div>
        <div class="t1-item-sub">${s.count} pedido${s.count>1?'s':''} · ${esc(s.domStatus)}</div>
      </div>
    </div>`).join('');
}

function setupAglList(){
  /* Alteração 1.4 — clique simples seleciona e filtra; clique duplo no item
     selecionado desmarca e limpa somente o filtro de aglutinador. Um pequeno
     atraso no clique simples evita conflito entre os dois gestos. */
  const container = document.getElementById('aglList');
  let clickTimer = null;
  container.addEventListener('click', e=>{
    const item = e.target.closest('.t1-item');
    if(!item || e.detail > 1) return;           // deixa o dblclick tratar
    const agl = item.getAttribute('data-agl');
    clearTimeout(clickTimer);
    clickTimer = setTimeout(()=>{
      if(currentAgl !== agl){ currentAgl = agl; refreshAll(); }
    }, 220);
  });
  container.addEventListener('dblclick', e=>{
    const item = e.target.closest('.t1-item');
    if(!item) return;
    clearTimeout(clickTimer);
    const agl = item.getAttribute('data-agl');
    if(currentAgl === agl){ currentAgl = null; }  // desmarca (equivale a limpar o filtro de aglutinador)
    else { currentAgl = agl; }
    refreshAll();
  });
}

function badgeClass(s){
  if(s==='Finalizado') return 'b-finalizado';
  if(s==='Iniciado') return 'b-iniciado';
  return 'b-naoiniciado';
}

function fmtMin(min){
  if(min==null) return '—';
  const sign = min<0 ? -1 : 1;
  const abs = Math.abs(min);
  const h = Math.floor(abs/60), m = Math.round(abs%60);
  const txt = (h>0 ? h+'h ' : '') + m + 'min';
  return txt;
}

/* ==========================================================================
   FILTROS GLOBAIS DA TORRE DE CONTROLE
   KPIs clicáveis + barra de filtros da aba 1 (padrão visual "Cobranças Status")
   ========================================================================== */

/* ---- Etapa 3 · Alteração 3 — regra única de Nota Fiscal ----
   hasInvoice() é a ÚNICA fonte de verdade sobre "pedido com NF"; os cards
   Com NF e Sem NF derivam dela e são, por construção, mutuamente exclusivos
   e exaustivos (Com NF + Sem NF = Total de Pedidos).

   A base já entrega o campo booleano `tem_nf`, derivado de `qtde_nf` na
   transformação da planilha (transformSheetRows). Mesmo assim a função aceita
   as demais formas encontradas em bases de origem (número, "SIM"/"NÃO",
   "1"/"0", "TRUE"/"FALSE", "-", vazio, null) para que uma futura mudança de
   layout não gere divergência entre os dois cards. */
const NF_TEXTO_SEM = new Set(['', '-', '--', '0', 'NAO', 'NÃO', 'N', 'FALSE', 'F', 'NULL', 'UNDEFINED', 'NENHUMA', 'SEM NF']);

function hasInvoice(r){
  if(!r) return false;
  if(typeof r.tem_nf === 'boolean') return r.tem_nf;
  const q = r.qtde_nf;
  if(typeof q === 'number' && isFinite(q)) return q > 0;
  const v = r.tem_nf != null ? r.tem_nf : q;
  if(v == null) return false;
  if(typeof v === 'number') return isFinite(v) && v > 0;
  const s = String(v).trim().toUpperCase();
  return !NF_TEXTO_SEM.has(s);
}

/* Complementar exato de hasInvoice() — nunca uma segunda regra independente. */
function hasNoInvoice(r){ return !hasInvoice(r); }

/* Alteração 21 — cada card de indicador atua como filtro inteligente e
   cumulativo sobre toda a aplicação. Alteração 3 — TODOS os predicados leem as
   flags da regra central classificarPedido(); nenhum card possui regra própria. */
const KPI_FILTERS = {
  /* ALTERAÇÃO 04 — as quatro chaves operacionais leem a categoria EXAUSTIVA
     da regra central: atraso + dentro + fin_prazo + fin_atraso = Total de
     Pedidos, sempre. Cards, gráficos e filtros usam o mesmo valor. */
  atraso:       r => statusJanela(r).categoria === 'atraso',
  dentro:       r => statusJanela(r).categoria === 'dentro',
  sem_ge:       r => statusJanela(r).semGE,              // Alteração 11
  com_nf:       r => statusJanela(r).hasNF,              // Alteração 12
  sem_nf:       r => statusJanela(r).semNF,              // Alteração 13
  nao_conforme: r => statusJanela(r).isNonCompliant,     // Alteração 14
  /* ALTERAÇÃO 05 — dimensão de STATUS OPERACIONAL (não de prazo): status
     normalizado + ausência de CHEGADA ORIGEM. Estes dois indicadores NÃO
     entram na soma exaustiva das quatro categorias acima e podem se
     sobrepor a 'atraso' e 'dentro' — sobreposição intencional. */
  nao_iniciado: r => statusJanela(r).isNotStarted,       // Alterações 15 e 05
  iniciado:     r => statusJanela(r).isStarted,          // Alterações 16 e 05
  fin_prazo:    r => statusJanela(r).categoria === 'fin_prazo',
  fin_atraso:   r => statusJanela(r).categoria === 'fin_atraso',
};

/* ==========================================================================
   ETAPA 3 · ALTERAÇÃO 03 — FONTE ÚNICA DE VERDADE DOS INDICADORES
   --------------------------------------------------------------------------
   calcularIndicadores() é a ÚNICA função que conta pedidos por indicador em
   toda a aplicação. É consumida por:
     • buildKpis()          — os 11 cards do topo;
     • Status geral dos pedidos       (Alteração 03.1);
     • Performance por transportadora (Alteração 03.2).
   Nenhum componente possui contagem própria: todos recebem o MESMO conjunto
   já filtrado e aplicam os MESMOS predicados de KPI_FILTERS, que por sua vez
   leem a classificação central classificarPedido(). Assim é impossível haver
   divergência entre card e gráfico.

   @param {Array}  rows   conjunto JÁ FILTRADO de pedidos
   @param {Array} [chaves] subconjunto de chaves de KPI_FILTERS; por padrão,
                           todas. Devolve { total, <chave>: qtde, ... }.
   ========================================================================== */
function calcularIndicadores(rows, chaves){
  const keys = chaves || Object.keys(KPI_FILTERS);
  const ind = { total: rows.length };
  keys.forEach(k => { ind[k] = 0; });
  rows.forEach(r => {
    for(let i = 0; i < keys.length; i++){
      if(KPI_FILTERS[keys[i]](r)) ind[keys[i]]++;
    }
  });
  return ind;
}

/* ALTERAÇÃO 04 · Seção 12 — VALIDAÇÃO MATEMÁTICA OBRIGATÓRIA.
   Após cada consolidação, confere soma das 4 categorias = Total de Pedidos.
   Divergindo, registra no console (ambiente de desenvolvimento) o total, o
   classificado, a diferença e os pedidos não classificados — sem ajustar
   valores artificialmente: a correção deve ocorrer na regra de origem.
   Dupla contagem é estruturalmente impossível (categoria é um único valor
   por pedido), mas a soma também a denunciaria (soma > total). */
function validarClassificacao(rows, ind){
  const soma = GRAFICO_CHAVES.reduce((a, k) => a + (ind[k] || 0), 0);
  if(soma === ind.total) return true;
  const semCategoria = rows.filter(r => GRAFICO_CHAVES.indexOf(statusJanela(r).categoria) < 0)
    .map(r => r.pedido);
  console.warn('[Torre de Controle] Divergência de classificação operacional', {
    totalDePedidos: ind.total,
    totalClassificado: soma,
    diferenca: ind.total - soma,
    pedidosSemClassificacao: semCategoria,
  });
  return false;
}

/* Categorias oficiais dos gráficos operacionais (Alterações 03.1 e 03.2).
   A ordem define fatias, barras e legenda. Cada categoria aponta para a MESMA
   chave de KPI_FILTERS e para a MESMA cor do card correspondente — mudar um
   indicador em PEDIDO_STATUS_DEFS/KPI_FILTERS reflete automaticamente aqui.
   A 5ª categoria da especificação, "Total de Pedidos", não é uma fatia: ela é
   a BASE 100% (centro da rosca e 1ª linha da legenda), pois somar o total às
   suas próprias parcelas contaria cada pedido duas vezes. */
/* Etapa 3 · Alterações 12 e 13 — os rótulos EXIBIDOS das quatro categorias
   passam a ser apresentados em letras maiúsculas. Apenas `lbl` (camada de
   apresentação) mudou: as chaves internas (`key`) continuam idênticas, os
   valores seguem vindo de calcularIndicadores() → classificarPedido() e
   nenhum cálculo novo foi criado. Como legenda, rótulos, tooltips e nomes de
   série dos dois gráficos leem esta MESMA lista, a padronização é aplicada
   simultaneamente em todos eles. */
const GRAFICO_CATEGORIAS = [
  { key:'fin_prazo',  lbl:'FIN. DENTRO DO PRAZO', cor: PEDIDO_STATUS_DEFS.fin_prazo.cor  },
  { key:'fin_atraso', lbl:'FIN. COM ATRASO',      cor: PEDIDO_STATUS_DEFS.fin_atraso.cor },
  { key:'atraso',     lbl:'PEDIDOS EM ATRASO',    cor: PEDIDO_STATUS_DEFS.atraso.cor     },
  { key:'dentro',     lbl:'DENTRO DA JANELA',     cor: PEDIDO_STATUS_DEFS.dentro.cor     },
];
const GRAFICO_CHAVES = GRAFICO_CATEGORIAS.map(c => c.key);

/* Alteração 03.2 — mesma função, aplicada por transportadora.
   1) agrupa o conjunto já filtrado; 2) roda calcularIndicadores() em cada
   grupo; 3) ordena por volume. Nenhuma regra específica de gráfico. */
function calcularIndicadoresPorTransportadora(rows){
  const grupos = new Map();
  rows.forEach(r => {
    const t = normCampo(r.transportador);   // "Não informado" entra no cálculo
    let g = grupos.get(t);
    if(!g){ g = []; grupos.set(t, g); }
    g.push(r);
  });
  return [...grupos.entries()]
    .map(([nome, itens]) => Object.assign({ nome }, calcularIndicadores(itens, GRAFICO_CHAVES)))
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR'));
}

/* Pipeline global — todos os filtros são cumulativos */
function filteredData(){
  const selT = gmsTransp ? gmsTransp.getSelected() : null;
  const selD = gmsData   ? gmsData.getSelected()   : null;
  const selM = gmsModal  ? gmsModal.getSelected()  : null;
  const ped  = gFilters.pedido;
  const agl  = gFilters.aglutinador.toLowerCase();
  const forn = gFilters.fornecedor.toLowerCase();   // Alteração 01
  const kpiF = gFilters.kpi ? KPI_FILTERS[gFilters.kpi] : null;
  return RAW.filter(r =>
    (!selT || selT.has(r.transportador)) &&
    (!selD || selD.has(r.janela_data)) &&
    (!selM || selM.has(r.modal)) &&
    (!ped  || String(r.pedido ?? '').includes(ped)) &&
    (!agl  || (r.aglutinador || '').toLowerCase().includes(agl)) &&
    /* Alteração 01 — mesma regra de comparação já usada pelo filtro de
       fornecedor do outro módulo: correspondência parcial, sem diferenciar
       maiúsculas de minúsculas, sobre o campo FORNECEDOR da base. */
    (!forn || (r.fornecedor || '').toLowerCase().includes(forn)) &&
    (!kpiF || kpiF(r))
  );
}

/* Sempre que um filtro global muda: valida o aglutinador selecionado e redesenha */
function globalFiltersChanged(){
  if(currentAgl && !filteredData().some(r => r.aglutinador === currentAgl)){
    currentAgl = null;
  }
  refreshAll();
}

/* ==========================================================================
   ETAPA 3 (revisão) · ALTERAÇÃO 02 — FORMATAÇÃO NUMÉRICA ÚNICA (DRY)
   --------------------------------------------------------------------------
   Regra geral dos indicadores: todo KPI exibe QUANTIDADE ABSOLUTA e
   PERCENTUAL calculado sobre o Total de Pedidos filtrado — qtde ÷ total × 100.
   O Total de Pedidos é sempre a base 100%; nenhum indicador usa outra
   referência. As funções abaixo são a ÚNICA implementação de formatação de
   números e percentuais dos cards, garantindo que nenhum KPI se comporte de
   forma diferente dos demais.

   PCT_CASAS é o único ponto de ajuste da precisão dos percentuais:
     1 → 6,1%   (padrão atual, coerente com gráficos e ranking)
     2 → 6,06%  (basta trocar este valor — nada mais precisa ser alterado)
   ========================================================================== */
const PCT_CASAS = 1;
const PCT_ZERO  = (0).toFixed(PCT_CASAS).replace('.', ',') + '%';

/* Quantidade absoluta no padrão brasileiro (separador de milhar): 5.251 */
function fmtIntBR(n){
  const v = Number(n);
  return isFinite(v) ? v.toLocaleString('pt-BR') : '0';
}

/* Percentual sobre uma base. Total zero, valor nulo ou negativo devolvem
   `textoSemBase` (por padrão "0,0%") — nunca NaN, Infinity, vazio ou
   percentual negativo. */
function fmtPctBR(valor, total, textoSemBase){
  if(!(total > 0)) return textoSemBase !== undefined ? textoSemBase : PCT_ZERO;
  const v = (valor > 0) ? valor : 0;
  return (v / total * 100).toFixed(PCT_CASAS).replace('.', ',') + '%';
}

/* ---- KPIs do topo — mesmo componente visual da aba Cobranças Status ---- */
function buildKpis(){
  /* Alteração 4 — universo de cálculo: base original → filtros globais ativos
     → total de pedidos filtrados → classificação → indicadores → render.
     cobFilteredData() já é o conjunto resultante de TODOS os filtros globais
     (pedido, aglutinador, transportadora, data, modal, fornecedor, seleções
     nos gráficos e o próprio card ativo). */
  const rows = cobFilteredData();
  /* Alteração 03 — os cards deixam de contar por conta própria: consomem o
     serviço central, exatamente o mesmo usado pelos dois gráficos. */
  const ind = calcularIndicadores(rows);
  const total = ind.total;

  /* Alteração 5 — fórmula padrão dos percentuais: qtde ÷ total filtrado × 100,
     no padrão brasileiro. Implementação única em fmtPctBR() — idêntica para os
     11 cards. Total zero devolve 0,0%: nunca NaN, Infinity, vazio ou negativo. */
  const pct = v => fmtPctBR(v, total);

  /* Alteração 22 — textos curtos nos cards; descrição completa no tooltip. */
  const kpis = [
    { key:null,           lbl:'Total de Pedidos',      ico:'📋', color:'#3aa79f',
      tip:'Total de pedidos válidos após os filtros ativos · clique para limpar o filtro de indicador' },
    { key:'atraso',       lbl:'Pedidos em Atraso',     ico:'🕐', color:'#d1573f',
      tip:'Pedido em Atraso — não finalizado (sem Saída Origem) e já passou da janela + 30 min. Referência: Chegada Origem ou, sem chegada, o horário atual de Brasília. Independe do status textual.' },
    { key:'dentro',       lbl:'Dentro da Janela',      ico:'✅', color:'#4e7fd1',
      tip:'Dentro da Janela — não finalizado e ainda dentro do prazo (até janela + 30 min). Independe do status textual (Não iniciado/Iniciado).' },
    { key:'sem_ge',       lbl:'Sem GE',                ico:'⏳', color:'#e0a13c',
      tip:'Sem GE — pedidos sem Gestão Embarcada válida' },
    { key:'com_nf',       lbl:'Com NF',                ico:'🧾', color:'#2f8f5b',
      tip:'Com NF — pedidos com Nota Fiscal válida' },
    { key:'sem_nf',       lbl:'Sem NF',                ico:'📄', color:'#c9682f',
      tip:'Sem NF — pedidos sem Nota Fiscal válida (Com NF + Sem NF = Total de Pedidos)' },
    { key:'nao_conforme', lbl:'Não Conformidade',      ico:'🛡️', color:'#b04a5a',
      tip:'Não Conformidade — pedidos com Status Não Conforme identificado' },
    { key:'nao_iniciado', lbl:'Não Iniciado',          ico:'⏸️', color:'#9aa5a6',
      tip:'Não Iniciado — status \"Não Iniciado\" na base E sem Chegada Origem registrada. Percentual sobre o Total de Pedidos filtrado. Dimensão de status, independente do prazo: pode aparecer também em Pedidos em Atraso ou Dentro da Janela.' },
    { key:'iniciado',     lbl:'Iniciado',              ico:'▶️', color:'#4e7fd1',
      tip:'Iniciado — status \"Iniciado\" na base E sem Chegada Origem registrada. Havendo chegada, o pedido deixa este KPI e segue avaliado pelas regras de prazo. Dimensão de status, independente do prazo.' },
    /* Alteração 1 (Etapa 3) — novos indicadores de finalização, mesmo padrão
       visual e funcional dos demais cards. */
    { key:'fin_prazo',    lbl:'FIN. DENTRO DO PRAZO',  ico:'🏁', color:'#2f8f5b',
      tip:'Finalizado Dentro do Prazo — Chegada e Saída Origem preenchidas, com chegada até janela + 30 min (conclusões antecipadas contam como dentro do prazo)' },
    { key:'fin_atraso',   lbl:'FIN. COM ATRASO',       ico:'⛔', color:'#b04a5a',
      tip:'Finalizado com Atraso — Chegada e Saída Origem preenchidas, com chegada após janela + 30 min' },
  ];

  kpis.forEach(k => {
    if(k.key){ k.val = ind[k.key]; k.sub = pct(k.val); }
    /* Alteração 6 — Total de Pedidos: base 100% havendo ao menos um pedido; 0 e
       0,0% quando o conjunto filtrado estiver vazio. Usa a MESMA função dos
       demais cards (total ÷ total × 100), sem texto fixo paralelo. */
    else { k.val = total; k.sub = fmtPctBR(total, total); }
  });

  document.getElementById('kpis').innerHTML = kpis.map(k => `
    <div class="cob-kpi clickable ${gFilters.kpi && gFilters.kpi === k.key ? 'active' : ''}"
         style="--kc:${k.color};" data-kpi="${k.key ?? ''}"
         title="${esc(k.tip)}">
      <div class="cob-kpi-ico">${k.ico}</div>
      <div>
        <div class="cob-kpi-lbl">${k.lbl}</div>
        <div class="cob-kpi-val">${fmtIntBR(k.val)}</div>
        <div class="cob-kpi-pct">${k.sub}</div>
      </div>
    </div>`).join('');
}

/* Delegação de clique nos cards (registrada uma única vez) */
function setupKpiFilters(){
  document.getElementById('kpis').addEventListener('click', e => {
    const card = e.target.closest('.cob-kpi');
    if(!card) return;
    const key = card.getAttribute('data-kpi') || null;
    gFilters.kpi = (gFilters.kpi === key) ? null : key; // clique repetido desativa
    globalFiltersChanged();
  });
}

/* ---- Barra de filtros da aba 1 (reutiliza createMultiSelect e autocomplete) ---- */
function populateGlobalMultiSelects(){
  const transp = [...new Set(RAW.map(r => r.transportador).filter(Boolean))].sort()
    .map(v => ({value:v, label:v}));
  const datas = [...new Set(RAW.map(r => r.janela_data).filter(Boolean))].sort()
    .map(v => ({value:v, label:fmtDataBR(v)}));
  const modais = [...new Set(RAW.map(r => r.modal).filter(Boolean))].sort()
    .map(v => ({value:v, label:v}));
  gmsTransp.setOptions(transp);
  gmsData.setOptions(datas);
  gmsModal.setOptions(modais);
}

function resetGlobalFilters(){
  gFilters.pedido = ''; gFilters.aglutinador = ''; gFilters.fornecedor = ''; gFilters.kpi = null;
  const p = document.getElementById('gPedidoSearch');
  const a = document.getElementById('gAglSearch');
  const fo = document.getElementById('gFornSearch');   // Alteração 01
  if(p){ p.value = ''; document.getElementById('gPedidoClear').style.display = 'none'; }
  if(a){ a.value = ''; document.getElementById('gAglClear').style.display = 'none'; }
  if(fo){ fo.value = ''; document.getElementById('gFornClear').style.display = 'none'; }
  if(gmsTransp) gmsTransp.clear();
  if(gmsData) gmsData.clear();
  if(gmsModal) gmsModal.clear();
  populateGlobalMultiSelects();
}

function setupGlobalFilters(){
  gmsTransp = createMultiSelect('gmsTransp', 'Todas', { onChange: globalFiltersChanged });
  gmsData   = createMultiSelect('gmsData',   'Todas', { onChange: globalFiltersChanged, range: true });
  gmsModal  = createMultiSelect('gmsModal',  'Todos', { onChange: globalFiltersChanged });
  populateGlobalMultiSelects();

  setupCobAutocomplete({
    wrapId:'gPedidoWrap', inputId:'gPedidoSearch', clearId:'gPedidoClear', listId:'gPedidoList',
    setValue: v => { gFilters.pedido = v.replace(/\s+/g,''); },
    suggestions: q => [...new Set(RAW.map(r => String(r.pedido)))]
      .filter(pd => pd.includes(q.replace(/\s+/g,''))).sort(),
    onApply: globalFiltersChanged,
  });
  setupCobAutocomplete({
    wrapId:'gAglWrap', inputId:'gAglSearch', clearId:'gAglClear', listId:'gAglSugg',
    setValue: v => { gFilters.aglutinador = v; },
    suggestions: q => [...new Set(RAW.map(r => r.aglutinador).filter(Boolean))]
      .filter(a => a.toLowerCase().includes(q.toLowerCase())).sort(),
    onApply: globalFiltersChanged,
  });
  /* Alteração 01 — filtro FORNECEDOR. Mesmo componente reutilizável
     (setupCobAutocomplete), mesmo comportamento de pesquisa e mesma fonte de
     dados do filtro homônimo do módulo PERFORMANCE TRANSPORTADORAS. A única
     diferença é o destino do valor: aqui ele alimenta o estado GLOBAL, para
     que evolução, aglutinadores, pedidos, mapa, status, tabela e indicadores
     sejam atualizados de forma sincronizada por globalFiltersChanged(). */
  setupCobAutocomplete({
    wrapId:'gFornWrap', inputId:'gFornSearch', clearId:'gFornClear', listId:'gFornList',
    setValue: v => { gFilters.fornecedor = v; },
    suggestions: q => [...new Set(RAW.map(r => r.fornecedor).filter(Boolean))]
      .filter(f => f.toLowerCase().includes(q.toLowerCase())).sort(),
    onApply: globalFiltersChanged,
  });

  document.getElementById('gClearAll').addEventListener('click', () => {
    resetGlobalFilters();
    globalFiltersChanged();
  });

  setupKpiFilters();
}

// ---- Alternância de tema claro/escuro ----
// A implementação vive num <script> inline no index.html, de forma independente
// deste arquivo: assim o botão de tema funciona mesmo se o carregamento das
// bibliotecas de CDN ou de outro trecho deste script falhar.

// ---- Status de upload/importação ----
function showTbStatus(msg, ok){
  const el = document.getElementById('tbStatus');
  el.className = 'tb-status ' + (ok ? 'ok' : 'err');
  el.innerHTML = msg;
}
function hideTbStatus(){
  const el = document.getElementById('tbStatus');
  el.className = 'tb-status';
  el.innerHTML = '';
}

// ---- Upload e reprocessamento da planilha followup_ped_ge ----
const REQUIRED_COLUMNS = ['PEDIDO','AGLUTINADOR','JANELA','FORNECEDOR','MUNICIPIO','TRANSPORTADOR'];

/* ==========================================================================
   Etapa 3 · Alteração 7 — PERSISTÊNCIA DO ÚLTIMO UPLOAD
   --------------------------------------------------------------------------
   A base importada é gravada em localStorage (com nome do arquivo e data/hora)
   e restaurada automaticamente ao reabrir o painel — sem necessidade de novo
   upload. Falhas (cota cheia, armazenamento bloqueado) nunca interrompem o
   fluxo: apenas desativam a persistência daquela sessão.
   ========================================================================== */

const UPLOAD_CACHE_KEY = 'followupUploadCache_v1';

function fmtDataHoraBR(ts){
  const d = new Date(ts);
  const pad = n => String(n).padStart(2,'0');
  return pad(d.getDate()) + '/' + pad(d.getMonth()+1) + '/' + d.getFullYear() + ' às ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function salvarUploadLocal(fileName){
  try{
    // remove campos de memoização (prefixo "_") antes de serializar
    const rows = RAW.map(r => {
      const c = {};
      for(const k in r){ if(k.charAt(0) !== '_') c[k] = r[k]; }
      return c;
    });
    const savedAt = Date.now();
    /* Etapa 4 · Seção 36 — registra QUEM atualizou (e-mail da sessão) junto
       com a data/hora. Exibido na área administrativa; a auditoria oficial
       fica nos logs da function upload-grant (fora do navegador). */
    const sess = (window.TCAuth && window.TCAuth.getSessao()) || null;
    const updatedBy = sess ? sess.email : null;
    localStorage.setItem(UPLOAD_CACHE_KEY, JSON.stringify({ fileName, savedAt, updatedBy, rows }));
    atualizarStatusBaseAdmin({ fileName, savedAt, updatedBy });
    return savedAt;
  }catch(e){
    return null;   // cota excedida / armazenamento indisponível
  }
}

function restaurarUploadSalvo(){
  try{
    const bruto = localStorage.getItem(UPLOAD_CACHE_KEY);
    if(!bruto) return;
    const cache = JSON.parse(bruto);
    if(!cache || !Array.isArray(cache.rows) || !cache.rows.length) return;
    RAW = cache.rows;
    showTbStatus('📤 Base do último upload restaurada automaticamente — <b>' + esc(cache.fileName || 'planilha') + '</b>, enviado em ' + fmtDataHoraBR(cache.savedAt) + ' · ' + RAW.length + ' pedidos.', true);
    atualizarStatusBaseAdmin(cache);
  }catch(e){ /* cache corrompido: mantém a base embutida */ }
}

/* Etapa 4 · Seções 21 e 36 — faixa administrativa: situação da base ativa,
   com última atualização e responsável. Visível apenas para ADMINISTRADOR
   (data-perm no HTML, aplicado pelo auth-client). Conteúdo escapado. */
function atualizarStatusBaseAdmin(cache){
  const el = document.getElementById('adminBaseInfo');
  if(!el) return;
  if(!cache || !cache.savedAt){
    el.textContent = 'Base embutida de referência (' + RAW.length + ' pedidos) — nenhum upload registrado neste navegador.';
    return;
  }
  el.innerHTML = 'Base ativa: <b>' + esc(cache.fileName || 'planilha') + '</b> · ' + RAW.length
    + ' pedidos · Última atualização em <b>' + fmtDataHoraBR(cache.savedAt) + '</b>'
    + (cache.updatedBy ? ' por <b>' + esc(cache.updatedBy) + '</b>' : '')
    + ' · Armazenada localmente neste navegador.';
}

function excelSerialToDate(v){
  if(v instanceof Date) return v;
  if(typeof v === 'number'){
    // serial de data do Excel (base 1899-12-30)
    return new Date(Math.round((v - 25569) * 86400 * 1000));
  }
  if(typeof v === 'string' && v.trim()){
    const d = new Date(v);
    if(!isNaN(d.getTime())) return d;
  }
  return null;
}

function fmtDDMMHHMM(d){
  const pad = n=>String(n).padStart(2,'0');
  return pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+pad(d.getHours())+':'+pad(d.getMinutes());
}

function parseTempoH(v){
  if(v==null || v==='') return null;
  if(typeof v === 'number') return Math.round(v*100)/100;
  const m = String(v).match(/(\d+)\s*h\D+(\d+)\s*min/i);
  if(m) return Math.round((parseInt(m[1],10) + parseInt(m[2],10)/60)*100)/100;
  const asNum = parseFloat(v);
  return isNaN(asNum) ? null : asNum;
}

function transformSheetRows(json){
  const errors = [];
  let skipped = 0;
  const out = [];
  json.forEach((row, idx)=>{
    const pedido = row['PEDIDO'];
    const aglutinador = row['AGLUTINADOR'];
    const janelaRaw = row['JANELA'];
    if(pedido==null || pedido==='' || !aglutinador || !janelaRaw){
      skipped++;
      return;
    }
    const janelaD = excelSerialToDate(janelaRaw);
    if(!janelaD){ skipped++; errors.push('Linha '+(idx+2)+': janela inválida.'); return; }
    const chegadaD = excelSerialToDate(row['CHEGADA ORIGEM']);
    const saidaD = excelSerialToDate(row['SAIDA ORIGEM']);
    const inicioD = excelSerialToDate(row['INICIO OPERACAO APP']) || excelSerialToDate(row['INICIO OPERACAO MAN']);
    const fimD = excelSerialToDate(row['FIM OPERACAO APP']) || excelSerialToDate(row['FIM OPERACAO MAN']);

    let status = 'Não iniciado';
    if(fimD) status = 'Finalizado';
    else if(inicioD || chegadaD) status = 'Iniciado';

    const atraso_chegada_min = chegadaD ? Math.round((chegadaD - janelaD)/60000) : null;
    const atraso_saida_min = saidaD ? Math.round((saidaD - janelaD)/60000) : null;
    const permanencia_min = (chegadaD && saidaD) ? Math.round((saidaD - chegadaD)/60000) : null;
    const qtde_nf = Number(row['QTDE NF PEDIDO']) || 0;
    /* Etapa 3 (revisão) · Alteração 05 — FONTE OFICIAL VALIDADA.
       Cabeçalho real da planilha: 'NOTAS FISCAIS PEDIDO' (confirmado na
       aba 'Follow-up Gestao Embarcada'), correspondente à coluna 40 em
       numeração de 1 (índice 39 de 0). O mapeamento é feito pelo NOME do
       cabeçalho — não pela posição — porque sheet_to_json() do SheetJS já
       usa a primeira linha da planilha como chave de cada coluna; não há,
       portanto, deslocamento de índice nem ambiguidade zero-based/one-based
       a resolver aqui. A posição (coluna 40) serve apenas como conferência,
       nunca como forma de acesso ao valor. */
    const notasFiscaisPedidoRaw = row['NOTAS FISCAIS PEDIDO'] != null ? String(row['NOTAS FISCAIS PEDIDO']).trim() : '';
    const lat = row['ULT.POSIÇÃO-LAT']!=null && row['ULT.POSIÇÃO-LAT']!=='' ? parseFloat(row['ULT.POSIÇÃO-LAT']) : null;
    const lng = row['ULT.POSIÇÃO-LNG']!=null && row['ULT.POSIÇÃO-LNG']!=='' ? parseFloat(row['ULT.POSIÇÃO-LNG']) : null;

    out.push({
      pedido: Number(pedido),
      aglutinador: String(aglutinador),
      veiculo_aglutinado: row['VEICULO AGLUTINADO'] || null,
      /* Alteração 06 · seção 22 — identificador oficial do fornecedor. Passa a
         ser a chave de agrupamento (o nome fica apenas para exibição), evitando
         que fornecedores distintos com nomes parecidos sejam consolidados. */
      id_fornecedor: (row['ID FORNECEDOR'] != null && String(row['ID FORNECEDOR']).trim() !== '') ? String(row['ID FORNECEDOR']).trim() : null,
      fornecedor: row['FORNECEDOR'] || null,
      municipio: row['MUNICIPIO'] || null,
      planta: row['PLANTA'] || null,
      transportador: row['TRANSPORTADOR'] || null,
      janela: fmtDDMMHHMM(janelaD),
      janela_iso: janelaD.toISOString(),
      janela_data: janelaD.toISOString().slice(0,10),
      chegada_origem: chegadaD ? fmtDDMMHHMM(chegadaD) : null,
      chegada_iso: chegadaD ? chegadaD.toISOString() : null,
      saida_origem: saidaD ? fmtDDMMHHMM(saidaD) : null,
      saida_iso: saidaD ? saidaD.toISOString() : null,
      atraso_chegada_min, permanencia_min, atraso_saida_min,
      status,
      tempo_h: parseTempoH(row['TEMPO']),
      /* Etapa 3 (revisão) · Alterações 04 a 07 — NOTAS FISCAIS PEDIDO.
         Fonte oficial única: o valor É o texto da coluna 40, exatamente como
         importado (apenas trim — normalização técnica, não reconstrução).
         Nenhuma composição a partir de QTDE NF PEDIDO, GE ou de qualquer
         outra coluna. A leitura de ausência/presença desta informação usa o
         MESMO vocabulário de marcadores (NF_TEXTO_SEM) já oficial no
         restante do sistema — nenhuma regra nova e incompatível. */
      notas_fiscais_pedido: notasFiscaisPedidoRaw,
      /* Etapa 3 · Alteração 02 — TIPO DE PEDIDO. O campo oficial da planilha é
         a coluna TIPO, que JÁ era importada e mapeada internamente como
         `modal`; ela é reutilizada (nenhum campo duplicado é criado). A coluna
         TIPO_ENTRADA é importada em paralelo apenas para deixar a troca de
         origem a um passo, caso a operação defina outro campo como oficial. */
      tipo_entrada: (row['TIPO_ENTRADA'] != null && String(row['TIPO_ENTRADA']).trim() !== '') ? String(row['TIPO_ENTRADA']).trim() : null,
      ans: row['STATUS POSICIONAMENTO'] || 'Dentro do ANS',
      qtde_nf, tem_nf: qtde_nf>0,
      modal: row['TIPO'] || null,
      ge: (row['GE']!=null && String(row['GE']).trim()!=='') ? String(row['GE']).trim() : null,
      tem_ge: row['GE']!=null && String(row['GE']).trim()!=='',
      status_nc: (row['STATUS NÃO CONFORME']!=null && String(row['STATUS NÃO CONFORME']).trim()!=='') ? String(row['STATUS NÃO CONFORME']).trim() : null,
      motivo_nc: (row['MOTIVO NÃO CONFORME']!=null && String(row['MOTIVO NÃO CONFORME']).trim()!=='') ? String(row['MOTIVO NÃO CONFORME']).trim() : null,
      nao_conforme: row['STATUS NÃO CONFORME']!=null && String(row['STATUS NÃO CONFORME']).trim()!=='',
      lat: (lat!=null && !isNaN(lat)) ? lat : null,
      lng: (lng!=null && !isNaN(lng)) ? lng : null,
    });
  });
  return {out, skipped, errors};
}

/* Etapa 4 · Seções 24 a 26 — limites e validações do upload. O arquivo
   nunca sai do navegador (a arquitetura processa a planilha localmente),
   mas a AUTORIZAÇÃO para processá-lo é concedida pelo servidor. */
const UPLOAD_MAX_BYTES = 20 * 1024 * 1024;   // 20 MB — muito acima da base real (~1 MB)
const UPLOAD_MIMES_OK = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel',                                          // .xls
  'application/octet-stream', ''                                       // navegadores/SO sem MIME
]);

function setupUpload(){
  const input = document.getElementById('uploadInput');
  input.addEventListener('change', async ()=>{
    const file = input.files[0];
    if(!file) return;
    /* Seção 24 — extensão E tipo MIME (dupla checagem; a validação
       estrutural das colunas obrigatórias continua logo adiante). */
    const ext = file.name.split('.').pop().toLowerCase();
    if(ext!=='xlsx' && ext!=='xls'){
      showTbStatus('Formato inválido. Envie um arquivo .xlsx ou .xls.', false);
      input.value = '';
      return;
    }
    if(!UPLOAD_MIMES_OK.has(file.type || '')){
      showTbStatus('Tipo de arquivo não reconhecido como planilha Excel. Envie o arquivo original exportado do portal.', false);
      input.value = '';
      return;
    }
    if(file.size > UPLOAD_MAX_BYTES){
      showTbStatus('Arquivo acima do limite de 20 MB. Verifique se este é o export correto da base.', false);
      input.value = '';
      return;
    }

    /* Etapa 4 · Seções 14 a 16 — AUTORIZAÇÃO NA CAMADA CONFIÁVEL. Antes de
       ler um único byte, o servidor (/api/upload-grant) valida sessão,
       identidade e perfil ADMINISTRADOR. Sem essa concessão o processamento
       não começa — reexibir o botão pelo DevTools não a produz, porque o
       cookie de sessão é assinado no servidor e o segredo nunca sai de lá. */
    if(window.TCAuth){
      showTbStatus('<span class="tb-spinner"></span>Validando permissão…', true);
      const grant = await window.TCAuth.solicitarGrantUpload({ arquivo: file.name, tamanho: file.size });
      if(!grant.ok){
        showTbStatus('⛔ ' + esc(grant.erro || 'Você não possui permissão para executar esta operação.'), false);
        input.value = '';
        return;
      }
    }

    showTbStatus('<span class="tb-spinner"></span>Processando planilha…', true);
    const reader = new FileReader();
    reader.onerror = ()=>{ showTbStatus('Não foi possível ler o arquivo.', false); };
    reader.onload = (e)=>{
      try{
        const wb = XLSX.read(new Uint8Array(e.target.result), {type:'array', cellDates:true});
        const sheetName = wb.SheetNames.find(n=>/follow.?up/i.test(n)) || wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, {defval:null, raw:true});
        if(!json.length){ throw new Error('A planilha está vazia.'); }
        const headers = Object.keys(json[0]);
        const missing = REQUIRED_COLUMNS.filter(c=>!headers.includes(c));
        if(missing.length){
          throw new Error('Colunas obrigatórias ausentes: ' + missing.join(', ') + '. Verifique se este é o arquivo exportado do portal ILC.');
        }
        const {out, skipped, errors} = transformSheetRows(json);
        if(!out.length){ throw new Error('Nenhum registro válido foi encontrado no arquivo.'); }

        RAW = out;
        currentAgl = null;
        resetGlobalFilters();
        resetCobFilters();
        refreshAll();

        // Alteração 7 — grava a base para restauração automática
        const salvoEm = salvarUploadLocal(file.name);

        let msg = out.length + ' pedidos importados';
        if(skipped) msg += ', ' + skipped + ' ignorados (dados incompletos)';
        msg += '.';
        if(errors.length) msg += ' ' + errors.length + ' aviso(s) — ex.: ' + errors[0];
        msg += salvoEm
          ? ' Upload salvo em ' + fmtDataHoraBR(salvoEm) + ' — a base será restaurada automaticamente ao reabrir o painel.'
          : ' Não foi possível salvar a base localmente (armazenamento indisponível): será necessário novo upload ao reabrir.';
        showTbStatus(msg, true);
      }catch(err){
        /* Etapa 4 · Alteração 26 — a mensagem pode conter NOMES DE COLUNA
           lidos do próprio arquivo (conteúdo não confiável): esc() antes de
           inserir via innerHTML. A base atual permanece intacta em qualquer
           falha (Seção 24 — o RAW só é substituído após transformação OK). */
        showTbStatus('Falha ao importar: ' + esc(err.message) + ' A base atual foi mantida.', false);
      }finally{
        input.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ---- Exportação para Excel (respeita filtros + busca ativos) ----
function setupDownload(){
  document.getElementById('downloadBtn').addEventListener('click', ()=>{
    const rows = currentDetailRows().slice()
      .sort((a,b)=> (a.janela_iso ? new Date(a.janela_iso).getTime() : Infinity) - (b.janela_iso ? new Date(b.janela_iso).getTime() : Infinity));
    if(!rows.length){ showTbStatus('Nenhum pedido para exportar com os filtros atuais.', false); return; }

    const data = rows.map(r=>({
      'Número do Pedido': r.pedido,
      'Aglutinador': r.aglutinador,
      // Alteração 02 (Etapa 3) — a nova coluna acompanha a exportação, na mesma
      // posição da tabela: entre AGLUTINADOR e PLANTA.
      'Tipo de Pedido': tipoPedido(r),
      'Planta': normCampo(r.planta),           // Alteração 1 (Etapa 3) — entre Aglutinador e Fornecedor
      'Transportadora': r.transportador || '',
      'Fornecedor': r.fornecedor || '',
      'Local de Origem': r.municipio || '',
      'Janela Programada': r.janela || '',
      'Chegada na Origem': r.chegada_origem || '',
      'Saída da Origem': r.saida_origem || '',
      'Status': r.status,
      'Status da Janela': statusJanela(r).label,
      'Desvio da Janela': fmtDesvio(statusJanela(r).desvioMin),
      'Status Não Conforme': ncTexto(r),
      'Observações': r.tem_nf ? ('Com NF ('+r.qtde_nf+')') : 'Sem NF',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const headerKeys = Object.keys(data[0]);
    ws['!cols'] = headerKeys.map(k=>({
      wch: Math.min(40, Math.max(k.length, ...data.map(d=>String(d[k]??'').length)) + 2)
    }));
    headerKeys.forEach((k,i)=>{
      const cellRef = XLSX.utils.encode_cell({r:0, c:i});
      if(ws[cellRef]) ws[cellRef].s = { font:{bold:true}, fill:{fgColor:{rgb:'D7ECE9'}} };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos Vinculados');
    const pad = n=>String(n).padStart(2,'0');
    const now = new Date();
    const stamp = now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+'_'+pad(now.getHours())+'-'+pad(now.getMinutes());
    XLSX.writeFile(wb, 'pedidos_vinculados_cobranca_transportadora_'+stamp+'.xlsx');
  });
}

// ---- TAB 1: Árvore Aglutinador -> Pedido -> Janela / Chegada-Saída / Status ----
function aglRows(){
  return currentAgl ? filteredData().filter(r=>r.aglutinador===currentAgl) : [];
}

function statusLabel(r){
  const parts = [];
  if(r.atraso_chegada_min==null) parts.push('Sem chegada registrada');
  else if(r.atraso_chegada_min>0) parts.push('Chegou ' + fmtMin(r.atraso_chegada_min) + ' após a janela');
  else if(r.atraso_chegada_min<0) parts.push('Chegou ' + fmtMin(r.atraso_chegada_min) + ' antes da janela');
  else parts.push('Chegou no horário da janela');
  parts.push('Status: ' + r.status);
  if(r.ans) parts.push(r.ans);
  return parts;
}

function uniq(arr){ return [...new Set(arr.filter(x=>x!=null))]; }

function fmtList(arr, max){
  max = max || 3;
  if(!arr.length) return '—';
  if(arr.length<=max) return arr.join('  |  ');
  return arr.slice(0,max).join('  |  ') + '  … (+' + (arr.length-max) + ')';
}

function groupByFornecedor(rows){
  const map = new Map();
  rows.forEach(r=>{
    const key = r.fornecedor || 'Sem fornecedor';
    if(!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  });
  return [...map.entries()].map(([fornecedor, grp])=>{
    const janelas = uniq(grp.map(r=>r.janela));
    const chegadas = uniq(grp.map(r=>r.chegada_origem));
    const saidas = uniq(grp.map(r=>r.saida_origem));
    const municipios = uniq(grp.map(r=>r.municipio));
    const statuses = {};
    grp.forEach(r=> statuses[r.status] = (statuses[r.status]||0)+1);
    const atrasos = grp.map(r=>r.atraso_chegada_min).filter(x=>x!=null);
    const qtdeNfTotal = grp.reduce((s,r)=>s+(r.qtde_nf||0),0);
    const times = [];
    grp.forEach(r=>{
      if(r.janela_iso) times.push(new Date(r.janela_iso).getTime());
      else if(r.chegada_iso) times.push(new Date(r.chegada_iso).getTime());
    });
    const sortTime = times.length ? Math.min(...times) : Infinity;
    return {
      fornecedor, municipio: municipios[0]||'',
      pedidos: grp.map(r=>r.pedido),
      janelas, chegadas, saidas, statuses, atrasos, qtdeNfTotal, sortTime
    };
  });
}

function statusSummaryText(g){
  const statusTxt = Object.entries(g.statuses).map(([k,v])=> (v>1? v+'x ':'') + k).join(', ');
  let delayTxt = '';
  if(g.atrasos.length){
    const mx = Math.max(...g.atrasos), mn = Math.min(...g.atrasos);
    if(mx===mn) delayTxt = (mx>0? 'Chegada '+fmtMin(mx)+' após a janela' : (mx<0 ? 'Chegada '+fmtMin(mx)+' antes da janela' : 'Chegada no horário da janela'));
    else delayTxt = 'Atraso de chegada entre ' + fmtMin(mn) + ' e ' + fmtMin(mx);
  }
  return [statusTxt, delayTxt].filter(Boolean).join(' · ') + (g.qtdeNfTotal ? ' · ' + g.qtdeNfTotal + ' NF' : ' · sem NF');
}

function esc(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

function truncate(text, maxChars){
  text = String(text==null?'':text);
  if(text.length <= maxChars) return text;
  return text.slice(0, Math.max(1,maxChars-1)) + '…';
}

function wrapText(svgParts, text, x, y, w, opts){
  const words = String(text).split(' ');
  const size = opts.size || 11;
  const lineH = opts.lineH || Math.round(size*1.2);
  let line = '';
  const lines = [];
  const maxChars = Math.floor(w / (opts.charW || size*0.58));
  words.forEach(word=>{
    const test = line ? line + ' ' + word : word;
    if(test.length > maxChars && line){ lines.push(line); line = word; }
    else line = test;
  });
  if(line) lines.push(line);
  if(opts.maxLines && lines.length > opts.maxLines){
    lines.length = opts.maxLines;
    let last = lines[opts.maxLines-1];
    lines[opts.maxLines-1] = last.length>2 ? last.slice(0, last.length-1)+'…' : last+'…';
  }
  const startY = y - ((lines.length-1)*lineH)/2;
  lines.forEach((l,i)=>{
    svgParts.push(`<text x="${x}" y="${startY + i*lineH}" text-anchor="middle" font-size="${size}" font-weight="${opts.weight||400}" fill="${opts.color||'#1c2b2e'}">${esc(l)}</text>`);
  });
  return lines.length;
}

function elbowPath(x0,y0,x1,y1){
  const midX = x0 + (x1-x0)*0.55;
  return `M ${x0} ${y0} L ${midX} ${y0} L ${midX} ${y1} L ${x1} ${y1}`;
}

function curvePath(x0,y0,x1,y1){
  const midX = x0 + (x1-x0)*0.5;
  return `M ${x0} ${y0} C ${midX} ${y0} ${midX} ${y1} ${x1} ${y1}`;
}

function iconClock(cx,cy,r,color){
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="1.3"/>
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-r*0.55}" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${cx+r*0.4}" y2="${cy}" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>`;
}
function iconPin(cx,cy,r,color){
  return `<path d="M ${cx} ${cy-r} C ${cx+r} ${cy-r} ${cx+r*1.05} ${cy+r*0.25} ${cx} ${cy+r*1.25} C ${cx-r*1.05} ${cy+r*0.25} ${cx-r} ${cy-r} ${cx} ${cy-r} Z" fill="none" stroke="${color}" stroke-width="1.3"/>
    <circle cx="${cx}" cy="${cy-r*0.2}" r="${r*0.32}" fill="${color}"/>`;
}
function iconCheck(cx,cy,r,color){
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="1.3"/>
    <path d="M ${cx-r*0.5} ${cy} L ${cx-r*0.05} ${cy+r*0.42} L ${cx+r*0.55} ${cy-r*0.42}" fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function iconBox(cx,cy,r,color){
  return `<path d="M ${cx-r} ${cy-r*0.42} L ${cx} ${cy-r*0.85} L ${cx+r} ${cy-r*0.42} L ${cx+r} ${cy+r*0.5} L ${cx} ${cy+r*0.9} L ${cx-r} ${cy+r*0.5} Z" fill="none" stroke="${color}" stroke-width="1.3" stroke-linejoin="round"/>
    <line x1="${cx-r}" y1="${cy-r*0.42}" x2="${cx}" y2="${cy}" stroke="${color}" stroke-width="1.1"/>
    <line x1="${cx+r}" y1="${cy-r*0.42}" x2="${cx}" y2="${cy}" stroke="${color}" stroke-width="1.1"/>
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy+r*0.9}" stroke="${color}" stroke-width="1.1"/>`;
}
function iconTruck(cx,cy,r,color){
  return `<rect x="${cx-r}" y="${cy-r*0.35}" width="${r*1.2}" height="${r*0.85}" rx="1.5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <path d="M ${cx+r*0.2} ${cy-r*0.1} L ${cx+r*0.85} ${cy-r*0.1} L ${cx+r*1.1} ${cy+r*0.2} L ${cx+r*1.1} ${cy+r*0.5} L ${cx+r*0.2} ${cy+r*0.5} Z" fill="none" stroke="${color}" stroke-width="1.2" stroke-linejoin="round"/>
    <circle cx="${cx-r*0.45}" cy="${cy+r*0.55}" r="${r*0.22}" fill="${color}"/>
    <circle cx="${cx+r*0.65}" cy="${cy+r*0.55}" r="${r*0.22}" fill="${color}"/>`;
}

/* ==========================================================================
   ETAPA 3 · ALTERAÇÃO 06 — EVOLUÇÃO DOS PEDIDOS (ROTA POR FORNECEDOR)
   --------------------------------------------------------------------------
   Seção 27 — FONTE ÚNICA DE VERDADE. construirRotaFornecedores() é o único
   selector que agrupa pedidos por fornecedor dentro de um aglutinador. É
   consumido pelo componente Evolução dos Pedidos, pelo mapa de fornecedores,
   pelo perfil do veículo e pelo cálculo de rota. Nenhum deles aplica filtro
   próprio, normaliza fornecedor de forma diferente, calcula status
   separadamente nem interpreta CHEGADA/SAÍDA com regra distinta: o estado
   operacional vem SEMPRE de statusJanela() → classificarPedido().
   ========================================================================== */

/* Seção 22 — CHAVE DE AGRUPAMENTO DO FORNECEDOR.
   Quando a base traz o identificador oficial (ID FORNECEDOR), ele é a chave;
   o nome serve apenas para exibição. Fornecedores diferentes com nomes
   parecidos NÃO são agrupados. Sem identificador (bases anteriores à
   Alteração 06), o fallback é o nome normalizado — maiúsculas, sem acentos e
   sem espaços duplicados — apenas para comparação técnica. */
function normChaveTexto(v){
  if(v == null) return '';
  return String(v).trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}
function fornecedorKey(r){
  if(!r) return '';
  const id = r.id_fornecedor;
  if(id != null && String(id).trim() !== '') return 'ID:' + String(id).trim();
  return 'NOME:' + normChaveTexto(r.fornecedor);
}

/* Seção 23 — MUNICÍPIO DO FORNECEDOR. A base possui uma única coluna de
   município (MUNICIPIO), que pertence ao fornecedor — não ao transportador,
   ao aglutinador nem à planta. A normalização abaixo existe apenas para a
   busca de coordenada; a interface preserva a grafia registrada. */
function municipioChave(v){ return normChaveTexto(v); }

/* Seção 10 — CONTAGEM DE NOTAS FISCAIS SEM DUPLICIDADE.
   A base repete o mesmo conjunto de NFs em todas as linhas de um mesmo
   embarque (mesma GE), de modo que somar QTDE NF PEDIDO multiplica o total.
   Regra determinística única, usada pelo componente e pelo mapa: o valor
     apresentado é SEMPRE o texto oficial da coluna 40 (propriedade
     `notas_fiscais_pedido`), nunca uma quantidade recalculada. */
function textoNfOficial(r){
  if(!r) return null;
  const v = r.notas_fiscais_pedido;
  if(v == null) return null;
  const s = String(v).trim();
  if(s === '' || NF_TEXTO_SEM.has(s.toUpperCase())) return null;
  return s;
}

/* ==========================================================================
   ETAPA 3 (REVISÃO) · ALTERAÇÕES 04 a 07 — NOTAS FISCAIS PEDIDO
   --------------------------------------------------------------------------
   Um fornecedor pode agrupar mais de um PEDIDO; como a coluna 40 é um campo
   por PEDIDO, o texto exibido no card do fornecedor concatena os valores
   OFICIAIS de cada pedido do grupo — nunca uma nova contagem, nunca um valor
   composto a partir de QTDE NF PEDIDO ou de qualquer outra coluna. Textos
   idênticos (mesmo embarque repetido em mais de uma linha/planta) não se
   repetem no resultado. Grupo sem nenhum valor oficial devolve null, o que a
   interface apresenta como SEM NF — o mesmo padrão já usado no restante do
   sistema (Alteração 07). */
function notasFiscaisGrupoTexto(rows){
  const vistos = [];
  (rows || []).forEach(r => {
    const t = textoNfOficial(r);
    if(t && !vistos.includes(t)) vistos.push(t);
  });
  return vistos.length ? vistos.join(' / ') : null;
}

/* ==========================================================================
   ETAPA 3 · ALTERACOES 04 a 12 — NOTA FISCAL EM DOIS NIVEIS
   --------------------------------------------------------------------------
   Validacao previa exigida pela Alteracao 06 (conferida na aba oficial
   'Follow-up Gestao Embarcada'):
     · coluna 39 (numeracao de 1) — cabecalho real 'QTDE NF PEDIDO';
     · coluna 40 (numeracao de 1) — cabecalho real 'NOTAS FISCAIS PEDIDO'.
   O acesso e SEMPRE pelo NOME do cabecalho (sheet_to_json do SheetJS ja usa a
   primeira linha como chave), nunca pela posicao — portanto nao ha ambiguidade
   zero-based/one-based a resolver. Na importacao a coluna 39 vira `qtde_nf` e a
   coluna 40 vira `notas_fiscais_pedido` (transformSheetRows), sem nenhuma
   transformacao alem do trim.
   Vazio pode chegar como null, undefined, 0, '' ou como um dos marcadores
   textuais ja oficiais no sistema (NF_TEXTO_SEM) — todos tratados como ausencia
   pelas duas funcoes abaixo, sem criar vocabulario novo.
   ========================================================================== */

/* Alteracao 05 — QUANTIDADE OFICIAL: le EXCLUSIVAMENTE a coluna 39. A
   quantidade nunca e recontada a partir da coluna 40 (Alteracao 11). A
   planilha entrega o valor como texto ('5') ou numero (5); ambos sao aceitos.*/
function quantidadeNfOficial(r){
  if(!r) return 0;
  const v = r.qtde_nf;
  if(v == null) return 0;
  if(typeof v === 'number') return (isFinite(v) && v > 0) ? Math.trunc(v) : 0;
  const s = String(v).trim();
  if(s === '' || NF_TEXTO_SEM.has(s.toUpperCase())) return 0;
  const n = Number(s.replace(',', '.'));
  return (isFinite(n) && n > 0) ? Math.trunc(n) : 0;
}

/* Alteracao 07 — LISTA DETALHADA: itens individuais da coluna 40, obtidos do
   MESMO texto oficial ja devolvido por textoNfOficial(). Apenas separacao dos
   valores registrados; nenhum numero e criado, completado ou reordenado. */
function notasFiscaisPedidoItens(r){
  const t = textoNfOficial(r);
  if(!t) return [];
  return t.split(/[;,/|]+/)
          .map(s => s.trim())
          .filter(s => s !== '' && !NF_TEXTO_SEM.has(s.toUpperCase()));
}

/* Consolidacao por FORNECEDOR (o card agrupa varios pedidos).
   · A quantidade e a SOMA dos valores oficiais da coluna 39 dos pedidos
     distintos do grupo — nunca uma contagem propria.
   · A deduplicacao usa a MESMA chave ja adotada por notasFiscaisGrupoTexto():
     quando o mesmo embarque se repete em mais de uma linha (mesma GE em
     plantas diferentes), a coluna 40 traz texto identico e o conjunto entra
     uma unica vez — evitando o multiplo da quantidade descrito na Secao 10.
   · Divergencias entre 39 e 40 (Alteracao 11) sao apenas REGISTRADAS; a base
     nao e alterada e nenhum valor e inventado. */
function notasFiscaisGrupo(rows){
  const vistos = new Set();
  const itens = [];
  const textos = [];
  let quantidade = 0;
  let qtdeSemLista = false;   // 39 > 0 e 40 vazia
  let listaSemQtde = false;   // 40 preenchida e 39 zerada/ausente

  (rows || []).forEach((r, i) => {
    const texto = textoNfOficial(r);
    const chave = texto
      ? ('T:' + texto)
      : ('P:' + ((r && r.pedido != null) ? r.pedido : ('#' + i)));
    if(vistos.has(chave)) return;
    vistos.add(chave);

    const q = quantidadeNfOficial(r);
    quantidade += q;

    if(texto){
      textos.push(texto);
      notasFiscaisPedidoItens(r).forEach(nf => { if(!itens.includes(nf)) itens.push(nf); });
      if(q === 0) listaSemQtde = true;
    } else if(q > 0){
      qtdeSemLista = true;
    }
  });

  return {
    quantidade,
    itens,
    texto: textos.length ? textos.join(' / ') : null,
    temLista: itens.length > 0,
    divergencia: qtdeSemLista ? 'qtde-sem-lista' : (listaSemQtde ? 'lista-sem-qtde' : null)
  };
}

/* Alteracao 11 — registro da divergencia em desenvolvimento. Executa uma unica
   vez por par (fornecedor, tipo de divergencia) para nao poluir o console nas
   re-renderizacoes disparadas pelo servico de rotas. */
const _NF_DIVERG_VISTAS = new Set();
function registrarDivergenciaNf(chaveFornecedor, nf){
  if(!nf || !nf.divergencia) return;
  const k = chaveFornecedor + '|' + nf.divergencia;
  if(_NF_DIVERG_VISTAS.has(k)) return;
  _NF_DIVERG_VISTAS.add(k);
  const msg = nf.divergencia === 'qtde-sem-lista'
    ? 'QTDE NF PEDIDO (col. 39) maior que zero sem numeros na coluna 40'
    : 'NOTAS FISCAIS PEDIDO (col. 40) preenchida com QTDE NF PEDIDO (col. 39) zerada';
  if(typeof console !== 'undefined' && console.warn){
    console.warn('[NF 39x40] ' + chaveFornecedor + ': ' + msg + ' — base preservada, nenhum valor inferido.');
  }
}

/* Alteracao 09 — texto do resumo, consistente para 1 ou N notas. */
function rotuloQtdeNf(n){ return n + (n === 1 ? ' NF' : ' NFs'); }
function rotuloVerNf(n, aberto){
  const alvo = (n === 1 ? 'nota fiscal' : 'notas fiscais');
  return (aberto ? 'Ocultar ' : 'Ver ') + alvo;
}

/* Seção 6 — formatação da JANELA/CHEGADA/SAÍDA: dd/mm/aaaa hh:mm.
   Lê os componentes do quadro naive de isoParaMs() com getters UTC, ou seja,
   imune ao fuso horário do dispositivo — mesma garantia já adotada pelas
   comparações de prazo. Nenhuma conversão de fuso é introduzida. */
function fmtDataHoraRota(ms){
  if(ms == null) return null;
  const d = new Date(ms);
  const pad = n => String(n).padStart(2,'0');
  return pad(d.getUTCDate()) + '/' + pad(d.getUTCMonth()+1) + '/' + d.getUTCFullYear()
       + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes());
}

/* Seção 9 — MENSAGEM OPERACIONAL DA COLETA. Derivada exclusivamente de
   statusJanela() (tolerância de 30 min, regra de janela, cálculo de atraso,
   regras de chegada/saída e de finalização). Nenhuma regra nova é criada
   aqui: apenas a redação da frase que o operador lê. */
function mensagemColeta(sj){
  if(!sj) return 'Sem informação';
  if(!sj.hasWindow) return 'Sem janela programada';
  const desvio = sj.desvioMin;
  if(sj.hasArrival && sj.hasDeparture){
    if(sj.desvioMin > JANELA_TOLERANCIA_MIN) return 'Finalizado — Chegada ' + fmtMin(desvio) + ' após a janela';
    if(sj.desvioMin < -JANELA_TOLERANCIA_MIN) return 'Finalizado — Chegada ' + fmtMin(desvio) + ' antes da janela';
    return 'Finalizado — Atendimento dentro do prazo';
  }
  if(sj.hasArrival){
    if(desvio > JANELA_TOLERANCIA_MIN) return 'Em atendimento — Chegada ' + fmtMin(desvio) + ' após a janela';
    if(desvio < -JANELA_TOLERANCIA_MIN) return 'Em atendimento — Chegada ' + fmtMin(desvio) + ' antes da janela';
    return 'Em atendimento — Chegada dentro do prazo';
  }
  if(sj.isLate) return 'Em atraso — ' + fmtMin(desvio) + ' após a janela';
  const restam = -desvio;
  return 'Aguardando chegada ao fornecedor — Restam ' + fmtMin(restam);
}

/* Seção 12 — STATUS CONSOLIDADO DO FORNECEDOR (pior prazo entre os pedidos).
   A hierarquia oficial do projeto já existe: PEDIDO_STATUS_ORDEM, a mesma
   ordem canônica usada no donut "Status geral" e na ordenação da tabela.
   Ela é reutilizada integralmente — nenhuma hierarquia paralela é criada. */
function piorStatusGrupo(rows){
  let melhorIdx = Infinity, escolhido = null;
  rows.forEach(r=>{
    const sj = statusJanela(r);
    const idx = PEDIDO_STATUS_ORDEM.indexOf(sj.code);
    const rank = idx < 0 ? PEDIDO_STATUS_ORDEM.length : idx;
    if(rank < melhorIdx){ melhorIdx = rank; escolhido = r; }
  });
  return escolhido;
}

/* Seções 2, 12, 21 a 25 e 28 — MODELO DA ROTA.
   Devolve um passo por fornecedor, na sequência operacional do aglutinador.
   A base não possui coluna de sequência de rota: a ordem é derivada da
   JANELA (o campo que define o compromisso de atendimento), com desempate
   por CHEGADA ORIGEM e, por fim, pelo nome — determinístico. */
function construirRotaFornecedores(rows){
  const map = new Map();
  rows.forEach(r=>{
    const key = fornecedorKey(r);
    if(!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  });

  const passos = [...map.entries()].map(([key, grp])=>{
    const janelasMs  = grp.map(r=>isoParaMs(r.janela_iso)).filter(v=>v!=null);
    const chegadasMs = grp.map(r=>chegadaOrigemMs(r)).filter(v=>v!=null);
    const saidasMs   = grp.map(r=>isoParaMs(r.saida_iso)).filter(v=>v!=null);

    /* Consolidação sem perder rastreabilidade: a janela exibida é a primeira
       programada do fornecedor; a chegada, a primeira registrada; a saída, a
       última registrada. Os valores individuais seguem acessíveis em
       `pedidosDetalhe` e na tabela "Pedidos vinculados". */
    const janelaMs  = janelasMs.length  ? Math.min(...janelasMs)  : null;
    const chegadaMs = chegadasMs.length ? Math.min(...chegadasMs) : null;
    const saidaMs   = saidasMs.length   ? Math.max(...saidasMs)   : null;

    const referencia = piorStatusGrupo(grp);
    const sj = referencia ? statusJanela(referencia) : null;

    /* Seção 11 — não conformidade: decisão pela regra central isNonCompliant()
       e mensagem obtida do campo oficial (MOTIVO NÃO CONFORME); o status
       (STATUS NÃO CONFORME) complementa quando o motivo não foi registrado.
       Nenhuma mensagem genérica substitui uma descrição já existente. */
    const rowNc = grp.find(r=>isNonCompliant(r)) || null;
    const ncMsg = rowNc ? (rowNc.motivo_nc || rowNc.status_nc || 'Ocorrência não conforme registrada') : null;

    const municipio = (grp.find(r=>r.municipio && String(r.municipio).trim()!=='') || {}).municipio || null;
    const coord = municipio ? MUNI_COORDS[municipio] : null;

    const nome = (grp.find(r=>r.fornecedor && String(r.fornecedor).trim()!=='') || {}).fornecedor || 'Sem fornecedor';

    return {
      supplierKey: key,
      supplierId: grp[0].id_fornecedor != null ? String(grp[0].id_fornecedor) : null,
      supplierName: nome,
      municipality: municipio,
      sequence: 0,                                   // atribuída após a ordenação
      orderIds: grp.map(r=>r.pedido),
      totalOrders: grp.length,
      pedidosDetalhe: grp,

      scheduledWindowMs: janelaMs,
      arrivalAtOriginMs: chegadaMs,
      departureAtOriginMs: saidaMs,
      scheduledWindow: fmtDataHoraRota(janelaMs),
      arrivalAtOrigin: fmtDataHoraRota(chegadaMs),
      departureAtOrigin: fmtDataHoraRota(saidaMs),

      statusCode: sj ? sj.code : null,
      statusLabel: sj ? sj.label : PEDIDO_STATUS_DEFS.sem.label,
      comparativeStatusMessage: mensagemColeta(sj),

      /* Etapa 3 (revisão) · Alterações 04 a 07 — NOTAS FISCAIS PEDIDO não é
         mais pré-calculada aqui: o card e o mapa leem notasFiscaisGrupoTexto()
         diretamente sobre `pedidosDetalhe`, a MESMA fonte, no momento da
         renderização — um único ponto de leitura, sem estado duplicado. */

      hasNonConformity: !!rowNc,
      nonConformityMessage: ncMsg,
      nonConformityStatus: rowNc ? (rowNc.status_nc || null) : null,

      /* Seção 15 — o alerta laranja NÃO é decidido por texto de status: usa a
         categoria exaustiva da regra central de prazo. */
      isDelayed: grp.some(r=>statusJanela(r).categoria === 'atraso'),
      isWithinWindow: sj ? !!sj.isWithinWindow : false,
      isFinished: chegadaMs != null && saidaMs != null,
      isInProgress: chegadaMs != null && saidaMs == null,

      /* Seções 21 e 24 — localização. A base não possui latitude/longitude do
         fornecedor (ULT.POSIÇÃO-LAT/LNG é a última posição do VEÍCULO, comum a
         todo o aglutinador). A coordenada vem do município cadastrado e é
         sinalizada como aproximada, conforme exige a seção 24. */
      latitude: coord ? coord[0] : null,
      longitude: coord ? coord[1] : null,
      coordAproximada: !!coord,

      distanceToNextSupplierKm: null,
      estimatedTimeToNextSupplierMinutes: null,
      rotaAproximada: false,                         // seção 17 — linha reta (sem serviço de rotas)
      routeState: 'idle',                            // idle | loading | ok | unavailable | error
    };
  });

  passos.sort((a,b)=>{
    const ja = a.scheduledWindowMs, jb = b.scheduledWindowMs;
    if(ja !== jb) return (ja == null ? Infinity : ja) - (jb == null ? Infinity : jb);
    const ca = a.arrivalAtOriginMs, cb = b.arrivalAtOriginMs;
    if(ca !== cb) return (ca == null ? Infinity : ca) - (cb == null ? Infinity : cb);
    return a.supplierName.localeCompare(b.supplierName);
  });
  passos.forEach((p,i)=> p.sequence = i+1);
  return passos;
}

/* Seção 13 — POSIÇÃO DO VEÍCULO NA ROTA, determinada apenas por dados reais
   (CHEGADA ORIGEM, SAÍDA ORIGEM e a sequência dos fornecedores). Nunca por
   animação temporal ou valor aleatório.
     índice  i     → veículo parado no fornecedor i (chegou, ainda não saiu)
     índice  i+0.5 → veículo em deslocamento entre i e i+1 (saiu de i)
     índice -0.5   → antes da primeira chegada (início da rota)
     índice  n-0.5 → rota finalizada (ponto final), quando o último saiu. */
function posicaoVeiculo(passos){
  if(!passos.length) return -0.5;
  let pos = -0.5;
  passos.forEach((p,i)=>{
    if(p.arrivalAtOriginMs != null) pos = i;
    if(p.departureAtOriginMs != null) pos = i + 0.5;
  });
  return pos;
}

/* ==========================================================================
   SERVIÇO DE ROTA (seções 17 a 20) — DESACOPLADO E COM CACHE
   --------------------------------------------------------------------------
   O projeto já integra um serviço real de roteamento (OSRM), usado pelo mapa.
   Ele passa a ser consumido também pela Evolução dos Pedidos através de uma
   camada única com cache por par de coordenadas (seção 20): a mesma rota
   nunca é consultada duas vezes, requisições simultâneas para o mesmo trecho
   são compartilhadas e as respostas de uma seleção antiga são descartadas.
   Sem serviço disponível, o trecho cai para distância em linha reta e é
   sinalizado como aproximado — jamais um valor fixo ou inventado.
   ========================================================================== */

const ROTA_CACHE = new Map();     // chave: "lat,lng|lat,lng" → Promise<trecho>
const ROTA_CACHE_MAX = 400;
let _rotaGeracao = 0;             // invalida respostas obsoletas (seção 20)

function rotaChave(a, b){
  const f = v => Number(v).toFixed(5);
  return f(a.lat)+','+f(a.lng)+'|'+f(b.lat)+','+f(b.lng);
}

function obterTrechoRota(a, b){
  const chave = rotaChave(a, b);
  if(ROTA_CACHE.has(chave)) return ROTA_CACHE.get(chave);
  const promessa = fetchLegGeometry(a, b);
  if(ROTA_CACHE.size >= ROTA_CACHE_MAX) ROTA_CACHE.delete(ROTA_CACHE.keys().next().value);
  ROTA_CACHE.set(chave, promessa);
  return promessa;
}

/* ==========================================================================
   COMPONENTE VISUAL — EVOLUÇÃO DOS PEDIDOS
   --------------------------------------------------------------------------
   Layout de "roteiro em degraus" (referência visual da Alteração 06): a via
   sobe da esquerda para a direita, um marcador por fornecedor desce até a
   caixa correspondente e o veículo avança conforme os registros reais.
   Os textos genéricos da referência ("Step 01", "Step 02"...) não existem:
   cada etapa exibe o nome real do fornecedor vindo da base.
   ========================================================================== */

const EVO_COL_W = 268;      // largura de cada etapa (desktop/tablet)
const EVO_ROAD_H = 132;     // altura da faixa da via
const EVO_RISE = 26;        // elevação acumulada por etapa (degrau)
/* ── Etapa 3 · Alteracoes 13 a 17 — GEOMETRIA E ANCORAGEM DO VEICULO ──
   O desenho do caminhao foi criado num quadro local cujo canto NAO coincide
   com o seu centro geometrico: as formas ocupam x de -25 a 22,4 e y de -14 a
   12,6. Enquanto o grupo era ancorado pelo canto, o veiculo aparecia flutuando
   acima do eixo da via. As constantes abaixo derivam o centro geometrico do
   proprio desenho, de modo que o ponto de ancoragem passa a ser o CENTRO do
   elemento — e ele coincide exatamente com o eixo central da pista em qualquer
   resolucao, porque tudo e proporcional ao viewBox do SVG (nao ha correcao
   especifica por tamanho de tela nem valor fixo de topo).
   ATENCAO: geometria de renderizacao apenas. A etapa em que o veiculo se
   encontra continua vindo integralmente de posicaoVeiculo(). */
const EVO_VEIC_X0 = -25, EVO_VEIC_X1 = 22.4;
const EVO_VEIC_Y0 = -14, EVO_VEIC_Y1 = 12.6;
/* deslocamento que leva o centro geometrico do desenho para (0,0) */
const EVO_VEIC_DX = -((EVO_VEIC_X0 + EVO_VEIC_X1) / 2);
const EVO_VEIC_DY = -((EVO_VEIC_Y0 + EVO_VEIC_Y1) / 2);
/* Alteracao 16 — largura real do desenho (mais 2px de folga). Usado APENAS
   para impedir que o veiculo seja cortado pela borda do SVG nas extremidades
   da via; nao participa de nenhum calculo de posicao. */
const EVO_VEIC_MEIA_LARG = (EVO_VEIC_X1 - EVO_VEIC_X0) / 2 + 2;
let evoSelecionado = null;  // supplierKey destacado (seção 26)
let _evoPassos = [];        // último modelo renderizado (fonte única em memória)
/* Etapa 3 · Alteracao 08 — estado das areas recolhiveis (pedidos e notas
   fiscais). renderEvolucao() e reexecutada a cada resposta do servico de rotas;
   sem este registro, uma lista aberta pelo usuario se fecharia sozinha. Guarda
   apenas apresentacao — chave 'supplierKey|alvo' — e e limpa quando outro
   aglutinador e selecionado. */
const _evoAbertos = new Set();
function evoAberto(key, alvo){ return _evoAbertos.has(key + '|' + alvo); }

function evoAcentoPasso(p){
  if(p.isDelayed) return 'atraso';
  if(p.isFinished) return 'fin';
  if(p.isInProgress) return 'andamento';
  return 'dentro';
}

function evoCardHtml(p, total){
  const classes = ['evo-card'];
  if(p.isDelayed) classes.push('evo-atraso');
  if(p.hasNonConformity) classes.push('evo-nc');
  if(evoSelecionado === p.supplierKey) classes.push('evo-sel');

  const pedidosTxt = p.orderIds.join(', ');
  const pedidosResumo = p.totalOrders > 1
    ? (p.totalOrders + ' pedidos vinculados')
    : ('Pedido ' + p.orderIds[0]);
  const pedidosAberto = evoAberto(p.supplierKey, '.evo-pedidos');

  /* Etapa 3 · Alteracoes 04 a 12 — NOTAS FISCAIS PEDIDO EM DOIS NIVEIS.
     · Nivel resumido, sempre visivel: a QUANTIDADE, lida exclusivamente da
       coluna 39 (QTDE NF PEDIDO) atraves de notasFiscaisGrupo().
     · Nivel detalhado, oculto por padrao: os numeros da coluna 40 (NOTAS
       FISCAIS PEDIDO), consultados pelo mesmo componente recolhivel ja usado
       em "pedidos vinculados" (Alteracao 08).
     Regras de borda:
     · quantidade zero -> SEM NF, comunicacao direta (Alteracao 10);
     · sem conteudo valido na coluna 40 -> nenhum botao de expansao, porque
       nao ha o que consultar (Alteracao 10);
     · divergencia entre 39 e 40 -> a base NAO e alterada, nenhum valor e
       inferido: a quantidade continua vindo da 39, a lista continua vindo da
       40 e a inconsistencia e sinalizada e registrada (Alteracao 11). */
  const nf = notasFiscaisGrupo(p.pedidosDetalhe);
  registrarDivergenciaNf(p.supplierKey, nf);

  const nfTemNota   = nf.quantidade > 0;
  const nfQtdeLabel = nfTemNota ? nf.itens.length || nf.quantidade : nf.itens.length;
  const nfAberto    = evoAberto(p.supplierKey, '.evo-nf-lista');
  const nfDiverg    = nf.divergencia
    ? '<span class="evo-nf-diverg" title="Divergencia entre QTDE NF PEDIDO (coluna 39) e NOTAS FISCAIS PEDIDO (coluna 40). Os dados da base foram preservados." aria-label="Divergencia entre as colunas 39 e 40">&#9888;</span>'
    : '';
  const nfBotao = nf.temLista
    ? ' <button type="button" class="evo-ver" data-ver="' + esc(p.supplierKey) + '"'
      + ' data-alvo=".evo-nf-lista"'
      + ' data-abrir="' + esc(rotuloVerNf(nfQtdeLabel, false)) + '"'
      + ' data-fechar="' + esc(rotuloVerNf(nfQtdeLabel, true)) + '"'
      + ' aria-expanded="' + nfAberto + '">'
      + esc(rotuloVerNf(nfQtdeLabel, nfAberto)) + '</button>'
    : '';
  const nfLista = nf.temLista
    ? '<div class="evo-nf-lista"' + (nfAberto ? '' : ' hidden') + '><ul>'
      + nf.itens.map(v => '<li>NF ' + esc(v) + '</li>').join('')
      + '</ul></div>'
    : '';
  const blocoNf = '<div class="evo-field evo-nf">'
    + '<span class="evo-lbl">NOTAS FISCAIS PEDIDO</span>'
    + '<span class="evo-val">'
      + (nfTemNota
          ? '<span class="evo-nf-qtde">' + esc(rotuloQtdeNf(nf.quantidade)) + '</span>'
          : '<span class="evo-semnf">&#9672; SEM NF</span>')
      + nfDiverg + nfBotao
    + '</span>'
    + nfLista
    + '</div>';
  const blocoNc = p.hasNonConformity
    ? '<div class="evo-field evo-nc-box"><span class="evo-lbl">NÃO CONFORMIDADE</span>'
      + '<span class="evo-val">' + esc(p.nonConformityMessage) + '</span></div>'
    : '';

  /* Seção 19 — estados do serviço de rota; a ausência de distância/tempo nunca
     impede a exibição dos demais dados do fornecedor. */
  let deslocamento;
  if(p.sequence === total) deslocamento = 'Última parada da rota';
  else if(p.routeState === 'loading') deslocamento = 'Calculando rota…';
  else if(p.routeState === 'unavailable') deslocamento = 'Localização indisponível';
  else if(p.routeState === 'error') deslocamento = 'Não foi possível calcular a rota';
  else if(p.distanceToNextSupplierKm != null){
    /* Seção 17 — quando o serviço de rotas respondeu, a distância é rodoviária
       real. Sem resposta, o valor cai para linha reta e é EXPLICITAMENTE
       sinalizado como aproximado: nunca é apresentado como distância de rota. */
    const km = p.distanceToNextSupplierKm.toFixed(1).replace('.', ',') + ' km';
    if(p.rotaAproximada){
      deslocamento = '≈ ' + km + ' em linha reta — serviço de rotas indisponível';
    } else {
      deslocamento = km + (p.estimatedTimeToNextSupplierMinutes != null
        ? ' — aproximadamente ' + fmtMin(Math.round(p.estimatedTimeToNextSupplierMinutes))
        : ' — tempo estimado indisponível');
    }
  } else deslocamento = 'Calculando rota…';

  const municipioTxt = p.municipality ? esc(p.municipality) : 'Município não informado';
  const aprox = (!p.coordAproximada && p.sequence < total)
    ? '<span class="evo-aprox" title="Sem coordenada cadastrada para este município">sem coordenada</span>' : '';

  const descAcess = p.supplierName + ', parada ' + p.sequence + ' de ' + total + '. '
    + p.comparativeStatusMessage + (p.isDelayed ? '. Fornecedor em atraso.' : '')
    + (p.hasNonConformity ? ' Não conformidade: ' + p.nonConformityMessage : '');

  return '<article class="' + classes.join(' ') + '" data-sup="' + esc(p.supplierKey) + '"'
    + ' tabindex="0" role="button" aria-pressed="' + (evoSelecionado === p.supplierKey) + '"'
    + ' aria-label="' + esc(descAcess) + '" title="' + esc(descAcess) + '">'

    + '<header class="evo-card-head">'
      + '<span class="evo-ord">' + p.sequence + '</span>'
      + '<div class="evo-head-txt">'
        + '<span class="evo-lbl">FORNECEDOR</span>'
        + '<h4 class="evo-nome">' + esc(p.supplierName) + '</h4>'
        + '<span class="evo-muni">' + municipioTxt + ' · parada ' + p.sequence + ' de ' + total + ' ' + aprox + '</span>'
      + '</div>'
      + (p.hasNonConformity ? '<span class="evo-selo-nc" title="Status Não Conforme">NC</span>' : '')
      + (p.isDelayed ? '<span class="evo-selo-atraso" title="Fornecedor em atraso">⚠</span>' : '')
    + '</header>'

    + '<div class="evo-field"><span class="evo-lbl">PEDIDOS</span>'
      + '<span class="evo-val">' + esc(pedidosResumo)
      + (p.totalOrders > 1 ? ' <button type="button" class="evo-ver" data-ver="' + esc(p.supplierKey) + '"'
          + ' data-alvo=".evo-pedidos" data-abrir="Ver pedidos" data-fechar="Ocultar pedidos"'
          + ' aria-expanded="' + pedidosAberto + '">' + (pedidosAberto ? 'Ocultar pedidos' : 'Ver pedidos') + '</button>' : '')
      + '</span>'
      + (p.totalOrders > 1 ? '<div class="evo-pedidos"' + (pedidosAberto ? '' : ' hidden') + '>' + esc(pedidosTxt) + '</div>' : '')
    + '</div>'

    + '<div class="evo-grid">'
      + '<div class="evo-field"><span class="evo-lbl">JANELA</span><span class="evo-val">'
        + (p.scheduledWindow || 'Janela não programada') + '</span></div>'
      + '<div class="evo-field"><span class="evo-lbl">CHEGADA</span><span class="evo-val">'
        + (p.arrivalAtOrigin || '<em>Aguardando chegada</em>') + '</span></div>'
      + '<div class="evo-field"><span class="evo-lbl">SAÍDA ORIGEM</span><span class="evo-val">'
        + (p.departureAtOrigin || '<em>Aguardando saída</em>') + '</span></div>'
    + '</div>'

    + '<div class="evo-field evo-status evo-st-' + evoAcentoPasso(p) + '">'
      + '<span class="evo-lbl">STATUS DA COLETA</span>'
      + '<span class="evo-val">' + esc(p.comparativeStatusMessage) + '</span></div>'

    + blocoNc
    + blocoNf

    + '<div class="evo-field evo-desloc"><span class="evo-lbl">DESLOCAMENTO</span>'
      + '<span class="evo-val">' + esc(deslocamento) + '</span></div>'
  + '</article>';
}

/* Via em degraus + marcadores + veículo. Desenhada em SVG sobre a faixa
   superior, com largura sincronizada às colunas das caixas. */
function evoRoadSvg(passos){
  const n = passos.length;
  const w = (n + 1) * EVO_COL_W;
  const h = EVO_ROAD_H;
  const rise = Math.min(EVO_RISE, Math.max(8, (h - 60) / Math.max(1, n)));
  const baseY = h - 26;
  const yDe = i => baseY - Math.max(0, i) * rise;
  const xDe = i => EVO_COL_W * 0.5 + i * EVO_COL_W;

  // Traçado em degraus: patamar sob cada etapa, rampa entre etapas.
  const pts = [];
  pts.push([0, yDe(0)]);
  for(let i = 0; i < n; i++){
    pts.push([xDe(i) - EVO_COL_W * 0.30, yDe(i)]);
    pts.push([xDe(i) + EVO_COL_W * 0.30, yDe(i)]);
    if(i < n) pts.push([xDe(i) + EVO_COL_W * 0.70, yDe(i + 1)]);
  }
  pts.push([w, yDe(n)]);
  const d = 'M ' + pts.map(p=>p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ');

  /* Etapa 3 · Alterações 13, 15 e 17 — EIXO DA PISTA EM QUALQUER ABSCISSA.
     O eixo vertical da via é lido da MESMA polilinha que desenha o asfalto
     (`pts`), por interpolação linear — nunca de uma segunda fórmula e nunca
     de um arredondamento por etapa. Assim o ponto de ancoragem do veículo
     coincide com o centro da faixa também nas RAMPAS entre fornecedores,
     onde o antigo arredondamento o deixava meio degrau acima do asfalto.
     Como tudo vive no espaço do viewBox, o alinhamento é idêntico em
     qualquer resolução ou nível de zoom: não há correção por tela. */
  const yEixoVia = x => {
    if(!pts.length) return 0;
    if(x <= pts[0][0]) return pts[0][1];
    for(let i = 1; i < pts.length; i++){
      const x0 = pts[i-1][0], y0 = pts[i-1][1];
      const x1 = pts[i][0],   y1 = pts[i][1];
      if(x <= x1) return (x1 === x0) ? y1 : (y0 + (y1 - y0) * ((x - x0) / (x1 - x0)));
    }
    return pts[pts.length-1][1];
  };

  // Progresso percorrido (indicador de rota concluída — seção 14)
  const pos = posicaoVeiculo(passos);
  const progX = Math.max(0, Math.min(w, xDe(pos)));

  let s = '<svg class="evo-road" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" '
        + 'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">';
  s += '<defs><clipPath id="evoClip"><rect x="0" y="0" width="' + progX.toFixed(1) + '" height="' + h + '"/></clipPath></defs>';
  // asfalto
  s += '<path d="' + d + '" fill="none" stroke="var(--evo-asfalto)" stroke-width="30" stroke-linejoin="round" stroke-linecap="round"/>';
  // trecho percorrido
  s += '<g clip-path="url(#evoClip)"><path d="' + d + '" fill="none" stroke="var(--evo-percorrido)" stroke-width="30" stroke-linejoin="round" stroke-linecap="round"/></g>';
  // faixa central tracejada
  s += '<path d="' + d + '" fill="none" stroke="var(--evo-faixa)" stroke-width="2.4" stroke-dasharray="14 12" stroke-linecap="round"/>';

  passos.forEach((p,i)=>{
    const x = xDe(i), y = yDe(i);
    const cor = 'var(--evo-c-' + evoAcentoPasso(p) + ')';
    // haste do marcador até a caixa
    s += '<line x1="' + x + '" y1="' + (y + 15) + '" x2="' + x + '" y2="' + h + '" stroke="' + cor + '" stroke-width="1.6" stroke-dasharray="3 3"/>';
    // pino
    s += '<g class="evo-pin" data-sup="' + esc(p.supplierKey) + '">';
    s += '<path d="M ' + x + ' ' + (y - 34) + ' c 9 0 10.5 9.6 0 21 c -10.5 -11.4 -9 -21 0 -21 z" fill="' + cor + '"/>';
    s += '<circle cx="' + x + '" cy="' + (y - 27) + '" r="4.6" fill="#ffffff"/>';
    s += '<text x="' + x + '" y="' + (y - 24.2) + '" text-anchor="middle" font-size="7.4" font-weight="800" fill="' + cor + '">' + (i+1) + '</text>';
    s += '</g>';
  });

  /* Veículo — transição suave entre etapas (seção 14).
     Etapa 3 · Alteração 06 — o perfil passa a ser um CAMINHÃO (cavalo +
     carreta), desenhado em SVG com as mesmas variáveis de tema do componente:
     aparência corporativa, limpa e proporcional à faixa da via.
     ATENÇÃO: apenas a REPRESENTAÇÃO VISUAL mudou. A âncora (progX, progY) e
     todo o cálculo de posição continuam vindo de posicaoVeiculo(), que lê
     exclusivamente a sequência dos fornecedores e os registros reais de
     CHEGADA ORIGEM e SAÍDA ORIGEM. Nenhuma linha da lógica foi tocada. */
  /* Somente enquadramento: progX continua sendo a posição real e segue
     governando o clip do trecho percorrido acima. veicX apenas garante que o
     caminhão inteiro caiba dentro do quadro nas pontas da via (início e fim
     da rota), sem alterar em nada a etapa em que ele se encontra. */
  const veicX = Math.max(EVO_VEIC_MEIA_LARG, Math.min(w - EVO_VEIC_MEIA_LARG, progX));
  /* Alteracoes 13 e 15 — o grupo externo e ancorado em (veicX, progY): progY e
     o eixo central da via na abscissa do proprio veiculo (lido da polilinha do
     asfalto por yEixoVia, portanto exato tambem nas rampas), e o
     grupo interno recentraliza o desenho sobre esse ponto. Resultado: o centro
     geometrico do caminhao coincide com o eixo da pista, sem translateY
     arbitrario e sem posicao absoluta. */
  const veicY = yEixoVia(veicX);
  s += '<g class="evo-veic" style="transform: translate(' + veicX.toFixed(1) + 'px, ' + veicY.toFixed(1) + 'px);">'
     + '<g class="evo-caminhao" transform="translate(' + EVO_VEIC_DX.toFixed(2) + ' ' + EVO_VEIC_DY.toFixed(2) + ')">'
       // carreta (baú)
     + '<rect x="-25" y="-14" width="29" height="21" rx="2.6" fill="var(--evo-veiculo)"/>'
     + '<rect x="-21.6" y="-10.4" width="22" height="6" rx="1.4" fill="var(--evo-faixa)" opacity="0.5"/>'
       // cavalo mecânico: cabine + capô
     + '<rect x="5" y="-9" width="13" height="16" rx="2.4" fill="var(--evo-veiculo)"/>'
     + '<path d="M 17.4 -1.6 L 20.6 -1.6 A 1.8 1.8 0 0 1 22.4 0.2 L 22.4 5.4 A 1.6 1.6 0 0 1 20.8 7 L 17.4 7 Z" fill="var(--evo-veiculo)"/>'
       // para-brisa
     + '<rect x="7.4" y="-6.6" width="8.6" height="5.6" rx="1.2" fill="var(--evo-percorrido)"/>'
       // eixos — 2 na carreta, 1 no cavalo
     + '<circle cx="-18" cy="9" r="3.6" fill="#243033"/><circle cx="-8.6" cy="9" r="3.6" fill="#243033"/>'
     + '<circle cx="14.6" cy="9" r="3.6" fill="#243033"/>'
     + '<circle cx="-18" cy="9" r="1.35" fill="#dfe7e8"/><circle cx="-8.6" cy="9" r="1.35" fill="#dfe7e8"/>'
     + '<circle cx="14.6" cy="9" r="1.35" fill="#dfe7e8"/>'
     + '</g>'
     + '</g>';
  s += '</svg>';
  return s;
}

function buildEvolucao(){
  const rows = aglRows();
  const empty = document.getElementById('ganttEmpty');
  const wrap = document.getElementById('tlScroll');
  const origemEl = document.getElementById('evoOrigem');   // Alteração 05
  const legend = document.getElementById('ganttLegend');
  const title = document.getElementById('ganttTitle');
  if(!wrap) return;

  _rotaGeracao++;                       // seção 20 — descarta respostas obsoletas
  const geracao = _rotaGeracao;
  /* Alteracao 08 — nova selecao (ou novo conjunto filtrado) recomeca com todas
     as areas recolhiveis fechadas, conforme o padrao definido. */
  _evoAbertos.clear();

  if(!rows.length){
    _evoPassos = [];
    empty.style.display = 'block';
    wrap.style.display = 'none';
    if(origemEl){ origemEl.innerHTML = ''; origemEl.style.display = 'none'; }
    if(legend) legend.style.display = 'none';
    title.textContent = 'Aglutinador → Fornecedores → Pedidos → Janela → Chegada → Saída → Status';
    return;
  }
  empty.style.display = 'none';
  wrap.style.display = 'block';
  if(legend) legend.style.display = 'flex';

  const passos = construirRotaFornecedores(rows);
  _evoPassos = passos;
  if(evoSelecionado && !passos.some(p=>p.supplierKey === evoSelecionado)) evoSelecionado = null;

  const veiculos = uniq(rows.map(r=>r.veiculo_aglutinado));
  title.textContent = 'Aglutinador ' + currentAgl;

  renderEvolucao();
  calcularTrechosRota(passos, geracao);

  function renderEvolucao(){
    const total = passos.length;
    const pos = posicaoVeiculo(passos);
    const rotaFinalizada = passos.every(p=>p.isFinished);
    const emAtraso = passos.filter(p=>p.isDelayed).length;

    /* Etapa 3 (revisão) · Alterações 02 e 03 — a caixa AGLUTINADOR vive fora
       do contêiner de rolagem horizontal (#tlScroll), como irmã dele dentro
       de .evo-layout. No desktop, .evo-layout é uma linha: a rota ocupa o
       espaço à esquerda e o aglutinador fica alinhado à direita, centrado
       verticalmente por Flexbox (align-items:center) — nunca por posição
       absoluta. Em telas estreitas, .evo-layout muda para coluna e o
       aglutinador volta ao topo:
         FORNECEDORES / EVOLUÇÃO DA ROTA        AGLUTINADOR
                                                centralizado
                                                verticalmente               */
    if(origemEl){
      origemEl.innerHTML =
            '<div class="evo-origem">'
          + '<span class="evo-lbl">AGLUTINADOR</span>'
          + '<strong>' + esc(currentAgl) + '</strong>'
          + '<span class="evo-veic-perfil">🚚 ' + esc(veiculos.length ? fmtList(veiculos, 2) : 'Veículo não informado') + '</span>'
          + '<span class="evo-origem-sub">' + total + ' fornecedor' + (total > 1 ? 'es' : '') + ' · ' + rows.length + ' pedido' + (rows.length > 1 ? 's' : '')
          + (emAtraso ? ' · <b class="evo-warn">' + emAtraso + ' em atraso</b>' : '') + '</span>'
          + '</div>'
          + '<span class="evo-origem-seta" aria-hidden="true"></span>';
      origemEl.style.display = 'flex';
    }

    let html = '<div class="evo-wrap" role="list" aria-label="Evolução do atendimento dos fornecedores do aglutinador">';

    html += '<div class="evo-track" style="--evo-col:' + EVO_COL_W + 'px;--evo-cols:' + (total + 1) + ';">';
    html += evoRoadSvg(passos);
    html += '<div class="evo-cards">';
    passos.forEach(p=>{ html += '<div class="evo-col" role="listitem">' + evoCardHtml(p, total) + '</div>'; });
    html += '<div class="evo-col evo-col-fim"><div class="evo-fim' + (rotaFinalizada ? ' evo-fim-ok' : '') + '">'
          + '<span class="evo-lbl">FINALIZAÇÃO DA ROTA</span>'
          + '<strong>' + (rotaFinalizada ? 'Rota concluída' : 'Rota em andamento') + '</strong>'
          + '<span class="evo-fim-sub">' + (rotaFinalizada
              ? 'Todos os fornecedores com chegada e saída registradas.'
              : (pos < 0 ? 'Aguardando a primeira chegada.'
                         : 'Atendimento em curso — ' + passos.filter(p=>p.isFinished).length + ' de ' + total + ' concluídos.'))
          + '</span></div></div>';
    html += '</div></div></div>';

    wrap.innerHTML = html;
    ligarInteracoesEvolucao();
  }

  function ligarInteracoesEvolucao(){
    /* Seção 3 + Alterações 07 e 08 — consulta controlada das áreas recolhíveis
       (pedidos vinculados e notas fiscais). Um único manipulador atende as
       duas: o alvo e os rótulos vêm de data-attributes do próprio botão, o
       que evita duplicar comportamento. A ausência de NF não interfere na
       abertura da área de pedidos — são componentes independentes. */
    wrap.querySelectorAll('.evo-ver').forEach(btn=>{
      btn.addEventListener('click', e=>{
        e.stopPropagation();
        const campo = btn.closest('.evo-field');
        const box = campo && campo.querySelector(btn.getAttribute('data-alvo') || '.evo-pedidos');
        if(!box) return;
        const aberto = !box.hidden;
        box.hidden = aberto;
        btn.setAttribute('aria-expanded', String(!aberto));
        /* Alteracao 08 — registra a preferencia para que as re-renderizacoes
           disparadas pelo servico de rotas nao fechem a area aberta. */
        const chaveEstado = (btn.getAttribute('data-ver') || '') + '|' + (btn.getAttribute('data-alvo') || '.evo-pedidos');
        if(aberto) _evoAbertos.delete(chaveEstado); else _evoAbertos.add(chaveEstado);
        btn.textContent = aberto
          ? (btn.getAttribute('data-abrir')  || 'Ver pedidos')
          : (btn.getAttribute('data-fechar') || 'Ocultar pedidos');
      });
    });
    /* Seção 26 — sincronização com o mapa (mouse e teclado). */
    const selecionar = key => {
      evoSelecionado = (evoSelecionado === key) ? null : key;
      renderEvolucao();
      destacarMarcador(evoSelecionado);
    };
    wrap.querySelectorAll('.evo-card').forEach(card=>{
      const key = card.getAttribute('data-sup');
      card.addEventListener('click', ()=> selecionar(key));
      card.addEventListener('keydown', e=>{
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); selecionar(key); }
      });
      card.addEventListener('mouseenter', ()=> realcarMarcador(key, true));
      card.addEventListener('mouseleave', ()=> realcarMarcador(key, false));
    });
    wrap.querySelectorAll('.evo-pin').forEach(pin=>{
      pin.addEventListener('click', ()=> selecionar(pin.getAttribute('data-sup')));
    });
  }

  /* Seções 17 a 20 — distância e tempo entre fornecedores. */
  async function calcularTrechosRota(passos, geracao){
    for(let i = 0; i < passos.length - 1; i++){
      const a = passos[i], b = passos[i+1];
      if(a.latitude == null || b.latitude == null){ a.routeState = 'unavailable'; continue; }
      a.routeState = 'loading';
    }
    if(geracao === _rotaGeracao) renderEvolucao();

    for(let i = 0; i < passos.length - 1; i++){
      const a = passos[i], b = passos[i+1];
      if(a.routeState !== 'loading') continue;
      try{
        const leg = await obterTrechoRota({lat:a.latitude, lng:a.longitude}, {lat:b.latitude, lng:b.longitude});
        if(geracao !== _rotaGeracao) return;                 // seleção mudou: descarta
        a.distanceToNextSupplierKm = leg.km;
        a.estimatedTimeToNextSupplierMinutes = leg.min;
        a.rotaAproximada = (leg.ok === false);
        a.routeState = 'ok';
      } catch(err){
        if(geracao !== _rotaGeracao) return;
        a.routeState = 'error';
      }
      if(geracao === _rotaGeracao) renderEvolucao();
    }
  }
}

/* Compatibilidade: o nome anterior continua válido para chamadas existentes. */
function buildGantt(){ return buildEvolucao(); }

/* Seção 26 — destaque do marcador correspondente no mapa. */
let _marcadoresPorFornecedor = new Map();

function destacarMarcador(key){
  _marcadoresPorFornecedor.forEach((m, k)=>{
    const on = (k === key);
    if(m.setStyle) m.setStyle({weight: on ? 5 : 2, radius: on ? 13 : 9});
    if(on && map && m.getLatLng) map.panTo(m.getLatLng(), {animate:true, duration:.6});
    if(on && m.openPopup) m.openPopup();
  });
}
function realcarMarcador(key, on){
  const m = _marcadoresPorFornecedor.get(key);
  if(m && m.setStyle) m.setStyle({weight: on ? 4 : (evoSelecionado === key ? 5 : 2)});
}
function destacarCaixaEvolucao(key){
  evoSelecionado = (evoSelecionado === key) ? null : key;
  buildEvolucao();
  const el = document.querySelector('.evo-card[data-sup="' + (key||'').replace(/"/g,'\\"') + '"]');
  if(el) el.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
}

/* ==========================================================================
   ETAPA 3 · ALTERAÇÃO 02 — TIPO DE PEDIDO
   --------------------------------------------------------------------------
   Acessor único do tipo do pedido, lido diretamente da base importada
   (coluna TIPO da planilha → campo `modal`). Nenhum valor fixo, nenhuma
   inferência e nenhuma regra criada só para a interface. Concentrar a leitura
   aqui mantém tabela e exportação sempre coerentes e permite trocar o campo
   de origem em um único ponto.
   ========================================================================== */
function tipoPedido(r){
  const v = (r && r.modal != null) ? String(r.modal).trim() : '';
  return v;
}

function currentDetailRows(){
  if(currentAgl) return filteredData().filter(r=>r.aglutinador===currentAgl);
  if(gFilters.pedido) return filteredData().slice(0,500);
  return filteredData().slice(0,50);
}

function buildDetailTable(){
  const rows = currentDetailRows()
    .slice()
    .sort((a,b)=> (a.janela_iso ? new Date(a.janela_iso).getTime() : Infinity) - (b.janela_iso ? new Date(b.janela_iso).getTime() : Infinity));
  const tbody = document.querySelector('#detailTable tbody');
  if(!rows.length){
    tbody.innerHTML = '<tr><td colspan="13" class="search-noresult">Nenhum pedido encontrado' + (gFilters.pedido ? ' para "'+gFilters.pedido+'"' : '') + '.</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(r=>{
    /* Alteração 9 — Desvio da janela no formato HH:mm (ANTES/APÓS/NO HORÁRIO);
       a Permanência (Saída − Chegada) é preservada na coluna própria. */
    /* Etapa 4 · Alteração 26 — aglutinador, fornecedor, município e
       transportadora são texto livre vindo da planilha: esc() obrigatório.
       Pedido é numérico após transformSheetRows (Number) e as datas são
       formatadas internamente por fmtDDMMHHMM — mas recebem esc() também,
       por defesa em profundidade contra bases futuras fora do padrão. */
    return `
    <tr>
      <td>${esc(r.pedido ?? '')}</td>
      <td>${esc(r.aglutinador ?? '')}</td>
      <td class="col-tipo-pedido">${esc(tipoPedido(r) || '—')}</td>
      <td>${esc(normCampo(r.planta))}</td>
      <td>${esc(r.fornecedor ?? '')}</td>
      <td>${esc(r.municipio ?? '')}</td>
      <td>${esc(r.janela ?? '—')}</td>
      <td>${esc(r.chegada_origem ?? '—')}</td>
      <td>${desvioCellHtml(r)}</td>
      <td>${esc(r.saida_origem ?? '—')}</td>
      <td>${r.permanencia_min!=null ? fmtMin(r.permanencia_min) : '—'}</td>
      <td>${r.tem_nf ? ('Sim ('+r.qtde_nf+')') : 'Não'}</td>
      <td>${esc(r.transportador ?? '')}</td>
    </tr>`;
  }).join('');
}

let map, markersLayer;

// jitter determinístico para não empilhar marcadores exatamente no mesmo ponto
function jitterCoord(lat, lng, seedStr){
  let h = 0;
  for(let i=0;i<seedStr.length;i++){ h = (h*31 + seedStr.charCodeAt(i)) >>> 0; }
  const a = (h % 1000)/1000, b = ((h>>10) % 1000)/1000;
  const r = 0.01; // ~1km
  return [lat + (a-0.5)*r, lng + (b-0.5)*r];
}

let routeLayer;
function haversineKm(a,b){
  const R=6371, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b[0]-a[0]), dLng=toRad(b[1]-a[1]);
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(s), Math.sqrt(1-s));
}

function legStyle(status){
  /* Alteração 2 (Etapa 3) — cores dos trechos mais vibrantes e de leitura imediata:
     verde = concluído, azul intenso = em andamento, violeta tracejado = pendente. */
  if(status==='Finalizado') return {color:'#10B981', opacity:.6, weight:4, dash:null, label:'Concluído'};
  if(status==='Iniciado') return {color:'#2563EB', opacity:.95, weight:5, dash:null, label:'Em andamento'};
  return {color:'#8B5CF6', opacity:.9, weight:4, dash:'2,10', label:'Pendente'};
}

async function fetchLegGeometry(a,b){
  try{
    const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
    const resp = await fetch(url);
    if(!resp.ok) throw new Error('http '+resp.status);
    const data = await resp.json();
    if(!data.routes || !data.routes.length) throw new Error('sem rota');
    const route = data.routes[0];
    return { coords: route.geometry.coordinates.map(c=>[c[1],c[0]]), km: route.distance/1000, min: route.duration/60, ok:true };
  } catch(e){
    return { coords: [[a.lat,a.lng],[b.lat,b.lng]], km: haversineKm([a.lat,a.lng],[b.lat,b.lng]), min: null, ok:false };
  }
}

async function buildRoute(stops){
  const infoEl = document.getElementById('routeInfo');
  if(routeLayer) routeLayer.clearLayers(); else if(map) routeLayer = L.layerGroup().addTo(map);
  if(!currentAgl || stops.length<2){ if(infoEl) infoEl.innerHTML=''; return; }
  if(infoEl) infoEl.innerHTML = '<div class="route-loading">Seguindo a ordem das janelas e calculando cada trecho da rota…</div>';

  let rowsHtml = '', totalKm = 0, totalMin = 0, anyFail = false, anyNoTime = false;

  for(let i=0;i<stops.length-1;i++){
    /* Alteração 06 · seção 20 — mesma camada de cache usada pela Evolução dos
       Pedidos: nenhuma rota é consultada duas vezes. */
    const leg = await obterTrechoRota(stops[i], stops[i+1]);
    if(!leg.ok) anyFail = true;
    if(leg.min==null) anyNoTime = true;

    // cor do trecho conforme o status do ponto de destino — como o traçado de rota do Uber, que muda de cor a cada parada
    const style = legStyle(stops[i+1].domStatus);
    L.polyline(leg.coords, {color:style.color, weight:style.weight, opacity:style.opacity, dashArray:style.dash, lineCap:'round'}).addTo(routeLayer);

    const mid = leg.coords[Math.floor(leg.coords.length/2)];
    const kmTxt = leg.km.toFixed(1);
    const minTxt = leg.min!=null ? Math.round(leg.min)+' min' : '—';
    const legIcon = L.divIcon({className:'route-leg-label', html:`<div>${kmTxt} km<span>${minTxt}</span></div>`, iconSize:null});
    L.marker(mid, {icon:legIcon, zIndexOffset:950, interactive:false}).addTo(routeLayer);

    totalKm += leg.km;
    if(leg.min!=null) totalMin += leg.min;

    rowsHtml += `<tr>
      <td>${i+1}. ${esc(stops[i].fornecedor)}</td><td>→</td><td>${(i+2)}. ${esc(stops[i+1].fornecedor)}</td>
      <td>${kmTxt} km</td><td>${minTxt}</td>
      <td><span class="badge" style="background:${style.color};">${esc(stops[i+1].domStatus)}</span></td>
    </tr>`;
  }

  // marcadores numerados nas paradas, coloridos pelo status daquele fornecedor
  stops.forEach((s,i)=>{
    const style = legStyle(s.domStatus);
    const numIcon = L.divIcon({className:'route-num', html:`<div style="background:${style.color};">${i+1}</div>`, iconSize:[22,22]});
    L.marker([s.lat,s.lng], {icon:numIcon, zIndexOffset:1000}).addTo(routeLayer);
  });

  const warn = [];
  if(anyFail) warn.push('Alguns trechos usaram distância em linha reta (serviço de rotas indisponível no momento).');
  if(anyNoTime) warn.push('Tempo estimado indisponível para os trechos em linha reta.');

  if(infoEl) infoEl.innerHTML = `
    ${warn.length ? '<div class="route-loading">'+warn.join(' ')+'</div>' : ''}
    <table class="route-table">
      <thead><tr><th>De</th><th></th><th>Para</th><th>Distância</th><th>Tempo estimado</th><th>Status do trecho</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
      <tfoot><tr><td colspan="3">Rota completa (${stops.length} paradas, ordenada pela janela)</td><td>${totalKm.toFixed(1)} km</td><td>${Math.round(totalMin)} min</td><td></td></tr></tfoot>
    </table>`;
}

function buildMap(){
  if(!window.L) return;  // Leaflet indisponível (CDN bloqueado): mapa fica vazio, sem derrubar o restante do painel

  /* Alteração 06 · seções 25 e 27 — FONTE ÚNICA DE VERDADE.
     O mapa passa a consumir exatamente a mesma base filtrada da Evolução dos
     Pedidos (filteredData) e o mesmo selector (construirRotaFornecedores).
     Antes, com um aglutinador selecionado, o mapa lia RAW e ignorava os
     filtros globais — o que podia exibir fornecedores ausentes da evolução. */
  const rows = currentAgl ? aglRows() : filteredData();
  const passos = construirRotaFornecedores(rows);

  if(!map){
    map = L.map('map', {zoomControl:true, attributionControl:false}).setView([-23.5,-47],6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  }
  markersLayer.clearLayers();
  if(routeLayer) routeLayer.clearLayers();
  _marcadoresPorFornecedor = new Map();

  const points = [];
  const stops = [];
  passos.forEach(p=>{
    if(p.latitude == null) return;   // seção 24 — sem coordenada: fallback sem marcador
    /* Seção 24 — a coordenada é do município, não do endereço do fornecedor.
       O jitter determinístico evita empilhar fornecedores distintos do mesmo
       município exatamente no mesmo ponto, e o popup informa a aproximação. */
    const [jlat, jlng] = jitterCoord(p.latitude, p.longitude, p.supplierKey);
    const dom = p.isDelayed ? 'Não iniciado' : (p.isFinished ? 'Finalizado' : 'Iniciado');
    const color = MAP_COLORS[dom];
    const m = L.circleMarker([jlat,jlng], {radius: 9, color:color, fillColor:color, fillOpacity:.85, weight:2});

    /* Seção 25 — o marcador apresenta os mesmos dados da caixa do fornecedor. */
    m.bindPopup(
      '<b>' + esc(p.supplierName) + '</b><br>' +
      esc(p.municipality || 'Município não informado') + ' · parada ' + p.sequence + ' de ' + passos.length + '<br>' +
      'Pedidos (' + p.totalOrders + '): ' + p.orderIds.join(', ') + '<br>' +
      '<b>Janela:</b> ' + (p.scheduledWindow || 'Não programada') + '<br>' +
      '<b>Chegada origem:</b> ' + (p.arrivalAtOrigin || 'Aguardando chegada') + '<br>' +
      '<b>Saída origem:</b> ' + (p.departureAtOrigin || 'Aguardando saída') + '<br>' +
      '<b>Status da coleta:</b> ' + esc(p.comparativeStatusMessage) + '<br>' +
      '<b>NF:</b> ' + esc(notasFiscaisGrupoTexto(p.pedidosDetalhe) || 'SEM NF') +
      (p.hasNonConformity ? '<br><b>Não conformidade:</b> ' + esc(p.nonConformityMessage) : '') +
      '<br><i>Localização aproximada pelo município.</i>'
    );
    if(currentAgl){
      m.bindTooltip(
        `<b>${esc(p.supplierName)}</b><br><span style="color:${color};font-weight:800;">● ${p.sequence}. ${esc(p.statusLabel)}</span>`,
        {permanent:true, direction:'top', className:'tl-map-label', offset:[0,-10]}
      );
    }
    /* Seção 26 — clique no marcador destaca a caixa correspondente. */
    m.on('click', ()=> destacarCaixaEvolucao(p.supplierKey));
    markersLayer.addLayer(m);
    _marcadoresPorFornecedor.set(p.supplierKey, m);
    points.push([jlat,jlng]);
    stops.push({fornecedor:p.supplierName, lat:jlat, lng:jlng, sequence:p.sequence, domStatus:dom});
  });

  if(points.length){
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {padding:[40,40], maxZoom: currentAgl ? 11 : 8});
  }

  stops.sort((a,b)=>a.sequence-b.sequence);
  buildRoute(stops);
}

/* ==========================================================================
   14. TAB 2 — COBRANÇAS STATUS
   --------------------------------------------------------------------------
   Painel executivo de acompanhamento e exportação dos pedidos em atraso.
   Possui pipeline de filtros próprio (não interfere nos filtros globais das
   demais abas): pesquisa de pedido, pesquisa de fornecedor e multi-seleção
   de transportadora, data e modal. Alimenta KPIs, gráficos, ranking e a
   tabela detalhada paginada/ordenável, além do Relatório de Cobranças (.xlsx).
   ========================================================================== */

const cobState = {
  pedido: '',            // pesquisa parcial por número do pedido
  fornecedor: '',        // pesquisa parcial por fornecedor
  tableSearch: '',       // pesquisa livre na tabela
  page: 1,
  pageSize: 25,
  sortKey: 'janela_iso',
  sortDir: 'asc',
  /* Etapa 3 · Alteração 5 — seleções feitas por clique nos gráficos.
     planta: string ou null; modal: CATEGORIA CONSOLIDADA do gráfico ou null.
     São cumulativas com os demais filtros e removíveis por novo clique,
     pelo chip "✕" no título do gráfico ou por "Limpar filtros".
     Etapa 3 (esta etapa) — a seleção "combo" foi removida junto com o gráfico
     Comparativo por Transportadora, Modal e Planta. */
  chartSel: { planta: null, modal: null, status: null, transp: null },
};
let msTransp, msData, msModal;
let cobChartStatusRef = null, cobChartPerfRef = null, cobChartModalRef = null;
let cobChartPlantaRef = null;

/* ---- Utilitários ---- */

function cssVar(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* Regra de STATUS (Etapa 3): tolerância de ±30min em torno da janela.
   Delegada para statusJanela() — ver utilitários centralizados na seção 03-A.
   Retorna: 'dentro' | 'antes' | 'atraso' | 'no_horario' | null. */
function cobStatusJanela(r){
  return statusJanela(r).code;
}

// Permanência = SAÍDA ORIGEM − CHEGADA ORIGEM, exibida como "02h15min"
function fmtPermanencia(min){
  if(min == null) return '—';
  const neg = min < 0;
  const abs = Math.abs(min);
  const h = Math.floor(abs/60), m = Math.round(abs % 60);
  const pad = n => String(n).padStart(2,'0');
  return (neg ? '-' : '') + pad(h) + 'h' + pad(m) + 'min';
}

function fmtHoras(min){
  if(min == null) return '—';
  return (min/60).toFixed(1).replace('.', ',') + ' h';
}

/* ---- Etapa 3 · Alterações 6 e 10 — utilitários centralizados ----
   normCampo(): trata Planta/Modal/Transportadora vazios como "Não informado",
   mantendo esses registros em todos os cálculos, gráficos, tabela e Excel.
   cobAgrupamentos(): agrega Planta, Modal, Transportadora e a combinação
   Transportadora×Modal×Planta em uma única passada, com memoização por
   referência do conjunto filtrado (evita reprocessar os mesmos dados em
   componentes distintos ao trocar de tema ou redimensionar). */

const NAO_INFORMADO = 'Não informado';

function normCampo(v){
  const s = v == null ? '' : String(v).trim();
  return s || NAO_INFORMADO;
}

/* ---- Etapa 3 · Alteração 2 — consolidação de Modal (camada analítica) ----
   Regra aplicada EXCLUSIVAMENTE ao gráfico "Distribuição dos Pedidos por
   Modal". A base, a tabela de detalhamento, o filtro de Modal, o upload e a
   exportação para Excel continuam usando o valor ORIGINAL de cada pedido.

   normalizarModal() elimina as divergências de digitação antes do
   agrupamento: caixa alta/baixa, espaços nas pontas, espaços internos
   repetidos e caracteres invisíveis (BOM, zero-width, NBSP).
   Ex.: " milkrun  extra " → "MILKRUN EXTRA" → categoria "MILKRUN". */
const MODAL_CHART_GROUPS = {
  'COLETA FTL EMBALAGENS (FABRICA)':     'EMBALAGENS',
  'COLETA MILKRUN EMBALAGENS (FABRICA)': 'EMBALAGENS',
  'ENTREGA EMBALAGENS (FORN)':           'EMBALAGENS',
  'FTL':                                 'FTL',
  'FTL EXTRA':                           'FTL',
  'MILKRUN':                             'MILKRUN',
  'MILKRUN EXTRA':                       'MILKRUN',
  'MILKRUN FF':                          'MILKRUN',
};
const MODAL_NAO_INFORMADO = 'NÃO INFORMADO';

function normalizarModal(v){
  if(v == null) return '';
  return String(v)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')   // caracteres invisíveis
    .replace(/\u00A0/g, ' ')                 // espaço não separável
    .replace(/\s+/g, ' ')                    // espaços internos repetidos
    .trim()
    .toUpperCase();
}

/* Categoria exibida no gráfico. Valores fora das regras mantêm a descrição
   original normalizada; vazios/nulos viram "NÃO INFORMADO" e NÃO são
   descartados do gráfico. */
function getModalChartCategory(modal){
  const n = normalizarModal(modal);
  if(!n) return MODAL_NAO_INFORMADO;
  return MODAL_CHART_GROUPS[n] || n;
}

/* Agrupa um conjunto JÁ FILTRADO por categoria consolidada. */
function groupOrdersByModalChartCategory(rows){
  const mapa = new Map();
  rows.forEach(r => {
    const cat = getModalChartCategory(r.modal);
    mapa.set(cat, (mapa.get(cat) || 0) + 1);
  });
  return mapa;
}

let _cobAggCache = { rows: null, agg: null };

/* Agregação central, memoizada pela referência do conjunto filtrado.
   porModal    = valores ORIGINAIS (uso geral)
   porModalCat = categorias CONSOLIDADAS (uso exclusivo do gráfico de Modal) */
function cobAgrupamentos(rows){
  if(_cobAggCache.rows === rows && _cobAggCache.agg) return _cobAggCache.agg;
  const porPlanta = new Map(), porModal = new Map(), porTransp = new Map();
  const porModalCat = new Map();
  rows.forEach(r => {
    const p = normCampo(r.planta), m = normCampo(r.modal), t = normCampo(r.transportador);
    porPlanta.set(p, (porPlanta.get(p) || 0) + 1);
    porModal.set(m, (porModal.get(m) || 0) + 1);
    porTransp.set(t, (porTransp.get(t) || 0) + 1);
    const cat = getModalChartCategory(r.modal);
    porModalCat.set(cat, (porModalCat.get(cat) || 0) + 1);
  });
  const agg = { total: rows.length, porPlanta, porModal, porModalCat, porTransp };
  _cobAggCache = { rows, agg };
  return agg;
}

// Fórmula percentual única (Alterações 2.1/2.2/3): qtde ÷ total filtrado × 100
/* Etapa 3 (revisão) — delega para fmtPctBR(): uma única regra de percentual em
   toda a aplicação (cards, gráficos e ranking permanecem coerentes entre si).
   O texto de ausência de base ("—") dos gráficos é preservado. */
function pctDe(v, total){
  return fmtPctBR(v, total, '—');
}

/* ---- Alteração 5 — cliques nos gráficos (filtros interativos) ---- */

function toggleChartPlanta(planta){
  const cs = cobState.chartSel;
  cs.planta = cs.planta === planta ? null : planta;
  cobState.page = 1;
  setTimeout(buildCobrancas, 0);   // Etapa 3 — evita destruir o Chart dentro do ciclo do clique
}

/* O rótulo recebido aqui já é a CATEGORIA CONSOLIDADA do gráfico. */
function toggleChartModal(modalCategoria){
  const cs = cobState.chartSel;
  cs.modal = cs.modal === modalCategoria ? null : modalCategoria;
  cobState.page = 1;
  setTimeout(buildCobrancas, 0);   // Etapa 3 — evita destruir o Chart dentro do ciclo do clique
}

function limparChartSel(){
  cobState.chartSel = { planta: null, modal: null, status: null, transp: null };
}

/* Alteração 4 (Etapa 3) — clique no donut "Status geral" filtra toda a aplicação */
/* Alteração 22 — os rótulos dos chips saem da nomenclatura única. */
const STATUS_CHIP_LABELS = Object.keys(PEDIDO_STATUS_DEFS)
  .reduce((acc, k) => { acc[k] = PEDIDO_STATUS_DEFS[k].curto; return acc; }, {});
function toggleChartStatus(code){
  const cs = cobState.chartSel;
  cs.status = cs.status === code ? null : code;
  cobState.page = 1;
  /* A reconstrução é adiada para o próximo tick: o clique parte do onClick do
     próprio Chart.js e destruir o gráfico dentro do ciclo do evento gera erro
     interno ("handleEvent" em instância destruída). */
  setTimeout(buildCobrancas, 0);
}
function limparChartStatus(){
  if(cobState.chartSel.status){ cobState.chartSel.status = null; cobState.page = 1; buildCobrancas(); }
}

/* Alterações 4/5 (Etapa 3) — clique na barra de performance ou no ranking
   filtra o dashboard pela transportadora; duplo clique remove o filtro. */
function toggleChartTransp(t){
  const cs = cobState.chartSel;
  cs.transp = cs.transp === t ? null : t;
  cobState.page = 1;
  setTimeout(buildCobrancas, 0);   // mesmo motivo de toggleChartStatus()
}
function limparChartTransp(){
  if(cobState.chartSel.transp){ cobState.chartSel.transp = null; cobState.page = 1; buildCobrancas(); }
}

/* Chips no título dos gráficos: mostram a seleção ativa e a removem no clique. */
function renderChartChips(){
  const cs = cobState.chartSel;
  const chip = (id, texto, onClear) => {
    const el = document.getElementById(id);
    if(!el) return;
    if(texto){
      el.textContent = texto + ' ✕';
      el.title = 'Clique para remover este filtro';
      el.classList.add('on');
      el.onclick = () => { onClear(); cobState.page = 1; buildCobrancas(); };
    } else {
      el.classList.remove('on');
      el.textContent = '';
      el.onclick = null;
    }
  };
  chip('cobPlantaChip', cs.planta, () => { cobState.chartSel.planta = null; });
  chip('cobStatusChip', cs.status ? (STATUS_CHIP_LABELS[cs.status] || cs.status) : null, () => { cobState.chartSel.status = null; });
  chip('cobPerfChip', cs.transp, () => { cobState.chartSel.transp = null; });
  chip('cobRankChip', cs.transp, () => { cobState.chartSel.transp = null; });
  chip('cobModalChip', cs.modal, () => { cobState.chartSel.modal = null; });
}

/* ---- Pipeline de filtros do painel ---- */

function cobFilteredData(){
  const selT = msTransp ? msTransp.getSelected() : null;
  const selD = msData ? msData.getSelected() : null;
  const selM = msModal ? msModal.getSelected() : null;
  const ped = cobState.pedido;
  const forn = cobState.fornecedor.toLowerCase();
  const cs = cobState.chartSel; // Alteração 5 — seleções por clique nos gráficos
  // Base já globalmente filtrada (KPIs do topo + filtros da aba 1): cumulativo
  return filteredData().filter(r =>
    (!ped  || String(r.pedido ?? '').includes(ped)) &&
    (!forn || (r.fornecedor || '').toLowerCase().includes(forn)) &&
    (!selT || selT.has(r.transportador)) &&
    (!selD || selD.has(r.janela_data)) &&
    (!selM || selM.has(r.modal)) &&
    (!cs.planta || normCampo(r.planta) === cs.planta) &&
    /* Alteração 2 — a seleção vinda do gráfico é uma CATEGORIA consolidada,
       por isso a comparação usa getModalChartCategory(). O filtro de Modal da
       barra superior (selM) continua operando sobre o valor ORIGINAL. */
    (!cs.modal  || getModalChartCategory(r.modal) === cs.modal) &&
    /* Alteração 04 — a fatia clicada é uma CATEGORIA exaustiva; a comparação
       usa statusJanela(r).categoria (o code detalhado segue na tabela). */
    (!cs.status || statusJanela(r).categoria === cs.status) &&
    (!cs.transp || normCampo(r.transportador) === cs.transp)
  );
}

/* ---- Componente reutilizável de multi-seleção ----
   Recursos: pesquisa interna, Selecionar todos, Limpar, contador de itens
   selecionados e (opcional) seleção por intervalo de datas. */

function createMultiSelect(mountId, allLabel, opts){
  opts = opts || {};
  const mount = document.getElementById(mountId);
  const root = document.createElement('div');
  root.className = 'ms';
  root.innerHTML = `
    <button type="button" class="ms-btn">${allLabel}</button>
    <div class="ms-drop">
      <input type="text" class="ms-search" placeholder="Pesquisar…">
      <div class="ms-actions">
        <button type="button" class="ms-all">Selecionar todos</button>
        <button type="button" class="ms-clear">Limpar</button>
      </div>
      ${opts.range ? `
      <div class="ms-range">
        <input type="date" class="ms-range-de" title="Data inicial">
        <input type="date" class="ms-range-ate" title="Data final">
        <button type="button" class="ms-range-apply">Intervalo</button>
      </div>` : ''}
      <div class="ms-list"></div>
    </div>`;
  mount.appendChild(root);

  const btn = root.querySelector('.ms-btn');
  const drop = root.querySelector('.ms-drop');
  const search = root.querySelector('.ms-search');
  const listEl = root.querySelector('.ms-list');

  let options = [];              // [{value, label}]
  const selected = new Set();    // vazio = "todos"
  let onChange = opts.onChange || (()=>{});

  function renderButton(){
    if(!selected.size){
      btn.innerHTML = allLabel;
    } else if(selected.size === 1){
      const only = options.find(o => selected.has(o.value));
      btn.innerHTML = esc(only ? only.label : [...selected][0]);
    } else {
      btn.innerHTML = allLabel + ' <span class="ms-count">' + selected.size + ' selecionados</span>';
    }
  }

  function renderList(){
    const q = (search.value || '').trim().toLowerCase();
    const visible = q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
    if(!visible.length){ listEl.innerHTML = '<div class="ms-empty">Nenhum item encontrado.</div>'; return; }
    listEl.innerHTML = visible.map(o => `
      <label><input type="checkbox" value="${esc(o.value)}" ${selected.has(o.value) ? 'checked' : ''}> ${esc(o.label)}</label>
    `).join('');
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.ms.open').forEach(m => { if(m !== root) m.classList.remove('open'); });
    root.classList.toggle('open');
    if(root.classList.contains('open')){ search.value = ''; renderList(); search.focus(); }
  });
  document.addEventListener('click', e => { if(!root.contains(e.target)) root.classList.remove('open'); });
  drop.addEventListener('click', e => e.stopPropagation());

  search.addEventListener('input', renderList);
  listEl.addEventListener('change', e => {
    const cb = e.target;
    if(cb && cb.type === 'checkbox'){
      if(cb.checked) selected.add(cb.value); else selected.delete(cb.value);
      renderButton(); onChange();
    }
  });
  root.querySelector('.ms-all').addEventListener('click', () => {
    options.forEach(o => selected.add(o.value));
    renderList(); renderButton(); onChange();
  });
  root.querySelector('.ms-clear').addEventListener('click', () => {
    selected.clear();
    renderList(); renderButton(); onChange();
  });
  if(opts.range){
    root.querySelector('.ms-range-apply').addEventListener('click', () => {
      const de = root.querySelector('.ms-range-de').value;
      const ate = root.querySelector('.ms-range-ate').value;
      if(!de && !ate) return;
      selected.clear();
      options.forEach(o => {
        if((!de || o.value >= de) && (!ate || o.value <= ate)) selected.add(o.value);
      });
      renderList(); renderButton(); onChange();
    });
  }

  return {
    setOptions(list){
      options = list;
      [...selected].forEach(v => { if(!options.some(o => o.value === v)) selected.delete(v); });
      renderList(); renderButton();
    },
    getSelected(){ return selected.size ? selected : null; },
    clear(){ selected.clear(); renderList(); renderButton(); },
  };
}

/* ---- Filtros: montagem e reset ---- */

function fmtDataBR(isoDate){
  const [y,m,d] = isoDate.split('-');
  return d + '/' + m + '/' + y;
}

function populateCobMultiSelects(){
  const transp = [...new Set(RAW.map(r => r.transportador).filter(Boolean))].sort()
    .map(v => ({value:v, label:v}));
  const datas = [...new Set(RAW.map(r => r.janela_data).filter(Boolean))].sort()
    .map(v => ({value:v, label:fmtDataBR(v)}));
  const modais = [...new Set(RAW.map(r => r.modal).filter(Boolean))].sort()
    .map(v => ({value:v, label:v}));
  msTransp.setOptions(transp);
  msData.setOptions(datas);
  msModal.setOptions(modais);
}

function resetCobFilters(){
  cobState.pedido = ''; cobState.fornecedor = ''; cobState.tableSearch = '';
  cobState.page = 1;
  const p = document.getElementById('cobPedidoSearch');
  const f = document.getElementById('cobFornSearch');
  const t = document.getElementById('cobTableSearch');
  if(p){ p.value = ''; document.getElementById('cobPedidoClear').style.display = 'none'; }
  if(f){ f.value = ''; document.getElementById('cobFornClear').style.display = 'none'; }
  if(t) t.value = '';
  if(msTransp) msTransp.clear();
  if(msData) msData.clear();
  if(msModal) msModal.clear();
  limparChartSel();   // Alteração 5 — remove também as seleções feitas por clique nos gráficos
  populateCobMultiSelects();
}

function cobFiltersChanged(){
  cobState.page = 1;
  buildCobrancas();
}

/* ---- Autocomplete (Pedidos e Fornecedor) ---- */

function setupCobAutocomplete(cfg){
  const wrap = document.getElementById(cfg.wrapId);
  const input = document.getElementById(cfg.inputId);
  const clearBtn = document.getElementById(cfg.clearId);
  const list = document.getElementById(cfg.listId);
  let debounceT = null;

  const notify = cfg.onApply || cobFiltersChanged;

  function apply(value){
    cfg.setValue(value);
    clearBtn.style.display = value ? 'block' : 'none';
    notify();
  }

  input.addEventListener('input', () => {
    clearTimeout(debounceT);
    debounceT = setTimeout(() => {
      const q = input.value.trim();
      apply(q);
      if(!q){ list.style.display = 'none'; return; }
      const matches = cfg.suggestions(q).slice(0, 30);
      list.innerHTML = matches.length
        ? matches.map(m => `<div data-v="${esc(m)}">${esc(m)}</div>`).join('')
        : '<div class="cob-ac-empty">Nenhum resultado.</div>';
      list.style.display = 'block';
    }, 160);
  });
  list.addEventListener('click', e => {
    const v = e.target.getAttribute('data-v');
    if(v != null){ input.value = v; list.style.display = 'none'; apply(v); }
  });
  clearBtn.addEventListener('click', () => {
    input.value = ''; list.style.display = 'none'; apply('');
  });
  document.addEventListener('click', e => { if(!wrap.contains(e.target)) list.style.display = 'none'; });
}

/* ---- KPIs ---- */

function buildCobKpis(rows){
  /* Alteração 4 (Etapa 2) — os cards duplicados da aba Cobranças foram
     removidos do HTML; os cards globais do topo (buildKpis) são a única
     apresentação dos indicadores. A função é mantida para o caso de o
     contêiner voltar a existir e usa exatamente os mesmos predicados
     centralizados de KPI_FILTERS (Alteração 3 · Etapa 3). */
  const el = document.getElementById('cobKpis');
  if(!el) return;
  const total = rows.length;
  const count = fn => rows.filter(fn).length;
  const pct = v => fmtPctBR(v, total);

  const kpis = [
    { lbl:'Total de Pedidos',     val:total, sub: fmtPctBR(total, total), ico:'📋', color:'#3aa79f' },
    { lbl:'Pedidos em Atraso',    key:'atraso',       ico:'🕐', color:'#d1573f' },
    { lbl:'Dentro da Janela',     key:'dentro',       ico:'✅', color:'#4e7fd1' },
    { lbl:'Sem GE',               key:'sem_ge',       ico:'⏳', color:'#e0a13c' },
    { lbl:'Com NF',               key:'com_nf',       ico:'🧾', color:'#2f8f5b' },
    { lbl:'Sem NF',               key:'sem_nf',       ico:'📄', color:'#c9682f' },
    { lbl:'Não Conformidade',     key:'nao_conforme', ico:'🛡️', color:'#b04a5a' },
    { lbl:'FIN. DENTRO DO PRAZO', key:'fin_prazo',    ico:'🏁', color:'#2f8f5b' },
    { lbl:'FIN. COM ATRASO',      key:'fin_atraso',   ico:'⛔', color:'#b04a5a' },
  ];
  kpis.forEach(k => { if(k.key){ k.val = count(KPI_FILTERS[k.key]); k.sub = pct(k.val); } });

  el.innerHTML = kpis.map(k => `
    <div class="cob-kpi" style="--kc:${k.color};" title="${k.lbl}">
      <div class="cob-kpi-ico">${k.ico}</div>
      <div>
        <div class="cob-kpi-lbl">${k.lbl}</div>
        <div class="cob-kpi-val">${fmtIntBR(k.val)}</div>
        <div class="cob-kpi-pct">${k.sub}</div>
      </div>
    </div>`).join('');
}

/* ---- Faixa: tempo médio e maior atraso ---- */

function buildCobStrip(rows){
  /* Etapa 3 — o atraso agora usa o desvio da janela (chegada, ou horário
     atual de Brasília para pedidos sem chegada registrada). */
  /* Alteração 24 — mesma regra central: entram na estatística de atraso todos
     os pedidos cujo desvio da janela ultrapassou a tolerância de +30 min
     (chegada tardia registrada OU ainda sem chegada com prazo vencido). */
  const atrasos = rows.filter(r => statusJanela(r).atrasoOperacional);
  const mediaEl = document.getElementById('cobMediaAtraso');
  const maiorEl = document.getElementById('cobMaiorAtraso');
  const maiorPedEl = document.getElementById('cobMaiorAtrasoPedido');
  if(!atrasos.length){
    mediaEl.textContent = '—'; maiorEl.textContent = '—'; maiorPedEl.textContent = '';
    return;
  }
  const desvio = r => statusJanela(r).desvioMin || 0;
  const soma = atrasos.reduce((s,r) => s + desvio(r), 0);
  mediaEl.textContent = fmtHoras(soma / atrasos.length);
  const pior = atrasos.reduce((a,b) => desvio(a) >= desvio(b) ? a : b);
  maiorEl.textContent = fmtHoras(desvio(pior));
  maiorPedEl.textContent = 'Pedido ' + pior.pedido;
}

/* ---- Gráficos (Status geral + Performance por transportadora) ---- */

/* Alteração 4 (Etapa 3) — rótulos de valores dentro das barras horizontais
   (Performance por transportadora). Desenha o valor apenas quando o segmento
   tem largura suficiente, mantendo o visual limpo. */
const pluginValoresBarra = {
  id: 'valoresBarra',
  afterDatasetsDraw(chart){
    const ctx = chart.ctx;
    ctx.save();
    ctx.font = '700 11px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    chart.data.datasets.forEach((ds, di) => {
      const meta = chart.getDatasetMeta(di);
      if(meta.hidden) return;
      meta.data.forEach((barra, i) => {
        const v = ds.data[i];
        if(!v) return;
        const p = barra.getProps(['x','y','base'], true);
        if(Math.abs(p.x - p.base) < 26) return;   // segmento estreito: sem rótulo
        ctx.fillText(fmtIntBR(v), (p.x + p.base) / 2, p.y);
      });
    });
    ctx.restore();
  },
};

function buildCobCharts(rows){
  if(!window.Chart) return;
  const inkColor = cssVar('--ink') || '#1c2b2e';
  const lineColor = cssVar('--line') || '#e1e6e6';
  const GREEN = '#2f8f5b', RED = '#d1573f', GRAY = '#9aa5a6';

  /* ---- ALTERAÇÕES 03.1 e 04 — Status geral dos pedidos ----
     O gráfico consome o serviço central calcularIndicadores() — o MESMO dos
     cards — e exibe exclusivamente as quatro categorias operacionais
     exaustivas. Com a Alteração 04, TODO pedido pertence a exatamente uma
     categoria, portanto:
       fatias = anel completo = Total de Pedidos = 100% (soma verificada por
       validarClassificacao(), seção 12). O Total de Pedidos é a referência
       geral (centro da rosca + 1ª linha da legenda), não uma 5ª fatia. */
  const ind = calcularIndicadores(rows, GRAFICO_CHAVES);
  const total = ind.total;
  validarClassificacao(rows, ind);   // seção 12 — alerta em caso de divergência
  document.getElementById('cobDonutTotal').textContent = fmtIntBR(total);

  const pctTxt = v => total ? ' (' + pctDe(v, total) + ')' : '';
  const statusDefs = GRAFICO_CATEGORIAS.map(c => ({
    code: c.key, lbl: c.lbl, val: ind[c.key], color: c.cor,
  }));

  /* Legenda: Total de Pedidos (referência 100%) + as quatro categorias,
     sempre todas exibidas, inclusive zeradas — a leitura permanece estável. */
  document.getElementById('cobDonutLegend').innerHTML = total
    ? '<div class="dl-row dl-total"><span class="dl-sw" style="background:' + cssVar('--teal') + ';"></span>Total de Pedidos'
        + '<span class="dl-val">' + fmtIntBR(total) + ' (' + fmtPctBR(total, total) + ')</span></div>'
      + statusDefs.map(d => `
      <div class="dl-row"><span class="dl-sw" style="background:${d.color};"></span>${d.lbl}<span class="dl-val">${fmtIntBR(d.val)}${pctTxt(d.val)}</span></div>`).join('')
    : '<div class="dl-row">Nenhum pedido com os filtros atuais.</div>';

  const donutCtx = document.getElementById('cobChartStatus');
  if(cobChartStatusRef) cobChartStatusRef.destroy();
  cobChartStatusRef = new Chart(donutCtx, {
    type: 'doughnut',
    data: {
      labels: statusDefs.map(d => d.lbl),
      datasets: [{
        data: statusDefs.map(d => d.val),
        backgroundColor: statusDefs.map(d => d.color),
        borderWidth: 0, hoverOffset: 6,
      }],
    },
    options: {
      cutout: '70%',
      responsive: true,
      /* Alteração 4 — clique filtra toda a aplicação; duplo clique (listener no
         canvas, registrado em setupCobrancas) remove o filtro. */
      onClick: (_evt, elems) => {
        if(!elems.length) return;
        toggleChartStatus(statusDefs[elems[0].index].code);
      },
      onHover: (evt, elems) => { evt.native.target.style.cursor = elems.length ? 'pointer' : 'default'; },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
          label: ctx => ctx.label + ': ' + fmtIntBR(ctx.parsed) + ' pedido' + (ctx.parsed === 1 ? '' : 's') + pctTxt(ctx.parsed),
          footer: () => 'Total de Pedidos: ' + fmtIntBR(total),
        } },
      },
    },
  });

  /* ---- Etapa 3 — roscas interativas de Planta e Modal + comparativo ----
     Todos usam o MESMO conjunto filtrado (rows) e a agregação centralizada
     de cobAgrupamentos() — nada é calculado fora do filtro atual. */
  const agg = cobAgrupamentos(rows);
  const PALETA = ['#0f6e68','#4e7fd1','#e0a13c','#b04a5a','#2f8f5b','#c9682f','#7a5fb5','#3aa79f','#9aa5a6','#d1573f'];

  // Fábrica das roscas (Planta e Modal): legenda com qtde + %, total ao centro,
  // tooltip detalhado e clique aplicando/removendo o filtro correspondente.
  const montarDonut = (cfg) => {
    const canvas = document.getElementById(cfg.canvasId);
    if(!canvas) return null;
    const entradas = [...cfg.mapa.entries()].sort((a,b) => b[1] - a[1]);
    const cores = entradas.map((_,i) => PALETA[i % PALETA.length]);
    document.getElementById(cfg.totalId).textContent = fmtIntBR(total);
    document.getElementById(cfg.legendId).innerHTML = entradas.map(([nome,v],i) => `
      <div class="dl-row"><span class="dl-sw" style="background:${cores[i]};"></span>${esc(nome)}<span class="dl-val">${fmtIntBR(v)} (${pctDe(v, total)})</span></div>`).join('');
    if(cfg.ref) cfg.ref.destroy();
    return new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: entradas.map(e => e[0]),
        datasets: [{
          data: entradas.map(e => e[1]),
          backgroundColor: cores,
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        cutout: '72%',
        responsive: true,
        onClick: (_evt, elems, chart) => {
          if(!elems.length) return;
          cfg.onPick(chart.data.labels[elems[0].index]);
        },
        onHover: (evt, elems) => { evt.native.target.style.cursor = elems.length ? 'pointer' : 'default'; },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ctx.label + ': ' + fmtIntBR(ctx.parsed) + ' pedido' + (ctx.parsed === 1 ? '' : 's') + ' (' + pctDe(ctx.parsed, total) + ')',
              footer: () => 'Total de Pedidos: ' + fmtIntBR(total),
            },
          },
        },
      },
    });
  };

  // Alteração 2.1 — Distribuição dos Pedidos por Planta
  cobChartPlantaRef = montarDonut({
    canvasId: 'cobChartPlanta', totalId: 'cobPlantaTotal', legendId: 'cobPlantaLegend',
    mapa: agg.porPlanta, ref: cobChartPlantaRef, onPick: toggleChartPlanta,
  });

  /* Alteração 2 (Etapa 3) — Distribuição dos Pedidos por Modal com as
     categorias consolidadas (EMBALAGENS / FTL / MILKRUN + demais originais).
     A consolidação ocorre DEPOIS da filtragem: rows já é o conjunto filtrado. */
  cobChartModalRef = montarDonut({
    canvasId: 'cobChartModal', totalId: 'cobModalTotal', legendId: 'cobModalLegend',
    mapa: agg.porModalCat, ref: cobChartModalRef, onPick: toggleChartModal,
  });

  /* ---- ALTERAÇÃO 03.2 — Performance por transportadora ----
     Mesma lógica do gráfico Status geral, apenas agrupada: para cada
     transportadora, calcularIndicadores() roda sobre os pedidos dela dentro
     do conjunto já filtrado. As séries são exatamente as quatro categorias
     oficiais — nenhuma outra — e o Total de Pedidos aparece no tooltip como
     base. Somando as barras de todas as transportadoras chega-se aos mesmos
     números dos cards do topo. */
  const perfTransp = calcularIndicadoresPorTransportadora(rows);
  const top = perfTransp.slice(0, 10);
  const byT = {};
  top.forEach(t => { byT[t.nome] = t; });
  const labels = top.map(t => t.nome);
  const perfCtx = document.getElementById('cobChartPerf');
  if(cobChartPerfRef) cobChartPerfRef.destroy();
  cobChartPerfRef = new Chart(perfCtx, {
    type: 'bar',
    data: {
      labels,
      /* Uma série por categoria oficial, na mesma ordem e nas mesmas cores do
         gráfico Status geral e dos cards — leitura imediata entre componentes. */
      datasets: GRAFICO_CATEGORIAS.map(c => ({
        label: c.lbl, data: top.map(t => t[c.key]), backgroundColor: c.cor, stack: 's',
      })),
    },
    plugins: [pluginValoresBarra],   // Alteração 4 — valores dentro das barras
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      /* Alteração 4 — clique filtra o dashboard pela transportadora;
         duplo clique (listener no canvas) remove o filtro. */
      onClick: (_evt, elems, chart) => {
        if(!elems.length) return;
        toggleChartTransp(chart.data.labels[elems[0].index]);
      },
      onHover: (evt, elems) => { evt.native.target.style.cursor = elems.length ? 'pointer' : 'default'; },
      plugins: {
        legend: { position: 'top', labels: { color: inkColor, boxWidth: 12, padding: 10 } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const d = byT[ctx.label];
              return ctx.dataset.label + ': ' + fmtIntBR(ctx.parsed.x)
                + (d ? ' (' + pctDe(ctx.parsed.x, d.total) + ')' : '');
            },
            footer: items => {
              const d = byT[items[0].label];
              /* Alteração 04 — as barras da transportadora somam exatamente o
                 seu Total de Pedidos (classificação exaustiva). */
              return d ? 'Total de Pedidos: ' + fmtIntBR(d.total) : '';
            },
          },
        },
      },
      scales: {
        x: { stacked: true, ticks: { precision: 0, color: inkColor }, grid: { color: lineColor } },
        y: { stacked: true, ticks: { color: inkColor }, grid: { display: false } },
      },
    },
  });
}

/* ---- Ranking de transportadoras (maior nº de atrasos → menor) ---- */

/* ---- Etapa 3 · Alteração 1.4 — Ranking de Transportadoras ----
   getCarrierDelayRanking(): monta e ordena o ranking a partir do conjunto JÁ
   filtrado. Critério de desempate estável e determinístico, para que a posição
   não mude sozinha entre duas atualizações com os mesmos dados:
     1. maior quantidade de atrasos;
     2. maior percentual de atraso;
     3. nome da transportadora em ordem alfabética (pt-BR).
   splitCarrierRanking(): separa o Top N (fixo) das demais posições. */
function getCarrierDelayRanking(rows){
  const byT = new Map();
  rows.forEach(r => {
    const t = normCampo(r.transportador);   // Alteração 6 — "Não informado" entra no cálculo
    let v = byT.get(t);
    if(!v){ v = { nome: t, total: 0, atraso: 0 }; byT.set(t, v); }
    v.total++;
    if(statusJanela(r).atrasoOperacional) v.atraso++;   // Alteração 24 — regra central
  });
  return [...byT.values()]
    .filter(v => v.atraso > 0)
    .map(v => ({ ...v, pct: v.total ? v.atraso / v.total * 100 : 0 }))
    .sort((a, b) =>
      b.atraso - a.atraso ||
      b.pct - a.pct ||
      a.nome.localeCompare(b.nome, 'pt-BR')
    );
}

function splitCarrierRanking(ranking, n){
  return { top: ranking.slice(0, n), resto: ranking.slice(n) };
}

/* Alteração 1.4 (Etapa 3) — posições 1 a 6 sempre visíveis; da 7ª em
   diante, apenas por rolagem. Constante única: altera-se aqui e todo o
   componente (bloco fixo, contador e divisor) acompanha. */
const RANKING_TOP_N = 6;

function buildCobRanking(rows){
  /* Alteração 1.4 (Etapa 3) — o Top 6 fica SEMPRE visível dentro da própria
     caixa do Ranking; somente as transportadoras da 7ª posição em diante ficam
     numa área de rolagem vertical de altura controlada e barra oculta. Clique
     numa linha filtra toda a aplicação pela transportadora; duplo clique
     remove o filtro. Estrutura, dimensões e comportamento das seis primeiras
     posições permanecem exatamente como antes. */
  const el = document.getElementById('cobRanking');
  if(!el) return;

  const ranking = getCarrierDelayRanking(rows);
  if(!ranking.length){
    el.innerHTML = '<div class="cob-rank-empty">Nenhum pedido em atraso com os filtros atuais.</div>';
    return;
  }

  const max = ranking[0].atraso;
  const sel = cobState.chartSel.transp;
  const linha = (v, i) => {
    const pct = v.pct.toFixed(1).replace('.', ',');
    return `
    <div class="cob-rank-row ${i === 0 ? 'top1' : ''} ${sel === v.nome ? 'active' : ''}"
         data-transp="${esc(v.nome).replace(/"/g,'&quot;')}" style="--w:${(v.atraso/max*100).toFixed(0)}%;"
         title="Clique para filtrar toda a aplicação por esta transportadora · duplo clique remove o filtro">
      <span class="cr-bar"></span>
      <span class="cob-rank-pos">${i+1}</span>
      <span class="cob-rank-name">${esc(v.nome)}<br><span class="cob-rank-sub">${pct}% dos ${v.total} pedidos</span></span>
      <span class="cob-rank-count">${v.atraso} atraso${v.atraso > 1 ? 's' : ''}</span>
    </div>`;
  };

  const { top, resto } = splitCarrierRanking(ranking, RANKING_TOP_N);
  const htmlTop = `<div class="cob-rank-top">${top.map(linha).join('')}</div>`;

  /* Com cinco transportadoras ou menos, a seção "Demais transportadoras" e a
     área de rolagem simplesmente não são renderizadas (sem contador zerado). */
  const htmlResto = resto.length ? `
    <div class="cob-rank-divider">Demais transportadoras (${resto.length})</div>
    <div class="cob-rank-more">${resto.map((v, i) => linha(v, i + RANKING_TOP_N)).join('')}</div>` : '';

  el.innerHTML = htmlTop + htmlResto;
}

/* ---- Tabela detalhada: pesquisa, ordenação e paginação ---- */

function cobSortValue(r, key){
  if(key === '_statusJanela'){
    /* Alteração 22 — ordenação por criticidade operacional. */
    const ordem = { fin_atraso: 6, atraso: 5, iniciado: 4, dentro: 3, fin_antes: 2, fin_prazo: 1 };
    return ordem[cobStatusJanela(r)] || 0;
  }
  if(key === '_desvioJanela') return statusJanela(r).desvioMin;
  if(key === '_statusNc') return r.nao_conforme == null ? 0 : (r.nao_conforme ? 2 : 1);
  if(key === 'tem_ge' || key === 'tem_nf') return r[key] ? 1 : 0;
  if(key === 'planta') return normCampo(r.planta).toLowerCase();  // Alteração 1 — ordena pelo valor exibido
  const v = r[key];
  if(v == null) return null;
  return typeof v === 'string' ? v.toLowerCase() : v;
}

function cobTableRows(){
  let rows = cobFilteredData();
  const q = cobState.tableSearch.toLowerCase();
  if(q){
    rows = rows.filter(r =>
      String(r.pedido ?? '').includes(q) ||
      (r.transportador || '').toLowerCase().includes(q) ||
      normCampo(r.planta).toLowerCase().includes(q) ||   // Alteração 1 — coluna Planta
      (r.fornecedor || '').toLowerCase().includes(q) ||
      (r.modal || '').toLowerCase().includes(q) ||
      (r.aglutinador || '').toLowerCase().includes(q)
    );
  }
  const { sortKey, sortDir } = cobState;
  const dir = sortDir === 'asc' ? 1 : -1;
  return rows.slice().sort((a,b) => {
    const va = cobSortValue(a, sortKey), vb = cobSortValue(b, sortKey);
    if(va == null && vb == null) return 0;
    if(va == null) return 1;               // nulos sempre ao final
    if(vb == null) return -1;
    return va < vb ? -dir : (va > vb ? dir : 0);
  });
}

function buildCobTable(){
  const rows = cobTableRows();
  const totalPages = Math.max(1, Math.ceil(rows.length / cobState.pageSize));
  if(cobState.page > totalPages) cobState.page = totalPages;
  const start = (cobState.page - 1) * cobState.pageSize;
  const pageRows = rows.slice(start, start + cobState.pageSize);

  const tbody = document.querySelector('#cobTable tbody');
  if(!pageRows.length){
    tbody.innerHTML = '<tr><td colspan="15" class="search-noresult">Nenhum pedido encontrado com os filtros atuais.</td></tr>';
  } else {
    tbody.innerHTML = pageRows.map(r => {
      /* Alteração 24 — a etiqueta de status vem da MESMA classificação usada
         nos cards, nos gráficos, no ranking e nas exportações. */
      const sj = statusJanela(r);
      const def = PEDIDO_STATUS_DEFS[sj.code || 'sem'];
      let extra = '', tip = def.label;
      if(sj.code === 'atraso'){
        if(sj.desvioMin != null && sj.desvioMin > 0) extra = ' · ' + fmtHoras(sj.desvioMin);
        tip = 'Sem Chegada Origem registrada — prazo (janela + 30 min) já vencido; baseado no horário atual de Brasília';
      } else if(sj.code === 'dentro'){
        tip = 'Sem Chegada Origem registrada — ainda dentro do prazo (janela + 30 min); baseado no horário atual de Brasília';
      } else if(sj.code === 'iniciado'){
        tip = 'Chegada Origem registrada e Saída Origem pendente';
      } else if(sj.code === 'fin_prazo'){
        tip = 'Finalizado Dentro do Prazo — chegada entre janela − 30 min e janela + 30 min';
      } else if(sj.code === 'fin_atraso'){
        tip = 'Finalizado com Atraso — chegada após janela + 30 min';
        if(sj.desvioMin != null && sj.desvioMin > 0) extra = ' · ' + fmtHoras(sj.desvioMin);
      } else if(sj.code === 'fin_antes'){
        tip = 'Finalizado Antecipado — chegada anterior a janela − 30 min';
      }
      const statusHtml = '<span class="cob-badge ' + def.badge + '" title="' + esc(tip) + '">' +
        def.ico + ' ' + esc(def.curto) + extra + (sj.semChegada && sj.code ? ' ⏱' : '') + '</span>';
      return `
      <tr>
        <td>${esc(r.pedido ?? '')}</td>
        <td>${esc(r.aglutinador || '—')}</td>
        <td>${esc(normCampo(r.transportador))}</td>
        <td>${esc(normCampo(r.planta))}</td>
        <td>${esc(r.fornecedor || '—')}</td>
        <td>${esc(normCampo(r.modal))}</td>
        <td>${esc(r.janela ?? '—')}</td>
        <td>${esc(r.chegada_origem ?? '—')}</td>
        <td>${esc(r.saida_origem ?? '—')}</td>
        <td>${statusHtml}</td>
        <td>${fmtPermanencia(r.permanencia_min)}</td>
        <td>${desvioCellHtml(r)}</td>
        <td>${r.tem_ge ? '<span class="cob-badge ok">SIM</span>' : '<span class="cob-badge bad">NÃO</span>'}</td>
        <td>${r.tem_nf ? '<span class="cob-badge ok">SIM' + (r.qtde_nf ? ' (' + r.qtde_nf + ')' : '') + '</span>' : '<span class="cob-badge bad">NÃO</span>'}</td>
        <td>${ncCellHtml(r)}</td>
      </tr>`;
    }).join('');
  }

  document.getElementById('cobPageInfo').textContent = cobState.page + ' / ' + totalPages;
  document.getElementById('cobPrevPage').disabled = cobState.page <= 1;
  document.getElementById('cobNextPage').disabled = cobState.page >= totalPages;
  document.getElementById('cobTableFoot').textContent =
    rows.length + ' pedido' + (rows.length === 1 ? '' : 's') + ' com os filtros atuais · exibindo ' +
    (rows.length ? (start + 1) + '–' + Math.min(start + cobState.pageSize, rows.length) : '0') +
    ' · ordenado por "' + cobState.sortKey.replace('_statusJanela','Status').replace('_desvioJanela','Desvio da janela').replace('_statusNc','Status Não Conforme').replace('_iso','') + '" (' + (cobState.sortDir === 'asc' ? 'crescente' : 'decrescente') + ')';

  document.querySelectorAll('#cobTable th').forEach(th => {
    th.classList.remove('sorted-asc','sorted-desc');
    if(th.getAttribute('data-sort') === cobState.sortKey){
      th.classList.add(cobState.sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
  });
}

/* ==========================================================================
   Etapa 3 · Alteração 6 — EXPORTAÇÃO EXCEL FORMATADA
   --------------------------------------------------------------------------
   O arquivo gerado sai com formatação de tabela real: cabeçalho estilizado,
   bordas, linhas zebradas, autofiltro, largura automática das colunas e a
   PRIMEIRA LINHA CONGELADA. Os estilos exigem a build "xlsx-js-style"
   (carregada no index.html); se apenas o SheetJS padrão estiver disponível,
   o arquivo continua sendo gerado com autofiltro e congelamento.
   O congelamento não é suportado pelo SheetJS Community: por isso o .xlsx
   (um ZIP com entradas sem compressão) é pós-processado em memória, injetando
   o elemento <pane> na planilha e recalculando tamanhos/CRC do ZIP.
   ========================================================================== */

const _CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for(let n = 0; n < 256; n++){
    let c = n;
    for(let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function _crc32(bytes){
  let c = 0xFFFFFFFF;
  for(let i = 0; i < bytes.length; i++) c = _CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/* Injeta o congelamento da primeira linha no .xlsx gerado (entradas STORED).
   Qualquer inconsistência estrutural devolve o buffer original intacto. */
function congelarPrimeiraLinha(b){
  try{
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    let eocd = -1;
    for(let i = b.length - 22; i >= 0; i--){
      if(dv.getUint32(i, true) === 0x06054b50){ eocd = i; break; }
    }
    if(eocd < 0) return b;
    const cdCount = dv.getUint16(eocd + 10, true);
    const cdOffset = dv.getUint32(eocd + 16, true);
    let p = cdOffset, alvoEntry = null;
    const entradas = [];
    for(let i = 0; i < cdCount; i++){
      if(dv.getUint32(p, true) !== 0x02014b50) return b;
      const nameLen = dv.getUint16(p + 28, true);
      const extraLen = dv.getUint16(p + 30, true);
      const cmtLen = dv.getUint16(p + 32, true);
      const nome = new TextDecoder().decode(b.subarray(p + 46, p + 46 + nameLen));
      const e = { cdPos: p, nome, method: dv.getUint16(p + 10, true) };
      entradas.push(e);
      if(/^xl\/worksheets\/sheet\d+\.xml$/.test(nome)) alvoEntry = e;
      p += 46 + nameLen + extraLen + cmtLen;
    }
    if(!alvoEntry || alvoEntry.method !== 0) return b;   // somente entradas sem compressão
    const lh = dv.getUint32(alvoEntry.cdPos + 42, true);
    if(dv.getUint32(lh, true) !== 0x04034b50) return b;
    const dataStart = lh + 30 + dv.getUint16(lh + 26, true) + dv.getUint16(lh + 28, true);
    const dataLen = dv.getUint32(lh + 18, true);
    const enc = new TextEncoder();
    const padrao = enc.encode('<sheetView workbookViewId="0"/>');
    const trocado = enc.encode('<sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView>');
    let hit = -1;
    busca: for(let i = dataStart; i <= dataStart + dataLen - padrao.length; i++){
      for(let j = 0; j < padrao.length; j++) if(b[i + j] !== padrao[j]) continue busca;
      hit = i; break;
    }
    if(hit < 0) return b;
    const delta = trocado.length - padrao.length;
    const out = new Uint8Array(b.length + delta);
    out.set(b.subarray(0, hit), 0);
    out.set(trocado, hit);
    out.set(b.subarray(hit + padrao.length), hit + trocado.length);
    const odv = new DataView(out.buffer);
    const novoLen = dataLen + delta;
    const novoCrc = _crc32(out.subarray(dataStart, dataStart + novoLen));
    odv.setUint32(lh + 14, novoCrc, true);
    odv.setUint32(lh + 18, novoLen, true);
    odv.setUint32(lh + 22, novoLen, true);
    const desloc = pos => pos > hit ? pos + delta : pos;
    entradas.forEach(e => {
      const cp = desloc(e.cdPos);
      if(e.nome === alvoEntry.nome){
        odv.setUint32(cp + 16, novoCrc, true);
        odv.setUint32(cp + 20, novoLen, true);
        odv.setUint32(cp + 24, novoLen, true);
      }
      const lo = odv.getUint32(cp + 42, true);
      if(lo > hit) odv.setUint32(cp + 42, lo + delta, true);
    });
    const nEocd = desloc(eocd);
    if(cdOffset > hit) odv.setUint32(nEocd + 16, cdOffset + delta, true);
    return out;
  }catch(e){
    return b;
  }
}

function baixarArquivoXlsx(bytes, nome){
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* ---- Relatório de Cobranças (.xlsx) — respeita todos os filtros ativos ---- */

function exportRelatorioCobrancas(){
  if(!window.XLSX){ showTbStatus('Biblioteca de Excel indisponível (verifique o acesso à rede/CDN).', false); return; }
  const rows = cobTableRows();  // mesma ordenação e filtros exibidos na tela
  if(!rows.length){ showTbStatus('Nenhum pedido para exportar com os filtros atuais do painel Cobranças.', false); return; }

  const data = rows.map(r => {
    const sj = statusJanela(r);
    return {
      'Pedido': r.pedido,
      'Aglutinador': r.aglutinador || '',
      'Transportadora': normCampo(r.transportador),
      'Planta': normCampo(r.planta),          // Alteração 1 — mesma posição da tabela
      'Fornecedor': r.fornecedor || '',
      'Modal (Tipo)': normCampo(r.modal),
      'Janela': r.janela || '',
      'Chegada Origem': r.chegada_origem || '',
      'Saída Origem': r.saida_origem || '',
      'Status': sj.label + (sj.semChegada && sj.code ? ' (baseado no horário atual)' : ''),
      'Atraso (h)': sj.atrasoOperacional && sj.desvioMin != null ? Math.round(sj.desvioMin/60*10)/10 : '',
      'Permanência': fmtPermanencia(r.permanencia_min),
      'Desvio da Janela': fmtDesvio(sj.desvioMin),
      'GE': r.tem_ge ? 'SIM' : 'NÃO',
      'NF': r.tem_nf ? 'SIM' : 'NÃO',
      'Qtde NF': r.qtde_nf || 0,
      'Status Não Conforme': ncTexto(r),
      'Motivo Não Conformidade': r.motivo_nc || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const headerKeys = Object.keys(data[0]);

  // Ajuste automático das colunas (limite superior para não estourar a tela)
  ws['!cols'] = headerKeys.map(k => ({
    wch: Math.min(42, Math.max(k.length, ...data.map(d => String(d[k] ?? '').length)) + 2),
  }));
  ws['!rows'] = [{ hpt: 26 }];   // cabeçalho um pouco mais alto

  // Autofiltro cobrindo toda a tabela
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: {r:0, c:0}, e: {r: data.length, c: headerKeys.length - 1} }) };

  // Formatação de tabela: cabeçalho escuro, bordas finas e linhas zebradas
  const BORDA = { style: 'thin', color: { rgb: 'C9D4D2' } };
  const BORDAS = { top: BORDA, bottom: BORDA, left: BORDA, right: BORDA };
  const estiloHeader = {
    font: { bold: true, sz: 11, name: 'Segoe UI', color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: '1E2F33' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: BORDAS,
  };
  const estiloLinha = {
    font: { sz: 10.5, name: 'Segoe UI', color: { rgb: '1C2B2E' } },
    alignment: { vertical: 'center' },
    border: BORDAS,
  };
  const estiloZebra = Object.assign({}, estiloLinha, { fill: { patternType: 'solid', fgColor: { rgb: 'EFF6F4' } } });
  for(let c = 0; c < headerKeys.length; c++){
    const hRef = XLSX.utils.encode_cell({ r: 0, c });
    if(ws[hRef]) ws[hRef].s = estiloHeader;
    for(let r = 1; r <= data.length; r++){
      const ref = XLSX.utils.encode_cell({ r, c });
      if(ws[ref]) ws[ref].s = (r % 2 === 0) ? estiloZebra : estiloLinha;
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cobranças');
  const pad = n => String(n).padStart(2,'0');
  const now = new Date();
  const stamp = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate()) + '_' + pad(now.getHours()) + pad(now.getMinutes());
  try{
    // Gera sem compressão para permitir a injeção do congelamento da 1ª linha
    const bytes = new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx', compression: false }));
    baixarArquivoXlsx(congelarPrimeiraLinha(bytes), 'Relatorio_Cobrancas_' + stamp + '.xlsx');
  }catch(e){
    XLSX.writeFile(wb, 'Relatorio_Cobrancas_' + stamp + '.xlsx');   // rota de segurança
  }
  showTbStatus('Relatório de Cobranças gerado com ' + rows.length + ' pedido(s) — tabela formatada, autofiltro e primeira linha congelada.', true);
}

/* ---- Montagem única do painel ---- */

function setupCobrancas(){
  msTransp = createMultiSelect('msTransp', 'Todas', { onChange: cobFiltersChanged });
  msData   = createMultiSelect('msData',   'Todas', { onChange: cobFiltersChanged, range: true });
  msModal  = createMultiSelect('msModal',  'Todos', { onChange: cobFiltersChanged });
  populateCobMultiSelects();

  setupCobAutocomplete({
    wrapId: 'cobPedidoWrap', inputId: 'cobPedidoSearch', clearId: 'cobPedidoClear', listId: 'cobPedidoList',
    setValue: v => { cobState.pedido = v.replace(/\s+/g,''); },
    suggestions: q => [...new Set(RAW.map(r => String(r.pedido)))].filter(p => p.includes(q.replace(/\s+/g,''))).sort(),
  });
  setupCobAutocomplete({
    wrapId: 'cobFornWrap', inputId: 'cobFornSearch', clearId: 'cobFornClear', listId: 'cobFornList',
    setValue: v => { cobState.fornecedor = v; },
    suggestions: q => [...new Set(RAW.map(r => r.fornecedor).filter(Boolean))].filter(f => f.toLowerCase().includes(q.toLowerCase())).sort(),
  });

  document.getElementById('cobClearAll').addEventListener('click', () => { resetCobFilters(); buildCobrancas(); });
  document.getElementById('cobReportBtn').addEventListener('click', exportRelatorioCobrancas);

  // Tabela: pesquisa, ordenação e paginação
  let tableDebounce = null;
  document.getElementById('cobTableSearch').addEventListener('input', e => {
    clearTimeout(tableDebounce);
    tableDebounce = setTimeout(() => {
      cobState.tableSearch = e.target.value.trim();
      cobState.page = 1;
      buildCobTable();
    }, 160);
  });
  document.querySelectorAll('#cobTable th').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-sort');
      if(cobState.sortKey === key) cobState.sortDir = cobState.sortDir === 'asc' ? 'desc' : 'asc';
      else { cobState.sortKey = key; cobState.sortDir = 'asc'; }
      buildCobTable();
    });
  });
  document.getElementById('cobPrevPage').addEventListener('click', () => { if(cobState.page > 1){ cobState.page--; buildCobTable(); } });
  document.getElementById('cobNextPage').addEventListener('click', () => { cobState.page++; buildCobTable(); });

  /* Etapa 3 · Alterações 4 e 5 — duplo clique remove os filtros aplicados por
     clique; no ranking, o clique simples alterna o filtro de transportadora. */
  const statusCanvas = document.getElementById('cobChartStatus');
  if(statusCanvas) statusCanvas.addEventListener('dblclick', limparChartStatus);
  const perfCanvas = document.getElementById('cobChartPerf');
  if(perfCanvas) perfCanvas.addEventListener('dblclick', limparChartTransp);
  const rankEl = document.getElementById('cobRanking');
  /* Clique simples com pequeno atraso (mesmo padrão da lista de aglutinadores):
     evita conflito com o duplo clique, já que a lista é re-renderizada a cada
     filtro e o navegador exige o mesmo elemento nos dois cliques do dblclick. */
  let rankClickTimer = null;
  rankEl.addEventListener('click', e => {
    const row = e.target.closest('.cob-rank-row');
    if(!row || e.detail > 1) return;            // deixa o dblclick tratar
    const t = row.getAttribute('data-transp');
    clearTimeout(rankClickTimer);
    rankClickTimer = setTimeout(() => toggleChartTransp(t), 220);
  });
  rankEl.addEventListener('dblclick', () => {
    clearTimeout(rankClickTimer);
    limparChartTransp();
  });

  // Reconstrói os gráficos ao alternar o tema (cores dos eixos/legendas)
  new MutationObserver(() => buildCobCharts(cobFilteredData()))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

function buildCobrancas(){
  const rows = cobFilteredData();
  buildKpis();         // Alteração 3 (Etapa 3) — KPIs do topo 100% sincronizados
  renderChartChips();  // Alteração 5 — chips de seleção ativa (independe do Chart.js)
  buildCobKpis(rows);
  buildCobStrip(rows);
  buildCobCharts(rows);
  buildCobRanking(rows);
  buildCobTable();
}

function refreshAll(){
  recalcularAgora();   // Alteração 8 — status dos pedidos sem chegada usa o "agora" de Brasília
  buildEvolucao();     // Alteração 06 — Evolução dos Pedidos (rota por fornecedor)
  buildDetailTable();
  buildMap();
  buildCobrancas();
  renderAglList();
}

/* ==========================================================================
   NAVEGAÇÃO ENTRE AS ABAS (Etapa 3 · Alteração 2)
   --------------------------------------------------------------------------
   Após a remoção de "3 · Medidor de tempo" e "4 · Ranking por transportadora",
   apenas t1 e t2 são abas válidas. Qualquer referência a uma aba inexistente
   (hash na URL, atalho antigo, estado persistido) é redirecionada para a
   primeira aba válida — não há links quebrados nem abertura automática de uma
   aba removida. */
const ABAS_VALIDAS = ['t1', 't2'];

function ativarAba(id){
  if(ABAS_VALIDAS.indexOf(id) < 0) id = ABAS_VALIDAS[0];
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === id));
  if(id === 't1' && map) setTimeout(() => map.invalidateSize(), 50);
  return id;
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => ativarAba(tab.dataset.tab));
});

/* Estado inicial: respeita o hash quando ele apontar para uma aba válida. */
ativarAba((location.hash || '').replace('#', ''));

/* ══════════════════════════════════════════════════════════════════════════
   ETAPA 4 — INICIALIZAÇÃO CONDICIONADA À AUTENTICAÇÃO (Seções 3, 4 e 12)
   ──────────────────────────────────────────────────────────────────────────
   Nada abaixo executa no carregamento da página: a montagem completa do
   dashboard (restauração da base salva, filtros, KPIs, mapa, gráficos e a
   seleção inicial de aglutinador) só acontece quando o auth-client emite
   tc-auth-ok — isto é, depois de a CAMADA CONFIÁVEL validar a sessão. Antes
   disso o usuário não visualiza conteúdo algum do painel, e os dados
   operacionais não são materializados na interface. Idempotente: refresh
   com sessão válida repete o fluxo normalmente; segundo evento é ignorado.
   ══════════════════════════════════════════════════════════════════════════ */
let _tcInicializado = false;
function inicializarTorreDeControle(){
  if(_tcInicializado) return;
  _tcInicializado = true;

restaurarUploadSalvo();   // Alteração 7 — carrega o último upload válido, se existir
setupGlobalFilters();
setupAglList();
setupUpload();
setupDownload();
setupCobrancas();

/* Alteração 8.3 — atualização automática a cada minuto: recalcula somente os
   componentes afetados pela regra do horário atual (cards, tabelas, gráficos
   e rankings da aba Cobranças), sem recarregar a página nem reconstruir o
   mapa/árvore (operações pesadas que não dependem do relógio). */
setInterval(() => {
  recalcularAgora();
  buildDetailTable();
  buildCobrancas();   // Alteração 3 — buildCobrancas() atualiza também os KPIs do topo
}, 60000);


// abre já com um aglutinador relevante: o primeiro (em ordem alfabética) com pedidos em atraso
const aglComAtraso = [...new Set(RAW.filter(r=>r.atraso_chegada_min!=null && r.atraso_chegada_min>0).map(r=>r.aglutinador))].sort()[0];
if(aglComAtraso){
  currentAgl = aglComAtraso;
}
atualizarStatusBaseAdmin(null);   // estado inicial da faixa administrativa
refreshAll();
}

/* Disparo único, autorizado pela camada de autenticação (auth-client.js). */
document.addEventListener('tc-auth-ok', inicializarTorreDeControle);