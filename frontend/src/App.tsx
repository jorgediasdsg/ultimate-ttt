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

  const allowedBoards = getAllowedBoardIndexes(game);

  const handleCellClick = (boardIndex: number, cellIndex: number) => {
    setGame((prev) => applyMove(prev, boardIndex, cellIndex));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isCircleTurn = game.currentPlayer === 'O';
  const currentLabel = isCircleTurn ? 'VEZ DO CÍRCULO' : 'VEZ DO X';
  const currentPlayerClass = isCircleTurn
    ? 'current-player current-player--circle'
    : 'current-player current-player--x';

  return (
    <div className={`app app--${theme}`}>
      <div className="app-inner">
        <button className="theme-toggle" onClick={toggleTheme}>
          Tema: {theme === 'dark' ? 'Escuro' : 'Claro'}
        </button>

        <h1 className="app-title">Ultimate TTT</h1>

        <div className={currentPlayerClass}>{currentLabel}</div>

        <div className="board">
          {game.macroBoard.boards.map((board, boardIndex) => {
            const isAllowed = allowedBoards.includes(boardIndex);
            const winner = board.winner;

            let microClasses = 'micro-board';
            // primeiro quem venceu
            if (winner === 'X') microClasses += ' micro-board--winner-X';
            if (winner === 'O') microClasses += ' micro-board--winner-O';
            // por último, o campo jogável (sempre manda na cor)
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

        {game.isGameOver && game.macroBoard.winner && (
          <div className="game-over">
            Fim de jogo! Venceu o{' '}
            {game.macroBoard.winner === 'O' ? 'Círculo' : 'X'}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
