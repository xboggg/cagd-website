import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type CellValue = 'X' | 'O' | null;
type Board = CellValue[];
type Difficulty = 'easy' | 'medium' | 'hard';

interface Scores {
  wins: number;
  losses: number;
  draws: number;
}

interface TicTacToeProps {
  onClose?: () => void;
}

const STORAGE_KEY = 'cagd_ttt_scores';

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

function getWinningLine(board: Board): number[] | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }
  return null;
}

function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

function getAvailableMoves(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, i) => {
    if (cell === null) acc.push(i);
    return acc;
  }, []);
}

// Minimax with alpha-beta pruning
function minimax(
  board: Board,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): number {
  const winner = getWinningLine(board);
  if (winner) {
    const winnerMark = board[winner[0]];
    return winnerMark === 'O' ? 10 : -10;
  }
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const move of getAvailableMoves(board)) {
      board[move] = 'O';
      best = Math.max(best, minimax(board, false, alpha, beta));
      board[move] = null;
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of getAvailableMoves(board)) {
      board[move] = 'X';
      best = Math.min(best, minimax(board, true, alpha, beta));
      board[move] = null;
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getBestMove(board: Board): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (const move of getAvailableMoves(board)) {
    board[move] = 'O';
    const score = minimax(board, false, -Infinity, Infinity);
    board[move] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

function getRandomMove(board: Board): number {
  const available = getAvailableMoves(board);
  return available[Math.floor(Math.random() * available.length)];
}

function getAIMove(board: Board, difficulty: Difficulty): number {
  if (difficulty === 'easy') {
    return getRandomMove(board);
  }
  if (difficulty === 'medium') {
    return Math.random() < 0.5 ? getBestMove(board) : getRandomMove(board);
  }
  return getBestMove(board);
}

function loadScores(): Scores {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Scores;
  } catch {
    // ignore
  }
  return { wins: 0, losses: 0, draws: 0 };
}

function saveScores(scores: Scores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

// --- Sub-components ---

function XMark() {
  return (
    <motion.svg
      viewBox="0 0 50 50"
      className="w-10 h-10 sm:w-14 sm:h-14"
      initial="hidden"
      animate="visible"
    >
      <motion.line
        x1="10" y1="10" x2="40" y2="40"
        stroke="#059669"
        strokeWidth="5"
        strokeLinecap="round"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
      <motion.line
        x1="40" y1="10" x2="10" y2="40"
        stroke="#059669"
        strokeWidth="5"
        strokeLinecap="round"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.15 }}
      />
    </motion.svg>
  );
}

