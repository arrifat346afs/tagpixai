import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { FileProvider } from "./components/FileContext.tsx";
import { HashRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <FileProvider>
        <App />
      </FileProvider>
    </HashRouter>
  </StrictMode>
);


