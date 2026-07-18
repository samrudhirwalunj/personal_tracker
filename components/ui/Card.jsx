export default function Card({ children, style, ...rest }) {
  return (
    <div className="card" style={{ padding: 16, ...style }} {...rest}>
      {children}
    </div>
  );
}
