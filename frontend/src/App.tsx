// frontend/src/App.tsx
import { useState } from 'react';
import {
  type GameState,
  createInitialGameState,
  applyMove,
  getAllowedBoardIndexes,
} from './game/core';

type Theme = 'light' | 'dark';

function App() {
  const [game, setGame] = useState<GameState>(() =>
    createInitialGameState('normal'),
  );
  const [theme, setTheme] = useState<Theme>('dark');
  const [showInfo, setShowInfo] = useState(false);

  const allowedBoards = getAllowedBoardIndexes(game);

  const handleCellClick = (boardIndex: number, cellIndex: number) => {
    setGame((prev) => applyMove(prev, boardIndex, cellIndex));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isCircleTurn = game.currentPlayer === 'O';

  let statusText = '';
  let statusClass = 'status-message';

  if (game.isGameOver) {
    if (game.macroBoard.winner === 'O') {
      statusText = 'CÍRCULO VENCEU!';
    } else if (game.macroBoard.winner === 'X') {
      statusText = 'X VENCEU!';
    } else if (game.isDraw) {
      statusText = 'DEU VELHA!';
    } else {
      statusText = 'FIM DE JOGO';
    }
    statusClass += ' status-message--end';
  } else {
    statusText = isCircleTurn ? 'VEZ DO CÍRCULO' : 'VEZ DO X';
    statusClass += isCircleTurn
      ? ' status-message--circle'
      : ' status-message--x';
  }

  const winner = game.macroBoard.winner;

  return (
    <div className={`app app--${theme}`}>
      <div className="app-inner">
        <header className="header">
          <div className="header-left">
            <h1 className="app-title">Ultimate TTT</h1>
          </div>
          <div className="header-center">
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? '☾' : '☀︎'}
            </button>
            <button
              className="icon-button icon-button--info"
              onClick={() => setShowInfo(true)}
              aria-label="Regras do jogo"
            >
              ?
            </button>
          </div>
          <div className="header-right">
            <div className={statusClass}>{statusText}</div>
          </div>
        </header>

        <main className="main">
          <div className="board">
            {game.macroBoard.boards.map((board, boardIndex) => {
              const isAllowed = allowedBoards.includes(boardIndex);
              const boardWinner = board.winner;

              let microClasses = 'micro-board';
              // quem venceu
              if (boardWinner === 'X') microClasses += ' micro-board--winner-X';
              if (boardWinner === 'O') microClasses += ' micro-board--winner-O';
              // por último, onde pode jogar (sempre manda na cor)
              if (isAllowed) microClasses += ' micro-board--allowed';

              return (
                <div key={boardIndex} className={microClasses}>
                  <div className="micro-board-grid">
                    {board.cells.map((cell, cellIndex) => {
                      let cellClass = 'cell-btn';
                      if (cell === 'X') cellClass += ' cell-btn--X';
                      if (cell === 'O') cellClass += ' cell-btn--O';

                      return (
                        <button
                          key={cellIndex}
                          className={cellClass}
                          onClick={() => handleCellClick(boardIndex, cellIndex)}
                        >
                          {cell ?? ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Confete quando há vencedor */}
      {winner && (
        <div
          className={`confetti confetti--${winner === 'O' ? 'circle' : 'x'}`}
        >
          {Array.from({ length: 80 }).map((_, i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{
                left: `${(i / 80) * 100}%`,
                animationDelay: `${(i % 10) * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal de regras */}
      {showInfo && (
        <div
          className="modal-backdrop"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Regras do Ultimate TTT</h2>
              <button
                className="modal-close"
                onClick={() => setShowInfo(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                O tabuleiro é um jogo da velha gigante 3×3. Cada casa do tabuleiro
                principal contém um jogo da velha menor (3×3).
              </p>
              <ol>
                <li>
                  O primeiro jogador (X) pode jogar em qualquer casa de qualquer
                  tabuleiro menor.
                </li>
                <li>
                  A posição onde ele joga define em qual tabuleiro menor o próximo
                  jogador é obrigado a jogar.
                  <br />
                  Exemplo: se X jogar no canto superior esquerdo de um tabuleiro
                  menor, o próximo jogador será enviado para o tabuleiro do canto
                  superior esquerdo no tabuleiro principal.
                </li>
                <li>
                  Quando alguém ganha um tabuleiro menor, aquela casa do tabuleiro
                  principal passa a contar como vitória daquele jogador.
                </li>
                <li>
                  Ganha o jogo quem fizer linha, coluna ou diagonal no tabuleiro
                  principal (considerando os tabuleiros menores vencidos).
                </li>
                <li>
                  Se o tabuleiro para onde o próximo jogador deveria ser enviado
                  já estiver cheio, ele pode jogar em qualquer tabuleiro menor
                  ainda com casas livres.
                </li>
                <li>
                  Se todos os tabuleiros menores estiverem cheios e ninguém tiver
                  vencido o tabuleiro principal, o jogo termina em <strong>velha</strong>.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
