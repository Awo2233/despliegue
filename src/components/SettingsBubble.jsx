import React, { useState } from "react";
import { Settings } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useVoiceAssist } from "../hooks/VoiceAssistContext";


export default function SettingsBubble() {
  const {
    fontSize,
    setFontSize,
    darkMode,
    setDarkMode,
    voiceAssist,
    setVoiceAssist,
  } = useSettings();

  const [open, setOpen] = useState(false);

  // Activar el asistente de voz solo si está habilitado
  useVoiceAssist(voiceAssist);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
      }}
    >
      {open && (
        <div
          style={{
            background: darkMode ? "#1e1e1e" : "white",
            color: darkMode ? "#f0f0f0" : "#333",
            borderRadius: "12px",
            padding: "1rem",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            width: "220px",
            marginBottom: "10px",
            fontSize:
              fontSize === "small"
                ? "14px"
                : fontSize === "large"
                ? "18px"
                : "16px",
            transition: "all 0.3s ease",
          }}
        >
          <h4 style={{ marginBottom: "8px" }}>⚙️ Ajustes</h4>

          {/* Tamaño de fuente */}
          <div style={{ marginBottom: "10px" }}>
            <label>🅰️ Tamaño de fuente</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              style={{
                width: "100%",
                padding: "4px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                marginTop: "4px",
              }}
            >
              <option value="small">Pequeña</option>
              <option value="medium">Mediana</option>
              <option value="large">Grande</option>
            </select>
          </div>

          {/* Modo oscuro */}
          <div style={{ marginBottom: "10px" }}>
            <label>
              🌙 Modo oscuro
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                style={{ marginLeft: "8px", cursor: "pointer" }}
              />
            </label>
          </div>

          {/* Asistente de voz */}
          <div>
            <label>
              🔊 Asistente de voz
              <input
                type="checkbox"
                checked={voiceAssist}
                onChange={(e) => setVoiceAssist(e.target.checked)}
                style={{ marginLeft: "8px", cursor: "pointer" }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Abrir ajustes"
        style={{
          background: darkMode ? "#333" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "56px",
          height: "56px",
          fontSize: "22px",
          cursor: "pointer",
          boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
        }}
      >
        <Settings />
      </button>
    </div>
  );
}
