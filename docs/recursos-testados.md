# Recursos testados

Este documento lista o que já está **verificado**, separando três níveis de evidência:

1. **Teste automatizado** — roda em `npm test` (Vitest + jsdom + Testing Library).
2. **Verificação manual em navegador** — passagem completa jogada no build de produção (`npm run build` + `npm run preview`).
3. **Verificação de build** — `npm run typecheck` e `npm run build` limpos.

**Situação atual**: `npm run typecheck` ✓ · `npm test` ✓ **182 testes em 13 arquivos** · `npm run build` ✓ (bundle ~489 kB JS + ~14 kB CSS).

---

## 1. Suíte automatizada (182 testes)

| Arquivo | Testes | Cobre |
| --- | ---: | --- |
| `src/game/__tests__/attributes.test.ts` | 8 | Deltas de atributos, clamps 0–100, verba nunca negativa, log com rótulo pt-BR e fonte, imutabilidade do estado, não duplicação de conquistas, valores iniciais por dificuldade |
| `src/game/__tests__/cast.test.ts` | 26 | Elenco de 16 personagens com ids estáveis e relações iniciais completas, renomeação dos seis personagens sem sobras dos nomes antigos **nem nomes de pessoas reais** (lista de proibidos), **nome de André Monteiro sem o cargo no nome** (papel mantido no `role`), partidos/cargos consistentes (governo FPT, PRN, PPV, sem filiação automática para Walker/Dante/Tiago), tabela de balanceamento das relações iniciais (incl. Felipe Azevedo em −40), campo estático de `alignment` por personagem, separação relação ≠ alinhamento, consistência `EVENT_IDS`/`EVENTS`/`EVENT_MAP` (**46 eventos**), **identidade do MNR** (papel de Rafael = fundador do Movimento Nacional de Renovação, filiação independente sem `PRN`/`Partido`), condições legíveis dos eventos novos (nunca no dia 1), arco de André Monteiro na M3 (nó `relator`, opção `clareza` condicionada a relação ≥ −55, sem promessa de resultado judicial), **consequências de relação** (escolhas condicionais de `black_stallion`/`andre_tribunal`/`crise_diplomatica` ligadas a relações construídas, sempre ≥1 escolha livre por evento), integração do evento `bastidores_publicados`, **retratos dos 16 personagens** (parâmetros rosto/idade/vestuário em faixa válida, variedade real sem cópias, silhuetas femininas `long`/`bun` só em personagem feminina, **guia visual: André único careca com óculos escuros, barba+bigode grisalhos cheios e sorriso de Lacerda, penteado loiro-dourado volumoso e gravata vermelha de Walker, cabelo abundante penteado para trás e sorriso de Sílvio, bigode de Valdemar, brincos de Daniela, óculos apenas em Felipe/André**, sem boné/auscência decorativa) e **migração de relações legadas** (valores padrão antigos exatos como Felipe +40 são rebalanceados com aviso; valores que o jogador moveu ficam preservados; nova campanha já nasce rebalanceada), **correções de retrato pedidas pelo jogador** (Felipe Azevedo, Caetano Góis e Tiago Farias sem barba; pele de William Nogueira um tom mais escura que o tom antigo **e** que a média do cast) |
| `src/game/__tests__/missionEngine.test.ts` | 12 | Avanço de nós, escolhas com custo/recusa por requisito, cadeia completa M1→M2→M3→M4→M5 (com desfecho judicial **atrasado** resolvido ao fim da M4), conclusão e falha, objetivos, desbloqueio de M5 (última semana **e** M4) |
| `src/game/__tests__/missionDecisions.test.ts` | 24 | 2–5 alternativas visíveis em todo nó de escolha da jornada, dilema central da M3 com 4 posturas, `hint`/`summary` obrigatórios em toda alternativa de dilema, efeito atrasado do desfecho judicial (determinístico, idempotente, nunca sobrescreve), agregação de decisões (negar documentos, postura política, requerimento protocolado), conjuntos de decisões gerando finais diferentes, recusa de reexecução de escolha/missão/condição/verba, conexões M2→M3, M4 interno, M3→M5 e desfecho→M5, round-trip de save com as flags novas |
| `src/game/__tests__/mnr.test.ts` | 13 | **Rafael Sampaio e o MNR (Rodada 9)**: ficha de líder do movimento (papel, filiação independente, biografia com núcleos/militantes/agenda própria, sem sobras de "influenciador/streamer"), MNR ≠ PRN, estado inicial sem flags do MNR (posição padrão "independente — sem apoio a nenhum candidato"), rótulos distintos para diálogo/acordo programático/apoio público/aliança/distanciamento, **regra de ouro** (só `mnr_definicao` declara `apoio`/`alianca`, com portão de acordo + relação ≥ 45 + movimentos ≥ 55 e aliança adicional ≥ 70/65), conversa/acordo nunca viram apoio, recusa afasta sem acusação, estrutura crescendo em qualquer caminho da abertura, portões de cada consequência (protagonismo/regional/bases/definição/contrato/autonomia), saídas sempre visíveis (≥ 2 livres por evento), não duplicação, texts reenquadrados (MNR em `rafael_mobiliza`, `bastidores_publicados` e fala da M4) e **simulação de 25 campanhas** em que o arco completo do MNR dispara em todas |
| `src/game/__tests__/narrativeExpansion.test.ts` | 37 | **Expansão narrativa (Rodada 7)**: elegibilidade e encadeamento dos novos arcos (pacote→debate→crise econômico de Felipe Azevedo com portas de resgate por dia; consequências atrasadas exclusivas por caminho de Dante `transparente`/`recusado`/`opaco`; Caetano só cobra agenda se apoiou; Tiago só sobe se pegou a rede; Valdemar só cobra a pasta prometida; Walker só cobra contrapartida acordada; crise de equipe exige lealdade ≤ 45), abertura de todo arco em partida normal (sem combinação obscura), escolhas de um mesmo evento produzindo estados opostos (mercado/região/relação com o ministro), deduplicação de evento novo (fila/fired/recusa de reexposição), custo e requisito recusados corretamente, **presença dos 15 personagens** (cada um ≥ 2 aparições em missões+eventos; Fábio é o jogador), peso real dos quatro arcos pedidos (Felipe/Caetano/Tiago ≥ 3 eventos, Dante ≥ 4, André sem eventos novos), distribuição temporal (≥ 3 eventos novos até o dia 12, ≥ 4 a partir do dia 38, nenhum antes do dia 6) e **links missão→evento** nas 5 escolhas novas (M1 aval de Gilberto, M2 cobertura de Sílvio, M4 resposta paga com verba de Dante, M5 munição de Felipe no preparo e no debate final), sempre como opção opcional com 2+ saídas visíveis. **Alcance garantido dos arcos (Rodada 8)**: todo evento `guaranteed` (14 aberturas/consequências de arco na Rodada 8; **23 hoje**, com o arco do MNR da Rodada 9) entra na fila no primeiro dia elegível — teste por caso com os demais garantidos já disparados, ausência antes do portão de condições, não duplicação na fila nem retorno após resolução; sorteio ordinário alcança eventos de prioridade baixa (`aliado_vira` p60 sorteado em ≥ 2 de 100 sementes — antes, nunca); e **simulação de 40 campanhas** de ponta a ponta em que Dante, Caetano, Tiago, Black Stallion, investigação de William, matéria de capa e cobrança de Valdemar disparam em **todas** |
| `src/game/__tests__/election.test.ts` | 9 | Simulação nacional e regional determinística, soma de pesos, efeito de fatores (debate, imprensa, prioridades, alianças), empate, ruído controlado pela semente |
| `src/game/__tests__/endings.test.ts` | 10 | Ordem de resolução dos 8 finais (específicos antes dos genéricos), vitória/derrota/impasse, desfecho judicial independente do resultado eleitoral, recuo honroso |
| `src/game/__tests__/events.test.ts` | 8 | Fila e disparo por condições, frequência por dificuldade, custos, efeitos, um evento por dia, bloqueio em fase encerrada |
| `src/game/__tests__/save.test.ts` | 9 | Serialização, versionamento, validação campo a campo, correção de valores fora do intervalo, recuperação sem apagar save, round-trip completo |
| `src/game/__tests__/strategicActions.test.ts` | 10 | Custo de verba/dias por dificuldade, requisitos, efeitos (incl. alvo regional e "todas as regiões"), limites, indisponibilidade sem recursos |
| `src/ui/__tests__/App.test.tsx` | 13 | Fluxo real pela interface: menu → dificuldade → introdução → painel; missão 1 completa com escolhas, chave (A/B/C) e dica de consequência renderizadas; trava de clique duplo entre nós de decisão encadeados; ações refletindo em caixa; mapa e seleção de região; apuração com aviso legal; final gravado no progresso global; salvar/continuar; confirmação destrutiva cancelada; apuração só no último dia e com confirmação |
| `src/ui/__tests__/Portrait.test.tsx` | 3 | **Cabelo nunca sai da cabeça**: todo um dos 16 retratos declara um `clipPath` (aro) e aplica o clip ao cabelo frontal; id do aro **único** por retrato (sem colisão entre os SVGs da grade) e no formato válido `hairclip…`; os penteados ajustados ao crânio (`short`/`back`/`bun`/`long`) começam na lateral da cabeça (x ≈ 24–30, antes ficava em x ≈ 17–23) e sobem acima do topo do crânio (coroa coberta) |

