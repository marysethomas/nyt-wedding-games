import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Link } from "react-router";

// ── Puzzle config ─────────────────────────────────────────────────────────────
// NYT Saturday, November 28, 2015
// '#' = black cell
// Grid uses standard 180-degree rotational symmetry

const SIZE = 15;

const SOLUTION: string[][] = [
  [
    "S",
    "C",
    "H",
    "L",
    "I",
    "T",
    "Z",
    "#",
    "S",
    "A",
    "Z",
    "E",
    "R",
    "A",
    "C",
  ],
  [
    "E",
    "Y",
    "E",
    "O",
    "F",
    "R",
    "A",
    "#",
    "A",
    "G",
    "E",
    "S",
    "A",
    "G",
    "O",
  ],
  [
    "C",
    "A",
    "L",
    "L",
    "S",
    "U",
    "P",
    "#",
    "T",
    "O",
    "S",
    "S",
    "P",
    "O",
    "T",
  ],
  [
    "U",
    "N",
    "I",
    "#",
    "O",
    "N",
    "P",
    "O",
    "I",
    "N",
    "T",
    "#",
    "T",
    "U",
    "T",
  ],
  [
    "L",
    "I",
    "P",
    "S",
    "#",
    "K",
    "E",
    "R",
    "R",
    "Y",
    "#",
    "R",
    "O",
    "T",
    "O",
  ],
  [
    "A",
    "D",
    "A",
    "M",
    "S",
    "#",
    "R",
    "B",
    "I",
    "#",
    "T",
    "U",
    "R",
    "I",
    "N",
  ],
  [
    "R",
    "E",
    "D",
    "E",
    "E",
    "M",
    "S",
    "#",
    "C",
    "H",
    "R",
    "I",
    "S",
    "S",
    "Y",
  ],
  [
    "#",
    "#",
    "#",
    "L",
    "G",
    "A",
    "#",
    "#",
    "#",
    "I",
    "A",
    "N",
    "#",
    "#",
    "#",
  ],
  [
    "S",
    "P",
    "A",
    "T",
    "U",
    "L",
    "A",
    "#",
    "K",
    "E",
    "N",
    "O",
    "S",
    "H",
    "A",
  ],
  [
    "A",
    "I",
    "M",
    "E",
    "E",
    "#",
    "V",
    "I",
    "N",
    "#",
    "Q",
    "U",
    "E",
    "E",
    "N",
  ],
  [
    "M",
    "E",
    "I",
    "R",
    "#",
    "C",
    "O",
    "B",
    "O",
    "L",
    "#",
    "S",
    "E",
    "X",
    "Y",
  ],
  [
    "O",
    "H",
    "S",
    "#",
    "C",
    "H",
    "I",
    "N",
    "W",
    "A",
    "G",
    "#",
    "N",
    "A",
    "M",
  ],
  [
    "V",
    "O",
    "T",
    "E",
    "R",
    "I",
    "D",
    "#",
    "N",
    "B",
    "A",
    "L",
    "O",
    "G",
    "O",
  ],
  [
    "A",
    "L",
    "A",
    "M",
    "O",
    "D",
    "E",
    "#",
    "A",
    "E",
    "R",
    "A",
    "T",
    "O",
    "R",
  ],
  [
    "R",
    "E",
    "D",
    "U",
    "C",
    "E",
    "D",
    "#",
    "S",
    "L",
    "O",
    "V",
    "E",
    "N",
    "E",
  ],
];

// ── Auto-numbering ────────────────────────────────────────────────────────────
type NumberMap = Record<string, number>;

function buildNumbers(): NumberMap {
  const map: NumberMap = {};
  let n = 1;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (SOLUTION[r][c] === "#") continue;
      const startsAcross =
        (c === 0 || SOLUTION[r][c - 1] === "#") &&
        c + 1 < SIZE &&
        SOLUTION[r][c + 1] !== "#";
      const startsDown =
        (r === 0 || SOLUTION[r - 1][c] === "#") &&
        r + 1 < SIZE &&
        SOLUTION[r + 1][c] !== "#";
      if (startsAcross || startsDown) {
        map[`${r},${c}`] = n++;
      }
    }
  }
  return map;
}

const NUMBER_MAP = buildNumbers();

// ── Clue lists ────────────────────────────────────────────────────────────────

type ClueEntry = {
  num: number;
  row: number;
  col: number;
  clue: string;
};

