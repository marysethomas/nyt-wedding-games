import { useState, useCallback } from "react";
import { Link } from "react-router";

// ── Puzzle config ────────────────────────────────────────────────────────────
// 6 rows × 8 cols grid
const THEME = "WEDDING";
const THEME_HINT = "What gathers us together";

// Grid letters (8 rows × 6 cols = 48 cells)
const GRID_LETTERS: string[][] = [
  ["E", "O", "N", "T", "T", "I"],
  ["C", "C", "F", "E", "P", "S"],
  ["N", "A", "D", "T", "H", "O"],
  ["F", "I", "R", "S", "O", "T"],
  ["I", "D", "O", "I", "N", "G"],
  ["W", "E", "D", "D", "S", "K"],
  ["O", "W", "I", "S", "S", "N"],
  ["V", "S", "K", "D", "R", "I"],
];

// Words and their cell paths [row, col][]
// Spangram spans the whole theme
const WORDS: {
  word: string;
  cells: [number, number][];
  isSpangram?: boolean;
}[] = [
  {
    word: "CONFETTI",
    cells: [
      [1, 1],
      [0, 1],
      [0, 2],
      [1, 2],
      [1, 3],
      [0, 3],
      [0, 4],
      [0, 5],
    ],
  },
  {
    word: "VOWS",
    cells: [
      [7, 0],
      [6, 0],
      [6, 1],
      [7, 1],
    ],
  },
  {
    word: "KISS",
    cells: [
      [7, 2],
      [6, 2],
      [6, 3],
      [6, 4],
    ],
  },
  {
    word: "PHOTOS",
    cells: [
      [1, 4],
      [2, 4],
      [3, 4],
      [3, 5],
      [2, 5],
      [1, 5],
    ],
  },
  {
    word: "FIRSTDANCE",
    cells: [
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
      [2, 3],
      [2, 2],
      [2, 1],
      [2, 0],
      [1, 0],
      [0, 0],
    ],
  },
  {
    word: "DRINKS",
    cells: [
      [7, 3],
      [7, 4],
      [7, 5],
      [6, 5],
      [5, 5],
      [5, 4],
    ],
  },

  {
    word: "WEDDING",
    cells: [
      [5, 0],
      [5, 1],
      [5, 2],
      [5, 3],
      [4, 3],
      [4, 4],
      [4, 5],
    ],
    isSpangram: true,
  },
];

// All word cell sets for validation
const wordCellSets = WORDS.map(
  (w) => new Set(w.cells.map(([r, c]) => `${r},${c}`)),
);

function cellsMatch(
  selected: string[],
  wordSet: Set<string>,
): boolean {
  if (selected.length !== wordSet.size) return false;
  return selected.every((k) => wordSet.has(k));
}

const SPANGRAM_COLOR = "#C9A84C";
const WORD_COLOR = "#5A9B5A";
const SELECT_COLOR = "#D0BCA8";

