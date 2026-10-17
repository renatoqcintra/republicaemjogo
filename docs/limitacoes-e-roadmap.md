# Limitações conhecidas e roadmap priorizado

Documento honesto do que **não** está pronto, qual o impacto disso na experiência e qual a ordem
em que vale resolver. Serve também como base para o plano de validação comercial
([`validacao-comercial.md`](validacao-comercial.md)).

---

## 1. Limitações conhecidas

### Conteúdo e narrativa

| # | Limitação | Impacto |
| --- | --- | --- |
| L1 | **Arte provisória.** Retratos dos 16 personagens e o mapa são SVG gerados proceduralmente a partir de parâmetros (`PortraitSpec`, polígonos das regiões). | O jogo parece um protótipo polido, não um produto final. Menor impacto emocional nas cenas de diálogo. |
| L2 | **Sem áudio de trilha.** Só há efeitos sintetizados via Web Audio (cliques, avisos, fim). Sem música ambiente nem vozes. | Pouca presença "cinematográfica" apesar da direção de arte escura. |
| L3 | **Volume de conteúdo.** 5 missões, 46 eventos, 10 ações, 8 finais. Uma campanha leva ~45–60 min. | Replay limitado: após 3–4 campanhas o jogador já viu a maior parte dos eventos. |
| L4 | **Ramificação por bandeirolas (flags), não por atos alternativos.** Escolhas alteram atributos, desfecho judicial e finais, mas não mudam a estrutura dos capítulos. | A sensação de "consequência grande" é forte dentro da campanha, fraca entre campanhas. |
| L5 | **Só pt-BR.** Rótulos centrais estão no núcleo (`ATTR_LABELS`, `DIFFICULTY`), mas a maior parte das strings está embutida nos dados e telas. | Sem mercado em outros idiomas sem refatoração de conteúdo. |

### Técnicas

| # | Limitação | Impacto |
| --- | --- | --- |
| L6 | **Um único slot de save, apenas local** (`localStorage`). Sem exportar/importar arquivo, sem nuvem. O texto de Configurações menciona exportação manual, mas **a UI de export/import ainda não existe**. | Perda de save ao limpar dados do navegador; impossível continuar em outro dispositivo. **Essa é a lacuna mais séria hoje.** |
| L7 | **Sem testes E2E de navegador automatizados.** A passagem de ponta a ponta foi manual (documentada em [`recursos-testados.md`](recursos-testados.md)); os testes de UI rodam em jsdom. | Risco de regressão em renderização real (CSS, overlays, eventos do navegador). |
| L8 | **Sem verificação automatizada de acessibilidade** (axe) nem teste de zoom 200%/leitor de tela. | Acessibilidade foi implementada com boas práticas, mas não auditada por ferramenta. |
| L9 | **Sem PWA/manifest/service worker.** | Não instala na área de trabalho nem funciona offline no navegador. |
| L10 | **Sem favicon nem imagem social (OG).** | Parece incompleto ao compartilhar/instalar; exigência básica de publicação. |
| L11 | **Desktop não empacotado.** O caminho para Tauri está preparado (build com `base: './'`, storage isolado, zero dependência de rede) mas o CLI e o empacotamento ainda não foram adicionados (ver [`desktop-tauri.md`](desktop-tauri.md)). | Sem build de Windows instalável hoje. |
| L12 | **Testes de tela estreita apenas em ~1050 px.** Não validado em tablets/touch reais nem com texto ampliado. | Risco de layout em celulares largos/rotacionados. |
| L13 | **Sem telemetria.** Nada de métricas de uso além do progresso local (finais/conquistas/campanhas). | Decisões de balanceamento sem dados reais. |

### Regras e balanceamento

- A dificuldade afeta custo, frequência de eventos e tolerância da imprensa, mas o **bônus do
  adversário na apuração é fixo por nível** e ainda não foi calibrado com dados de jogos reais.
- O **debate final** é resolvido dentro da M5; a tela "Debate" serve de preparação, não existe
  modo de debate independente.
- Empate nacional gera "impasse e apuração complementar" — comportamento intencional, porém raro
  e pouco explicado ao jogador antes de apurar.
- O **desfecho judicial** (`src/game/rules/judgement.ts`) é resolvido por regras ordenadas sobre
  postura, linha de defesa, posição sobre os documentos, confiança institucional e relação com o
  relator — os **limiares (42/47/52 e relação ≥ −60 sobre a base −65) foram dimensionados
  analiticamente**, não por playtest. Vale
  calibrar com sessões reais para que nenhuma combinação vire "estratégia dominante".
- A **trava de clique duplo** na tela de missão é temporal (400 ms) e só engata quando o destino
  do clique é outro nó de decisão. Um jogador humano jamais percebe; um autômato de teste precisa
  esperar a liberação entre duas decisões encadeadas.
