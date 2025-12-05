// frontend/src/game/core.ts

export type Player = 'X' | 'O';

export type GameMode = 'normal' | 'survival';

export interface MicroBoard {
  // 9 células: índices 0..8
  cells: (Player | null)[];
  winner: Player | null;
  isFull: boolean;
}

export interface MacroBoard {
  boards: MicroBoard[]; // 9 micro-tabuleiros
  winner: Player | null;
}

export interface GameState {
  macroBoard: MacroBoard;
  currentPlayer: Player;
  nextForcedBoardIndex: number | null; // null = pode jogar em qualquer board não cheio
  totalMoves: number;
  isGameOver: boolean;
  mode: GameMode;
}

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function createEmptyMicroBoard(): MicroBoard {
  return {
    cells: Array(9).fill(null),
    winner: null,
    isFull: false,
  };
}

export function createInitialGameState(mode: GameMode = 'normal'): GameState {
  return {
    macroBoard: {
      boards: Array.from({ length: 9 }, () => createEmptyMicroBoard()),
      winner: null,
    },
    currentPlayer: 'X',
    nextForcedBoardIndex: null,
    totalMoves: 0,
    isGameOver: false,
    mode,
  };
}

function checkWinner(cells: (Player | null)[]): Player | null {
  for (const [a, b, c] of WINNING_LINES) {
    const v = cells[a];
    if (v && v === cells[b] && v === cells[c]) {
      return v;
    }
  }
  return null;
}

function updateMicroBoard(board: MicroBoard): MicroBoard {
  const winner = checkWinner(board.cells);
  const isFull = board.cells.every((c) => c !== null);
  return {
    cells: board.cells,
    winner,
    isFull,
  };
}

function computeMacroWinner(boards: MicroBoard[]): Player | null {
  const macroCells: (Player | null)[] = boards.map((b) => b.winner);
  return checkWinner(macroCells);
}

export function getAllowedBoardIndexes(state: GameState): number[] {
  if (state.isGameOver) return [];

  const nonFullBoards = state.macroBoard.boards
    .map((b, idx) => (!b.isFull ? idx : -1))
    .filter((idx) => idx !== -1);

  if (state.nextForcedBoardIndex === null) {
    return nonFullBoards;
  }

  const forced = state.macroBoard.boards[state.nextForcedBoardIndex];
  if (!forced || forced.isFull) {
    // regra: se o board obrigatório estiver cheio, pode jogar em qualquer não cheio
    return nonFullBoards;
  }

  return [state.nextForcedBoardIndex];
}

export function isMoveLegal(
  state: GameState,
  boardIndex: number,
  cellIndex: number,
): boolean {
  if (state.isGameOver) return false;

  const board = state.macroBoard.boards[boardIndex];
  if (!board) return false;

  // célula já ocupada
  if (board.cells[cellIndex] !== null) return false;

  const allowedBoards = getAllowedBoardIndexes(state);
  if (!allowedBoards.includes(boardIndex)) {
    return false;
  }

  return true;
}

export function applyMove(
  state: GameState,
  boardIndex: number,
  cellIndex: number,
): GameState {
  if (!isMoveLegal(state, boardIndex, cellIndex)) {
    // move ilegal → retorna estado atual (UI decide se mostra aviso)
    return state;
  }

  const currentPlayer = state.currentPlayer;

  // atualiza o micro-tabuleiro jogado
  const newBoards: MicroBoard[] = state.macroBoard.boards.map((board, idx) => {
    if (idx !== boardIndex) return board;
    const newCells = board.cells.slice();
    newCells[cellIndex] = currentPlayer;
    return updateMicroBoard({
      ...board,
      cells: newCells,
    });
  });

  const macroWinner = computeMacroWinner(newBoards);

  // calcula para onde o próximo jogador deveria ser enviado
  const targetBoard = newBoards[cellIndex];
  const nextForcedBoardIndex =
    !macroWinner && targetBoard && !targetBoard.isFull ? cellIndex : null;

  const nextPlayer: Player = currentPlayer === 'X' ? 'O' : 'X';

  const nextState: GameState = {
    macroBoard: {
      boards: newBoards,
      winner: macroWinner,
    },
    currentPlayer: nextPlayer,
    nextForcedBoardIndex,
    totalMoves: state.totalMoves + 1,
    isGameOver: macroWinner !== null,
    mode: state.mode,
  };

  return nextState;
}
