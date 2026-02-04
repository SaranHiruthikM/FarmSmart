function InputField({ label, type = "text", name, value, onChange, placeholder, required }) {
  return (
    <div className="mb-4">

      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="
          w-full px-3 py-2
          border border-gray-300
          rounded-lg
          focus:ring-2 focus:ring-primary
          focus:border-primary
          outline-none
          transition
        "
      />
    </div>
  );
}

export default InputField;
