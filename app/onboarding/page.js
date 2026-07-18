"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FOCUS_AREAS = ["Health", "Career", "Mindfulness", "Finance"];

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Prefer not to say",
    jobType: "",
    lifestyle: "Sedentary",
    wakeTime: "",
    focusArea: "Health",
    healthNotes: "",
    selfReview: "",
    bestThing: "",
    reminderOptIn: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: form.age ? Number(form.age) : null,
          wakeTime: form.wakeTime || null,
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
    <div
      className="card"
      style={{ maxWidth: 460, margin: "40px auto", overflow: "hidden" }}
    >
      <div style={{ padding: "18px 22px 12px", textAlign: "center" }}>
        <div style={{ fontSize: 17, fontWeight: 500 }}>Getting started</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          Tell us a bit about yourself
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ padding: "6px 22px 22px", display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label className="field-label">Name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="field-label">Age</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label className="field-label">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
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
              value={form.wakeTime}
              onChange={(e) => set("wakeTime", e.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>
        </div>

        <div>
          <label className="field-label">Job type</label>
          <input
            placeholder="e.g. Desk job, field work, student"
            value={form.jobType}
            onChange={(e) => set("jobType", e.target.value)}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        <div>
          <label className="field-label">Lifestyle</label>
          <select
            value={form.lifestyle}
            onChange={(e) => set("lifestyle", e.target.value)}
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
              const active = form.focusArea === area;
              return (
                <span
                  key={area}
                  onClick={() => set("focusArea", area)}
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
            value={form.healthNotes}
            onChange={(e) => set("healthNotes", e.target.value)}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        <div>
          <label className="field-label">Self review of your life till now</label>
          <textarea
            value={form.selfReview}
            onChange={(e) => set("selfReview", e.target.value)}
            style={{ width: "100%", height: 64, marginTop: 4 }}
          />
        </div>

        <div>
          <label className="field-label">Best thing you&apos;ve done in life till now</label>
          <textarea
            value={form.bestThing}
            onChange={(e) => set("bestThing", e.target.value)}
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
            checked={form.reminderOptIn}
            onChange={(e) => set("reminderOptIn", e.target.checked)}
          />
        </div>

        {error && <div className="error-text">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? "Saving…" : "Continue to dashboard"}
        </button>
      </form>
    </div>
  );
}
