# Preparação para desktop (Tauri)

O jogo **não está empacotado ainda** — este documento registra o que já está pronto no código e
qual é o caminho exato para gerar o instalador quando a decisão de produto (portão 4 do
[`validacao-comercial.md`](validacao-comercial.md)) for tomada.

## 1. Por que está "preparado" e não "feito"

Adicionar o Tauri envolve dependências nativas (Rust, `tauri-cli`, WebView2 no Windows) e gera
 artefatos que só valem a pena se houver canal de distribuição. Como a validação ainda está em
 andamento, o empacotamento fica **opcional e reversível** — mas nada no código impede fazer amanhã.

## 2. O que o código já garante

| Requisito do Tauri | Situação no projeto |
| --- | --- |
| Assets relativos (protocolo `tauri://`/`http://tauri.localhost`) | `vite.config.ts` usa `base: './'` — build funciona em subdiretório e `file://`. |
| Sem chamadas de rede | ✅ Nenhum `fetch`/XHR/URL externa em `src/` (verificado por grep). Nenhum CDN, fonte remota ou API. |
| Persistência confiável | ✅ `save/storage.ts` isola tudo atrás de `KeyValueStorage`; usa `localStorage` quando disponível e cai para memória. Trocar por `tauri-plugin-store`/`fs` = **1 arquivo**. |
| Sem segredos no bundle | ✅ Sem variáveis de ambiente sensíveis; tudo é conteúdo estático. |
| Áudio local | ✅ Sons sintetizados via Web Audio API, sem arquivos de mídia nem autoplay forçado (o áudio só inicia após interação do usuário — compatível com políticas do WebView). |
| Escopo de domínio restrito | `csp` pode ficar estrito (`default-src 'self'`) pois não há origem externa. |
| Idioma/encoding | `index.html` com `lang="pt-BR"` e `<meta charset="UTF-8">`. |

Limitações que **não** são bloqueio: sem favicon/OG (P0 do roadmap), sem ícones de aplicativo
(precisa gerar os tamanhos exigidos pelo Tauri), um único slot de save.

## 3. Passos para empacotar (quando quiser)

Requisitos: Rust (`rustup`), `cargo`, e no Windows o *WebView2 Runtime* (já presente na maioria
das máquinas) + *Microsoft C++ Build Tools*.

```bash
# 1. CLI do Tauri (dev dependency)
npm install -D @tauri-apps/cli

# 2. Esqueleto (gera src-tauri/, não toca em src/)
npx tauri init
```

Configuração esperada em `src-tauri/tauri.conf.json`:

```jsonc
{
  "build": {
    "frontendDist": "../dist",      // build do Vite
    "devUrl": "http://localhost:5173", // npm run dev
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [{
      "title": "República em Jogo",
      "width": 1280, "height": 800,
      "minWidth": 360, "minHeight": 640
    }],
    "security": { "csp": "default-src 'self'; img-src 'self' asset: data:; style-src 'self' 'unsafe-inline'" }
  },
  "bundle": {
    "active": true,
    "targets": ["nsis", "msi"],
    "identifier": "com.republicaemjogo.game", // trocar por domínio próprio
    "icon": ["icons/32x32.png", "icons/128x128.png", "icons/icon.ico"]
  }
}
```

Scripts a acrescentar ao `package.json`:

```json
{
  "tauri": "tauri",
  "desktop:dev": "tauri dev",
  "desktop:build": "tauri build"
}
```

Checagem final: `npm run build && npx tauri build` → instalador NSIS/MSI em
`src-tauri/target/release/bundle/`.

## 4. Decisões a tomar na hora do empacotamento

1. **Save**: manter `localStorage` (funciona no WebView, caminho mais curto) **ou** migrar para
   `tauri-plugin-store` (arquivo `.json` em `app_data`, editável/exportável pelo jogador).
   A abstração já existe; a migração é localizada em `save/storage.ts`.
2. **Exportar/importar save**: no desktop, usar diálogo nativo de arquivo (plugin `dialog` +
   `fs`) — mesma funcionalidade do P0 da web.
3. **Atualizações**: `tauri-plugin-updater` só se houver canal próprio; para itch.io/Steam,
   deixar a atualização no launcher da plataforma.
4. **Ícones**: gerar a grade completa (32/128/256/512 + `.icns` + `.ico`) a partir da arte final.
5. **Assinatura de código**: obrigatória para não ser bloqueado pelo SmartScreen no Windows —
   exige certificado (custo anual), prever no orçamento.

## 5. Riscos conhecidos no desktop

- **WebView2 ausente**: instalador do Tauri resolve, mas testar em máquina limpa.
- **Áudio**: alguns WebViews suspendem contexto ocioso; o áudio é sintetizado e curto — testar
  `resume()` do `AudioContext` ao voltar do foco (código já defensivo, mas não testado em WebView).
- **Alta DPI**: testar janela em monitores 150%/200% (o layout é responsivo, mas não validado em
  escala de sistema).
- **Modo janela/teclado**: atalhos globais (ex.: `Esc` para menus) precisam de `tauri://` shortcut
  plugin — fora do escopo atual.

## 6. Checklist pré-publicação desktop

- [ ] `npm run typecheck && npm test && npm run build` verdes
- [ ] Ícones completos + arte final de capa
- [ ] Save exportável/importável e migração do save antigo
- [ ] Instalador testado em Windows 10/11 limpo (e em conta sem privilégios de admin)
- [ ] SmartScreen/antivírus avaliados (assinatura de código)
- [ ] Avisos de ficção presentes na primeira tela do instalador e no app
- [ ] Uninstaller remove dados **apenas** com confirmação explícita (nunca silenciosamente)