Pontos de regressão já cobertos (bugs reais encontrados e corrigidos durante o desenvolvimento):

- efeitos `regionAll` descartados ao executar ações estratégicas;
- falha de missão não aplicada ao iniciar;
- ordem dos finais (impasse genérico derrotando finais específicos);
- semântica da condição `flag` sem `equals` (checagem de valor *truthy*);
- botão de cancelar duplicado no diálogo de confirmação;
- rótulos de atributos em inglês vazando para o histórico (agora `ATTR_LABELS` pt-BR no núcleo);
- **sufocamento de arcos por prioridade**: o sorteio olhava só os 3 maiores de 38 eventos e
  `dante_proposta` disparava em ~23% das campanhas (`tiago_gestao` 4%, `caetano_articulacao` 14%)
  — corrigido com eventos de arco `guaranteed` + 1 vaga sorteada entre os demais elegíveis.

---

## 2. Passagem manual no navegador (build de produção)

Executada de ponta a ponta, com **console limpo** (zero erros e zero avisos):

- **Menu principal** com 6 entradas e avisos de ficção/simulação visíveis.
- **Nova campanha**: seleção de dificuldade com custos/eventos/verba exibidos por nível.
- **Introdução narrativa** e transição para o painel.
- **Painel**: medidores, chips de verba/dia/fase, missão recomendada, regiões em destaque,
  ações rápidas e histórico recente.
