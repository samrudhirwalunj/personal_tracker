export default function BatteryIndicator({ percent = 0, width = 22, height = 42 }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fillHeight = 49 * (clamped / 100);
  const fillY = 9.5 + (49 - fillHeight);
  const color =
    clamped >= 66 ? "var(--fill-success)" : clamped >= 33 ? "var(--fill-warning)" : "var(--fill-danger)";

  return (
    <svg width={width} height={height} viewBox="0 0 34 64">
      <rect x="12" y="2" width="10" height="4" rx="1" fill="var(--border-strong)" />
      <rect x="4" y="6" width="26" height="56" rx="4" fill="none" stroke="var(--border-strong)" strokeWidth="2.5" />
      <rect x="7" y="9.5" width="20" height="49" rx="2" fill="var(--surface-1)" />
      <rect x="7" y={fillY} width="20" height={fillHeight} rx="2" fill={color} />
    </svg>
  );
}
