/* @refresh reset */
import React, { useEffect, useState } from "react";
import { SettingsContext } from "./settingsContextObject";

export function SettingsProvider({ children }) {
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("optica:fontSize") || "medium");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("optica:darkMode") === "true");
  const [voiceAssist, setVoiceAssist] = useState(() => localStorage.getItem("optica:voiceAssist") === "true");

  // 🔤 Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem("optica:fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("optica:darkMode", darkMode);
    // Apply dark-mode class so global CSS selectors can react, and keep inline fallbacks
    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.body.style.backgroundColor = "#121212";
      document.body.style.color = "#f0f0f0";
    } else {
      document.body.classList.remove("dark-mode");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#000000";
    }
    document.body.style.transition = "all 0.3s ease";
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("optica:voiceAssist", voiceAssist);
  }, [voiceAssist]);

  // 🔊 Aplicar tamaño de fuente global
  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === "small") root.style.fontSize = "14px";
    else if (fontSize === "large") root.style.fontSize = "18px";
    else root.style.fontSize = "16px";
  }, [fontSize]);

  return (
    <SettingsContext.Provider
      value={{
        fontSize,
        setFontSize,
        darkMode,
        setDarkMode,
        voiceAssist,
        setVoiceAssist,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// `useSettings` is provided from a separate file to keep this module
// focused on the provider component and to avoid fast-refresh HMR
// incompatibilities when exporting both components and non-components.