- **Missão M1 → M5 jogadas na íntegra**: diálogos, escolhas com efeitos aplicados na hora
  (ex.: popularidade +6, lealdade +4), custos de verba/dia, objetivos marcados com ✓/OPCIONAL,
  conclusão e desbloqueio encadeado da missão seguinte.
- **Missão M3 ("O processo") revalidada no build de produção**: nó `sinal` com as **4 posturas**
  (chaves A–D, descrição e dica de consequência em verde sob cada alternativa), transição para o
  novo nó `protocolo` (com o caminho "protocolar revisão" oculto quando falta linha de defesa,
  exibindo sempre ao menos 2 saídas) e **console limpo** durante toda a navegação.
- **Mapa eleitoral**: SVG com as 5 regiões, legenda de equilíbrio, tabela de pesos/apoio/
  indecisos, painel da região selecionada, prioridades e alianças locais.
- **Ações estratégicas**: filtros por categoria, custo/efeito por cartão e execução real
  (caixa −R$ 8 mi, dia +1).
- **Eventos inesperados**: modal com retrato, três opções, custo explícito e resolução com
  efeito registrado no histórico; evento pendente bloqueia o avanço.
- **Alianças**: facções com níveis, relações pessoais dos 16 personagens e mesa de negociação.
- **Elenco**: grade com retratos SVG e modal de perfil (personalidade, interesses, postura,
  **alinhamento político**, relação e segredo narrativo) — revalidada após a atualização do
  elenco: **16 personagens** com os nomes finais (incluindo **Gilberto Kaspar, William Nogueira,
  Pedro Marques, Daniela Bezerra, Valdemar Costa e Sílvio Valente**), papéis e partidos novos
  (Leandro Lacerda presidente em exercício, Felipe Azevedo ministro pela FPT, Tiago sem filiação
  declarada), modal com a linha "Alinhamento político", tela **Créditos** e **Alianças** com os
  nomes atualizados, e **zero nomes antigos ou de pessoas reais** em qualquer tela
  (console limpo, sem mensagens).