const ACROSS_CLUES_TEXT: Record<number, string> = {
  1: "Brand with the old slogan 'Just the kiss of the hops'",
  8: "Official cocktail of New Orleans",
  15: "Unblinking gazer in Egyptian mythology",
  16: "Way in the past",
  17: "Evokes",
  18: "Juicer",
  19: "Verse starter?",
  20: "Germane",
  22: "Bit of a rebuke",
  23: "Bussing requirement",
  25: "Clinton's successor",
  26: "Spinning: Prefix",
  27: "Agent 86 player",
  29: "One of Aaron's 86 in '68",
  30: "Where Alfa Romeo is based",
  31: "Turns in",
  33: "One of the three on 'Three's Company'",
  35: "Delta hub, briefly",
  36: "John, abroad",
  37: "Flipper?",
  41: "Fourth-largest city on Lake Michigan",
  45: "Name that means 'loved'",
  46: "Porto, par exemple",
  48: "Powerful board member",
  49: "Feldshuh's role in 'O Jerusalem'",
  50: "Language created in 1959",
  52: "10-ish?",
  53: "Brand with a Honey Graham variety",
  54: "Yak",
  56: "Where 25-Across served in the late '60s",
  57: "Request from a poll worker",
  59: "It features the silhouette of hoops legend Jerry West",
  61: "In style",
  62: "Faucet accessory",
  63: "Like some sentences and fat",
  64: "Neighbor of an Italian",
};

const DOWN_CLUES_TEXT: Record<number, string> = {
  1: "Like Labor Day, but not Christmas",
  2: "Compound in apricot pits",
  3: "Special touchdown point?",
  4: "Palindromic bit of textspeak",
  5: "Hypothetical phrase",
  6: "Jack holder",
  7: "Debuggers?",
  8: "Like many segments on 'The Daily Show'",
  9: "Hell",
  10: "Marmalade ingredient",
  11: "Part of a skier's run",
  12: "Hawks, e.g.",
  13: "Cousins of capybaras",
  14: "Soft and delicate",
  21: "Bit of regalia",
  24: "Ironman?",
  26: "Devastating",
  28: "'Anyhoo,' e.g.",
  30: "Downer, for short",
  32: "Not bien",
  34: "Tear, quaintly",
  37: "Tea server",
  38: "Big fat mouth",
  39: "Vessel whose name meant 'friendship,' ironically",
  40: "Like pariahs",
  41: "Called",
  42: "Often-bracketed direction",
  43: "Cross-section of a pencil",
  44: "These days",
  47: "Arabic name part",
  50: "22-Across-22-Across, say",
  51: "Clotheshorse's concern",
  54: "Large snapper",
  55: "1960s-'80s placekicker Yepremian, who helped the Dolphins win consecutive Super Bowls",
  58: "Source of jumbo eggs",
  60: "John",
};

function buildClues(): {
  across: ClueEntry[];
  down: ClueEntry[];
} {
  const across: ClueEntry[] = [];
  const down: ClueEntry[] = [];

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (SOLUTION[r][c] === "#") continue;
      const key = `${r},${c}`;
      const num = NUMBER_MAP[key];
      if (num === undefined) continue;

      const startsAcross =
        (c === 0 || SOLUTION[r][c - 1] === "#") &&
        c + 1 < SIZE &&
        SOLUTION[r][c + 1] !== "#";
      const startsDown =
        (r === 0 || SOLUTION[r - 1][c] === "#") &&
        r + 1 < SIZE &&
        SOLUTION[r + 1][c] !== "#";

      if (startsAcross) {
        across.push({
          num,
          row: r,
          col: c,
          clue:
            ACROSS_CLUES_TEXT[num] ??
            `Placeholder clue for ${num} Across`,
        });
      }
      if (startsDown) {
        down.push({
          num,
          row: r,
          col: c,
          clue:
            DOWN_CLUES_TEXT[num] ??
            `Placeholder clue for ${num} Down`,
        });
      }
    }
  }

  return { across, down };
}

const CLUES = buildClues();

// ── Helpers ───────────────────────────────────────────────────────────────────
type Dir = "across" | "down";

