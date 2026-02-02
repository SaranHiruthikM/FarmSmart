function FontSizeSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full p-2 border border-gray-300
        rounded-lg text-sm
        focus:ring-2 focus:ring-primary
      "
    >
      <option value="small">Small</option>
      <option value="medium">Medium</option>
      <option value="large">Large</option>
    </select>
  );
}

export default FontSizeSelector;