- **Guia visual dos 16 retratos revalidado no navegador** (build de produção, console limpo,
  inspeção em zoom dos modais de Lacerda, André, Walker e Daniela): grade completa dos **16
  cartões lado a lado** com retratos conforme o guia de referência — **André Monteiro único
  careca** com óculos escuros e terno, **Lacerda com barba+bigode grisalhos cheios e sorriso**,
  **Walker com penteado loiro-dourado volumoso e gravata vermelha**, **Sílvio com cabelo
  grisalho abundante penteado para trás e sorriso largo**, **Valdemar com bigode grisalho**,
  **Pedro com barba escura visível**, **Daniela com cabelo longo, lábios e brincos discretos**,
  Júlio/Felipe com entradas (coroa coberta — ninguém além de André parece careca); correções
  aplicadas durante a validação (estilo `receding` redesenhado com coroa coberta; tons de
  cabelo/barba grisalhos escurecidos para contraste sobre pele clara; sorriso mais fino).
- **Defeito de "cabelo quebrado" corrigido em todos os estilos** (reportado pelo usuário em
  Fábio Barreto): as curvas externas dos estilos `short`, `wave`, `long`, `bun`, `back` e
  `receding` tocavam a borda interna no topo e viravam um arco fino sobre uma calva — a
  coroa do crânio aparecia acima do cabelo. Paths redesenhadas para que a massa de cabelo
  cubra a coroa em todos os personagens (verificado no navegador: grade dos 16 + modal de
  Fábio em tamanho grande); `bald` (só André) e `swoop`/`curly` já eram corretos; `cap`
  (não usado) corrigido por consistência.
- **Defeito do "cabelo para fora da cabeça" corrigido** (reportado pelo usuário em Sílvio,
  Caetano, Fábio, Pedro, Gilberto, William, Valdemar e Tiago): as laterais dos penteados
  começavam **fora** do contorno do rosto (x ≈ 17–23, enquanto o rosto começa em x ≈ 24–30) e
  viravam "asas" sobre o fundo. Correção em duas camadas: (1) os estilos `short`, `back`, `bun`
  e `long` passaram a ser **gerados a partir do contorno do próprio crânio** (borda externa
  colada ao rosto com 1 unidade de volume, linha do cabelo em cúpula e filete de penteado do
  `back` redesenhado dentro da massa) e (2) **todo** cabelo frontal agora é recortado por um
  `clipPath` único por retrato (id `hairclip…` gerado por `useId`, sem colisão entre os 16 SVGs)
  que acompanha a silhueta da cabeça — nenhum estilo escapa do rosto em nenhum formato de face.
  **Barbas removidas** de Felipe Azevedo, Caetano Góis e Tiago Farias e **pele de William
  Nogueira um tom mais escura** (pedido do jogador). Verificado no navegador (build de produção,
  console limpo): grade dos **16 cartões lado a lado** no tamanho normal e ampliada a 380 px,
  além do modal de Sílvio em 440 px com o cabelo grisalho colado ao crânio — sem barbas em
  Felipe/Caetano/Tiago e nenhuma asa fora da cabeça.
- **Nome "André Monteiro" sem o título** em cartão, modal e Créditos; **migração de relações
  legadas aplicada ao salvo antigo em tempo real**: Felipe Azevedo **+40 → −40** e Leandro
  Lacerda **+5 → −55** exibidos na grade, com as demais relações do jogador preservadas.
- **Debate**: preparo, treino pago (verba −5, preparo 40→48), perfil do adversário e regras.
- **Histórico**: decisões com consequências + linha do tempo filtrável (Tudo/Bom/Ruim/Neutro).
- **Configurações**: volume, mute, movimento (seguir sistema/reduzir/permitir), alto contraste,
  diagnóstico da partida e apagar save com confirmação.
- **Conquistas** (metaprogresso persistente) e **Galeria de finais** (8 slots, não revelados).
- **Apuração**: resultado nacional, tabela por região, fatores que mais influenciaram (com sinal),
  detalhe regional e fechamento da campanha — sempre com o aviso de que é simulação fictícia.
- **Final**: texto, resumo da campanha (dificuldade, dias, missões, decisões) e opções de
  rejogar com a mesma semente / galeria / menu.
- **Salvamento**: continuar campanha restaura o estado exato; confirmação em toda ação
  irreversível (apuração e retirada de candidatura).

### Rodada 7 — expansão narrativa (verificado no navegador, build de produção, console limpo)

