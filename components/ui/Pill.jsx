const TONE_STYLES = {
  success: { background: "var(--bg-success)", color: "var(--text-success)" },
  warning: { background: "var(--bg-warning)", color: "var(--text-warning)" },
  danger: { background: "var(--bg-danger)", color: "var(--text-danger)" },
  accent: { background: "var(--bg-accent)", color: "var(--text-accent)" },
  neutral: { background: "var(--surface-1)", color: "var(--text-secondary)" },
};

export default function Pill({ tone = "neutral", children }) {
  return <span className="pill" style={TONE_STYLES[tone]}>{children}</span>;
}
