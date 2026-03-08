import { useState, useEffect, useCallback, useMemo} from "react";
import { Link } from "react-router";
import { Delete, RotateCcw } from "lucide-react";

// ── Puzzle config ────────────────────────────────────────────────────────────
// Edit these to change the puzzle
const CENTER_LETTER = "R";
const OUTER_LETTERS = ["E", "M", "Y", "O", "N", "C"];
const LETTERS = [CENTER_LETTER, ...OUTER_LETTERS]

const VALID_WORDS = [
    "CEREMONY",
    "COERCE",
    "COERCER",
    "COMER",
    "COMMENCER",
    "COMMERCE",
    "COMMONER",
    "CONCERN",
    "CONNER",
    "COOER",
    "CORE",
    "CORER",
    "CORN",
    "CORNER",
    "CORNY",
    "CORONER",
    "COYER",
    "CREME",
    "CROC",
    "CRONE",
    "CRONY",
    "CROON",
    "CROONER",
    "EMERY",
    "ENCORE",
    "ERROR",
    "EYRE",
    "MEER",
    "MEMORY",
    "MERCY",
    "MERE",
    "MERMEN",
    "MERRY",
    "MERRYMEN",
    "MONOMER",
    "MOOR",
    "MOORER",
    "MORE",
    "MORN",
    "MORON",
    "NORM",
    "ORNERY",
    "RECON",
    "ROCOCO",
    "ROOM",
    "ROOMER",
    "ROOMY",
    "YORE",
];

const RANKS = [
  { label: "Beginner", minPct: 0, emoji: "🌱" },
  { label: "Good Start", minPct: 0.05, emoji: "🌷" },
  { label: "Moving Up", minPct: 0.15, emoji: "🌸" },
  { label: "Solid", minPct: 0.3, emoji: "💐" },
  { label: "Nice", minPct: 0.4, emoji: "💍" },
  { label: "Great", minPct: 0.5, emoji: "💒" },
  { label: "Amazing", minPct: 0.65, emoji: "💋" },
  { label: "Queen Bee", minPct: 1, emoji: "🐝" },
];

function findPangrams(words: string[], letters: string[]) {
    const set = new Set(letters);
    return words.filter((w) => {
        const unique = new Set(w);
        return [...set].every((l) => unique.has(l));
    });
}

function generateHints(words: string[]) {
    const lengths = new Set<number>();
    const starts = new Set<string>();
    const grid: Record<string, Record<number, number>> = {};
    const pairs: Record<string, number> = {};

    for (const word of words) {
        const start = word[0];
        const len = word.length;
        const pair = word.slice(0, 2);

        lengths.add(len);
        starts.add(start);

        if (!grid[start]) grid[start] = {};
        grid[start][len] = (grid[start][len] || 0) + 1;

        pairs[pair] = (pairs[pair] || 0) + 1;
    }

    return {
        lengths: [...lengths].sort((a, b) => a - b),
        starts: [...starts].sort(),
        grid,
        pairs
    };
}

function wordPoints(word: string): number {
  if (word.length === 4) return 1;
  const pts = word.length;
  const allLetters = new Set([CENTER_LETTER, ...OUTER_LETTERS]);
  const usesAll = [...allLetters].every((l) =>
    word.includes(l),
  );
  return usesAll ? pts + 7 : pts;
}

const MAX_SCORE = VALID_WORDS.reduce(
  (acc, w) => acc + wordPoints(w),
  0,
);

