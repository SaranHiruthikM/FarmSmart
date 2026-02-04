import { useState } from "react";
import { useNavigate } from "react-router-dom";

import OTPInput from "../components/common/OTPInput";
import PrimaryButton from "../components/common/PrimaryButton";
import AuthCard from "../components/common/AuthCard";

function Otp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerify = () => {
    if (otp === "123456") {
      // Mock login success by saving a dummy user
      const mockUser = {
        id: "u123",
        name: "Vimal Sabari",
        role: "farmer",
        phone: "9876543210"
      };
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("token", "mock-jwt-token");

      navigate("/dashboard");
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <AuthCard title="OTP Verification">

        <OTPInput
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <div className="mt-4">
          <PrimaryButton onClick={handleVerify}>
            Verify OTP
          </PrimaryButton>
        </div>

      </AuthCard>

    </div>
  );
}

export default Otp;
