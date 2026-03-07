import { Outlet, Link, useLocation } from "react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { to: "/spelling-bee", label: "Spelling Bee" },
  { to: "/mini", label: "The Mini" },
  { to: "/wordle", label: "Wordle" },
  { to: "/strands", label: "Strands" },
  { to: "/connections", label: "Connections" },
  { to: "/crossword", label: "Crossword" },
];

export function Root() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        fontFamily: "'Lato', sans-serif",
        background: "#FDFAF5",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #E8D5C4",
          background: "#FDFAF5",
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto w-full">
          <button
            className="md:hidden p-1 rounded"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link
            to="/"
            className="flex flex-col items-center mx-auto md:mx-0"
          >
            <div
              className="flex items-center gap-2"
              style={{
                fontFamily: "'Playfair Display', serif",
              }}
            >
              <span
                style={{
                  color: "#C9A84C",
                  fontSize: "0.65rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                ✦ Maryse & Francis ✦
              </span>
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#2C2422",
                letterSpacing: "0.04em",
                lineHeight: 1.1,
              }}
            >
              Wedding Games
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 opacity-0 pointer-events-none w-16" />
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-2 pb-1">
          <div
            style={{
              height: 1,
              width: 60,
              background:
                "linear-gradient(to right, transparent, #C9A84C)",
            }}
          />
          <span
            style={{ color: "#C9A84C", fontSize: "0.7rem" }}
          >
            ❦
          </span>
          <div
            style={{
              height: 1,
              width: 60,
              background:
                "linear-gradient(to left, transparent, #C9A84C)",
            }}
          />
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center justify-center gap-0 border-t border-[#E8D5C4]">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "0.6rem 1.1rem",
                  borderBottom: active
                    ? "2px solid #C9A84C"
                    : "2px solid transparent",
                  color: active ? "#C9A84C" : "#5C4A3A",
                  fontWeight: active ? 700 : 400,
                  transition: "all 0.15s",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden flex flex-col border-t border-[#E8D5C4]">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: "0.85rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "0.75rem 1.5rem",
                    borderLeft: active
                      ? "3px solid #C9A84C"
                      : "3px solid transparent",
                    color: active ? "#C9A84C" : "#5C4A3A",
                    fontWeight: active ? 700 : 400,
                    background: active
                      ? "#FFF5EC"
                      : "transparent",
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #E8D5C4",
          padding: "1.2rem",
          textAlign: "center",
          color: "#9C8170",
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span style={{ color: "#C9A84C" }}>✦</span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "0.85rem",
              color: "#7A5C4A",
              fontStyle: "italic",
            }}
          >
            Maryse & Francis
          </span>
          <span style={{ color: "#C9A84C" }}>✦</span>
        </div>
        <p>Made with love</p>
      </footer>
    </div>
  );
}