import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Set GA measurement ID for HTML script
const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (gaId && typeof window !== "undefined") {
  (window as any).__VITE_GA_MEASUREMENT_ID__ = gaId;
}

createRoot(document.getElementById("root")!).render(<App />);
