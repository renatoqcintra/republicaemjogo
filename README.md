# República em Jogo

Uma sátira de estratégia política narrativa que roda inteiramente no navegador — com caminho
preparado (mas ainda não empacotado) para desktop via Tauri.

> **Aviso**: todo o elenco, os partidos, as instituições, as regiões e os acontecimentos são
> **fictícios**. Qualquer semelhança com pessoas, partidos ou fatos reais é mera coincidência.
> As simulações eleitorais são fictícias e não representam previsão, pesquisa ou resultado de
> eleição real.

---

## O que está pronto

- **Campanha completa de 56 dias** com 5 missões encadeadas (M1 → M5), cada uma com escolhas que
  alteram atributos, verba, alianças, região-alvo e o desfecho judicial do pai do candidato.
- **Sistema de atributos**: popularidade, influência, reputação, confiança institucional e lealdade
  dos aliados (0–100), com verba em R$ milhões e preparo de debate.
- **Mapa eleitoral com 5 regiões fictícias**, pesos eleitorais, prioridades do eleitorado,
  alianças locais e sensibilidade a escândalos por região.
- **Apuração eleitoral simulada** determinística (mesma semente ⇒ mesmo resultado), com fatores
  explicando o que pesou a favor e contra.
- **10 ações estratégicas**, **46 eventos inesperados**, **16 personagens originais** com retratos
  SVG gerados proceduralmente, **8 finais** e **9 conquistas**.
- **Dificuldades** (Iniciante / Equilibrado / Implacável) que ajustam custos, frequência de eventos
  e margem de erro — sem esconder regras.
- **Salvamento local** com autosave, versionamento (`SAVE_VERSION`), validação de dados e
  recuperação segura: um save corrompido nunca é apagado silenciosamente.
- **Acessibilidade**: navegação completa por teclado, foco visível, `prefers-reduced-motion`,
  opção de alto contraste, mute total de áudio (sons sintetizados localmente, sem arquivos) e
  diagnóstico de semente/partida opcional.

---

## Requisitos

- Node.js 20+ (testado com Node 24) e npm 11+.
- Nenhum backend, banco de dados ou API paga é necessário.

## Comandos

| Comando             | O que faz                                            |
| ------------------- | ---------------------------------------------------- |
| `npm install`       | Instala as dependências                              |
| `npm run dev`       | Servidor de desenvolvimento (Vite)                   |
| `npm run typecheck` | Verificação estrita de tipos (`tsc -b --noEmit`)      |
| `npm test`          | Suíte completa (Vitest + Testing Library)            |
| `npm run test:watch`| Testes em modo observador                            |
| `npm run build`     | Build de produção em `dist/`                         |
| `npm run preview`   | Serve o build de produção localmente                 |

Fluxo recomendado antes de qualquer entrega:

```bash
npm run typecheck && npm test && npm run build
```

---

## Como jogar

1. **Nova campanha** → escolha a dificuldade → leia a introdução → **Iniciar a campanha**.
2. No **Painel**, acompanhe atributos, verba, dia e missão recomendada.
3. **Avance o dia** para disparar eventos; eventos pendentes travam a progressão até serem
   resolvidos — toda escolha tem custo e consequência visíveis.
4. **Missões**: conclua M1 a M5 em ordem. M5 ("A última semana") só libera na última semana
   *e* após M4 (concluída ou falhada).
5. **Ações estratégicas** custam verba e dias; **Mapa** mostra apoio por região e permite escolher
   a região-alvo; **Alianças** negocia pactos; **Debate** treina o desempenho final.
6. No dia 56 (ou ao concluir M5) a **apuração** é liberada — sempre com confirmação explícita.
7. O **final** combina resultado eleitoral + desfecho do processo judicial. Finais e conquistas
   ficam salvos permanentemente (progresso global local).

**Atalhos de teclado**: a navegação principal, botões e diálogos são alcançáveis com `Tab` /
`Shift+Tab`, ativados com `Enter`/`Espaço` e fecháveis com `Esc`. O foco é visível em todo o
site. Detalhes em [`docs/recursos-testados.md`](docs/recursos-testados.md).

