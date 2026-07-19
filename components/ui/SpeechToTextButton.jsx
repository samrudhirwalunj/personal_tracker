"use client";

import { useRef, useState } from "react";

// Uses the browser's built-in Web Speech API — no server, no API key, audio
// never touches our backend (the browser vendor's recognition service is the
// only third party involved, same as any native "tap mic to dictate" field).
export default function SpeechToTextButton({ onResult, title = "Speak to type" }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  function toggle() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  if (!supported) {
    return (
      <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Voice input not supported here</span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? "Stop listening" : title}
      style={{
        fontSize: 13,
        padding: "5px 9px",
        color: listening ? "var(--text-danger)" : "var(--text-secondary)",
      }}
    >
      {listening ? "⏹" : "🎤"}
    </button>
  );
}
