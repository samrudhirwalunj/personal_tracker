"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FOCUS_AREAS = ["Health", "Career", "Mindfulness", "Finance"];

const EMPTY_PROFILE = {
  name: "",
  birthDate: "",
  gender: "Prefer not to say",
  jobType: "",
  lifestyle: "Sedentary",
  wakeTime: "",
  focusArea: "Health",
  healthNotes: "",
  selfReview: "",
  bestThing: "",
  reminderOptIn: true,
};

function StepBar({ step }) {
  const segments = ["phone", "code", "profile"];
  const activeIndex = segments.indexOf(step);
  return (
    <div style={{ display: "flex", gap: 5, marginTop: 12 }}>
      {segments.map((s, i) => (
        <div
          key={s}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: i <= activeIndex ? "var(--fill-success)" : "var(--border)",
          }}
        />
      ))}
    </div>
  );
}

export default function GettingStartedFlow() {
  const router = useRouter();
  const [step, setStep] = useState("phone"); // phone | code | profile
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState(null);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function sendCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send code");
      setDevCode(data.devCode || null);
      setStep("code");
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
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not verify code");

      if (data.status === "existing") {
        router.push(data.redirect || "/dashboard");
        router.refresh();
        return;
      }
      setStep("profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitProfile(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          wakeTime: profile.wakeTime || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save your profile");
      router.push(data.redirect || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 460, margin: "40px auto", overflow: "hidden" }}>
      <div style={{ padding: "18px 22px 12px", textAlign: "center" }}>
        <div style={{ fontSize: 17, fontWeight: 500 }}>Getting started</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          {step === "profile" ? "Tell us a bit about yourself" : "Verify your mobile number to continue"}
        </div>
        <StepBar step={step} />
      </div>

      {(step === "phone" || step === "code") && (
        <form
          onSubmit={step === "phone" ? sendCode : verifyCode}
          style={{ padding: "14px 22px 22px", display: "flex", flexDirection: "column", gap: 10 }}
        >
          <div>
            <label className="field-label">Mobile number</label>
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={step === "code"}
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>

          {step === "code" && (
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
              ? step === "phone"
                ? "Sending…"
                : "Verifying…"
              : step === "phone"
                ? "Send code"
                : "Verify & continue"}
          </button>

          {step === "code" && (
            <button
              type="button"
              onClick={() => {
                setStep("phone");
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
      )}

      {step === "profile" && (
        <form
          onSubmit={submitProfile}
          style={{ padding: "6px 22px 22px", display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">Name</label>
              <input
                value={profile.name}
                onChange={(e) => setField("name", e.target.value)}
                required
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Date of birth</label>
              <input
                type="date"
                value={profile.birthDate}
                onChange={(e) => setField("birthDate", e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setField("gender", e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              >
                <option>Prefer not to say</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Usual wake time</label>
              <input
                type="time"
                value={profile.wakeTime}
                onChange={(e) => setField("wakeTime", e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>
          </div>

          <div>
            <label className="field-label">Job type</label>
            <input
              placeholder="e.g. Desk job, field work, student"
              value={profile.jobType}
              onChange={(e) => setField("jobType", e.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>

          <div>
            <label className="field-label">Lifestyle</label>
            <select
              value={profile.lifestyle}
              onChange={(e) => setField("lifestyle", e.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            >
              <option>Sedentary</option>
              <option>Lightly active</option>
              <option>Active</option>
              <option>Very active</option>
            </select>
          </div>

          <div>
            <label className="field-label">What&apos;s your main focus right now?</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              {FOCUS_AREAS.map((area) => {
                const active = profile.focusArea === area;
                return (
                  <span
                    key={area}
                    onClick={() => setField("focusArea", area)}
                    style={{
                      cursor: "pointer",
                      fontSize: 11,
                      padding: "5px 10px",
                      borderRadius: 14,
                      background: active ? "var(--fill-success)" : "transparent",
                      color: active ? "var(--on-success)" : "var(--text-secondary)",
                      border: active ? "none" : "0.5px solid var(--border-strong)",
                    }}
                  >
                    {area}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <label className="field-label">Any health conditions or allergies we should know?</label>
            <input
              placeholder="Optional"
              value={profile.healthNotes}
              onChange={(e) => setField("healthNotes", e.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>

          <div>
            <label className="field-label">Self review of your life till now</label>
            <textarea
              value={profile.selfReview}
              onChange={(e) => setField("selfReview", e.target.value)}
              style={{ width: "100%", height: 64, marginTop: 4 }}
            />
          </div>

          <div>
            <label className="field-label">Best thing you&apos;ve done in life till now</label>
            <textarea
              value={profile.bestThing}
              onChange={(e) => setField("bestThing", e.target.value)}
              style={{ width: "100%", height: 64, marginTop: 4 }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--surface-1)",
              borderRadius: "var(--radius)",
              padding: "9px 12px",
            }}
          >
            <span style={{ fontSize: 12 }}>Send me a daily reminder</span>
            <input
              type="checkbox"
              checked={profile.reminderOptIn}
              onChange={(e) => setField("reminderOptIn", e.target.checked)}
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Saving…" : "Continue to dashboard"}
          </button>
        </form>
      )}
    </div>
  );
}
