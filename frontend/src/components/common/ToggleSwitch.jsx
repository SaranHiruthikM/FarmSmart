function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        w-12 h-6 rounded-full p-1
        transition
        ${checked ? "bg-primary" : "bg-gray-300"}
      `}
    >
      <div
        className={`
          w-4 h-4 bg-white rounded-full
          shadow-md transition
          ${checked ? "translate-x-6" : ""}
        `}
      />
    </button>
  );
}

export default ToggleSwitch;
