# Ultimate TTT – Jogo da Velha 2.0 em Go + React

Projeto de estudo e vitrine técnica: uma implementação do “Ultimate Tic-Tac-Toe” (Jogo da Velha 2.0) usando **Go** no backend e **React** no frontend, com foco em boas práticas, arquitetura limpa e espaço claro para evoluir para **multiplayer** e **bot com IA** no futuro.

---

## Objetivos

* Treinar e demonstrar proficiência em:

  * **Go** (estrutura de projeto, servidor HTTP, organização em `cmd/` e `internal/`, ADRs).
  * **React** (estado do jogo, UX, uso de `localStorage`).
  * Criar uma base que hoje funciona em **modo local** (single device) e esteja preparada para:

  * **multiplayer** via servidor Go remoto;
  * **jogador vs bot** com lógica de IA no backend.
* Entregar um repositório que um recrutador/tech lead consiga ler e ver:

  * disciplina arquitetural;
  * clareza de decisões;
  * código jogável, não só slide bonito.

---

## Regras do jogo (Ultimate TTT – Jogo da Velha 2.0)

* Tabuleiro **macro** 3×3 (9 macro-campos).
* Cada macro-campo contém um **micro-tabuleiro** 3×3 (9 micro-casas).
* Jogador 1 começa podendo jogar em **qualquer micro-casa de qualquer micro-tabuleiro**.
* A posição em que o jogador joga (ex.: canto superior esquerdo, centro, etc.) define **em qual macro-campo** o próximo jogador é obrigado a jogar.
* Quando um jogador vence um micro-tabuleiro, o macro-campo correspondente é marcado para aquele jogador no tabuleiro macro.
* O micro-tabuleiro continua recebendo jogadas até encher, mesmo depois de “ganho”.
* Vence a partida quem completar uma linha/coluna/diagonal no **tabuleiro macro**.
* Se o macro-campo para onde o próximo jogador deveria jogar **já estiver cheio**, ele pode jogar em **qualquer casa livre** do tabuleiro.
* No início do jogo:

  * são perguntados os nomes dos dois jogadores;
  * os nomes são salvos em cache (localStorage) para próximas partidas.
* A UI mostra sempre **quem é o jogador da vez**, usando os nomes informados.

### Ranking

* Salvo em `localStorage`.
* Para cada partida, registra:

  * vencedor;
  * perdedor;
  * quantidade de lances.
* Ranking ordenado por **vitórias com menos lances**.

### Modo sobrevivência

* Modo opcional.
* Quando habilitado:

  * cada jogador tem **10 segundos** para jogar;
  * se o tempo estourar, a vez é automaticamente passada para o outro jogador.

---

## Stack

### Backend (Go)

* Go >= 1.22
* `net/http` para o servidor HTTP.
* `embed` para servir o build do React como arquivos estáticos.
* Estrutura monolítica organizada:

  * `cmd/server` – ponto de entrada da aplicação.
  * `internal/http` – servidor, rotas, handlers.
  * `internal/game` – (futuro) engine de jogo para multiplayer/IA.
  * `internal/ai` – (futuro) bot de jogo.

### Frontend (React)

* React + Vite.
* (Opcional, recomendado) TypeScript.
* `localStorage` para:

  * nomes dos jogadores;
  * ranking de vitórias.
* Arquitetura pensada para dois tipos de cliente:

  * **LocalGameClient** – implementação atual, com estado todo no browser.
  * **RemoteGameClient** – futura implementação, falando com o servidor Go (HTTP/WebSocket).

### Ferramentas

* Gerenciador de pacotes recomendado: **pnpm**.
* Alternativa suportada: **npm** (para quem não usa pnpm).
* Controle de versão: Git + GitHub.

---

## Estrutura (proposta)

Exemplo de estrutura de diretórios (pode variar ligeiramente conforme evolução):

* `backend/`

  * `cmd/server/main.go`
  * `internal/http/…`
  * `internal/game/…`
  * `internal/ai/…`
  * `docs/adr/…`
* `frontend/`

  * `index.html`
  * `src/` (componentes React, lógica de jogo, etc.)
  * `vite.config.ts` / `vite.config.js`

---

## Instalação do `pnpm` (Mac Apple Silicon)

Escolha **uma** forma de instalar e mantenha consistência no seu ambiente.

### 1. Via `npm` (direto, funciona na maioria dos cenários)

```bash
npm install -g pnpm
pnpm -v
```

### 2. Via Homebrew

```bash
brew install pnpm
pnpm -v
```

