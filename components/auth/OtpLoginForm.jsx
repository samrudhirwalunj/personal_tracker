"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OtpLoginForm({ endpoint, title, subtitle, accentLabel = "Send code" }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState("phone"); // phone | code
  const [devCode, setDevCode] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send code");
      setDevCode(data.devCode || null);
      setStage("code");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not verify code");
      router.push(data.redirect || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="card"
      style={{ maxWidth: 380, margin: "60px auto", padding: "24px 26px" }}
    >
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 17, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{subtitle}</div>
      </div>

      <form
        onSubmit={stage === "phone" ? sendCode : verifyCode}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        <div>
          <label className="field-label">Mobile number</label>
          <input
            type="tel"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={stage === "code"}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        {stage === "code" && (
          <div>
            <label className="field-label">Enter the 6-digit code sent to {phone}</label>
            <input
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
              style={{ width: "100%", marginTop: 4, letterSpacing: 3 }}
            />
            {devCode && (
              <div style={{ fontSize: 11, color: "var(--text-warning)", marginTop: 6 }}>
                No SMS provider configured (local dev) — use code <strong>{devCode}</strong>.
              </div>
            )}
          </div>
        )}

        {error && <div className="error-text">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
          {loading
            ? stage === "phone"
              ? "Sending…"
              : "Verifying…"
            : stage === "phone"
              ? accentLabel
              : "Verify & continue"}
        </button>

        {stage === "code" && (
          <button
            type="button"
            onClick={() => {
              setStage("phone");
              setCode("");
              setDevCode(null);
              setError("");
            }}
            style={{ fontSize: 11.5 }}
          >
            Use a different number
          </button>
        )}
      </form>
    </div>
  );
}