- **Nova M1 completa pela interface** com a nova 4ª alternativa no `plenario` — chaves **A–D**
  renderizadas, escolha "Deixar Gilberto Kaspar anunciar o aval do partido" aplicada e
  persistida (`initialStrategy: "aval"`, relação com Gilberto 45→53, PRN +8, missão concluída,
  M2 liberada).
- **6 dos 18 eventos novos dispararam sozinhos** durante a passagem de dias no painel, cada um
  com retrato, texto e 3–4 escolhas no modal: `pacote_economico`, `silvio_oferta`,
  `pedro_pesquisa`, `debate_economico` (4 escolhas — a 5ª `revanche` oculta corretamente por
  não ter havido crítica prévia ao pacote), `gilberto_fechamento` e `crise_orcamentaria`.
- **Encadeamento aferido no save da partida**: `pacoteEconomico: "contraproposta"` →
  `debateEconomico: "recusado"` → `criseOrcamentaria: "regional"`, com a crise só elegível após
  o pacote — e as flags registradas no log e no histórico.
- **Console com zero erros e zero avisos** durante toda a navegação (missões + eventos).

### Rodada 8 — alcance dos arcos: "Dante nunca apareceu" (verificado no navegador, build de produção, console limpo)

**Relato**: o jogador completou duas campanhas e Dante Valverde nunca apareceu. Diagnóstico por
simulação de 400 campanhas no motor real: o sorteio diário só escolhia entre os **3 eventos de
maior prioridade entre 38**, e `dante_proposta` (prioridade 65) estava entre os últimos —
disparava em **23%** das campanhas; `caetano_articulacao` (62) em 14%, `tiago_gestao` (60) em 4%,
e as consequências deles em 0–8%. A campanha encerrada do próprio jogador confirmou o caso:
M2 concluída, janela de elegibilidade dos dias 22–56 e **nenhuma flag `danteDeal`**. Agravante
pré-existente: `advanceDays(N)` rola o sorteio **uma única vez por clique** (avanço de 3 dias =
1 sorteio), então a janela de sorteio é ainda menor do que os dias sugerem.

**Correção** (sem novos indicadores, sem refatoração,38 eventos intactos):

- **Eventos de arco garantidos** (`guaranteed: true` em 14 eventos): entram na fila no primeiro
  dia em que suas condições valem — portões de `when` intactos, sem depender do sorteio.
  Aberturas: `dante_proposta`, `black_stallion`, `crise_diplomatica`, `caetano_articulacao`,
  `tiago_gestao`, `documentario_republica`. Consequências condicionais de decisão:
  `dante_credito`/`dante_divida`/`dante_conflito`, `bastidores_publicados`,
  `caetano_exigencias`, `tiago_ascensao`, `valdemar_cobranca`, `karsavia_contrapartida`.
- **Sorteio mais justo** para os eventos ordinários: 2 vagas para os maiores prioridades +
  **1 vaga sorteada entre todos os demais elegíveis** (antes: topo-3 puro — eventos de prioridade
  baixa ficavam permanentemente sem chance conforme o pool crescia).

**Resultado medido**: `dante_proposta` 23% → **100%** das campanhas simuladas; `tiago_gestao`
4% → 100%; `caetano_articulacao` 14% → 100%; investigação de William 70% → 100%; consequências
de Dante 0–8% → 100% no caminho respectivo; eventos ordinários redistribuídos (ex.: `empresario_sai`
35% → 59%). Suíte: **169 testes** (+19: fila por caso dos 14 garantidos, ausência antes das
condições, não duplicação, sorteio justo em100 sementes, simulação de 40 campanhas).

**No navegador (passagem real, dificuldade Iniciante)**: nova campanha → M1–M4 pela interface →
avanços de 3 dias até o dia 22 → **modal "A proposta de Dante Valverde", locutor DANTE VALVERDE,
3 escolhas** → caminho "transparência" persistido (`danteDeal: "transparente"`) → dia 26
`valdemar_cobranca` (cobrança da promessa da M2) → dia 29 `crise_diplomatica` → dia 32
**"A cláusula de transparência rende dividendos"**, de novo com Dante e 3 escolhas →
`danteCredito: "observatorio"` no save. Console com **0 erros e 0 avisos**.

### Rodada 9 — Rafael Sampaio e o Movimento Nacional de Renovação (MNR)

