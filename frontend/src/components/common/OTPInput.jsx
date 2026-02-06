function OTPInput({ value, onChange, inputStyle = {} }) {
  return (
    <div className="relative">
      <input
        type="text"
        maxLength="6"
        value={value}
        onChange={onChange}
        placeholder="------"
        className="w-full bg-white/50 border-2 border-green-100 rounded-2xl py-4 text-center text-2xl font-bold tracking-[0.5em] text-green-900 placeholder:text-green-200 focus:border-green-400 focus:bg-white/80 focus:outline-none transition-all duration-300 shadow-inner"
        style={inputStyle}
      />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-green-400/30 to-transparent rounded-b-2xl pointer-events-none" />
    </div>
  );
}

export default OTPInput;
