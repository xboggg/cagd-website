import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";

const BUILD_ID = "20260722v1";
createRoot(document.getElementById("root")!).render(<App />);

// Unregister any existing service workers — they were intercepting image requests
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
}