export function Strands() {
  const [selecting, setSelecting] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]); // "r,c" keys
  const [foundWords, setFoundWords] = useState<number[]>([]); // word indices
  const [message, setMessage] = useState<{
    text: string;
    type: "ok" | "err" | "span";
  } | null>(null);
  const [won, setWon] = useState(false);
  const [hints, setHints] = useState(0);
  const [hintsUsed, setHintsUsed] = useState<number[]>([]);

  const showMsg = (
    text: string,
    type: "ok" | "err" | "span",
  ) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2200);
  };

  const getCellState = (
    r: number,
    c: number,
  ): "idle" | "selected" | "found" | "spangram" => {
    const key = `${r},${c}`;
    const foundInfo = foundWords
      .map((wi) => ({ wi, w: WORDS[wi] }))
      .find(({ w }) =>
        w.cells.some(([wr, wc]) => wr === r && wc === c),
      );
    if (foundInfo)
      return foundInfo.w.isSpangram ? "spangram" : "found";
    if (currentPath.includes(key)) return "selected";
    return "idle";
  };

  const addToPath = useCallback(
    (r: number, c: number) => {
      const key = `${r},${c}`;
      if (!selecting) return;

      setCurrentPath((prev) => {
        // If already in path, backtrack to that cell
        const idx = prev.indexOf(key);
        if (idx !== -1) return prev.slice(0, idx + 1);
        // Check adjacency
        if (prev.length > 0) {
          const lastKey = prev[prev.length - 1];
          const [lr, lc] = lastKey.split(",").map(Number);
          const dr = Math.abs(lr - r);
          const dc = Math.abs(lc - c);
          if (dr > 1 || dc > 1) return prev; // not adjacent
        }
        return [...prev, key];
      });
    },
    [selecting],
  );

  const startSelect = (r: number, c: number) => {
    if (won) return;
    const state = getCellState(r, c);
    if (state === "found" || state === "spangram") return;
    setSelecting(true);
    setCurrentPath([`${r},${c}`]);
  };

  const endSelect = () => {
    if (!selecting) return;
    setSelecting(false);
    // Check if currentPath matches any word
    const matchIndex = wordCellSets.findIndex(
      (set, wi) =>
        !foundWords.includes(wi) &&
        cellsMatch(currentPath, set),
    );
    if (matchIndex !== -1) {
      const newFound = [...foundWords, matchIndex];
      setFoundWords(newFound);
      const isSpan = WORDS[matchIndex].isSpangram;
      showMsg(
        isSpan
          ? `✦ Spangram: ${WORDS[matchIndex].word}! ✦`
          : `Found: ${WORDS[matchIndex].word}!`,
        isSpan ? "span" : "ok",
      );
      if (newFound.length === WORDS.length) setWon(true);
    } else if (currentPath.length >= 3) {
      showMsg("Not a theme word — keep searching!", "err");
    }
    setCurrentPath([]);
  };

  const useHint = () => {
    if (hints <= 0) return;
    const unfound = WORDS.map((_, i) => i).filter(
      (i) => !foundWords.includes(i) && !hintsUsed.includes(i),
    );
    if (unfound.length === 0) return;
    const pick = unfound[0];
    setHintsUsed((prev) => [...prev, pick]);
    // Flash the first cell
    const [fr, fc] = WORDS[pick].cells[0];
    showMsg(
      `Hint: starts at row ${fr + 1}, col ${fc + 1}`,
      "ok",
    );
    setHints((h) => h - 1);
  };

  const CELL_SIZE = 46;
  const ROWS = GRID_LETTERS.length;
  const COLS = GRID_LETTERS[0].length;

  const currentWord = currentPath
    .map((key) => {
      const [r, c] = key.split(",").map(Number);
      return GRID_LETTERS[r][c];
    })
    .join("");

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-6 flex flex-col items-center"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      <div className="w-full flex items-center gap-3 mb-4">
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
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          color: "#2C2422",
          fontSize: "1.8rem",
          fontWeight: 700,
          marginBottom: "0.2rem",
        }}
      >
        Strands 💐
      </h1>

      {/* Theme hint */}
      <div
        className="mb-4 px-5 py-2 rounded-full"
        style={{
          background: "#FFF5E8",
          border: "1px solid #E8C870",
          fontSize: "0.82rem",
          color: "#7A5C4A",
        }}
      >
        <span style={{ color: "#C9A84C", fontWeight: 700 }}>
          Theme hint:{" "}
        </span>
        {THEME_HINT}
      </div>

      {/* Message */}
      <div
        style={{ minHeight: "36px", marginBottom: "0.5rem" }}
      >
        {message && (
          <div
            style={{
              padding: "0.4rem 1.2rem",
              borderRadius: "8px",
              background:
                message.type === "ok"
                  ? "#E8F5E0"
                  : message.type === "span"
                    ? "#FFF5E0"
                    : "#F5F5F5",
              color:
                message.type === "ok"
                  ? "#4A8A3A"
                  : message.type === "span"
                    ? "#C9A84C"
                    : "#7A7A7A",
              border: `1px solid ${message.type === "ok" ? "#A8D090" : message.type === "span" ? "#E8C870" : "#DDD"}`,
              fontSize: "0.85rem",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {message.text}
          </div>
        )}
      </div>

      {won && (
        <div
          className="text-center p-4 rounded-xl w-full mb-4"
          style={{
            background:
              "linear-gradient(135deg, #FFF5E0, #FFF8F0)",
            border: "1.5px solid #E8C870",
          }}
        >
          <div style={{ fontSize: "2rem" }}>🎊</div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.3rem",
              color: "#C9A84C",
              fontWeight: 700,
            }}
          >
            You found all the strands!
          </div>
          <p style={{ color: "#7A5C4A", fontSize: "0.85rem" }}>
            Theme: <em>{THEME}</em>
          </p>
        </div>
      )}

      {/* Current selected word (reserve space) */}
      <div
        style={{
          marginBottom: "0.8rem",
          fontSize: "1.2rem",
          fontWeight: 700,
          color: "#C9A84C",
          minHeight: "1.5rem", // reserve vertical space
          textAlign: "center",
        }}
      >
        {currentWord || "\u00A0"}{" "}
        {/* non-breaking space if empty */}
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
          gap: "4px",
          userSelect: "none",
          touchAction: "none",
          marginBottom: "1.5rem",
        }}
        onMouseLeave={endSelect}
        onMouseUp={endSelect}
      >
        {GRID_LETTERS.map((row, r) =>
          row.map((letter, c) => {
            const state = getCellState(r, c);
            const isHinted = hintsUsed.some(
              (wi) =>
                WORDS[wi].cells[0][0] === r &&
                WORDS[wi].cells[0][1] === c,
            );

            const bgColor =
              state === "spangram"
                ? SPANGRAM_COLOR
                : state === "found"
                  ? WORD_COLOR
                  : state === "selected"
                    ? SELECT_COLOR
                    : isHinted
                      ? "#FFE8A0"
                      : "#FFF5E8";

            const textColor =
              state === "spangram" || state === "found"
                ? "#fff"
                : state === "selected"
                  ? "#2C2422"
                  : "#5C4A3A";

            const borderColor =
              state === "spangram"
                ? "#A88030"
                : state === "found"
                  ? "#4A8A4A"
                  : state === "selected"
                    ? "#9C8070"
                    : "#E8D5C4";

            return (
              <div
                key={`${r},${c}`}
                onMouseDown={() => startSelect(r, c)}
                onMouseEnter={() => addToPath(r, c)}
                onMouseUp={endSelect}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: bgColor,
                  border: `2px solid ${borderColor}`,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: textColor,
                  cursor: "pointer",
                  transition: "all 0.12s",
                  boxShadow:
                    state === "selected"
                      ? "0 0 0 3px rgba(201,168,76,0.3)"
                      : "none",
                }}
              >
                {letter}
              </div>
            );
          }),
        )}
      </div>

      {/* Found words list */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {WORDS.map((w, wi) => {
          const isFound = foundWords.includes(wi);
          return (
            <span
              key={wi}
              style={{
                padding: "0.3rem 0.8rem",
                borderRadius: "999px",
                fontSize: "0.78rem",
                fontWeight: 700,
                background: isFound
                  ? w.isSpangram
                    ? "#FFF5E0"
                    : "#E8F5E0"
                  : "#F5EDE8",
                border: `1px solid ${isFound ? (w.isSpangram ? "#E8C870" : "#A8D090") : "#E0D0C0"}`,
                color: isFound
                  ? w.isSpangram
                    ? "#C9A84C"
                    : "#4A8A4A"
                  : "#BBA898",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {isFound ? w.word : "?????"}
            </span>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className="flex gap-4 mt-4 text-xs"
        style={{ color: "#9C8170" }}
      >
        <span>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: WORD_COLOR,
              marginRight: 4,
            }}
          />
          Theme word
        </span>
        <span>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: SPANGRAM_COLOR,
              marginRight: 4,
            }}
          />
          Spangram
        </span>
      </div>
    </div>
  );
}