// Hex positions for the honeycomb
function hexPos(
  index: number,
  cx: number,
  cy: number,
  r: number,
) {
  if (index === 0) return { x: cx, y: cy };
  const angle = (Math.PI / 3) * (index - 1) - Math.PI / 2;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

const HEX_SIZE = 38;
const HEX_PATH = (x: number, y: number, size: number) => {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${x + size * Math.cos(a)},${y + size * Math.sin(a)}`;
  });
  return `M ${pts.join(" L ")} Z`;
};

export function SpellingBee() {
    const [found, setFound] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [message, setMessage] = useState<{
        text: string;
        type: "ok" | "err" | "info";
    } | null>(null);
    const [outerOrder, setOuterOrder] = useState(OUTER_LETTERS);
    const [shake, setShake] = useState(false);
    const [showHints, setShowHints] = useState(false);
    const hintData = useMemo(() => generateHints(VALID_WORDS), []);
    const pangrams = useMemo(
        () => findPangrams(VALID_WORDS, LETTERS),
        [VALID_WORDS, LETTERS]
    );
    const score = found.reduce(
        (acc, w) => acc + wordPoints(w),
        0,
    );
    const rankPct = MAX_SCORE > 0 ? score / MAX_SCORE : 0;
    const allFound = found.length === VALID_WORDS.length;
    const rank =
        [...RANKS].reverse().find((r) => rankPct >= r.minPct) ??
        RANKS[0];

    const showMessage = (
        text: string,
        type: "ok" | "err" | "info",
    ) => {
        setMessage({text, type});
        setTimeout(() => setMessage(null), 1800);
    };

    const submit = useCallback(() => {
        const word = input.toUpperCase();
        if (word.length < 4) {
            showMessage("Too short!", "err");
            setShake(true);
            setTimeout(() => setShake(false), 400);
            return;
        }
        if (!word.includes(CENTER_LETTER)) {
            showMessage(`Must use ${CENTER_LETTER}!`, "err");
            setShake(true);
            setTimeout(() => setShake(false), 400);
            return;
        }
        if (found.includes(word)) {
            showMessage("Already found!", "info");
            return;
        }
        if (
            !VALID_WORDS.map((w) => w.toUpperCase()).includes(word)
        ) {
            showMessage("Not in word list", "err");
            setShake(true);
            setTimeout(() => setShake(false), 400);
            return;
        }
        setFound((prev) => [...prev, word]);
        const pts = wordPoints(word);
        showMessage(
            pts === 1
                ? "Good!"
                : pts <= 5
                    ? "Nice! +" + pts
                    : pts <= 7
                        ? "Amazing! +" + pts
                        : "Pangram! +" + pts,
            "ok",
        );
        setInput("");
    }, [input, found]);

    const addLetter = (l: string) => setInput((prev) => prev + l);
    const deleteLetter = () =>
        setInput((prev) => prev.slice(0, -1));
    const shuffle = () =>
        setOuterOrder((prev) =>
            [...prev].sort(() => Math.random() - 0.5),
        );

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                submit();
                return;
            }
            if (e.key === "Backspace") {
                deleteLetter();
                return;
            }
            const upper = e.key.toUpperCase();
            const allLetters = [CENTER_LETTER, ...OUTER_LETTERS];
            if (allLetters.includes(upper)) addLetter(upper);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [submit]);

    const allLetters = [CENTER_LETTER, ...outerOrder];
    const cx = 120,
        cy = 120,
        radius = 72;

    return (
        <div
            className="max-w-3xl mx-auto px-4 py-6"
            style={{fontFamily: "'Lato', sans-serif"}}
        >
            {/* Back + Title */}
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
            <div className="text-center mb-2">
                <h1
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#2C2422",
                        fontSize: "1.8rem",
                        fontWeight: 700,
                    }}
                >
                    Spelling Bee 🐝
                </h1>
                <p
                    style={{
                        color: "#7A5C4A",
                        fontSize: "0.82rem",
                        marginTop: "0.3rem",
                    }}
                >
                    How many words with at least 4 letters can you create?
                    The center letter must be included.
                </p>
            </div>

            {/* Rank bar */}
            <div className="flex items-center justify-center gap-2 mb-4">
                <span style={{fontSize: "1rem"}}>{rank.emoji}</span>
                <span
                    style={{
                        color: "#5C4A3A",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                    }}
                >
          {rank.label}
        </span>
                <div
                    style={{
                        width: 120,
                        height: 6,
                        background: "#F0E8E0",
                        borderRadius: 999,
                        overflow: "hidden",
                        margin: "0 6px",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            width: `${Math.min(rankPct * 100, 100)}%`,
                            background: "#C9A84C",
                            borderRadius: 999,
                            transition: "width 0.4s",
                        }}
                    />
                </div>
                <span
                    style={{
                        color: "#C9A84C",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                    }}
                >
          {score} pts
        </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                {allFound && (
                    <div
                        style={{
                            marginBottom: "1rem",
                            padding: "0.5rem 1rem",
                            background: "#E8F5E0",
                            color: "#4A8A3A",
                            fontWeight: 700,
                            borderRadius: "8px",
                            textAlign: "center",
                            fontSize: "0.9rem",
                        }}
                    >
                        🎉 Congratulations! You found all the words! 🎉
                    </div>
                )}
                {/* Left: hive + input */}
                <div className="flex flex-col items-center gap-4 flex-1">
                    {/* Input display */}
                    <div
                        className={`flex items-center gap-0 min-h-[44px] px-3 py-1 ${shake ? "animate-shake" : ""}`}
                        style={{
                            background: "#FFF",
                            border: "2px solid #E8D5C4",
                            borderRadius: "8px",
                            minWidth: "200px",
                            maxWidth: "280px",
                            justifyContent: "center",
                            position: "relative",
                            letterSpacing: "0.1em",
                            fontSize: "1.3rem",
                            fontWeight: 700,
                        }}
                    >
                        {input.split("").map((ch, i) => (
                            <span
                                key={i}
                                style={{
                                    color:
                                        ch === CENTER_LETTER
                                            ? "#C9A84C"
                                            : "#2C2422",
                                }}
                            >
                {ch}
              </span>
                        ))}
                        {input === "" && (
                            <span style={{color: "#CCC"}}>|</span>
                        )}
                        {input !== "" && (
                            <span
                                style={{
                                    color: "#C9A84C",
                                    animation: "blink 1s step-end infinite",
                                }}
                            >
                |
              </span>
                        )}
                    </div>

                    {/* Toast message */}
                    <div
                        style={{minHeight: "28px", textAlign: "center"}}
                    >
                        {message && (
                            <div
                                style={{
                                    display: "inline-block",
                                    padding: "0.3rem 1rem",
                                    borderRadius: "999px",
                                    fontSize: "0.82rem",
                                    fontWeight: 700,
                                    background:
                                        message.type === "ok"
                                            ? "#E8F5E0"
                                            : message.type === "err"
                                                ? "#FFE8E8"
                                                : "#FFF5E0",
                                    color:
                                        message.type === "ok"
                                            ? "#4A8A3A"
                                            : message.type === "err"
                                                ? "#C04040"
                                                : "#8A6A20",
                                    border: `1px solid ${message.type === "ok" ? "#A8D090" : message.type === "err" ? "#E8A0A0" : "#E8D090"}`,
                                    transition: "all 0.2s",
                                }}
                            >
                                {message.text}
                            </div>
                        )}
                    </div>

                    {/* Hexagon hive */}
                    <svg width="240" height="240" viewBox="0 0 240 240">
                        {allLetters.map((letter, i) => {
                            const pos = hexPos(i, cx, cy, radius);
                            const isCenter = i === 0;
                            return (
                                <g
                                    key={letter + i}
                                    onClick={() => addLetter(letter)}
                                    style={{cursor: "pointer"}}
                                >
                                    <path
                                        d={HEX_PATH(pos.x, pos.y, HEX_SIZE)}
                                        fill={isCenter ? "#C9A84C" : "#FFF5E8"}
                                        stroke={isCenter ? "#A88030" : "#E8C870"}
                                        strokeWidth="1.5"
                                        style={{transition: "fill 0.15s"}}
                                    />
                                    <text
                                        x={pos.x}
                                        y={pos.y + 1}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        style={{
                                            fontFamily: "'Lato', sans-serif",
                                            fontSize: "18px",
                                            fontWeight: 700,
                                            fill: isCenter ? "#fff" : "#5C4A3A",
                                            userSelect: "none",
                                            letterSpacing: "0.02em",
                                        }}
                                    >
                                        {letter}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={deleteLetter}
                            style={{
                                border: "1.5px solid #D0BCA8",
                                borderRadius: "999px",
                                padding: "0.45rem 1rem",
                                background: "transparent",
                                color: "#5C4A3A",
                                fontSize: "0.82rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                fontFamily: "'Lato', sans-serif",
                            }}
                        >
                            <Delete size={14}/> Delete
                        </button>
                        <button
                            onClick={shuffle}
                            style={{
                                border: "1.5px solid #D0BCA8",
                                borderRadius: "999px",
                                padding: "0.45rem 1rem",
                                background: "transparent",
                                color: "#5C4A3A",
                                fontSize: "0.82rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                fontFamily: "'Lato', sans-serif",
                            }}
                        >
                            <RotateCcw size={14}/> Shuffle
                        </button>
                        <button
                            onClick={submit}
                            style={{
                                border: "2px solid #C9A84C",
                                borderRadius: "999px",
                                padding: "0.45rem 1.4rem",
                                background: "#C9A84C",
                                color: "#fff",
                                fontSize: "0.82rem",
                                cursor: "pointer",
                                fontWeight: 700,
                                fontFamily: "'Lato', sans-serif",
                            }}
                        >
                            Enter
                        </button>
                    </div>
                </div>

                {/* Right: Found words */}
                <div
                    style={{
                        flex: "0 0 220px",
                        background: "#FFF",
                        border: "1px solid #E8D5C4",
                        borderRadius: "10px",
                        padding: "1rem",
                        minHeight: "300px",
                        maxHeight: "400px",
                        overflowY: "auto",
                        width: "100%",
                        maxWidth: "320px",
                    }}
                >
                    <div
                        style={{
                            fontWeight: 700,
                            color: "#5C4A3A",
                            fontSize: "0.85rem",
                            marginBottom: "0.6rem",
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <span>Found Words</span>
                        <span style={{color: "#C9A84C"}}>
              {found.length} / {VALID_WORDS.length}
            </span>
                    </div>
                    {found.length === 0 && (
                        <p
                            style={{
                                color: "#BBA898",
                                fontSize: "0.8rem",
                                fontStyle: "italic",
                            }}
                        >
                            Your words will appear here…
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {[...found].sort().map((w) => (
                            <span
                                key={w}
                                style={{
                                    background: pangrams.includes(w.toUpperCase())
                                        ? "#FFE4B5"
                                        : "#FFF5E8",
                                    border: "1px solid #E8C870",
                                    borderRadius: "4px",
                                    padding: "0.2rem 0.55rem",
                                    fontSize: "0.82rem",
                                    color: "#5C4A3A",
                                    fontWeight: 600,
                                    letterSpacing: "0.05em",
                                }}
                            >
                {w}
              </span>
                        ))}
                    </div>
                </div>

                <div style={{marginTop: "1rem", textAlign: "center"}}>
                    <button
                        onClick={() => setShowHints((v) => !v)}
                        style={{
                            border: "1.5px solid #D0BCA8",
                            borderRadius: "999px",
                            padding: "0.35rem 1rem",
                            background: "#FFF5E8",
                            color: "#5C4A3A",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontFamily: "'Lato', sans-serif",
                        }}
                    >
                        {showHints ? "Hide Hints" : "Show Hints"}
                    </button>
                </div>
            </div>

            {showHints && (
                <div className="hint-panel">

                    <div className="hint-header">
                        <div className="hint-progress">
                            {found.length} / {VALID_WORDS.length} words found
                        </div>

                        {pangrams.length > 0 && (
                            <div className="pangram-indicator">
                                Pangram{pangrams.length > 1 ? "s" : ""}:{" "}
                                {pangrams.map((p) => (
                                    <span
                                        key={p}
                                        className={
                                            found.includes(p.toLowerCase())
                                                ? "pangram-found"
                                                : "pangram-hidden"
                                        }
                                    >
                    {found.includes(p.toLowerCase()) ? p : "••••••"}
                  </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <table className="hint-grid">
                        <thead>
                        <tr>
                            <th className="corner"></th>
                            {hintData.lengths.map((len) => (
                                <th key={len}>{len}</th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        {hintData.starts.map((letter) => (
                            <tr key={letter}>
                                <th className="hint-letter">{letter}</th>

                                {hintData.lengths.map((len) => (
                                    <td key={len}>
                                        {hintData.grid[letter]?.[len] || ""}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="pair-section">
                        {Object.entries(hintData.pairs)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([pair, count]) => (
                                <div key={pair} className="pair-chip">
                                    <span className="pair">{pair}</span>
                                    <span className="pair-count">{count}</span>
                                </div>
                            ))}
                    </div>

                </div>
            )}

            <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .animate-shake { animation: shake 0.35s ease; }

        .hint-panel{
          margin-top:2rem;
          background:#fffdf8;
          border:1px solid #e2d3c1;
          border-radius:12px;
          padding:1.4rem;
          max-width:440px;
          margin-left:auto;
          margin-right:auto;
          box-shadow:0 2px 6px rgba(0,0,0,0.05);
        }

        .hint-header{
          text-align:center;
          margin-bottom:1rem;
        }

        .hint-progress{
          font-weight:600;
          color:#3b2f2a;
          font-size:0.9rem;
        }

        .pangram-indicator{
          margin-top:0.35rem;
          font-size:0.8rem;
          color:#7a5d4c;
        }

        .pangram-hidden{
          letter-spacing:2px;
          color:#b5a392;
        }

        .pangram-found{
          color:#d48a00;
          font-weight:600;
        }

        .hint-grid{
          width:100%;
          border-collapse:collapse;
          margin-top:0.6rem;
          font-size:0.82rem;
        }

        .hint-grid th,
        .hint-grid td{
          border:1px solid #e3d5c5;
          padding:6px 8px;
          text-align:center;
        }

        .hint-grid thead th{
          background:#f7efe5;
          font-weight:600;
        }

        .hint-letter{
          background:#f7efe5;
          font-weight:700;
          color:#3b2f2a;
        }

        .corner{
          background:#f7efe5;
        }

        .pair-section{
          margin-top:1rem;
          display:flex;
          flex-wrap:wrap;
          gap:6px;
          justify-content:center;
        }

        .pair-chip{
          display:flex;
          align-items:center;
          gap:4px;
          padding:3px 9px;
          border-radius:999px;
          background:#f2e6d7;
          font-size:0.75rem;
        }

        .pair{
          font-weight:600;
          color:#4a3a30;
        }

        .pair-count{
          color:#6f5a4d;
        }
      `}</style>
        </div>
    );
}