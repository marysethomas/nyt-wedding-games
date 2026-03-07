import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Link } from "react-router";

// ── Puzzle config ────────────────────────────────────────────────────────────
// Grid: 5x5. '#' = black cell. Letters are the solution.
const SOLUTION: string[][] = [
  ["B", "A", "G", "E", "L"],
  ["R", "#", "R", "#", "Y"],
  ["A", "M", "O", "U", "R"],
  ["I", "#", "O", "#", "I"],
  ["N", "O", "M", "I", "C"],
];

const CLUES: {
  across: {
    num: number;
    row: number;
    col: number;
    len: number;
    clue: string;
  }[];
  down: {
    num: number;
    row: number;
    col: number;
    len: number;
    clue: string;
  }[];
} = {
  across: [
    {
      num: 1,
      row: 0,
      col: 0,
      len: 5,
      clue: "Montreal food that often comes with sesame seeds",
    },
    { num: 4, row: 2, col: 0, len: 5, clue: "Love in French" },
    {
      num: 5,
      row: 4,
      col: 0,
      len: 5,
      clue: "What you may wish for during a bad wedding speech",
    },
  ],
  down: [
    {
      num: 1,
      row: 0,
      col: 0,
      len: 5,
      clue: "Maryse and Francis both studied this",
    },
    {
      num: 2,
      row: 0,
      col: 2,
      len: 5,
      clue: "One of two standing at the altar",
    },
    {
      num: 3,
      row: 0,
      col: 4,
      len: 5,
      clue: "'My love has come along' to Etta James",
    },
  ],
};

// Build number map
type NumberMap = { [key: string]: number };
function buildNumbers(): NumberMap {
  const map: NumberMap = {};
  let n = 1;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (SOLUTION[r][c] === "#") continue;
      const startsAcross =
        (c === 0 || SOLUTION[r][c - 1] === "#") &&
        c + 1 < 5 &&
        SOLUTION[r][c + 1] !== "#";
      const startsDown =
        (r === 0 || SOLUTION[r - 1][c] === "#") &&
        r + 1 < 5 &&
        SOLUTION[r + 1][c] !== "#";
      if (startsAcross || startsDown) {
        map[`${r},${c}`] = n++;
      }
    }
  }
  return map;
}

const NUMBER_MAP = buildNumbers();
const SIZE = SOLUTION.length;
function cellKey(r: number, c: number) {
  return `${r},${c}`;
}

type Dir = "across" | "down";

