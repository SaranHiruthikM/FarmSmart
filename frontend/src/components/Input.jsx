export default function Input({ label, ...props }) {
  return (
    <div className="input-block">
      <label className="input-label">{label}</label>
      <input className="input" {...props} />
    </div>
  );
}
