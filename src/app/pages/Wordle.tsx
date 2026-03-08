import {useState, useEffect, useCallback, useRef} from "react";
import {Link} from "react-router";

// Valid word list comes from dracos/valid-wordle-words.txt
// https://gist.github.com/dracos/dd0668f281e685bad51479e5acaadb93
import wordListText from "../../assets/valid-wordle-words.txt?raw";

// ── Puzzle config ────────────────────────────────────────────────────────────
const WORD = "TOAST"; // ← Target 5-letter word

const VALID_GUESSES: Set<string> = new Set(
    wordListText
        .split("\n")
        .map((w) => w.trim().toUpperCase())
        .filter((w) => w.length === 5)
);

type LetterState =
    | "correct"
    | "present"
    | "absent"
    | "empty"
    | "active";

interface GuessLetter {
    letter: string;
    state: LetterState;
}

const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const STATE_COLORS: Record<
    LetterState,
    { bg: string; border: string; text: string }
> = {
    correct: {bg: "#5A9B5A", border: "#4A8A4A", text: "#fff"},
    present: {bg: "#C9A84C", border: "#A88030", text: "#fff"},
    absent: {bg: "#8A7A70", border: "#7A6A60", text: "#fff"},
    empty: {bg: "#fff", border: "#D0BCA8", text: "#2C2422"},
    active: {bg: "#fff", border: "#2C2422", text: "#2C2422"},
};

function evaluateGuess(
    guess: string,
    target: string,
): LetterState[] {
    const result: LetterState[] = Array(5).fill("absent");
    const targetArr = target.split("");
    const guessArr = guess.split("");
    const used = Array(5).fill(false);

    // First pass: correct
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] === targetArr[i]) {
            result[i] = "correct";
            used[i] = true;
        }
    }
    // Second pass: present
    for (let i = 0; i < 5; i++) {
        if (result[i] === "correct") continue;
        const j = targetArr.findIndex(
            (l, idx) => l === guessArr[i] && !used[idx],
        );
        if (j !== -1) {
            result[i] = "present";
            used[j] = true;
        }
    }
    return result;
}

