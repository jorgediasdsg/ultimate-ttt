# Ultimate TTT – Jogo da Velha 2.0 em Go + React

Projeto de estudo e vitrine técnica: implementação do “Jogo da Velha 2.0” (Ultimate Tic-Tac-Toe) usando **Go** no backend (monolito planejado) e **React + Vite** no frontend, com foco em:

- arquitetura limpa;
- documentação por ADRs;
- espaço explícito para evoluir para **multiplayer** e **bot com IA**.

Neste momento, o jogo já roda em **modo local** no navegador, com tema light/dark e visual em estilo **neon** para X e Círculo.

---

## Objetivos do projeto

- Demonstrar proficiência em:
  - **Go** (estrutura de projeto, monólito organizado, preparo para multiplayer/IA).
  - **React** (estado complexo, interação fluida, uso de `localStorage`).
- Construir uma base que:
  - **hoje**: funcione em **single device** (2 jogadores na mesma tela, lógica no frontend);
  - **amanhã**: aceite conexão com servidor Go remoto para:
    - multiplayer;
    - partidas contra bot/IA.
- Entregar um repositório que recrutadores, devs sênior e tech leads possam abrir e enxergar:
  - clareza arquitetural;
  - decisões bem justificadas;
  - código jogável, não apenas boilerplate.

---

## Estado atual (Fase 1 – Modo local, lógica no frontend)

- **Lógica de jogo** implementada em TypeScript:

  - Arquivo principal de domínio:  
    `frontend/src/game/core.ts`

  - Responsável por:
    - estado do tabuleiro macro 3×3;
    - estado dos 9 micro-tabuleiros 3×3;
    - regra de “envio” da jogada para o próximo micro-tabuleiro;
    - detecção de vitória no macro-tabuleiro;
    - checagem de jogadas legais.

- **Interface React**:

  - Arquivo principal:  
    `frontend/src/App.tsx`

  - Responsável por:
    - renderizar o tabuleiro macro/micro;
    - integrar cliques no tabuleiro com a lógica de domínio (`applyMove`);
    - destacar o tabuleiro onde é permitido jogar;
    - exibir o jogador da vez como:
      - **“Vez do Círculo”** (O) – vermelho neon;
      - **“Vez do X”** (X) – azul neon;
    - oferecer botão de **toggle entre tema claro/escuro**.

- **Visual / UX**:

  - Tema **light/dark** com botão:
    - `app--light` (fundo claro);
    - `app--dark` (fundo escuro com gradiente).
  - Estilo **neon**:
    - Círculo (O) em vermelho neon;
    - X em azul neon;
    - micro-tabuleiros destacados quando são o destino obrigatório da próxima jogada.
  - Layout estável:
    - uso de `aspect-ratio` nas células;
    - remoção de elementos que “inflam” o bloco ao clicar;
    - micro-tabuleiros não mudam de tamanho quando uma jogada é feita.

> Ainda **não** implementado nesta fase:
> - nomes dos jogadores com cache em `localStorage`;
> - ranking de partidas;
> - modo sobrevivência (timer de 10 segundos por jogada).

Esses pontos já fazem parte do **roadmap** descrito abaixo.

---

## Regras do jogo (Ultimate Tic-Tac-Toe)

Resumo das regras implementadas/contempladas:

- Tabuleiro **macro** 3×3 (9 macro-campos).

- Cada macro-campo contém um **micro-tabuleiro** 3×3 (9 micro-casas).

- **Primeira jogada**:
  - Jogador X começa, podendo jogar em **qualquer micro-casa de qualquer micro-tabuleiro**.

- **Regra de envio**:
  - A posição em que o jogador joga (ex.: canto superior esquerdo, centro, canto inferior direito) define **em qual macro-campo** o próximo jogador é obrigado a jogar:
    - Exemplo: se X joga na posição “canto superior esquerdo” (índice 0) de qualquer micro-tabuleiro, O é enviado para o macro-campo “canto superior esquerdo”.

- **Vitória no micro-tabuleiro**:
  - Quando um jogador vence um micro-tabuleiro:
    - aquele macro-campo é considerado “ganho” por ele no contexto do tabuleiro macro;
    - o micro-tabuleiro **ainda pode receber jogadas** até encher, para preservar a dinâmica de envio.

