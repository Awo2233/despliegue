import React, { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

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
    document.body.style.backgroundColor = darkMode ? "#121212" : "#ffffff";
    document.body.style.color = darkMode ? "#f0f0f0" : "#000000";
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

export function useSettings() {
  return useContext(SettingsContext);
}
