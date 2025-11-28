import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@heroui/react";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HeroUIProvider>
          <ToastProvider />
          <App />
        </HeroUIProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
