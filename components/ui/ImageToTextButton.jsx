"use client";

import { useRef, useState } from "react";

// OCR via Tesseract.js, loaded lazily and run entirely client-side (WASM) —
// the photo is never uploaded anywhere, matching the app's local-first data
// story. `capture="environment"` opens the rear camera directly on mobile,
// while desktop just falls back to a normal file picker.
export default function ImageToTextButton({ onResult, title = "Scan text from a photo" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    try {
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(file, "eng");
      const text = data.text.trim();
      if (text) {
        onResult(text);
      } else {
        alert("Couldn't find any text in that image.");
      }
    } catch (err) {
      alert("Text extraction failed: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        title={title}
        style={{ fontSize: 13, padding: "5px 9px", color: "var(--text-secondary)" }}
      >
        {busy ? "…" : "📷"}
      </button>
    </>
  );
}
