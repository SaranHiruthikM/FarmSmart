function OTPInput({ value, onChange }) {
  return (
    <input
      type="text"
      maxLength="6"
      value={value}
      onChange={onChange}
      placeholder="Enter OTP"
      className="w-full p-2 border rounded text-center tracking-widest"
    />
  );
}

export default OTPInput;
