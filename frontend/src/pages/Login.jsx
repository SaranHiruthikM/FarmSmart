import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import users from "../mock/users.json";

import InputField from "../components/common/InputField";
import PasswordInput from "../components/common/PasswordInput";
import PrimaryButton from "../components/common/PrimaryButton";
import AuthCard from "../components/common/AuthCard";
import LanguageSelector from "../components/common/LanguageSelector";

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    if (!phone || !password) {
      setError("All fields are required");
      return;
    }

    const user = users.find(
      (u) =>
        u.phone === phone &&
        u.password === password &&
        u.role === role
    );

    if (!user) {
      setError("Invalid credentials");
      return;
    }

    navigate("/otp");
  };

  return (
    <div className="
  min-h-screen
  flex items-center justify-center
  bg-gradient-to-br
  from-green-50
  via-white
  to-green-100
  px-4
">


      <AuthCard title="Login">

        <LanguageSelector />

        {error && (
  <div className="
    bg-red-50 text-secondary
    border border-red-200
    text-sm
    px-3 py-2
    rounded-lg
    mb-3
  ">
    {error}
  </div>
)}


        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        >
          <option value="farmer">Farmer</option>
          <option value="buyer">Buyer</option>
        </select>

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

        <PrimaryButton onClick={handleLogin}>
          Login
        </PrimaryButton>

        <p className="text-sm text-center mt-3">
          No account?{" "}
          <Link to="/register" className="text-primary">
            Register
          </Link>
        </p>

      </AuthCard>

    </div>
  );
}

export default Login;
