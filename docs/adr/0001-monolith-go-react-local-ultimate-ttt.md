# ADR 0001 – Monolito Go + React para o Ultimate TTT (modo local, preparado para multiplayer/IA)

## Status

Aceito – 2025-12-05

---

## Contexto

O projeto **Ultimate TTT** tem como objetivo implementar o “Jogo da Velha 2.0” (Ultimate Tic-Tac-Toe) com:

- **Go** como linguagem principal no backend (foco de estudo e vitrine técnica);
- **React + Vite** no frontend para modelar a interface e a experiência do jogador;
- Regras de jogo mais complexas que o jogo da velha tradicional (tabuleiro macro 3×3 contendo 9 micro-tabuleiros 3×3 cada, com restrições de jogada);
- Extensibilidade clara para:
  - **multiplayer** (várias pessoas conectadas a um servidor Go remoto);
  - **bot/IA** como adversário controlado pelo servidor.

Restrições e desejos explícitos:

- Publicar algo **jogável ainda hoje**, mesmo que só em modo local.
- Demonstrar **boas práticas esperadas em entrevistas**:
  - organização em `cmd/`, `internal/`, `docs/adr`;
  - clareza de decisões arquiteturais;
  - uso consciente de ferramentas (`pnpm`, Vite, React).
- Evitar complexidade desnecessária de tooling:
  - **sem Rolldown** neste momento;
  - usar **Vite estável** com React;
  - gerenciador de pacotes **pnpm** (instalado via `npm install -g pnpm`), mantendo compatibilidade com `npm`.

---

## Decisão

1. **Arquitetura monolítica Go + React**

   - O backend será um **monolito em Go**, responsável por:
     - servir o build estático do frontend React;
     - expor endpoints básicos (ex.: `/health`);
     - futuramente, gerenciar salas de jogo, partidas multiplayer e bot/IA.
   - O frontend será uma **SPA em React + Vite**, rodando hoje em modo local, responsável por:
     - lógica de interface;
     - gerenciamento de estado do jogo no navegador;
     - integração com `localStorage` (nomes de jogadores, ranking, configurações).

2. **Fase inicial: toda a lógica de jogo no frontend (TypeScript)**

   - A regra de negócio do Ultimate TTT (macro/micro tabuleiros, restrição de jogadas, vitória) foi implementada em um módulo TypeScript:
     - `frontend/src/game/core.ts`
   - O componente principal `App.tsx` consome essa API de domínio:
     - renderiza o tabuleiro macro 3×3;
     - renderiza os micro-tabuleiros 3×3;
     - chama `applyMove(...)` na lógica de jogo a cada clique;
     - exibe o vencedor no tabuleiro macro quando houver.

3. **Experiência visual: tema light/dark e “neon” para X e O**

   - O frontend adota:
     - botão de toggle **light/dark**;
     - destaque forte para o jogador da vez:
       - “**Vez do Círculo**” (O) em vermelho neon;
       - “**Vez do X**” em azul neon;
     - X em azul neon e O em vermelho neon nas células, com cuidado para não causar “saltos” de layout (sem mudança de tamanho dos micro-tabuleiros ao clicar).
   - O objetivo é:
     - dar cara de jogo e não de POC;
     - sem complicar a arquitetura (apenas CSS + classes).

4. **Ferramentas**

   - **Frontend**
     - React + Vite (template React/TypeScript).
     - Gerenciador de pacotes recomendado: **pnpm** (via `npm install -g pnpm`), com compatibilidade explícita com `npm`.
     - Sem Rolldown neste momento (uso do bundler padrão do Vite).
   - **Backend**
     - Go >= 1.22.
     - `net/http` e `embed` (biblioteca padrão) para servir arquivos estáticos.
     - Estrutura planejada:
       - `backend/cmd/server/main.go` – ponto de entrada.
       - `backend/internal/http` – servidor/rotas/handlers.
       - `backend/internal/game` – engine de jogo server-side (futuro).
       - `backend/internal/ai` – bot/IA (futuro).

---

## Justificativa

1. **Foco em Go como vitrine técnica, sem travar a entrega de hoje**

   - Se o backend fosse exigido como “100% pronto” (multiplayer, bot, etc.) antes da publicação, o risco de não entregar nada jogável hoje seria alto.
   - Manter a lógica de jogo inicialmente em TypeScript/React permite:
     - ter uma versão local jogável rapidamente;
     - ao mesmo tempo, desenhar a arquitetura Go para receber essa lógica mais tarde.

2. **Monolito bem organizado**

   - Um monolito bem estruturado com:
     - `cmd/`, `internal/`, `docs/adr`, `frontend/`;
     - uso de `embed` para servir o frontend;
     - ADRs registrando decisões;
   - mostra maturidade arquitetural:
     - saber **quando não complicar**;
     - saber preparar terreno para crescimento.

