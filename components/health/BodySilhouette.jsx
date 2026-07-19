export default function BodySilhouette() {
  return (
    <svg width="90" height="220" viewBox="0 0 90 220" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="45" cy="24" r="16" stroke="var(--border-strong)" strokeWidth="2" />
      <path
        d="M45 40 C 22 44, 16 62, 18 88 L 22 140 L 30 140 L 33 96
           C 33 96, 34 150, 30 190 L 30 214 L 42 214 L 46 150
           L 50 150 L 54 214 L 66 214 L 66 190 C 62 150, 63 96, 63 96
           L 66 140 L 74 140 L 78 88 C 80 62, 74 44, 45 40 Z"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
