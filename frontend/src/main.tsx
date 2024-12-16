import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import MediasoupProvider from "./Mediasoup.tsx";

createRoot(document.getElementById("root")!).render(
  <MediasoupProvider>
    <App />
  </MediasoupProvider>
);
