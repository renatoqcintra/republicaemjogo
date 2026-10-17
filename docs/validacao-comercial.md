# Plano de validação comercial

Objetivo: descobrir, **antes de investir em arte final e marketing**, se "República em Jogo"
sustenta um negócio. O plano é por hipóteses e por **portões de decisão** — cada etapa só
avança se a métrica-alvo for atingida.

---

## 1. Hipótese central

> Existe público disposto a pagar por uma estratégia política narrativa **brasileira, satírica e
> ficcional**, com campanha de 45–60 minutos e rejogabilidade por finais, mesmo sem marcas reais
> nem escândalos do noticiário.

Sub-hipóteses:

- **H1 (desejo)**: o enredo "herdeiro de presidente condenado tenta se reerguer" gera curiosidade
  suficiente para cliques em anúncio/post (CTR e wishlist).
- **H2 (retenção)**: o jogador termina a 1ª campanha (≤ 60 min) com vontade de tentar outro final.
- **H3 (pagamento)**: há faixa de preço em que a conversão é aceitável (ver §4).
- **H4 (diferencial)**: o tom de sátira com elenco 100% fictício é vendável sem depender de
  candidatos/partidos reais (evita risco jurídico e amplia distribuição).

## 2. Público e posicionamento

**Público-alvo primário**: 18–45 anos, Brasil, jogadores de narrativa/estratégia leve e
leitores de notícia política; jogam em navegador e celular.

**Público secundário**: professores de ciências sociais/ciência política e divulgadores que
querem material lúdico sobre processo eleitoral (o jogo tem valor educacional acidental).

**Posicionamento**: "Reigns/Suzerain com sotaque brasileiro, humor de sátira e um processo
judicial pendurado". Frase curta para testes: *"Você não escolhe entre certo e errado — escolhe
entre caro e caríssimo."*

**Referências concorrentes** (para estudar, não copiar): Reigns, The Westport Independent,
Yes Your Grace, Suzerain, King of Dragon Pass. Todos validaram o formato "cartas + consequências";
ninguém ocupa bem o espaço brasileiro-ficcional.

## 3. Canais e ativos mínimos

1. **Landing page** (1 página, mesmo visual do jogo): trailer de 45 s, 3 capturas, texto de
   enigma + e-mail/wishlist. Custo ~0.
2. **itch.io (demo gratuita)** da 1ª missão + CTA para o jogo completo.
3. **Vídeo curto** (Reels/TikTok/Shorts) mostrando uma escolha com consequência visível — o
   formato que melhor demonstra o gênero.
4. **Imprensa/blog de games BR** e creators de estratégia/narrativa (lista de 30 contatos).

## 4. Modelos de preço a testar (por essa ordem)

| Modelo | Faixa | O que valida | Risco |
| --- | --- | --- | --- |
| **Pague o quanto quiser** (demo + completo, itch.io) | R$ 0–19,99 | H3 de forma barata e rápida | Baixo — só tempo |
| **Preço fixo baixo** | R$ 14,99–24,99 | Elasticidade real no público BR | Médio |
| **Pacote "edição de campanha"** (trilha + arte conceito + making of) | R$ 29,99 | Willingness-to-pay de fãs | Depende de conteúdo extra |
| **Steam depois** | US$ 4,99–7,99 | Escala internacional (exige P1 + Tauri/Steam build) | Custo de curadoria e taxa |

Não anunciar preço antes de H2 (ver portão 2). Gratuitidade total só para a **1ª missão**.

## 5. Experimentos e portões de decisão

### Portão 1 — Desejo (2 semanas, custo baixo)
- **A/B de duas capas/promessas** em anúncio barato (R$ 150–300) e 3 posts orgânicos.
- **Métrica-alvo**: CTR ≥ 1,5% no anúncio; ≥ 100 e-mails/wishlists; ≥ 30 comentários pedindo jogo.
- **Reprova**: CTR < 0,8% com 2 variações → reescrever enigma/hook antes de produzir mais.