export function WordleGame() {

    const [guesses, setGuesses] = useState<GuessLetter[][]>([]);
    const [currentGuess, setCurrentGuess] = useState<string[]>(
        [],
    );
    const [gameState, setGameState] = useState<
        "playing" | "won" | "lost"
    >("playing");
    const [message, setMessage] = useState<string | null>(null);
    const [revealed, setRevealed] = useState<boolean[][]>([]);
    const [keyStates, setKeyStates] = useState<
        Record<string, LetterState>
    >({});
    const [shake, setShake] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const MAX_GUESSES = 6;

    const showMsg = (text: string, duration = 2000) => {
        setMessage(text);
        if (duration > 0)
            setTimeout(() => setMessage(null), duration);
    };

    const submitGuess = useCallback(() => {
        if (gameState !== "playing") return;
        const word = currentGuess.join("");
        if (word.length < 5) {
            showMsg("Not enough letters");
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }
        if (!VALID_GUESSES.has(word)) {
            showMsg("Not in word list");
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        const states = evaluateGuess(word, WORD);
        const newGuess = currentGuess.map((l, i) => ({
            letter: l,
            state: states[i] as LetterState,
        }));
        const newGuesses = [...guesses, newGuess];
        setGuesses(newGuesses);
        setCurrentGuess([]);

        // Animate reveal
        const newRevealed = [...revealed, Array(5).fill(false)];
        setRevealed(newRevealed);
        states.forEach((_, i) => {
            setTimeout(() => {
                setRevealed((prev) => {
                    const upd = prev.map((row) => [...row]);
                    upd[newGuesses.length - 1][i] = true;
                    return upd;
                });
            }, i * 300);
        });

        // Update key states after reveal
        setTimeout(
            () => {
                setKeyStates((prev) => {
                    const next = {...prev};
                    newGuess.forEach(({letter, state}) => {
                        const cur = next[letter];
                        if (
                            !cur ||
                            cur === "absent" ||
                            (cur === "present" && state === "correct")
                        ) {
                            next[letter] = state;
                        }
                    });
                    return next;
                });

                const won = states.every((s) => s === "correct");
                if (won) {
                    setGameState("won");
                    const msgs = [
                        "Brilliant! 💍",
                        "Amazing! 💐",
                        "Lovely! 🌸",
                        "Nice! 🌷",
                        "Good! 🌱",
                        "Phew! 😅",
                    ];

                    showMsg(
                        msgs[
                            Math.min(newGuesses.length - 1, msgs.length - 1)
                            ],
                        0,
                    );
                } else if (newGuesses.length >= MAX_GUESSES) {
                    setGameState("lost");
                    showMsg(`The word was ${WORD}`, 0);
                }
            },
            5 * 300 + 300,
        );
    }, [currentGuess, guesses, gameState, revealed]);

    const onKey = (key: string) => {
        if (gameState !== "playing") return;
        if (key === "ENTER") {
            submitGuess();
            return;
        }
        if (key === "⌫") {
            setCurrentGuess((p) => p.slice(0, -1));
            return;
        }
        if (currentGuess.length < 5)
            setCurrentGuess((p) => [...p, key]);
    };

    // Build all rows
    const rows: {
        letters: { letter: string; state: LetterState }[];
        rowIndex: number;
    }[] = [];
    for (let i = 0; i < MAX_GUESSES; i++) {
        if (i < guesses.length) {
            rows.push({letters: guesses[i], rowIndex: i});
        } else if (
            i === guesses.length &&
            gameState === "playing"
        ) {
            const letters = Array(5)
                .fill(null)
                .map((_, j) => ({
                    letter: currentGuess[j] ?? "",
                    state: (currentGuess[j]
                        ? "active"
                        : "empty") as LetterState,
                }));
            rows.push({letters, rowIndex: i});
        } else {
            rows.push({
                letters: Array(5).fill({
                    letter: "",
                    state: "empty" as LetterState,
                }),
                rowIndex: i,
            });
        }
    }

    return (
        <div
            className="max-w-lg mx-auto px-4 py-6 flex flex-col items-center"
            style={{fontFamily: "'Lato', sans-serif"}}
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
                Wordle 💌
            </h1>
            <p
                style={{
                    color: "#7A5C4A",
                    fontSize: "0.82rem",
                    marginBottom: "1rem",
                }}
            >
                Guess the 5-letter word in 6 tries.
            </p>

            {/* Message */}
            <div
                style={{minHeight: "36px", marginBottom: "0.5rem"}}
            >
                {message && (
                    <div
                        style={{
                            padding: "0.4rem 1.2rem",
                            borderRadius: "8px",
                            background:
                                gameState === "won"
                                    ? "#E8F5E0"
                                    : gameState === "lost"
                                        ? "#FFE8E8"
                                        : "#2C2422",
                            color:
                                gameState === "won"
                                    ? "#4A8A3A"
                                    : gameState === "lost"
                                        ? "#C04040"
                                        : "#fff",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            textAlign: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        }}
                    >
                        {message}
                    </div>
                )}
            </div>

            {/* Hidden input for mobile keyboards */}
            <input
                ref={inputRef}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                value={currentGuess.join("")}
                onChange={(e) => {
                    const val = e.target.value.toUpperCase().slice(0, 5);
                    setCurrentGuess(val.split(""));
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        submitGuess();
                    } else if (e.key === "Backspace") {
                        setCurrentGuess((p) => p.slice(0, -1));
                    }
                }}
                style={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none",
                    height: 0,
                    width: 0,
                }}
            />

            {/* Grid */}
            <div className="flex flex-col gap-1.5 mb-6">
                {rows.map(({letters, rowIndex}) => {
                    const isCurrentRow =
                        rowIndex === guesses.length &&
                        gameState === "playing";
                    return (
                        <div
                            key={rowIndex}
                            className="flex gap-1.5"
                            style={{
                                animation:
                                    isCurrentRow && shake
                                        ? "shake 0.4s ease"
                                        : undefined,
                            }}
                            onClick={() => {
                                inputRef.current?.focus();
                                setShowKeyboard(true);
                            }}
                        >
                            {letters.map((cell, ci) => {
                                const isRevealed =
                                    revealed[rowIndex]?.[ci] ?? false;
                                const showState = rowIndex < guesses.length;
                                const state = showState
                                    ? isRevealed
                                        ? cell.state
                                        : "empty"
                                    : cell.state;
                                const colors = STATE_COLORS[state];
                                return (
                                    <div
                                        key={ci}
                                        style={{
                                            width: 58,
                                            height: 58,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: `2px solid ${colors.border}`,
                                            borderRadius: "4px",
                                            background: colors.bg,
                                            fontSize: "1.4rem",
                                            fontWeight: 700,
                                            color: colors.text,
                                            transition:
                                                "background 0.15s, border 0.15s",
                                            transform:
                                                showState && isRevealed
                                                    ? "rotateX(0deg)"
                                                    : "rotateX(0deg)",
                                            letterSpacing: "0.02em",
                                        }}
                                    >
                                        {cell.letter}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Keyboard */}
            <div className="flex flex-col items-center gap-1.5 w-full">
                {KEYBOARD_ROWS.map((row, ri) => (
                    <div key={ri} className="flex gap-1 justify-center">
                        {row.map((key) => {
                            const state = keyStates[key];
                            const colors = state
                                ? STATE_COLORS[state]
                                : {
                                    bg: "#E8DDD4",
                                    border: "#D0BCA8",
                                    text: "#2C2422",
                                };
                            const isWide = key === "ENTER" || key === "⌫";
                            return (
                                <button
                                    key={key}
                                    onClick={() => onKey(key)}
                                    style={{
                                        width: isWide ? 54 : 34,
                                        height: 52,
                                        borderRadius: "4px",
                                        border: `1px solid ${colors.border}`,
                                        background: colors.bg,
                                        color: colors.text,
                                        fontSize: isWide ? "0.62rem" : "0.9rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        transition: "background 0.2s",
                                        padding: 0,
                                        fontFamily: "'Lato', sans-serif",
                                        letterSpacing: isWide ? "0.02em" : "0",
                                    }}
                                >
                                    {key}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
      `}</style>
        </div>
    );
}