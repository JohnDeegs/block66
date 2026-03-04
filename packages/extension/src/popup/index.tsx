import "webextension-polyfill"; // must be first — sets up `browser` global
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MiniStatus } from "./components/MiniStatus";
import "./styles.css";

const root = document.getElementById("root")!;
createRoot(root).render(
  <StrictMode>
    <MiniStatus />
  </StrictMode>
);
