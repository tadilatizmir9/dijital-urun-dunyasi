import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGA } from "./lib/ga";

// Initialize Google Analytics if measurement ID is set
initGA();

createRoot(document.getElementById("root")!).render(<App />);
