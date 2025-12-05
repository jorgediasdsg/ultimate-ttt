import { useState } from 'react';
import {
  type GameState,
  createInitialGameState,
  applyMove,
  getAllowedBoardIndexes,
} from './game/core';

function App() {
  const [game, setGame] = useState<GameState>(() =>
    createInitialGameState('normal'),
  );

  const allowedBoards = getAllowedBoardIndexes(game);

  const handleCellClick = (boardIndex: number, cellIndex: number) => {
    setGame((prev) => applyMove(prev, boardIndex, cellIndex));
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'system-ui' }}>
      <h1>Ultimate TTT</h1>
      <p>
        Jogador da vez:{' '}
        <strong>{game.currentPlayer === 'X' ? 'Jogador 1' : 'Jogador 2'}</strong>
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          maxWidth: 600,
        }}
      >
        {game.macroBoard.boards.map((board, boardIndex) => {
          const isAllowed = allowedBoards.includes(boardIndex);
          return (
            <div
              key={boardIndex}
              style={{
                border: '2px solid',
                borderColor: isAllowed ? 'green' : '#ccc',
                opacity: isAllowed ? 1 : 0.5,
                padding: '4px',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '4px',
                }}
              >
                {board.cells.map((cell, cellIndex) => (
                  <button
                    key={cellIndex}
                    style={{
                      aspectRatio: '1 / 1',
                      width: '100%',
                      fontSize: '1.5rem',
                    }}
                    onClick={() => handleCellClick(boardIndex, cellIndex)}
                  >
                    {cell ?? ''}
                  </button>
                ))}
              </div>
              {board.winner && (
                <div style={{ marginTop: '4px', textAlign: 'center' }}>
                  <strong>Vencedor: {board.winner}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {game.isGameOver && game.macroBoard.winner && (
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
          Fim de jogo! Vencedor no macro: {game.macroBoard.winner}
        </p>
      )}
    </div>
  );
}

export default App;
