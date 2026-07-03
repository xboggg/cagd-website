import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Props {
  onClose?: () => void;
}

interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  mergedFrom?: boolean;
  isNew?: boolean;
}

type Grid = (Tile | null)[][];
type Direction = "up" | "down" | "left" | "right";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SIZE = 4;
const LS_KEY = "cagd_2048_best";

let tileIdCounter = 0;
const nextId = () => ++tileIdCounter;

/* Tile colour palette – professional government aesthetic (greens / teals / golds) */
const TILE_STYLES: Record<number, { bg: string; text: string; scale?: boolean }> = {
  2:    { bg: "hsl(160, 40%, 92%)", text: "hsl(160, 30%, 30%)" },
  4:    { bg: "hsl(160, 42%, 84%)", text: "hsl(160, 30%, 25%)" },
  8:    { bg: "hsl(165, 50%, 65%)", text: "hsl(0, 0%, 100%)" },
  16:   { bg: "hsl(170, 55%, 50%)", text: "hsl(0, 0%, 100%)" },
  32:   { bg: "hsl(175, 60%, 42%)", text: "hsl(0, 0%, 100%)" },
  64:   { bg: "hsl(180, 65%, 35%)", text: "hsl(0, 0%, 100%)" },
  128:  { bg: "hsl(50, 85%, 58%)",  text: "hsl(40, 50%, 18%)", scale: true },
  256:  { bg: "hsl(45, 90%, 52%)",  text: "hsl(35, 50%, 15%)", scale: true },
  512:  { bg: "hsl(40, 92%, 48%)",  text: "hsl(0, 0%, 100%)",  scale: true },
  1024: { bg: "hsl(35, 95%, 45%)",  text: "hsl(0, 0%, 100%)",  scale: true },
  2048: { bg: "hsl(30, 100%, 50%)", text: "hsl(0, 0%, 100%)",  scale: true },
};

const defaultTileStyle = { bg: "hsl(25, 100%, 45%)", text: "hsl(0, 0%, 100%)", scale: true };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.map((t) => (t ? { ...t } : null)));
}

function emptyCells(grid: Grid): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!grid[r][c]) cells.push([r, c]);
  return cells;
}

function addRandomTile(grid: Grid): Grid {
  const cells = emptyCells(grid);
  if (cells.length === 0) return grid;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  grid[r][c] = { id: nextId(), value, row: r, col: c, isNew: true };
  return grid;
}

function initGrid(): Grid {
  let grid = emptyGrid();
  addRandomTile(grid);
  addRandomTile(grid);
  return grid;
}

/* Slide a single row to the left, returning { row, score } */
function slideRow(row: (Tile | null)[]): { row: (Tile | null)[]; score: number } {
  const tiles = row.filter(Boolean) as Tile[];
  const result: (Tile | null)[] = [];
  let score = 0;
  let i = 0;
  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i].value === tiles[i + 1].value) {
      const merged: Tile = {
        id: nextId(),
        value: tiles[i].value * 2,
        row: 0,
        col: 0,
        mergedFrom: true,
      };
      score += merged.value;
      result.push(merged);
      i += 2;
    } else {
      result.push({ ...tiles[i] });
      i += 1;
    }
  }
  while (result.length < SIZE) result.push(null);
  return { row: result, score };
}

function rotateGrid(grid: Grid, times: number): Grid {
  let g = cloneGrid(grid);
  for (let t = 0; t < times; t++) {
    const ng = emptyGrid();
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) ng[c][SIZE - 1 - r] = g[r][c];
    g = ng;
  }
  return g;
}

function move(grid: Grid, dir: Direction): { grid: Grid; score: number; moved: boolean } {
  const rotations: Record<Direction, number> = { left: 0, up: 1, right: 2, down: 3 };
  const unrotations: Record<Direction, number> = { left: 0, up: 3, right: 2, down: 1 };

  let g = rotateGrid(grid, rotations[dir]);
  let totalScore = 0;
  let moved = false;

  for (let r = 0; r < SIZE; r++) {
    const { row: newRow, score } = slideRow(g[r]);
    totalScore += score;
    for (let c = 0; c < SIZE; c++) {
      const before = g[r][c];
      const after = newRow[c];
      if (before?.value !== after?.value || (before === null) !== (after === null)) moved = true;
    }
    g[r] = newRow;
  }

  g = rotateGrid(g, unrotations[dir]);
  // Fix row/col references
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (g[r][c]) {
        g[r][c]!.row = r;
        g[r][c]!.col = c;
      }

  return { grid: g, score: totalScore, moved };
}

function canMove(grid: Grid): boolean {
  if (emptyCells(grid).length > 0) return true;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r][c]?.value;
      if (c + 1 < SIZE && grid[r][c + 1]?.value === v) return true;
      if (r + 1 < SIZE && grid[r + 1][c]?.value === v) return true;
    }
  return false;
}

