function InputField({ label, type = "text", name, value, onChange, placeholder, required, className = "" }) {
  return (
    <div className={`mb-4 w-full ${className}`}>
      {label && (
        <label className="block text-sm font-bold text-nature-800 mb-1.5 ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="
          w-full px-4 py-3
          bg-white/60 backdrop-blur-sm
          border border-nature-200
          text-nature-900 placeholder:text-nature-400
          rounded-xl
          focus:ring-2 focus:ring-nature-400/50
          focus:border-nature-400
          focus:bg-white
          outline-none
          transition-all duration-200
          shadow-sm
        "
      />
    </div>
  );
}

export default InputField;
