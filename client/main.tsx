import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Initialize React app
const container = document.getElementById("root")!;

// Store root in a global variable to prevent recreation during HMR
declare global {
  var __reactRoot: ReturnType<typeof createRoot> | undefined;
}

// Create root only once, reuse during HMR
let root = globalThis.__reactRoot;
if (!root) {
  root = globalThis.__reactRoot = createRoot(container);
}

// Render the app
root.render(<App />);