function flatTiles(grid: Grid): Tile[] {
  const tiles: Tile[] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c]) tiles.push(grid[r][c]!);
  return tiles;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Game2048({ onClose }: Props) {
  const [grid, setGrid] = useState<Grid>(initGrid);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(LS_KEY)) || 0;
    } catch {
      return 0;
    }
  });
  const [gameOver, setGameOver] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  /* Persist best score */
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, String(best));
    } catch {
      /* ignore */
    }
  }, [best]);

  /* Process a direction */
  const handleMove = useCallback(
    (dir: Direction) => {
      if (gameOver) return;
      setGrid((prev) => {
        const { grid: newGrid, score: gained, moved } = move(prev, dir);
        if (!moved) return prev;
        addRandomTile(newGrid);
        setScore((s) => {
          const ns = s + gained;
          setBest((b) => Math.max(b, ns));
          return ns;
        });
        if (!canMove(newGrid)) {
          setTimeout(() => setGameOver(true), 300);
        }
        return newGrid;
      });
    },
    [gameOver]
  );

  /* Keyboard */
  useEffect(() => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    const handler = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        handleMove(dir);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleMove]);

  /* Touch / swipe */
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const threshold = 30;
    if (Math.max(absDx, absDy) < threshold) return;
    if (absDx > absDy) handleMove(dx > 0 ? "right" : "left");
    else handleMove(dy > 0 ? "down" : "up");
    touchStart.current = null;
  };

  /* New game */
  const newGame = () => {
    tileIdCounter = 0;
    setGrid(initGrid());
    setScore(0);
    setGameOver(false);
  };

  /* Tile style helper */
  const tileStyle = (value: number) => TILE_STYLES[value] ?? defaultTileStyle;

  const tiles = flatTiles(grid);

  /* Cell size responsive: 72px desktop, smaller on mobile via CSS */
  const cellGap = 8; // px gap between cells

  return (
    <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-4">
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-teal-800">
          2048
        </h1>
        <div className="w-16" /> {/* spacer */}
      </div>

      {/* Score row */}
      <div className="flex gap-3 mb-4 w-full justify-center">
        <div className="flex flex-col items-center bg-teal-700 text-white rounded-lg px-5 py-2 min-w-[90px] shadow">
          <span className="text-[11px] uppercase tracking-wider font-semibold opacity-80">
            Score
          </span>
          <span className="text-xl font-bold">{score}</span>
        </div>
        <div className="flex flex-col items-center bg-teal-800 text-white rounded-lg px-5 py-2 min-w-[90px] shadow">
          <span className="text-[11px] uppercase tracking-wider font-semibold opacity-80">
            Best
          </span>
          <span className="text-xl font-bold">{best}</span>
        </div>
        <button
          onClick={newGame}
          className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold rounded-lg px-5 py-2 shadow transition-all"
        >
          New Game
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Use arrow keys or swipe to combine tiles and reach <strong>2048</strong>!
      </p>

      {/* Board */}
      <div
        ref={boardRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative rounded-xl shadow-lg"
        style={{
          background: "hsl(170, 20%, 30%)",
          padding: cellGap,
          display: "grid",
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          gap: cellGap,
          width: "min(100%, 340px)",
          aspectRatio: "1 / 1",
          touchAction: "none",
        }}
      >
        {/* Background cells */}
        {Array.from({ length: SIZE * SIZE }).map((_, i) => (
          <div
            key={`bg-${i}`}
            className="rounded-md"
            style={{ background: "hsl(170, 15%, 38%)", aspectRatio: "1" }}
          />
        ))}

        {/* Tiles layer (absolutely positioned on top of background cells) */}
        <AnimatePresence>
          {tiles.map((tile) => {
            const style = tileStyle(tile.value);
            const fontSize =
              tile.value >= 1024
                ? "clamp(16px, 4.5vw, 22px)"
                : tile.value >= 128
                ? "clamp(18px, 5vw, 26px)"
                : "clamp(22px, 6vw, 32px)";

            /* Calculate position as percentage */
            const leftPct = ((tile.col * (100 + (cellGap * 100) / (340 - cellGap * 2))) / SIZE);
            const topPct = ((tile.row * (100 + (cellGap * 100) / (340 - cellGap * 2))) / SIZE);

            return (
              <motion.div
                key={tile.id}
                initial={
                  tile.isNew
                    ? { scale: 0, opacity: 0 }
                    : tile.mergedFrom
                    ? { scale: 0.8 }
                    : false
                }
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  duration: 0.15,
                }}
                className="absolute rounded-md flex items-center justify-center font-extrabold"
                style={{
                  background: style.bg,
                  color: style.text,
                  fontSize,
                  /* Position tile over the correct cell using calc() */
                  width: `calc((100% - ${cellGap * (SIZE + 1)}px) / ${SIZE})`,
                  height: `calc((100% - ${cellGap * (SIZE + 1)}px) / ${SIZE})`,
                  left: `calc(${cellGap}px + ${tile.col} * ((100% - ${cellGap * (SIZE + 1)}px) / ${SIZE} + ${cellGap}px))`,
                  top: `calc(${cellGap}px + ${tile.row} * ((100% - ${cellGap * (SIZE + 1)}px) / ${SIZE} + ${cellGap}px))`,
                  boxShadow:
                    style.scale
                      ? "0 0 12px 2px hsla(45, 80%, 60%, 0.35)"
                      : "0 1px 3px rgba(0,0,0,0.15)",
                  zIndex: tile.mergedFrom ? 2 : 1,
                }}
              >
                {tile.value}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Game over overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-xl flex flex-col items-center justify-center z-10"
              style={{ background: "hsla(170, 20%, 20%, 0.75)" }}
            >
              <span className="text-white text-2xl font-bold mb-3">
                Game Over!
              </span>
              <span className="text-teal-200 mb-4">
                Final score: <strong>{score}</strong>
              </span>
              <button
                onClick={newGame}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-6 py-2 shadow transition-all active:scale-95"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