### 3. Via Corepack (Node 18+, **somente se estiver estável no seu ambiente**)

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```

Se uma abordagem der erro (por exemplo, Corepack com problema de assinatura), use outra (npm global ou Homebrew).

---

## Como rodar o projeto

### 1. Clonar o repositório

```bash
git clone [https://github.com/jorgediasdsg/ultimate-ttt.git](https://github.com/jorgediasdsg/ultimate-ttt.git)
cd ultimate-ttt
```

### 2. Frontend (React)

Assumindo que o frontend está em `frontend/`:

```bash
cd frontend
pnpm install
pnpm dev
```

Alternativa com `npm`:

```bash
npm install
npm run dev
```

Por padrão, o Vite roda em algo como:

```text
[http://localhost:5173](http://localhost:5173)
```

(ajuste conforme a configuração do projeto).

### 3. Backend (Go)

Em outro terminal, na raiz do projeto ou em `backend/` (ajuste para o layout real):

```bash
cd backend   # ou . se o Go estiver na raiz
go run ./cmd/server
```

Depois disso, o servidor Go deve:

* Servir o build do React em produção **ou**
* Fazer proxy para o dev server do Vite, dependendo da fase em que o projeto estiver.

O endereço típico será:

```text
[http://localhost:8080](http://localhost:8080)
```

---

## Decisão: por que `pnpm`?

Este projeto recomenda `pnpm` como gerenciador de pacotes do frontend pelos seguintes motivos:

1. **Eficiência de disco**
   `pnpm` utiliza um store global e links em vez de duplicar dependências em cada projeto, reduzindo bastante o uso de espaço.

2. **Performance em múltiplos projetos**
   Instalações repetidas em vários repositórios são significativamente mais rápidas do que com o npm tradicional.

3. **Estrutura de `node_modules` mais correta**
   O modelo de resolução de módulos é mais previsível e expõe dependências implícitas que às vezes passam despercebidas no npm/Yarn clássico.

Apesar disso, para não criar barreira de entrada:

* Todos os scripts seguem a convenção padrão (`dev`, `build`, `test`).
* O projeto continua compatível com `npm`.

---

## Visão de arquitetura (alto nível)

### Hoje – modo local (single device)

* Toda a lógica do jogo roda no frontend React:

  * tabuleiro macro/micro;
  * regras de restrição de jogadas;
  * vitória em micro e macro tabuleiro;
  * modo sobrevivência (timer de 10s);
  * ranking e nomes dos jogadores em `localStorage`.
* O backend em Go:

  * serve o build estático do React;
  * expõe endpoints básicos, como `/health` para checagem de status.

### Amanhã – multiplayer e bot

* O frontend passa a conversar com um **servidor Go remoto** por HTTP/WebSocket através de um `RemoteGameClient`.
* O backend centraliza:

  * estado das partidas (salas, jogadores conectados);
  * validação das jogadas;
  * lógica do bot/IA.
* A engine de jogo em `internal/game` passa a ser a “fonte da verdade” das regras.

---

## Roadmap técnico (resumido)

1. **Fase 1 – Local single-player**

   * UI completa em React.
   * Lógica de jogo (Ultimate TTT) no frontend.
   * Ranking em `localStorage`.
   * Go servindo o build do frontend.

2. **Fase 2 – Protocolo de jogo**

   * Definir mensagens JSON para representar estado de jogo e jogadas.
   * Criar uma interface `GameClient` no frontend (`LocalGameClient` vs `RemoteGameClient`).

3. **Fase 3 – Multiplayer básico**

   * Backend Go com rotas HTTP/WebSocket.
   * `RemoteGameClient` no React usando o servidor Go.

4. **Fase 4 – Bot / IA**

   * Implementar um jogador bot em Go (`internal/ai`).
   * Expor modo “vs bot” para o usuário escolher no frontend.

---

## ADRs (Architecture Decision Records)

As decisões arquiteturais importantes são registradas em `docs/adr`.

Exemplo de ADR inicial:

* `0001-monolith-go-react-local-game.md`
  Decisão de usar um monolito em Go servindo um frontend React, com jogo local no browser e preparação explícita para multiplayer e bot.

Cada nova mudança relevante de arquitetura deve ser acompanhada por um novo ADR (ou atualização de ADR existente), sempre explicando:

* contexto;
* decisão;
* alternativas consideradas;
* consequências.

---

## Scripts úteis

### Frontend

```bash

# instalar dependências

pnpm install

# rodar em desenvolvimento

pnpm dev

# build para produção

pnpm build

# rodar testes (se configurado)

pnpm test
```

### Backend

```bash

# rodar servidor Go

go run ./cmd/server

# rodar testes Go

go test ./...
```

---

## Contribuições / Evolução

Este projeto é, ao mesmo tempo:

* um laboratório de aprendizado em Go + React;
* uma vitrine de boas práticas de engenharia.

Pull requests, issues e ADRs adicionais são bem-vindos, desde que:

* descrevam claramente o problema/objetivo;
* mantenham a coerência da arquitetura;
* preservem a separação de responsabilidades entre frontend (UI/experiência) e backend (regra de negócio, multiplayer, IA).
