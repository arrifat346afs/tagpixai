import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./_components/css/index.css";
import App from "./App.tsx";
import { FileProvider } from "./_components/context/FileContext.tsx";
import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <FileProvider>
          <App />
          <Toaster />
        </FileProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>
);
