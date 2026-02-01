import { useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "../components/common/InputField";
import PasswordInput from "../components/common/PasswordInput";
import PrimaryButton from "../components/common/PrimaryButton";
import AuthCard from "../components/common/AuthCard";

function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");

  const navigate = useNavigate();

  const handleRegister = () => {
    if (!name || !phone || !password) {
      alert("All fields required");
      return;
    }

    // Mock register success
    navigate("/otp");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <AuthCard title="Register">

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        >
          <option value="farmer">Farmer</option>
          <option value="buyer">Buyer</option>
        </select>

        <InputField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
        />

        <InputField
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
        />

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <PrimaryButton onClick={handleRegister}>
          Register
        </PrimaryButton>

      </AuthCard>

    </div>
  );
}

export default Register;
