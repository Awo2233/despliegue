/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";

const VoiceAssistContext = createContext();

export function VoiceAssistProvider({ children }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;

    const synth = window.speechSynthesis;

    const handleMouseEnter = (e) => {
      const text = e.target.innerText || e.target.value || "";
      if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        synth.cancel();
        synth.speak(utterance);
      }
    };

    document.querySelectorAll("button, p, h1, h2, h3, h4, label, span, a").forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
    });

    return () => {
      document.querySelectorAll("button, p, h1, h2, h3, h4, label, span, a").forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
      });
      synth.cancel();
    };
  }, [active]);

  return (
    <VoiceAssistContext.Provider value={{ active, setActive }}>
      {children}
    </VoiceAssistContext.Provider>
  );
}

export function useVoiceAssist() {
  return useContext(VoiceAssistContext);
}