**Escopo**: reformular Rafael de "influenciador político" para **fundador e líder do MNR**, uma
organização política independente (núcleos regionais, militância, agenda própria, sem filiação
partidária — **distinta do PRN**), com participação efetiva na campanha e sem apoio inicial a
nenhum dos candidatos.

- **Ficha** (`characters.ts`, id `bento` preservado): papel/cargo de líder do MNR, filiação
  independente, biografia nova (transformação de audiência digital em organização política),
  personalidade "irônico, combativo, estrategista e fiel à autonomia", interesses de expansão/
  mobilização/influência institucional/autonomia, postura inicial "independente e desconfiado
  dos dois candidatos". Relação pessoal +10 e alinhamento programático 45 **mantidos** (agora
  rotulados como o que são). Segredo (contrato de mentoria anterior à campanha) preservado.
- **Indicadores reaproveitados — nenhum sistema novo**: 4 flags narrativas (`mnrApoio` com
  estágios `dialogo`/`acordo`/`apoio`/`alianca`/`distante`; `mnrEstrutura`
  `incipiente`/`organizada`/`nacional`; `mnrCoesao` `coesa`/`tensa`/`fragmentada`;
  `contratoRafael`), facção `movimentos` como força das bases, `alignment` para proximidade
  programática, `relations.bento` para vínculo pessoal, efeitos `region` para mobilização
  regional. Salves antigos continuam válidos: flags ausentes = posição independente.
- **UI** (`CharactersScreen`): rótulos "Alinhamento programático" (com aviso de que **não implica
  apoio eleitoral**) e "Relação pessoal"; linhas exclusivas na ficha do Rafael — "Posição do MNR"
  e "Organização do MNR" (rótulos puros em `data/mnr.ts`).
- **8 eventos novos + 1 reenquadrado** (38 → **46**), todos `guaranteed` com portão de `when`:
  `mnr_mobilizacao` (dia 8 — abertura em qualquer campanha; 3 caminhos, nenhum dá apoio),
  `mnr_negociacao` (dia 14 — três situações distintas: acordo programático / renegociação /
  recusa com distanciamento), `rafael_mobiliza` reescrito (ato nacional do MNR, mesmo id/flags),
  `mnr_pragonismo` (dia 22 + núcleos organizados — disputa de protagonismo),
  `mnr_regional` (dia 26 + rede organizada — debates regionais com efeito em Costa Vermelha
  condicionado a diálogo/acordo), `mnr_bases` (dia 30 + compromisso assumido — pressão das bases),
  `contrato_mentoria` (dia 32 + M4 ou relação 35 — investigação de William sobre o segredo),
  `mnr_crise_autonomia` (dia 34 — Leandro tenta incorporar o MNR), `mnr_definicao` (dia 40 +
  acordo + relação ≥ 45 + movimentos ≥ 55 — **único ponto em que apoio/aliança podem ser
  declarados**).
- **Textos corrigidos** (seção "todas as referências"): `bastidores_publicados` (leitura nos
  canais do movimento) e fala de Rafael na M4 (transmissão do MNR).
- **Testes**: `mnr.test.ts` com **13 casos** (regra de ouro varrida sobre os 46 eventos, portões
  individuais, ≥ 2 escolhas livres por evento, dedup, texts, simulação de 25 campanhas com o arco
  completo disparando em todas); `cast.test` com contagem 46 e asserções de filiação do MNR;
  teste de sorteio ordinário da Rodada 8 ajustado para considerar a abertura do MNR (dia 8) já
  resolvida. Suíte: **182 testes**.

---

## 3. Acessibilidade e responsividade (verificado em código + navegador)

- Navegação por teclado em todo o app; botões nativos com foco visível.
- `prefers-reduced-motion` respeitado, mais alternativa manual de animações.
- Alto contraste opcional; mute total (o jogo funciona integralmente sem som).
- Rodapé com avisos de ficção e de simulação eleitoral em todas as telas de campanha.
- Layout responsivo (grade colapsa em telas estreitas; testado em ~1050 px de largura).

## Como reproduzir

```bash
npm install
npm run typecheck
npm test
npm run build
npm run preview   # http://localhost:4173
```

Para repetir a mesma partida (mesmos eventos e ruído eleitoral), use **"Jogar de novo com a
mesma semente"** na tela final ou ative o diagnóstico em Configurações para ler a semente.
