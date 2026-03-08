import { createHashRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./pages/Home";
import { SpellingBee } from "./pages/SpellingBee";
import { Mini } from "./pages/Mini";
import { WordleGame } from "./pages/Wordle";
import { Strands } from "./pages/Strands";
import { Connections } from "./pages/Connections";
import { CrosswordGame } from "./pages/Crossword";

export const router = createHashRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "spelling-bee", Component: SpellingBee },
      { path: "mini", Component: Mini },
      { path: "wordle", Component: WordleGame },
      { path: "strands", Component: Strands },
      { path: "connections", Component: Connections },
      { path: "crossword", Component: CrosswordGame },
    ],
  },
],
);