- **Eventos de arco são garantidos** (`guaranteed`): as aberturas e consequências condicionais
  dos arcos (Dante, *Black Stallion*/*O Homem da República* e a matéria de capa, Caetano, Tiago,
  Walker, Valdemar) entram na fila no primeiro dia elegível — nenhuma campanha perde um arco
  inteiro por azar (antes, o sorteio olhava só os 3 maiores de 38 e `dante_proposta` disparava em
  ~23% das partidas). Nem todos os 46 eventos aparecem em toda campanha: eventos ordinários e o
  `andre_tribunal` (prioridade 85, taxa ≥ 96% em simulação) seguem no sorteio — variedade por
  design, com as consequências condicionais (`dante_conflito` exige o caminho opaco;
  `bastidores_publicados` exige ter autorizado a apuração de William) protegidas por garantia.
- **O sorteio ordinário roda uma vez por clique de avanço**: `advanceDays(N)` chama
  `rollDailyEvents` uma única vez — "Avançar 3 dias" = 1 sorteio, não 3. Comportamento original
  do jogo; eventos de arco garantidos não são afetados (enfileiram em qualquer chamada, sem
  sorteio). Quem avança de 1 em 1 dia vê bem mais eventos ordinários que quem usa o avanço de 3 —
  se isso incomodar em playtest, fazer o roll por dia avançado é mudança pequena (afeta a
  frequência efetiva por dificuldade).
- A opção **`clareza`** da M3 (esclarecimentos formais com André Monteiro) aparece apenas com
  relação ≥ −55 a ele — a base foi rebalanceada para −65 (tensão institucional inicial), então só
  o caminho cuidoso (jurídica + linha de defesa documental + postura cautelosa) a libera. Nos
  caminhos politizados o nó `protocolo` fica com 2 alternativas. Escolhas condicionais de eventos
  (`acordo` com Walker, `dante_negocia`, `escrita` no tribunal) seguem a mesma lógica e sempre há
  ao menos uma alternativa livre.

---

## 2. Roadmap priorizado

Esforço: **S** (< 1 dia) · **M** (1–3 dias) · **L** (1 semana+).

### P0 — antes de mostrar para qualquer jogador externo

| # | Item | Esforço | Por quê |
| --- | --- | :---: | --- |
| 1 | **Exportar/importar save** (download `.json` + upload com validação) em Configurações | S | Cobre a promessa já escrita na UI e elimina a perda total de progresso (L6). |
| 2 | **Favicon + imagem social (OG)** | S | Preço de entrada para compartilhar e publicar (L10). |
| 3 | **Teste E2E do caminho crítico** (menu → missão → apuração → final) com Playwright no build | M | Protege o funil inteiro, que hoje só foi validado manualmente (L7). |
| 4 | **Auditoria axe-core + teste de zoom 200% + navegação por leitor de tela** | S | Acessibilidade é requisito de produto, não enfeite (L8). |
| 5 | **Correção/ajuda contextual na 1ª missão** (uma dica por tela sobre verba/dia/regionais) | S | Reduz abandono na primeira sessão. |

### P1 — primeira versão pública (demo/itch.io)

| # | Item | Esforço | Por quê |
| --- | --- | :---: | --- |
| 6 | **Arte final dos personagens** (mesma grade de `PortraitSpec` já aceita ilustração substituível) | L | Maior salto de percepção de qualidade (L1). |
| 7 | **PWA**: manifest, ícones, service worker para carregar offline | M | Instalação e custo zero de distribuição (L9). |
| 8 | **Trilha sonora opcional** + mais SFX, com respeito ao mute | M | Sustenta tom cinematográfico (L2). |
| 9 | **Mais conteúdo**: +6 eventos, +1 missão bônus (consequências regionais), +2 finais | M | Replayabilidade mínima competitiva (L3). |
| 10 | **Relatório pós-jogo**: gráfico da campanha (atributos por dia), mapa final, árvore de decisões | M | Converte cada final em "a próxima será melhor" — o motor de recompra do gênero. |
| 11 | **Testes em dispositivos reais** (celular, tablet, 200% de zoom) | S | Fecha L12. |

### P2 — após validação (ver [`validacao-comercial.md`](validacao-comercial.md))

| # | Item | Esforço | Por quê |
| --- | --- | :---: | --- |
| 12 | **Empacotar desktop com Tauri** (Windows/macOS/Linux) | M | Ticket maior, canal itch.io/Steam ([`desktop-tauri.md`](desktop-tauri.md)). |
| 13 | **i18n (EN/ES)** com strings extraídas para chaves | L | Abre mercado fora do Brasil. |
| 14 | **Multiplas campanhas/slots** e sincronização opcional | M | Resolve L6 por completo. |
| 15 | **Editor/validador de conteúdo** (JSON + schema) para missões/eventos | M | Permite DLC e mods sem tocar em código. |
| 16 | **Telemetria local opcional** (com consentimento explícito) para balancear dificuldade | M | Fecha L13 sem coletar dado pessoal. |
