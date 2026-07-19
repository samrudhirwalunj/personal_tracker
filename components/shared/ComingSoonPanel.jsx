export default function ComingSoonPanel({ title, description }) {
  return (
    <div>
      <div className="page-title">{title}</div>
      <div className="card" style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🚧</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Coming soon</div>
        <div className="muted" style={{ fontSize: 12.5, maxWidth: 360, margin: "0 auto" }}>
          {description}
        </div>
      </div>
    </div>
  );
}
