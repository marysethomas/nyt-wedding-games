import { Link } from "react-router";

const games = [
  {
    to: "/spelling-bee",
    title: "Spelling Bee",
    description: "How many words can you make with 7 letters?",
    icon: "🐝",
    color: "#F9E4C8",
    border: "#E8C97A",
    accent: "#C9A84C",
    badge: "Daily",
  },
  {
    to: "/mini",
    title: "The Mini",
    description: "A bite-sized crossword puzzle.",
    icon: "🔔",
    color: "#F2E8FF",
    border: "#C9B0E8",
    accent: "#8B6DB8",
    badge: "Daily",
  },
  {
    to: "/wordle",
    title: "Wordle",
    description: "Guess the mystery 5-letter word in 6 tries.",
    icon: "💌",
    color: "#E8F2E8",
    border: "#A8C5A0",
    accent: "#5A9B5A",
    badge: "Daily",
  },
  {
    to: "/strands",
    title: "Strands",
    description: "Uncover hidden words and reveal the theme.",
    icon: "💐",
    color: "#FFE8EE",
    border: "#E8B4C4",
    accent: "#C4607A",
    badge: "Daily",
  },
  {
    to: "/connections",
    title: "Connections",
    description: "Group words that share a common thread.",
    icon: "💍",
    color: "#E8F0FF",
    border: "#A0B8E8",
    accent: "#4A6CB8",
    badge: "Daily",
  },
  {
    to: "/crossword",
    title: "Crossword",
    description:
      "The NYT crossword from November 28, 2015 — our anniversary.",
    icon: "💒",
    color: "#FFF0F5",
    border: "#E8B4CC",
    accent: "#B85070",
    badge: "Anniversary",
  },
];

export function Home() {
  return (
    <div
      className="max-w-4xl mx-auto px-4 py-8"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      {/* Hero */}
      <div className="text-center mb-10">
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.5rem, 4vw, 2.4rem)",
            color: "#2C2422",
            marginBottom: "0.5rem",
            fontWeight: 700,
          }}
        >
          Maryse & Francis
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.8rem, 5vw, 3rem)",
            color: "#C9A84C",
            fontStyle: "italic",
            lineHeight: 1.1,
            marginBottom: "1rem",
          }}
        >
          Wedding Games
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            style={{
              height: 1,
              width: 80,
              background:
                "linear-gradient(to right, transparent, #C9A84C)",
            }}
          />
          <span style={{ color: "#C9A84C", fontSize: "1rem" }}>
            ❧
          </span>
          <div
            style={{
              height: 1,
              width: 80,
              background:
                "linear-gradient(to left, transparent, #C9A84C)",
            }}
          />
        </div>

        <p
          style={{
            color: "#7A5C4A",
            fontSize: "1rem",
            maxWidth: "480px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          Grab a cup of coffee and enjoy the games we love to
          play together, inspired by the New York Times.
        </p>
      </div>

      {/* Date badge */}
      <div className="flex justify-center mb-8">
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#FFF5EC",
            border: "1px solid #E8C97A",
            borderRadius: "999px",
            padding: "0.35rem 1.1rem",
            fontSize: "0.8rem",
            color: "#8B6040",
            letterSpacing: "0.05em",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          <span>✦</span>
          <span>Today's Puzzles — June 27, 2026</span>
          <span>✦</span>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Link
            key={game.to}
            to={game.to}
            style={{ textDecoration: "none" }}
            className="group"
          >
            <div
              style={{
                background: "#fff",
                border: `1px solid #E8D5C4`,
                borderRadius: "12px",
                padding: "1.4rem",
                transition: "all 0.2s ease",
                cursor: "pointer",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              className="hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: game.color,
                    border: `1px solid ${game.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                  }}
                >
                  {game.icon}
                </div>
              </div>
              {/* Title */}
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "#2C2422",
                  marginBottom: "0.4rem",
                }}
              >
                {game.title}
              </h2>
              {/* Description */}
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#7A5C4A",
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                {game.description}
              </p>
              {/* Play button */}
              <div
                className="mt-4 flex items-center gap-1"
                style={{
                  color: game.accent,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                Play now
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Decorative bottom */}
      <div
        className="text-center mt-12"
        style={{
          color: "#C9A84C",
          fontSize: "1.2rem",
          letterSpacing: "0.3em",
        }}
      >
        ✦ ✦ ✦
      </div>
    </div>
  );
}