function OMark() {
  return (
    <motion.svg
      viewBox="0 0 50 50"
      className="w-10 h-10 sm:w-14 sm:h-14"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="25"
        cy="25"
        r="15"
        fill="none"
        stroke="#0d9488"
        strokeWidth="5"
        strokeLinecap="round"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}

// --- Main Component ---

export default function TicTacToe({ onClose }: TicTacToeProps) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [scores, setScores] = useState<Scores>(loadScores);
  const [gameOver, setGameOver] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Your turn — you are X');
  const [winLine, setWinLine] = useState<number[] | null>(null);

  // Persist scores
  useEffect(() => {
    saveScores(scores);
  }, [scores]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setStatusMsg('Your turn — you are X');
    setWinLine(null);
  }, []);

  const resetScores = useCallback(() => {
    const fresh = { wins: 0, losses: 0, draws: 0 };
    setScores(fresh);
    saveScores(fresh);
  }, []);

  // AI move
  useEffect(() => {
    if (isPlayerTurn || gameOver) return;

    const timer = setTimeout(() => {
      const newBoard = [...board] as Board;
      const move = getAIMove(newBoard, difficulty);
      if (move === -1 || move === undefined) return;
      newBoard[move] = 'O';
      setBoard(newBoard);

      const winningLine = getWinningLine(newBoard);
      if (winningLine) {
        setWinLine(winningLine);
        setGameOver(true);
        setStatusMsg('Computer wins!');
        setScores((s) => ({ ...s, losses: s.losses + 1 }));
      } else if (isBoardFull(newBoard)) {
        setGameOver(true);
        setStatusMsg("It's a draw!");
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      } else {
        setIsPlayerTurn(true);
        setStatusMsg('Your turn — you are X');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isPlayerTurn, gameOver, board, difficulty]);

  const handleCellClick = (index: number) => {
    if (!isPlayerTurn || gameOver || board[index]) return;

    const newBoard = [...board] as Board;
    newBoard[index] = 'X';
    setBoard(newBoard);

    const winningLine = getWinningLine(newBoard);
    if (winningLine) {
      setWinLine(winningLine);
      setGameOver(true);
      setStatusMsg('You win!');
      setScores((s) => ({ ...s, wins: s.wins + 1 }));
    } else if (isBoardFull(newBoard)) {
      setGameOver(true);
      setStatusMsg("It's a draw!");
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
    } else {
      setIsPlayerTurn(false);
      setStatusMsg('Computer is thinking...');
    }
  };

  const difficultyLabels: Record<Difficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 sm:p-6 bg-white rounded-2xl shadow-lg max-w-sm w-full mx-auto relative">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
        Tic Tac Toe
      </h2>

      {/* Difficulty selector */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d);
              resetGame();
            }}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
              difficulty === d
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-emerald-700'
            }`}
          >
            {difficultyLabels[d]}
          </button>
        ))}
      </div>

      {/* Scoreboard */}
      <div className="flex gap-4 text-center text-sm">
        <div className="px-3 py-1 rounded-lg bg-emerald-50">
          <div className="font-semibold text-emerald-700">{scores.wins}</div>
          <div className="text-emerald-600 text-xs">Wins</div>
        </div>
        <div className="px-3 py-1 rounded-lg bg-gray-50">
          <div className="font-semibold text-gray-700">{scores.draws}</div>
          <div className="text-gray-500 text-xs">Draws</div>
        </div>
        <div className="px-3 py-1 rounded-lg bg-red-50">
          <div className="font-semibold text-red-600">{scores.losses}</div>
          <div className="text-red-500 text-xs">Losses</div>
        </div>
      </div>

      {/* Status */}
      <motion.p
        key={statusMsg}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm font-medium ${
          statusMsg.includes('win')
            ? 'text-emerald-600'
            : statusMsg.includes('Computer wins')
              ? 'text-red-500'
              : statusMsg.includes('draw')
                ? 'text-gray-600'
                : 'text-teal-700'
        }`}
      >
        {statusMsg}
      </motion.p>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => {
          const isWinCell = winLine?.includes(i);
          return (
            <motion.button
              key={i}
              onClick={() => handleCellClick(i)}
              whileHover={!cell && !gameOver ? { scale: 1.05 } : {}}
              whileTap={!cell && !gameOver ? { scale: 0.95 } : {}}
              animate={
                isWinCell
                  ? {
                      scale: [1, 1.08, 1],
                      boxShadow: [
                        '0 0 0px rgba(16,185,129,0)',
                        '0 0 16px rgba(16,185,129,0.5)',
                        '0 0 8px rgba(16,185,129,0.25)',
                      ],
                    }
                  : {}
              }
              transition={
                isWinCell
                  ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                  : {}
              }
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center transition-colors ${
                isWinCell
                  ? 'bg-emerald-100 border-2 border-emerald-400'
                  : cell
                    ? 'bg-gray-50 border-2 border-gray-200'
                    : 'bg-gray-50 border-2 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer'
              }`}
              disabled={!!cell || gameOver}
              aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ''}`}
            >
              <AnimatePresence mode="wait">
                {cell === 'X' && (
                  <motion.div
                    key="x"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    <XMark />
                  </motion.div>
                )}
                {cell === 'O' && (
                  <motion.div
                    key="o"
                    initial={{ scale: 0, rotate: 90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    <OMark />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-1">
        <button
          onClick={resetGame}
          className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          New Game
        </button>
        <button
          onClick={resetScores}
          className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset Scores
        </button>
      </div>
    </div>
  );
}