3. **Vite estável sem Rolldown evita “brigar com tooling”**

   - O objetivo do projeto não é testar o limite do bundler, e sim:
     - mostrar domínio de Go + React;
     - construir um jogo com regras interessantes;
     - praticar decisões arquiteturais.
   - Experimentar Rolldown agora adicionaria risco sem benefício proporcional.  
     Fica reservado para um futuro branch/ADR focado em performance/tooling, se fizer sentido.

4. **pnpm como padrão, sem criar atrito para terceiros**

   - `pnpm` foi escolhido porque:
     - é mais eficiente em disco;
     - é rápido para reuso de dependências entre vários projetos;
     - tem uma estrutura de `node_modules` mais previsível.
   - Ao mesmo tempo:
     - a documentação explicita que **`npm` é suportado**;
     - os scripts (`dev`, `build`, `test`) seguem o padrão, então:
       - `pnpm dev` ↔ `npm run dev`.

---

## Alternativas consideradas

1. **Somente React (sem Go)**

   - Vantagens:
     - mais rápido de colocar no ar;
     - poderia hospedar só o front (Netlify, Vercel) e pronto.
   - Desvantagens:
     - não atende o objetivo de treinar Go;
     - enfraquece o projeto como vitrine para vagas de backend/Go.
   - Motivo para não escolher:
     - foco do autor é evoluir na stack Go; React é suporte, não fim.

2. **Backend Go + frontend acoplado (sem Vite, HTML/JS direto)**

   - Vantagens:
     - menos tooling, tudo na stdlib de Go.
   - Desvantagens:
     - UI ficaria limitada;
     - manter estado/UX complexa seria mais custoso.
   - Motivo para não escolher:
     - React é uma ferramenta madura justamente para gerenciar interfaces dinâmicas com estado complexo;
     - o custo de Vite + React é baixo frente ao ganho em organização de UI.

3. **Arquitetura “full API” desde o começo (Go com toda lógica, React só consumindo)**

   - Vantagens:
     - desde o início, o backend é a “fonte da verdade”;
     - prepara diretamente para multiplayer.
   - Desvantagens:
     - aumenta o esforço inicial;
     - atrasa a primeira versão jogável.
   - Motivo para não escolher:
     - preferido um caminho **incremental**:
       - Fase 1: lógica no front (modo local);
       - Fase 2: protocolo de jogo;
       - Fase 3: mover/mirror da lógica para Go e liberar multiplayer.

4. **Adotar Rolldown imediatamente**

   - Vantagens:
     - acompanhar o estado-da-arte do bundling;
     - potencial de performance.
   - Desvantagens:
     - risco de instabilidade / incompatibilidade;
     - tempo gasto lidando com tooling em vez de regra de jogo/arquitetura.
   - Motivo para não escolher:
     - não agrega valor real ao objetivo atual (jogo jogável + vitrine Go/React).

---

## Consequências

### Positivas

- Já existe um **jogo jogável em modo local**:
  - lógica centralizada em `frontend/src/game/core.ts`;
  - interface React com:
    - tabuleiro macro/micro;
    - indicador de “Vez do Círculo / Vez do X” em neon;
    - tema light/dark.
- O projeto já nasce com:
  - divisão clara backend/frontend;
  - espaço reservado para engine de jogo em Go;
  - espaço reservado para bot/IA em Go;
  - ADR formalizando a decisão inicial.
- Fácil de explicar em entrevista:
  - “Comecei com lógica no front para ter algo jogável rápido; a arquitetura prepara a migração dessa lógica para Go e o suporte a multiplayer/IA.”

### Negativas

- Enquanto a lógica estiver somente no frontend:
  - não há validação server-side;
  - multiplayer ainda não é possível;
  - o backend Go não demonstra, na prática, a engine do jogo.
- Ainda não há:
  - ranking persistido;
  - nomes de jogadores com cache em `localStorage`;
  - modo sobrevivência implementado (timer de 10 segundos por jogada).

---

## Próximos passos (planejados para ADRs futuros)

1. **ADR 0002 – Protocolo de jogo**

   - Desenhar o formato JSON de:
     - estado de partida;
     - jogada (move);
     - mensagens de erro/validação.
   - Introduzir a interface `GameClient` no frontend (`LocalGameClient` x `RemoteGameClient`).

2. **ADR 0003 – Engine de jogo em Go + multiplayer**

   - Mover/espelhar regras de jogo para `backend/internal/game`.
   - Expor rotas HTTP/WebSocket para:
     - criar sala;
     - entrar em sala;
     - sincronizar estado.

3. **ADR 0004 – Bot / IA**

   - Definir interface de “Player” server-side (humano/bot).
   - Implementar heurísticas simples para o bot.
   - Expor modo “vs bot” no frontend.

4. **ADR para ranking, modo sobrevivência e persistência**

   - Formalizar como ranking será salvo (client-side vs server-side).
   - Formalizar implementação do modo sobrevivência (timer, perda de vez).

---

---