function cellKey(r: number, c: number) {
  return `${r},${c}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CrosswordGame() {
  const [grid, setGrid] = useState<string[][]>(
    SOLUTION.map((row) =>
      row.map((cell) => (cell === "#" ? "#" : "")),
    ),
  );
  const [selected, setSelected] = useState<{
    r: number;
    c: number;
  } | null>({
    r: 0,
    c: 0,
  });
  const [direction, setDirection] = useState<Dir>("across");
  const [won, setWon] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [activeClue, setActiveClue] = useState<{
    dir: Dir;
    num: number;
  } | null>({
    dir: "across",
    num: CLUES.across[0]?.num ?? 1,
  });

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(32);
  const inputRef = useRef<HTMLInputElement>(null);
  const acrossClueRefs = useRef<
    Record<number, HTMLDivElement | null>
  >({});
  const downClueRefs = useRef<
    Record<number, HTMLDivElement | null>
  >({});
  const [showCorrect, setShowCorrect] = useState(false);

  // Keyboard input for mobile
  useEffect(() => {
    inputRef.current?.focus();
  }, [selected]);

  // ── Responsive cell sizing ─────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (gridContainerRef.current) {
        const available =
          gridContainerRef.current.clientWidth - 4;
        const size = Math.floor((available - SIZE) / SIZE);
        setCellSize(Math.max(18, Math.min(34, size)));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Auto-scroll active clue into view ─────────────────────────────────────
  useEffect(() => {
    if (!activeClue) return;
    const refs =
      activeClue.dir === "across"
        ? acrossClueRefs
        : downClueRefs;
    const el = refs.current[activeClue.num];
    if (el)
      el.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
  }, [activeClue]);

  // ── Word cell helpers ──────────────────────────────────────────────────────
  const getWordCells = useCallback(
    (dir: Dir, r: number, c: number): [number, number][] => {
      const cells: [number, number][] = [];
      if (dir === "across") {
        let sc = c;
        while (sc > 0 && SOLUTION[r][sc - 1] !== "#") sc--;
        for (
          let cc = sc;
          cc < SIZE && SOLUTION[r][cc] !== "#";
          cc++
        )
          cells.push([r, cc]);
      } else {
        let sr = r;
        while (sr > 0 && SOLUTION[sr - 1][c] !== "#") sr--;
        for (
          let rr = sr;
          rr < SIZE && SOLUTION[rr][c] !== "#";
          rr++
        )
          cells.push([rr, c]);
      }
      return cells;
    },
    [],
  );

  const wordCells = selected
    ? getWordCells(direction, selected.r, selected.c)
    : [];
  const wordCellSet = new Set(
    wordCells.map(([r, c]) => cellKey(r, c)),
  );

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
        SOLUTION[nr][nc] !== "#"
      ) {
        setSelected({ r: nr, c: nc });
        return true;
      }
      return false;
    };

    switch (dir) {
      case "up":
        for (let nr = r - 1; nr >= 0; nr--) {
          if (tryMove(nr, c)) break;
        }
        break;
      case "down":
        for (let nr = r + 1; nr < SIZE; nr++) {
          if (tryMove(nr, c)) break;
        }
        break;
      case "left":
        for (let nc = c - 1; nc >= 0; nc--) {
          if (tryMove(r, nc)) break;
        }
        break;
      case "right":
        for (let nc = c + 1; nc < SIZE; nc++) {
          if (tryMove(r, nc)) break;
        }
        break;
    }
  };

  // ── Active clue sync ───────────────────────────────────────────────────────
  const updateActiveClue = useCallback(
    (dir: Dir, r: number, c: number) => {
      const cells = getWordCells(dir, r, c);
      if (!cells.length) return;
      const [startR, startC] = cells[0];
      const list = dir === "across" ? CLUES.across : CLUES.down;
      const clue = list.find(
        (cl) => cl.row === startR && cl.col === startC,
      );
      if (clue) setActiveClue({ dir, num: clue.num });
    },
    [getWordCells],
  );

  useEffect(() => {
    if (!selected) return;
    updateActiveClue(direction, selected.r, selected.c);
  }, [selected, direction, updateActiveClue]);

  // ── Grid helpers ───────────────────────────────────────────────────────────
  const checkWin = (g: string[][]) => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (
          SOLUTION[r][c] !== "#" &&
          g[r][c] !== SOLUTION[r][c]
        )
          return false;
      }
    }
    return true;
  };

  const advance = (r: number, c: number, dir: Dir) => {
    if (dir === "across") {
      for (let nc = c + 1; nc < SIZE; nc++) {
        if (SOLUTION[r][nc] !== "#") {
          setSelected({ r, c: nc });
          return;
        }
      }
    } else {
      for (let nr = r + 1; nr < SIZE; nr++) {
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

  // ── Keyboard handler ───────────────────────────────────────────────────────
  const handleKey = (e: React.KeyboardEvent) => {
    if (!selected || won) return;
    const { r, c } = selected;

    if (e.key === "Tab") {
      e.preventDefault();
      setDirection((d) => (d === "across" ? "down" : "across"));
      return;
    }
    if (e.key === "Backspace") {
      const ng = grid.map((row) => [...row]);
      if (ng[r][c]) {
        ng[r][c] = "";
        setGrid(ng);
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
      return;
    }
    if (/^[a-zA-Z]$/.test(e.key)) {
      const ng = grid.map((row) => [...row]);
      ng[r][c] = e.key.toUpperCase();
      setGrid(ng);
      if (checkWin(ng)) setWon(true);
      else advance(r, c, direction);
    }
  };

  // ── Cell click ─────────────────────────────────────────────────────────────
  const handleCellClick = (r: number, c: number) => {
    if (SOLUTION[r][c] === "#") return;
    if (selected?.r === r && selected?.c === c) {
      setDirection((d) => (d === "across" ? "down" : "across"));
    } else {
      setSelected({ r, c });
    }
    inputRef.current?.focus();
  };

  // ── Cell styling ───────────────────────────────────────────────────────────
  const getCellStyle = (r: number, c: number) => {
    const isSel = selected?.r === r && selected?.c === c;
    const isWord = wordCellSet.has(cellKey(r, c));
    const isBlack = SOLUTION[r][c] === "#";
    const hasLetter = grid[r][c] !== "" && grid[r][c] !== "#";
    const isCorrect =
      hasLetter && grid[r][c] === SOLUTION[r][c];

    if (isBlack) return { background: "#2C2422" };
    if (isSel)
      return {
        background: "#C9A84C",
        border: "1px solid #A88030",
      };
    if (isWord)
      return {
        background: "#FFF5D0",
        border: "1px solid #E8D090",
      };
    if (revealed && isCorrect)
      return {
        background: "#E8E8FF",
        border: "1px solid #A0A0E8",
      };
    if (showCorrect && isCorrect)
      return {
        background: "#E8F5E0",
        border: "1px solid #A8D090",
      };
    return { background: "#FFF", border: "1px solid #D0C0B0" };
  };

  // ── Reveal / Clear ─────────────────────────────────────────────────────────
  const revealAnswers = () => {
    setGrid(SOLUTION.map((row) => [...row]));
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
    setRevealed(false);
    setActiveClue({
      dir: "across",
      num: CLUES.across[0]?.num ?? 1,
    });
  };

  // ── Active clue text ───────────────────────────────────────────────────────
  const currentClueText = () => {
    if (!activeClue) return "";
    const list =
      activeClue.dir === "across" ? CLUES.across : CLUES.down;
    return (
      list.find((cl) => cl.num === activeClue.num)?.clue ?? ""
    );
  };

  const letterSize = Math.max(10, Math.floor(cellSize * 0.52));
  const numSize = Math.max(6, Math.floor(cellSize * 0.27));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="max-w-[1200px] mx-auto px-3 py-6"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      {/* Back */}
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

      {/* Title */}
      <div className="text-center mb-4">
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#2C2422",
            fontSize: "1.8rem",
            fontWeight: 700,
          }}
        >
          Crossword 💒
        </h1>
        <p
          style={{
            color: "#7A5C4A",
            fontSize: "0.82rem",
            marginTop: "0.25rem",
          }}
        >
          Saturday, November 28, 2015 ✦ Our Anniversary ✦ <br />
          Click a cell to begin. Tab to switch direction.
        </p>
      </div>

      {/* Won banner */}
      {won && (
        <div
          className="text-center mb-5 p-4 rounded-xl"
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
            You completed the puzzle!
          </p>
        </div>
      )}

      {/* Active clue banner */}
      <div
        className="mb-3 px-4 py-2 rounded-lg"
        style={{
          background: "#FFF5D0",
          border: "1px solid #E8D090",
          minHeight: "38px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {activeClue && (
          <span
            style={{ color: "#5C4A3A", fontSize: "0.85rem" }}
          >
            <strong style={{ color: "#C9A84C" }}>
              {activeClue.num}
              {activeClue.dir === "across" ? "A" : "D"}
            </strong>
            {" — "}
            {currentClueText()}
          </span>
        )}
      </div>

      {/* Main area */}
      <div className="flex flex-col xl:flex-row gap-4 items-start">
        {/* ── Grid ── */}
        <div className="flex-shrink-0 w-full xl:w-auto">
          {/* Measure container for responsive sizing */}
          <div
            ref={gridContainerRef}
            className="w-full xl:w-[516px]"
          >
            <div
              tabIndex={0}
              onKeyDown={handleKey}
              style={{
                outline: "none",
                display: "inline-block",
              }}
            >
              <input
                  ref={inputRef}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    width: 1,
                    height: 1,
                  }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${SIZE}, ${cellSize}px)`,
                  gridTemplateRows: `repeat(${SIZE}, ${cellSize}px)`,
                  gap: "1px",
                  background: "#C0A898",
                  padding: "2px",
                  borderRadius: "6px",
                  userSelect: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                {SOLUTION.map((row, r) =>
                  row.map((cell, c) => {
                    const style = getCellStyle(r, c);
                    const num = NUMBER_MAP[cellKey(r, c)];
                    return (
                      <div
                        key={cellKey(r, c)}
                        onClick={() => handleCellClick(r, c)}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          position: "relative",
                          cursor:
                            cell === "#"
                              ? "default"
                              : "pointer",
                          ...style,
                          borderRadius: "1px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "background 0.08s",
                        }}
                      >
                        {cell !== "#" && num !== undefined && (
                          <span
                            style={{
                              position: "absolute",
                              top: "1px",
                              left: "2px",
                              fontSize: `${numSize}px`,
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
                              fontSize: `${letterSize}px`,
                              fontWeight: 700,
                              color:
                                selected?.r === r &&
                                selected?.c === c
                                  ? "#fff"
                                  : "#2C2422",
                              lineHeight: 1,
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
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={revealAnswers}
              disabled={revealed}
              style={{
                background: "#FFF5D0",
                color: "#2C2422",
                border: "none",
                padding: "0.45rem 1rem",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: revealed ? "default" : "pointer",
                letterSpacing: "0.04em",
                fontFamily: "'Lato', sans-serif",
                opacity: revealed ? 0.5 : 1,
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
                padding: "0.45rem 1rem",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.04em",
                fontFamily: "'Lato', sans-serif",
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

          {/* Stats row */}
          <div
            className="mt-3 flex gap-3 flex-wrap"
            style={{ fontSize: "0.72rem", color: "#9C8170" }}
          >
            <span>
              <strong style={{ color: "#C9A84C" }}>
                {CLUES.across.length}
              </strong>{" "}
              Across
            </span>
            <span style={{ color: "#D0BCA8" }}>·</span>
            <span>
              <strong style={{ color: "#C9A84C" }}>
                {CLUES.down.length}
              </strong>{" "}
              Down
            </span>
            <span style={{ color: "#D0BCA8" }}>·</span>
            <span>
              <strong style={{ color: "#C9A84C" }}>
                {
                  grid
                    .flat()
                    .filter((c) => c !== "" && c !== "#").length
                }
              </strong>{" "}
              /{" "}
              {SOLUTION.flat().filter((c) => c !== "#").length}{" "}
              filled
            </span>
          </div>
        </div>

        {/* ── Clue panels ── */}
        <div className="flex flex-row gap-3 flex-1 min-w-0 w-full overflow-hidden">
          {(["across", "down"] as Dir[]).map((dir) => (
            <div
              key={dir}
              className="flex-1 min-w-0 flex flex-col"
            >
              {/* Column header */}
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#5C4A3A",
                  marginBottom: "0.4rem",
                  borderBottom: "2px solid #E8D5C4",
                  paddingBottom: "0.35rem",
                  flexShrink: 0,
                }}
              >
                {dir === "across" ? "Across" : "Down"}
              </div>

              {/* Scrollable clue list */}
              <div
                style={{
                  overflowY: "auto",
                  maxHeight: "clamp(300px, 60vh, 560px)",
                  paddingRight: "4px",
                }}
              >
                {CLUES[dir].map((cl) => {
                  const isActive =
                    activeClue?.dir === dir &&
                    activeClue?.num === cl.num;
                  return (
                    <div
                      key={cl.num}
                      ref={(el) => {
                        if (dir === "across")
                          acrossClueRefs.current[cl.num] = el;
                        else downClueRefs.current[cl.num] = el;
                      }}
                      onClick={() => {
                        setSelected({ r: cl.row, c: cl.col });
                        setDirection(dir);
                        inputRef.current?.focus();
                      }}
                      style={{
                        padding: "0.28rem 0.45rem",
                        borderRadius: "3px",
                        cursor: "pointer",
                        background: isActive
                          ? "#FFF5D0"
                          : "transparent",
                        fontSize: "0.76rem",
                        color: "#5C4A3A",
                        marginBottom: "1px",
                        borderLeft: isActive
                          ? "3px solid #C9A84C"
                          : "3px solid transparent",
                        transition: "background 0.1s",
                        lineHeight: 1.45,
                      }}
                    >
                      <strong
                        style={{
                          color: isActive
                            ? "#C9A84C"
                            : "#9C8170",
                          marginRight: "0.3rem",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        }}
                      >
                        {cl.num}
                      </strong>
                      {cl.clue}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}