import { useState } from "react";

function PasswordInput({ value, onChange }) {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-3">
      <label className="block text-sm mb-1">Password</label>

      <div className="flex border rounded">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="flex-1 p-2 outline-none"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="px-3 text-sm text-neutral"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;