### Portão 2 — Retenção (demo da 1ª missão, 3 semanas)
- Demo no itch.io + landing com rastreamento simples (pageview → clique → jogar).
- **Métrica-alvo**: ≥ 40% dos que iniciam concluem a missão 1; sessão mediana ≥ 15 min;
  ≥ 25% clicam em "continuar/próxima missão".
- **Reprova**: conclusão < 20% → problema de tutorial/clareza, não de tema; corrigir (P0 do
  roadmap) e retestar antes de qualquer produção de arte.
- Instrumentação: eventos locais contando início/conclusão de missão (progresso já existe no save).

### Portão 3 — Pagamento (2 semanas após o portão 2)
- Pague-o-quanto-quiser no itch.io + formulário "quanto você pagaria pelo jogo completo".
- **Métrica-alvo**: mediana de oferta ≥ R$ 15 **ou** ≥ 3% dos jogadores da demo pagando algo.
- **Reprova**: mediana < R$ 8 → repensar escopo (demo grátis + capítulos pagos) ou conteúdo extra.

### Portão 4 — Produto completo (4–6 semanas)
- Lançar o jogo completo (itch.io web + pay-what-you-want) com as P0/P1 do roadmap.
- **Métrica-alvo**: ≥ 30% desbloqueiam 2+ finais; NPS ≥ 40; ≥ 10% rejogam em 7 dias.
- Decisão: seguir para desktop (Tauri/Steam) ou manter web-first.

## 6. Métricas de produto (já mensuráveis no código)

O jogo já grava localmente: finais desbloqueados, conquistas, campanhas jogadas, missões
concluídas, decisões registradas. Com isso é possível derivar, **sem coletar dado pessoal**:

- taxa de conclusão de campanha (o save tem `phase: 'ended'`);
- distribuição de finais (progresso global);
- nº médio de missões concluídas por campanha;
- dificuldade escolhida.

Com a telemetria local opcional (roadmap P2, com consentimento explícito), somam-se: abandono por
missão, tempo por tela e escolhas mais comuns. Sem ela, usar formulário pós-jogo (portões 2–4).

## 7. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Leitura de "aparelho de propaganda" ou identificação com políticos reais | Elenco, partidos e instituições 100% fictícios; avisos permanentes de ficção e de simulação; nenhum nome/estilo de politician real (regra de produção, já seguida). |
| Exposição jurídica por sátira | Ficção declarada, sem fatos reais, sem marcas, sem imagens de terceiros; revisar textos antes de publicar. |
| Sensibilidade a conteúdo político em anúncios | Anunciar pelo **tema** ("jogo de escolhas difíceis"), não por candidato/evento real. |
| Sazonalidade eleitoral (jun–out no Brasil) | Testar fora da janela eleitoral; se sazonal, alinhar lançamento a ela **apenas** com conteúdo ficcional (respeitando o Código Eleitoral e a legislação de propaganda). |
| Rejeição à arte provisória | Só produzir arte final após o portão 2 (retenção). |

## 8. Conformidade (produto já nasce alinhado)

- **LGPD**: dados só no dispositivo; nenhuma conta, nenhum cookie de terceiro, nenhum servidor.
  Qualquer telemetria futura deve ser opcional e com consentimento.
- **Avisos de ficção e de simulação eleitoral** visíveis em todas as telas — são parte do produto.
- Sem marcas, sem imagens de pessoas reais, sem texto de terceiros.

## 9. Orçamento e tempo sugeridos

| Fase | Prazo | Custo |
| --- | --- | --- |
| Portão 1 (landing + 2 criativos) | 2 semanas | R$ 300–500 |
| Portão 2 (demo + ajustes) | 3 semanas | R$ 0–300 (ferramentas) |
| Portão 3 (PWYW + pesquisa) | 2 semanas | R$ 0 |
| Portão 4 (lançamento web) | 4–6 semanas (inclui P0/P1 do roadmap) | R$ 1.000–3.000 (arte final parcial + trilha) |

**Critério geral de continuidade**: seguir investindo apenas se 3 dos 4 portões forem
atingidos; se dois consecutivos reprovarem, reavaliar o enigma (tema/hook) antes de qualquer
produção visual.