export function Mini() {
  const [grid, setGrid] = useState<string[][]>(
    SOLUTION.map((row) =>
      row.map((cell) => (cell === "#" ? "#" : "")),
    ),
  );
  const [selected, setSelected] = useState<{
    r: number;
    c: number;
  } | null>({ r: 0, c: 0 });
  const [direction, setDirection] = useState<Dir>("across");
  const [won, setWon] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [activeClue, setActiveClue] = useState<{
    dir: Dir;
    num: number;
  } | null>({ dir: "across", num: 1 });
  const inputRef = useRef<HTMLInputElement>(null);

  const checkWin = (g: string[][]) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (
          SOLUTION[r][c] !== "#" &&
          g[r][c] !== SOLUTION[r][c]
        )
          return false;
      }
    }
    return true;
  };

  const revealAnswers = () => {
    const newGrid = grid.map((row) => [...row]);

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (
          SOLUTION[r][c] !== "#" &&
          newGrid[r][c] !== SOLUTION[r][c]
        ) {
          newGrid[r][c] = SOLUTION[r][c];
        }
      }
    }

    setGrid(newGrid);
    setRevealed(true);
  };

  const clearPuzzle = () => {
    setGrid(
      SOLUTION.map((row) =>
        row.map((cell) => (cell === "#" ? "#" : "")),
      ),
    );
    setSelected({ r: 0, c: 0 });
    setDirection("across");
    setWon(false);
    setActiveClue({ dir: "across", num: 1 });
    setRevealed(false);
  };

  const [showCorrect, setShowCorrect] = useState(false);

  // Cells highlighted for current word
  const getWordCells = (
    dir: Dir,
    r: number,
    c: number,
  ): [number, number][] => {
    const cells: [number, number][] = [];
    if (dir === "across") {
      let sc = c;
      while (sc > 0 && SOLUTION[r][sc - 1] !== "#") sc--;
      for (let cc = sc; cc < 5 && SOLUTION[r][cc] !== "#"; cc++)
        cells.push([r, cc]);
    } else {
      let sr = r;
      while (sr > 0 && SOLUTION[sr - 1][c] !== "#") sr--;
      for (let rr = sr; rr < 5 && SOLUTION[rr][c] !== "#"; rr++)
        cells.push([rr, c]);
    }
    return cells;
  };

  const wordCells = selected
    ? getWordCells(direction, selected.r, selected.c)
    : [];
  const wordCellSet = new Set(
    wordCells.map(([r, c]) => cellKey(r, c)),
  );

  const advance = (
    r: number,
    c: number,
    dir: Dir,
    g: string[][],
  ) => {
    if (dir === "across") {
      for (let nc = c + 1; nc < 5; nc++) {
        if (SOLUTION[r][nc] !== "#") {
          setSelected({ r, c: nc });
          return;
        }
      }
    } else {
      for (let nr = r + 1; nr < 5; nr++) {
        if (SOLUTION[nr][c] !== "#") {
          setSelected({ r: nr, c });
          return;
        }
      }
    }
  };

  const retreat = (r: number, c: number, dir: Dir) => {
    if (dir === "across") {
      for (let nc = c - 1; nc >= 0; nc--) {
        if (SOLUTION[r][nc] !== "#") {
          setSelected({ r, c: nc });
          return;
        }
      }
    } else {
      for (let nr = r - 1; nr >= 0; nr--) {
        if (SOLUTION[nr][c] !== "#") {
          setSelected({ r: nr, c });
          return;
        }
      }
    }
  };

  const goToNextWord = (dir: Dir, r: number, c: number) => {
    const list = dir === "across" ? CLUES.across : CLUES.down;

    // Find the current word index
    const currentIndex = list.findIndex(
      (cl) =>
        cl.row === wordCells[0][0] &&
        cl.col === wordCells[0][1],
    );

    // Get the next word (wrap around to first)
    const nextIndex =
      currentIndex === -1 || currentIndex + 1 >= list.length
        ? 0
        : currentIndex + 1;

    const nextWord = list[nextIndex];
    if (!nextWord) return;

    // Move to the first cell of the next word
    setSelected({ r: nextWord.row, c: nextWord.col });
  };

  // ── Safe move selection ──
  const moveSelection = (
    dir: "up" | "down" | "left" | "right",
  ) => {
    if (!selected) return;
    let { r, c } = selected;

    const tryMove = (nr: number, nc: number) => {
      if (
        nr >= 0 &&
        nr < SIZE &&
        nc >= 0 &&
        nc < SIZE &&
        SOLUTION[nr][nc] !== "#" &&
        (nr !== r || nc !== c) // only move if actually different
      ) {
        setSelected({ r: nr, c: nc });
        return true;
      }
      return false;
    };

    switch (dir) {
      case "up":
        for (let nr = r - 1; nr >= 0; nr--)
          if (tryMove(nr, c)) break;
        break;
      case "down":
        for (let nr = r + 1; nr < SIZE; nr++)
          if (tryMove(nr, c)) break;
        break;
      case "left":
        for (let nc = c - 1; nc >= 0; nc--)
          if (tryMove(r, nc)) break;
        break;
      case "right":
        for (let nc = c + 1; nc < SIZE; nc++)
          if (tryMove(r, nc)) break;
        break;
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (!selected || won) return;
    let { r, c } = selected;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveSelection("up");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveSelection("down");
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveSelection("left");
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      moveSelection("right");
    }

    if (e.key === "Tab") {
      e.preventDefault();
      setDirection((d) => (d === "across" ? "down" : "across"));
      return;
    }

    if (e.key === "Backspace") {
      const newGrid = grid.map((row) => [...row]);
      if (newGrid[r][c]) {
        newGrid[r][c] = "";
        setGrid(newGrid);
      } else {
        retreat(r, c, direction);
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (selected)
        goToNextWord(direction, selected.r, selected.c);
      return;
    }

    if (/^[a-zA-Z]$/.test(e.key)) {
      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = e.key.toUpperCase();
      setGrid(newGrid);
      if (checkWin(newGrid)) {
        setWon(true);
      } else advance(r, c, direction, newGrid);
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (SOLUTION[r][c] === "#") return;
    if (selected?.r === r && selected?.c === c) {
      setDirection((d) => (d === "across" ? "down" : "across"));
    } else {
      setSelected({ r, c });
    }
    inputRef.current?.focus();
  };

  // ── Safe active clue updater ──
  const updateActiveClue = useCallback(
    (dir: Dir, r: number, c: number) => {
      const cells = getWordCells(dir, r, c);
      if (!cells.length) return;
      const [startR, startC] = cells[0];
      const list = dir === "across" ? CLUES.across : CLUES.down;
      const clue = list.find(
        (cl) => cl.row === startR && cl.col === startC,
      );

      if (!clue) return;
      // Only update if different
      if (
        !activeClue ||
        activeClue.num !== clue.num ||
        activeClue.dir !== dir
      ) {
        setActiveClue({ dir, num: clue.num });
      }
    },
    [activeClue],
  );

  useEffect(() => {
    if (selected) {
      updateActiveClue(direction, selected.r, selected.c);
    }
  }, [selected, direction, updateActiveClue]);

  const CELL_SIZE = 52;

  const getCellStyle = (r: number, c: number) => {
    const isSel = selected?.r === r && selected?.c === c;
    const isWord = wordCellSet.has(cellKey(r, c));
    const isBlack = SOLUTION[r][c] === "#";
    const isCorrect = grid[r][c] === SOLUTION[r][c];
    const wasRevealed =
      revealed && grid[r][c] === SOLUTION[r][c];

    if (isBlack) return { background: "#2C2422" };
    if (isSel)
      return {
        background: "#C9A84C",
        border: "2px solid #A88030",
      };
    if (isWord)
      return {
        background: "#FFF5D0",
        border: "2px solid #E8D090",
      };
    if (wasRevealed)
      return {
        background: "#E8E8FF",
        border: "2px solid #A0A0E8",
      };

    if (showCorrect && isCorrect)
      return {
        background: "#E8F5E0",
        border: "1px solid #A8D090",
      };
    return { background: "#FFF", border: "2px solid #E0D0C0" };
  };

  const currentClueText = () => {
    if (!activeClue) return "";
    const list =
      activeClue.dir === "across" ? CLUES.across : CLUES.down;
    return (
      list.find((cl) => cl.num === activeClue.num)?.clue ?? ""
    );
  };

  return (
    <div
      className="max-w-3xl mx-auto px-4 py-6"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Link
          to="/"
          style={{
            color: "#C9A84C",
            fontSize: "0.8rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← All Games
        </Link>
      </div>
      <div className="text-center mb-4">
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#2C2422",
            fontSize: "1.8rem",
            fontWeight: 700,
          }}
        >
          The Mini 🔔
        </h1>
        <p
          style={{
            color: "#7A5C4A",
            fontSize: "0.82rem",
            marginTop: "0.3rem",
          }}
        >
          A mini crossword <br />
          Click a cell to begin. Tab to switch direction.
        </p>
      </div>

      {won && (
        <div
          className="text-center mb-6 p-4 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg,#FFF5E0,#FFF8F0)",
            border: "1.5px solid #E8C870",
          }}
        >
          <div
            style={{ fontSize: "2rem", marginBottom: "0.3rem" }}
          >
            🎊
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.3rem",
              color: "#C9A84C",
              fontWeight: 700,
            }}
          >
            Congratulations!
          </div>
          <p style={{ color: "#7A5C4A", fontSize: "0.85rem" }}>
            You completed the mini puzzle!
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-start justify-center">
        {/* Grid */}
        <div
          tabIndex={0}
          onKeyDown={handleKey}
          style={{ outline: "none" }}
        >
          <input
            ref={inputRef}
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              width: 0,
              height: 0,
            }}
            readOnly
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(5, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(5, ${CELL_SIZE}px)`,
              gap: "2px",
              background: "#D0BCA8",
              padding: "2px",
              borderRadius: "6px",
              userSelect: "none",
            }}
          >
            {SOLUTION.map((row, r) =>
              row.map((cell, c) => {
                const cellStyle = getCellStyle(r, c);
                const num = NUMBER_MAP[cellKey(r, c)];
                return (
                  <div
                    key={cellKey(r, c)}
                    onClick={() => handleCellClick(r, c)}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      position: "relative",
                      cursor:
                        cell === "#" ? "default" : "pointer",
                      ...cellStyle,
                      borderRadius: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.1s",
                    }}
                  >
                    {cell !== "#" && num && (
                      <span
                        style={{
                          position: "absolute",
                          top: "2px",
                          left: "3px",
                          fontSize: "9px",
                          color:
                            selected?.r === r &&
                            selected?.c === c
                              ? "#fff"
                              : "#9C8170",
                          lineHeight: 1,
                          fontWeight: 700,
                        }}
                      >
                        {num}
                      </span>
                    )}
                    {cell !== "#" && (
                      <span
                        style={{
                          fontSize: "1.15rem",
                          fontWeight: 700,
                          color:
                            selected?.r === r &&
                            selected?.c === c
                              ? "#fff"
                              : "#2C2422",
                          letterSpacing: 0,
                        }}
                      >
                        {grid[r][c]}
                      </span>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>

        {/* Clues */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {(["across", "down"] as Dir[]).map((dir) => (
            <div key={dir}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#5C4A3A",
                  marginBottom: "0.4rem",
                  textTransform: "capitalize",
                  borderBottom: "1px solid #E8D5C4",
                  paddingBottom: "0.3rem",
                }}
              >
                {dir.charAt(0).toUpperCase() + dir.slice(1)}
              </div>
              {CLUES[dir].map((cl) => {
                const isActive =
                  activeClue?.dir === dir &&
                  activeClue?.num === cl.num;
                return (
                  <div
                    key={cl.num}
                    onClick={() => {
                      setSelected({ r: cl.row, c: cl.col });
                      setDirection(dir);
                      inputRef.current?.focus();
                    }}
                    style={{
                      padding: "0.3rem 0.5rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      background: isActive
                        ? "#FFF5D0"
                        : "transparent",
                      fontSize: "0.82rem",
                      color: "#5C4A3A",
                      marginBottom: "0.15rem",
                      borderLeft: isActive
                        ? "3px solid #C9A84C"
                        : "3px solid transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <strong
                      style={{
                        color: isActive ? "#C9A84C" : "#9C8170",
                        marginRight: "0.4rem",
                        fontSize: "0.78rem",
                      }}
                    >
                      {cl.num}
                    </strong>
                    {cl.clue}
                  </div>
                );
              })}
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1rem",
              gap: "0.5rem", // space between buttons
            }}
          >
            <button
              onClick={revealAnswers}
              disabled={revealed}
              style={{
                background: "#FFF5D0",
                color: "#2C2422",
                border: "none",
                padding: "0.5rem 1.1rem",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: revealed ? "default" : "pointer",
                letterSpacing: "0.05em",
              }}
            >
              Reveal Answers
            </button>

            <button
              onClick={clearPuzzle}
              style={{
                background: "#FFF5D0",
                color: "#2C2422",
                border: "none",
                padding: "0.5rem 1.1rem",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              Clear Puzzle
            </button>
            <button
              onClick={() => setShowCorrect((v) => !v)}
              style={{
                background: "#FFF5D0",
                color: "#2C2422",
                border: "none",
                padding: "0.45rem 1rem",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.04em",
                fontFamily: "'Lato', sans-serif",
                opacity: showCorrect ? 0.5 : 1,
              }}
            >
              Highlight Correct Cells
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}