export default function Field({ label, children }) {
  return (
    <div>
      {label && <label className="field-label">{label}</label>}
      {children}
    </div>
  );
}
