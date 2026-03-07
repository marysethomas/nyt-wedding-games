import { useState } from "react";
import { Link } from "react-router";

// ── Puzzle config ────────────────────────────────────────────────────────────
// 4 categories, each with 4 words. Difficulty: 1=easiest, 4=hardest
const CATEGORIES = [
  {
    id: 1,
    title: "Places we've been",
    color: "#F9E4C8",
    border: "#E8C97A",
    text: "#7A5010",
    dot: "#C9A84C",
    words: ["WHITEHORSE", "SYDNEY", "TURKEY", "AZORES"],
    difficulty: 1,
  },
  {
    id: 2,
    title: "Furry friends",
    color: "#D4F0D4",
    border: "#90C890",
    text: "#1E5A1E",
    dot: "#5A9B5A",
    words: ["SADE", "PETE", "OLLIE", "URSA"],
    difficulty: 2,
  },
  {
    id: 3,
    title: "Bands we love",
    color: "#D4E4FF",
    border: "#90A8E0",
    text: "#1A3070",
    dot: "#4A6CB8",
    words: ["THE XX", "JUSTICE", "BREAKBOT", "BEACH HOUSE"],
    difficulty: 3,
  },
  {
    id: 4,
    title: "Streets we've lived on",
    color: "#F0D4F4",
    border: "#C090CC",
    text: "#5A1A6A",
    dot: "#8B4A9B",
    words: ["DOVER", "ESPLANADE", "BERNARD", "HOTEL-DE-VILLE"],
    difficulty: 4,
  },
];

const MAX_MISTAKES = 4;

// Shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ALL_WORDS = shuffle(CATEGORIES.flatMap((c) => c.words));
export function Connections() {
  const [words, setWords] = useState<string[]>(ALL_WORDS);
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<{
    text: string;
    type: "ok" | "err" | "close";
  } | null>(null);
  const [shake, setShake] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const showMsg = (
    text: string,
    type: "ok" | "err" | "close",
  ) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const toggleWord = (word: string) => {
    if (gameOver) return;
    setSelected((prev) => {
      if (prev.includes(word))
        return prev.filter((w) => w !== word);
      if (prev.length >= 4) return prev;
      return [...prev, word];
    });
  };

  const submit = () => {
    if (selected.length !== 4) {
      showMsg("Select 4 words", "err");
      return;
    }
    const match = CATEGORIES.find(
      (cat) =>
        !solved.includes(cat.id) &&
        selected.every((w) => cat.words.includes(w)) &&
        cat.words.every((w) => selected.includes(w)),
    );

    if (match) {
      const newSolved = [...solved, match.id];
      setSolved(newSolved);
      setWords((prev) =>
        prev.filter((w) => !match.words.includes(w)),
      );
      setSelected([]);
      showMsg(`✦ ${match.title} ✦`, "ok");
      if (newSolved.length === CATEGORIES.length) {
        setWon(true);
        setGameOver(true);
      }
    } else {
      // Check if one away
      const oneAway = CATEGORIES.some((cat) => {
        if (solved.includes(cat.id)) return false;
        return (
          selected.filter((w) => cat.words.includes(w))
            .length === 3
        );
      });
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (oneAway) showMsg("One away! 💫", "close");
      else showMsg("Not quite…", "err");
      setSelected([]);
      if (newMistakes >= MAX_MISTAKES) {
        setGameOver(true);
      }
    }
  };

  const deselectAll = () => setSelected([]);

  const solvedCategories = CATEGORIES.filter((c) =>
    solved.includes(c.id),
  ).sort((a, b) => a.difficulty - b.difficulty);
  const remainingWords = words;

  return (
    <div
      className="max-w-xl mx-auto px-4 py-6 flex flex-col items-center"
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
        Connections 💍
      </h1>
      <p
        style={{
          color: "#7A5C4A",
          fontSize: "0.82rem",
          marginBottom: "0.6rem",
          textAlign: "center",
        }}
      >
        Find four groups of four related words.
      </p>

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
                  : message.type === "close"
                    ? "#FFF5E0"
                    : "#FFE8E8",
              color:
                message.type === "ok"
                  ? "#4A8A3A"
                  : message.type === "close"
                    ? "#8A6A20"
                    : "#C04040",
              border: `1px solid ${message.type === "ok" ? "#A8D090" : message.type === "close" ? "#E8D090" : "#E8A0A0"}`,
              fontSize: "0.85rem",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Solved categories */}
      {solvedCategories.map((cat) => (
        <div
          key={cat.id}
          className="w-full mb-2 rounded-xl p-3 text-center"
          style={{
            background: cat.color,
            border: `2px solid ${cat.border}`,
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: cat.text,
              fontSize: "0.88rem",
              marginBottom: "0.25rem",
            }}
          >
            {cat.title}
          </div>
          <div
            style={{
              color: cat.text,
              fontSize: "0.78rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {cat.words.join(" · ")}
          </div>
        </div>
      ))}

      {/* Word grid */}
      {!gameOver && (
        <div
          className="w-full grid grid-cols-4 gap-2 mb-4"
          style={{
            animation: shake ? "shake 0.4s ease" : undefined,
          }}
        >
          {remainingWords.map((word) => {
            const isSel = selected.includes(word);
            return (
              <button
                key={word}
                onClick={() => toggleWord(word)}
                style={{
                  background: isSel ? "#2C2422" : "#FFF5E8",
                  border: `2px solid ${isSel ? "#2C2422" : "#E8D5C4"}`,
                  borderRadius: "8px",
                  padding: "0.7rem 0.3rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: isSel ? "#fff" : "#5C4A3A",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  transition: "all 0.15s",
                  fontFamily: "'Lato', sans-serif",
                  minHeight: "58px",
                  lineHeight: 1.3,
                }}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}

      {/* Game over reveal */}
      {gameOver && !won && (
        <div className="w-full">
          {CATEGORIES.filter((c) => !solved.includes(c.id)).map(
            (cat) => (
              <div
                key={cat.id}
                className="w-full mb-2 rounded-xl p-3 text-center"
                style={{
                  background: cat.color,
                  border: `2px solid ${cat.border}`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    color: cat.text,
                    fontSize: "0.88rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  {cat.title}
                </div>
                <div
                  style={{
                    color: cat.text,
                    fontSize: "0.78rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {cat.words.join(" · ")}
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* Win message */}
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
            Congratulations!
          </div>
          <p style={{ color: "#7A5C4A", fontSize: "0.85rem" }}>
            You found all the connections!
          </p>
        </div>
      )}

      {/* Mistakes */}
      {!gameOver && (
        <div className="flex items-center gap-2 mb-4">
          <span
            style={{ color: "#7A5C4A", fontSize: "0.8rem" }}
          >
            Mistakes remaining:
          </span>
          {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                display: "inline-block",
                background:
                  i < MAX_MISTAKES - mistakes
                    ? "#5C4A3A"
                    : "#E8D5C4",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      {!gameOver && (
        <div className="flex items-center gap-3">
          <button
            onClick={deselectAll}
            style={{
              border: "1.5px solid #D0BCA8",
              borderRadius: "999px",
              padding: "0.45rem 1.1rem",
              background: "transparent",
              color: "#5C4A3A",
              fontSize: "0.82rem",
              cursor: "pointer",
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Deselect All
          </button>
          <button
            onClick={submit}
            disabled={selected.length !== 4}
            style={{
              border: "2px solid #C9A84C",
              borderRadius: "999px",
              padding: "0.45rem 1.4rem",
              background:
                selected.length === 4 ? "#C9A84C" : "#F5ECD8",
              color: selected.length === 4 ? "#fff" : "#C0A060",
              fontSize: "0.82rem",
              cursor:
                selected.length === 4
                  ? "pointer"
                  : "not-allowed",
              fontWeight: 700,
              fontFamily: "'Lato', sans-serif",
              transition: "all 0.15s",
            }}
          >
            Submit
          </button>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
      `}</style>
    </div>
  );
}