- **Vitória no macro-tabuleiro**:
  - Vence a partida quem completar **linha, coluna ou diagonal** no tabuleiro macro (considerando apenas os macro-campos ganhos).

- **Regra de escape**:
  - Se o macro-campo para onde o próximo jogador deveria ser enviado **já estiver cheio**, o jogador pode jogar em **qualquer micro-casa livre** do tabuleiro.

- **Modo sobrevivência (planejado)**:
  - Quando habilitado:
    - cada jogador terá 10 segundos por jogada;
    - se o tempo estourar, a vez passa para o outro jogador.

- **Ranking (planejado)**:
  - Salvo em `localStorage`;
  - registra:
    - vencedor;
    - perdedor;
    - quantidade de lances;
  - ranking ordenado por vitórias com menos lances.

---

## Stack

### Backend (Go) – planejado / em construção

- Linguagem: **Go >= 1.22**
- HTTP server: `net/http`
- Servir frontend: `embed` para incorporar o build do React no binário
- Estrutura planejada (pode variar levemente, mas a intenção é esta):

```text
backend/
  cmd/server/main.go        # ponto de entrada do servidor Go
  internal/http/            # servidor, rotas, handlers (health, static e futuro API)
  internal/game/            # engine de jogo server-side (multiplayer)
  internal/ai/              # bot/IA para partidas contra máquina
  docs/adr/                 # Architecture Decision Records
```

- Objetivos futuros para o backend:
  - gerenciar salas de jogo (multiplayer);
  - validar jogadas no servidor;
  - intermediar partidas contra bot/IA.

### Frontend (React + Vite)

- **React** para UI e gerenciamento de estado local.
- **Vite** para desenvolvimento e build:
  - usando o bundler padrão estável (sem Rolldown nesta fase).
- **TypeScript** para modelagem forte do domínio (estado do jogo, jogadores, tabuleiros).

Organização básica:

```text
frontend/
  index.html
  vite.config.ts
  src/
    main.tsx
    App.tsx            # componente principal, UI + integração com core
    App.css            # tema, neon, layout do tabuleiro
    game/
      core.ts          # lógica de domínio do Ultimate TTT
```

---

## Gerenciador de pacotes

- **Recomendado**: `pnpm` (instalado globalmente via `npm install -g pnpm`).
- **Alternativa suportada**: `npm`.

Motivos para preferir **pnpm**:

1. **Eficiência de disco**  
   `pnpm` compartilha dependências em um store global, em vez de duplicar pastas inteiras em cada projeto.

2. **Performance**  
   Instalações repetidas são significativamente mais rápidas em ambientes com vários repositórios.

3. **Resolução de módulos mais previsível**  
   Ajuda a identificar dependências implícitas que podem passar despercebidas com `npm`/Yarn clássico.

Ao mesmo tempo:

- Os scripts seguem o padrão (`dev`, `build`, `test`).
- Quem preferir pode usar `npm` sem travar.

---

## Como rodar o frontend (jogo local)

### 1. Clonar o repositório

```bash
git clone https://github.com/jorgediasdsg/ultimate-ttt.git
cd ultimate-ttt
```

### 2. Instalar dependências do frontend

Assumindo que o frontend está em `frontend/`:

```bash
cd frontend

# recomendado
pnpm install

# alternativa
# npm install
```

### 3. Rodar em modo desenvolvimento

```bash
# com pnpm
pnpm dev

# com npm
# npm run dev
```

Por padrão, o Vite sobe em:

```text
http://localhost:5173
```

Abra no navegador e jogue duas pessoas no mesmo dispositivo, alternando X e Círculo de acordo com o indicador “Vez do Círculo / Vez do X”.

---

## Backend Go (quando for implementado)

Quando o backend for implementado, a ideia é:

```bash
cd backend
go run ./cmd/server
```

O servidor Go deverá:

- servir o build do frontend React em produção;
- expor endpoints como:
  - `/health` – checagem de status;
  - futuros endpoints/WebSockets de jogo (multiplayer, bot).

Endereço típico:

```text
http://localhost:8080
```

Enquanto isso não estiver pronto:

- o backend aparece no código como **arquitetura planejada**;
- o foco desta fase é consolidar:
  - a lógica do jogo;
  - a UI/UX local;
  - o material de documentação (README + ADR).

---

