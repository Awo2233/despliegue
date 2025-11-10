import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { SettingsProvider } from "./context/SettingsContext";
import { VoiceAssistProvider } from "./hooks/VoiceAssistContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);