---

## Arquitetura

O código separa **estado**, **regras**, **narrativa** e **interface**. Nenhuma tela implementa
regra de jogo: toda mudança passa por funções puras testadas.

```
src/
├── game/                     # núcleo do jogo (sem React)
│   ├── types.ts              # todos os tipos do domínio
│   ├── constants.ts          # limites, dificuldades, rótulos pt-BR, chaves de save
│   ├── rng.ts                # PRNG determinístico (mulberry32) — mesma semente ⇒ mesma partida
│   ├── conditions.ts         # condições declarativas (attrGte, flag, missionDone, any/all/not…)
│   ├── effects.ts            # aplicação de efeitos: clamps, log, desbloqueios, conquistas
│   ├── engine/missionEngine.ts  # interpretador dos grafos de missão
│   ├── election/election.ts  # simulação eleitoral pura e explicável
│   ├── events/eventSystem.ts # fila de eventos, filtros e resolução
│   ├── rules/                # números, ações estratégicas, conquistas
│   ├── state/                # estado inicial + store Zustand (actions, autosave, avisos)
│   ├── save/                 # storage isolado por plataforma, validação e saveManager
│   ├── audio/audioManager.ts # sons sintetizados via Web Audio (opcional/mudo)
│   └── data/                 # conteúdo: personagens, regiões, missões, eventos, finais,
│                             # conquistas, ações
├── ui/
│   ├── components/           # Portrait, Meter, Modal/ConfirmDialog, RegionMap, EventModal
│   └── screens/              # 18 telas + helpers
├── App.tsx                   # casca: navegação, avisos, modal de evento
└── test/setup.ts             # setup de testes (storage em memória)
```

**Princípios adotados**

- **Grafos de missão declarativos**: cada missão é um mapa de nós (`dialogue` / `choice` / `end`)
  interpretado por `missionEngine`. Adicionar conteúdo não exige novo código de controle.
- **Condições e efeitos como uniões tipadas**, avaliadas por funções puras — fáceis de testar e de
  estender com novos tipos sem quebrar o restante.
- **Aleatoriedade sempre determinística**: eventos, ruído eleitoral e concorrência usam a semente
  da partida; nada de `Math.random()` no fluxo de jogo.
- **Aparência desacoplada do conteúdo**: retratos são SVG procedurais gerados a partir de
  `PortraitSpec` — podem ser substituídos por arte final sem tocar em regra.
- **Persistência isolada**: `save/storage.ts` escolhe `localStorage` (ou memória, em teste),
  então nenhum teste depende do disco e o Tauri pode trocar o backend depois.

---

## Progresso e saves

- Autosave a cada ação relevante (chave `republica-em-jogo:save`), mais metadados e configurações
  em chaves próprias.
- O save carregado é **validado campo a campo** (`save/validate.ts`): valores fora do intervalo são
  corrigidos e reportados com avisos; dados irreparáveis resultam em recuperação segura — **nunca**
  em apagar o save silenciosamente.
- O progresso global (finais desbloqueados, conquistas, campanhas jogadas) vive em uma chave
  separada (`meta`), para sobreviver a novas campanhas.

## Limitações e próximos passos

- Limitações conhecidas e impacto: [`docs/limitacoes-e-roadmap.md`](docs/limitacoes-e-roadmap.md)
- Recursos já verificados (testes + passagem manual): [`docs/recursos-testados.md`](docs/recursos-testados.md)
- Plano de validação comercial: [`docs/validacao-comercial.md`](docs/validacao-comercial.md)
- Preparação para empacotar no desktop (Tauri): [`docs/desktop-tauri.md`](docs/desktop-tauri.md)

## Licença e conteúdo

Conteúdo e personagens são invenções originais da obra. Mantenha os avisos de ficção e de
simulação eleitoral visíveis em qualquer versão publicada — são parte do compromisso ético do
produto, não apenas do texto legal.