## Decisões técnicas (resumo)

- **Monolito Go + React**  
  Em vez de partir direto para microserviços, o projeto começa como um monolito bem organizado:
  - mais simples de rodar;
  - mais fácil de explicar em entrevista;
  - ainda assim preparado para crescer.

- **Lógica de jogo inicialmente no frontend (TypeScript)**  
  Garante uma versão jogável rapidamente, sem bloquear na engine server-side em Go.  
  A arquitetura já considera a futura migração/espelhamento dessa lógica para o backend.

- **Vite usando o bundler estável (sem Rolldown)**  
  Evita gastar tempo com problemas de tooling.  
  O foco é demonstrar boas práticas de engenharia, não testar bundlers experimentais.

- **`pnpm` como gerenciador preferencial, com `npm` suportado**  
  Mostra familiaridade com tooling moderno, sem criar fricção para quem clona o repositório.

Essas decisões estão descritas em mais detalhes no ADR inicial.

---

## Roadmap técnico

1. **Concluir Fase 1 (modo local “bem acabado”)**
   - [ ] Tela para entrada de **nomes dos jogadores**, com:
     - cache em `localStorage`;
     - uso dos nomes na UI em vez de rótulos genéricos.
   - [ ] Botão de **reiniciar partida** mantendo os nomes.
   - [ ] Pequenos refinamentos de UX (feedback visual, mensagens de fim de jogo).

2. **Ranking local (`localStorage`)**
   - [ ] Modelo de dado para ranking:
     - vencedor;
     - perdedor;
     - número de lances;
     - data/hora da partida (opcional).
   - [ ] Tela/painel de ranking:
     - ordenado por vitórias com menos lances;
     - possibilidade de limpar histórico.

3. **Modo sobrevivência**
   - [ ] Timer de 10 segundos por jogada:
     - barra ou contador visual para tempo restante;
     - ao estourar o tempo, passa a vez automaticamente.
   - [ ] Configuração para ativar/desativar o modo sobrevivência.

4. **Protocolo de jogo e engine em Go**
   - [ ] Definição de protocolo JSON para:
     - estado de partida;
     - jogada;
     - mensagens de erro.
   - [ ] Implementar engine de jogo em `backend/internal/game`, espelhando as regras do `core.ts`.
   - [ ] Introduzir, no frontend, interface `GameClient`:
     - `LocalGameClient`: implementação atual (estado no browser);
     - `RemoteGameClient`: comunicação com o servidor Go.

5. **Multiplayer + Bot/IA**
   - [ ] WebSocket/HTTP para sincronizar estado em tempo real entre dois clientes.
   - [ ] Implementar bot em `backend/internal/ai`:
     - heurísticas simples no início;
     - espaço para lógica mais avançada/IA no futuro.
   - [ ] Tela de escolha de modo:
     - vs humano local;
     - vs humano online;
     - vs bot.

---

## ADRs (Architecture Decision Records)

As decisões importantes de arquitetura são registradas em `docs/adr`.

- **ADR 0001 – Monolito Go + React para o Ultimate TTT (modo local, preparado para multiplayer/IA)**  
  Registra:
  - escolha do monolito Go + SPA React;
  - uso de Vite estável sem Rolldown;
  - lógica inicial no frontend;
  - uso recomendado de `pnpm`;
  - visão de evolução para multiplayer e bot.

Novos ADRs devem ser criados para:

- protocolo de jogo;
- engine em Go;
- multiplayer e bot;
- alterações relevantes de arquitetura ou tooling.

---

## Contribuições e evolução

Este projeto funciona como:

- um **laboratório de aprendizado** em Go + React;
- uma **vitrine de práticas** que podem ser discutidas em entrevistas técnicas.

Sugestões, issues e PRs são bem-vindos, desde que:

- expliquem claramente o problema/objetivo;
- mantenham a coerência da arquitetura;
- para mudanças relevantes, venham acompanhadas de um ADR (ou proposta de ADR) que documente:

  - contexto;
  - decisão;
  - alternativas consideradas;
  - consequências.

A ideia é que o repositório sirva tanto como jogo divertido quanto como material de leitura para devs sênior e tech leads avaliando:

- como decisões são tomadas;
- como o código é estruturado;
- como o sistema se prepara para crescer sem explodir em complexidade.
